import re
from dataclasses import dataclass

from app.database.models import UrgencyLevel
from app.model_handle.image_model.label_map import LABEL_MAP, OTHER, LabelPolicy

URGENCY_ORDER = (UrgencyLevel.low, UrgencyLevel.medium, UrgencyLevel.high)
HAZARD_PATTERNS = (
    (re.compile(r"\b(?:smell(?:s|ing)?\s+(?:of|like)\s+gas|gas\s+(?:smell|odou?r|leak)|smell\s+gas)\b", re.I),
     "Leave the area and contact your gas emergency service from outside. Avoid flames and electrical switches."),
    (re.compile(r"\b(?:exposed\s+wir(?:e|es|ing)|live\s+wir(?:e|es|ing)|sparks?|sparking)\b", re.I),
     "Keep away from the affected wiring or appliance and contact a qualified electrician."),
)


@dataclass(frozen=True)
class Detection:
    state: str
    label: str | None = None
    confidence: float | None = None


@dataclass(frozen=True)
class AnalysisDecision:
    vision_state: str
    label: LabelPolicy | None
    final_category_id: int | None
    category_source: str
    suggested_category_id: int | None
    urgency: UrgencyLevel | None
    safety_critical: bool
    diy_allowed: bool
    safety_note: str | None


def combine_urgency(base: UrgencyLevel | None, llm_urgency: str | None, safety_critical: bool) -> UrgencyLevel | None:
    if safety_critical:
        return UrgencyLevel.high
    severities = [UrgencyLevel(value) for value in (base, llm_urgency) if value]
    return max(severities, key=URGENCY_ORDER.index, default=None)


def decide_analysis(
    customer_category: int,
    description: str,
    detection: Detection,
    *,
    threshold: float,
    llm_urgency: str | None = None,
) -> AnalysisDecision:
    label = LABEL_MAP.get(detection.label or "")
    vision = detection.state
    confident = vision == "ready" and label is not None and detection.confidence is not None and detection.confidence >= threshold
    if vision == "ready" and not confident:
        vision = "uncertain"
    final_category, source, suggested = customer_category, "customer", None
    if confident and label:
        if customer_category in (label.category_id, OTHER):
            final_category, source = label.category_id, "confirmed"
        else:
            final_category, source, suggested = None, "mismatch", label.category_id
    elif customer_category == OTHER:
        # Preserve Other as the effective category until the customer chooses at booking.
        final_category = None

    text_safety_note = next((note for pattern, note in HAZARD_PATTERNS if pattern.search(description)), None)
    policy = label if confident else None
    safety_critical = bool(text_safety_note or (policy and policy.safety_critical))
    diy_allowed = not safety_critical and (policy.diy_allowed if policy else True)
    urgency = combine_urgency(UrgencyLevel(policy.base_urgency) if policy else None, llm_urgency, safety_critical)
    safety_note = text_safety_note or (policy.hint if policy and not diy_allowed else None)
    return AnalysisDecision(vision, policy, final_category, source, suggested, urgency, safety_critical, diy_allowed, safety_note)
