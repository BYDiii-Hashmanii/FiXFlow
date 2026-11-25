from concurrent.futures import ThreadPoolExecutor

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
import pytest

from app.database import models as m


def create_request(client, prefix, headers):
    response = client.post(prefix + "/requests", headers=headers, data={"categoryId": "1", "description": "Leaking tap"})
    assert response.status_code == 200, response.text
    return response.json()["data"]["id"]


def send_offer(client, prefix, req, technician, customer):
    response = client.post(prefix + f"/requests/{req}/offers", headers=customer, json={"technicianId": str(technician)})
    assert response.status_code == 200, response.text
    return response.json()["data"]["id"]


def test_request_offer_lifecycle(client, prefix, auth, database):
    customer = auth(5, "customer")
    tech = auth(3, "technician")
    second = auth(4, "technician")
    req = create_request(client, prefix, customer)
    assert client.get(prefix + f"/jobs/{req}", headers=customer).status_code == 404
    assert client.get(prefix + f"/owner/jobs/{req}", headers=auth(1, "owner")).status_code == 404
    with database() as db:
        assert db.query(m.Job).count() == 1

    offer = send_offer(client, prefix, req, 3, customer)
    assert client.get(prefix + "/technician/offers", headers=tech).json()["data"][0]["id"] == offer
    assert client.get(prefix + "/technician/offers", headers=second).json()["data"] == []
    assert client.post(prefix + f"/offers/{offer}/accept", headers=second).status_code == 404
    assert client.post(prefix + f"/requests/{req}/offers", headers=customer, json={"technicianId": 4}).status_code == 409
    assert client.post(prefix + f"/offers/{offer}/decline", headers=tech, json={"reason": "busy"}).status_code == 200
    assert client.post(prefix + f"/offers/{offer}/accept", headers=tech).status_code == 409
    track = client.get(prefix + f"/requests/{req}/track", headers=customer).json()["data"]
    assert track["status"] == "declined" and track["declineReason"] == "busy" and track["retryAllowed"]
    assert client.post(prefix + f"/requests/{req}/offers", headers=customer, json={"technicianId": 3}).status_code == 409
    second_offer = send_offer(client, prefix, req, 4, customer)
    assert client.post(prefix + f"/offers/{second_offer}/accept", headers=second).status_code == 200
    assert client.post(prefix + f"/offers/{second_offer}/accept", headers=second).status_code == 409

    job = prefix + f"/jobs/{req}"
    assert client.post(job + "/invoice", headers=second).status_code == 409
    assert client.put(job + "/update", headers=second, json={"labourHours": 1}).status_code == 409
    assert client.post(job + "/complete", headers=second).status_code == 409
    assert client.post(job + "/review", headers=customer, json={"rating": 5}).status_code == 409
    started = client.post(job + "/start", headers=second)
    assert started.status_code == 200, started.text
    assert client.post(job + "/start", headers=second).json()["data"]["timeline"] == started.json()["data"]["timeline"]
    assert client.post(prefix + f"/requests/{req}/cancel", headers=customer).status_code == 409
    assert client.post(prefix + f"/requests/{req}/solved", headers=customer).status_code == 409
    assert client.put(job + "/update", headers=second, json={"labourHours": -1}).status_code == 422
    updated = client.put(job + "/update", headers=second, json={
        "labourHours": 1.5, "labourCost": 0, "parts": [{"name": "Seal", "quantity": 2, "unitPrice": "25.40"}],
    })
    assert updated.status_code == 200, updated.text
    assert updated.json()["data"]["labourCost"] == 300
    complete = client.post(job + "/complete", headers=second)
    assert complete.status_code == 200
    assert client.post(job + "/complete", headers=second).json()["data"]["timeline"] == complete.json()["data"]["timeline"]
    assert client.post(job + "/start", headers=second).status_code == 409
    assert client.put(job + "/update", headers=second, json={}).status_code == 409
    issued = client.post(job + "/invoice", headers=second)
    assert issued.status_code == 200, issued.text
    invoice = issued.json()["data"]
    assert invoice["totalCost"] == 350.8
    assert client.post(job + "/invoice", headers=second).json()["data"] == invoice
    url = prefix + f"/invoices/{invoice['id']}"
    assert client.get(url + "/receipt", headers=customer).status_code == 404
    payment = client.post(url + "/pay", headers=customer, json={"method": "card"})
    assert payment.status_code == 200, payment.text
    assert client.post(url + "/pay", headers=customer, json={"method": "cash"}).json()["data"] == payment.json()["data"]
    assert client.get(url + "/receipt", headers=customer).json()["data"] == payment.json()["data"]
    assert client.post(job + "/review", headers=customer, json={"rating": 6}).status_code == 422
    assert client.post(job + "/review", headers=customer, json={"rating": 5}).status_code == 200
    assert client.post(job + "/review", headers=customer, json={"rating": 5}).status_code == 409
    assert client.get(prefix + f"/requests/{req}/track", headers=customer).json()["data"]["status"] == "closed_paid"
    with database() as db:
        assert db.query(m.Payment).count() == 1
        assert db.query(m.Notification).filter_by(type="payment").count() == 1


