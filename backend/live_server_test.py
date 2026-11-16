import base64
import io
import sys
import threading
import time
from pathlib import Path
import numpy as np
from PIL import Image
import uvicorn
import httpx

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app


def create_sample_chest_xray(width: int = 512, height: int = 512) -> bytes:
    """
    Creates a realistic synthetic chest X-ray pattern:
    Dark thoracic cavity, brighter lung fields and ribs.
    """
    y, x = np.ogrid[:height, :width]
    center_y, center_x = height / 2, width / 2
    # Elliptical thoracic boundary
    mask = ((x - center_x) ** 2) / (center_x ** 2) + ((y - center_y) ** 2) / (center_y ** 2)
    base = np.where(mask < 0.85, 120, 20).astype(np.uint8)

    # Add bilateral lung opacities
    left_lung = ((x - width * 0.35) ** 2) / (width * 0.15) ** 2 + ((y - height * 0.5) ** 2) / (height * 0.25) ** 2
    right_lung = ((x - width * 0.65) ** 2) / (width * 0.15) ** 2 + ((y - height * 0.5) ** 2) / (height * 0.25) ** 2
    base = np.where(left_lung < 1.0, 70, base)
    base = np.where(right_lung < 1.0, 75, base)

    # Add simulated rib cage striations
    ribs = (np.sin(y / 15.0) * 20).astype(np.int16)
    pattern = np.clip(base.astype(np.int16) + ribs, 0, 255).astype(np.uint8)

    # Save as PNG
    img = Image.fromarray(pattern, mode="L")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


import subprocess

