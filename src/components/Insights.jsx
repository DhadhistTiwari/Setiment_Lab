import { Braces, Hash, ListChecks, ScanText } from 'lucide-react';
export default function Insights({ result }) {
  const tokens = result?.preprocessing?.stems || result?.preprocessing?.filtered || [];
  const keywords = result?.features?.slice(0, 6).map(x => x.term) || [];
  return <section className="insights-section">
    <div className="section-title"><div><h2>Text insights</h2><p>A closer look at what the model processed.</p></div></div>
    <div className="insight-grid">
      <article className="surface-card insight-card"><div className="insight-title"><ScanText size={17}/><h3>Cleaned text</h3></div><p className="cleaned-preview">{result?.preprocessing?.cleaned || 'Cleaned text appears after analysis.'}</p></article>
      <article className="surface-card insight-card"><div className="insight-title"><Hash size={17}/><h3>Top features</h3></div><div className="chip-group">{keywords.length ? keywords.map((word,i) => <span className="chip" key={`${word}-${i}`}>{word}</span>) : <span className="muted">Key words and phrases will appear here.</span>}</div></article>
      <article className="surface-card insight-card"><div className="insight-title"><Braces size={17}/><h3>Tokens</h3></div><div className="chip-group">{tokens.length ? tokens.slice(0, 10).map((word,i) => <span className="chip" key={`${word}-${i}`}>{word}</span>) : <span className="muted">Tokenized text will appear here.</span>}</div></article>
      <article className="surface-card insight-card"><div className="insight-title"><ListChecks size={17}/><h3>Processing summary</h3></div><div className="kv-line"><span>Tokens</span><strong>{result?.preprocessing?.tokens?.length ?? '—'}</strong></div><div className="kv-line"><span>Removed stop words</span><strong>{result?.preprocessing?.removed?.length ?? '—'}</strong></div><div className="kv-line"><span>Model features</span><strong>{result?.feature_count ?? '—'}</strong></div></article>
    </div>
  </section>;
}
