# PneumoAI – Pneumonia Detection from Chest X-Ray Images

> [!IMPORTANT]
> **Educational Disclaimer**:
> This is an experimental educational project, not a clinical diagnostic tool. It is designed for academic demonstration and machine learning interpretability studies and should not be used for medical diagnosis, clinical treatment planning, or healthcare decision-making.

---

## 1. Project Overview

**PneumoAI** is an educational deep learning project that performs binary classification (`NORMAL` vs. `PNEUMONIA`) on chest radiograph images using an EfficientNetV2-S backbone and generates visual heatmaps via **Grad-CAM (Gradient-weighted Class Activation Mapping)** to visualize which feature regions influenced the model's prediction.

### Key Highlights
- **Pre-trained Architecture**: EfficientNetV2-S fine-tuned for binary classification (`NORMAL` = 0, `PNEUMONIA` = 1). The model does not distinguish between bacterial and viral pneumonia.
- **Zero Re-training Needed**: Loads pre-trained weights from `efficientnetv2_s_best.pth` directly onto CPU or CUDA.
- **Calibrated Operating Threshold ($0.77$)**: The threshold was selected on validation data to maximize specificity (reaching $98.94\%$) while maintaining sensitivity of at least $98\%$ ($98.21\%$).
- **Visual Interpretability (Grad-CAM)**: Hooks into `model.features[5]` to visualize feature representations influencing the prediction. *Note: Grad-CAM is an exploratory interpretability tool and is not a clinically validated anatomical or diagnostic localization method.*
- **Modular Full-Stack Architecture**: Clean FastAPI backend paired with a modern React + Vite + Tailwind CSS single-page interface.

---

## 2. Model Architecture & Specifications

| Parameter | Specification | Notes |
| :--- | :--- | :--- |
| **Backbone** | EfficientNetV2-S | Fused-MBConv convolutional architecture |
| **Input Dimensions** | $224 \times 224 \times 3$ | Grayscale X-rays are converted to 3-channel RGB |
| **Normalization** | ImageNet Normalization | Mean: `[0.485, 0.456, 0.406]`, Std: `[0.229, 0.224, 0.225]` |
| **Classifier Head** | `nn.Linear(1280, 2)` | Replaces the standard 1000-class ImageNet head |
| **Target Classes** | Class 0: `NORMAL`<br>Class 1: `PNEUMONIA` | Binary classification only (does not subclassify viral vs bacterial) |
| **Grad-CAM Target** | `model.features[5]` | High-level spatial semantic feature block |
| **Target Class Policy** | `1 if p_pneumonia >= 0.77 else 0` | Grad-CAM targets the threshold-selected predicted class |

---

## 3. Threshold Calibration & Experimental Evaluation Metrics

In experimental evaluation, missing potential pneumonia cases is particularly undesirable. A default decision threshold of $\tau = 0.50$ produces excessive false positives due to class imbalance and subtle normal radiographic variations.

The prediction threshold $\tau = 0.77$ was selected on validation data to maximize specificity while maintaining sensitivity of at least $98\%$:
$$\text{Decision} = \begin{cases} \text{PNEUMONIA} & \text{if } P(\text{Pneumonia}) \ge 0.77 \\ \text{NORMAL} & \text{otherwise} \end{cases}$$

### Experimental Results Summary

#### Validation Set (at threshold 0.77)
| Metric | Value | Experimental Significance |
| :--- | :--- | :--- |
| **Sensitivity (Recall)** | **98.21%** | Maintained above the target $\ge 98\%$ criterion |
| **Specificity** | **98.94%** | Maximized on validation data at threshold 0.77 |
| **Best Validation Loss** | **0.0382** | Lowest loss achieved during training |

#### Held-Out Test Set (at threshold 0.77)
| Metric | Value | Notes |
| :--- | :--- | :--- |
| **Accuracy** | **87.98%** | Overall classification accuracy on unseen test set |
| **Precision** | **84.46%** | Positive predictive value |
| **Sensitivity / Recall** | **98.97%** | High recall preserved on independent test split |
| **Specificity** | **69.66%** | True negative rate on test distribution |
| **F1-Score** | **91.15%** | Harmonic mean of precision and recall |
| **ROC-AUC** | **96.64% (0.9664)** | High overall discriminative capability |

#### Training Dynamics
- **Best Checkpoint**: Obtained at **Epoch 3** with validation loss of **0.0382**.
- **Early Stopping**: Training continued with early stopping monitoring until termination at **Epoch 8**.

