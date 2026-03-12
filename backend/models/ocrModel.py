"""
NodeSight OCR Model Wrapper
---------------------------
Provides OCR capabilities for extracting text from images.
Compatible with text_worker.py and NodeSight streaming.
"""

import pytesseract
from PIL import Image
import torch

class OCRModel:
    def __init__(self, use_gpu=False):
        """
        Initialize OCR Model.
        use_gpu: bool - future option for GPU-accelerated OCR (if using a GPU-capable OCR engine)
        """
        self.use_gpu = use_gpu
        if use_gpu:
            print("[OCRModel] GPU support enabled (future integration)")
        else:
            print("[OCRModel] Running on CPU")

    def extract_text(self, image):
        """
        Perform OCR on a PIL.Image object.
        Returns the extracted text as a string.
        """
        if not isinstance(image, Image.Image):
            raise ValueError("Input must be a PIL.Image object")
        
        try:
            # Basic Tesseract OCR
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            raise RuntimeError(f"OCR extraction failed: {e}")

    def batch_extract_text(self, images):
        """
        Perform OCR on a list of PIL.Image objects.
        Returns a list of extracted text strings.
        """
        if not isinstance(images, list):
            raise ValueError("Input must be a list of PIL.Image objects")
        
        results = []
        for img in images:
            text = self.extract_text(img)
            results.append(text)
        return results


# ----------------------------
# Singleton instance for workers
# ----------------------------
ocr_model = OCRModel(use_gpu=torch.cuda.is_available())
