from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database.models import User, UserRole
from app.database.session import get_db
from app.middlewares.security import decode_access_token

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    error = HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "Bearer"})
    claims = decode_access_token(credentials.credentials) if credentials else None
    if not claims or not isinstance(claims["sub"], str) or not claims["sub"].isascii() or not claims["sub"].isdigit():
        raise error
    if len(claims["sub"]) > 18:
        raise error
    user = db.get(User, int(claims["sub"]))
    if not user or not user.is_active or claims["role"] != user.role.value:
        raise error
    return user


def require_role(role: UserRole):
    def check(user: User = Depends(get_current_user)) -> User:
        if user.role != role:
            raise HTTPException(403, "Forbidden")
        return user

    return check
