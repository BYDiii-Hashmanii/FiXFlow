import logging
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from app.config.settings import settings
from app.database.seed import init_db
from app.database.migrations import migrate
from app.database.session import engine
from app.model_handle.image_model.label_map import LabelMapError
from app.routes.auth_routes import router as auth_router
from app.routes.category_routes import router as category_router
from app.routes.chat_routes import router as chat_router
from app.routes.invoice_routes import router as invoice_router
from app.routes.job_routes import router as job_router
from app.routes.media_routes import router as media_router
from app.routes.offer_routes import router as offer_router
from app.routes.notification_routes import router as notification_router
from app.routes.owner_routes import router as owner_router
from app.routes.request_routes import router as request_router
from app.routes.technician_profile_routes import router as technician_profile_router
from app.routes.technician_routes import router as technician_router

logger = logging.getLogger("fixflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _ = settings.jwt_secret
    migrate(engine)
    if settings.SEED_DEMO:
        init_db()
    try:
        from app.model_handle.image_model.model_loader import ImageModelLoader

        ImageModelLoader.validate_startup(settings.PRELOAD_IMAGE_MODEL)
    except LabelMapError:
        raise
    except Exception:
        logger.warning("Image model unavailable on startup", exc_info=True)
    yield


app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=settings.CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"], allow_headers=["Authorization", "Content-Type"],
)


def error_response(status: int, message: str, *, headers=None, correlation_id=None, errors=None):
    return JSONResponse(
        status_code=status,
        content={"success": False, "data": None, "message": message,
                 "correlationId": correlation_id or uuid4().hex, "errors": errors},
        headers=headers,
    )


@app.exception_handler(HTTPException)
async def http_error(request: Request, exc: HTTPException):
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return error_response(exc.status_code, message, headers=exc.headers)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(map(str, item["loc"])), "message": item["msg"]} for item in exc.errors()]
    return error_response(422, "Invalid request", errors=errors)


@app.exception_handler(Exception)
async def unhandled_error(request: Request, exc: Exception):
    correlation_id = uuid4().hex
    logger.error("Unhandled request error %s for %s %s", correlation_id, request.method, request.url.path, exc_info=exc)
    return error_response(500, "An unexpected error occurred", correlation_id=correlation_id)


for router in (
    auth_router, category_router, request_router, technician_router, job_router, invoice_router,
    notification_router, chat_router, owner_router, media_router, offer_router, technician_profile_router,
):
    app.include_router(router, prefix=settings.API_PREFIX)
    app.include_router(router)


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": settings.VERSION}
