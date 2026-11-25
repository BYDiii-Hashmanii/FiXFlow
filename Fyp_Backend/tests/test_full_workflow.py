from app.controllers import request_controller
from app.database import models as m
from test_contracts import image


def test_full_workflow(client, prefix, auth, database, monkeypatch, test_password):
    owner, other_owner = auth(1, "owner"), auth(2, "owner")
    other_customer, other_tech = auth(6, "customer"), auth(4, "technician")

    def call(method, path, headers=None, status=200, **values):
        result = client.request(method, prefix + path, headers=headers, **values)
        assert result.status_code == status, (path, result.text)
        return result.json()["data"]

    with database() as db:
        db.add(m.ServiceCategory(id=2, name="Test category"))
        db.commit()
    technician = call("POST", "/owner/technicians", owner, json={
        "fullName": "New technician", "phone": "+15559000011", "password": test_password,
        "categoryId": 2, "serviceRate": 800, "availability": "available",
    })
    tech_id = technician["id"]
    assert any(item["id"] == tech_id for item in call("GET", "/owner/technicians", owner))
    assert [item["id"] for item in call("GET", "/technicians?categoryId=2")] == [tech_id]
    tech_session = call("POST", "/auth/login", json={"phoneOrEmail": "+1 (555) 900-0011", "password": test_password})
    assert tech_session["id"] == tech_id and tech_session["role"] == "technician"
    tech = {"Authorization": "Bearer " + tech_session["token"]}
    customer_session = call("POST", "/auth/register", json={
        "fullName": "New customer", "phone": "+15559000012", "password": test_password,
    })
    customer = {"Authorization": "Bearer " + customer_session["token"]}

    monkeypatch.setattr(request_controller, "analyze_file", lambda _: {
        "primary_issue": "fixture", "confidence": 0.85,
        "analysis": {"title": "Reported issue", "category": "Test category", "urgency": "low",
                     "summary": "Fixture diagnosis", "safety_note": "",
                     "steps": [{"step_no": 1, "instruction": "Check options"}]},
    })
    request = call("POST", "/requests", customer, data={
        "categoryId": "2", "description": "A maintenance problem", "accessTime": "2026-11-25 12:00",
    }, files={"photo": image()})
    req = request["id"]
    details, job = f"/requests/{req}", f"/jobs/{req}"
    assert call("GET", details + "/analysis", customer)["steps"][0]["instruction"] == "Check options"
    assert call("POST", details + "/auto-select", customer)["id"] == tech_id
    call("GET", details, other_customer, 404)
    call("POST", details + "/cancel", other_customer, 404)
    offer = call("POST", details + "/offers", customer, json={"technicianId": tech_id})
    waiting = call("GET", details + "/track", customer)
    assert waiting["status"] == "waiting" and waiting["offerStatus"] == "pending"
    assert waiting["offeredPrice"] == 800 and waiting["technician"]["id"] == tech_id
    assert call("GET", "/technician/offers", tech)[0]["id"] == offer["id"]
    assert call("GET", f"/technician/requests/{req}", tech)["status"] == "pending"
    assert call("GET", "/technician/offers", other_tech) == []
    call("POST", f"/offers/{offer['id']}/accept", other_tech, 404)
    call("POST", f"/offers/{offer['id']}/accept", tech)
    accepted = call("GET", details + "/track", customer)
    assert accepted["jobStatus"] == "accepted" and accepted["offerStatus"] == "accepted"
    assert accepted["category"] == "Test category" and accepted["accessTime"] == "2026-11-25 12:00"
    assert accepted["timeline"]["acceptedAt"] and not accepted["timeline"]["startedAt"]
    call("GET", f"/owner/jobs/{req}", other_owner, 404)
    call("GET", job, other_tech, 404)
    call("POST", job + "/start", other_tech, 404)
    call("PUT", f"/owner/technicians/{tech_id}", other_owner, 404, json={"serviceRate": 900})
    call("POST", job + "/start", tech)
    started = call("GET", details + "/track", customer)
    assert started["status"] == "in_progress" and started["timeline"]["startedAt"]
    work = call("PUT", job + "/update", tech, json={
        "labourHours": "1.5", "workNotes": "Seal replaced",
        "parts": [{"name": "Seal", "quantity": 2, "unitPrice": "75.50"}],
    })
    assert work["totalCost"] == 1351
    photo = call("POST", job + "/photos", tech, data={"photoType": "after"}, files={"photo": image()})
    assert call("GET", job, tech)["photos"] == [photo]
    assert client.get(prefix + photo["url"], headers=customer).status_code == 200
    assert client.get(prefix + photo["url"], headers=other_tech).status_code == 404
    call("POST", job + "/complete", tech)
    completed = call("GET", details + "/track", customer)
    assert completed["invoiceEligible"] and completed["timeline"]["completedAt"]
    invoice = call("POST", job + "/invoice", tech)
    inv = f"/invoices/{invoice['id']}"
    assert call("GET", details + "/track", customer)["invoiceId"] == invoice["id"]
    customer_invoice = call("GET", inv, customer)
    assert customer_invoice["photos"] == [photo]
    assert customer_invoice["status"] == "unpaid" and customer_invoice["workNotes"] == "Seal replaced"
    call("GET", inv, other_customer, 404)
    call("POST", inv + "/pay", other_customer, 404, json={"method": "cash"})
    call("GET", "/owner" + inv, other_owner, 404)
    payment = call("POST", inv + "/pay", customer, json={"method": "card"})
    assert payment == call("POST", inv + "/pay", customer, json={"method": "cash"})
    assert payment == call("GET", inv + "/receipt", customer)
    assert payment["amount"] == 1351 and payment["method"] == "card" and payment["jobId"] == req
    call("GET", inv + "/receipt", other_customer, 404)
    assert call("GET", details + "/track", customer)["status"] == "closed_paid"
    call("POST", job + "/review", customer, json={"rating": 5, "comment": "Task finished."})
    assert call("GET", "/technician/ratings", tech)[0]["rating"] == 5
    assert call("GET", "/owner/feedback", owner)["reviews"][0]["jobId"] == req
    assert call("GET", "/owner/feedback", other_owner)["reviews"] == []
    assert any(item["id"] == req for item in call("GET", "/owner/dashboard", owner)["recentJobs"])
    assert call("GET", "/owner/dashboard", other_owner)["stats"]["completedJobs"] == 0
    customer_events = call("GET", "/notifications", customer)
    assert {item["title"] for item in customer_events} >= {
        "Technician accepted the request", "Work started", "Work completed", "Invoice issued",
    }
    technician_events = call("GET", "/notifications", tech)
    assert {item["title"] for item in technician_events} == {"New service request", "Payment received", "New feedback"}
    assert sum(item["title"] == "Payment received" for item in technician_events) == 1
    assert call("GET", "/notifications", other_customer) == []
    assert call("GET", "/notifications", other_tech) == []


def test_pagination_bounds_and_offsets(client, prefix, auth):
    first = client.get(prefix + "/technicians?limit=1")
    second = client.get(prefix + "/technicians?limit=1&offset=1")
    assert len(first.json()["data"]) == len(second.json()["data"]) == 1
    assert first.json()["data"][0]["id"] != second.json()["data"][0]["id"]
    for query in ["limit=0", "limit=101", "offset=-1"]:
        assert client.get(prefix + "/jobs?" + query, headers=auth(3, "technician")).status_code == 422
