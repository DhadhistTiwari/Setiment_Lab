import React, { useState } from 'react';
import { BarChart3, Database, Info } from 'lucide-react';

const cards = [['accuracy','Accuracy','Correct predictions'],['precision','Precision','Macro average'],['recall','Recall','Macro average'],['f1','F1 score','Macro average']];

export default function Evaluation({ metrics, heldout, heldoutError, isDemo, openDataset }) {
  const [tab, setTab] = useState('test');
  const data = tab === 'test' ? heldout?.metrics : metrics;
  const format = value => typeof value === 'number' ? (value * 100).toFixed(1) + '%' : '—';
  return <>
    <div className="page-heading"><div><span className="eyebrow">MODEL PERFORMANCE</span><h1>Model evaluation</h1><p>Review held-out test results or evaluate your own labeled CSV.</p></div><span className="model-chip">Macro-averaged metrics</span></div>
    <div className="evaluation-tabs" role="group" aria-label="Evaluation source">
      <button type="button" className={`btn ${tab === 'test' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('test')}>Bundled test set{heldout ? ` · ${heldout.test_count} texts` : ''}</button>
      <button type="button" className={`btn ${tab === 'uploaded' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('uploaded')}>Your CSV{metrics ? ` · ${metrics.count} texts` : ''}</button>
    </div>
    <div className="metric-grid">{cards.map(([key, label, description]) => <section className="surface-card metric-card" key={key}><span>{label}</span><strong>{format(data?.[key])}</strong><small>{description}</small></section>)}</div>
    {!data ? <section className="surface-card eval-empty"><BarChart3 size={30}/><h2>{tab === 'test' ? 'Bundled test results unavailable' : 'No evaluated dataset yet'}</h2><p>{tab === 'test' ? (isDemo ? 'Bundled test evaluation requires the Python backend.' : heldoutError || 'Loading held-out test results…') : 'Upload a CSV with text and label columns, then select Evaluate labels.'}</p>{tab === 'uploaded' && <button className="btn btn-primary" onClick={openDataset}><Database size={17}/> Upload labeled CSV</button>}</section> : <>
      <div className="eval-grid"><section className="surface-card"><div className="card-heading"><div><span className="heading-icon"><BarChart3 size={18}/></span><h2>Confusion matrix</h2></div></div><p className="help-text">Rows = actual label · Columns = predicted label</p><div className="table-scroll"><table className="data-table matrix-table"><thead><tr><th>Actual / Predicted</th>{data.classes.map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{data.classes.map((label, i) => <tr key={label}><th>{label}</th>{data.matrix[i].map((value, j) => <td key={j} className={i === j ? 'matrix-match' : ''}>{value}</td>)}</tr>)}</tbody></table></div></section>
      <section className="surface-card"><div className="card-heading"><div><span className="heading-icon"><BarChart3 size={18}/></span><h2>Per-class performance</h2></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1</th><th>Count</th></tr></thead><tbody>{data.per_class.map(row => <tr key={row.label}><td><span className={`pill ${row.label}`}>{row.label}</span></td><td>{format(row.precision)}</td><td>{format(row.recall)}</td><td>{format(row.f1)}</td><td>{row.support}</td></tr>)}</tbody></table></div></section></div>
      {tab === 'test' && <details className="surface-card evaluation-test-rows"><summary>View test examples and predictions</summary><div className="table-scroll"><table className="data-table"><thead><tr><th>Text</th><th>Actual</th><th>Predicted</th></tr></thead><tbody>{heldout.rows.map((row, i) => <tr key={i}><td>{row.text}</td><td>{row.label}</td><td>{row.prediction}</td></tr>)}</tbody></table></div></details>}
    </>}
    <p className="evaluation-note"><Info size={16}/>{tab === 'test' ? 'Held-out results are based on a small, hand-authored educational dataset and are not real-world accuracy claims.' : isDemo ? 'UI-demo predictions are word-based examples, not trained-model performance.' : 'CSV evaluation is only as representative as your labels and data.'}</p>
  </>;
}
