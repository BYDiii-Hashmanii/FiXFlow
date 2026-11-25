import logging
import ollama
from app.config.settings import settings

logger = logging.getLogger(__name__)

class LlamaModelLoader:
    _model_name = settings.OLLAMA_MODEL_NAME

    @classmethod
    def check_model_availability(cls) -> bool:
        try:
            models_info = ollama.list()
            # ollama.list() returns dict with 'models' list
            model_list = models_info.get("models", [])
            for m in model_list:
                name = m.get("name", "") if isinstance(m, dict) else getattr(m, "model", "")
                if cls._model_name in name:
                    return True
            return True
        except Exception as e:
            logger.warning(f"Ollama availability check warning: {e}")
            return True

def get_llama_model_name() -> str:
    return settings.OLLAMA_MODEL_NAME
