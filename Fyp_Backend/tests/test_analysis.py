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
    original = request_controller.generate_repair_guidance

    def generate(description, category, detection):
        with database() as db:
            req = db.query(m.ServiceRequest).filter_by(description=description).one()
            assert req.analysis_stage == "guidance"
            assert req.vision_state == outcome
        assert detection["state"] == outcome
        return original(description, category, detection)

    monkeypatch.setattr(request_controller, "generate_repair_guidance", generate)
    customer = auth(5, "customer")
    created = client.post(prefix + "/requests", headers=customer,
                          data={"categoryId": "1", "description": "Example report"}, files={"photo": image()})
    assert created.status_code == 200, created.text
    req = created.json()["data"]["id"]
    assert created.json()["data"]["aiAnalysis"]["state"] == "pending"
    endpoint = prefix + f"/requests/{req}"
    result = client.get(endpoint + "/analysis", headers=customer).json()["data"]
    assert result["state"] == "ready"
    assert result["visionState"] == outcome
    assert result["provenance"] == ("yolo+llama" if outcome == "ready" else "llama")
    assert result["steps"][0]["instruction"] == "Check options"
    assert client.post(endpoint + "/auto-select", headers=customer).json()["data"]["id"] == "3"
    assert client.post(endpoint + "/offers", headers=customer, json={"technicianId": 3}).status_code == 200


def test_text_only_and_unavailable_guidance(client, prefix, auth, monkeypatch):
    def unavailable(*args):
        raise RuntimeError("Simulated unavailable Ollama")

    monkeypatch.setattr(request_controller, "generate_repair_guidance", unavailable)
    customer = auth(5, "customer")
    created = client.post(prefix + "/requests", headers=customer,
                          data={"categoryId": "1", "description": "Report without a photo"})
    assert created.status_code == 200
    path = prefix + "/requests/" + created.json()["data"]["id"]
    analysis = client.get(path + "/analysis", headers=customer).json()["data"]
    assert analysis["state"] == "failed" and analysis["visionState"] == "skipped"
    assert analysis["steps"] == []
    assert client.post(path + "/offers", headers=customer, json={"technicianId": 3}).status_code == 200
