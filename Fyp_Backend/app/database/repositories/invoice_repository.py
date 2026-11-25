from typing import Optional, List
from sqlalchemy.orm import Session
from app.database import models

class InvoiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, invoice_id: int) -> Optional[models.Invoice]:
        return self.db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()

    def get_by_invoice_no(self, inv_no: str) -> Optional[models.Invoice]:
        return self.db.query(models.Invoice).filter(models.Invoice.invoice_no == inv_no).first()

    def get_by_job_id(self, job_id: int) -> Optional[models.Invoice]:
        return self.db.query(models.Invoice).filter(models.Invoice.job_id == job_id).first()

    def list_by_company(self, company_id: int) -> List[models.Invoice]:
        return self.db.query(models.Invoice).join(models.Job).join(models.Technician).filter(
            models.Technician.company_id == company_id
        ).order_by(models.Invoice.created_at.desc()).all()

    def create(self, invoice: models.Invoice) -> models.Invoice:
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def update(self, invoice: models.Invoice) -> models.Invoice:
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def get_next_invoice_no(self) -> str:
        count = self.db.query(models.Invoice).count()
        return f"INV-2026-{count + 142:04d}"
