from typing import Optional, List
from sqlalchemy.orm import Session
from app.database import models

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def get_by_phone(self, phone: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.phone == phone).first()

    def get_by_email(self, email: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.email == email).first()

    def get_by_phone_or_email(self, identifier: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(
            (models.User.phone == identifier) | (models.User.email == identifier)
        ).first()

    def create(self, user: models.User) -> models.User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: models.User) -> models.User:
        self.db.commit()
        self.db.refresh(user)
        return user
