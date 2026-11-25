from typing import Optional, List
from pydantic import BaseModel
from app.api.schemas.request_schemas import TechnicianInfoSchema
from app.api.schemas.job_schemas import JobInfoSchema

class OwnerGreeting(BaseModel):
    name: str
    company: str
    avatarInitials: str

class OwnerStats(BaseModel):
    totalTechnicians: int
    activeJobs: int
    completedJobs: int

class OwnerDashboardData(BaseModel):
    greeting: OwnerGreeting
    stats: OwnerStats
    recentJobs: List[dict]

class CreateTechnicianPayload(BaseModel):
    fullName: str
    phone: str
    password: Optional[str] = "Test@1234"
    serviceCategory: str
    serviceRate: float
    availability: Optional[str] = "available"

class EditTechnicianPayload(BaseModel):
    fullName: str
    phone: str
    serviceCategory: str
    serviceRate: float
    availability: str
