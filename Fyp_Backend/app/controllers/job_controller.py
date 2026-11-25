from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.api.schemas.workflow_schemas import WorkUpdate
from app.controllers.auth_controller import get_initials
from app.controllers.lifecycle import commit, notify, now_utc, require_transition, transition
from app.controllers.request_controller import format_technician_info
from app.controllers.uploads import media_url
from app.database import models as m
from app.database.repositories.numbers import next_number

MONEY_LIMIT = Decimal("99999999.99")


def format_photo(photo: m.JobPhoto) -> dict:
    return {"id": str(photo.id), "type": photo.photo_type.value, "url": media_url(photo.photo_path),
            "uploadedAt": photo.uploaded_at.isoformat()}


def format_job_response(job: m.Job) -> dict:
    req = job.request
    customer = req.customer
    invoice = job.invoice
    parts = [
        {"id": str(item.id), "name": item.part_name, "quantity": item.quantity,
         "unitPrice": float(item.unit_price), "total": float(item.unit_price * item.quantity)}
        for item in job.parts
    ]
    return {
        "id": req.request_no,
        "requestId": req.request_no,
        "title": req.title,
        "category": req.category.name,
        "customer": {
            "name": customer.full_name, "phone": customer.phone, "address": req.address,
            "avatarInitials": get_initials(customer.full_name),
        },
        "technician": format_technician_info(job.technician),
        "accessTime": req.access_time,
        "scheduledDate": job.accepted_at.isoformat(),
        "description": req.description,
        "photoUrl": media_url(req.photo_path) if req.photo_path else None,
        "status": job.status.value,
        "workStatusNote": job.status.value.replace("_", " ").capitalize(),
        "expectedCompletion": job.expected_completion or "",
        "parts": parts,
        "photos": [format_photo(photo) for photo in job.photos],
        "labourHours": float(job.labour_hours),
        "hourlyRate": float(job.technician.service_rate),
        "labourCost": float(job.labour_cost),
        "totalCost": float(invoice.total_amount if invoice else job.labour_cost + sum(
            item.unit_price * item.quantity for item in job.parts
        )),
        "workNotes": job.work_notes,
        "invoiceNumber": invoice.invoice_no if invoice else None,
        "invoiceDate": invoice.created_at.isoformat() if invoice else None,
        "paymentStatus": invoice.status.value if invoice else None,
        "timeline": [
            {"title": title, "time": timestamp.isoformat(), "completed": True}
            for title, timestamp in (
                ("Request accepted", job.accepted_at), ("Work started", job.started_at),
                ("Work completed", job.completed_at), ("Job closed", job.closed_at),
            ) if timestamp
        ],
    }


class JobController:
    def __init__(self, db: Session):
        self.db = db

    def advance(self, job: m.Job, previous: m.JobStatus, target: m.JobStatus, timestamp_field: str) -> dict:
        timestamp = now_utc()
        req = job.request
        # Match the request and job state and use the same row order as cancellation.
        changed = transition(
            self.db, m.ServiceRequest, req.id, (m.RequestStatus(previous.value),), m.RequestStatus(target.value),
            conditions=(m.ServiceRequest.job.has(m.Job.status == previous),),
        )
        if not changed:
            self.db.refresh(job)
            if job.status == target and getattr(job, timestamp_field) is not None:
                return format_job_response(job)
            require_transition(False)
        require_transition(transition(self.db, m.Job, job.id, (previous,), target, **{timestamp_field: timestamp}))
        notify(self.db, req.customer_id, m.NotificationType.job,
               "Work started" if target == m.JobStatus.in_progress else "Work completed", req)
        commit(self.db)
        return format_job_response(job)

    def start_job(self, job: m.Job) -> dict:
        return self.advance(job, m.JobStatus.accepted, m.JobStatus.in_progress, "started_at")

    def complete_job(self, job: m.Job) -> dict:
        if job.started_at is None:
            raise HTTPException(409, "Work has not started")
        return self.advance(job, m.JobStatus.in_progress, m.JobStatus.completed, "completed_at")

    def update_work(self, job: m.Job, payload: WorkUpdate) -> dict:
        require_transition(transition(self.db, m.Job, job.id, (m.JobStatus.in_progress,), m.JobStatus.in_progress))
        self.db.refresh(job)
        hours = payload.labourHours if payload.labourHours is not None else job.labour_hours
        labour = (hours * job.technician.service_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        parts = payload.parts
        parts_total = sum(item.quantity * item.unitPrice for item in parts) if parts is not None else sum(
            item.quantity * item.unit_price for item in job.parts
        )
        if parts_total + labour > MONEY_LIMIT:
            raise HTTPException(422, "Work total exceeds the permitted amount")
        job.labour_hours = hours
        job.labour_cost = labour
        if payload.workNotes is not None:
            job.work_notes = payload.workNotes
        if payload.expectedCompletion is not None:
            job.expected_completion = payload.expectedCompletion
        if parts is not None:
            self.db.execute(delete(m.JobPart).where(m.JobPart.job_id == job.id))
            self.db.add_all(
                m.JobPart(job_id=job.id, part_name=item.name, quantity=item.quantity, unit_price=item.unitPrice)
                for item in parts
            )
        commit(self.db)
        return format_job_response(job)

    def generate_invoice(self, job: m.Job) -> m.Invoice:
        if job.invoice and job.invoice.status != m.InvoiceStatus.draft:
            return job.invoice
        changed = transition(self.db, m.Job, job.id, (m.JobStatus.completed,), m.JobStatus.completed)
        self.db.refresh(job)
        if job.invoice and job.invoice.status != m.InvoiceStatus.draft:
            return job.invoice
        require_transition(changed)
        parts_total = sum((item.quantity * item.unit_price for item in job.parts), Decimal(0))
        total = parts_total + job.labour_cost
        if not 0 <= total <= MONEY_LIMIT:
            raise HTTPException(422, "Invoice total is outside the permitted range")
        invoice = job.invoice
        if invoice is None:
            invoice = m.Invoice(invoice_no=next_number(self.db, "invoice"), job_id=job.id)
            self.db.add(invoice)
        invoice.parts_total = parts_total
        invoice.labour_total = job.labour_cost
        invoice.total_amount = total
        invoice.status = m.InvoiceStatus.unpaid
        invoice.sent_at = now_utc()
        notify(self.db, job.request.customer_id, m.NotificationType.invoice, "Invoice issued", job.request)
        commit(self.db)
        return invoice
