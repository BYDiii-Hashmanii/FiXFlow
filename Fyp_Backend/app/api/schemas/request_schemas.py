from typing import Optional, List
from pydantic import BaseModel

class RepairStepSchema(BaseModel):
    stepNo: int
    instruction: str
    completed: Optional[bool] = False

class AiAnalysisSchema(BaseModel):
    title: str
    category: str
    urgency: str
    summary: str
    safetyNote: str
    steps: List[RepairStepSchema]

class TechnicianInfoSchema(BaseModel):
    id: str
    name: str
    company: str
    rating: float
    reviewCount: int
    rate: float
    availability: str
    availabilityNote: Optional[str] = None
    avatarInitials: str
    serviceCategory: str
    isBestMatch: Optional[bool] = False
    distance: Optional[str] = "2.4 km away"
    jobsCompleted: Optional[int] = 0

class ServiceRequestCreate(BaseModel):
    category: str
    description: str
    accessTime: Optional[str] = "Today, 2:30 PM"
    address: Optional[str] = None

class ServiceRequestResponse(BaseModel):
    id: str
    customerId: str
    customerName: str
    category: str
    description: str
    accessTime: str
    photoUrl: Optional[str] = None
    urgency: str
    status: str
    assignedTechnician: Optional[TechnicianInfoSchema] = None
    aiAnalysis: Optional[AiAnalysisSchema] = None
    bookingMode: Optional[str] = None
    estimatedPrice: Optional[float] = None
    createdAt: str
    updatedAt: Optional[str] = None

class RequestOfferSchema(BaseModel):
    id: str
    requestId: str
    technicianId: str
    technician: TechnicianInfoSchema
    status: str
    offeredPrice: float
    createdAt: str
