import io
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from app.config.settings import settings

MAX_BYTES = 5 * 1024 * 1024
MAX_DIMENSION = 4096
SUPPORTED_FORMATS = {"JPEG", "PNG", "WEBP", "GIF", "BMP"}


def store_image(upload: UploadFile) -> Path:
    data = io.BytesIO()
    while chunk := upload.file.read(64 * 1024):
        if data.tell() + len(chunk) > MAX_BYTES:
            raise HTTPException(413, "Image must be 5 MB or smaller")
        data.write(chunk)
    data.seek(0)
    try:
        with Image.open(data) as image:
            if image.format not in SUPPORTED_FORMATS or max(image.size) > MAX_DIMENSION:
                raise HTTPException(422, "Unsupported image format or dimensions")
            image = ImageOps.exif_transpose(image).convert("RGB")
            sanitized = io.BytesIO()
            image.save(sanitized, format="JPEG", quality=87)
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise HTTPException(422, "Upload a valid image") from exc

    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    target = settings.UPLOAD_DIR / f"{uuid4().hex}.jpg"
    try:
        target.write_bytes(sanitized.getbuffer())
    except OSError:
        target.unlink(missing_ok=True)
        raise
    return target


def basename(path: str) -> str:
    return path.replace("\\", "/").rsplit("/", 1)[-1]


def media_url(path: str) -> str:
    return f"{settings.STATIC_URL}/{basename(path)}"
