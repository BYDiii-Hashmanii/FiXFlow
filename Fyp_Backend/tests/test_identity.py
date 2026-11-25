from datetime import timedelta

import pytest


def test_session_rejects_missing_invalid_expired_and_inactive(client, prefix, auth):
    for headers in [
        {},
        {"Authorization": "Bearer invalid"},
        auth(5, "customer", timedelta(seconds=-1)),
        auth(7, "customer"),
        auth(555, "customer"),
        auth(5, "owner"),
    ]:
        resp = client.get(prefix + "/auth/me", headers=headers)
        assert resp.status_code == 401
        assert resp.json()["success"] is False
    assert client.get(prefix + "/auth/me", headers=auth(5, "customer")).json()["data"]["id"] == "5"


def test_canonical_login_and_duplicate_registration(client, prefix, test_password):
    response = client.post(prefix + "/auth/login", json={"phoneOrEmail": " USER5@EXAMPLE.TEST ", "password": test_password})
    assert response.status_code == 200
    assert response.json()["data"]["role"] == "customer"
    for identifier in ["user7@example.test", "unknown@example.test"]:
        response = client.post(prefix + "/auth/login", json={"phoneOrEmail": identifier, "password": test_password})
        assert response.status_code == 401
        assert response.json()["message"] == "Invalid credentials"
    url = prefix + "/auth/register"
    payload = {"fullName": "New user", "phone": "+15559000008", "password": test_password, "role": "owner"}
    for attempt, status in [(payload, 200), (payload, 409), ({**payload, "phone": "+15559000005"}, 409)]:
        response = client.post(url, json=attempt)
        assert response.status_code == status
        if status == 200:
            assert response.json()["data"]["role"] == "customer"
        else:
            assert response.json()["data"] is None
    assert client.post(url, json={**payload, "password": "é" * 37}).status_code == 422


@pytest.mark.parametrize("method,path,payload,user,role,expected", [
    ("GET", "/requests/FF-TEST", None, 6, "customer", 404),
    ("GET", "/requests/FF-TEST/track", None, 6, "customer", 404),
    ("POST", "/requests/FF-TEST/cancel", None, 6, "customer", 404),
    ("GET", "/jobs/FF-TEST", None, 4, "technician", 404),
    ("POST", "/jobs/FF-TEST/start", None, 4, "technician", 404),
    ("GET", "/requests/FF-TEST", None, 4, "technician", 404),
    ("GET", "/invoices/INV-TEST", None, 6, "customer", 404),
    ("POST", "/invoices/INV-TEST/pay", {"method": "card"}, 6, "customer", 404),
    ("GET", "/owner/jobs/FF-TEST", None, 2, "owner", 404),
    ("GET", "/owner/invoices/INV-TEST", None, 2, "owner", 404),
    ("PUT", "/owner/technicians/3", {"fullName": "Changed"}, 2, "owner", 404),
    ("GET", "/owner/dashboard", None, 5, "customer", 403),
])
def test_resource_and_role_guards(client, prefix, auth, method, path, payload, user, role, expected):
    assert client.request(method, prefix + path, json=payload).status_code == 401
    response = client.request(method, prefix + path, headers=auth(user, role), json=payload)
    assert response.status_code == expected, response.text


def test_list_scope_and_signed_in_tracking(client, prefix, auth):
    for path, user, role in [
        ("/requests", 4, "technician"),
        ("/jobs", 6, "customer"),
        ("/jobs", 2, "owner"),
        ("/owner/invoices", 2, "owner"),
        ("/owner/jobs", 2, "owner"),
    ]:
        assert client.get(prefix + path, headers=auth(user, role)).json()["data"] == []
    tracking = client.get(prefix + "/requests/FF-TEST/track", headers=auth(5, "customer"))
    assert tracking.status_code == 200
    assert "customer" not in tracking.json()["data"]


def test_multipart_rejects_non_images(client, prefix, auth):
    response = client.post(
        prefix + "/requests", headers=auth(5, "customer"),
        data={"categoryId": "1", "description": "Test"},
        files={"photo": ("invalid.png", b"not an image", "image/png")},
    )
    assert response.status_code == 422
    assert client.get(prefix + "/uploads/invalid.png").status_code == 401


def test_access_to_request_photo_is_scoped(client, prefix, auth, database):
    from PIL import Image

    from app.config.settings import settings
    from app.database.models import ServiceRequest

    settings.UPLOAD_DIR.mkdir()
    saved = settings.UPLOAD_DIR / "sample.jpg"
    Image.new("RGB", (8, 8)).save(saved)
    with database() as db:
        db.get(ServiceRequest, 1).photo_path = str(saved)
        db.commit()
    url = prefix + "/uploads/sample.jpg"
    for user, role in [(5, "customer"), (3, "technician"), (1, "owner")]:
        resp = client.get(url, headers=auth(user, role))
        assert resp.status_code == 200
        assert resp.headers["cache-control"] == "private, no-store"
    for user, role in [(6, "customer"), (4, "technician"), (2, "owner")]:
        assert client.get(url, headers=auth(user, role)).status_code == 404
    assert client.get(url).status_code == 401
