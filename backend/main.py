import io
import os
import torch
import torch.nn as nn
import numpy as np
import cv2
import joblib
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from torchvision import models, transforms
from PIL import Image

# --- NEW IMPORTS FOR MODEL 3 (Partner's Code) ---
from ai_engine.ai_engine import DeepfakeDetector
from ai_engine.face_utils import extract_face

app = FastAPI()

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- 1. MODEL 1 SETUP (ResNet50 Hybrid) ---
resnet50 = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1).to(device)
resnet50.fc = torch.nn.Identity()
resnet50.eval()
model1_classifier = joblib.load("tamper_detector_model.pkl")
model1_scaler = joblib.load("feature_scaler.pkl")

# --- 2. MODEL 2 SETUP (Dual-Branch Synthetic) ---
class HybridModel(nn.Module):
    def __init__(self):
        super(HybridModel, self).__init__()
        self.rgb_branch = models.resnet18(weights='DEFAULT')
        self.rgb_branch.fc = nn.Identity() 
        self.fft_branch = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(), nn.AdaptiveAvgPool2d((1,1))
        )
        self.classifier = nn.Sequential(
            nn.Linear(512 + 32, 128), nn.ReLU(), nn.Dropout(0.3), nn.Linear(128, 1), nn.Sigmoid()
        )

    def forward(self, rgb, fft):
        rgb_f = self.rgb_branch(rgb)
        fft_f = self.fft_branch(fft).view(fft.size(0), -1)
        return self.classifier(torch.cat((rgb_f, fft_f), dim=1))

model2 = HybridModel().to(device)
model2.load_state_dict(torch.load("veridoc_highres_model.pth", map_location=device))
model2.eval()

# --- 3. MODEL 3 SETUP (Partner's Face Engine) ---
MODEL_PATH_3 = 'models/veridoc_mixed_epoch_01.h5'
detector_m3 = DeepfakeDetector(MODEL_PATH_3)

# --- 4. PREPROCESSING & UTILS ---
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def extract_model1_features(image_pil, image_bytes):
    input_tensor = preprocess(image_pil).unsqueeze(0).to(device)
    with torch.no_grad():
        deep_features = resnet50(input_tensor).cpu().numpy().flatten()
    
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    img_cv = cv2.resize(img_cv, (224, 224))
    f = np.fft.fft2(img_cv)
    mag = np.abs(np.fft.fftshift(f))
    fft_val = np.mean(mag)
    lap_var = cv2.Laplacian(img_cv, cv2.CV_64F).var()
    noise_var = np.var(img_cv)
    
    forensic_features = np.array([fft_val, lap_var, noise_var])
    return np.concatenate([deep_features, forensic_features]), mag



def generate_explanation_fast(m1, m2, m3, verdict):
    """
    High-speed Forensic Logic: Builds a perfect explanation 
    based on real model data instantly.
    """
    def get_conf_text(conf):
        if conf > 85: return "high-probability"
        if conf > 60: return "moderate"
        return "low-level"

    explanations = []

    # --- Analysis 1: Global Tampering ---
    if m1["status"] == "TAMPERED":
        explanations.append(f"Detected {get_conf_text(m1['confidence'])} pixel inconsistencies suggesting manual splicing.")
    else:
        explanations.append("Global pixel structures appear consistent with original photography.")

    # --- Analysis 2: Synthetic DNA ---
    if m2["status"] == "SYNTHETIC":
        explanations.append(f"Identified {get_conf_text(m2['confidence'])} mathematical artifacts typical of AI generation.")
    else:
        explanations.append("No GAN-based checkerboard patterns or synthetic noise detected.")

    # --- Analysis 3: Facial Forensic ---
    if m3["status"] == "TAMPERED":
        explanations.append(f"Facial analysis indicates {get_conf_text(m3['confidence'])} biometric manipulation.")
    elif m3["status"] == "NO_FACE":
        explanations.append("No facial biometric data available for localized scanning.")
    else:
        explanations.append("Facial features show natural biological textures and lighting.")

    # --- Final Conclusion ---
    if verdict == "REAL":
        final_line = "RESULT: SECURE / AUTHENTIC."
    else:
        final_line = "RESULT: CRITICAL ANOMALY DETECTED."

    return " ".join(explanations) + " " + final_line
# --- 5. THE MASTER API ENDPOINT ---
@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image_pil = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # --- STEP 1: MODEL 1 (TAMPERING) ---
    features, mag_spectrum = extract_model1_features(image_pil, image_bytes)
    features_scaled = model1_scaler.transform(features.reshape(1, -1))
    prob1 = model1_classifier.predict_proba(features_scaled)[0][1]
    m1_status = "TAMPERED" if prob1 >= 0.50 else "AUTHENTIC"

    m1_results = {
        "confidence": float(round(prob1 * 100, 2)), # Risk of tampering
        "status": m1_status
    }

    # --- STEP 2: MODEL 2 (SYNTHETIC) ---
    log_mag = cv2.normalize(np.log(1 + mag_spectrum), None, 0, 255, cv2.NORM_MINMAX)
    fft_pil = Image.fromarray(log_mag.astype(np.uint8)).convert("RGB")
    input_tensor_m2 = preprocess(image_pil).unsqueeze(0).to(device)
    fft_tensor_m2 = preprocess(fft_pil).unsqueeze(0).to(device)
    with torch.no_grad():
        prob2 = model2(input_tensor_m2, fft_tensor_m2).item()
    m2_status = "SYNTHETIC" if prob2 >= 0.50 else "AUTHENTIC"

    m2_results = {
        "confidence": float(round(prob2 * 100, 2)), # Risk of AI generation
        "status": m2_status
    }

    # --- MODEL 3: FACE ENGINE (Logic Fixed) ---
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as f:
        f.write(image_bytes)
    
    m3_label = "REAL"
    m3_raw_conf = 0
    try:
        face_result = extract_face(temp_filename)
        if face_result is not None:
            preprocessed_face, _ = face_result
            m3_label, m3_raw_conf = detector_m3.predict(preprocessed_face)
            # m3_label is "REAL" or "FAKE"
            # m3_raw_conf is ALWAYS high (e.g. 99%) because of your partner's math
        else:
            m3_label = "NO_FACE"
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

    # --- THE FIX: CALCULATE "RISK SCORE" FOR THE GAUGE ---
    # We want the gauge to show how FAKE it is.
    if m3_label == "REAL":
        m3_risk_score = 100 - m3_raw_conf  # If 99% Real, Risk is 1%
        m3_display_status = "AUTHENTIC"
    elif m3_label == "FAKE":
        m3_risk_score = m3_raw_conf       # If 99% Fake, Risk is 99%
        m3_display_status = "TAMPERED"
    else:
        m3_risk_score = 0
        m3_display_status = "NO_FACE_DETECTED"

    m3_results = {
        "confidence": float(round(m3_risk_score, 2)), # Risk of Deepfake Face
        "status": m3_display_status 
    }

    # --- FINAL SYSTEM VERDICT ---
    is_deepfake = (m1_status == "TAMPERED") or (m2_status == "SYNTHETIC") or (m3_display_status == "TAMPERED")
    final_verdict = "DEEPFAKE" if is_deepfake else "REAL"

    # ... after all 3 models finish ...
    ai_text = generate_explanation_fast(m1_results, m2_results, m3_results, final_verdict)
    
    return {
        "model_1": m1_results,
        "model_2": m2_results,
        "model_3": m3_results,
        "ai_explanation": ai_text,  # This goes to your React banner
        "combined_verdict": final_verdict
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)