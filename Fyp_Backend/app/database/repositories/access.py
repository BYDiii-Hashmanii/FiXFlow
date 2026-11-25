from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import models as m


def company_id(db: Session, user: m.User) -> int:
    company = db.query(m.Company.id).filter(m.Company.owner_id == user.id).scalar()
    if company is None:
        raise HTTPException(404, "Company not found")
    return company


def technician_scope(db: Session, user: m.User):
    return db.query(m.Technician).filter(m.Technician.company_id == company_id(db, user))


def request_scope(db: Session, user: m.User):
    query = db.query(m.ServiceRequest)
    if user.role == m.UserRole.customer:
        return query.filter(m.ServiceRequest.customer_id == user.id)
    if user.role == m.UserRole.technician:
        return query.filter(m.ServiceRequest.offers.any(m.RequestOffer.technician_id == user.id))
    company = company_id(db, user)
    return query.filter(or_(m.ServiceRequest.assigned_technician.has(m.Technician.company_id == company),
                            m.ServiceRequest.job.has(m.Job.technician.has(m.Technician.company_id == company))))


def job_scope(db: Session, user: m.User):
    query = db.query(m.Job)
    if user.role == m.UserRole.customer:
        return query.filter(m.Job.request.has(m.ServiceRequest.customer_id == user.id))
    if user.role == m.UserRole.technician:
        return query.filter(m.Job.technician_id == user.id)
    return query.filter(m.Job.technician.has(m.Technician.company_id == company_id(db, user)))


def invoice_scope(db: Session, user: m.User):
    return db.query(m.Invoice).filter(m.Invoice.job_id.in_(job_scope(db, user).with_entities(m.Job.id)))


def exact_key(value: str, primary_key, public_key):
    if value.isascii() and value.isdigit() and len(value) <= 18:
        return primary_key == int(value)
    return public_key == value


def found(query, label: str):
    result = query.one_or_none()
    if result is None:
        raise HTTPException(404, f"{label} not found")
    return result


def request_record(db: Session, user: m.User, key: str) -> m.ServiceRequest:
    return found(
        request_scope(db, user).filter(exact_key(key, m.ServiceRequest.id, m.ServiceRequest.request_no)),
        "Request",
    )


def job_record(db: Session, user: m.User, key: str) -> m.Job:
    criteria = m.Job.request.has(m.ServiceRequest.request_no == key)
    if key.isascii() and key.isdigit() and len(key) <= 18:
        criteria = m.Job.id == int(key)
    return found(job_scope(db, user).filter(criteria), "Job")


def invoice_record(db: Session, user: m.User, key: str) -> m.Invoice:
    return found(invoice_scope(db, user).filter(exact_key(key, m.Invoice.id, m.Invoice.invoice_no)), "Invoice")
