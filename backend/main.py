"""SentimentLab educational API. Run: uvicorn main:app --reload --port 8000"""
import os
from io import BytesIO
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from nlp import predict, metrics, heldout_evaluation, get_model

app = FastAPI(title='SentimentLab API', version='2.0.0', description='Educational text and optional CLIP image analysis')
origins = [part.strip() for part in os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',') if part.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=['GET','POST'], allow_headers=['Content-Type'])

class Item(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    label: Literal['positive','neutral','negative'] | None = None

class AnalyzePayload(BaseModel):
    items: list[Item] = Field(min_length=1, max_length=200)


def validated_items(payload: AnalyzePayload):
    for index, item in enumerate(payload.items, start=1):
        if not item.text.strip():
            raise HTTPException(status_code=422, detail=f'Item {index} must contain non-empty text.')
    return payload.items

@app.get('/api/health')
def health():
    return {'status':'ok','model':'TF-IDF + Logistic Regression','training':'bundled educational examples','image_model':'optional CLIP download'}

@app.post('/api/analyze')
def analyze(payload: AnalyzePayload):
    return {'results':[predict(item.text) for item in validated_items(payload)]}

@app.post('/api/evaluate')
def evaluate(payload: AnalyzePayload):
    items = validated_items(payload)
    if any(item.label is None for item in items):
        raise HTTPException(status_code=422, detail='Every row must contain a label to evaluate.')
    results = [predict(item.text) for item in items]
    return {'results': results, 'metrics': metrics([item.label for item in items],[row['label'] for row in results])}

@app.get('/api/model/evaluation')
def model_evaluation():
    return heldout_evaluation()

@app.post('/api/image/analyze')
async def image_analyze(file: UploadFile = File(...)):
    if file.content_type not in {'image/jpeg','image/png','image/webp'}:
        raise HTTPException(status_code=415, detail='Use a JPEG, PNG, or WebP file.')
    # Read at most max+1 bytes to protect memory from oversized uploads.
    content = await file.read(5*1024*1024+1)
    if len(content) > 5*1024*1024:
        raise HTTPException(status_code=413, detail='Image is too large (5 MB maximum).')
    try:
        from vision import classify_image
        return classify_image(content)
    except ImportError as exc:
        raise HTTPException(status_code=503, detail='CLIP dependencies are missing. Install backend/requirements-image.txt.') from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except (OSError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail='CLIP model not available. Install the optional image requirements and allow model download on first use.') from exc
