import sys
from pathlib import Path
import io
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=== Testing FixFlow FastAPI Backend ===")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("PASS: Health check ->", res.json())

    # 2. Login as Customer
    res = client.post("/api/auth/login", json={"phoneOrEmail": "+923001234567", "password": "Test@1234"})
    assert res.status_code == 200, f"Customer login failed: {res.text}"
    cust_data = res.json()["data"]
    token = cust_data["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("PASS: Customer Login ->", cust_data["fullName"], f"({cust_data['role']})")

    # 3. Categories
    res = client.get("/api/categories")
    assert res.status_code == 200
    cats = res.json()["data"]
    print(f"PASS: Categories listed -> {len(cats)} categories ({[c['name'] for c in cats]})")

    # 4. List requests
    res = client.get("/api/requests", headers=headers)
    assert res.status_code == 200
    reqs = res.json()["data"]
    print(f"PASS: Requests listed -> {len(reqs)} requests")

    # 5. Get request details and analysis
    res = client.get("/api/requests/FF-0142", headers=headers)
    assert res.status_code == 200
    req = res.json()["data"]
    print("PASS: Request details ->", req["id"], req["description"])

    res = client.get("/api/requests/FF-0142/analysis", headers=headers)
    assert res.status_code == 200
    analysis = res.json()["data"]
    print("PASS: AI Analysis ->", analysis["title"], f"({len(analysis['steps'])} repair steps)")

    # 6. Technicians list
    res = client.get("/api/technicians")
    assert res.status_code == 200
    techs = res.json()["data"]
    print(f"PASS: Technicians list -> {len(techs)} technicians ({[t['name'] for t in techs]})")

    # 7. Job details
    res = client.get("/api/jobs/FF-0142", headers=headers)
    assert res.status_code == 200
    job = res.json()["data"]
    print("PASS: Job details ->", job["id"], f"Status: {job['status']}", f"Parts: {len(job['parts'])}")

    # 8. Invoice details
    res = client.get("/api/invoices/INV-2026-0142", headers=headers)
    assert res.status_code == 200
    inv = res.json()["data"]
    print("PASS: Invoice details ->", inv["id"], f"Total: Rs {inv['totalCost']}")

    # 9. Owner dashboard
    res_owner_login = client.post("/api/auth/login", json={"phoneOrEmail": "+923012345678", "password": "Test@1234"})
    assert res_owner_login.status_code == 200
    owner_token = res_owner_login.json()["data"]["token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    res = client.get("/api/owner/dashboard", headers=owner_headers)
    assert res.status_code == 200
    owner_dash = res.json()["data"]
    print("PASS: Owner dashboard ->", owner_dash["greeting"]["name"], owner_dash["stats"])

    # 10. Notifications
    res = client.get("/api/notifications", headers=headers)
    assert res.status_code == 200
    notifs = res.json()["data"]
    print(f"PASS: Notifications -> {len(notifs)} notifications")

    # 11. Create new request with synthetic image upload to test AI YOLO pipeline
    img = Image.new("RGB", (320, 240), color=(73, 109, 137))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    res = client.post(
        "/api/requests",
        data={"category": "Plumbing", "description": "Sink connector is leaking", "accessTime": "Today, 3:00 PM"},
        files={"photo": ("leak_test.jpg", img_byte_arr, "image/jpeg")},
        headers=headers
    )
    assert res.status_code == 200
    new_req = res.json()["data"]
    print("PASS: Create request with image ->", new_req["id"], f"Urgency: {new_req['urgency']}")

    # 12. AI Chatbot
    res = client.post("/api/chat", json={
        "messages": [{"role": "user", "content": "How do I turn off my main water valve?"}]
    })
    assert res.status_code == 200
    reply = res.json()["data"]["reply"]
    print("PASS: Chatbot response ->", reply[:80] + "...")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
