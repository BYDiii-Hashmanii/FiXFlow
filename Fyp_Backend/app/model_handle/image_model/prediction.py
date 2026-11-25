import io
from pathlib import Path

from PIL import Image

from app.model_handle.image_model.model_loader import get_yolo_model


def predict_image(image_path_or_bytes) -> dict:
    model = get_yolo_model()
    if isinstance(image_path_or_bytes, (str, Path)):
        with Image.open(image_path_or_bytes) as image:
            img = image.convert("RGB")
    elif isinstance(image_path_or_bytes, bytes):
        with Image.open(io.BytesIO(image_path_or_bytes)) as image:
            img = image.convert("RGB")
    else:
        img = image_path_or_bytes.convert("RGB")

    results = model.predict(img, conf=0.25)
    detections = []
    if results:
        for box in results[0].boxes:
            class_id = int(box.cls[0])
            detections.append({
                "class_id": class_id,
                "class_name": model.names[class_id],
                "confidence": float(box.conf[0]),
                "box": [float(coord) for coord in box.xyxy[0].tolist()],
            })
    top = max(detections, key=lambda detection: detection["confidence"], default=None)
    return {
        "detected_count": len(detections),
        "detections": detections,
        "primary_issue": top["class_name"] if top else None,
        "confidence": top["confidence"] if top else None,
    }
