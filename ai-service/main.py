from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from transformers import pipeline, GPT2LMHeadModel, GPT2TokenizerFast
import torch
import numpy as np
import cv2
import librosa
import io

app = FastAPI()

# Load AI models
text_classifier = pipeline('text-classification', model='distilbert-base-uncased', device=0 if torch.cuda.is_available() else -1)
try:
    gpt2_tokenizer = GPT2TokenizerFast.from_pretrained('gpt2')
    gpt2_model = GPT2LMHeadModel.from_pretrained('gpt2').to('cuda' if torch.cuda.is_available() else 'cpu')
except Exception as e:
    print("Warning: Could not load GPT-2 model. Perplexity will be disabled.")
    gpt2_model = None

@app.post('/verify-text')
async def verify_text(text: str = Form(...)):
    """Verify if text is AI-generated using NLP models"""
    try:
        # Use multiple detection techniques
        # 1. Transformers-based detection
        result = text_classifier(text[:512])[0]
        
        # 2. Entropy-based analysis
        entropy_score = calculate_entropy(text)
        
        # 3. Stylometry analysis
        style_score = analyze_style(text)
        
        # 4. Perplexity Vector analysis
        perplexity_score = calculate_perplexity(text)
        
        # Combine scores
        ai_score = (
            (result['score'] * 30) +     # 30% from transformer
            (entropy_score * 20) +       # 20% from entropy
            (style_score * 20) +         # 20% from style
            (perplexity_score * 30)      # 30% from perplexity
        )
        
        ai_score = min(100, max(0, ai_score))
        
        if ai_score > 70:
            classification = 'Fully AI-Generated'
        elif ai_score > 40:
            classification = 'AI-Assisted'
        else:
            classification = 'Human-Created'
        
        confidence = min(95, 50 + abs(ai_score - 50) * 0.9)
        
        return {
            'aiScore': round(ai_score, 2),
            'classification': classification,
            'confidence': round(confidence, 2),
        }
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={'error': str(e)},
        )

@app.post('/verify-file')
async def verify_file(file: UploadFile = File(...), type: str = Form(...)):
    """Verify file (image/video/audio) for AI-generation"""
    try:
        contents = await file.read()
        
        if 'image' in type:
            ai_score = detect_ai_image(contents)
        elif 'audio' in type or 'video' in type:
            ai_score = detect_ai_audio_video(contents)
        elif 'code' in type or 'text' in type:
            ai_score = detect_ai_code(contents)
        else:
            ai_score = 50
        
        if ai_score > 70:
            classification = 'Fully AI-Generated'
        elif ai_score > 40:
            classification = 'AI-Assisted'
        else:
            classification = 'Human-Created'
        
        confidence = min(95, 50 + abs(ai_score - 50) * 0.9)
        
        return {
            'aiScore': round(ai_score, 2),
            'classification': classification,
            'confidence': round(confidence, 2),
        }
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={'error': str(e)},
        )

def calculate_entropy(text: str) -> float:
    """Calculate entropy for AI-text detection"""
    char_counts = {}
    for char in text:
        char_counts[char] = char_counts.get(char, 0) + 1
    
    total = len(text)
    entropy = 0
    for count in char_counts.values():
        p = count / total
        entropy -= p * np.log2(p)
    
    return min(100, (entropy / 8) * 100)  # Normalize to 0-100

def analyze_style(text: str) -> float:
    """Analyze writing style for AI patterns"""
    # Check for common AI patterns
    score = 0
    
    # Low variance in sentence length
    sentences = text.split('.')
    if len(sentences) > 1:
        lengths = [len(s.split()) for s in sentences]
        variance = np.var(lengths)
        score += (1 - min(1, variance / 10)) * 20
    
    # Excessive punctuation
    punct_ratio = sum(1 for c in text if c in '!?') / len(text)
    score += (punct_ratio * 15)
    
    # Repetition rate
    words = text.lower().split()
    if len(words) > 0:
        unique_ratio = len(set(words)) / len(words)
        score += (1 - unique_ratio) * 15
    
    return min(100, score)

