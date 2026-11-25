from typing import Annotated, Literal

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.pagination import Pagination
from app.api.schemas.workflow_schemas import CreateOffer
from app.controllers.invoice_controller import InvoiceController
from app.controllers.lifecycle import finish_request_early
from app.controllers.offer_controller import OfferController
from app.controllers.request_controller import RequestController, analyze_request, format_analysis, format_request_response
from app.database import models as m
from app.database.repositories.access import invoice_record, request_record, request_scope
from app.database.session import get_db
from app.middlewares.auth_middleware import get_current_user, require_role

router = APIRouter(tags=["Service Requests"])
customer_only = require_role(m.UserRole.customer)


@router.post("/requests", response_model=ApiResponse[dict])
def create_request(
    background: BackgroundTasks,
    categoryId: Annotated[int, Form(gt=0, le=2_147_483_647)],
    description: Annotated[str, Form(max_length=2000)] = "",
    accessTime: Annotated[str, Form(max_length=100)] = "",
    photo: UploadFile | None = File(None),
    user: m.User = Depends(customer_only),
    db: Session = Depends(get_db),
):
    req = RequestController(db).create_request(categoryId, description, accessTime, photo, user)
    background.add_task(analyze_request, db.get_bind(), req.id, req.photo_path)
    return ApiResponse.wrap(format_request_response(req))


@router.get("/requests", response_model=ApiResponse[list])
def list_requests(
    tab: Literal["all", "active", "completed"] | None = None,
    status: m.RequestStatus | None = None,
    user: m.User = Depends(get_current_user),
    db: Session = Depends(get_db), page: Pagination = Depends(),
):
    return ApiResponse.wrap(RequestController(db).list_requests(request_scope(db, user), page, tab, status))


@router.get("/requests/{id}", response_model=ApiResponse[dict])
def get_request(id: str, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ApiResponse.wrap(format_request_response(request_record(db, user, id)))


@router.get("/requests/{id}/analysis", response_model=ApiResponse[dict])
@router.post("/requests/{id}/analyze", response_model=ApiResponse[dict])
def get_analysis(id: str, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = request_record(db, user, id)
    return ApiResponse.wrap(format_analysis(req))


@router.post("/requests/{id}/solved", response_model=ApiResponse[dict])
def mark_solved(id: str, user: m.User = Depends(customer_only), db: Session = Depends(get_db)):
    req = request_record(db, user, id)
    return ApiResponse.wrap(finish_request_early(db, req, m.RequestStatus.solved_by_customer))


@router.post("/requests/{id}/cancel", response_model=ApiResponse[dict])
def cancel_request(id: str, user: m.User = Depends(customer_only), db: Session = Depends(get_db)):
    req = request_record(db, user, id)
    return ApiResponse.wrap(finish_request_early(db, req, m.RequestStatus.cancelled))


@router.post("/requests/{id}/auto-select", response_model=ApiResponse[dict])
def auto_select(id: str, user: m.User = Depends(customer_only), db: Session = Depends(get_db)):
    req = request_record(db, user, id)
    return ApiResponse.wrap(RequestController(db).auto_select(req))


@router.post("/requests/{id}/offers", response_model=ApiResponse[dict])
def send_offer(id: str, payload: CreateOffer, user: m.User = Depends(customer_only), db: Session = Depends(get_db)):
    req = request_record(db, user, id)
    return ApiResponse.wrap(OfferController(db).send(req, payload.technicianId))


@router.get("/requests/{id}/track", response_model=ApiResponse[dict])
def track_request(id: str, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = request_record(db, user, id)
    return ApiResponse.wrap(RequestController(db).track(req, user))


@router.get("/requests/{id}/invoice", response_model=ApiResponse[dict])
def get_request_invoice(id: str, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = request_record(db, user, id)
    if not req.job or not req.job.invoice:
        raise HTTPException(404, "Invoice not found")
    invoice = invoice_record(db, user, req.job.invoice.invoice_no)
    return ApiResponse.wrap(InvoiceController(db).get_invoice(invoice))
