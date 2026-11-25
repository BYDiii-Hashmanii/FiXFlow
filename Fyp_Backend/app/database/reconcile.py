import argparse
import sqlite3
from pathlib import Path

from app.config.settings import settings


def reconcile(connection: sqlite3.Connection, apply: bool) -> None:
    orphaned_jobs = connection.execute("""
        SELECT j.id, r.request_no, j.technician_id
        FROM jobs j JOIN service_requests r ON r.id = j.request_id
        WHERE NOT EXISTS (
            SELECT 1 FROM request_offers o
            WHERE o.request_id = j.request_id AND o.technician_id = j.technician_id AND o.status = 'accepted'
        )
    """).fetchall()
    for job_id, request_no, technician_id in orphaned_jobs:
        print(f"Job {job_id} ({request_no}) lacks an accepted offer for technician {technician_id}. "
              "Confirm the original assignment before inserting an accepted historical offer. No automatic write.")

    paid = connection.execute("""
        SELECT i.invoice_no, j.id, r.id, j.status, r.status, i.total_amount, p.amount,
               p.customer_id, r.customer_id, p.paid_at
        FROM invoices i JOIN payments p ON p.invoice_id = i.id
        JOIN jobs j ON j.id = i.job_id JOIN service_requests r ON r.id = j.request_id
        WHERE i.status = 'paid' AND (
            p.amount != i.total_amount OR p.customer_id != r.customer_id
            OR j.status != 'closed' OR r.status != 'closed_paid'
        )
    """).fetchall()
    for number, job_id, req_id, status, request_status, total, paid_amount, payer, customer, paid_at in paid:
        if total != paid_amount or payer != customer:
            print(f"Invoice {number}: expected {total}, recorded {paid_amount}. "
                  "Reconcile the invoice and payment against the original records before changing amounts or states.")
            continue
        if status not in ("completed", "closed") or request_status not in ("completed", "closed_paid"):
            print(f"Invoice {number}: incompatible workflow states ({status}, {request_status}); review manually.")
            continue
        print(f"Invoice {number}: {'closing' if apply else 'would close'} job {job_id} and request {req_id}.")
        if apply:
            connection.execute("UPDATE jobs SET status='closed', closed_at=COALESCE(closed_at, ?) WHERE id=?", (paid_at, job_id))
            connection.execute("UPDATE service_requests SET status='closed_paid' WHERE id=?", (req_id,))


def main() -> None:
    parser = argparse.ArgumentParser(description="Report ledger and offer inconsistencies. Default is read-only.")
    parser.add_argument("--database", type=Path, default=settings.DATABASE_PATH)
    parser.add_argument("--apply", action="store_true", help="Apply only matching-payment closure repairs")
    args = parser.parse_args()
    uri = args.database.resolve().as_uri() + ("?mode=rw" if args.apply else "?mode=ro")
    with sqlite3.connect(uri, uri=True) as connection:
        if args.apply:
            connection.execute("BEGIN IMMEDIATE")
        reconcile(connection, args.apply)


if __name__ == "__main__":
    main()