---

## 4. Project Structure

```text
PneumoAI/
├── efficientnetv2_s_best.pth          # Pre-trained checkpoint (243 MB)
├── requirements.txt                   # Backend dependencies
├── README.md                          # Project documentation & demo guide
├── backend/                           # FastAPI Backend
│   ├── run.py                         # Application runner script
│   ├── live_server_test.py            # Automated live server & endpoint test
│   ├── verify_pipeline.py             # In-memory ML pipeline verification
│   └── app/
│       ├── __init__.py
│       ├── main.py                    # FastAPI instance, CORS, error handling
│       ├── config.py                  # Pathlib checkpoint lookup, threshold, constants
│       ├── api/
│       │   ├── __init__.py
│       │   ├── routes.py              # Endpoints: /api/predict and /health
│       │   └── schemas.py             # Pydantic request/response schemas
│       ├── services/
│       │   ├── __init__.py
│       │   ├── model.py               # Singleton model loader and inference
│       │   └── gradcam.py             # Request-safe Grad-CAM on features[5]
│       └── utils/
│           ├── __init__.py
│           ├── image.py               # Dynamic resizing, colormapping, Base64 PNG encoder
│           └── validation.py          # 10 MB limit, MIME check, and decoding verification
└── frontend/                          # React + Vite Frontend
    ├── index.html                     # HTML5 entry with Inter font & medical branding
    ├── package.json                   # React 18, Vite 5, Tailwind, Recharts, Lucide, Axios
    ├── vite.config.js                 # Dev server config on port 5173
    ├── tailwind.config.js             # Custom brand colors (teal & sky accents)
    ├── postcss.config.js              # PostCSS autoprefixer configuration
    └── src/
        ├── main.jsx                   # React root mounting
        ├── index.css                  # Tailwind directives & custom scrollbars
        ├── App.jsx                    # Root state coordinator
        ├── services/api.js            # Axios client, health-check, POST /api/predict
        └── components/
            ├── Navbar.jsx             # Header navigation & live backend status pill
            ├── Hero.jsx               # Headline, experimental badges, and CTAs
            ├── ImageUpload.jsx        # Drag-and-drop, preview & demo samples
            ├── ResultsSection.jsx     # Predicted class, probabilities & threshold marker
            ├── GradCamVisualizer.jsx  # Feature attribution visualizations & downloads
            ├── HowItWorks.jsx         # 4-stage pipeline walkthrough
            ├── ModelPerformance.jsx   # Experimental validation & test metrics (Recharts)
            ├── AboutTech.jsx          # Architecture & tech stack overview
            └── Footer.jsx             # Mandatory educational disclaimer & metadata
```

---

## 5. Setup & Installation (Windows)

### Prerequisites
- Windows 10 / 11
- Python 3.10 to 3.13
- Node.js v18+ and npm

### Step 1: Open PowerShell
Navigate to the project root:
```powershell
cd C:\Users\teja7\OneDrive\Desktop\PneumoAI
```

### Step 2: Install Backend Dependencies
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

## 6. How to Run the Application

### Step 1: Start the FastAPI Backend
In your first PowerShell terminal:
```powershell
cd C:\Users\teja7\OneDrive\Desktop\PneumoAI
python backend/run.py
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

### Step 2: Start the React Frontend
In a **second** PowerShell terminal:
```powershell
cd C:\Users\teja7\OneDrive\Desktop\PneumoAI\frontend
npm run dev
```
- Web Application: 👉 **[http://localhost:5173](http://localhost:5173)**

---

## 7. API Specification

### `POST /api/predict`
- **Content-Type**: `multipart/form-data`
- **Parameter**: `file` (Binary image file, max 10 MB)
- **Response**:
```json
{
  "success": true,
  "predicted_class": "PNEUMONIA",
  "predicted_label": 1,
  "threshold_applied": 0.77,
  "probabilities": {
    "NORMAL": 0.0033,
    "PNEUMONIA": 0.9967
  },
  "image_dimensions": {
    "width": 512,
    "height": 512
  },
  "visualizations": {
    "original": "data:image/png;base64,iVBORw0KGgo...",
    "heatmap": "data:image/png;base64,iVBORw0KGgo...",
    "overlay": "data:image/png;base64,iVBORw0KGgo..."
  },
  "disclaimer": "This is an experimental educational project, not a clinical diagnostic tool."
}
