import logging
from pathlib import Path
from ultralytics import YOLO
from app.config.settings import settings

logger = logging.getLogger(__name__)

class ImageModelLoader:
    _instance = None
    _model = None

    @classmethod
    def get_model(cls) -> YOLO:
        if cls._model is None:
            model_path = Path(settings.YOLO_MODEL_PATH)
            if not model_path.exists():
                logger.error(f"YOLO weights not found at: {model_path}")
                raise FileNotFoundError(f"YOLO weights not found at {model_path}")
            logger.info(f"Loading YOLO model from {model_path}...")
            cls._model = YOLO(str(model_path))
            logger.info("YOLO model loaded successfully!")
        return cls._model

def get_yolo_model() -> YOLO:
    return ImageModelLoader.get_model()
