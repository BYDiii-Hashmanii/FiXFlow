from typing import Optional, List
from sqlalchemy.orm import Session
from app.database import models

class RequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, req_id: int) -> Optional[models.ServiceRequest]:
        return self.db.query(models.ServiceRequest).filter(models.ServiceRequest.id == req_id).first()

    def get_by_request_no(self, req_no: str) -> Optional[models.ServiceRequest]:
        return self.db.query(models.ServiceRequest).filter(models.ServiceRequest.request_no == req_no).first()

    def list_requests(self, customer_id: Optional[int] = None, status: Optional[str] = None) -> List[models.ServiceRequest]:
        query = self.db.query(models.ServiceRequest)
        if customer_id:
            query = query.filter(models.ServiceRequest.customer_id == customer_id)
        if status:
            query = query.filter(models.ServiceRequest.status == status)
        return query.order_by(models.ServiceRequest.created_at.desc()).all()

    def create(self, req: models.ServiceRequest) -> models.ServiceRequest:
        self.db.add(req)
        self.db.commit()
        self.db.refresh(req)
        return req

    def update(self, req: models.ServiceRequest) -> models.ServiceRequest:
        self.db.commit()
        self.db.refresh(req)
        return req

