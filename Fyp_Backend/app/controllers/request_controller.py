import logging
from datetime import timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.schemas.pagination import Pagination
from app.config.settings import settings
from app.controllers.auth_controller import get_initials
from app.controllers.lifecycle import commit
from app.controllers.uploads import media_url, store_image
from app.database import models as m
from app.database.repositories.access import company_id, found
from app.database.repositories.loading import request_loads
from app.database.repositories.numbers import next_number
from app.database.repositories.technician_repository import by_best_match
from app.model_handle.inference import chat_inference, image_inference
from app.model_handle.llama_model.repair_guidance import generate_repair_guidance

logger = logging.getLogger(__name__)


def format_technician_info(tech: m.Technician | None) -> dict | None:
    if tech is None:
        return None
    reviews = tech.reviews
    return {
        "id": str(tech.user_id),
        "name": tech.user.full_name,
        "company": tech.company.name,
        "rating": round(sum(review.rating for review in reviews) / len(reviews), 1) if reviews else None,
        "reviewCount": len(reviews),
        "rate": float(tech.service_rate),
        "availability": tech.availability.value,
        "avatarInitials": get_initials(tech.user.full_name),
        "serviceCategory": tech.category.name,
        "categoryId": tech.category_id,
        "jobsCompleted": sum(job.status == m.JobStatus.closed for job in tech.jobs),
    }


def format_analysis(req: m.ServiceRequest) -> dict:
    analysis = req.ai_analysis if req.analysis_state == "ready" else None
    return {
        "state": req.analysis_state, "provenance": req.analysis_source,
        "stage": req.analysis_stage, "visionState": req.vision_state,
        "confidence": float(req.analysis_confidence) if req.analysis_confidence is not None else None,
        "detectorLabel": req.detector_label, "detectedCategory": req.detected_category,
        "title": analysis.problem_title if analysis else None,
        "category": req.guidance_category or req.detected_category or req.category.name,
        "urgency": analysis.urgency.value if analysis else None,
        "summary": analysis.summary if analysis else None,
        "safetyNote": analysis.safety_note if analysis else None,
        "steps": [
            {"stepNo": step.step_no, "instruction": step.instruction, "completed": False}
            for step in (analysis.steps if analysis else ())
        ],
    }


def format_request_response(req: m.ServiceRequest, *, include_analysis: bool = True) -> dict:
    return {
        "id": req.request_no,
        "title": req.title,
        "customerId": str(req.customer_id),
        "customerName": req.customer.full_name,
        "categoryId": req.category_id,
        "category": req.category.name,
        "description": req.description,
        "accessTime": req.access_time,
        "photoUrl": media_url(req.photo_path) if req.photo_path else None,
        "urgency": req.urgency.value if req.urgency else None,
        "status": req.status.value,
        "assignedTechnician": format_technician_info(req.assigned_technician),
        "aiAnalysis": format_analysis(req) if include_analysis else None,
        "bookingMode": req.booking_mode.value if req.booking_mode else None,
        "estimatedPrice": float(req.assigned_technician.service_rate) if req.assigned_technician else None,
        "createdAt": req.created_at.isoformat(),
        "updatedAt": req.updated_at.isoformat(),
    }


def analyze_file(path: Path) -> dict:
    from app.model_handle.image_model.prediction import ISSUE_METADATA, predict_image

    result = predict_image(path)
    if result.get("primary_issue") not in ISSUE_METADATA:
        result["analysis"] = None
    return result


async def analyze_request(bind, request_id: int, photo: str | None) -> None:
    result = {}
    vision = "skipped"
    if photo:
        try:
            result = await image_inference.run(analyze_file, Path(photo), timeout=settings.IMAGE_TIMEOUT_SECONDS)
            vision = "ready" if result.get("analysis") else "no_detection"
        except Exception:
            logger.warning("Image inference failed for request %s", request_id, exc_info=True)
            vision = "failed"
    try:
        detected = result.get("analysis") or {}
        with Session(bind) as db:
            req = db.get(m.ServiceRequest, request_id)
            if req is None or req.analysis_state != "pending":
                return
            description, category = req.description, req.category.name
            req.analysis_stage = "guidance"
            req.vision_state = vision
            req.analysis_confidence = result.get("confidence")
            req.detector_label = result.get("primary_issue")
            req.detected_category = detected.get("category")
            if not description and vision != "ready":
                req.analysis_stage = "done"
                req.analysis_state = vision
                req.analysis_source = "yolo"
                db.commit()
                return
            db.commit()

        guidance = await chat_inference.run(
            generate_repair_guidance, description or "", category,
            {"label": result.get("primary_issue"), "category": detected.get("category"),
             "confidence": result.get("confidence"), "state": vision},
            timeout=settings.GUIDANCE_TIMEOUT_SECONDS,
        )
        with Session(bind) as db:
            req = db.get(m.ServiceRequest, request_id)
            if req is None or req.analysis_state != "pending":
                return
            req.analysis_state, req.analysis_stage = "ready", "done"
            req.analysis_source = "yolo+llama" if vision == "ready" else "llama"
            req.guidance_category = guidance.category
            req.urgency = m.UrgencyLevel(guidance.urgency)
            req.title = guidance.title
            db.add(m.AiAnalysis(
                request=req, problem_title=guidance.title, summary=guidance.summary,
                urgency=req.urgency, safety_note=guidance.safety_note,
                steps=[m.AiRepairStep(step_no=index, instruction=instruction)
                       for index, instruction in enumerate(guidance.steps, 1)],
            ))
            db.commit()
    except Exception:
        logger.exception("Repair guidance failed for request %s", request_id)
        with Session(bind) as db:
            req = db.get(m.ServiceRequest, request_id)
            if req and req.analysis_state == "pending":
                req.analysis_state = "failed"
                req.analysis_stage = "done"
                db.commit()


