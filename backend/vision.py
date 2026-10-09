"""Optional genuine CLIP similarity classifier (not an emotion detector)."""
from functools import lru_cache
from io import BytesIO
from PIL import Image, ImageOps, UnidentifiedImageError

CAPTIONS = {
    'positive': [
        'a joyful and cheerful scene with people smiling',
        'a peaceful and beautiful scene with a pleasant mood',
        'a bright celebratory scene full of happiness',
    ],
    'neutral': [
        'an ordinary everyday scene with a neutral mood',
        'a plain documentary photograph with an uneventful tone',
        'an object or setting shown without any obvious emotional mood',
    ],
    'negative': [
        'a sad and gloomy scene with an unhappy mood',
        'a tense upsetting scene with a distressed mood',
        'a bleak scene that looks unpleasant or sorrowful',
    ],
}
ALL_CAPTIONS = [(label, caption) for label, captions in CAPTIONS.items() for caption in captions]


@lru_cache(maxsize=1)
def load_clip():
    # Optional dependency: first use downloads pretrained CLIP weights.
    from transformers import CLIPModel, CLIPProcessor
    model_id = 'openai/clip-vit-base-patch32'
    processor = CLIPProcessor.from_pretrained(model_id)
    model = CLIPModel.from_pretrained(model_id)
    model.eval()
    return processor, model


def classify_image(image_bytes: bytes):
    import torch
    try:
        image = ImageOps.exif_transpose(Image.open(BytesIO(image_bytes))).convert('RGB')
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError('Uploaded file is not a readable image.') from exc
    processor, model = load_clip()
    descriptions = [caption for _,caption in ALL_CAPTIONS]
    inputs = processor(text=descriptions, images=image, return_tensors='pt', padding=True, truncation=True)
    with torch.inference_mode():
        outputs = model(**inputs)
        similarities = outputs.logits_per_image[0]
        # Similarity scores aggregated by category; not probabilities calibrated for sentiment.
        sums = torch.stack([similarities[[i for i,(name,_) in enumerate(ALL_CAPTIONS) if name==label]].mean() for label in CAPTIONS])
        likelihoods = torch.softmax(sums, dim=0).tolist()
    probabilities = {label: float(value) for label, value in zip(CAPTIONS, likelihoods)}
    label = max(probabilities, key=probabilities.get)
    top_matches = sorted([{'label':lab, 'caption':caption, 'similarity':float(sim)} for (lab,caption),sim in zip(ALL_CAPTIONS,similarities.tolist())],key=lambda item:item['similarity'],reverse=True)[:3]
    return {'label':label, 'score':probabilities[label], 'probabilities':probabilities,
            'description':'CLIP compares the image with sentiment-related scene descriptions. This is an exploratory scene-tone estimate, not emotion recognition.',
            'matches':top_matches, 'warnings':['Scores are relative similarities, not calibrated emotional confidence.']}
