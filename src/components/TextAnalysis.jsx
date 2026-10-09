import React from 'react';
import { FileText, Sparkles, Trash2, Database } from 'lucide-react';
import ResultCard from './ResultCard.jsx';
import Insights from './Insights.jsx';

const examples = [
  { label:'Positive review', text:'I love how easy this app is to use. The design is beautiful and everything works smoothly!' },
  { label:'Negative review', text:'The service was terrible. My delivery was late and the support team was unhelpful.' },
  { label:'Neutral review', text:'The meeting is scheduled for tomorrow. The report contains twenty pages.' },
];
export default function TextAnalysis({ text, setText, result, busy, stale, onAnalyze, showDetails, setShowDetails, onOpenDataset, isDemo }) {
  const detailsRef = React.useRef(null);
  const showAnalysis = () => { setShowDetails(true); requestAnimationFrame(() => detailsRef.current?.scrollIntoView({behavior:'smooth',block:'start'})); };
  return <>
    <div className="page-heading"><div><span className="eyebrow">NATURAL LANGUAGE PROCESSING</span><h1>Text analysis</h1><p>Understand the sentiment behind a message, review, or comment.</p></div><span className="model-chip">TF-IDF + Logistic Regression</span></div>
    <div className="main-grid">
      <section className="surface-card input-card"><div className="card-heading"><div><span className="heading-icon"><FileText size={18}/></span><h2>Enter your text</h2></div><span className="mini-tag">INPUT</span></div>
        <label htmlFor="sentiment-text">Text to analyze</label>
        <textarea id="sentiment-text" value={text} maxLength={5000} placeholder="Paste or type your text here…" onChange={e=>setText(e.target.value)} onKeyDown={e=>{if((e.metaKey || e.ctrlKey) && e.key==='Enter'){e.preventDefault();if(text.trim() && !busy) onAnalyze();}}}/>
        <div className="textarea-meta"><span>Ctrl + Enter to analyze</span><span>{text.length.toLocaleString()} / 5,000</span></div>
        <div className="example-head">Try an example</div>
        <div className="example-row">{examples.map(example=><button className="example-chip" key={example.label} onClick={()=>setText(example.text)}>{example.label}</button>)}</div>
        <div className="input-actions"><button className="btn btn-primary" disabled={!text.trim() || busy} onClick={onAnalyze}><Sparkles size={17}/>{busy?'Analyzing…':'Analyze sentiment'}</button><button className="btn btn-outline" onClick={()=>setText('')}><Trash2 size={16}/> Clear</button></div>
        <button className="small-link" onClick={onOpenDataset}><Database size={15}/> Need to analyze multiple texts? Open CSV analysis <span>→</span></button>
      </section>
      <ResultCard result={result} loading={busy} stale={stale} onDetails={showAnalysis} isDemo={isDemo}/>
    </div>
    <Insights result={result}/>
    <section className="details-section" ref={detailsRef}>
      <button className="details-toggle" onClick={()=>setShowDetails(!showDetails)} aria-expanded={showDetails}><span><ScanTextIcon/> Detailed analysis <small>Preprocessing · TF-IDF features</small></span><strong>{showDetails?'−':'+'}</strong></button>
      {showDetails && <div className="detail-grid">
        <article className="surface-card detail-card"><h3>Preprocessing</h3><label>Cleaned text</label><div className="mono-field">{result?.preprocessing?.cleaned || 'No analysis yet.'}</div><label>Removed stop words</label><div className="chip-group">{result?.preprocessing?.removed?.length ? result.preprocessing.removed.map((w,i)=><span className="chip" key={i}>{w}</span>) : <span className="muted">None yet</span>}</div><label>Stemmed tokens</label><div className="chip-group">{result?.preprocessing?.stems?.length ? result.preprocessing.stems.map((w,i)=><span className="chip" key={i}>{w}</span>) : <span className="muted">None yet</span>}</div></article>
        <article className="surface-card detail-card"><h3>Feature extraction</h3><p className="muted">Strongest TF-IDF terms returned by the model.</p>{result?.features?.length ? result.features.slice(0,8).map((f,i)=><div className="feature-row" key={`${f.term}-${i}`}><code>{f.term}</code><div className="meter"><span className="meter-fill feature-color" style={{width:`${result.features[0].weight?f.weight/result.features[0].weight*100:0}%`}}/></div><span>{f.weight.toFixed(3)}</span></div>) : <p className="muted empty-feature">Run analysis to view word weights.</p>}<div className="detail-note">Coverage: {result?.coverage == null?'—':`${(result.coverage*100).toFixed(1)}%`}</div></article>
      </div>}
    </section>
  </>;
}
function ScanTextIcon(){return <span className="details-bullet" aria-hidden="true">⌕</span>}
