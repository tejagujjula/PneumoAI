import logging
from pathlib import Path
from typing import Tuple
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms

from backend.app.config import (
    CHECKPOINT_PATH,
    CLASS_NAMES,
    DEVICE,
    IMAGENET_MEAN,
    IMAGENET_STD,
    INPUT_SIZE,
    NUM_CLASSES,
    PREDICTION_THRESHOLD,
)

logger = logging.getLogger("pneumoai.model")


class ModelService:
    """
    Manages the pre-trained EfficientNetV2-S model lifecycle, image transformations,
    and forward inference logic.
    """

    def __init__(self, checkpoint_path: Path = CHECKPOINT_PATH, device: torch.device = DEVICE):
        self.checkpoint_path = checkpoint_path
        self.device = device
        self.model: nn.Module | None = None
        self.is_loaded: bool = False

        # Exact preprocessing pipeline matching Colab training
        self.transform = transforms.Compose([
            transforms.Resize(INPUT_SIZE),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ])

        self.load_model()

    def build_architecture(self) -> nn.Module:
        """Constructs EfficientNetV2-S with modified classification head (1280 -> 2)."""
        model = models.efficientnet_v2_s(weights=None)
        # EfficientNet classifier has Dropout(0.2) at [0] and Linear(1280, 1000) at [1]
        in_features = model.classifier[1].in_features  # 1280
        model.classifier[1] = nn.Linear(in_features, NUM_CLASSES)
        return model

    def load_model(self) -> None:
        """Loads weights from the trained checkpoint dictionary onto target device."""
        if not self.checkpoint_path.is_file():
            raise FileNotFoundError(
                f"Checkpoint not found at '{self.checkpoint_path}'. "
                f"Please ensure 'efficientnetv2_s_best.pth' is located in the project root."
            )

        logger.info("Initializing EfficientNetV2-S architecture...")
        model = self.build_architecture()

        logger.info(f"Loading checkpoint from: {self.checkpoint_path} onto {self.device}...")
        checkpoint = torch.load(str(self.checkpoint_path), map_location=self.device)

        # Extract model_state_dict from checkpoint dictionary
        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        elif isinstance(checkpoint, dict) and any("classifier" in k for k in checkpoint.keys()):
            state_dict = checkpoint
        else:
            raise ValueError(
                f"Invalid checkpoint format. Keys found: {list(checkpoint.keys()) if isinstance(checkpoint, dict) else type(checkpoint)}"
            )

        # Strip potential 'module.' prefix if trained with DataParallel
        cleaned_state_dict = {}
        for k, v in state_dict.items():
            clean_key = k[7:] if k.startswith("module.") else k
            cleaned_state_dict[clean_key] = v

        load_result = model.load_state_dict(cleaned_state_dict, strict=True)
        logger.info(f"Checkpoint loaded successfully: {load_result}")

        model.to(self.device)
        model.eval()

        self.model = model
        self.is_loaded = True

    def preprocess_image(self, pil_image: Image.Image) -> torch.Tensor:
        """
        Ensures 3-channel RGB format and applies Resize(224, 224), ToTensor(),
        and ImageNet normalization. Returns (1, 3, 224, 224) tensor on DEVICE.
        """
        # Convert any grayscale or RGBA X-ray to 3-channel RGB
        rgb_image = pil_image.convert("RGB")
        tensor = self.transform(rgb_image)
        return tensor.unsqueeze(0).to(self.device)

    def predict_probabilities(self, input_tensor: torch.Tensor) -> Tuple[float, float, int, str]:
        """
        Computes model logits and softmax probabilities.
        Applies prediction threshold of 0.77:
            predicted_label = 1 if p_pneumonia >= 0.77 else 0

        Returns:
            Tuple[float, float, int, str]: (p_normal, p_pneumonia, predicted_label, predicted_class)
        """
        if self.model is None or not self.is_loaded:
            raise RuntimeError("Model is not loaded. Cannot run inference.")

        with torch.no_grad():
            logits = self.model(input_tensor)
            probs = torch.softmax(logits, dim=1)[0]
            p_normal = float(probs[0].item())
            p_pneumonia = float(probs[1].item())

        # Apply user-specified 0.77 threshold
        is_pneumonia = p_pneumonia >= PREDICTION_THRESHOLD
        predicted_label = 1 if is_pneumonia else 0
        predicted_class = CLASS_NAMES[predicted_label]

        return p_normal, p_pneumonia, predicted_label, predicted_class


# Singleton instance
_model_service_instance: ModelService | None = None


def get_model_service() -> ModelService:
    """Returns the singleton ModelService instance."""
    global _model_service_instance
    if _model_service_instance is None:
        _model_service_instance = ModelService()
    return _model_service_instance
