from datetime import date

from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.api.schemas.pagination import Pagination
from app.database.repositories.loading import job_loads, review_loads

from app.api.schemas.workflow_schemas import ProfileUpdate
from app.controllers.auth_controller import format_user_response, get_initials
from app.controllers.lifecycle import commit, now_utc
from app.controllers.request_controller import format_technician_info
from app.database import models as m
from app.database.repositories.access import found


def update_profile(db: Session, user: m.User, payload: ProfileUpdate) -> dict:
    values = payload.model_dump(exclude_unset=True)
    criteria = []
    if values.get("phone"):
        criteria.append(m.User.phone == values["phone"])
    if values.get("email"):
        criteria.append(func.lower(m.User.email) == values["email"])
    if criteria and db.query(m.User.id).filter(m.User.id != user.id, or_(*criteria)).first():
        raise HTTPException(409, "An account already uses this identifier")
    for field, value in values.items():
        if field in ("fullName", "phone") and value is None:
            continue
        setattr(user, "full_name" if field == "fullName" else field, value)
    commit(db)
    return format_user_response(user)


class TechnicianProfileController:
    def __init__(self, db: Session, user: m.User):
        self.db = db
        self.user = user
        self.tech = found(db.query(m.Technician).filter_by(user_id=user.id), "Technician")

    def profile(self) -> dict:
        tech = self.tech
        today = now_utc().date()
        earnings = self.db.query(func.sum(m.Payment.amount)).join(m.Invoice).join(m.Job).filter(
            m.Job.technician_id == tech.user_id, func.date(m.Payment.paid_at) == today.isoformat()
        ).scalar()
        return {
            **format_technician_info(tech),
            "phone": self.user.phone, "email": self.user.email,
            "initials": get_initials(self.user.full_name), "isAvailable": tech.availability == m.AvailabilityStatus.available,
            "totalReviews": len(tech.reviews), "serviceCategories": [tech.category.name],
            "serviceArea": self.user.address, "todayEarnings": float(earnings or 0),
            "activeJobsCount": sum(job.status in (m.JobStatus.accepted, m.JobStatus.in_progress) for job in tech.jobs),
            "pendingRequestsCount": sum(offer.status == m.OfferStatus.pending for offer in tech.offers),
        }

    def update(self, payload: ProfileUpdate) -> dict:
        update_profile(self.db, self.user, payload)
        return self.profile()

    def availability(self, availability: m.AvailabilityStatus) -> dict:
        self.tech.availability = availability
        commit(self.db)
        return self.profile()

    def schedule(self, page: Pagination) -> list[dict]:
        today = now_utc().date()
        result = []
        jobs = self.db.query(m.Job).filter_by(technician_id=self.user.id).filter(
            m.Job.status.in_((m.JobStatus.accepted, m.JobStatus.in_progress, m.JobStatus.completed))
        ).options(*job_loads()).order_by(m.Job.accepted_at.desc(), m.Job.id.desc())
        for job in page.apply(jobs):
            req = job.request
            access = req.access_time or ""
            try:
                scheduled = date.fromisoformat(access[:10])
            except ValueError:
                scheduled = None
            result.append({
                "id": str(job.id), "jobId": req.request_no, "title": req.title, "customerName": req.customer.full_name,
                "address": req.address, "timeSlot": access or None, "date": scheduled.isoformat() if scheduled else None,
                "isToday": scheduled == today, "status": "scheduled" if job.status == m.JobStatus.accepted else job.status.value,
            })
        return result

    def ratings(self, page: Pagination) -> list[dict]:
        reviews = self.db.query(m.Review).filter_by(technician_id=self.user.id).options(*review_loads()).order_by(m.Review.created_at.desc(), m.Review.id.desc())
        return [{
            "id": str(review.id), "customerName": review.customer.full_name,
            "customerInitials": get_initials(review.customer.full_name), "rating": review.rating,
            "date": review.created_at.isoformat(), "jobTitle": review.job.request.title, "comment": review.comment,
        } for review in page.apply(reviews)]
