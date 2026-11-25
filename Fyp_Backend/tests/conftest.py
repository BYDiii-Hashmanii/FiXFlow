import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DEV_MODE"] = "true"
os.environ["SECRET_KEY"] = ""
os.environ["SEED_DEMO"] = "false"
os.environ["PRELOAD_IMAGE_MODEL"] = "false"

from app import main
from app.config.settings import settings
from app.database import models as m
from app.database.session import Base, get_db
from app.middlewares.security import create_access_token, get_password_hash
from app.routes.auth_routes import attempts


@pytest.fixture(scope="session")
def test_password():
    return "Fixture passphrase"


@pytest.fixture(scope="session")
def password_hash(test_password):
    return get_password_hash(test_password)


@pytest.fixture
def database(tmp_path, monkeypatch, password_hash):
    db_path = tmp_path / "isolated.db"
    engine = create_engine(f"sqlite:///{db_path.as_posix()}", connect_args={"check_same_thread": False})
    monkeypatch.setattr(main, "engine", engine)
    monkeypatch.setattr(settings, "UPLOAD_DIR", tmp_path / "uploads")
    session = sessionmaker(bind=engine, autoflush=False)
    Base.metadata.create_all(engine)
    with session() as db:
        db.add_all(
            m.User(id=i, full_name=f"Test user {i}", phone=f"+155590000{i:02d}", email=f"user{i}@example.test",
                   password_hash=password_hash, role=role, is_active=i != 7)
            for i, role in enumerate(
                [m.UserRole.owner, m.UserRole.owner, m.UserRole.technician, m.UserRole.technician,
                 m.UserRole.customer, m.UserRole.customer, m.UserRole.customer], start=1
            )
        )
        db.flush()
        db.add_all([m.Company(id=1, owner_id=1, name="Alpha"), m.Company(id=2, owner_id=2, name="Beta"),
                    m.ServiceCategory(id=1, name="Plumbing")])
        db.flush()
        db.add_all([
            m.Technician(user_id=3, company_id=1, category_id=1, service_rate=100),
            m.Technician(user_id=4, company_id=2, category_id=1, service_rate=200),
        ])
        db.flush()
        db.add(m.ServiceRequest(id=1, request_no="FF-TEST", customer_id=5, category_id=1,
                                assigned_technician_id=3, status=m.RequestStatus.completed))
        db.flush()
        db.add_all([
            m.Job(id=1, request_id=1, technician_id=3, status=m.JobStatus.completed),
            m.RequestOffer(request_id=1, technician_id=3, status=m.OfferStatus.accepted, quoted_price=100),
        ])
        db.flush()
        db.add(m.Invoice(id=1, invoice_no="INV-TEST", job_id=1, status=m.InvoiceStatus.unpaid, total_amount=100))
        db.commit()
    yield session
    engine.dispose()


@pytest.fixture
def client(database):
    def test_session():
        with database() as db:
            yield db

    attempts.clear()
    main.app.dependency_overrides[get_db] = test_session
    with TestClient(main.app) as http:
        yield http
    main.app.dependency_overrides.pop(get_db, None)


@pytest.fixture(params=["", "/api"])
def prefix(request):
    return request.param


@pytest.fixture
def auth():
    def headers(user_id, role, delta=None):
        return {"Authorization": "Bearer " + create_access_token({"sub": str(user_id), "role": role}, delta)}

    return headers
