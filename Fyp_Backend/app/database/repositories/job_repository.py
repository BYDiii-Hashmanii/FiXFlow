from typing import Optional, List
from sqlalchemy.orm import Session
from app.database import models

class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, job_id: int) -> Optional[models.Job]:
        return self.db.query(models.Job).filter(models.Job.id == job_id).first()

    def get_by_request_id(self, req_id: int) -> Optional[models.Job]:
        return self.db.query(models.Job).filter(models.Job.request_id == req_id).first()

    def list_by_technician(self, technician_id: int, status: Optional[str] = None) -> List[models.Job]:
        query = self.db.query(models.Job).filter(models.Job.technician_id == technician_id)
        if status:
            query = query.filter(models.Job.status == status)
        return query.order_by(models.Job.accepted_at.desc()).all()

    def list_by_company(self, company_id: int, status: Optional[str] = None) -> List[models.Job]:
        query = self.db.query(models.Job).join(models.Technician).filter(models.Technician.company_id == company_id)
        if status:
            if status == "active":
                query = query.filter(models.Job.status.in_([models.JobStatus.accepted, models.JobStatus.in_progress]))
            elif status == "completed":
                query = query.filter(models.Job.status.in_([models.JobStatus.completed, models.JobStatus.closed]))
            else:
                query = query.filter(models.Job.status == status)
        return query.order_by(models.Job.accepted_at.desc()).all()

    def create(self, job: models.Job) -> models.Job:
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def update(self, job: models.Job) -> models.Job:
        self.db.commit()
        self.db.refresh(job)
        return job
