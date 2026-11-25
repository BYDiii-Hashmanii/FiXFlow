import sys
import io
import time
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_workflow():
    print("\n--- [E2E 1] Registering New Customer ---")
    unique_phone = f"+92300{int(time.time()) % 10000000:07d}"
    reg_payload = {
        "fullName": "Zahid Khan",
        "phone": unique_phone,
        "email": f"zahid_{int(time.time())}@example.com",
        "password": "Password@123",
        "role": "customer",
        "address": "House 12, Street 4, F-7/1, Islamabad"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200, f"Register failed: {reg_res.text}"
    user = reg_res.json()["data"]
    token = user["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Registered: {user['fullName']} (ID: {user['id']}, Phone: {unique_phone})")

    print("\n--- [E2E 2] Submitting Issue with Image Upload & AI Detection ---")
    img = Image.new("RGB", (640, 480), color=(100, 150, 200))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    req_res = client.post(
        "/api/requests",
        data={
            "category": "Plumbing",
            "description": "Drain pipe joint is leaking water under the basin.",
            "accessTime": "Today, 4:00 PM"
        },
        files={"photo": ("basin_leak.jpg", img_byte_arr, "image/jpeg")},
        headers=headers
    )
    assert req_res.status_code == 200, f"Request creation failed: {req_res.text}"
    req_data = req_res.json()["data"]
    req_id = req_data["id"]
    print(f"Created Request: {req_id} - {req_data['description']}")
    print(f"Urgency: {req_data['urgency']}, Status: {req_data['status']}")

    print("\n--- [E2E 3] Retrieving AI Analysis & Safe Repair Steps ---")
    analysis_res = client.get(f"/api/requests/{req_id}/analysis", headers=headers)
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()["data"]
    print(f"AI Problem Title: {analysis['title']}")
    print(f"Safety Note: {analysis['safetyNote']}")
    print(f"Repair Steps: {len(analysis['steps'])} steps generated")

    print("\n--- [E2E 4] Auto-Selecting Technician & Sending Offer ---")
    auto_res = client.post(f"/api/requests/{req_id}/auto-select", headers=headers)
    assert auto_res.status_code == 200
    tech = auto_res.json()["data"]
    tech_id = int(tech["id"])
    print(f"Selected Technician: {tech['name']} ({tech['company']}) - Rate: Rs {tech['rate']}")

    offer_res = client.post(f"/api/requests/{req_id}/offers", json={"technicianId": tech_id}, headers=headers)
    assert offer_res.status_code == 200
    offer = offer_res.json()["data"]
    print(f"Offer Sent: Status: {offer['status']}, Price: Rs {offer['offeredPrice']}")

    print("\n--- [E2E 5] Technician Accepting Job & Starting Work ---")
    tech_login_res = client.post("/api/auth/login", json={"phoneOrEmail": "+923001112233", "password": "Test@1234"})
    assert tech_login_res.status_code == 200
    tech_token = tech_login_res.json()["data"]["token"]
    tech_headers = {"Authorization": f"Bearer {tech_token}"}

    start_res = client.post(f"/api/jobs/{req_id}/start", headers=tech_headers)
    assert start_res.status_code == 200
    job_started = start_res.json()["data"]
    print(f"Job Started: {job_started['id']} - Status: {job_started['status']}")

    print("\n--- [E2E 6] Updating Work, Parts, and Labour Cost ---")
    update_res = client.put(f"/api/jobs/{req_id}/update", json={
        "workStatusNote": "Replaced drain seal and tested",
        "expectedCompletion": "Today, 5:30 PM",
        "labourHours": 1.5,
        "labourCost": 1800,
        "parts": [
            {"id": "p1", "name": "Drain Seal Ring", "quantity": 1, "unitPrice": 450, "total": 450},
            {"id": "p2", "name": "Teflon Tape", "quantity": 1, "unitPrice": 120, "total": 120}
        ]
    }, headers=tech_headers)
    assert update_res.status_code == 200
    updated_job = update_res.json()["data"]
    print(f"Work Updated: Total Cost: Rs {updated_job['totalCost']} (Parts: {len(updated_job['parts'])}, Labour: Rs {updated_job['labourCost']})")

    print("\n--- [E2E 7] Completing Job & Generating Invoice ---")
    comp_res = client.post(f"/api/jobs/{req_id}/complete", headers=tech_headers)
    assert comp_res.status_code == 200

    inv_res = client.post(f"/api/jobs/{req_id}/invoice", headers=tech_headers)
    assert inv_res.status_code == 200
    inv = inv_res.json()["data"]
    inv_no = inv["invoiceNumber"]
    print(f"Invoice Generated: {inv_no} - Total: Rs {inv['totalCost']}")

    print("\n--- [E2E 8] Customer Paying Invoice ---")
    pay_res = client.post(f"/api/invoices/{inv_no}/pay", json={"method": "card"}, headers=headers)
    assert pay_res.status_code == 200
    pay = pay_res.json()["data"]
    print(f"Payment Settled: Receipt: {pay['receiptNumber']} - Amount: Rs {pay['amount']}")

    print("\n--- [E2E 9] Customer Submitting Review ---")
    rev_res = client.post(f"/api/jobs/{req_id}/review", json={
        "rating": 5,
        "comment": "Excellent and speedy repair! Very professional."
    }, headers=headers)
    assert rev_res.status_code == 200
    rev = rev_res.json()["data"]
    print(f"Review Submitted: Rating: {rev['rating']} Stars - '{rev['comment']}'")

    print("\n--- [E2E 10] Testing FixFlow Llama Chatbot with Context ---")
    chat_res = client.post("/api/chat", json={
        "messages": [
            {"role": "user", "content": "How do I check if my bathroom sink drain is still leaking?"}
        ],
        "context": f"Customer recently had repair on {req_id} ({analysis['title']})"
    })
    assert chat_res.status_code == 200
    reply = chat_res.json()["data"]["reply"]
    print(f"Llama Chatbot Response:\n{reply[:160]}...\n")

    print("=====================================================")
    print("ALL 10 END-TO-END WORKFLOW PHASES PASSED FLAWLESSLY!")
    print("=====================================================")

if __name__ == "__main__":
    test_full_workflow()