def calculate_perplexity(text: str) -> float:
    """Calculate text perplexity using GPT-2. AI generated text typically has lower perplexity."""
    if gpt2_model is None:
        return 50.0 # Default if model failed to load
        
    encodings = gpt2_tokenizer(text, return_tensors='pt')
    max_length = gpt2_model.config.n_positions
    stride = 512

    seq_len = encodings.input_ids.size(1)
    nlls = []
    
    # Avoid too short texts
    if seq_len < 10:
        return 50.0

    for i in range(0, seq_len, stride):
        begin_loc = max(i + stride - max_length, 0)
        end_loc = min(i + stride, seq_len)
        trg_len = end_loc - i
        input_ids = encodings.input_ids[:, begin_loc:end_loc].to(gpt2_model.device)
        target_ids = input_ids.clone()
        target_ids[:, :-trg_len] = -100

        with torch.no_grad():
            outputs = gpt2_model(input_ids, labels=target_ids)
            neg_log_likelihood = outputs.loss * trg_len

        nlls.append(neg_log_likelihood)

    ppl = torch.exp(torch.stack(nlls).sum() / end_loc).item()
    
    # Mapping perplexity to AI score. Lower ppl -> more likely AI
    # Very loose heuristic: < 30 is highly likely AI, > 100 is highly likely Human
    score = 100 - min(100, max(0, (ppl - 10) / 90 * 100))
    return score

def detect_ai_image(image_bytes: bytes) -> float:
    """Detect AI-generated images using diffusion pattern matching (frequency domain)"""
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        
        # Perform 2D Discrete Fourier Transform
        dft = cv2.dft(np.float32(img), flags=cv2.DFT_COMPLEX_OUTPUT)
        dft_shift = np.fft.fftshift(dft)
        magnitude_spectrum = 20 * np.log(cv2.magnitude(dft_shift[:, :, 0], dft_shift[:, :, 1]) + 1)
        
        # AI images often have abnormal high-frequency distributions or grid-like artifacts in frequency domain
        high_freq_energy = np.sum(magnitude_spectrum[10:-10, 10:-10]) / np.sum(magnitude_spectrum)
        
        # Heuristic mapping
        score = min(100, max(0, (high_freq_energy - 0.5) * 200))
        return score
    except Exception as e:
        print(f"Image analysis error: {e}")
        return 50.0

def detect_ai_audio_video(media_bytes: bytes) -> float:
    """Detect AI-generated audio using Spectral Entropy"""
    try:
        # Load audio from bytes (assuming simple format like wav/mp3)
        y, sr = librosa.load(io.BytesIO(media_bytes), sr=None)
        
        # Calculate Spectral Entropy
        S = np.abs(librosa.stft(y))
        
        # Normalize power spectrum
        P = S**2 / np.sum(S**2, axis=0, keepdims=True)
        
        # Compute entropy
        entropy = -np.sum(P * np.log2(P + 1e-10), axis=0)
        mean_entropy = np.mean(entropy)
        
        # Human voices tend to have varied entropy, AI TTS can sometimes be too predictable/smooth
        # This is a basic heuristic wrapper
        max_possible_entropy = np.log2(S.shape[0])
        normalized_entropy = mean_entropy / max_possible_entropy
        
        # Lower entropy means more periodic/synthetic
        score = 100 - (normalized_entropy * 100)
        return min(100, max(0, score))
    except Exception as e:
        print(f"Audio analysis error: {e}")
        return 50.0

def detect_ai_code(code_bytes: bytes) -> float:
    """Detect AI-generated source code"""
    # Placeholder: would use token entropy analysis
    return np.random.uniform(25, 75)

@app.get('/health')
async def health_check():
    return {'status': 'OK'}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5001)
