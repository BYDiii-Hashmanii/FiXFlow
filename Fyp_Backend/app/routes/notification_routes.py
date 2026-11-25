import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.pagination import Pagination
from app.database import models as m
from app.database.repositories.notification_repository import NotificationRepository
from app.database.session import get_db
from app.middlewares.auth_middleware import get_current_user

router = APIRouter(tags=["Notifications"])


def notification_link(note: m.Notification, role: m.UserRole) -> str | None:
    req = note.request
    if not req:
        return None
    if role == m.UserRole.customer:
        if note.type == m.NotificationType.invoice.value and req.job and req.job.invoice:
            return f"/customer/invoices/{req.job.invoice.invoice_no}"
        return f"/customer/requests/{req.request_no}/track"
    if role == m.UserRole.technician:
        if note.type == m.NotificationType.offer.value:
            return f"/technician/requests/{req.request_no}"
        if note.type == m.NotificationType.feedback.value:
            return "/technician/ratings"
        return f"/technician/jobs/{req.request_no}"
    return f"/owner/jobs/{req.request_no}" if req.job else None


@router.get("/notifications", response_model=ApiResponse[list])
def list_notifications(user: m.User = Depends(get_current_user), db: Session = Depends(get_db), page: Pagination = Depends()):
    return ApiResponse.wrap([
        {
            "id": str(note.id), "userId": str(note.user_id), "title": note.title,
            "message": note.message or "", "type": note.type, "read": note.is_read,
            "createdAt": note.created_at.isoformat(), "link": notification_link(note, user.role),
        }
        for note in NotificationRepository(db).list_by_user(user.id, page)
    ])


@router.post("/notifications/{id}/read", response_model=ApiResponse[dict])
def mark_read(id: str, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    match = re.fullmatch(r"(?:notif-)?([0-9]{1,18})", id)
    if not match or not NotificationRepository(db).mark_read(int(match[1]), user.id):
        raise HTTPException(404, "Notification not found")
    return ApiResponse.wrap({"success": True})


@router.post("/notifications/read-all", response_model=ApiResponse[dict])
def mark_all_read(user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ApiResponse.wrap({"success": True, "markedCount": NotificationRepository(db).mark_all_read(user.id)})
