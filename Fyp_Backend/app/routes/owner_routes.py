from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.pagination import Pagination
from app.api.schemas.workflow_schemas import ProfileUpdate, TechnicianCreate, TechnicianUpdate
from app.controllers.auth_controller import format_user_response
from app.api.schemas.owner_contracts import CompanyInvoice, CompanyJob, CompanyReview, FeedbackSummary, OwnerTechnician
from app.controllers.owner_controller import OwnerController, format_owner_invoice, format_owner_technician, format_review, map_to_company_job
from app.controllers.profile_controller import update_profile
from app.database import models as m
from app.database.repositories.access import company_id, found, invoice_record, job_record, technician_scope
from app.database.session import get_db
from app.middlewares.auth_middleware import require_role
from app.routes.notification_routes import list_notifications

owner_only = require_role(m.UserRole.owner)
router = APIRouter(prefix="/owner", tags=["Company Owner"], dependencies=[Depends(owner_only)])


@router.get("/dashboard", response_model=ApiResponse[dict])
def dashboard(user: m.User = Depends(owner_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(OwnerController(db).get_dashboard(user))


@router.get("/technicians", response_model=ApiResponse[list[OwnerTechnician]])
def technicians(user: m.User = Depends(owner_only), db: Session = Depends(get_db), page: Pagination = Depends()):
    return ApiResponse.wrap(OwnerController(db).list_technicians(user, page))


@router.get("/technicians/{id}", response_model=ApiResponse[OwnerTechnician])
def technician(id: Annotated[int, Path(gt=0, le=2_147_483_647)], user: m.User = Depends(owner_only), db: Session = Depends(get_db)):
    tech = found(technician_scope(db, user).filter(m.Technician.user_id == id), "Technician")
    return ApiResponse.wrap(format_owner_technician(tech))


@router.post("/technicians", response_model=ApiResponse[OwnerTechnician])
def add_technician(payload: TechnicianCreate, user: m.User = Depends(owner_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(OwnerController(db).create_technician(payload, user))


@router.put("/technicians/{id}", response_model=ApiResponse[OwnerTechnician])
def edit_technician(id: Annotated[int, Path(gt=0, le=2_147_483_647)], payload: TechnicianUpdate, user: m.User = Depends(owner_only), db: Session = Depends(get_db)):
    tech = found(technician_scope(db, user).filter(m.Technician.user_id == id), "Technician")
    return ApiResponse.wrap(OwnerController(db).update_technician(tech, payload))


@router.get("/jobs", response_model=ApiResponse[list[CompanyJob]])
def jobs(status: Literal["active", "completed"] | None = None, user: m.User = Depends(owner_only), db: Session = Depends(get_db), page: Pagination = Depends()):
    return ApiResponse.wrap(OwnerController(db).list_jobs(user, page, status))


@router.get("/jobs/{id}", response_model=ApiResponse[CompanyJob])
def job(id: str, user: m.User = Depends(owner_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(map_to_company_job(job_record(db, user, id)))


@router.get("/invoices", response_model=ApiResponse[list[CompanyInvoice]])
def invoices(status: m.InvoiceStatus | None = None, user: m.User = Depends(owner_only), db: Session = Depends(get_db), page: Pagination = Depends()):
    return ApiResponse.wrap(OwnerController(db).list_invoices(user, page, status))


@router.get("/invoices/{id}", response_model=ApiResponse[CompanyInvoice])
def invoice(id: str, user: m.User = Depends(owner_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(format_owner_invoice(invoice_record(db, user, id)))


@router.get("/feedback", response_model=ApiResponse[FeedbackSummary])
def feedback(user: m.User = Depends(owner_only), db: Session = Depends(get_db), page: Pagination = Depends()):
    return ApiResponse.wrap(OwnerController(db).list_feedback(user, page))


@router.get("/feedback/{id}", response_model=ApiResponse[CompanyReview])
def review(id: Annotated[int, Path(gt=0, le=2_147_483_647)], user: m.User = Depends(owner_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(format_review(found(OwnerController(db).review_scope(user).filter(m.Review.id == id), "Review")))


@router.get("/notifications", response_model=ApiResponse[list])
def notifications(user: m.User = Depends(owner_only), db: Session = Depends(get_db), page: Pagination = Depends()):
    return list_notifications(user, db, page)


@router.get("/profile", response_model=ApiResponse[dict])
def profile(user: m.User = Depends(owner_only), db: Session = Depends(get_db)):
    company = db.get(m.Company, company_id(db, user))
    return ApiResponse.wrap({**format_user_response(user), "company": company.name})


@router.put("/profile", response_model=ApiResponse[dict])
def edit_profile(payload: ProfileUpdate, user: m.User = Depends(owner_only), db: Session = Depends(get_db)):
    company_id(db, user)
    return ApiResponse.wrap(update_profile(db, user, payload))
