# ROLE AND OBJECTIVE

Act as an experienced academic technical writer, machine learning researcher, and LaTeX report developer.

I am developing an academic project titled:

**"PneumoAI: Pneumonia Detection in Chest X-ray Images Using EfficientNetV2-S and Grad-CAM"**

Your task is to thoroughly understand the project, its implementation, experiments, results, architecture, and workflow, and then generate a complete, professional, university-level project report in LaTeX.

This is an implemented working project, not merely a theoretical proposal. The report must accurately describe what has actually been developed and tested.

IMPORTANT:
- First understand the entire project.
- If I provide source code, notebooks, screenshots, README, or other files, inspect them carefully.
- Use the project details provided below as initial context.
- Treat the actual implementation and experimental results as the primary source of truth.
- Never invent experimental results, references, algorithms, or implementation details.
- If information is missing, use clearly marked placeholders rather than fabricating it.

---

# 1. PROJECT OVERVIEW

PneumoAI is a deep-learning-based web application designed to identify possible pneumonia cases from chest X-ray images.

The system accepts a chest X-ray image uploaded by the user, processes it, and uses a trained EfficientNetV2-S deep learning model to classify it into one of two categories:

1. NORMAL
2. PNEUMONIA

Along with the prediction, the application displays a model-estimated probability and a Grad-CAM visualization.

Grad-CAM helps users understand which image regions influenced the model's prediction.

The project combines:
- Deep Learning
- Computer Vision
- Transfer Learning
- Explainable Artificial Intelligence (XAI)
- FastAPI
- React.js
- Grad-CAM visualization

The main objective is to develop a functional, interpretable, and user-friendly pneumonia classification demonstration system.

Do not describe it as a clinically approved diagnostic system.

---

# 2. DATASET

The project uses the publicly available:

**Chest X-Ray Images (Pneumonia) Dataset**

The dataset contains two categories:
- NORMAL
- PNEUMONIA

The dataset is organized into:
- Training set
- Validation set
- Testing set

The images are processed before being passed to the deep learning models.

Explain:
- What chest X-ray images represent.
- Why image preprocessing is necessary.
- How training, validation, and testing datasets are used.
- Why the two-class classification problem is appropriate for this project.

Do not invent dataset statistics. Extract exact image counts and preprocessing parameters from the supplied notebook or source files if available.

---

# 3. MODEL DEVELOPMENT AND EXPERIMENTS

The project involved multiple CNN architectures and ensemble approaches before selecting EfficientNetV2-S as the final model.

## 3.1 Individual CNN Models

The following pretrained models were evaluated:

| Model | Accuracy | Sensitivity | Specificity | ROC-AUC |
|---|---:|---:|---:|---:|
| GoogLeNet | 81.73% | 100% | 51.28% | 94.14% |
| ResNet18 | 81.89% | 100% | 51.71% | 95.46% |
| DenseNet121 | 77.56% | 100% | 40.17% | 90.32% |

Explain the general architecture and working principles of these models and why transfer learning is useful.

## 3.2 Ensemble Learning

Three CNN models were combined using four ensemble strategies:

1. Simple Average
2. Maximum Probability
3. Metric Weighted
4. Majority Voting

Results:

| Ensemble Method | Accuracy | Sensitivity | Specificity | ROC-AUC |
|---|---:|---:|---:|---:|
| Simple Average | 76.44% | 100% | 37.18% | 93.03% |
| Maximum Probability | 78.21% | 100% | 41.88% | 90.98% |
| Metric Weighted | 76.92% | 100% | 38.46% | 93.12% |
| Majority Voting | 76.60% | 100% | 37.61% | Not calculated |

The metric-weighted ensemble used:
- GoogLeNet: 0.3118
- ResNet18: 0.3440
- DenseNet121: 0.3441

At a threshold of 0.77, the metric-weighted ensemble achieved:
- Accuracy: 83.33%
- Sensitivity: 100%
- Specificity: 55.56%
- ROC-AUC: 93.12%

Explain how ensemble learning combines predictions from multiple models and why different ensemble methods may produce different results.

## 3.3 Class-Weighted ResNet18

An additional ResNet18 experiment used class-weighted cross-entropy loss.

Class weights:
- NORMAL: 1.9157
- PNEUMONIA: 0.6766

Results:
- Accuracy: 83.81%
- Sensitivity: 99.74%
- Specificity: 57.26%
- ROC-AUC: 93.24%

Explain why class weighting can help address class imbalance.

## 3.4 Final Model: EfficientNetV2-S

The final selected architecture is EfficientNetV2-S with pretrained ImageNet weights.

Implementation:
- Architecture: EfficientNetV2-S
- Pretrained weights: EfficientNet_V2_S_Weights.DEFAULT
- Final classifier: 1280 input features to 2 output classes
- Loss function: Weighted CrossEntropyLoss
- Optimizer: Adam
- Learning rate: 0.0001
- Early stopping patience: 5 epochs
- Best checkpoint: Epoch 3
- Best validation loss: 0.0382
- Training stopped early at Epoch 8.

