import re
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, StringConstraints


def normalize_phone(value: str) -> str:
    value = re.sub(r"[\s()\-]", "", value)
    if value.startswith("00"):
        value = "+" + value[2:]
    if re.fullmatch(r"03[0-9]{9}", value):
        value = "+92" + value[1:]
    if re.fullmatch(r"92[0-9]{10}", value):
        value = "+" + value
    if not re.fullmatch(r"\+?[0-9]{10,15}", value):
        raise ValueError("Enter a valid phone number")
    return value


def normalize_email(value: str) -> str:
    value = value.strip().lower()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
        raise ValueError("Enter a valid email address")
    return value


def normalize_identifier(value: str) -> str:
    return normalize_email(value) if "@" in value else normalize_phone(value)


def validate_password(value: str) -> str:
    if len(value.encode("utf-8")) > 72:
        raise ValueError("Password must be at most 72 UTF-8 bytes")
    return value


Password = Annotated[str, StringConstraints(min_length=8, max_length=72), AfterValidator(validate_password)]
Phone = Annotated[str, StringConstraints(max_length=35), AfterValidator(normalize_phone)]
Email = Annotated[str, StringConstraints(max_length=150), AfterValidator(normalize_email)]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Address = Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)]


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    phoneOrEmail: Annotated[str, StringConstraints(max_length=150), AfterValidator(normalize_identifier)]
    password: Password


class RegisterRequest(BaseModel):
    fullName: Name
    phone: Phone
    email: Email | None = None
    password: Password
    address: Address | None = None


class UserResponse(BaseModel):
    id: str
    fullName: str
    phone: str
    email: str | None
    role: str
    avatarInitials: str
    address: str | None
    createdAt: str | None
