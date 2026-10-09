"""Transparent, lightweight English preprocessing for the educational model."""
import re

STOPWORDS = frozenset('''
a an the and or but if because as at by for from in into of on onto to with without
is are am was were be been being it its this that these those he she we they their
my our your his her me us them you i a about after before very can could may
might will would should has have had do does did there here so just then than
'''.split())
# Intentionally keep negations such as not, never and no.


def stem(word: str) -> str:
    """Simple demonstrative suffix reduction; not a linguistic stemmer."""
    if len(word) > 6 and word.endswith('ingly'):
        return word[:-5]
    if len(word) > 5 and word.endswith('ing'):
        return word[:-3]
    if len(word) > 5 and word.endswith('edly'):
        return word[:-4]
    if len(word) > 4 and word.endswith('ed'):
        return word[:-2]
    if len(word) > 4 and word.endswith('ly'):
        return word[:-2]
    if len(word) > 4 and word.endswith('ies'):
        return word[:-3] + 'y'
    if len(word) > 4 and word.endswith('s') and not word.endswith('ss'):
        return word[:-1]
    return word


def preprocess(text: str) -> dict:
    no_urls = re.sub(r'https?://\S+|www\.\S+', ' ', text.lower())
    cleaned = ' '.join(re.findall(r"[a-z]+", no_urls))
    tokens = cleaned.split() if cleaned else []
    removed = [token for token in tokens if token in STOPWORDS]
    filtered = [token for token in tokens if token not in STOPWORDS]
    stems = [stem(token) for token in filtered]
    return {'cleaned': cleaned, 'tokens': tokens, 'removed': removed, 'filtered': filtered, 'stems': stems}


def vector_text(text: str) -> str:
    return ' '.join(preprocess(text)['stems'])
