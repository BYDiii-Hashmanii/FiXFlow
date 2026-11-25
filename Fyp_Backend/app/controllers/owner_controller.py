from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.api.schemas.pagination import Pagination

from app.api.schemas.workflow_schemas import TechnicianCreate, TechnicianUpdate
from app.controllers.auth_controller import get_initials
from app.controllers.request_controller import format_technician_info
from app.database import models as m
from app.database.repositories.access import company_id, found, invoice_scope, job_scope, technician_scope
from app.database.repositories.loading import job_loads, review_loads, technician_loads
from app.middlewares.security import get_password_hash


def invoice_lines(job: m.Job) -> list[dict]:
    return [{"id": str(part.id), "name": part.part_name, "quantity": part.quantity,
             "unitPrice": float(part.unit_price), "total": float(part.quantity * part.unit_price)} for part in job.parts]


def map_to_company_job(job: m.Job) -> dict:
    req = job.request
    tech = job.technician
    parts = sum(part.quantity * part.unit_price for part in job.parts)
    return {
        "id": req.request_no,
        "jobTitle": req.title,
        "technician": {
            "id": str(tech.user_id), "name": tech.user.full_name,
            "avatarInitials": get_initials(tech.user.full_name), "serviceCategory": tech.category.name,
        },
        "customer": {"id": str(req.customer_id), "name": req.customer.full_name, "phone": req.customer.phone, "address": req.address},
        "status": job.status.value,
        "scheduledDate": job.accepted_at.isoformat(), "category": req.effective_category.name,
        "accessTime": req.access_time, "parts": invoice_lines(job),
        "description": req.description,
        "workNotes": job.work_notes,
        "partsTotal": float(parts),
        "labourTotal": float(job.labour_cost),
        "grandTotal": float(parts + job.labour_cost),
        "invoiceId": job.invoice.invoice_no if job.invoice else None,
        "invoiceStatus": job.invoice.status.value if job.invoice else None,
        "timeline": [
            {"title": title, "time": when.isoformat(), "completed": True}
            for title, when in (
                ("Accepted", job.accepted_at), ("In Progress", job.started_at), ("Completed", job.completed_at),
            ) if when
        ],
    }


def format_owner_technician(tech: m.Technician) -> dict:
    return {
        **format_technician_info(tech), "phone": tech.user.phone,
        "serviceRate": float(tech.service_rate), "createdAt": tech.user.created_at.isoformat(),
    }


def format_owner_invoice(inv: m.Invoice) -> dict:
    job = inv.job
    req = job.request
    technician = job.technician.user
    return {
        "id": inv.invoice_no, "jobId": req.request_no, "jobTitle": req.title, "parts": invoice_lines(job),
        "customerId": str(req.customer_id), "technicianId": str(job.technician_id),
        "customerName": req.customer.full_name, "technicianName": technician.full_name,
        "technicianInitials": get_initials(technician.full_name), "category": req.effective_category.name,
        "amount": float(inv.total_amount), "status": inv.status.value, "date": inv.created_at.isoformat(),
        "labourTotal": float(inv.labour_total), "partsTotal": float(inv.parts_total),
        "workNotes": job.work_notes, "paidAt": inv.payment.paid_at.isoformat() if inv.payment else None,
    }


def format_review(review: m.Review) -> dict:
    tech = review.technician.user
    return {
        "id": str(review.id), "jobId": review.job.request.request_no, "jobTitle": review.job.request.title,
        "customerId": str(review.customer_id), "technicianId": str(review.technician_id),
        "invoiceId": review.job.invoice.invoice_no if review.job.invoice else None,
        "customerName": review.customer.full_name, "technicianName": tech.full_name,
        "technicianInitials": get_initials(tech.full_name), "rating": review.rating,
        "comment": review.comment or "", "date": review.created_at.isoformat(),
    }


