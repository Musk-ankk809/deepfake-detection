# ai_engine/ai_engine.py
import numpy as np
from tensorflow.keras.models import load_model

class DeepfakeDetector:
    def __init__(self, model_path):
        print(f"🧠 Loading Deepfake Master Model from: {model_path}...")
        self.model = load_model(model_path)
        print("✅ Model Loaded Successfully!")

    def predict(self, preprocessed_face):
        """Runs the AI inference on the prepped face."""
        # Add batch dimension
        input_tensor = np.expand_dims(preprocessed_face, axis=0)
        
        # Predict
        prediction = self.model.predict(input_tensor, verbose=0)[0][0]
        
        # Format results
        if prediction >= 0.5:
            confidence = prediction * 100
            return "REAL", confidence
        else:
            confidence = (1 - prediction) * 100
            return "FAKE", confidence