from datetime import datetime
from app.config.settings import settings
from app.middlewares.security import get_password_hash
from app.database.session import SessionLocal, engine, Base
from app.database import models

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(models.ServiceCategory).first():
            return

        # 1. Categories
        categories_data = [
            "Plumbing", "Electrical", "AC Repair", "Carpentry", "Appliance", "Other"
        ]
        cat_map = {}
        for name in categories_data:
            cat = models.ServiceCategory(name=name)
            db.add(cat)
            db.flush()
            cat_map[name] = cat.id

        # 2. Users
        password = settings.DEMO_PASSWORD.get_secret_value() if settings.DEMO_PASSWORD else ""
        if len(password) < 8 or len(password.encode()) > 72:
            raise RuntimeError("Set DEMO_PASSWORD to at least 8 characters and at most 72 UTF-8 bytes.")
        default_pw = get_password_hash(password)
        users_data = [
            models.User(id=1, full_name="Daaem Butt", phone="+923012345678", email="daaem@rayyanrepair.pk", password_hash=default_pw, role=models.UserRole.owner),
            models.User(id=2, full_name="Bilal Sheikh", phone="+923004445566", email="bilal@fixpro.pk", password_hash=default_pw, role=models.UserRole.owner),
            models.User(id=3, full_name="Hamza Malik", phone="+923001112233", email="hamza.malik@rayyanrepairs.com", password_hash=default_pw, role=models.UserRole.technician),
            models.User(id=4, full_name="Ali Raza", phone="+923001113344", email="ali.raza@rayyanrepairs.com", password_hash=default_pw, role=models.UserRole.technician),
            models.User(id=5, full_name="Usman Tariq", phone="+923001114455", email="usman.tariq@rayyanrepairs.com", password_hash=default_pw, role=models.UserRole.technician),
            models.User(id=6, full_name="Hamza Mirza", phone="+923001115566", email="hamza.mirza@fixpro.pk", password_hash=default_pw, role=models.UserRole.technician),
            models.User(id=7, full_name="Raja Abubakar", phone="+923001234567", email="raja@example.com", password_hash=default_pw, role=models.UserRole.customer, address="Apt 302, Block B, Satellite Town, Rawalpindi"),
        ]
        for u in users_data:
            db.add(u)
        db.flush()

        # 3. Companies
        comp1 = models.Company(id=1, owner_id=1, name="Rayyan Repair Services")
        comp2 = models.Company(id=2, owner_id=2, name="FixPro Services")
        db.add_all([comp1, comp2])
        db.flush()

        # 4. Technicians
        techs = [
            models.Technician(user_id=3, company_id=1, category_id=cat_map["Plumbing"], service_rate=1800, availability=models.AvailabilityStatus.available),
            models.Technician(user_id=4, company_id=1, category_id=cat_map["Electrical"], service_rate=1500, availability=models.AvailabilityStatus.available),
            models.Technician(user_id=5, company_id=1, category_id=cat_map["AC Repair"], service_rate=2200, availability=models.AvailabilityStatus.unavailable),
            models.Technician(user_id=6, company_id=2, category_id=cat_map["Plumbing"], service_rate=1500, availability=models.AvailabilityStatus.available),
        ]
        db.add_all(techs)
        db.flush()

        # 5. Service Requests
        req1 = models.ServiceRequest(
            id=1,
            request_no="FF-0142",
            customer_id=7,
            category_id=cat_map["Plumbing"],
            title="Kitchen Sink Leakage",
            description="Water is leaking from the pipe under the kitchen sink.",
            address="Apt 302, Block B, Satellite Town",
            access_time="Today, 2:30 PM",
            urgency=models.UrgencyLevel.medium,
            booking_mode=models.BookingMode.auto,
            assigned_technician_id=3,
            status=models.RequestStatus.closed_paid
        )
        req2 = models.ServiceRequest(
            id=2,
            request_no="FF-0143",
            customer_id=7,
            category_id=cat_map["Electrical"],
            title="Ceiling Fan Repair",
            description="Ceiling fan is making noise and spinning slowly.",
            address="Apt 302, Block B, Satellite Town",
            access_time="Today, 5:00 PM",
            urgency=models.UrgencyLevel.low,
            booking_mode=models.BookingMode.manual,
            assigned_technician_id=4,
            status=models.RequestStatus.in_progress
        )
        req3 = models.ServiceRequest(
            id=3,
            request_no="FF-0144",
            customer_id=7,
            category_id=cat_map["Plumbing"],
            title="Washbasin Tap Leak",
            description="Tap keeps dripping after it is closed.",
            address="Apt 302, Block B, Satellite Town",
            access_time="Tomorrow, 11:00 AM",
            urgency=models.UrgencyLevel.low,
            booking_mode=models.BookingMode.manual,
            assigned_technician_id=None,
            status=models.RequestStatus.waiting
        )
        db.add_all([req1, req2, req3])
        db.flush()

        # 6. AI Analysis & Steps
        ai_an1 = models.AiAnalysis(
            id=1,
            request_id=1,
            problem_title="Kitchen sink leakage",
            summary="The leak seems to come from a loose or worn connector under the sink. It is usually safe to try a simple fix first.",
            urgency=models.UrgencyLevel.medium,
            safety_note="If water keeps leaking or the pipe is damaged, stop and book a technician."
        )
        db.add(ai_an1)
        db.flush()

        steps = [
            models.AiRepairStep(analysis_id=1, step_no=1, instruction="Turn off the water supply under the sink"),
            models.AiRepairStep(analysis_id=1, step_no=2, instruction="Place a bucket under the leak"),
            models.AiRepairStep(analysis_id=1, step_no=3, instruction="Tighten the connector by hand"),
            models.AiRepairStep(analysis_id=1, step_no=4, instruction="Turn the water on and check"),
        ]
        db.add_all(steps)
        db.flush()

        # 7. Request Offers
        offers = [
            models.RequestOffer(id=1, request_id=1, technician_id=3, quoted_price=1800, status=models.OfferStatus.accepted, responded_at=datetime.utcnow()),
            models.RequestOffer(id=2, request_id=2, technician_id=4, quoted_price=1500, status=models.OfferStatus.accepted, responded_at=datetime.utcnow()),
            models.RequestOffer(id=3, request_id=3, technician_id=3, quoted_price=1800, status=models.OfferStatus.pending),
        ]
        db.add_all(offers)
        db.flush()

        # 8. Jobs
        job1 = models.Job(
            id=1,
            request_id=1,
            technician_id=3,
            status=models.JobStatus.closed,
            accepted_at=datetime.utcnow(),
            started_at=datetime.utcnow(),
            expected_completion="Today, 4:00 PM",
            completed_at=datetime.utcnow(),
            closed_at=datetime.utcnow(),
            labour_hours=1.5,
            labour_cost=1800,
            work_notes="Replaced the worn connector hose, sealed the joint and tested for leaks."
        )
        job2 = models.Job(
            id=2,
            request_id=2,
            technician_id=4,
            status=models.JobStatus.in_progress,
            accepted_at=datetime.utcnow(),
            started_at=datetime.utcnow(),
            expected_completion="Today, 6:00 PM",
            labour_hours=0,
            labour_cost=0,
            work_notes=""
        )
        db.add_all([job1, job2])
        db.flush()

        # 9. Job Parts
        parts = [
            models.JobPart(id=1, job_id=1, part_name="Flexible connector hose", quantity=1, unit_price=650),
            models.JobPart(id=2, job_id=1, part_name="Sealing tape", quantity=1, unit_price=100),
        ]
        db.add_all(parts)
        db.flush()

        # 10. Invoices
        inv1 = models.Invoice(
            id=1,
            invoice_no="INV-2026-0142",
            job_id=1,
            parts_total=750,
            labour_total=1800,
            total_amount=2550,
            status=models.InvoiceStatus.paid,
            sent_at=datetime.utcnow()
        )
        db.add(inv1)
        db.flush()

        # 11. Payments
        pay1 = models.Payment(
            id=1,
            invoice_id=1,
            customer_id=7,
            amount=2550,
            payment_method="cash",
            paid_at=datetime.utcnow()
        )
        db.add(pay1)
        db.flush()

        # 12. Reviews
        rev1 = models.Review(
            id=1,
            job_id=1,
            customer_id=7,
            technician_id=3,
            rating=5,
            comment="Quick and tidy work. The leak is fixed."
        )
        db.add(rev1)
        db.flush()

        # 13. Notifications
        notifs = [
            models.Notification(user_id=3, title="New request", message="Raja Abubakar - Washbasin Tap Leak", type="request", request_id=3, is_read=False),
            models.Notification(user_id=3, title="Payment received", message="INV-2026-0142 - Rs 2,550", type="payment", request_id=1, is_read=False),
            models.Notification(user_id=3, title="New feedback", message="Raja Abubakar rated you 5 stars.", type="feedback", request_id=1, is_read=True),
            models.Notification(user_id=7, title="Request accepted", message="Ali Raza accepted your request.", type="offer", request_id=2, is_read=False),
            models.Notification(user_id=1, title="Invoice paid", message="INV-2026-0142 - Rs 2,550", type="invoice", request_id=1, is_read=False),
        ]
        db.add_all(notifs)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
