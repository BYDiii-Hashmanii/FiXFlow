from typing import Optional, List
from sqlalchemy.orm import Session
from app.api.schemas.pagination import Pagination
from app.database.repositories.loading import technician_loads
from app.database import models

class TechnicianRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[models.Technician]:
        return self.db.query(models.Technician).filter(models.Technician.user_id == user_id, models.Technician.user.has(models.User.is_active.is_(True))).first()

    def list_all(self, page: Pagination, category_id: Optional[int] = None, company_id: Optional[int] = None) -> List[models.Technician]:
        query = self.db.query(models.Technician).join(models.User).filter(models.User.is_active == True)
        if category_id is not None:
            query = query.filter(models.Technician.category_id == category_id)
        if company_id:
            query = query.filter(models.Technician.company_id == company_id)
        return page.apply(query.options(*technician_loads()).order_by(models.Technician.user_id)).all()

    def create(self, tech: models.Technician) -> models.Technician:
        self.db.add(tech)
        self.db.commit()
        self.db.refresh(tech)
        return tech

    def update(self, tech: models.Technician) -> models.Technician:
        self.db.commit()
        self.db.refresh(tech)
        return tech
