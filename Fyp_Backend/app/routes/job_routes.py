from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.pagination import Pagination
from app.api.schemas.workflow_schemas import SubmitReview, WorkUpdate
from app.controllers.invoice_controller import InvoiceController
from app.controllers.job_controller import JobController, format_job_response, format_photo
from app.controllers.lifecycle import commit, require_transition, transition
from app.controllers.uploads import store_image
from app.database import models as m
from app.database.repositories.access import job_record, job_scope
from app.database.repositories.loading import job_loads
from app.database.session import get_db
from app.middlewares.auth_middleware import get_current_user, require_role

router = APIRouter(tags=["Jobs"])
tech_only = require_role(m.UserRole.technician)
customer_only = require_role(m.UserRole.customer)


@router.get("/jobs", response_model=ApiResponse[list])
def list_jobs(status: m.JobStatus | None = None, user: m.User = Depends(get_current_user), db: Session = Depends(get_db), page: Pagination = Depends()):
    query = job_scope(db, user)
    if status:
        query = query.filter(m.Job.status == status)
    return ApiResponse.wrap([format_job_response(job) for job in page.apply(query.options(*job_loads()).order_by(m.Job.id.desc()))])


@router.get("/jobs/{id}", response_model=ApiResponse[dict])
def get_job(id: str, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ApiResponse.wrap(format_job_response(job_record(db, user, id)))


@router.post("/jobs/{id}/start", response_model=ApiResponse[dict])
def start_job(id: str, user: m.User = Depends(tech_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(JobController(db).start_job(job_record(db, user, id)))


@router.put("/jobs/{id}/update", response_model=ApiResponse[dict])
@router.post("/jobs/{id}/update", response_model=ApiResponse[dict])
def update_job(id: str, payload: WorkUpdate, user: m.User = Depends(tech_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(JobController(db).update_work(job_record(db, user, id), payload))


@router.post("/jobs/{id}/complete", response_model=ApiResponse[dict])
def complete_job(id: str, user: m.User = Depends(tech_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(JobController(db).complete_job(job_record(db, user, id)))


@router.post("/jobs/{id}/invoice", response_model=ApiResponse[dict])
def issue_invoice(id: str, user: m.User = Depends(tech_only), db: Session = Depends(get_db)):
    invoice = JobController(db).generate_invoice(job_record(db, user, id))
    return ApiResponse.wrap(InvoiceController(db).get_invoice(invoice))


@router.post("/jobs/{id}/review", response_model=ApiResponse[dict])
def submit_review(id: str, payload: SubmitReview, user: m.User = Depends(customer_only), db: Session = Depends(get_db)):
    job = job_record(db, user, id)
    if job.status != m.JobStatus.closed or not job.invoice or job.invoice.status != m.InvoiceStatus.paid:
        raise HTTPException(409, "Feedback is available after payment")
    review = m.Review(
        job_id=job.id, customer_id=user.id, technician_id=job.technician_id,
        rating=payload.rating, comment=payload.comment,
    )
    db.add_all([
        review,
        m.Notification(
            user_id=job.technician_id, title="New feedback", message=f"{payload.rating} stars",
            type=m.NotificationType.feedback.value, request_id=job.request_id,
        ),
    ])
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(409, "A review already exists") from exc
    return ApiResponse.wrap({
        "id": str(review.id), "jobId": job.request.request_no, "customerId": str(user.id),
        "customerName": user.full_name, "technicianId": str(job.technician_id),
        "rating": review.rating, "comment": review.comment, "createdAt": review.created_at.isoformat(),
    })


@router.post("/jobs/{id}/photos", response_model=ApiResponse[dict])
def upload_job_photo(
    id: str, photo: UploadFile = File(...), photoType: m.PhotoType = Form(...),
    user: m.User = Depends(tech_only), db: Session = Depends(get_db),
):
    job = job_record(db, user, id)
    if job.status != m.JobStatus.in_progress:
        raise HTTPException(409, "Work must be in progress")
    path = store_image(photo)
    try:
        require_transition(transition(db, m.Job, job.id, (m.JobStatus.in_progress,), m.JobStatus.in_progress))
        entry = m.JobPhoto(job_id=job.id, photo_type=photoType, photo_path=str(path))
        db.add(entry)
        commit(db)
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        raise
    return ApiResponse.wrap(format_photo(entry))
