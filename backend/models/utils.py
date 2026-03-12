"""
NodeSight ML Utilities
----------------------
Shared helpers for preprocessing images, converting tensors,
and preparing batches for GPU/CPU inference.
"""

import io
import base64
from PIL import Image
import torch

# ----------------------------
# Image Conversion Utilities
# ----------------------------
def decode_base64_image(b64_data):
    """
    Decode a base64 string into a PIL.Image object.
    """
    try:
        image_bytes = base64.b64decode(b64_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return image
    except Exception as e:
        raise ValueError(f"Failed to decode base64 image: {e}")

def image_to_tensor(image, device="cpu"):
    """
    Convert a PIL.Image to a torch tensor.
    Normalizes pixels to [0,1] and adds batch dimension.
    """
    try:
        tensor = torch.from_numpy(
            (torch.ByteTensor(torch.ByteStorage.from_buffer(image.tobytes()))
             .view(*image.size[::-1], 3)
             .permute(2, 0, 1))
        ).float() / 255.0
        return tensor.unsqueeze(0).to(device)
    except Exception as e:
        raise RuntimeError(f"Failed to convert image to tensor: {e}")

# ----------------------------
# Batch Utilities
# ----------------------------
def batch_images(images, device="cpu"):
    """
    Convert a list of PIL.Images to a single batched torch tensor.
    """
    tensors = [image_to_tensor(img, device=device) for img in images]
    return torch.cat(tensors, dim=0)

# ----------------------------
# GPU Utility
# ----------------------------
def get_device(use_gpu=True):
    """
    Returns 'cuda' if GPU is available and use_gpu=True, else 'cpu'.
    """
    if use_gpu and torch.cuda.is_available():
        return "cuda"
    return "cpu"

# ----------------------------
# Optional: Resize / Normalize
# ----------------------------
def resize_image(image, width=None, height=None):
    """
    Resize PIL.Image while preserving aspect ratio.
    """
    if width is None and height is None:
        return image
    w, h = image.size
    if width and not height:
        ratio = width / float(w)
        height = int(h * ratio)
    elif height and not width:
        ratio = height / float(h)
        width = int(w * ratio)
    return image.resize((width, height), Image.ANTIALIAS)

def normalize_tensor(tensor, mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)):
    """
    Normalize a torch tensor with mean and std (for pretrained models)
    """
    if tensor.ndim == 3:
        tensor = tensor.unsqueeze(0)
    mean_tensor = torch.tensor(mean, device=tensor.device).view(1, 3, 1, 1)
    std_tensor = torch.tensor(std, device=tensor.device).view(1, 3, 1, 1)
    return (tensor - mean_tensor) / std_tensor
