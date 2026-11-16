import base64
import io
import sys
from pathlib import Path
import numpy as np
import torch
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.config import (
    CHECKPOINT_PATH,
    CLASS_NAMES,
    DEVICE,
    MODEL_ARCHITECTURE,
    PREDICTION_THRESHOLD,
    PROJECT_DISCLAIMER,
)
from backend.app.services.gradcam import compute_gradcam
from backend.app.services.model import get_model_service
from backend.app.utils.image import generate_visualizations


def create_synthetic_xray(width: int = 480, height: int = 600) -> Image.Image:
    """Generates a synthetic chest X-ray image with asymmetric opacity (simulating pathology)."""
    y, x = np.ogrid[:height, :width]
    cy, cx = height / 2, width / 2
    # Thoracic contour
    thorax = ((x - cx) ** 2) / (cx ** 2) + ((y - cy) ** 2) / (cy ** 2)
    img_arr = np.where(thorax < 0.85, 120, 30).astype(np.float32)

    # Right lung normal
    right_lung = ((x - width * 0.7) ** 2) / (width * 0.16) ** 2 + ((y - cy) ** 2) / (height * 0.28) ** 2
    img_arr = np.where(right_lung < 1.0, 60, img_arr)

    # Left lung consolidation (infiltrate / pneumonia)
    left_lung = ((x - width * 0.3) ** 2) / (width * 0.16) ** 2 + ((y - cy) ** 2) / (height * 0.28) ** 2
    img_arr = np.where(left_lung < 1.0, 150, img_arr)

    # Add rib artifacts
    ribs = np.sin(y / 18.0) * 15
    img_arr = np.clip(img_arr + ribs, 0, 255).astype(np.uint8)

    return Image.fromarray(img_arr, mode="L")


def verify_pipeline():
    print("=" * 65)
    print("  PneumoAI End-to-End Pipeline & Grad-CAM Verification")
    print("=" * 65)

    print(f"\n[1] Checkpoint & Model Initialization")
    print(f"  - Target Checkpoint: {CHECKPOINT_PATH}")
    print(f"  - Checkpoint Exists: {CHECKPOINT_PATH.is_file()}")
    assert CHECKPOINT_PATH.is_file(), f"Missing checkpoint: {CHECKPOINT_PATH}"

    service = get_model_service()
    print(f"  - Model Loaded:      {service.is_loaded}")
    print(f"  - Device:            {service.device}")
    print(f"  - Architecture:      {MODEL_ARCHITECTURE}")
    assert service.is_loaded is True

    print(f"\n[2] Preprocessing Pipeline")
    xray_pil = create_synthetic_xray(width=480, height=600)
    print(f"  - Input Resolution:  {xray_pil.size} (Width x Height), Mode: {xray_pil.mode}")

    tensor = service.preprocess_image(xray_pil)
    print(f"  - Tensor Shape:      {tuple(tensor.shape)} (Batch, Channel, Height, Width)")
    print(f"  - Tensor Device:     {tensor.device}")
    assert tensor.shape == (1, 3, 224, 224), f"Expected (1, 3, 224, 224), got {tensor.shape}"

    print(f"\n[3] Model Inference & Threshold Evaluation")
    p_normal, p_pneumonia, pred_label, pred_class = service.predict_probabilities(tensor)
    print(f"  - Normal Prob:       {p_normal:.4f}")
    print(f"  - Pneumonia Prob:    {p_pneumonia:.4f}")
    print(f"  - Threshold Applied: {PREDICTION_THRESHOLD}")
    print(f"  - Decision Logic:    Pneumonia if prob >= {PREDICTION_THRESHOLD} else Normal")
    print(f"  - Predicted Class:   {pred_class} (Label: {pred_label})")

    # Assertions on probabilities and threshold
    assert 0.0 <= p_normal <= 1.0
    assert 0.0 <= p_pneumonia <= 1.0
    assert abs((p_normal + p_pneumonia) - 1.0) < 0.001
    expected_class = "PNEUMONIA" if p_pneumonia >= PREDICTION_THRESHOLD else "NORMAL"
    assert pred_class == expected_class

    print(f"\n[4] Grad-CAM Generation on features[5]")
    target_class = 1 if p_pneumonia >= PREDICTION_THRESHOLD else 0
    print(f"  - Grad-CAM Target Class: {target_class} ({CLASS_NAMES[target_class]})")

    cam_map = compute_gradcam(
        model=service.model,
        input_tensor=tensor,
        target_class=target_class,
    )
    print(f"  - Raw CAM Map Shape: {cam_map.shape}")
    print(f"  - CAM Min / Max:     {cam_map.min():.4f} / {cam_map.max():.4f}")
    assert cam_map.shape == (14, 14), f"Expected (14, 14), got {cam_map.shape}"
    assert 0.0 <= cam_map.min() <= cam_map.max() <= 1.0

    print(f"\n[5] Dynamic Resolution Resizing & Visualizations")
    vis = generate_visualizations(
        original_pil=xray_pil,
        cam_normalized=cam_map,
    )
    assert set(vis.keys()) == {"original", "heatmap", "overlay"}

    for key, uri in vis.items():
        assert uri.startswith("data:image/png;base64,"), f"Expected PNG data URL for {key}"
        raw_b64 = uri.replace("data:image/png;base64,", "")
        png_bytes = base64.b64decode(raw_b64)
        with Image.open(io.BytesIO(png_bytes)) as decoded:
            assert decoded.format == "PNG", f"{key} format was {decoded.format}, expected PNG"
            assert decoded.size == (480, 600), f"{key} size was {decoded.size}, expected (480, 600)"
        print(f"  - Visualization '{key:8}': Valid PNG, {len(png_bytes):,} bytes, Dimensions: {decoded.size}")

    print(f"\n[6] Educational Disclaimer")
    print(f"  - Disclaimer Text: \"{PROJECT_DISCLAIMER}\"")

    print("\n" + "=" * 65)
    print("  ALL CORE BACKEND & GRAD-CAM COMPONENTS VERIFIED FLAWLESSLY!")
    print("=" * 65)


if __name__ == "__main__":
    verify_pipeline()
