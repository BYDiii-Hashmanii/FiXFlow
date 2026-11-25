from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.pagination import Pagination
from app.database import models

router = APIRouter(tags=["Categories"])

@router.get("/categories", response_model=ApiResponse[list])
def list_categories(db: Session = Depends(get_db), page: Pagination = Depends()):
    cats = page.apply(db.query(models.ServiceCategory).order_by(models.ServiceCategory.name)).all()
    icons = {
        "Plumbing": "pipe",
        "Electrical": "bolt",
        "AC Repair": "fan",
        "Carpentry": "hammer",
        "Appliance": "wrench",
        "Other": "tool"
    }
    data = [
        {
            "id": str(c.id),
            "name": c.name,
            "icon": icons.get(c.name, "wrench"),
            "active": True
        }
        for c in cats
    ]
    return ApiResponse.wrap(data)
