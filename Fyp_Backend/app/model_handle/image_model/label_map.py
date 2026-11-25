from dataclasses import dataclass

# IDs from FixFlow's service_categories table and its default seed.
PLUMBING = 1
ELECTRICAL = 2
CARPENTRY = 4
OTHER = 6


@dataclass(frozen=True)
class LabelPolicy:
    display_name: str
    category_id: int
    base_urgency: str
    safety_critical: bool
    diy_allowed: bool
    hint: str


LABEL_MAP = {
    "leak": LabelPolicy("Pipe or joint leak", PLUMBING, "medium", False, True, "Water escaping from a pipe joint or connector. Locate the source without dismantling the pipe."),
    "waste_tap": LabelPolicy("Leaking or damaged tap", PLUMBING, "low", False, True, "Dripping tap, often a worn washer, cartridge, or seal. Distinguish a spout drip from a leak at the base."),
    "water_stain": LabelPolicy("Water stain", PLUMBING, "medium", False, True, "Discoloration from possible seepage. Trace nearby moisture without opening walls, and keep clear of wet fittings."),
    "mold": LabelPolicy("Mold growth", PLUMBING, "medium", False, False, "Possible mold and trapped moisture. Avoid disturbing the growth and arrange a moisture assessment."),
    "crack": LabelPolicy("Wall or surface crack", CARPENTRY, "medium", False, False, "A photo cannot establish whether a crack is structural. Keep clear if unstable and arrange an inspection."),
    "ceiling_hole": LabelPolicy("Ceiling hole", CARPENTRY, "high", True, False, "Potential falling debris. Keep people away from the area below the ceiling damage."),
    "paint_defect": LabelPolicy("Peeling or blistered paint", OTHER, "low", False, True, "Peeling or blistering paint may indicate moisture. Check for dampness without scraping or sanding."),
    "tile_crack": LabelPolicy("Cracked tile", CARPENTRY, "low", False, True, "A fractured tile can have sharp edges. Keep foot traffic away and check visually for adjacent damage."),
    "tile_defect": LabelPolicy("Loose tile or grout defect", CARPENTRY, "low", False, True, "Look for loose tile or missing grout. Avoid disturbing tiles and check for signs of water penetration."),
    "socket_hazard": LabelPolicy("Electrical socket hazard", ELECTRICAL, "high", True, False, "Potential shock or fire. Keep away from the socket and contact a qualified electrician."),
    "damaged_wire": LabelPolicy("Exposed or damaged wiring", ELECTRICAL, "high", True, False, "Potentially live exposed or frayed wiring. Keep away and have an electrician isolate and inspect it."),
    "furniture_damage": LabelPolicy("Furniture or cabinet damage", CARPENTRY, "low", False, True, "Loose hinge, damaged panel, or swollen wood. Check visually for instability without loading the damaged part."),
}


class LabelMapError(RuntimeError):
    pass


def validate_label_map(names: dict[int, str] | list[str]) -> None:
    labels = set(names.values() if isinstance(names, dict) else names)
    if missing := labels - LABEL_MAP.keys():
        raise LabelMapError("YOLO labels missing from label_map.py: " + ", ".join(sorted(missing)))