Explain:
- EfficientNetV2 architecture.
- Transfer learning.
- Feature extraction.
- Classification head modification.
- Weighted cross-entropy loss.
- Adam optimization.
- Early stopping and checkpoint selection.

Do not claim that the model was trained from scratch.

---

# 4. FINAL MODEL EVALUATION

At the default classification threshold of 0.50, EfficientNetV2-S achieved:

| Metric | Value |
|---|---:|
| Accuracy | 85.58% |
| Precision | 81.65% |
| Recall / Sensitivity | 99.23% |
| F1-score | 89.58% |
| Specificity | 62.82% |
| ROC-AUC | 96.64% |

Confusion matrix:

[[147, 87],
 [3, 387]]

A second threshold selection experiment was conducted.

The threshold 0.77 was selected using validation data to maximize specificity while maintaining sensitivity of at least 98%.

At threshold 0.77, validation results were:
- Sensitivity: 98.21%
- Specificity: 98.94%

On the held-out test set, threshold 0.77 achieved:

| Metric | Value |
|---|---:|
| Accuracy | 87.98% |
| Precision | 84.46% |
| Sensitivity / Recall | 98.97% |
| F1-score | 91.15% |
| Specificity | 69.66% |
| ROC-AUC | 96.64% |

Confusion matrix:

[[163, 71],
 [4, 386]]

Explain:
- Accuracy
- Precision
- Recall / Sensitivity
- Specificity
- F1-score
- ROC curve
- AUC
- Confusion matrix
- Classification threshold selection

Explain why sensitivity and specificity are both important in medical image classification.

IMPORTANT:
The threshold of 0.77 was selected using validation data. Do not claim it guarantees a particular sensitivity on unseen data.

Also, call the output a "model-estimated probability". Do not claim that the probability is clinically calibrated.

---

# 5. EXPLAINABLE AI USING GRAD-CAM

The project integrates Gradient-weighted Class Activation Mapping (Grad-CAM).

The selected target layer is:

EfficientNetV2-S features[5]

Different feature layers (features[3], features[5], and features[7]) were compared, and features[5] was selected.

Grad-CAM generates:
1. Original X-ray image
2. Heatmap
3. Overlay combining the heatmap and original X-ray

A small qualitative validation experiment was conducted using:
- 5 NORMAL images
- 5 PNEUMONIA images

All 10 images in this particular sample were classified correctly.

Explain:
- Why deep learning models are often considered black boxes.
- The motivation for explainable AI.
- How gradients are calculated with respect to feature maps.
- How channel importance weights are obtained.
- How the weighted feature maps generate a heatmap.
- How the heatmap is overlaid on the original image.
- Why Grad-CAM improves model interpretability.

IMPORTANT:
Grad-CAM visualizations indicate image regions influencing the model. They do not prove the presence of medically confirmed pneumonia lesions or provide clinically validated localization.

---

# 6. BACKEND IMPLEMENTATION

The backend is implemented using Python and FastAPI.

Project structure includes:

backend/
  run.py
  verify_pipeline.py
  live_server_test.py
  app/
    main.py
    config.py
    api/
      routes.py
      schemas.py
    services/
      model.py
      gradcam.py
    utils/
      image.py
      validation.py

Explain the responsibilities of these modules.

Main functionality:
- Accept uploaded chest X-ray images.
- Validate uploaded files.
- Decode and preprocess images.
- Load the trained EfficientNetV2-S checkpoint.
- Generate predictions.
- Calculate model-estimated probabilities.
- Generate Grad-CAM visualizations.
- Return prediction results and image visualizations through API responses.

The backend exposes prediction and health endpoints.

The project was tested locally using FastAPI and Swagger UI.

Mention that the model is loaded once rather than reloaded for every prediction if confirmed by the implementation.

Explain the role of REST APIs and why FastAPI was selected.

---

# 7. FRONTEND IMPLEMENTATION

The frontend uses:
- React.js
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide React

Main components include:

- App.jsx
- Navbar.jsx
- Hero.jsx
- ImageUpload.jsx
- ResultsSection.jsx
- GradCamVisualizer.jsx
- HowItWorks.jsx
- ModelPerformance.jsx
- AboutTech.jsx
- Footer.jsx

Explain the responsibility of each major component.

The frontend provides:
- Project introduction.
- Image upload interface.
- Prediction display.
- Class and probability presentation.
- Grad-CAM visualization.
- Model performance information.
- Technical explanation of the system.

Explain how Axios connects the React frontend to the FastAPI backend.

---

# 8. COMPLETE SYSTEM WORKFLOW

Describe the entire project as a sequential pipeline:

Step 1: User opens the PneumoAI web application.

Step 2: User uploads a chest X-ray image.

Step 3: React frontend sends the image to the FastAPI backend using an API request.

Step 4: Backend validates and decodes the image.

Step 5: Image preprocessing transforms it into the expected model input format.

Step 6: EfficientNetV2-S performs inference.

Step 7: The model generates class scores and model-estimated probabilities.

Step 8: The selected threshold of 0.77 is applied to determine the predicted class.

Step 9: Grad-CAM generates a heatmap based on the model's gradients and feature activations.

