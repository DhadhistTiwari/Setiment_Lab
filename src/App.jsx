import React, { useEffect, useState } from 'react';
import Shell from './components/Shell.jsx';
import TextAnalysis from './components/TextAnalysis.jsx';
import Dataset from './components/Dataset.jsx';
import ImageAnalysis from './components/ImageAnalysis.jsx';
import Evaluation from './components/Evaluation.jsx';
import { DEMO_MODE, analyzeTexts, analyzeImage, getHeldoutEvaluation, checkBackend } from './lib/api.js';
import { computeMetrics } from './lib/metrics.js';

export default function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('sentimentlab-theme') === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  });
  const [page, setPage] = useState('text');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [lastText, setLastText] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [rows, setRows] = useState([]);
  const [filename, setFilename] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [heldout, setHeldout] = useState(null);
  const [heldoutError, setHeldoutError] = useState('');
  const [imageResult, setImageResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [apiMode, setApiMode] = useState(DEMO_MODE ? 'UI demo' : 'Checking API…');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('sentimentlab-theme', theme); } catch { /* Storage may be blocked */ }
  }, [theme]);

  useEffect(() => {
    let active = true;
    checkBackend().then(status => { if (active) setApiMode(status); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (page !== 'evaluation' || heldout || DEMO_MODE) return;
    let active = true;
    getHeldoutEvaluation()
      .then(data => { if (active) { setHeldout(data); setHeldoutError(''); } })
      .catch(() => { if (active) setHeldoutError('Start the Python backend to view the bundled held-out test results.'); });
    return () => { active = false; };
  }, [page, heldout]);

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark');
  const navigate = next => { setPage(next); setError(''); setNotice(''); };

  async function runAnalysis(items, evaluation = false) {
    if (busy) return null;
    setBusy(true); setError(''); setNotice('');
    try { return await analyzeTexts(items, evaluation); }
    catch (exception) { setError(exception.message || 'Analysis failed.'); return null; }
    finally { setBusy(false); }
  }

  async function analyzeText() {
    if (!text.trim()) return;
    const response = await runAnalysis([{ text }]);
    if (response) {
      setResult(response.results[0]); setLastText(text); setSelectedRow(null);
      setNotice('Text analyzed successfully.');
    }
  }

  async function analyzeDataset(evaluation = false) {
    if (!rows.length) return;
    if (evaluation && !rows.every(row => row.label)) {
      setError('Every row needs a valid label before evaluation.'); return;
    }
    const response = await runAnalysis(rows, evaluation);
    if (!response) return;
    setPredictions(response.results); setSelectedRow(null);
    if (evaluation) {
      setMetrics(response.metrics || computeMetrics(rows, response.results));
      setPage('evaluation'); setNotice('Dataset evaluation complete.');
    } else setNotice(`${response.results.length} texts analyzed.`);
  }

  function inspectRow(index) {
    setSelectedRow(index); setResult(predictions[index]);
    setText(rows[index]?.text || ''); setLastText(rows[index]?.text || '');
    setShowDetails(true); setPage('text');
  }

  async function runImage(file) {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try { setImageResult(await analyzeImage(file)); setNotice('Image analysis complete.'); }
    catch (exception) { setError(exception.message || 'Image analysis failed.'); }
    finally { setBusy(false); }
  }

  return <Shell page={page} setPage={navigate} theme={theme} toggleTheme={toggleTheme} apiMode={apiMode}>
    {error && <div className="alert error" role="alert">{error}<button type="button" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
    {notice && <div className="alert success" role="status">{notice}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div>}
    {DEMO_MODE && <div className="demo-banner">UI demo mode uses a small word list, not trained machine-learning inference. Set VITE_DEMO_MODE=false to use Python.</div>}
    {page === 'text' && <TextAnalysis text={text} setText={setText} result={result} stale={!!result && text !== lastText} busy={busy} onAnalyze={analyzeText} showDetails={showDetails} setShowDetails={setShowDetails} onOpenDataset={() => navigate('dataset')} isDemo={DEMO_MODE}/>}
    {page === 'dataset' && <Dataset rows={rows} setRows={newRows => { setRows(newRows); setPredictions([]); setMetrics(null); }} filename={filename} setFilename={setFilename} predictions={predictions} onAnalyze={() => analyzeDataset(false)} onEvaluate={() => analyzeDataset(true)} busy={busy} onInspect={inspectRow} currentRow={selectedRow} isDemo={DEMO_MODE}/>}
    {page === 'image' && <ImageAnalysis busy={busy} result={imageResult} onAnalyze={runImage} clearResult={() => setImageResult(null)} isDemo={DEMO_MODE}/>}
    {page === 'evaluation' && <Evaluation metrics={metrics} heldout={heldout} heldoutError={heldoutError} isDemo={DEMO_MODE} openDataset={() => navigate('dataset')}/>}
    <footer className="app-footer">SentimentLab · Educational sentiment analysis workspace <span>React JSX · Vite · Python FastAPI</span></footer>
  </Shell>;
}