def run_live_tests():
    print("=" * 60)
    print("  Starting PneumoAI Live Uvicorn Server Test")
    print("=" * 60)

    # Launch uvicorn as a clean background subprocess
    cmd = [
        sys.executable,
        "-u",
        "-m",
        "uvicorn",
        "backend.app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
        "--log-level",
        "info"
    ]
    proc = subprocess.Popen(
        cmd,
        cwd=str(PROJECT_ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    base_url = "http://127.0.0.1:8000"

    print("Waiting for server to become responsive...")
    ready = False
    for i in range(40):
        # Check if process died early
        if proc.poll() is not None:
            stdout, _ = proc.communicate()
            print("Server process exited unexpectedly with code", proc.returncode)
            print("Process output:\n", stdout)
            raise RuntimeError(f"Server exited prematurely with code {proc.returncode}")

        try:
            r = httpx.get(f"{base_url}/health", timeout=1.5)
            if r.status_code == 200:
                ready = True
                break
        except Exception:
            time.sleep(0.5)

    if not ready:
        proc.terminate()
        stdout, _ = proc.communicate()
        print("Server output:\n", stdout)
        raise RuntimeError("Server failed to respond within timeout.")

    print("Server is UP and HEALTHY!")

    client = httpx.Client(base_url=base_url, timeout=30.0)

    try:
        # 1. Test Root endpoint
        print("\n[Test 1] Testing GET / ...")
        res_root = client.get("/")
        assert res_root.status_code == 200
        root_data = res_root.json()
        print("  Root response:", root_data)
        assert root_data["architecture"] == "EfficientNetV2-S"
        assert root_data["threshold"] == 0.77

        # 2. Test GET /health
        print("\n[Test 2] Testing GET /health ...")
        res_health = client.get("/health")
        assert res_health.status_code == 200
        health_data = res_health.json()
        print("  Health response:", health_data)
        assert health_data["status"] == "healthy"
        assert health_data["model_loaded"] is True
        assert health_data["prediction_threshold"] == 0.77

        # 3. Test GET /api/health
        print("\n[Test 3] Testing GET /api/health ...")
        res_api_health = client.get("/api/health")
        assert res_api_health.status_code == 200
        api_health_data = res_api_health.json()
        print("  API Health response:", api_health_data)
        assert api_health_data["architecture"] == "EfficientNetV2-S"
        assert api_health_data["gradcam_target_layer"] == "features[5]"

        # 4. Test POST /api/predict with sample Chest X-ray
        print("\n[Test 4] Testing POST /api/predict (Sample Chest X-Ray) ...")
        xray_bytes = create_sample_chest_xray(width=512, height=512)
        files = {"file": ("chest_xray_sample.png", xray_bytes, "image/png")}
        res_predict = client.post("/api/predict", files=files)

        assert res_predict.status_code == 200, f"Predict failed: {res_predict.status_code} {res_predict.text}"
        data = res_predict.json()

        print("\nPrediction Response Details:")
        print(f"  - Success:            {data['success']}")
        print(f"  - Predicted Class:    {data['predicted_class']}")
        print(f"  - Predicted Label:    {data['predicted_label']}")
        print(f"  - Threshold Applied:  {data['threshold_applied']}")
        print(f"  - Normal Prob:        {data['probabilities']['NORMAL']}")
        print(f"  - Pneumonia Prob:     {data['probabilities']['PNEUMONIA']}")
        print(f"  - Image Dimensions:   {data['image_dimensions']['width']}x{data['image_dimensions']['height']}")
        print(f"  - Visualizations:     {list(data['visualizations'].keys())}")
        print(f"  - Disclaimer:         {data['disclaimer']}")

        # Validate assertions
        assert data["success"] is True
        assert data["predicted_class"] in ["NORMAL", "PNEUMONIA"]
        assert data["predicted_label"] in [0, 1]
        assert data["threshold_applied"] == 0.77
        assert 0.0 <= data["probabilities"]["NORMAL"] <= 1.0
        assert 0.0 <= data["probabilities"]["PNEUMONIA"] <= 1.0
        prob_sum = data["probabilities"]["NORMAL"] + data["probabilities"]["PNEUMONIA"]
        assert abs(prob_sum - 1.0) < 0.01

        # Check threshold logic consistency
        expected_class = "PNEUMONIA" if data["probabilities"]["PNEUMONIA"] >= 0.77 else "NORMAL"
        expected_label = 1 if data["probabilities"]["PNEUMONIA"] >= 0.77 else 0
        assert data["predicted_class"] == expected_class, f"Threshold mismatch: expected {expected_class}, got {data['predicted_class']}"
        assert data["predicted_label"] == expected_label

        # Verify Base64 PNG visualizations
        for key in ["original", "heatmap", "overlay"]:
            uri = data["visualizations"][key]
            assert uri.startswith("data:image/png;base64,"), f"Visualization '{key}' not a PNG data URI"
            b64_payload = uri.replace("data:image/png;base64,", "")
            raw_png = base64.b64decode(b64_payload)
            # Verify decoded PNG can be opened and has correct dimensions
            with Image.open(io.BytesIO(raw_png)) as dec_img:
                assert dec_img.format == "PNG"
                assert dec_img.size == (512, 512), f"Dimension mismatch: expected (512, 512), got {dec_img.size}"
            print(f"  - Visualization '{key}': Valid PNG, {len(raw_png)} bytes, resolution {dec_img.size}")

        # 5. Test Error Handling: Invalid file type
        print("\n[Test 5] Testing POST /api/predict (Invalid File Type) ...")
        fake_file = {"file": ("notes.txt", b"Invalid text data", "text/plain")}
        res_invalid = client.post("/api/predict", files=fake_file)
        print("  Invalid file response status:", res_invalid.status_code, res_invalid.json())
        assert res_invalid.status_code == 400

        # 6. Test Error Handling: Size limit (> 10 MB)
        print("\n[Test 6] Testing POST /api/predict (File > 10 MB) ...")
        huge_bytes = b"0" * (10 * 1024 * 1024 + 1024)
        huge_file = {"file": ("huge.png", huge_bytes, "image/png")}
        res_huge = client.post("/api/predict", files=huge_file)
        print("  Oversized file response status:", res_huge.status_code, res_huge.json())
        assert res_huge.status_code == 413

        print("\n" + "=" * 60)
        print("  ALL TESTS PASSED! PneumoAI Backend is fully verified.")
        print("=" * 60)

    finally:
        client.close()
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()


if __name__ == "__main__":
    run_live_tests()