class OwnerController:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard(self, owner: m.User) -> dict:
        comp = self.db.get(m.Company, company_id(self.db, owner))
        jobs = job_scope(self.db, owner)
        return {
            "greeting": {"name": owner.full_name, "company": comp.name, "avatarInitials": get_initials(owner.full_name)},
            "stats": {
                "totalTechnicians": technician_scope(self.db, owner).count(),
                "activeJobs": jobs.filter(m.Job.status.in_((m.JobStatus.accepted, m.JobStatus.in_progress))).count(),
                "completedJobs": jobs.filter(m.Job.status.in_((m.JobStatus.completed, m.JobStatus.closed))).count(),
            },
            "recentJobs": [map_to_company_job(job) for job in jobs.options(*job_loads()).order_by(m.Job.accepted_at.desc()).limit(3)],
        }

    def list_technicians(self, owner: m.User, page: Pagination) -> list[dict]:
        return [format_owner_technician(tech) for tech in page.apply(technician_scope(self.db, owner).options(*technician_loads()).order_by(m.Technician.user_id))]

    def category(self, payload: TechnicianUpdate) -> m.ServiceCategory:
        return found(self.db.query(m.ServiceCategory).filter_by(id=payload.categoryId), "Category")

    def create_technician(self, payload: TechnicianCreate, owner: m.User) -> dict:
        company = company_id(self.db, owner)
        category = self.category(payload)
        user = m.User(
            full_name=payload.fullName, phone=payload.phone,
            password_hash=get_password_hash(payload.password), role=m.UserRole.technician,
        )
        tech = m.Technician(
            user=user, company_id=company, category_id=category.id, service_rate=payload.serviceRate,
            availability=payload.availability,
        )
        self.db.add(tech)
        self.commit_technician()
        return format_owner_technician(tech)

    def update_technician(self, tech: m.Technician, payload: TechnicianUpdate) -> dict:
        for field, target, name in (
            (payload.fullName, tech.user, "full_name"), (payload.phone, tech.user, "phone"),
            (payload.serviceRate, tech, "service_rate"), (payload.availability, tech, "availability"),
        ):
            if field is not None:
                setattr(target, name, field)
        if payload.categoryId is not None:
            tech.category = self.category(payload)
        self.commit_technician()
        return format_owner_technician(tech)

    def commit_technician(self):
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(409, "An account already uses this phone number") from exc

    def list_jobs(self, owner: m.User, page: Pagination, status: str | None) -> list[dict]:
        query = job_scope(self.db, owner)
        if status == "active":
            query = query.filter(m.Job.status.in_((m.JobStatus.accepted, m.JobStatus.in_progress)))
        elif status == "completed":
            query = query.filter(m.Job.status.in_((m.JobStatus.completed, m.JobStatus.closed)))
        return [map_to_company_job(job) for job in page.apply(query.options(*job_loads()).order_by(m.Job.id.desc()))]

    def list_invoices(self, owner: m.User, page: Pagination, status: m.InvoiceStatus | None) -> list[dict]:
        query = invoice_scope(self.db, owner)
        if status:
            query = query.filter(m.Invoice.status == status)
        return [format_owner_invoice(inv) for inv in page.apply(query.options(
            selectinload(m.Invoice.job).options(*job_loads()), selectinload(m.Invoice.payment),
        ).order_by(m.Invoice.id.desc()))]

    def review_scope(self, owner: m.User):
        return self.db.query(m.Review).filter(m.Review.job_id.in_(job_scope(self.db, owner).with_entities(m.Job.id)))

    def list_feedback(self, owner: m.User, page: Pagination) -> dict:
        query = self.review_scope(owner)
        average, count = query.with_entities(func.avg(m.Review.rating), func.count(m.Review.id)).one()
        return {
            "averageRating": round(average, 1) if average is not None else None,
            "totalReviews": count,
            "reviews": [format_review(item) for item in page.apply(query.options(*review_loads()).order_by(m.Review.id.desc()))],
        }
