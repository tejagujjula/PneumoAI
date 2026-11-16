import base64
import io
import cv2
import numpy as np
from PIL import Image


def pil_to_base64_png(image: Image.Image) -> str:
    """Encodes a PIL Image to a Base64 PNG data URL."""
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"


def cv2_bgr_to_base64_png(bgr_array: np.ndarray) -> str:
    """Encodes an OpenCV BGR numpy array to a Base64 PNG data URL."""
    success, encoded_img = cv2.imencode(".png", bgr_array)
    if not success:
        raise ValueError("Failed to encode OpenCV image to PNG format.")
    b64_str = base64.b64encode(encoded_img.tobytes()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"


def generate_visualizations(
    original_pil: Image.Image,
    cam_normalized: np.ndarray,
    alpha: float = 0.4,
    beta: float = 0.6,
) -> dict[str, str]:
    """
    Resizes the Grad-CAM activation map to the exact native resolution of the
    uploaded chest X-ray image, applies a JET colormap, and blends it with the original.

    All 3 outputs are returned as PNG Base64 data URLs:
    - original: original chest X-ray
    - heatmap: pure JET colormapped activation map
    - overlay: alpha-blended composite highlighting pathological regions

    Args:
        original_pil: Decoded uploaded PIL Image.
        cam_normalized: 2D numpy array [0.0 - 1.0] from Grad-CAM.
        alpha: Weight for heatmap in overlay (default 0.4).
        beta: Weight for original image in overlay (default 0.6).

    Returns:
        dict[str, str]: Dictionary containing 'original', 'heatmap', and 'overlay' data URLs.
    """
    # 1. Ensure original is 3-channel RGB
    rgb_image = original_pil.convert("RGB")
    orig_w, orig_h = rgb_image.size

    # Convert to OpenCV BGR array for blending
    orig_bgr = cv2.cvtColor(np.array(rgb_image), cv2.COLOR_RGB2BGR)

    # 2. Resize Grad-CAM 2D map directly to original image dimensions
    cam_resized = cv2.resize(
        cam_normalized,
        (orig_w, orig_h),
        interpolation=cv2.INTER_LINEAR
    )
    cam_resized = np.clip(cam_resized, 0.0, 1.0)
    cam_uint8 = np.uint8(255 * cam_resized)

    # 3. Apply COLORMAP_JET to get false-color heatmap (in BGR)
    heatmap_bgr = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)

    # 4. Composite overlay: alpha * heatmap + beta * original
    overlay_bgr = cv2.addWeighted(heatmap_bgr, alpha, orig_bgr, beta, 0.0)

    # 5. Encode all three representations as PNG Base64 data URLs
    return {
        "original": pil_to_base64_png(rgb_image),
        "heatmap": cv2_bgr_to_base64_png(heatmap_bgr),
        "overlay": cv2_bgr_to_base64_png(overlay_bgr),
    }
