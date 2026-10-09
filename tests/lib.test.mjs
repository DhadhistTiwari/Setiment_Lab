import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../src/lib/csv.js';
import { computeMetrics } from '../src/lib/metrics.js';
import { demoPredict } from '../src/lib/demo.js';

test('CSV handles quoted commas and labels', () => {
  const rows = parseCsv('text,label\n"Hello, I love this",positive\n"Meeting tomorrow",neutral\n');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].text, 'Hello, I love this');
});
test('CSV requires text and valid labels', () => {
  assert.throws(() => parseCsv('bad,label\nx,positive'));
  assert.throws(() => parseCsv('text,label\nfoo,unknown'));
});
test('metrics summarize predictions correctly', () => {
  const rows = [{label:'positive'},{label:'negative'},{label:'neutral'}];
  const predictions = [{label:'positive'},{label:'neutral'},{label:'neutral'}];
  const metrics = computeMetrics(rows,predictions);
  assert.equal(metrics.count,3);
  assert.equal(metrics.accuracy,2/3);
});
test('demo returns a complete response shape', () => {
  const prediction = demoPredict('I love this nice design');
  assert.ok(prediction.preprocessing);
  assert.equal(Object.keys(prediction.probabilities).length,3);
});
