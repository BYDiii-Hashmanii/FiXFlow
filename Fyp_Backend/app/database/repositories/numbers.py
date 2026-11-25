from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.orm import Session

from app.database import models as m


def next_number(db: Session, series: str) -> str:
    if series == "request":
        stem, column = "FF-", m.ServiceRequest.request_no
    elif series == "invoice":
        stem, column = f"INV-{datetime.now(timezone.utc).year}-", m.Invoice.invoice_no
    else:
        raise ValueError("Unknown number series")

    increment = db.execute(
        m.NumberSequence.__table__.update()
        .where(m.NumberSequence.name == stem)
        .values(value=m.NumberSequence.value + 1)
        .returning(m.NumberSequence.value)
    ).scalar_one_or_none()
    if increment is not None:
        return f"{stem}{increment:04d}"
    suffixes = db.query(column).filter(column.startswith(stem)).all()
    used = (int(value[len(stem):]) for (value,) in suffixes if value[len(stem):].isascii() and value[len(stem):].isdigit())
    first = max(used, default=0) + 1
    initial = insert(m.NumberSequence).values(name=stem, value=first)
    change = initial.on_conflict_do_update(
        index_elements=[m.NumberSequence.name],
        set_={"value": func.max(m.NumberSequence.value + 1, initial.excluded.value)},
    ).returning(m.NumberSequence.value)
    return f"{stem}{db.execute(change).scalar_one():04d}"
