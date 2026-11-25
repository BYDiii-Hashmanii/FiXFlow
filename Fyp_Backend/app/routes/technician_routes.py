from typing import Annotated
from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.pagination import Pagination
from app.controllers.technician_controller import TechnicianController

router = APIRouter(tags=["Technicians"])

@router.get("/technicians", response_model=ApiResponse[list])
def list_technicians(categoryId: int | None = None, category: str | None = None, available: bool = False,
                     bestMatch: bool = False, db: Session = Depends(get_db), page: Pagination = Depends()):
    ctrl = TechnicianController(db)
    items = ctrl.list(page, category_id=categoryId, category=category, available=available, best_match=bestMatch)
    return ApiResponse.wrap(items)

@router.get("/technicians/{id}", response_model=ApiResponse[dict])
def get_technician_by_id(id: Annotated[int, Path(gt=0, le=2_147_483_647)], db: Session = Depends(get_db)):
    ctrl = TechnicianController(db)
    item = ctrl.get_by_id(id)
    return ApiResponse.wrap(item)
