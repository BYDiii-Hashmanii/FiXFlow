import io
import uuid
import logging
from pathlib import Path
from PIL import Image
from app.config.settings import settings
from app.model_handle.image_model.model_loader import get_yolo_model

logger = logging.getLogger(__name__)

# Presets for detected issues to produce full FixFlow diagnostic analysis
ISSUE_METADATA = {
    "leak": {
        "title": "Water Pipe / Joint Leakage",
        "category": "Plumbing",
        "urgency": "medium",
        "summary": "Detected active water leakage from a pipe or joint. Left untreated, it may cause water wastage and moisture damage.",
        "safety_note": "Turn off the main or local water supply valve before attempting any repair or inspection.",
        "steps": [
            "Locate and close the isolation valve or main water shut-off.",
            "Place a collection bucket or absorbent towels under the leak point.",
            "Wipe dry and inspect whether the pipe fitting or connector nut is loose.",
            "If loose, tighten gently by hand or wrench without over-torquing.",
            "If the pipe or seal is cracked, request a certified FixFlow plumber."
        ]
    },
    "waste_tap": {
        "title": "Leaking / Damaged Water Tap",
        "category": "Plumbing",
        "urgency": "low",
        "summary": "Detected dripping or defective tap faucet causing persistent dripping.",
        "safety_note": "Shut off the local angle valve under the basin before dismantling tap parts.",
        "steps": [
            "Turn off the under-sink angle valve.",
            "Unscrew the faucet aerator or handle screw to check washer condition.",
            "Clean mineral deposits or replace the worn rubber O-ring / washer.",
            "Reassemble and test water flow."
        ]
    },
    "water_stain": {
        "title": "Water Seepage & Moisture Stain",
        "category": "Plumbing",
        "urgency": "medium",
        "summary": "Water stains detected indicating internal dampness or slow concealed seepage.",
        "safety_note": "Check that the damp area is not in contact with electrical conduits or fixtures.",
        "steps": [
            "Inspect nearby walls and ceilings for damp spots or peeling paint.",
            "Verify if adjacent bathroom or pipe lines are running constantly.",
            "Keep the area ventilated and avoid covering damp walls.",
            "Schedule a plumber to perform moisture and pressure leak testing."
        ]
    },
    "mold": {
        "title": "Mold & Fungal Growth",
        "category": "Plumbing",
        "urgency": "medium",
        "summary": "Visible fungal or mold infestation caused by high humidity and trapped moisture.",
        "safety_note": "Wear a protective mask and gloves. Avoid scraping dry mold into the air.",
        "steps": [
            "Ventilate the room immediately by opening windows or turning on exhaust fans.",
            "Spray affected surface with a diluted vinegar or antifungal cleaning solution.",
            "Wipe clean with disposable cloth.",
            "Address underlying moisture leak or waterproofing fault."
        ]
    },
    "socket_hazard": {
        "title": "Electrical Socket Hazard",
        "category": "Electrical",
        "urgency": "high",
        "summary": "Hazardous electrical outlet or burn mark detected. Immediate fire or shock risk.",
        "safety_note": "DO NOT touch the socket or plug in appliances. Turn off the corresponding breaker immediately.",
        "steps": [
            "Switch off the main or sub-breaker controlling this outlet.",
            "Do not insert any plug or metal object into the socket.",
            "Keep hands dry and clear pets/children from the area.",
            "Book an electrician to test voltage and replace the damaged outlet faceplate."
        ]
    },
    "damaged_wire": {
        "title": "Exposed / Damaged Electrical Wire",
        "category": "Electrical",
        "urgency": "high",
        "summary": "Exposed, frayed, or charred wiring detected. High risk of electrical shock or short-circuit.",
        "safety_note": "DANGER: High electrical hazard. Disconnect main breaker immediately.",
        "steps": [
            "Turn off the main distribution board circuit breaker immediately.",
            "Do not touch any bare wires or nearby conductive surfaces.",
            "Keep everyone at a safe distance.",
            "Call an electrician immediately for rewiring and safe insulation."
        ]
    },
    "crack": {
        "title": "Wall / Surface Structural Crack",
        "category": "Carpentry",
        "urgency": "medium",
        "summary": "Surface or wall fissure detected. Requires assessment to determine whether structural or plaster-level.",
        "safety_note": "Avoid applying heavy pressure or leaning heavy furniture against cracked partition walls.",
        "steps": [
            "Measure crack length and width with a ruler or gauge.",
            "Check if crack penetrates both sides of the wall.",
            "Clean loose dust along the crack.",
            "Book a maintenance technician for filling or masonry reinforcement."
        ]
    },
    "ceiling_hole": {
        "title": "Ceiling Cavity / Damage",
        "category": "Carpentry",
        "urgency": "medium",
        "summary": "Hole or perforation detected in false ceiling or drywall.",
        "safety_note": "Beware of falling debris or ceiling plaster chunks.",
        "steps": [
            "Clear area directly underneath the ceiling opening.",
            "Inspect for water dripping through the ceiling cavity.",
            "Schedule a repair technician for plaster patching and framing."
        ]
    },
    "paint_defect": {
        "title": "Peeling / Blistered Paint Defect",
        "category": "Other",
        "urgency": "low",
        "summary": "Flaking or bubbling paint detected, typically resulting from dampness or poor primer adhesion.",
        "safety_note": "Keep ventilated while scraping or applying paint touch-ups.",
        "steps": [
            "Scrape off loose paint flakes with a putty knife.",
            "Sand surface smoothly with medium-grit sandpaper.",
            "Apply moisture-resistant primer before final coat."
        ]
    },
    "tile_crack": {
        "title": "Cracked Ceramic Floor/Wall Tile",
        "category": "Carpentry",
        "urgency": "low",
        "summary": "Broken or fractured tile detected. Sharp edges may pose injury risk.",
        "safety_note": "Do not walk barefoot on fractured floor tiles.",
        "steps": [
            "Clean debris and cover sharp cracked edges with adhesive tape temporarily.",
            "Check if surrounding tiles have hollow sound when tapped.",
            "Prepare matching replacement tiles for technician re-grouting and setting."
        ]
    },
    "tile_defect": {
        "title": "Loose / Missing Tile Grout",
        "category": "Carpentry",
        "urgency": "low",
        "summary": "Grout deterioration or loose tile setting detected.",
        "safety_note": "Prevent water seepage through missing grout lines.",
        "steps": [
            "Rake out degraded grout powder from joints.",
            "Clean joint spaces with brush and water.",
            "Apply waterproof tile grout compound into gaps."
        ]
    },
    "furniture_damage": {
        "title": "Cabinet / Woodwork Damage",
        "category": "Carpentry",
        "urgency": "low",
        "summary": "Defective hinge, broken wood panel, or swollen MDF detected.",
        "safety_note": "Support loose cabinet doors to prevent unexpected collapse.",
        "steps": [
            "Inspect hinge screws and alignment.",
            "Tighten loose hinge mountings.",
            "Replace stripped screws with slightly larger gauge or wood dowels."
        ]
    }
}

