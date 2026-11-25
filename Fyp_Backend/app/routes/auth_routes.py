from collections import OrderedDict
from threading import Lock
from time import monotonic

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.schemas.auth_schemas import LoginRequest, RegisterRequest
from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.workflow_schemas import ProfileUpdate
from app.controllers.profile_controller import update_profile
from app.controllers.auth_controller import AuthController, format_user_response
from app.database.models import User, UserRole
from app.database.session import get_db
from app.middlewares.auth_middleware import get_current_user, require_role

router = APIRouter(tags=["Authentication"])
attempts: OrderedDict[tuple, tuple[float, int]] = OrderedDict()
attempts_lock = Lock()


def limit_attempts(request: Request, identifier: str, operation: str) -> None:
    now = monotonic()
    key = (operation, request.client.host if request.client else "", identifier)
    with attempts_lock:
        while attempts and next(iter(attempts.values()))[0] <= now:
            attempts.popitem(last=False)
        if key not in attempts and len(attempts) >= 10000:
            raise HTTPException(429, "Too many attempts. Try again later.")
        deadline, count = attempts.get(key, (now + 60, 0))
        if count >= 10:
            raise HTTPException(429, "Too many attempts. Try again later.")
        attempts[key] = (deadline, count + 1)


@router.post("/auth/login", response_model=ApiResponse[dict])
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    limit_attempts(request, req.phoneOrEmail, "login")
    return ApiResponse.wrap(AuthController(db).login(req))


@router.post("/auth/register", response_model=ApiResponse[dict])
def register(req: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    limit_attempts(request, req.phone, "register")
    return ApiResponse.wrap(AuthController(db).register(req))


@router.get("/auth/me", response_model=ApiResponse[dict])
@router.get("/users/me", response_model=ApiResponse[dict])
def get_me(user: User = Depends(get_current_user)):
    return ApiResponse.wrap(format_user_response(user))


@router.put("/users/me", response_model=ApiResponse[dict])
def edit_me(payload: ProfileUpdate, user: User = Depends(require_role(UserRole.customer)), db: Session = Depends(get_db)):
    return ApiResponse.wrap(update_profile(db, user, payload))
