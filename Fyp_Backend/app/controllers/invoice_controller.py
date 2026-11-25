from datetime import timezone

from fastapi import HTTPException
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.controllers.lifecycle import now_utc
from app.controllers.job_controller import format_photo
from app.controllers.request_controller import format_technician_info
from app.database import models as m


def payment_response(payment: m.Payment, invoice: m.Invoice) -> dict:
    return {
        "id": str(payment.id),
        "invoiceId": invoice.invoice_no,
        "jobId": invoice.job.request.request_no,
        "requestId": invoice.job.request.request_no,
        "amount": float(payment.amount),
        "method": payment.payment_method,
        "paidAt": payment.paid_at.replace(tzinfo=timezone.utc).isoformat(),
        "receiptNumber": f"REC-{payment.paid_at.year}-{payment.id:04d}",
    }


class InvoiceController:
    def __init__(self, db: Session):
        self.db = db

    def get_invoice(self, inv: m.Invoice) -> dict:
        job = inv.job
        return {
            "id": inv.invoice_no,
            "jobId": job.request.request_no,
            "requestId": job.request.request_no,
            "jobTitle": job.request.title,
            "technician": format_technician_info(job.technician),
            "parts": [
                {
                    "id": str(part.id), "name": part.part_name, "quantity": part.quantity,
                    "unitPrice": float(part.unit_price), "total": float(part.quantity * part.unit_price),
                }
                for part in job.parts
            ],
            "labourCost": float(inv.labour_total),
            "totalCost": float(inv.total_amount),
            "status": inv.status.value,
            "workNotes": job.work_notes,
            "photos": [format_photo(photo) for photo in job.photos if photo.photo_type in (m.PhotoType.before, m.PhotoType.after)],
            "createdAt": inv.created_at.isoformat(),
            "paidAt": inv.payment.paid_at.replace(tzinfo=timezone.utc).isoformat() if inv.payment else None,
        }

    def receipt(self, invoice: m.Invoice) -> dict:
        if invoice.status != m.InvoiceStatus.paid or invoice.payment is None:
            raise HTTPException(404, "Receipt not found")
        return payment_response(invoice.payment, invoice)

    def pay_invoice(self, invoice: m.Invoice, method: str, customer: m.User) -> dict:
        if invoice.status == m.InvoiceStatus.paid:
            return self.receipt(invoice)
        job = invoice.job
        if invoice.status != m.InvoiceStatus.unpaid:
            raise HTTPException(409, "Invoice is not payable")
        changed = self.db.execute(
            update(m.Invoice)
            .where(m.Invoice.id == invoice.id, m.Invoice.status == m.InvoiceStatus.unpaid)
            .values(status=m.InvoiceStatus.paid)
        )
        if changed.rowcount != 1:
            self.db.refresh(invoice)
            if invoice.status == m.InvoiceStatus.paid:
                return self.receipt(invoice)
            raise HTTPException(409, "Invoice is not payable")

        now = now_utc()
        job.status = m.JobStatus.closed
        job.closed_at = now
        job.request.status = m.RequestStatus.closed_paid
        payment = m.Payment(
            invoice_id=invoice.id, customer_id=customer.id, amount=invoice.total_amount,
            payment_method=method, paid_at=now,
        )
        self.db.add_all([
            payment,
            m.Notification(
                user_id=job.technician_id, title="Payment received", message=invoice.invoice_no,
                type=m.NotificationType.payment.value, request_id=job.request_id,
            ),
        ])
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            self.db.refresh(invoice)
            if invoice.status == m.InvoiceStatus.paid:
                return self.receipt(invoice)
            raise HTTPException(409, "Payment conflicts with an existing record") from exc
        return payment_response(payment, invoice)
