# PneumoAI – Pneumonia Detection from Chest X-Ray Images

## 1. Project Overview

PneumoAI is an educational deep learning project that performs binary classification of chest X-ray images into two categories:

- **NORMAL**
- **PNEUMONIA**

The project uses a pretrained EfficientNetV2-S model fine-tuned for pneumonia classification. It also integrates Grad-CAM (Gradient-weighted Class Activation Mapping) to generate visual heatmaps that help illustrate which image regions influenced the model's prediction.

### Key Features

- Deep learning-based chest X-ray classification.
- EfficientNetV2-S pretrained architecture.
- Transfer learning for binary classification.
- Grad-CAM-based visual explanations.
- Interactive web application built with React.
- Python backend built with FastAPI.
- CPU and CUDA-compatible model inference.

### Educational Disclaimer

This is an experimental educational project, not a clinical diagnostic tool. It is intended for academic demonstration and machine learning interpretability studies. It must not be used for medical diagnosis, clinical treatment planning, or healthcare decision-making.

---

## 2. Model Architecture

| Parameter | Specification |
|---|---|
| Model | EfficientNetV2-S |
| Architecture | Pretrained CNN with transfer learning |
| Input dimensions | 224 × 224 × 3 |
| Input format | RGB |
| Number of classes | 2 |
| Class 0 | NORMAL |
| Class 1 | PNEUMONIA |
| Classification threshold | 0.77 |
| Grad-CAM target layer | `features[5]` |
| Framework | PyTorch |

The model uses ImageNet normalization:

- Mean: `[0.485, 0.456, 0.406]`
- Standard deviation: `[0.229, 0.224, 0.225]`

The final classification threshold of 0.77 was selected using validation data to maximize specificity while maintaining sensitivity of at least 98%.

Grad-CAM provides exploratory visual explanations. Its heatmaps do not represent clinically validated anatomical localization.

---

## 3. Experimental Results

### Validation Results

At the selected threshold of 0.77:

| Metric | Value |
|---|---:|
| Sensitivity | 98.21% |
| Specificity | 98.94% |
| Best validation loss | 0.0382 |

### Held-Out Test Results

| Metric | Value |
|---|---:|
| Accuracy | 87.98% |
| Precision | 84.46% |
| Sensitivity / Recall | 98.97% |
| Specificity | 69.66% |
| F1-score | 91.15% |
| ROC-AUC | 96.64% |

The best model checkpoint was obtained at epoch 3. Early stopping terminated training at epoch 8.

These results represent experimental performance on the project's dataset and should not be interpreted as evidence of clinical effectiveness.

---

## 4. Project Folder Structure

```text
PneumoAI/
│
├── efficientnetv2_s_best.pth
├── README.md
├── requirements.txt
│
├── backend/
│   ├── run.py
│   ├── verify_pipeline.py
│   ├── live_server_test.py
│   │
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       │
│       ├── api/
│       │   ├── __init__.py
│       │   ├── routes.py
│       │   └── schemas.py
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── model.py
│       │   └── gradcam.py
│       │
│       └── utils/
│           ├── __init__.py
│           ├── image.py
│           └── validation.py
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    │
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx
        │
        ├── services/
        │   └── api.js
        │
        └── components/
            ├── Navbar.jsx
            ├── Hero.jsx
            ├── ImageUpload.jsx
            ├── ResultsSection.jsx
            ├── GradCamVisualizer.jsx
            ├── HowItWorks.jsx
            ├── ModelPerformance.jsx
            ├── AboutTech.jsx
            └── Footer.jsx
```

---

## 5. Prerequisites

Ensure the following software is installed:

| Software | Recommended Version |
|---|---|
| Python | 3.10–3.12 |
| Node.js | 18 or later |
| npm | Compatible with installed Node.js |
| Git | Latest stable version |
| Operating System | Windows, Linux, or macOS |

A CUDA-compatible GPU is optional. The model can also run using the CPU.

---

## 6. Installation and Setup

### Step 1: Obtain the Project

Clone the repository:

```bash
git clone https://github.com/tejagujjula/PneumoAI.git
```

Navigate into the project directory:

```bash
cd PneumoAI
```

### Step 2: Set Up the Python Environment

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

On Linux or macOS:

```bash
source .venv/bin/activate
```

### Step 3: Install Python Dependencies

Install the required backend libraries:

```bash
pip install -r requirements.txt
```

The dependency list includes the libraries required for deep learning, image processing, model inference, and backend execution.