def test_cancel_and_self_solve(client, prefix, auth):
    customer = auth(5, "customer")
    req = create_request(client, prefix, customer)
    pending = send_offer(client, prefix, req, 3, customer)
    assert client.post(prefix + f"/requests/{req}/cancel", headers=customer).status_code == 200
    assert client.post(prefix + f"/offers/{pending}/accept", headers=auth(3, "technician")).status_code == 409
    assert client.post(prefix + f"/requests/{req}/solved", headers=customer).status_code == 409
    another = create_request(client, prefix, customer)
    accepted = send_offer(client, prefix, another, 3, customer)
    assert client.post(prefix + f"/offers/{accepted}/accept", headers=auth(3, "technician")).status_code == 200
    assert client.post(prefix + f"/requests/{another}/solved", headers=customer).status_code == 200
    assert client.get(prefix + f"/jobs/{another}", headers=customer).json()["data"]["status"] == "cancelled"
    assert client.post(prefix + f"/jobs/{another}/start", headers=auth(3, "technician")).status_code == 409


def test_competing_accepts_write_one_job(client, prefix, auth, database):
    customer = auth(5, "customer")
    req = create_request(client, prefix, customer)
    offer = send_offer(client, prefix, req, 3, customer)
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda _: client.post(prefix + f"/offers/{offer}/accept", headers=auth(3, "technician")), range(2)))
    assert sorted(response.status_code for response in responses) == [200, 409]
    with database() as db:
        assert db.query(m.Job).join(m.ServiceRequest).filter(m.ServiceRequest.request_no == req).count() == 1


def test_missing_ids_and_db_checks(client, prefix, auth, database):
    customer = auth(5, "customer")
    for route in ["/requests/unknown", "/requests/unknown/track", "/jobs/unknown", "/invoices/unknown"]:
        assert client.get(prefix + route, headers=customer).status_code == 404
    with database() as db:
        for sql in [
            "UPDATE service_requests SET status='unknown' WHERE id=1",
            "INSERT INTO reviews (job_id, customer_id, technician_id, rating, created_at) VALUES (1, 5, 3, 99, '2000-01-01')",
        ]:
            with pytest.raises(IntegrityError):
                db.execute(text(sql))
            db.rollback()


def test_draft_requires_issuance_before_payment(client, prefix, auth, database):
    with database() as db:
        db.get(m.Invoice, 1).status = m.InvoiceStatus.draft
        db.commit()
    customer = auth(5, "customer")
    url = prefix + "/invoices/INV-TEST/pay"
    assert client.post(url, headers=customer, json={"method": "cash"}).status_code == 409
    issued = client.post(prefix + "/jobs/FF-TEST/invoice", headers=auth(3, "technician"))
    assert issued.status_code == 200, issued.text
    assert issued.json()["data"]["status"] == "unpaid"
    assert client.post(url, headers=customer, json={"method": "cash"}).status_code == 200