Step 10: The backend returns the prediction and visualization data.

Step 11: React displays the result, probability, original image, heatmap, and overlay.

Include a clear architecture diagram using TikZ or another LaTeX-compatible approach.

---

# 9. TESTING AND VALIDATION

The backend was tested locally.

Tests included:
- Root endpoint.
- Health endpoint.
- Prediction endpoint.
- Valid image uploads.
- Invalid file uploads.
- Oversized image uploads.
- Grad-CAM output generation.
- PNG visualization validity.

The upload size limit is 10 MB.

A demonstration experiment was also conducted using 10 test images:
- 5 NORMAL
- 5 PNEUMONIA

Observed results:
- 9 out of 10 classifications were correct.
- One NORMAL image was incorrectly classified as PNEUMONIA.
- All five PNEUMONIA examples were classified correctly.
- Four of five NORMAL examples were classified correctly.

This is only a small demonstration sample. Do not present 90% as the overall model accuracy.

Explain the distinction between software testing, model evaluation, and this small demonstration experiment.

---

# 10. TECHNOLOGY STACK

Include a table explaining the technologies:

| Technology | Purpose |
|---|---|
| Python | Machine learning and backend development |
| PyTorch | Deep learning framework |
| Torchvision | Pretrained model architectures and image transforms |
| EfficientNetV2-S | Final image classification model |
| Grad-CAM | Explainable AI visualization |
| FastAPI | Backend REST API |
| React.js | Frontend |
| Vite | Frontend build tooling |
| Tailwind CSS | UI styling |
| Axios | Frontend-backend communication |
| Recharts | Performance visualization |
| Pillow / OpenCV | Image processing |

Verify exact dependencies from requirements.txt and package.json.

---

# 11. LIMITATIONS AND FUTURE ENHANCEMENTS

Discuss realistic limitations:

- The model uses a two-class classification setup.
- Performance depends on the training dataset and image distribution.
- False positive and false negative predictions are possible.
- Grad-CAM does not provide clinically validated lesion localization.
- Model-estimated probabilities should not be interpreted as calibrated medical confidence.
- The system has not been clinically validated.
- Cloud deployment has not been completed; the application currently runs locally.

Possible future improvements:
- Evaluation on external datasets.
- Improved generalization.
- Probability calibration.
- More advanced explainability methods.
- Larger and more diverse datasets.
- Model optimization.
- Secure and scalable deployment.
- Integration with clinical workflows only after appropriate validation and regulatory review.

---

# 12. REPORT STRUCTURE

Generate a complete academic report with the following chapters:

1. Title Page
2. Certificate (placeholder)
3. Declaration (placeholder)
4. Acknowledgement
5. Abstract
6. Table of Contents
7. List of Figures
8. List of Tables
9. Chapter 1 – Introduction
10. Chapter 2 – Literature Review
11. Chapter 3 – Problem Statement and Objectives
12. Chapter 4 – Dataset and Preprocessing
13. Chapter 5 – Methodology and Model Development
14. Chapter 6 – System Architecture and Implementation
15. Chapter 7 – Experimental Results and Evaluation
16. Chapter 8 – Explainable AI Using Grad-CAM
17. Chapter 9 – Testing and Validation
18. Chapter 10 – Limitations and Future Scope
19. Chapter 11 – Conclusion
20. References
21. Appendix

The literature review must use genuine, verifiable academic references. Do not fabricate citations or DOI numbers. If you cannot verify a reference, clearly mark it for verification.

---

# 13. LATEX REQUIREMENTS

Generate a complete, compilable LaTeX project report.

Requirements:
- Use a professional university-project-report format.
- Use A4 paper.
- Use 12-point font.
- Use suitable margins and line spacing.
- Use numbered chapters, sections, equations, figures, and tables.
- Include a table of contents.
- Include list of figures and tables.
- Use a consistent academic writing style.
- Use proper citations and bibliography.
- Use booktabs for professional tables.
- Use graphicx for figures.
- Use hyperref for hyperlinks.
- Use TikZ for the architecture diagram where suitable.
- Include placeholders for screenshots, confusion matrices, ROC curves, Grad-CAM images, and application screenshots.
- Ensure all LaTeX environments are properly closed.
- Avoid undefined commands and missing packages.
- Ensure the final document compiles with standard Overleaf pdfLaTeX.

Do not use fake image paths as if images already exist. Use clearly named placeholders and explain which screenshots I should insert.

---

# 14. FINAL OUTPUT

Return:

1. A complete main.tex file.
2. Any additional .tex files if the report is split into chapters.
3. A references.bib file.
4. A clear directory structure for the LaTeX project.
5. Instructions for compiling the report in Overleaf.

Before generating the final LaTeX:
- Review the provided project files.
- Check consistency of all reported metrics.
- Ensure the threshold 0.77 results are not mixed with threshold 0.50 results.
- Ensure the demonstration accuracy is not confused with test accuracy.
- Ensure the model is described as a research/academic demonstration, not a clinical diagnostic product.

The final report should be detailed, technically accurate, academically written, and sufficiently comprehensive for a university final-year project submission.
