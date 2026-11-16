import logging
import numpy as np
import torch
import torch.nn as nn

logger = logging.getLogger("pneumoai.gradcam")


def compute_gradcam(
    model: nn.Module,
    input_tensor: torch.Tensor,
    target_class: int,
) -> np.ndarray:
    """
    Computes Grad-CAM for the given target class using model.features[5].

    Request-Safety & Hook Cleanup:
    - Forward and backward hooks are dynamically registered.
    - Activations and gradients are stored in local scoped containers per request.
    - A 'finally' block ensures hook removal occurs even if an exception is raised,
      preventing memory leaks or stale hook accumulation.

    Target Class Policy:
    - Target class follows the threshold-based predicted label:
      target_class = 1 (PNEUMONIA) if pneumonia_probability >= 0.77 else 0 (NORMAL).

    Args:
        model: Evaluated PyTorch model.
        input_tensor: Preprocessed tensor of shape (1, 3, 224, 224).
        target_class: Class index (0 for NORMAL, 1 for PNEUMONIA).

    Returns:
        np.ndarray: 2D numpy array of shape (H, W) normalized to [0.0, 1.0].
    """
    target_layer = model.features[5]

    activations: list[torch.Tensor] = []
    gradients: list[torch.Tensor] = []

    def forward_hook(module: nn.Module, inp: tuple, output: torch.Tensor):
        activations.append(output)
        output.register_hook(lambda grad: gradients.append(grad))

    # Register forward hook on features[5]
    hook_handle = target_layer.register_forward_hook(forward_hook)

    try:
        # Enable gradients explicitly for the Grad-CAM backward step
        with torch.enable_grad():
            tensor_input = input_tensor.detach().clone().requires_grad_(True)
            logits = model(tensor_input)

            # Isolate score for the threshold-determined target class
            target_score = logits[0, target_class]

            model.zero_grad()
            target_score.backward(retain_graph=False)

        if not activations or not gradients:
            raise RuntimeError("Failed to capture feature activations or gradients for Grad-CAM.")

        act = activations[0].detach()  # Shape: (1, 160, 14, 14)
        grad = gradients[0].detach()   # Shape: (1, 160, 14, 14)

        # Global average pooling of gradients across spatial dimensions (dim=(2, 3))
        alpha = torch.mean(grad, dim=(2, 3), keepdim=True)  # Shape: (1, 160, 1, 1)

        # Weighted combination of activation channels
        cam = torch.sum(alpha * act, dim=1, keepdim=True)   # Shape: (1, 1, 14, 14)

        # Apply ReLU to retain only positive evidence for the class
        cam = torch.relu(cam)
        cam_np = cam.squeeze().cpu().numpy()                # Shape: (14, 14)

        # Min-Max normalization to [0.0, 1.0]
        cam_min = float(cam_np.min())
        cam_max = float(cam_np.max())

        if cam_max - cam_min > 1e-8:
            cam_normalized = (cam_np - cam_min) / (cam_max - cam_min)
        else:
            cam_normalized = np.zeros_like(cam_np, dtype=np.float32)

        return cam_normalized.astype(np.float32)

    finally:
        # Ensure hook handle is always safely removed
        hook_handle.remove()
        model.zero_grad()
