"""TF-IDF + logistic regression trained on bundled educational examples."""
import csv
from pathlib import Path
from functools import lru_cache
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from preprocess import preprocess, vector_text

BASE = Path(__file__).resolve().parent
LABELS = ['positive', 'neutral', 'negative']


def load_labeled(name):
    with (BASE / 'data' / name).open(encoding='utf-8', newline='') as file:
        return list(csv.DictReader(file))


@lru_cache(maxsize=1)
def get_model():
    samples = load_labeled('training.csv')
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
    matrix = vectorizer.fit_transform([vector_text(row['text']) for row in samples])
    classifier = LogisticRegression(max_iter=600, random_state=17)
    classifier.fit(matrix, [row['label'] for row in samples])
    return vectorizer, classifier


def predict(text):
    processed = preprocess(text)
    vectorizer, classifier = get_model()
    features_matrix = vectorizer.transform([' '.join(processed['stems'])])
    count = int(features_matrix.getnnz())
    if count:
        probs = classifier.predict_proba(features_matrix)[0]
        by_label = {str(label): float(prob) for label, prob in zip(classifier.classes_, probs)}
    else:
        # No input vocabulary matches: explicitly avoid a confident label.
        by_label = {label: 1/3 for label in LABELS}
    label = max(LABELS, key=lambda key: by_label[key]) if count else 'neutral'
    names = vectorizer.get_feature_names_out()
    indices = features_matrix.indices
    values = features_matrix.data
    top = sorted(zip(indices, values), key=lambda pair: float(pair[1]), reverse=True)[:8]
    terms = [{'term': str(names[index]), 'weight': round(float(weight), 6)} for index, weight in top]
    vocabulary = vectorizer.vocabulary_
    recognized = sum(1 for stem in processed['stems'] if stem in vocabulary)
    coverage = recognized / len(processed['stems']) if processed['stems'] else 0.0
    warnings = []
    if not count:
        warnings.append('No terms match the educational training vocabulary. Prediction has insufficient signal.')
    elif coverage < 0.25:
        warnings.append('Low vocabulary coverage; predictions may be unreliable for unfamiliar text.')
    return {
        'text': text, 'label': label, 'score': by_label[label],
        'probabilities': by_label, 'preprocessing': processed,
        'features': terms, 'feature_count': count, 'coverage': round(coverage, 6),
        'warnings': warnings,
    }


def metrics(actual, predicted):
    matrix = [[0 for _ in LABELS] for _ in LABELS]
    for true, guess in zip(actual, predicted):
        matrix[LABELS.index(true)][LABELS.index(guess)] += 1
    per_class = []
    for i, label in enumerate(LABELS):
        tp = matrix[i][i]
        support = sum(matrix[i])
        predicted_total = sum(row[i] for row in matrix)
        precision = tp/predicted_total if predicted_total else 0.0
        recall = tp/support if support else 0.0
        f1 = 2*precision*recall/(precision+recall) if precision+recall else 0.0
        per_class.append({'label':label, 'support':support, 'precision':precision, 'recall':recall, 'f1':f1})
    count = len(actual)
    return {'count':count, 'classes':LABELS, 'matrix':matrix,
            'per_class':per_class,
            'accuracy': sum(matrix[i][i] for i in range(3))/count if count else 0.0,
            **{key:sum(row[key] for row in per_class)/3 for key in ('precision','recall','f1')}}


def heldout_evaluation():
    test = load_labeled('test.csv')
    predictions = [predict(row['text'])['label'] for row in test]
    return {'metrics': metrics([row['label'] for row in test],predictions),
            'rows': [{'text':row['text'],'label':row['label'],'prediction':pred} for row,pred in zip(test,predictions)],
            'train_count': len(load_labeled('training.csv')), 'test_count':len(test),
            'notice':'Small hand-authored educational examples; not a real-world accuracy benchmark.'}
