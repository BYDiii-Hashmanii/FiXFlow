from typing import Annotated, Literal, Optional
from pydantic import BaseModel, Field, StringConstraints

class AppNotificationSchema(BaseModel):
    id: str
    userId: str
    title: str
    message: str
    type: str
    read: bool
    createdAt: str
    link: Optional[str] = None

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: Annotated[str, StringConstraints(min_length=1, max_length=2000)]

class ChatRequest(BaseModel):
    messages: Annotated[list[ChatMessage], Field(min_length=1, max_length=20)]
    context: Annotated[str, StringConstraints(max_length=2000)] | None = None

class ChatResponse(BaseModel):
    reply: str
