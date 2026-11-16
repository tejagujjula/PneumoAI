import logging
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from backend.app.api.schemas import (
    ErrorResponse,
    HealthResponse,
    ImageDimensionsSchema,
    PredictionResponse,
    ProbabilitiesSchema,
    VisualizationsSchema,
)
from backend.app.config import (
    CHECKPOINT_PATH,
    DEVICE,
    GRADCAM_TARGET_LAYER,
    MODEL_ARCHITECTURE,
    PREDICTION_THRESHOLD,
    PROJECT_DISCLAIMER,
)
from backend.app.services.gradcam import compute_gradcam
from backend.app.services.model import ModelService, get_model_service
from backend.app.utils.image import generate_visualizations
from backend.app.utils.validation import validate_uploaded_image

logger = logging.getLogger("pneumoai.routes")

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Backend Health Check",
    description="Returns the health status, active compute device, and model checkpoint status.",
)
async def health_check(
    model_service: ModelService = Depends(get_model_service),
) -> HealthResponse:
    """Verifies that the API and pre-trained model are initialized and ready."""
    return HealthResponse(
        status="healthy",
        model_loaded=model_service.is_loaded,
        checkpoint_path=str(CHECKPOINT_PATH),
        architecture=MODEL_ARCHITECTURE,
        device=str(DEVICE),
        prediction_threshold=PREDICTION_THRESHOLD,
        gradcam_target_layer=GRADCAM_TARGET_LAYER,
        disclaimer=PROJECT_DISCLAIMER,
    )


@router.post(
    "/predict",
    response_model=PredictionResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid image or bad request"},
        413: {"model": ErrorResponse, "description": "Payload exceeds 10 MB limit"},
        500: {"model": ErrorResponse, "description": "Inference failure"},
    },
    summary="Chest X-Ray Pneumonia Prediction & Grad-CAM Analysis",
    description=(
        "Upload a chest X-ray image (JPEG, PNG, WEBP, BMP). Returns predicted class, "
        "probabilities with threshold 0.77 applied, and Grad-CAM PNG visualizations."
    ),
)
async def predict(
    file: UploadFile = File(..., description="Chest X-Ray image file to analyze"),
    model_service: ModelService = Depends(get_model_service),
) -> PredictionResponse:
    """
    1. Validates file size (max 10 MB), format, decoding and dimensions.
    2. Runs pre-trained EfficientNetV2-S inference with exact training preprocessing.
    3. Computes class probabilities and applies decision threshold (0.77 for Pneumonia).
    4. Generates Grad-CAM on features[5] targeting the threshold-predicted class.
    5. Dynamically resizes heatmap to original image resolution for overlay alignment.
    6. Returns original image, heatmap, and overlay as Base64 PNG data URLs.
    """
    # Step 1: Input validation (size limit, Pillow decoding, dimensions)
    _, pil_image = await validate_uploaded_image(file)
    orig_w, orig_h = pil_image.size

    try:
        # Step 2: Preprocessing (Resize 224x224, ToTensor, ImageNet normalization)
        input_tensor = model_service.preprocess_image(pil_image)

        # Step 3: Probabilities & threshold evaluation
        p_normal, p_pneumonia, predicted_label, predicted_class = (
            model_service.predict_probabilities(input_tensor)
        )

        # Step 4: Grad-CAM target class (strictly follows threshold-based prediction)
        target_class = 1 if p_pneumonia >= PREDICTION_THRESHOLD else 0

        # Step 5: Compute Grad-CAM on features[5]
        cam_map = compute_gradcam(
            model=model_service.model,
            input_tensor=input_tensor,
            target_class=target_class,
        )

        # Step 6: Generate Base64 PNG visualizations aligned to original dimensions
        visualizations = generate_visualizations(
            original_pil=pil_image,
            cam_normalized=cam_map,
        )

        return PredictionResponse(
            success=True,
            predicted_class=predicted_class,
            predicted_label=predicted_label,
            threshold_applied=PREDICTION_THRESHOLD,
            probabilities=ProbabilitiesSchema(
                NORMAL=round(p_normal, 4),
                PNEUMONIA=round(p_pneumonia, 4),
            ),
            image_dimensions=ImageDimensionsSchema(
                width=orig_w,
                height=orig_h,
            ),
            visualizations=VisualizationsSchema(**visualizations),
            disclaimer=PROJECT_DISCLAIMER,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Prediction failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(exc)}",
        )
