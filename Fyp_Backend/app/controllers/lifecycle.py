from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import models as m


def now_utc() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def transition(db: Session, model, key, previous, target, *, conditions=(), **changes) -> bool:
    result = db.execute(
        update(model)
        .where(model.id == key, model.status.in_(previous), *conditions)
        .values(status=target, **changes)
        .execution_options(synchronize_session=False)
    )
    return result.rowcount == 1


def require_transition(changed: bool) -> None:
    if not changed:
        raise HTTPException(409, "This action is unavailable in the current state")


def commit(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(409, "This change conflicts with an existing record") from exc


def notify(db: Session, recipient: int, kind: m.NotificationType, title: str, req: m.ServiceRequest) -> None:
    db.add(m.Notification(user_id=recipient, title=title, message=req.request_no, type=kind.value, request_id=req.id))


def finish_request_early(db: Session, req: m.ServiceRequest, target: m.RequestStatus) -> dict:
    early = (m.RequestStatus.ai_analysis, m.RequestStatus.waiting, m.RequestStatus.accepted)
    require_transition(transition(db, m.ServiceRequest, req.id, early, target, assigned_technician_id=None))
    if req.job:
        require_transition(transition(db, m.Job, req.job.id, (m.JobStatus.accepted,), m.JobStatus.cancelled))
    db.execute(
        update(m.RequestOffer)
        .where(m.RequestOffer.request_id == req.id, m.RequestOffer.status == m.OfferStatus.pending)
        .values(status=m.OfferStatus.declined, decline_reason=m.DeclineReason.other, responded_at=now_utc())
    )
    commit(db)
    return {"success": True}
