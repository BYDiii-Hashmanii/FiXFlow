from typing import Optional, List
from pydantic import BaseModel
from app.api.schemas.job_schemas import JobPartSchema
from app.api.schemas.request_schemas import TechnicianInfoSchema

class InvoiceInfoSchema(BaseModel):
    id: str
    jobId: str
    requestId: str
    jobTitle: str
    technician: TechnicianInfoSchema
    parts: List[JobPartSchema]
    labourCost: float
    totalCost: float
    status: str
    workNotes: str
    createdAt: str
    paidAt: Optional[str] = None

class PaymentRequest(BaseModel):
    method: Optional[str] = "cash"

class PaymentInfoSchema(BaseModel):
    id: str
    invoiceId: str
    amount: float
    method: str
    paidAt: str
    receiptNumber: str
