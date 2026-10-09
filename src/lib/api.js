import { demoPredict } from './demo.js';
import { computeMetrics } from './metrics.js';

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

async function readJson(response) {
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) {
    const detail = typeof data.detail === 'string' ? data.detail :
      Array.isArray(data.detail) ? 'Check your input format.' : `HTTP ${response.status}`;
    throw new Error(detail);
  }
  return data;
}

export async function checkBackend() {
  if (DEMO_MODE) return 'UI demo';
  if (!API_BASE) return 'Not configured';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
      return response.ok ? 'Python API online' : 'Python API offline';
    } finally { clearTimeout(timeout); }
  } catch { return 'Python API offline'; }
}

export async function analyzeTexts(items, evaluation = false) {
  if (DEMO_MODE) {
    const results = items.map(item => demoPredict(item.text));
    return { results, metrics: evaluation ? computeMetrics(items, results) : null, demo: true };
  }
  if (!API_BASE) throw new Error('Set VITE_API_URL in .env to connect the Python backend.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_BASE}/api/${evaluation ? 'evaluate' : 'analyze'}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }), signal: controller.signal,
    });
    const data = await readJson(response);
    if (!Array.isArray(data.results)) throw new Error('Unexpected API response: no results array.');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Python service timed out after 30 seconds.');
    if (error instanceof TypeError) throw new Error(`Could not connect to Python at ${API_BASE}. Start the backend first.`);
    throw error;
  } finally { clearTimeout(timeout); }
}

export async function getHeldoutEvaluation() {
  if (DEMO_MODE || !API_BASE) return null;
  const response = await fetch(`${API_BASE}/api/model/evaluation`);
  return readJson(response);
}

export async function analyzeImage(file) {
  if (DEMO_MODE) throw new Error('Image inference is unavailable in UI demo mode. Run Python and install optional CLIP requirements.');
  if (!API_BASE) throw new Error('Set VITE_API_URL in .env to connect image analysis.');
  const path = import.meta.env.VITE_IMAGE_ANALYZE_PATH || '/api/image/analyze';
  const form = new FormData();
  form.append('file', file);
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { method: 'POST', body: form });
  } catch { throw new Error(`Could not reach image API at ${API_BASE}. Is Python running?`); }
  return readJson(response);
}
