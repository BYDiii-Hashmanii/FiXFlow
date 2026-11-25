from datetime import datetime, timezone
import enum
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Numeric, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class UserRole(str, enum.Enum):
    customer = "customer"
    technician = "technician"
    owner = "owner"

class AvailabilityStatus(str, enum.Enum):
    available = "available"
    busy = "busy"
    unavailable = "unavailable"

class UrgencyLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class BookingMode(str, enum.Enum):
    auto = "auto"
    manual = "manual"

class RequestStatus(str, enum.Enum):
    ai_analysis = "ai_analysis"
    solved_by_customer = "solved_by_customer"
    waiting = "waiting"
    accepted = "accepted"
    in_progress = "in_progress"
    completed = "completed"
    closed_paid = "closed_paid"
    cancelled = "cancelled"

class OfferStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"

class DeclineReason(str, enum.Enum):
    busy = "busy"
    not_available = "not_available"
    outside_area = "outside_area"
    other = "other"

class JobStatus(str, enum.Enum):
    accepted = "accepted"
    in_progress = "in_progress"
    completed = "completed"
    closed = "closed"
    cancelled = "cancelled"

class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    unpaid = "unpaid"
    paid = "paid"

class PhotoType(str, enum.Enum):
    before = "before"
    after = "after"
    progress = "progress"

class NotificationType(str, enum.Enum):
    request = "request"
    offer = "offer"
    job = "job"
    invoice = "invoice"
    payment = "payment"
    feedback = "feedback"
    system = "system"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False, unique=True, index=True)
    email = Column(String(150), nullable=True, unique=True)
    password_hash = Column(Text, nullable=False)
    role = Column(SQLEnum(UserRole, create_constraint=True), nullable=False)
    address = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=utc_now)
    updated_at = Column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    # Relationships
    company = relationship("Company", back_populates="owner", uselist=False)
    technician_profile = relationship("Technician", back_populates="user", uselist=False)
    requests = relationship("ServiceRequest", back_populates="customer", foreign_keys="ServiceRequest.customer_id")
    payments = relationship("Payment", back_populates="customer")
    reviews = relationship("Review", back_populates="customer")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    name = Column(String(120), nullable=False)
    created_at = Column(DateTime, nullable=False, default=utc_now)

    owner = relationship("User", back_populates="company")
    technicians = relationship("Technician", back_populates="company")


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)

    technicians = relationship("Technician", back_populates="category")
    requests = relationship("ServiceRequest", back_populates="category", foreign_keys="ServiceRequest.category_id")


class Technician(Base):
    __tablename__ = "technicians"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False, index=True)
    service_rate = Column(Numeric(10, 2), nullable=False)
    availability = Column(SQLEnum(AvailabilityStatus, create_constraint=True), nullable=False, default=AvailabilityStatus.available)

    user = relationship("User", back_populates="technician_profile")
    company = relationship("Company", back_populates="technicians")
    category = relationship("ServiceCategory", back_populates="technicians")
    assigned_requests = relationship("ServiceRequest", back_populates="assigned_technician", foreign_keys="ServiceRequest.assigned_technician_id")
    offers = relationship("RequestOffer", back_populates="technician")
    jobs = relationship("Job", back_populates="technician")
    reviews = relationship("Review", back_populates="technician")


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_no = Column(String(20), nullable=False, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)
    final_category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=True)
    detected_category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=True)
    suggested_category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=True)
    title = Column(String(120), nullable=True)
    description = Column(Text, nullable=True)
    photo_path = Column(String(255), nullable=True)
    analysis_state = Column(String(16), nullable=False, server_default="no_detection")
    analysis_stage = Column(String(16), nullable=True)
    vision_state = Column(String(16), nullable=True)
    guidance_category = Column(String(120), nullable=True)
    analysis_source = Column(String(40), nullable=True)
    analysis_confidence = Column(Numeric(5, 4), nullable=True)
    detector_label = Column(String(120), nullable=True)
    detected_category = Column(String(80), nullable=True)
    detected_display_name = Column(String(120), nullable=True)
    category_source = Column(String(16), nullable=True)
    safety_critical = Column(Boolean, nullable=True)
    diy_allowed = Column(Boolean, nullable=True)
    decision_safety_note = Column(Text, nullable=True)
    address = Column(String(255), nullable=True)
    access_time = Column(String(100), nullable=True)
    urgency = Column(SQLEnum(UrgencyLevel, create_constraint=True), nullable=True)
    booking_mode = Column(SQLEnum(BookingMode, create_constraint=True), nullable=True)
    assigned_technician_id = Column(Integer, ForeignKey("technicians.user_id"), nullable=True, index=True)
    status = Column(SQLEnum(RequestStatus, create_constraint=True), nullable=False, default=RequestStatus.ai_analysis, index=True)
    created_at = Column(DateTime, nullable=False, default=utc_now)
    updated_at = Column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    customer = relationship("User", back_populates="requests", foreign_keys=[customer_id])
    category = relationship("ServiceCategory", back_populates="requests", foreign_keys=[category_id])
    final_category = relationship("ServiceCategory", foreign_keys=[final_category_id])
    detected_service_category = relationship("ServiceCategory", foreign_keys=[detected_category_id])
    suggested_category = relationship("ServiceCategory", foreign_keys=[suggested_category_id])

    @property
    def effective_category_id(self) -> int:
        return self.final_category_id if self.final_category_id is not None else self.category_id

    @property
    def effective_category(self) -> "ServiceCategory":
        return self.final_category or self.category
    assigned_technician = relationship("Technician", back_populates="assigned_requests", foreign_keys=[assigned_technician_id])
    ai_analysis = relationship("AiAnalysis", back_populates="request", uselist=False, cascade="all, delete-orphan")
    offers = relationship("RequestOffer", back_populates="request", cascade="all, delete-orphan")
    job = relationship("Job", back_populates="request", uselist=False)


class AiAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), nullable=False, unique=True)
    problem_title = Column(String(120), nullable=False)
    summary = Column(Text, nullable=True)
    urgency = Column(SQLEnum(UrgencyLevel, create_constraint=True), nullable=False)
    safety_note = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=utc_now)

    request = relationship("ServiceRequest", back_populates="ai_analysis")
    steps = relationship("AiRepairStep", back_populates="analysis", cascade="all, delete-orphan", order_by="AiRepairStep.step_no")


class AiRepairStep(Base):
    __tablename__ = "ai_repair_steps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("ai_analyses.id", ondelete="CASCADE"), nullable=False)
    step_no = Column(Integer, nullable=False)
    instruction = Column(Text, nullable=False)

    __table_args__ = (UniqueConstraint("analysis_id", "step_no", name="uq_analysis_step"),)

    analysis = relationship("AiAnalysis", back_populates="steps")


class RequestOffer(Base):
    __tablename__ = "request_offers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), nullable=False)
    technician_id = Column(Integer, ForeignKey("technicians.user_id"), nullable=False, index=True)
    quoted_price = Column(Numeric(10, 2), nullable=False)
    status = Column(SQLEnum(OfferStatus, create_constraint=True), nullable=False, default=OfferStatus.pending)
    decline_reason = Column(SQLEnum(DeclineReason, create_constraint=True), nullable=True)
    sent_at = Column(DateTime, nullable=False, default=utc_now)
    responded_at = Column(DateTime, nullable=True)

    __table_args__ = (UniqueConstraint("request_id", "technician_id", name="uq_request_technician_offer"),)

    request = relationship("ServiceRequest", back_populates="offers")
    technician = relationship("Technician", back_populates="offers")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False, unique=True)
    technician_id = Column(Integer, ForeignKey("technicians.user_id"), nullable=False, index=True)
    status = Column(SQLEnum(JobStatus, create_constraint=True), nullable=False, default=JobStatus.accepted, index=True)
    accepted_at = Column(DateTime, nullable=False, default=utc_now)
    started_at = Column(DateTime, nullable=True)
    expected_completion = Column(String(100), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    labour_hours = Column(Numeric(4, 1), nullable=False, default=0.0)
    labour_cost = Column(Numeric(10, 2), nullable=False, default=0.0)
    work_notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    request = relationship("ServiceRequest", back_populates="job")
    technician = relationship("Technician", back_populates="jobs")
    parts = relationship("JobPart", back_populates="job", cascade="all, delete-orphan")
    photos = relationship("JobPhoto", back_populates="job", cascade="all, delete-orphan")
    invoice = relationship("Invoice", back_populates="job", uselist=False)
    review = relationship("Review", back_populates="job", uselist=False)


class JobPart(Base):
    __tablename__ = "job_parts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    part_name = Column(String(120), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)

    job = relationship("Job", back_populates="parts")


class JobPhoto(Base):
    __tablename__ = "job_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    photo_type = Column(SQLEnum(PhotoType, create_constraint=True), nullable=False, default=PhotoType.progress)
    photo_path = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, nullable=False, default=utc_now)

    job = relationship("Job", back_populates="photos")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    invoice_no = Column(String(30), nullable=False, unique=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, unique=True)
    parts_total = Column(Numeric(10, 2), nullable=False, default=0.0)
    labour_total = Column(Numeric(10, 2), nullable=False, default=0.0)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.0)
    status = Column(SQLEnum(InvoiceStatus, create_constraint=True), nullable=False, default=InvoiceStatus.draft, index=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=utc_now)

    job = relationship("Job", back_populates="invoice")
    payment = relationship("Payment", back_populates="invoice", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False, unique=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(30), nullable=False, default="cash")
    paid_at = Column(DateTime, nullable=False, default=utc_now)

    invoice = relationship("Invoice", back_populates="payment")
    customer = relationship("User", back_populates="payments")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (CheckConstraint("rating BETWEEN 1 AND 5", name="ck_review_rating"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, unique=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("technicians.user_id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=utc_now)

    job = relationship("Job", back_populates="review")
    customer = relationship("User", back_populates="reviews")
    technician = relationship("Technician", back_populates="reviews")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(120), nullable=False)
    message = Column(String(255), nullable=True)
    type = Column(String(50), nullable=False, default="system")
    request_id = Column(Integer, ForeignKey("service_requests.id", ondelete="SET NULL"), nullable=True)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=utc_now)

    user = relationship("User", back_populates="notifications")
    request = relationship("ServiceRequest")


class NumberSequence(Base):
    __tablename__ = "number_sequences"

    name = Column(String(40), primary_key=True)
    value = Column(Integer, nullable=False)