### Step 4: Install Frontend Dependencies

Navigate to the frontend directory:

```bash
cd frontend
```

Install the required packages:

```bash
npm install
```

Return to the project root:

```bash
cd ..
```

---

## 7. Model Checkpoint Setup

The trained model weights are stored in:

```text
efficientnetv2_s_best.pth
```

Place the checkpoint in the root project directory, alongside `README.md` and `requirements.txt`.

The expected location is:

```text
PneumoAI/
├── efficientnetv2_s_best.pth
├── README.md
└── requirements.txt
```

The application loads these pretrained weights during initialization. Model training is not required to run the packaged application.

---

## 8. Dataset Download and Placement

The project uses the publicly available **Chest X-Ray Images (Pneumonia) Dataset**.

The dataset can be obtained from:

[Chest X-Ray Images (Pneumonia) – Kaggle](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia)

The dataset contains the following categories:

- NORMAL
- PNEUMONIA

It is organized into training, validation, and testing subsets.

A typical dataset layout is:

```text
dataset/
└── chest_xray/
    ├── train/
    │   ├── NORMAL/
    │   └── PNEUMONIA/
    │
    ├── val/
    │   ├── NORMAL/
    │   └── PNEUMONIA/
    │
    └── test/
        ├── NORMAL/
        └── PNEUMONIA/
```

Extract the downloaded dataset while preserving this directory structure.

**Note:** The dataset is not required for normal inference using the supplied trained checkpoint. It is required when performing dataset-based training or evaluation.

---

## 9. Training, Testing, and Execution

### Model Training

The final EfficientNetV2-S checkpoint was produced through a model training and evaluation workflow using the Chest X-Ray Images (Pneumonia) dataset.

The current application package contains the trained checkpoint and inference implementation. It does not contain the original training notebook or a standalone training script.

Therefore, model retraining is not directly available through a command in this package. The original training notebook must be provided separately to reproduce the training experiments.

### Backend Testing

From the project root, run:

```bash
python backend/verify_pipeline.py
```

For live server and endpoint verification, run:

```bash
python backend/live_server_test.py
```

### Running the Backend

Open a terminal at the project root and execute:

```bash
python backend/run.py
```

Keep this terminal running.

### Running the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Start the development server:

```bash
npm run dev
```

Open the local address displayed by Vite in your web browser.

The application is now ready for local demonstration.

---

## 10. Application Workflow

1. Open the PneumoAI web application.
2. Upload a chest X-ray image.
3. The image is validated and preprocessed.
4. EfficientNetV2-S performs image classification.
5. The model generates probabilities for the NORMAL and PNEUMONIA classes.
6. The selected classification threshold is applied.
7. Grad-CAM generates a heatmap representing influential feature regions.
8. The application displays the predicted class and visualizations.

---

## 11. Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend and machine learning implementation |
| PyTorch | Deep learning framework |
| Torchvision | Pretrained CNN architecture and image transformations |
| EfficientNetV2-S | Pneumonia classification |
| Grad-CAM | Model interpretability |
| FastAPI | Backend application |
| React.js | Frontend development |
| Vite | Frontend development and build tool |
| Tailwind CSS | User interface styling |
| Axios | Backend communication |
| Recharts | Performance visualization |
| Pillow / OpenCV | Image processing |

---

## 12. Limitations and Future Scope

### Limitations

- The model performs binary classification only.
- The model does not distinguish bacterial and viral pneumonia.
- Predictions may contain false positives and false negatives.
- Performance may vary on images from different sources.
- Grad-CAM is an exploratory visualization method, not a clinically validated localization technique.
- The project has not undergone clinical validation.

### Future Enhancements

- Evaluate the model on larger and more diverse external datasets.
- Improve generalization across different X-ray sources.
- Explore probability calibration.
- Investigate additional explainability techniques.
- Optimize inference speed and resource usage.
- Explore secure deployment and integration after appropriate validation.

---

## 13. Authors and Academic Use

This project was developed as an academic demonstration of deep learning, medical image classification, and explainable artificial intelligence.

**Project Title:** PneumoAI – Pneumonia Detection from Chest X-Ray Images

**Model:** EfficientNetV2-S with Grad-CAM

**Repository:** https://github.com/tejagujjula/PneumoAI

---

## Disclaimer

PneumoAI is an experimental educational project. It is not intended for medical diagnosis, treatment recommendations, or clinical decision-making. All predictions and visualizations are generated by a machine learning model and must not be considered medical advice.
