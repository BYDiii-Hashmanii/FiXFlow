from typing import Optional, List
from sqlalchemy.orm import Session
from app.api.schemas.pagination import Pagination
from fastapi import HTTPException
from app.database import models
from app.database.repositories.technician_repository import TechnicianRepository
from app.controllers.request_controller import format_technician_info

class TechnicianController:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TechnicianRepository(db)

    def list(self, page: Pagination, category_id: Optional[int] = None, *, category: str | None = None,
             available: bool = False, best_match: bool = False) -> List[dict]:
        techs = self.repo.list_all(page, category_id=category_id, category=category, available=available, best_match=best_match)
        return [format_technician_info(t) for t in techs]

    def get_by_id(self, tech_id: int) -> dict:
        tech = self.repo.get_by_id(tech_id)
        if not tech:
            raise HTTPException(status_code=404, detail="Technician not found")
        return format_technician_info(tech)

    def update_availability(self, tech_id: int, availability: str) -> dict:
        tech = self.repo.get_by_id(tech_id)
        if not tech:
            raise HTTPException(status_code=404, detail="Technician not found")
        tech.availability = models.AvailabilityStatus(availability)
        self.db.commit()
        return format_technician_info(tech)
