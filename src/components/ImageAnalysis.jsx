import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, UploadCloud, X, CircleAlert, Sparkles } from 'lucide-react';
export default function ImageAnalysis({ onAnalyze, busy, result, clearResult, isDemo }) {
  const [file,setFile] = useState(null);
  const [preview,setPreview] = useState('');
  const [error,setError] = useState('');
  useEffect(()=>{
    if(!file) {setPreview('');return;}
    const url=URL.createObjectURL(file);setPreview(url);return ()=>URL.revokeObjectURL(url);
  },[file]);
  const acceptFile = f => {
    setError(''); if(!f) return;
    if(!['image/jpeg','image/png','image/webp'].includes(f.type)) {setError('Please select a JPG, PNG or WebP image.');return;}
    if(f.size>5*1024*1024){setError('Image must be smaller than 5 MB.');return;}
    setFile(f); clearResult?.();
  };
  return <>
    <div className="page-heading"><div><span className="eyebrow">VISION ANALYSIS</span><h1>Image analysis</h1><p>Estimate scene tone using an optional pretrained CLIP model.</p></div><span className="model-chip">CLIP · Image model</span></div>
    <div className="main-grid image-grid"><section className="surface-card"><div className="card-heading"><div><span className="heading-icon"><ImageIcon size={18}/></span><h2>Choose an image</h2></div></div>
      {!file ? <label className="image-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();acceptFile(e.dataTransfer.files[0]);}}><UploadCloud size={31}/><strong>Drop an image or browse files</strong><p>JPG, PNG or WebP · Max 5 MB</p><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>acceptFile(e.target.files?.[0])}/><span className="btn btn-outline">Choose image</span></label> : <div className="image-preview-wrap"><img className="image-preview" src={preview} alt="Selected image preview"/><button onClick={()=>{setFile(null); clearResult?.();}} className="remove-image" aria-label="Remove image"><X size={17}/></button><div className="image-fileline"><span>{file.name}</span><small>{(file.size/1024).toFixed(0)} KB</small></div></div>}
      {error && <p className="inline-error"><CircleAlert size={15}/>{error}</p>}
      <div className="input-actions"><button className="btn btn-primary" disabled={!file||busy} onClick={()=>onAnalyze(file)}><Sparkles size={16}/>{busy?'Analyzing…':'Analyze image'}</button></div>
      {isDemo && <p className="help-text">UI demo can preview files; actual CLIP requires the optional Python image dependencies and a first-run model download.</p>}
    </section><section className="surface-card result-card"><div className="card-heading"><div><span className="heading-icon"><ImageIcon size={18}/></span><h2>Image result</h2></div><span className="mini-tag">OUTPUT</span></div>
      {!result ? <div className="empty-state"><ImageIcon size={34}/><h3>No image analyzed yet</h3><p>Upload an image and connect the Python image API for a prediction.</p></div> : <div className="image-output"><span className="sentiment-emoji">{result.label==='positive'?'🙂':result.label==='negative'?'🙁':'😐'}</span><span className="eyebrow">PREDICTED SCENE TONE</span><h3>{result.label||'Result'}</h3><strong>{result.score != null ? (result.score*100).toFixed(1)+'%' : '—'}</strong><p>{result.description || 'Scene-level CLIP analysis returned by Python.'}</p>{result.matches?.length > 0 && <div className="image-matches-list"><strong>Closest scene descriptions</strong>{result.matches.map((match, index) => <p key={index}>{match.caption}</p>)}</div>}</div>}
    </section></div>
  </>;
}
