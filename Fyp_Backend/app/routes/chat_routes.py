import logging

from fastapi import APIRouter, Depends, Request

from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.notification_schemas import ChatRequest
from app.config.settings import settings
from app.controllers.chat_controller import ChatController
from app.database.models import User
from app.middlewares.auth_middleware import get_current_user
from app.model_handle.inference import chat_inference
from app.routes.auth_routes import limit_attempts

router = APIRouter(tags=["AI Chatbot"])
logger = logging.getLogger(__name__)


@router.post("/ai/chat", response_model=ApiResponse[dict])
@router.post("/chat", response_model=ApiResponse[dict])
async def chat(payload: ChatRequest, request: Request, user: User = Depends(get_current_user)):
    limit_attempts(request, str(user.id), "chat")
    messages = [item.model_dump() for item in payload.messages]
    try:
        reply = await chat_inference.run(
            ChatController.handle_chat, messages, payload.context, timeout=settings.CHAT_TIMEOUT_SECONDS,
        )
    except Exception:
        logger.warning("Chat inference unavailable", exc_info=True)
        reply = "FixFlow Assistant is unavailable right now. You can still request a technician."
    return ApiResponse.wrap({"reply": reply, "message": reply})
