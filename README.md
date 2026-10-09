# SentimentLab v2

A structured **React JSX + Vite + FastAPI (Python)** sentiment-analysis application. Includes a clean, responsive dark-mode interface (light mode switch), text classification, image scene-tone estimation (optional CLIP), CSV batch analysis, model evaluation, and detailed preprocessing/TF-IDF features.

> **About the model:** The original private Python backend / model weights from the older project were not available. This ZIP includes a **new self-contained educational TF-IDF + logistic regression model** trained on a small bundled, hand-authored dataset. Predictions and test accuracy are not production-validated. This is a working replacement, *not* the original trained model. The image endpoint uses **real optional pretrained CLIP** and downloads model weights on first run; no weights are bundled.

## Requirements

- Node.js 18+ and npm
- Python 3.10+
- Internet connection for npm installation; for image analysis, also a first-run pretrained CLIP download

## Start the Python API (Terminal 1)

In **VS Code**, open the extracted `SentimentLab_v2_Full_Project` directory. Run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

If Windows blocks PowerShell activation, run `.venv\Scripts\python.exe -m pip install -r requirements.txt` and `.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000` without activating the environment.

Confirm API: <http://127.0.0.1:8000/api/health> | Interactive backend docs: <http://127.0.0.1:8000/docs>.

## Start React (Terminal 2)

From the **project root** (not `backend`):

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open <http://127.0.0.1:5173/>. `VITE_API_URL` points to `http://127.0.0.1:8000` by default in `.env.example`. Theme defaults to **dark**, with a persistent light-mode toggle.

### Optional CLIP image analysis

In the backend environment run:

```powershell
pip install -r requirements-image.txt
```

Then use **Image Analysis**. The first request downloads `openai/clip-vit-base-patch32` via Hugging Face, which requires internet and several hundred MB of storage. CLIP compares scene captions, **not** facial emotion or calibrated sentiment. Without the optional install, text/CSV/evaluation still work and image requests show an explanatory error.

### Optional frontend-only demo mode

In `.env`, set `VITE_DEMO_MODE=true` and restart Vite. This uses a **clearly labeled word-list demonstration**, *not* the trained Python model. Image predictions aren't faked in demo mode.

## Sections

| Section | Feature |
|---|---|
| Text Analysis | 5,000-character text box, example reviews, Python prediction, probability bars, warning, preprocessing, TF-IDF weights |
| Dataset Analysis | CSV upload up to 1 MB and 200 rows, prediction table, export, inspect an item, evaluate labels |
| Model Evaluation | Bundled held-out educational test set, confusion matrix, macro precision/recall/F1, per-class breakdown, labeled CSV evaluation |
| Image Analysis | JPG/PNG/WebP upload (max 5 MB), preview, optional CLIP scene-tone analysis |
| Appearance | Default dark theme, light-mode switch, responsive navigation and cards |

## Structure

```
SentimentLab_v2_Full_Project/
├── backend/
│   ├── main.py                # FastAPI REST endpoints
│   ├── nlp.py                 # TF-IDF + logistic regression
│   ├── preprocess.py          # Tokenization, stopwords, suffix reduction
│   ├── vision.py              # Optional CLIP integration
│   ├── data/                  # Bundled train & separate test CSV
│   ├── tests/                 # Backend API tests
│   ├── requirements.txt
│   └── requirements-image.txt
├── public/sample.csv
├── src/
│   ├── components/            # Separate JSX views and UI components
│   ├── lib/                   # API client, CSV, demo, metrics
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css             # Dark/light CSS with responsive breakpoints
├── tests/                     # Frontend utility tests
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

## API routes

- `GET /api/health`
- `POST /api/analyze` — `{ "items": [{ "text": "Amazing service" }] }`
- `POST /api/evaluate` — `{ "items": [{ "text": "Amazing service", "label": "positive" }] }`
- `GET /api/model/evaluation` — educational held-out metrics and rows
- `POST /api/image/analyze` — `multipart/form-data` with `file` field; optional CLIP dependencies

## Tests

```powershell
npm test
cd backend
python -m pytest -q
```

Tests require `pytest` and `httpx`; they are development-only dependencies, so install them with `pip install pytest httpx` if needed.

## Notes

- This project is local and is **not deployed publicly**.
- No hardcoded API tokens or secrets.
- `node_modules`, virtualenvs and heavyweight pretrained weights are deliberately excluded from the ZIP.
- CSV rows need a `text` header. The optional `label` header accepts `positive`, `neutral`, and `negative`.
- English language only; model quality is limited by the tiny educational corpus, especially sarcasm and mixed-sentiment inputs.
- If you want the **exact predictions** from your original Sentiment Lab, replace the new `backend` model with your original training files or model and keep its API shape.
