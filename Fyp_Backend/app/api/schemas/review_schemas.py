from typing import Optional
from pydantic import BaseModel

class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = ""

class ReviewInfoSchema(BaseModel):
    id: str
    jobId: str
    customerId: str
    customerName: str
    technicianId: str
    rating: int
    comment: Optional[str] = ""
    createdAt: str
