import React, { useRef, useState } from 'react';
import { Database, Download, FileUp, CircleAlert, Sparkles, BarChart3 } from 'lucide-react';
import { parseCsv, downloadCsv } from '../lib/csv.js';

const labels = ['positive','neutral','negative'];
export default function Dataset({ rows, setRows, filename, setFilename, predictions, onAnalyze, onEvaluate, busy, onInspect, currentRow, isDemo }) {
  const inputRef = useRef(null);
  const [error,setError] = useState('');
  const upload = async file => {
    if(!file) return;
    try {
      if(file.size>1_000_000) throw new Error('CSV must be under 1 MB.');
      const parsed = parseCsv(await file.text());
      setRows(parsed); setFilename(file.name); setError('');
    } catch(e) {setError(e.message);setRows([]);setFilename('');}
    if(inputRef.current) inputRef.current.value='';
  };
  const canEval = !!rows.length && rows.every(row=>row.label);
  const exportData = () => downloadCsv(predictions.map((p,i)=>({text:rows[i]?.text,predicted:p.label,score:(p.score*100).toFixed(1)+'%',actual:rows[i]?.label||''})));
  return <>
    <div className="page-heading"><div><span className="eyebrow">BATCH ANALYSIS</span><h1>Dataset analysis</h1><p>Upload a CSV to classify up to 200 texts and compare predictions.</p></div><span className="model-chip">CSV · 1 MB maximum</span></div>
    <div className="dataset-top-grid"><section className="surface-card dataset-upload"><div className="card-heading"><div><span className="heading-icon"><FileUp size={18}/></span><h2>Upload dataset</h2></div></div>
      <input ref={inputRef} type="file" accept=".csv,text/csv" id="dataset-file" className="visually-hidden" onChange={e=>upload(e.target.files?.[0])}/>
      <div className="drop-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();upload(e.dataTransfer.files[0]);}}><FileUp size={25}/><strong>{filename||'Drop CSV file here'}</strong><p>{rows.length ? `${rows.length} rows ready for analysis` : 'Or select a CSV containing a text column'}</p><button className="btn btn-outline" onClick={()=>inputRef.current?.click()}>Choose CSV</button></div>
      {error && <p className="inline-error"><CircleAlert size={15}/>{error}</p>}
      <div className="input-actions"><button className="btn btn-primary" onClick={onAnalyze} disabled={!rows.length||busy}><Sparkles size={16}/>{busy?'Analyzing…':`Analyze ${rows.length||''} texts`}</button><button className="btn btn-outline" onClick={onEvaluate} disabled={!canEval||busy}><BarChart3 size={16}/> Evaluate labels</button></div>
      <p className="help-text">A <code>label</code> column with positive, neutral, or negative enables evaluation.</p>
    </section><section className="surface-card dataset-format"><div className="card-heading"><div><span className="heading-icon"><Database size={18}/></span><h2>Expected format</h2></div></div><table className="data-table"><thead><tr><th>text</th><th>label (optional)</th></tr></thead><tbody><tr><td>Great service</td><td><span className="pill positive">positive</span></td></tr><tr><td>Not happy</td><td><span className="pill negative">negative</span></td></tr><tr><td>Meeting at noon</td><td><span className="pill neutral">neutral</span></td></tr></tbody></table><p className="help-text">Quoted CSV fields are supported. Evaluation requires every row to have a label.</p></section></div>
    <section className="surface-card dataset-results"><div className="card-heading"><div><span className="heading-icon"><Database size={18}/></span><h2>Analysis results</h2><span className="count-pill">{predictions.length}</span></div><button className="btn btn-outline btn-small" onClick={exportData} disabled={!predictions.length}><Download size={15}/> Export CSV</button></div>
      {predictions.length ? <><div className="dataset-chips">{labels.map(label=><span className={`pill ${label}`} key={label}>{predictions.filter(x=>x.label===label).length} {label}</span>)}</div><div className="table-scroll"><table className="data-table"><thead><tr><th>#</th><th>Text preview</th><th>Prediction</th><th>Score</th><th>Actual</th><th></th></tr></thead><tbody>{predictions.map((p,i)=><tr key={i} className={currentRow===i?'selected-row':''}><td>{i+1}</td><td className="table-text">{rows[i]?.text}</td><td><span className={`pill ${p.label}`}>{p.label}</span></td><td>{(p.score*100).toFixed(1)}%</td><td>{rows[i]?.label||'—'}</td><td><button className="text-action" onClick={()=>onInspect(i)}>Inspect →</button></td></tr>)}</tbody></table></div></> : <div className="table-empty">Upload a CSV and run analysis to see the rows here.</div>}
      {isDemo && <p className="help-text">UI demo predictions are illustrative and are not from your trained model.</p>}
    </section>
  </>;
}
