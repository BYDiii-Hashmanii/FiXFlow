import io

from PIL import Image


def image():
    stream = io.BytesIO()
    Image.new("RGB", (12, 12), (30, 40, 50)).save(stream, "PNG")
    return ("test.png", stream.getvalue(), "image/png")


def test_owner_contracts(client, prefix, auth):
    base = prefix + "/owner"
    owner = auth(1, "owner")
    other = auth(2, "owner")

    def get(path, headers=owner):
        response = client.get(base + path, headers=headers)
        assert response.status_code == 200, response.text
        return response.json()["data"]

    details = get("/technicians/3")
    assert get("/technicians")[0] == details
    assert {"phone", "name", "createdAt", "rate", "serviceRate"} <= details.keys()
    jobs = get("/jobs")
    assert get("/jobs", other) == []
    assert get("/jobs/FF-TEST") == jobs[0]
    assert {"jobTitle", "grandTotal", "invoiceId"} <= jobs[0].keys()
    invoices = get("/invoices?status=unpaid")
    assert get("/invoices?status=paid") == []
    assert get("/invoices/INV-TEST") == invoices[0]
    assert {"technicianName", "customerName", "amount", "parts"} <= invoices[0].keys()
    assert get("/feedback") == {"averageRating": None, "totalReviews": 0, "reviews": []}
    assert get("/feedback", other)["reviews"] == []
    assert client.post(prefix + "/invoices/INV-TEST/pay", headers=auth(5, "customer"), json={"method": "cash"}).status_code == 200
    assert client.post(prefix + "/jobs/FF-TEST/review", headers=auth(5, "customer"), json={"rating": 4}).status_code == 200
    populated = get("/feedback")
    assert populated["averageRating"] == 4 and populated["totalReviews"] == 1
    assert get("/feedback/" + populated["reviews"][0]["id"]) == populated["reviews"][0]
    assert get("/feedback", other)["reviews"] == []


def test_job_photos_and_profile(client, prefix, auth):
    customer = auth(5, "customer")
    tech = auth(3, "technician")
    response = client.post(prefix + "/requests", headers=customer, data={"categoryId": "1", "description": "Pipe leaks"})
    assert response.status_code == 200, response.text
    request_id = response.json()["data"]["id"]
    offered = client.post(prefix + f"/requests/{request_id}/offers", headers=customer, json={"technicianId": 3})
    offer = offered.json()["data"]["id"]
    assert client.post(prefix + f"/offers/{offer}/accept", headers=tech).status_code == 200
    job = prefix + f"/jobs/{request_id}"
    assert client.post(job + "/start", headers=tech).status_code == 200
    uploaded = client.post(job + "/photos", headers=tech, data={"photoType": "after"}, files={"photo": image()})
    assert uploaded.status_code == 200, uploaded.text
    item = uploaded.json()["data"]
    assert client.get(job, headers=tech).json()["data"]["photos"] == [item]
    assert client.get(prefix + item["url"], headers=customer).headers["content-type"] == "image/jpeg"
    assert client.get(prefix + item["url"], headers=auth(4, "technician")).status_code == 404
    profile = client.put(prefix + "/technician/profile", headers=tech, json={"fullName": "Updated tech"})
    assert profile.status_code == 200
    assert profile.json()["data"]["name"] == "Updated tech"
    assert client.put(prefix + "/technician/availability", headers=tech, json={"availability": "busy"}).json()["data"]["availability"] == "busy"
    assert client.get(prefix + "/technician/schedule", headers=tech).status_code == 200
    assert client.get(prefix + "/technician/ratings", headers=tech).json()["data"] == []
    assert client.put(prefix + "/users/me", headers=customer, json={"address": "Updated address"}).json()["data"]["address"] == "Updated address"


def test_notifications_are_recipient_scoped(client, prefix, auth):
    payer = auth(5, "customer")
    recipient = auth(3, "technician")
    other = auth(4, "technician")
    assert client.post(prefix + "/invoices/INV-TEST/pay", headers=payer, json={"method": "cash"}).status_code == 200
    items = client.get(prefix + "/notifications", headers=recipient).json()["data"]
    assert items[0]["link"] == "/technician/jobs/FF-TEST"
    url = prefix + f"/notifications/{items[0]['id']}/read"
    assert client.post(url, headers=other).status_code == 404
    assert client.post(url, headers=recipient).status_code == 200
    assert client.post(prefix + "/notifications/unknown/read", headers=recipient).status_code == 404
