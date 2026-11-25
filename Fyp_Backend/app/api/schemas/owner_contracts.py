from pydantic import BaseModel

from app.database.models import AvailabilityStatus, InvoiceStatus, JobStatus


class OwnerTechnician(BaseModel):
    id: str
    name: str
    phone: str
    company: str
    rate: float
    serviceRate: float
    serviceCategory: str
    categoryId: int
    availability: AvailabilityStatus
    rating: float | None
    reviewCount: int
    jobsCompleted: int
    avatarInitials: str
    createdAt: str


class CompanyJobCustomer(BaseModel):
    id: str
    name: str
    phone: str
    address: str | None


class CompanyJobTechnician(BaseModel):
    id: str
    name: str
    avatarInitials: str
    serviceCategory: str


class TimelineEntry(BaseModel):
    title: str
    time: str
    completed: bool


class InvoiceLine(BaseModel):
    id: str
    name: str
    quantity: int
    unitPrice: float
    total: float


class CompanyJob(BaseModel):
    id: str
    jobTitle: str | None
    technician: CompanyJobTechnician
    customer: CompanyJobCustomer
    status: JobStatus
    scheduledDate: str
    accessTime: str | None
    category: str
    parts: list[InvoiceLine]
    description: str | None
    workNotes: str | None
    partsTotal: float
    labourTotal: float
    grandTotal: float
    invoiceId: str | None
    invoiceStatus: InvoiceStatus | None
    timeline: list[TimelineEntry]


class CompanyInvoice(BaseModel):
    id: str
    jobId: str
    jobTitle: str | None
    customerName: str
    technicianName: str
    technicianInitials: str
    category: str
    amount: float
    status: InvoiceStatus
    date: str
    customerId: str
    technicianId: str
    parts: list[InvoiceLine]
    partsTotal: float
    labourTotal: float
    workNotes: str | None
    paidAt: str | None


class CompanyReview(BaseModel):
    customerId: str
    technicianId: str
    jobTitle: str | None
    invoiceId: str | None
    id: str
    jobId: str
    customerName: str
    technicianName: str
    technicianInitials: str
    rating: int
    comment: str
    date: str


class FeedbackSummary(BaseModel):
    averageRating: float | None
    totalReviews: int
    reviews: list[CompanyReview]