DEFAULT_ANALYSIS = {
    "title": "General Maintenance Issue",
    "category": "Other",
    "urgency": "medium",
    "summary": "An issue has been detected requiring maintenance inspection.",
    "safety_note": "Ensure safe inspection and turn off relevant utilities if safety is uncertain.",
    "steps": [
        "Inspect the problem area carefully.",
        "Ensure no active leaks or electrical shorts are present.",
        "Book a professional FixFlow technician for comprehensive repair."
    ]
}

def predict_image(image_path_or_bytes) -> dict:
    model = get_yolo_model()
    
    # Load image
    if isinstance(image_path_or_bytes, (str, Path)):
        img = Image.open(str(image_path_or_bytes)).convert("RGB")
    elif isinstance(image_path_or_bytes, bytes):
        img = Image.open(io.BytesIO(image_path_or_bytes)).convert("RGB")
    else:
        img = image_path_or_bytes.convert("RGB")

    # Run inference
    results = model.predict(img, conf=0.25)
    
    detections = []
    top_detection = None
    max_conf = 0.0

    if len(results) > 0 and len(results[0].boxes) > 0:
        for box in results[0].boxes:
            class_id = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = model.names.get(class_id, f"class_{class_id}")
            xyxy = [float(coord) for coord in box.xyxy[0].tolist()]

            det_obj = {
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(conf, 3),
                "box": xyxy
            }
            detections.append(det_obj)
            if conf > max_conf:
                max_conf = conf
                top_detection = class_name

    # Determine diagnosis
    if top_detection and top_detection in ISSUE_METADATA:
        meta = ISSUE_METADATA[top_detection]
    else:
        meta = DEFAULT_ANALYSIS

    return {
        "detected_count": len(detections),
        "detections": detections,
        "primary_issue": top_detection,
        "confidence": round(max_conf, 3) if max_conf > 0 else 0.0,
        "analysis": {
            "title": meta["title"],
            "category": meta["category"],
            "urgency": meta["urgency"],
            "summary": meta["summary"],
            "safety_note": meta["safety_note"],
            "steps": [
                {"step_no": i + 1, "instruction": step}
                for i, step in enumerate(meta["steps"])
            ]
        }
    }
