from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload
from app.api.schemas.pagination import Pagination

from app.controllers.lifecycle import commit, notify, now_utc, require_transition, transition
from app.controllers.auth_controller import get_initials
from app.controllers.request_controller import format_technician_info, require_booking_category
from app.controllers.uploads import media_url
from app.database import models as m
from app.database.repositories.access import found
from app.database.repositories.loading import request_loads, technician_loads


def offer_response(offer: m.RequestOffer) -> dict:
    req = offer.request
    return {
        "id": str(offer.id),
        "requestId": req.request_no,
        "technicianId": str(offer.technician_id),
        "technician": format_technician_info(offer.technician),
        "status": offer.status.value,
        "declineReason": offer.decline_reason.value if offer.decline_reason else None,
        "offeredPrice": float(offer.quoted_price),
        "createdAt": offer.sent_at.isoformat(),
        "respondedAt": offer.responded_at.isoformat() if offer.responded_at else None,
    }


class OfferController:
    def __init__(self, db: Session):
        self.db = db

    def card(self, offer: m.RequestOffer) -> dict:
        req = offer.request
        can_contact = offer.status == m.OfferStatus.accepted and req.assigned_technician_id == offer.technician_id
        return {
            **offer_response(offer), "title": req.title, "description": req.description,
            "category": req.effective_category.name, "accessTime": req.access_time,
            "detectedDisplayName": req.detected_display_name if req.vision_state == "ready" else None,
            "detectionConfidence": float(req.analysis_confidence) if req.vision_state == "ready" and req.analysis_confidence is not None else None,
            "photoUrl": media_url(req.photo_path) if req.photo_path else None,
            "customer": {"name": req.customer.full_name, "avatarInitials": get_initials(req.customer.full_name),
                         "phone": req.customer.phone if can_contact else None, "address": req.address},
            "urgency": req.urgency.value if req.urgency else None,
        }

    def get(self, technician: m.User, request_no: str) -> dict:
        offer = found(self.db.query(m.RequestOffer).filter(
            m.RequestOffer.technician_id == technician.id,
            m.RequestOffer.request.has(m.ServiceRequest.request_no == request_no),
        ), "Offer")
        return self.card(offer)

    def inbox(self, technician: m.User, page: Pagination) -> list[dict]:
        query = self.db.query(m.RequestOffer).filter(
            m.RequestOffer.technician_id == technician.id, m.RequestOffer.status == m.OfferStatus.pending,
        ).options(selectinload(m.RequestOffer.request).options(*request_loads()),
                  selectinload(m.RequestOffer.technician).options(*technician_loads()))
        return [self.card(offer) for offer in page.apply(query.order_by(m.RequestOffer.sent_at.desc(), m.RequestOffer.id.desc()))]

    def send(self, req: m.ServiceRequest, technician_id: int) -> dict:
        require_booking_category(req)
        tech = found(
            self.db.query(m.Technician).filter(
                m.Technician.user_id == technician_id,
                m.Technician.user.has(m.User.is_active.is_(True)),
            ), "Technician"
        )
        if tech.category_id != req.effective_category_id or tech.availability != m.AvailabilityStatus.available:
            raise HTTPException(409, "Technician is unavailable for this category")
        require_transition(transition(
            self.db, m.ServiceRequest, req.id, (m.RequestStatus.ai_analysis,), m.RequestStatus.waiting,
            conditions=(m.ServiceRequest.assigned_technician_id.is_(None),
                        m.ServiceRequest.analysis_state != "pending",
                        func.coalesce(m.ServiceRequest.final_category_id, m.ServiceRequest.category_id) == tech.category_id,
                        ~m.ServiceRequest.offers.any(m.RequestOffer.status == m.OfferStatus.pending)),
            assigned_technician_id=tech.user_id,
        ))
        if self.db.query(m.RequestOffer.id).filter_by(request_id=req.id, technician_id=tech.user_id).first():
            raise HTTPException(409, "Choose a different technician")
        offer = m.RequestOffer(request=req, technician=tech, quoted_price=tech.service_rate, status=m.OfferStatus.pending)
        self.db.add(offer)
        notify(self.db, tech.user_id, m.NotificationType.offer, "New service request", req)
        commit(self.db)
        return offer_response(offer)

    def decide(self, offer_id: int, user: m.User, reason: m.DeclineReason | None = None) -> dict:
        offer = found(
            self.db.query(m.RequestOffer).filter_by(id=offer_id, technician_id=user.id),
            "Offer",
        )
        req = offer.request
        accepted = reason is None
        status = m.OfferStatus.accepted if accepted else m.OfferStatus.declined
        timestamp = now_utc()
        # Claim the request first so decisions, cancellation and rebooking share the same write order.
        require_transition(transition(
            self.db, m.ServiceRequest, req.id, (m.RequestStatus.waiting,),
            m.RequestStatus.accepted if accepted else m.RequestStatus.ai_analysis,
            conditions=(m.ServiceRequest.assigned_technician_id == user.id,
                        ~m.ServiceRequest.job.has()),
            assigned_technician_id=user.id if accepted else None,
        ))
        require_transition(transition(
            self.db, m.RequestOffer, offer.id, (m.OfferStatus.pending,), status,
            responded_at=timestamp, decline_reason=reason,
        ))
        if accepted:
            self.db.add(m.Job(request_id=req.id, technician_id=user.id, status=m.JobStatus.accepted, accepted_at=timestamp))
        notify(self.db, req.customer_id, m.NotificationType.offer,
               "Technician accepted the request" if accepted else "Technician declined the request", req)
        commit(self.db)
        return offer_response(offer)
