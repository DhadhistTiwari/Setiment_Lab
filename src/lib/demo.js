// UI DEMO ONLY. This deliberately does not impersonate the user's trained model.
const positive = new Set('love lovely good great excellent amazing beautiful wonderful helpful easy smooth happy best fantastic perfect brilliant awesome satisfied enjoyable nice recommend'.split(' '));
const negative = new Set('hate bad terrible awful worst poor disappointing late broken horrible useless slow frustrating unhappy difficult unhelpful disappointing'.split(' '));
const stopWords = new Set('the a an is are was were it i you he she they our this that and or but to of for on with in how my your at by be been from as very just so'.split(' '));

export function demoPredict(text) {
  const clean = text.toLowerCase().replace(/https?:\/\/\S+/g, '').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = clean ? clean.split(' ') : [];
  const filtered = tokens.filter(word => !stopWords.has(word));
  const pos = filtered.filter(word => positive.has(word)).length;
  const neg = filtered.filter(word => negative.has(word)).length;
  const label = pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
  const emphasis = Math.min(0.86, Math.abs(pos - neg) * 0.16);
  const chosen = label === 'neutral' ? 0.56 : Math.min(0.94, 0.63 + emphasis);
  const remaining = (1 - chosen) / 2;
  const probabilities = label === 'neutral'
    ? { positive: 0.22, neutral: 0.56, negative: 0.22 }
    : { positive: remaining, neutral: remaining, negative: remaining, [label]: chosen };
  const words = filtered.filter((v, i) => filtered.indexOf(v) === i);
  return {
    text, label, score: probabilities[label], probabilities,
    preprocessing: { cleaned: clean, tokens, removed: tokens.filter(word => stopWords.has(word)), filtered, stems: filtered },
    features: words.slice(0, 8).map((term, i) => ({ term, weight: Math.max(0.08, 0.7 - i * 0.07) })),
    coverage: tokens.length ? Math.min(1, (pos + neg) / tokens.length) : 0,
    feature_count: pos + neg,
    warnings: ['Preview mode uses a basic word list. This is not a trained NLP prediction.'],
  };
}
