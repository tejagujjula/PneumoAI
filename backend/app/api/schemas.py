from typing import Dict, Optional
from pydantic import BaseModel, Field


class ProbabilitiesSchema(BaseModel):
    NORMAL: float = Field(..., description="Probability of Normal chest X-ray [0.0 - 1.0]")
    PNEUMONIA: float = Field(..., description="Probability of Pneumonia [0.0 - 1.0]")


class ImageDimensionsSchema(BaseModel):
    width: int = Field(..., description="Original image width in pixels")
    height: int = Field(..., description="Original image height in pixels")


class VisualizationsSchema(BaseModel):
    original: str = Field(..., description="Base64 PNG data URL of original chest X-ray")
    heatmap: str = Field(..., description="Base64 PNG data URL of Grad-CAM jet heatmap")
    overlay: str = Field(..., description="Base64 PNG data URL of blended overlay on original X-ray")


class PredictionResponse(BaseModel):
    success: bool = Field(True, description="Whether the prediction succeeded")
    predicted_class: str = Field(..., description="Classification result ('NORMAL' or 'PNEUMONIA')")
    predicted_label: int = Field(..., description="Numeric class label (0 for NORMAL, 1 for PNEUMONIA)")
    threshold_applied: float = Field(..., description="Threshold applied to Pneumonia probability")
    probabilities: ProbabilitiesSchema = Field(..., description="Softmax probabilities for each class")
    image_dimensions: ImageDimensionsSchema = Field(..., description="Dimensions of the evaluated image")
    visualizations: VisualizationsSchema = Field(..., description="Generated PNG visualizations in Base64")
    disclaimer: str = Field(..., description="Educational project disclaimer")


class HealthResponse(BaseModel):
    status: str = Field("healthy", description="API health status")
    model_loaded: bool = Field(..., description="Whether model weights are loaded and active")
    checkpoint_path: str = Field(..., description="Path to checkpoint file used")
    architecture: str = Field(..., description="Backbone model architecture")
    device: str = Field(..., description="Compute device currently used (cuda/cpu)")
    prediction_threshold: float = Field(..., description="Configured pneumonia threshold")
    gradcam_target_layer: str = Field(..., description="Target layer hooked for Grad-CAM")
    disclaimer: str = Field(..., description="Educational project disclaimer")


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="Failure status flag")
    detail: str = Field(..., description="Human-readable error explanation")
    error_code: Optional[str] = Field(None, description="Categorical error code")
