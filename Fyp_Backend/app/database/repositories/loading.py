from sqlalchemy.orm import selectinload

from app.database import models as m


def technician_loads():
    return (
        selectinload(m.Technician.user), selectinload(m.Technician.company),
        selectinload(m.Technician.category), selectinload(m.Technician.reviews), selectinload(m.Technician.jobs),
    )


def request_loads():
    return (
        selectinload(m.ServiceRequest.customer), selectinload(m.ServiceRequest.category),
        selectinload(m.ServiceRequest.final_category),
        selectinload(m.ServiceRequest.assigned_technician).options(*technician_loads()),
    )


def job_loads():
    return (
        selectinload(m.Job.request).options(selectinload(m.ServiceRequest.customer), selectinload(m.ServiceRequest.category),
                                           selectinload(m.ServiceRequest.final_category)),
        selectinload(m.Job.technician).options(*technician_loads()), selectinload(m.Job.parts),
        selectinload(m.Job.invoice), selectinload(m.Job.photos),
    )


def review_loads():
    return (
        selectinload(m.Review.customer),
        selectinload(m.Review.technician).selectinload(m.Technician.user),
        selectinload(m.Review.job).options(selectinload(m.Job.request), selectinload(m.Job.invoice)),
    )
