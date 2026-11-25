from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.api.schemas.auth_schemas import Address, Email, Name, Password, Phone
from app.database.models import AvailabilityStatus, DeclineReason

ID = Annotated[int, Field(gt=0, le=2_147_483_647)]
Text = Annotated[str, StringConstraints(max_length=2000)]
Money = Annotated[Decimal, Field(ge=0, max_digits=10, decimal_places=2)]


class RequestBody(BaseModel):
    model_config = ConfigDict(extra="forbid")


class CreateOffer(RequestBody):
    technicianId: ID


class DeclineOffer(RequestBody):
    reason: DeclineReason


class JobPartInput(RequestBody):
    name: Name
    quantity: Annotated[int, Field(ge=1, le=10000)]
    unitPrice: Money


class WorkUpdate(RequestBody):
    workNotes: Text | None = None
    labourHours: Annotated[Decimal, Field(ge=0, le=999, decimal_places=1)] | None = None
    labourCost: Money | None = None
    hourlyRate: Money | None = None
    expectedCompletion: Annotated[str, StringConstraints(max_length=100)] | None = None
    workStatusNote: Annotated[str, StringConstraints(max_length=100)] | None = None
    parts: Annotated[list[JobPartInput], Field(max_length=50)] | None = None


class SubmitReview(RequestBody):
    rating: Annotated[int, Field(strict=True, ge=1, le=5)]
    comment: Text = ""


class PayInvoice(RequestBody):
    method: Literal["cash", "card", "jazzcash", "easypaisa", "bank_transfer"]


class TechnicianUpdate(RequestBody):
    fullName: Name | None = None
    phone: Phone | None = None
    categoryId: ID | None = None
    serviceRate: Money | None = None
    availability: AvailabilityStatus | None = None


class TechnicianCreate(TechnicianUpdate):
    categoryId: ID
    fullName: Name
    phone: Phone
    serviceRate: Money
    password: Password
    availability: AvailabilityStatus = AvailabilityStatus.available


class ProfileUpdate(RequestBody):
    fullName: Name | None = None
    phone: Phone | None = None
    email: Email | None = None
    address: Address | None = None


class AvailabilityUpdate(RequestBody):
    availability: AvailabilityStatus
