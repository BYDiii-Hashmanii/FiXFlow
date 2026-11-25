from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database import models as m
from app.database.repositories.access import job_scope, request_scope
from app.database.session import get_db
from app.middlewares.auth_middleware import get_current_user

router = APIRouter(tags=["Media"])


@router.get(f"{settings.STATIC_URL}/{{filename}}")
def get_photo(filename: str, db: Session = Depends(get_db), user: m.User = Depends(get_current_user)):
    if Path(filename).name != filename or filename in {".", ".."}:
        raise HTTPException(404, "Photo not found")
    request_match = request_scope(db, user).with_entities(m.ServiceRequest.id).filter(
        func.substr(func.replace(m.ServiceRequest.photo_path, "\\", "/"), -(len(filename) + 1)) == f"/{filename}"
    ).first()
    job_match = db.query(m.JobPhoto.id).filter(
        m.JobPhoto.job_id.in_(job_scope(db, user).with_entities(m.Job.id)),
        func.substr(func.replace(m.JobPhoto.photo_path, "\\", "/"), -(len(filename) + 1)) == f"/{filename}",
    ).first() if not request_match else None
    path = settings.UPLOAD_DIR / filename
    if not (request_match or job_match) or path.resolve().parent != settings.UPLOAD_DIR.resolve() or not path.is_file():
        raise HTTPException(404, "Photo not found")
    if path.suffix.lower() not in {".jpeg", ".jpg", ".jfif", ".png", ".webp", ".gif", ".bmp"}:
        raise HTTPException(404, "Photo not found")
    return FileResponse(path, headers={"Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"})
