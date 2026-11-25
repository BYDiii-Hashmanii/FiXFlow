import pytest

from app.controllers import request_controller
from app.database import models as m
from test_contracts import image


@pytest.mark.parametrize("outcome", ["ready", "no_detection", "failed"])
def test_analysis_is_separate_from_request_and_booking(client, prefix, auth, database, monkeypatch, outcome):
    def predict(path):
        with database() as db:
            req = db.query(m.ServiceRequest).filter_by(photo_path=str(path)).one()
            assert req.analysis_state == "pending"
        if outcome == "failed":
            raise RuntimeError("Synthetic inference failure")
        if outcome == "no_detection":
            return {"primary_issue": None, "confidence": 0, "analysis": None}
        return {
            "primary_issue": "fixture", "confidence": 0.82,
            "analysis": {"title": "Fixture result", "category": "Plumbing", "urgency": "low",
                         "summary": "Test result", "safety_note": "",
                         "steps": [{"step_no": 1, "instruction": "Check the fixture"}]},
        }

    monkeypatch.setattr(request_controller, "analyze_file", predict)
    customer = auth(5, "customer")
    created = client.post(prefix + "/requests", headers=customer,
                          data={"categoryId": "1", "description": "Example report"}, files={"photo": image()})
    assert created.status_code == 200, created.text
    req = created.json()["data"]["id"]
    assert created.json()["data"]["aiAnalysis"]["state"] == "pending"
    endpoint = prefix + f"/requests/{req}"
    result = client.get(endpoint + "/analysis", headers=customer).json()["data"]
    assert result["state"] == outcome
    assert result["provenance"] == "yolo"
    assert bool(result["steps"]) == (outcome == "ready")
    assert client.post(endpoint + "/auto-select", headers=customer).json()["data"]["id"] == "3"
    assert client.post(endpoint + "/offers", headers=customer, json={"technicianId": 3}).status_code == 200
