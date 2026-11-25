import io
import os
from pathlib import Path

import pytest
from sqlalchemy import create_engine

from app.config.settings import settings
from app.controllers import request_controller
from app.controllers.analysis_decision import Detection, decide_analysis
from app.database import models as m
from app.database.migrations import add_label_decisions
from app.model_handle.image_model.label_map import LABEL_MAP, LabelMapError, validate_label_map
from app.model_handle.image_model.model_loader import ImageModelLoader
from app.model_handle.llama_model.repair_guidance import generate_repair_guidance
from test_contracts import image


@pytest.mark.parametrize("customer, state, label, confidence, final, source, suggestion", [
    (1, "ready", "waste_tap", .5, 1, "confirmed", None),
    (1, "ready", "socket_hazard", .8, None, "mismatch", 2),
    (6, "ready", "waste_tap", .8, 1, "confirmed", None),
    (6, "no_detection", None, None, None, "customer", None),
    (2, "ready", "waste_tap", .499, 2, "customer", None),
    (2, "no_detection", None, None, 2, "customer", None),
    (2, "failed", None, None, 2, "customer", None),
    (2, "ready", "unknown", .8, 2, "customer", None),
])
def test_category_decision(customer, state, label, confidence, final, source, suggestion):
    result = decide_analysis(customer, "A maintenance problem", Detection(state, label, confidence), threshold=.5)
    assert (result.final_category_id, result.category_source, result.suggested_category_id) == (final, source, suggestion)
    if state == "ready" and source == "customer":
        assert result.vision_state == "uncertain" and result.label is None


@pytest.mark.parametrize("label, description, model_urgency, urgency, critical, diy", [
    ("leak", "", "low", "medium", False, True),
    ("waste_tap", "", "high", "high", False, True),
    ("damaged_wire", "", "low", "high", True, False),
    ("mold", "", "low", "medium", False, False),
    (None, "There is a smell of gas", "low", "high", True, False),
])
def test_urgency_and_diy_policy(label, description, model_urgency, urgency, critical, diy):
    photos = Detection("ready", label, .9) if label else Detection("no_detection")
    decision = decide_analysis(1, description, photos, threshold=.5, llm_urgency=model_urgency)
    assert (decision.urgency, decision.safety_critical, decision.diy_allowed) == (urgency, critical, diy)
    if not diy:
        assert decision.safety_note


def test_validation_rejects_unmapped_model_class():
    with pytest.raises(LabelMapError, match="new_class"):
        validate_label_map({0: "waste_tap", 1: "new_class"})


def test_label_map_matches_actual_weights(tmp_path, monkeypatch):
    if not settings.YOLO_MODEL_PATH.is_file():
        pytest.skip("Local YOLO weights are required")
    monkeypatch.setenv("YOLO_CONFIG_DIR", str(tmp_path))
    assert set(ImageModelLoader.get_model().names.values()) == set(LABEL_MAP)


def test_migration_preserves_legacy_categories(tmp_path):
    engine = create_engine(f"sqlite:///{(tmp_path / 'legacy.db').as_posix()}")
    try:
        with engine.begin() as conn:
            conn.exec_driver_sql("CREATE TABLE service_categories (id INTEGER PRIMARY KEY)")
            conn.exec_driver_sql("CREATE TABLE service_requests (id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL, detector_label TEXT)")
            conn.exec_driver_sql("INSERT INTO service_categories VALUES (1)")
            conn.exec_driver_sql("INSERT INTO service_requests VALUES (1, 1, 'waste_tap')")
            add_label_decisions(conn)
            add_label_decisions(conn)
            assert conn.exec_driver_sql(
                "SELECT category_id, detector_label, final_category_id, safety_critical, diy_allowed FROM service_requests"
            ).one() == (1, "waste_tap", None, None, None)
    finally:
        engine.dispose()


def setup_categories(database):
    with database() as db:
        db.add_all([m.ServiceCategory(id=2, name="Electrical"), m.ServiceCategory(id=6, name="Other")])
        db.get(m.Technician, 4).category_id = 2
        db.commit()


