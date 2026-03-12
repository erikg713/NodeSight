"""
Image preprocessing helpers for NodeSight workers
- Decoding base64 images
- Converting to PIL.Image
- Optional resizing/compression
"""

import io
import base64
from PIL import Image

def decode_image(b64_data):
    """
    Decode a base64 image to a PIL.Image object
    """
    try:
        image_bytes = base64.b64decode(b64_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return image
    except Exception as e:
        raise ValueError(f"Failed to decode image: {e}")

def resize_image(image, width=None, height=None):
    """
    Resize PIL.Image while preserving aspect ratio
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
