from typing import Optional, List
from sqlalchemy.orm import Session, selectinload
from app.api.schemas.pagination import Pagination
from app.database import models

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_user(self, user_id: int, page: Pagination) -> List[models.Notification]:
        query = self.db.query(models.Notification).filter(
            models.Notification.user_id == user_id
        ).options(selectinload(models.Notification.request).selectinload(models.ServiceRequest.job).selectinload(models.Job.invoice))
        return page.apply(query.order_by(models.Notification.created_at.desc(), models.Notification.id.desc())).all()

    def mark_read(self, notif_id: int, user_id: int) -> bool:
        notif = self.db.query(models.Notification).filter(
            models.Notification.id == notif_id,
            models.Notification.user_id == user_id
        ).first()
        if notif:
            notif.is_read = True
            self.db.commit()
            return True
        return False

    def mark_all_read(self, user_id: int) -> int:
        count = self.db.query(models.Notification).filter(
            models.Notification.user_id == user_id,
            models.Notification.is_read == False
        ).update({"is_read": True})
        self.db.commit()
        return count

    def create(self, notif: models.Notification) -> models.Notification:
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif
