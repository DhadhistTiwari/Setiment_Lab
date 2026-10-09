import { CheckCircle2, CircleHelp } from 'lucide-react';
const sentiments = [ ['positive','Positive','🙂'], ['neutral','Neutral','😐'], ['negative','Negative','🙁'] ];
export default function ResultCard({ result, loading, stale, onDetails, isDemo }) {
  const isInsufficient = result && !result.feature_count && !(result?.features?.length);
  return <section className="surface-card result-card" aria-live="polite">
    <div className="card-heading"><div><span className="heading-icon"><CheckCircle2 size={18}/></span><h2>Analysis result</h2></div><span className="mini-tag">OUTPUT</span></div>
    {!result ? <div className="empty-state"><div className="empty-emoji">🙂 <span>😐</span> 🙁</div><h3>{loading ? 'Analyzing your text…' : 'Ready when you are'}</h3><p>Your sentiment breakdown will appear here after you analyze text.</p></div> : <>
      <div className={`sentiment-summary ${result.label}`}>
        <span className="sentiment-emoji">{sentiments.find(s => s[0] === result.label)?.[2] || '😐'}</span>
        <div className="sentiment-name"><small>PREDICTED SENTIMENT</small><h3>{isInsufficient ? 'Limited signal' : sentiments.find(s => s[0] === result.label)?.[1] || result.label}</h3><p>{result.label === 'positive' ? 'The text suggests a positive tone.' : result.label === 'negative' ? 'The text suggests a negative tone.' : 'The text suggests a neutral tone.'}</p></div>
        <div className="score-value"><strong>{Number(result.score * 100).toFixed(1)}%</strong><small>Model score</small></div>
      </div>
      <div className="probabilities">
        {sentiments.map(([key, name, emoji]) => {
          const value = Math.max(0, Math.min(1, Number(result.probabilities?.[key] ?? 0)));
          return <div className="probability" key={key}><span className="prob-label"><span aria-hidden="true">{emoji}</span> {name}</span><div className="meter" role="progressbar" aria-label={`${name} model score`} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}><span className={`meter-fill ${key}`} style={{width:`${value*100}%`}}/></div><strong>{(value*100).toFixed(1)}%</strong></div>;
        })}
      </div>
      {stale && <p className="inline-warning"><CircleHelp size={14}/> Input changed; analyze again for updated results.</p>}
      {result.warnings?.map((warning, i) => <p className="inline-warning" key={i}><CircleHelp size={14}/>{warning}</p>)}
      <div className="result-footer"><span>{isDemo ? 'UI preview · not a trained model' : 'Scores are estimates, not calibrated confidence'}</span><button className="text-action" onClick={onDetails}>View details →</button></div>
    </>}
  </section>;
}
