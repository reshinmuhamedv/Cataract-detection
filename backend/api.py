
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import cv2
import numpy as np
import io
import os
import time

from model import QCCNN

app = FastAPI(
    title="Cataract Detection Qiskit API",
    description="Quantum-Classical CNN (Qiskit + PyTorch) for automated cataract detection",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE = os.path.dirname(__file__)
# Updated to match the improved model filename from Colab
MODEL_PATH = os.path.join(BASE, "Trained_models", "cataract_qcnn_model.pth")

# Global model state
model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

@app.on_event("startup")
def startup():
    global model
    try:
        print(f"Loading Improved QC-CNN model from {MODEL_PATH}")
        model = QCCNN()
        
        if os.path.exists(MODEL_PATH):
            # Load weights
            checkpoint = torch.load(MODEL_PATH, map_location=device)
            if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
                model.load_state_dict(checkpoint["state_dict"])
            else:
                model.load_state_dict(checkpoint)
        else:
            print(f"WARNING: Model weights file not found at {MODEL_PATH}!")
            
        model.to(device)
        model.eval()
        print("Improved QC-CNN Model successfully initialized.")
    except Exception as e:
        print(f"Error initializing QC-CNN: {e}")
        model = None

@app.get("/")
def root():
    return {
        "name": "Improved Cataract Detection API (Qiskit/PyTorch)",
        "model_loaded": model is not None,
        "resolution": "64x64",
        "channels": 1,
        "normalization": "[-1, 1]"
    }

@app.get("/health")
def health():
    return {
        "status": "ok" if model else "error",
        "model_loaded": model is not None,
        "device": str(device)
    }

def preprocess_image(file_bytes: bytes) -> torch.Tensor:
    # 1. Convert bytes to numpy array
    nparr = np.frombuffer(file_bytes, np.uint8)
    # 2. Decode as Grayscale (match cv2.imread(..., 0))
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Could not decode image")
    
    # 3. Resize to 64x64
    img = cv2.resize(img, (64, 64))
    
    # 4. Normalize to [-1, 1] (Match transforms.Normalize(mean=[0.5], std=[0.5]))
    img = (img.astype("float32") / 255.0 - 0.5) / 0.5
    
    # 5. Convert to Tensor (1, 1, 64, 64) -> [Batch, Channel, H, W]
    tensor = torch.from_numpy(img).unsqueeze(0).unsqueeze(0)
    
    return tensor.to(device)

@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    contents = await file.read()
    try:
        x = preprocess_image(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {e}")

    start_time = time.time()
    with torch.no_grad():
        # The model returns logits
        logits = model(x)
        prob = torch.sigmoid(logits).item()
    
    inference_time = (time.time() - start_time) * 1000

    # Label logic: 0 = normal, 1 = cataract
    # Improved Colab uses 0.3 threshold for better recall
    threshold = 0.3
    if prob >= threshold:
        label = "cataract"
        # For display confidence, we can show the probability relative to threshold or just raw prob
        confidence = prob
    else:
        label = "normal"
        confidence = 1.0 - prob

    return {
        "prediction": label,
        "probability": round(confidence, 4),
        "model_type": "Improved QC-CNN (Qiskit)",
        "inference_time_ms": round(inference_time, 2),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
