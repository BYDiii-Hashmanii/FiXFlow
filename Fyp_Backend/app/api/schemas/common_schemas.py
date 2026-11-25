from typing import Generic, TypeVar, Optional, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    @classmethod
    def wrap(cls, data: Any, message: Optional[str] = None):
        return cls(success=True, data=data, message=message)

    @classmethod
    def error(cls, message: str, data: Any = None):
        return cls(success=False, data=data, message=message)
