import logging
from typing import List, Dict, Optional
import ollama
from app.config.settings import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are FixFlow Assistant, an intelligent and polite home maintenance and repair advisor.
Your job is to assist customers, technicians, and company owners with maintenance problems (plumbing, electrical, AC, carpentry, appliances).
Guidelines:
1. Provide practical, clear, step-by-step guidance.
2. Emphasize safety first! Remind users to shut off electrical breakers or water supply when dealing with leaks or electrical risks.
3. Suggest booking a certified FixFlow technician whenever high risk, high voltage, or structural damage is involved.
4. Keep answers friendly, professional, and concise.
"""

def generate_chat_response(messages: List[Dict[str, str]], context: Optional[str] = None) -> str:
    """
    Sends conversation messages to local Ollama 'fixflow' model and returns the response string.
    """
    formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    if context:
        formatted_messages.append({
            "role": "system",
            "content": f"Context regarding the customer's current reported request: {context}"
        })

    for msg in messages:
        formatted_messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

    try:
        response = ollama.chat(
            model=settings.OLLAMA_MODEL_NAME,
            messages=formatted_messages,
            options={
                "num_predict": 250,
                "num_ctx": 2048,
                "num_thread": 4,
                "temperature": 0.7
            },
            keep_alive="30m"
        )
        return response["message"]["content"]
    except Exception as e:
        logger.error(f"Error in Llama chat inference: {e}")
        # Graceful fallback response if local LLM service encounters a temporary timeout
        return "FixFlow Assistant is unavailable right now. You can still request a technician."
