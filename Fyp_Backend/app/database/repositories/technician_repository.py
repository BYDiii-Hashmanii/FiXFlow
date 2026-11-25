from typing import Optional, List
from sqlalchemy import func, select
from sqlalchemy.orm import Query, Session
from app.api.schemas.pagination import Pagination
from app.database.repositories.loading import technician_loads
from app.database import models


def by_best_match(query: Query) -> Query:
    reviews = models.Review
    tech = models.Technician
    ratings = select(func.avg(reviews.rating)).where(reviews.technician_id == tech.user_id).correlate(tech).scalar_subquery()
    counts = select(func.count(reviews.id)).where(reviews.technician_id == tech.user_id).correlate(tech).scalar_subquery()
    return query.order_by(ratings.desc().nulls_last(), counts.desc(), tech.service_rate, tech.user_id)

class TechnicianRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[models.Technician]:
        return self.db.query(models.Technician).filter(models.Technician.user_id == user_id, models.Technician.user.has(models.User.is_active.is_(True))).first()

    def list_all(self, page: Pagination, category_id: Optional[int] = None, company_id: Optional[int] = None, *,
                 category: str | None = None, available: bool = False, best_match: bool = False) -> List[models.Technician]:
        query = self.db.query(models.Technician).join(models.User).filter(models.User.is_active == True)
        if category_id is not None:
            query = query.filter(models.Technician.category_id == category_id)
        if company_id:
            query = query.filter(models.Technician.company_id == company_id)
        if category:
            query = query.filter(models.Technician.category.has(func.lower(models.ServiceCategory.name) == category.strip().lower()))
        if available or best_match:
            query = query.filter(models.Technician.availability == models.AvailabilityStatus.available)
        query = by_best_match(query) if best_match else query.order_by(models.Technician.user_id)
        return page.apply(query.options(*technician_loads())).all()

    def create(self, tech: models.Technician) -> models.Technician:
        self.db.add(tech)
        self.db.commit()
        self.db.refresh(tech)
        return tech

    def update(self, tech: models.Technician) -> models.Technician:
        self.db.commit()
        self.db.refresh(tech)
        return tech
