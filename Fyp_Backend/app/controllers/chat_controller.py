from typing import List, Dict, Optional
from app.model_handle.llama_model.chatbot import generate_chat_response

class ChatController:
    @staticmethod
    def handle_chat(messages: List[Dict[str, str]], context: Optional[str] = None) -> str:
        return generate_chat_response(messages, context)
