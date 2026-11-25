from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.pagination import Pagination
from app.api.schemas.workflow_schemas import AvailabilityUpdate, ProfileUpdate
from app.controllers.profile_controller import TechnicianProfileController
from app.database import models as m
from app.database.session import get_db
from app.middlewares.auth_middleware import require_role

tech_only = require_role(m.UserRole.technician)
router = APIRouter(prefix="/technician", tags=["Technician profile"])


@router.get("/profile", response_model=ApiResponse[dict])
def profile(user: m.User = Depends(tech_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(TechnicianProfileController(db, user).profile())


@router.put("/profile", response_model=ApiResponse[dict])
def edit_profile(payload: ProfileUpdate, user: m.User = Depends(tech_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(TechnicianProfileController(db, user).update(payload))


@router.put("/availability", response_model=ApiResponse[dict])
def availability(payload: AvailabilityUpdate, user: m.User = Depends(tech_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(TechnicianProfileController(db, user).availability(payload.availability))


@router.get("/schedule", response_model=ApiResponse[list])
def schedule(user: m.User = Depends(tech_only), db: Session = Depends(get_db), page: Pagination = Depends()):
    return ApiResponse.wrap(TechnicianProfileController(db, user).schedule(page))


@router.get("/ratings", response_model=ApiResponse[list])
def ratings(user: m.User = Depends(tech_only), db: Session = Depends(get_db), page: Pagination = Depends()):
    return ApiResponse.wrap(TechnicianProfileController(db, user).ratings(page))