@pytest.mark.parametrize("chosen_category", [1, 2])
def test_mismatch_resolution_and_booking(client, prefix, auth, database, monkeypatch, chosen_category):
    setup_categories(database)
    monkeypatch.setattr(request_controller, "analyze_file", lambda _: {"primary_issue": "socket_hazard", "confidence": .83})
    generate = request_controller.generate_repair_guidance
    prompts = []

    def record_prompt(description, category, detection):
        prompts.append((category, detection))
        return generate(description, category, detection)

    monkeypatch.setattr(request_controller, "generate_repair_guidance", record_prompt)
    customer = auth(5, "customer")
    result = client.post(prefix + "/requests", headers=customer, data={"categoryId": 1}, files={"photo": image()})
    assert result.status_code == 200, result.text
    path = prefix + "/requests/" + result.json()["data"]["id"]
    result = client.get(path + "/analysis", headers=customer).json()["data"]
    assert result["state"] == "needs_category" and not prompts
    assert result["categorySource"] == "mismatch" and result["categoryChoiceRequired"]
    assert result["detectorLabel"] == "socket_hazard" and result["detectedDisplayName"] == "Electrical socket hazard"
    assert result["confidence"] == .83 and result["detectedCategoryId"] == 2
    assert result["customerCategoryId"] == 1 and result["suggestedCategoryId"] == 2 and result["finalCategoryId"] is None
    assert result["urgency"] == "high" and result["safetyCritical"] and not result["diyAllowed"]
    assert result["safetyNote"] and result["steps"] == []
    assert client.post(path + "/auto-select", headers=customer).status_code == 409
    assert client.post(path + "/offers", headers=customer, json={"technicianId": 3}).status_code == 409
    payload = {"categoryId": chosen_category}
    assert client.patch(path + "/category", headers=auth(6, "customer"), json=payload).status_code == 404
    assert client.patch(path + "/category", headers=auth(3, "technician"), json=payload).status_code == 403
    assert client.patch(path + "/category", headers=customer, json={"categoryId": 999}).status_code == 404
    assert client.patch(path + "/category", headers=customer, json={"categoryId": 0}).status_code == 422
    changed = client.patch(path + "/category", headers=customer, json=payload)
    assert changed.status_code == 200 and changed.json()["data"]["finalCategoryId"] == chosen_category
    ready = client.get(path + "/analysis", headers=customer).json()["data"]
    category_name = "Plumbing" if chosen_category == 1 else "Electrical"
    assert ready["state"] == "ready" and ready["category"] == category_name and not ready["categoryChoiceRequired"]
    assert ready["steps"] == [] and ready["urgency"] == "high" and ready["safetyNote"]
    assert len(prompts) == 1 and prompts[0][0] == category_name
    assert prompts[0][1]["display_name"] == "Electrical socket hazard" and prompts[0][1]["hint"]
    expected, other = (3, 4) if chosen_category == 1 else (4, 3)
    matched = client.post(path + "/auto-select", headers=customer).json()["data"]
    assert matched["id"] == str(expected) and matched["categoryId"] == chosen_category
    manual = client.get(prefix + "/technicians", params={"categoryId": matched["categoryId"], "bestMatch": True}).json()["data"]
    assert [person["id"] for person in manual] == [str(expected)]
    assert client.post(path + "/offers", headers=customer, json={"technicianId": other}).status_code == 409
    assert client.post(path + "/offers", headers=customer, json={"technicianId": expected}).status_code == 200
    assert client.patch(path + "/category", headers=customer, json=payload).status_code == 409
    card = client.get(prefix + "/technician/requests/" + path.rsplit("/", 1)[1], headers=auth(expected, "technician")).json()["data"]
    assert card["category"] == category_name and card["detectedDisplayName"] == ready["detectedDisplayName"]
    assert card["detectionConfidence"] == .83


@pytest.mark.parametrize("label", [None, "waste_tap"])
def test_other_category_with_and_without_detection(client, prefix, auth, database, monkeypatch, label):
    setup_categories(database)
    monkeypatch.setattr(request_controller, "analyze_file", lambda _: {"primary_issue": label, "confidence": .9 if label else None})
    customer = auth(5, "customer")
    response = client.post(prefix + "/requests", headers=customer, data={"categoryId": 6, "description": "A leaking tap"},
                           files={"photo": image()})
    assert response.status_code == 200, response.text
    path = prefix + "/requests/" + response.json()["data"]["id"]
    request = client.get(path, headers=customer).json()["data"]
    assert request["categoryId"] == (1 if label else 6)
    assert request["categoryChoiceRequired"] == (label is None)
    if not label:
        assert client.post(path + "/auto-select", headers=customer).status_code == 409
        assert client.patch(path + "/category", headers=customer, json={"categoryId": 1}).status_code == 200
    assert client.post(path + "/auto-select", headers=customer).json()["data"]["id"] == "3"


@pytest.mark.skipif(os.environ.get("FIXFLOW_TEST_REAL_MODELS") != "1", reason="Requires local YOLO and Ollama")
def test_real_photo_runs_both_models(client, auth, database, monkeypatch, tmp_path):
    from PIL import Image

    setup_categories(database)
    monkeypatch.setenv("YOLO_CONFIG_DIR", str(tmp_path))
    monkeypatch.setattr(request_controller, "generate_repair_guidance", generate_repair_guidance)
    sample = next(Path("app/model_handle").rglob("val_batch0_labels.jpg"))
    photo = io.BytesIO()
    with Image.open(sample) as montage:
        montage.crop((0, 22, montage.width // 4, montage.height // 4)).convert("RGB").save(photo, format="PNG")
    customer = auth(5, "customer")
    created = client.post("/api/requests", headers=customer, data={"categoryId": 6, "description": "The wall paint is peeling."},
                          files={"photo": ("sample.png", photo.getvalue(), "image/png")})
    assert created.status_code == 200, created.text
    path = "/api/requests/" + created.json()["data"]["id"]
    result = client.get(path + "/analysis", headers=customer).json()["data"]
    assert result["state"] == "ready" and result["provenance"] == "yolo+llama", result
    assert result["detectorLabel"] == "paint_defect" and result["confidence"] >= settings.DETECTION_CONFIDENCE_THRESHOLD
    assert result["finalCategoryId"] == 6 and result["summary"] and result["safetyNote"]
    print({key: result[key] for key in ("detectorLabel", "confidence", "category", "categorySource", "provenance")})
