import cv2
from mtcnn import MTCNN

# Initialize once
print("⚙️ Loading MTCNN Face Detector...")
detector = MTCNN()

def extract_face(image_path, output_size=(299, 299), padding_ratio=0.2, min_confidence=0.91):
    """Finds the face, checks confidence to filter out animals/objects, and prepares it."""
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Error: Could not load image at '{image_path}'")
        return None

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    faces = detector.detect_faces(image_rgb)

    # 1. Did it find any geometric face at all?
    if len(faces) == 0:
        print("❌ [VeriDoc] No face detected in this image.")
        return None

    # 2. Extract the data for the most prominent face
    best_face = faces[0]
    confidence = best_face['confidence']
    
    # 3. THE SECURITY BOUNCER: Is it a human?
    if confidence < min_confidence:
        print(f"⚠️ [VeriDoc Security] Face rejected! Confidence too low ({confidence:.4f}).")
        print("    -> Reason: Image likely contains an animal, cartoon, or non-human object.")
        return None  # Halts the pipeline so the deepfake model never sees it!

    # 4. Proceed with safe cropping
    x, y, w, h = best_face['box']
    x, y = max(0, x), max(0, y)

    margin_x = int(w * padding_ratio)
    margin_y = int(h * padding_ratio)

    img_height, img_width, _ = image_rgb.shape
    x1 = max(0, x - margin_x)
    y1 = max(0, y - margin_y)
    x2 = min(img_width, x + w + margin_x)
    y2 = min(img_height, y + h + margin_y)

    face_crop = image_rgb[y1:y2, x1:x2]
    face_crop = cv2.resize(face_crop, output_size, interpolation=cv2.INTER_CUBIC)
    
    # Normalize for the neural network
    face_crop_normalized = face_crop.astype('float32') / 255.0

    return face_crop_normalized, face_crop