class RequestController:
    def __init__(self, db: Session):
        self.db = db

    def create_request(
        self, category_id: int, description: str, access_time: str,
        photo_file: UploadFile | None, user: m.User,
    ) -> m.ServiceRequest:
        description = description.strip()
        if not description and not photo_file:
            raise HTTPException(422, "Add a photo or describe the problem")
        cat = found(self.db.query(m.ServiceCategory).filter_by(id=category_id), "Category")
        path = store_image(photo_file) if photo_file else None
        try:
            req = m.ServiceRequest(
                request_no=next_number(self.db, "request"), customer_id=user.id, category_id=cat.id,
                title=cat.name, description=description, photo_path=str(path) if path else None,
                address=user.address, access_time=access_time, status=m.RequestStatus.ai_analysis,
                analysis_state="pending", analysis_stage="image" if path else "guidance",
            )
            self.db.add(req)
            commit(self.db)
        except Exception:
            self.db.rollback()
            if path:
                path.unlink(missing_ok=True)
            raise
        return req

    def list_requests(self, query, page: Pagination, tab=None, status_filter=None) -> list[dict]:
        if tab == "active":
            query = query.filter(m.ServiceRequest.status.in_((
                m.RequestStatus.ai_analysis, m.RequestStatus.waiting, m.RequestStatus.accepted,
                m.RequestStatus.in_progress,
            )))
        elif tab == "completed":
            query = query.filter(m.ServiceRequest.status.in_((
                m.RequestStatus.closed_paid, m.RequestStatus.completed, m.RequestStatus.solved_by_customer,
            )))
        elif status_filter:
            query = query.filter(m.ServiceRequest.status == status_filter)
        query = query.options(*request_loads()).order_by(m.ServiceRequest.created_at.desc(), m.ServiceRequest.id.desc())
        return [format_request_response(req, include_analysis=False) for req in page.apply(query)]

    def auto_select(self, req: m.ServiceRequest) -> dict:
        query = self.db.query(m.Technician).filter(
            m.Technician.category_id == req.category_id,
            m.Technician.user.has(m.User.is_active.is_(True)),
            m.Technician.availability == m.AvailabilityStatus.available,
            ~m.Technician.offers.any(m.RequestOffer.request_id == req.id),
        )
        tech = by_best_match(query).first()
        if not tech:
            raise HTTPException(404, "No available technician for this category")
        return format_technician_info(tech)

    def track(self, req: m.ServiceRequest, user: m.User) -> dict:
        offers = req.offers
        job = req.job
        if user.role == m.UserRole.technician:
            offers = [item for item in offers if item.technician_id == user.id]
            if job and job.technician_id != user.id:
                job = None
        elif user.role == m.UserRole.owner:
            company = company_id(self.db, user)
            offers = [item for item in offers if item.technician.company_id == company]
            if job and job.technician.company_id != company:
                job = None
        assigned = job.technician_id if job else req.assigned_technician_id
        active_offers = [item for item in offers if assigned is None or item.technician_id == assigned]
        offer = max(active_offers, key=lambda item: (item.sent_at, item.id), default=None)
        invoice = job.invoice if job else None
        status = req.status.value
        if status == m.RequestStatus.ai_analysis.value and offer and offer.status == m.OfferStatus.declined:
            status = "declined"
        return {
            "id": req.request_no,
            "requestId": req.request_no,
            "jobId": req.request_no if job else None,
            "title": req.title,
            "category": req.category.name,
            "accessTime": req.access_time,
            "offeredPrice": float(offer.quoted_price) if offer else None,
            "status": status,
            "offerStatus": offer.status.value if offer else None,
            "previousTechnicianIds": [str(item.technician_id) for item in offers],
            "declineReason": offer.decline_reason.value if offer and offer.decline_reason else None,
            "retryAllowed": status == "declined",
            "jobStatus": job.status.value if job else None,
            "invoiceId": invoice.invoice_no if invoice else None,
            "invoiceEligible": bool(job and job.status == m.JobStatus.completed),
            "technician": format_technician_info(job.technician if job else offer.technician if offer else None),
            "timeline": {
                key: when.replace(tzinfo=timezone.utc).isoformat() if when else None
                for key, when in {
                    "sentAt": offer.sent_at if offer else None,
                    "respondedAt": offer.responded_at if offer else None,
                    "acceptedAt": job.accepted_at if job else None,
                    "startedAt": job.started_at if job else None,
                    "completedAt": job.completed_at if job else None,
                    "closedAt": job.closed_at if job else None,
                }.items()
            },
        }
