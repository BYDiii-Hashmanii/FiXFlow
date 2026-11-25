from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.schemas.common_schemas import ApiResponse
from app.api.schemas.workflow_schemas import PayInvoice
from app.controllers.invoice_controller import InvoiceController
from app.database import models as m
from app.database.repositories.access import invoice_record
from app.database.session import get_db
from app.middlewares.auth_middleware import get_current_user, require_role

router = APIRouter(tags=["Invoices & Payments"])
customer_only = require_role(m.UserRole.customer)


@router.get("/invoices/{id}", response_model=ApiResponse[dict])
def get_invoice(id: str, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ApiResponse.wrap(InvoiceController(db).get_invoice(invoice_record(db, user, id)))


@router.post("/invoices/{id}/pay", response_model=ApiResponse[dict])
def pay_invoice(id: str, payload: PayInvoice, user: m.User = Depends(customer_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(InvoiceController(db).pay_invoice(invoice_record(db, user, id), payload.method, user))


@router.get("/invoices/{id}/receipt", response_model=ApiResponse[dict])
def get_receipt(id: str, user: m.User = Depends(customer_only), db: Session = Depends(get_db)):
    return ApiResponse.wrap(InvoiceController(db).receipt(invoice_record(db, user, id)))
