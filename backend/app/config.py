import os
from pathlib import Path
import torch

# Base directory paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = BACKEND_DIR.parent

# Checkpoint candidate locations (checked in order)
_ENV_PATH = os.getenv("MODEL_CHECKPOINT_PATH")
_CANDIDATE_PATHS = [
    Path(_ENV_PATH).resolve() if _ENV_PATH else None,
    (BASE_DIR / "efficientnetv2_s_best.pth").resolve(),
    (BACKEND_DIR / "models" / "efficientnetv2_s_best.pth").resolve(),
    (BASE_DIR / "models" / "efficientnetv2_s_best.pth").resolve(),
]

CHECKPOINT_PATH = None
for candidate in _CANDIDATE_PATHS:
    if candidate and candidate.is_file():
        CHECKPOINT_PATH = candidate
        break

if CHECKPOINT_PATH is None:
    # Default fallback path
    CHECKPOINT_PATH = (BASE_DIR / "efficientnetv2_s_best.pth").resolve()

# Device selection: automatically use CUDA if available, fallback to CPU
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model architecture & input constants
MODEL_ARCHITECTURE = "EfficientNetV2-S"
NUM_CLASSES = 2
INPUT_SIZE = (224, 224)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Decision threshold for Pneumonia (chosen to maximize specificity while maintaining >=98% sensitivity)
PREDICTION_THRESHOLD = 0.77

# Class mappings
CLASS_NAMES = {
    0: "NORMAL",
    1: "PNEUMONIA"
}

# Grad-CAM settings
GRADCAM_TARGET_LAYER = "features[5]"

# Input validation constraints
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP", "BMP"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp"
}
MIN_IMAGE_DIMENSION = 32

# CORS settings for frontend integration (React Vite / CRA)
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "*"
]

# Educational & demonstration disclaimer
PROJECT_DISCLAIMER = "This is an experimental educational project, not a clinical diagnostic tool."
