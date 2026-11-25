from typing import Optional, List
from pydantic import BaseModel
from app.api.schemas.request_schemas import TechnicianInfoSchema
from app.api.schemas.auth_schemas import UserResponse

class JobPartSchema(BaseModel):
    id: str
    name: str
    quantity: int
    unitPrice: float
    total: float

class JobPhotoSchema(BaseModel):
    id: str
    type: str
    url: str

class JobTimelineItem(BaseModel):
    title: str
    time: str
    completed: bool

class JobTimeline(BaseModel):
    acceptedAt: Optional[str] = None
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None

class JobInfoSchema(BaseModel):
    id: str
    requestId: str
    technician: TechnicianInfoSchema
    customer: UserResponse
    status: str
    timeline: JobTimeline
    parts: List[JobPartSchema]
    labourHours: float
    labourCost: float
    totalCost: float
    workNotes: str
    photos: List[JobPhotoSchema] = []

class UpdateWorkRequest(BaseModel):
    workStatusNote: Optional[str] = None
    expectedCompletion: Optional[str] = None
    workNotes: Optional[str] = None
    parts: Optional[List[JobPartSchema]] = []
    labourHours: Optional[float] = 0.0
    hourlyRate: Optional[float] = 1200.0
    labourCost: Optional[float] = 0.0
    totalCost: Optional[float] = 0.0

class DeclineOfferRequest(BaseModel):
    reason: Optional[str] = "busy"
    note: Optional[str] = None
