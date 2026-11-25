from typing import Annotated

from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.pagination import Pagination
from app.api.schemas.workflow_schemas import DeclineOffer
from app.controllers.offer_controller import OfferController
from app.database.models import User, UserRole
from app.database.session import get_db
from app.middlewares.auth_middleware import require_role

router = APIRouter(tags=["Technician offers"])
tech_only = require_role(UserRole.technician)
OfferID = Annotated[int, Path(gt=0, le=2_147_483_647)]


@router.get("/technician/offers", response_model=ApiResponse[list])
def inbox(user: User = Depends(tech_only), db: Session = Depends(get_db), page: Pagination = Depends()):
    return ApiResponse.wrap(OfferController(db).inbox(user, page))


@router.post("/offers/{id}/accept", response_model=ApiResponse[dict])
def accept(id: OfferID, user: User = Depends(tech_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(OfferController(db).decide(id, user))


@router.post("/offers/{id}/decline", response_model=ApiResponse[dict])
def decline(id: OfferID, payload: DeclineOffer, user: User = Depends(tech_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(OfferController(db).decide(id, user, payload.reason))


@router.get("/technician/requests/{id}", response_model=ApiResponse[dict])
def technician_request(id: str, user: User = Depends(tech_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(OfferController(db).get(user, id))
