from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.schemas.auth_schemas import LoginRequest, RegisterRequest
from app.database.models import User, UserRole
from app.middlewares.security import create_access_token, get_password_hash, verify_password


def get_initials(name: str) -> str:
    parts = name.split()
    return (parts[0][:2] if len(parts) == 1 else "".join(part[0] for part in parts[:2])).upper() if parts else ""


def format_user_response(user: User) -> dict:
    return {
        "id": str(user.id),
        "fullName": user.full_name,
        "phone": user.phone,
        "email": user.email,
        "role": user.role.value,
        "company": user.company.name if user.role == UserRole.owner and user.company else None,
        "avatarInitials": get_initials(user.full_name),
        "address": user.address,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }


def signed_in(user: User) -> dict:
    return {
        **format_user_response(user),
        "token": create_access_token({"sub": str(user.id), "role": user.role.value}),
    }


class AuthController:
    def __init__(self, db: Session):
        self.db = db

    def login(self, req: LoginRequest) -> dict:
        identifier = req.phoneOrEmail
        criterion = func.lower(User.email) == identifier if "@" in identifier else User.phone == identifier
        matches = self.db.query(User).filter(criterion).limit(2).all()
        if len(matches) != 1 or not matches[0].is_active or not verify_password(req.password, matches[0].password_hash):
            raise HTTPException(401, "Invalid credentials")
        return signed_in(matches[0])

    def register(self, req: RegisterRequest) -> dict:
        identifier = User.phone == req.phone
        if req.email:
            identifier = or_(identifier, func.lower(User.email) == req.email)
        if self.db.query(User.id).filter(identifier).first():
            raise HTTPException(409, "An account already uses this identifier")
        user = User(
            full_name=req.fullName, phone=req.phone, email=req.email,
            password_hash=get_password_hash(req.password), role=UserRole.customer, address=req.address,
        )
        self.db.add(user)
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(409, "An account already uses this identifier") from exc
        return signed_in(user)
