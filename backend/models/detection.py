"""
NodeSight YOLOv8 Detection Worker
- Reads base64 image from stdin
- Runs inference on GPU (if available)
- Returns JSON results
"""

import sys
import base64
import json
import torch
import cv2
import numpy as np
from ultralytics import YOLO

# Load model
MODEL_PATH = "models/yolov8n.pt"  # Can be overridden
USE_GPU = torch.cuda.is_available()

device = "cuda" if USE_GPU else "cpu"
model = YOLO(MODEL_PATH)
model.fuse()  # optional for speed

def decode_image(base64_str):
    """Decode base64 string to OpenCV image"""
    img_data = base64.b64decode(base64_str)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

def run_detection(img):
    """Run YOLOv8 detection and return structured results"""
    results = model.predict(img, device=device, verbose=False)
    output = []

    for r in results:
        boxes = r.boxes
        for box in boxes:
            xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            output.append({
                "bbox": xyxy,
                "confidence": conf,
                "class_id": cls_id
            })
    return output

def main():
    try:
        # Read base64 image from stdin
        b64_input = sys.stdin.read().strip()
        if not b64_input:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)

        img = decode_image(b64_input)
        detections = run_detection(img)

        # Output JSON
        print(json.dumps({"objects": detections}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
