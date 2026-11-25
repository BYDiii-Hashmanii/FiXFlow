from __future__ import annotations

import logging
from pathlib import Path
from typing import TYPE_CHECKING
from app.config.settings import settings
from app.model_handle.image_model.label_map import validate_label_map

if TYPE_CHECKING:
    from ultralytics import YOLO

logger = logging.getLogger(__name__)

class ImageModelLoader:
    _instance = None
    _model = None

    @classmethod
    def load_model(cls) -> YOLO:
        model_path = Path(settings.YOLO_MODEL_PATH)
        if not model_path.exists():
            raise FileNotFoundError(f"YOLO weights not found at {model_path}")
        from ultralytics import YOLO

        model = YOLO(str(model_path))
        validate_label_map(model.names)
        return model

    @classmethod
    def validate_startup(cls, preload: bool) -> None:
        if preload:
            cls.get_model()
        else:
            cls.load_model()

    @classmethod
    def get_model(cls) -> YOLO:
        if cls._model is None:
            cls._model = cls.load_model()
            logger.info("YOLO model loaded successfully")
        return cls._model

def get_yolo_model() -> YOLO:
    return ImageModelLoader.get_model()
