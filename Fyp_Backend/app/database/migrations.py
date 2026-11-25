from sqlalchemy import Engine
from sqlalchemy.schema import CreateIndex, CreateTable

from app.database import models as m
from app.database.session import Base, engine


def rebuild_with_checks(conn) -> None:
    for model in (m.User, m.Technician, m.ServiceRequest, m.AiAnalysis, m.RequestOffer,
                  m.Job, m.JobPhoto, m.Invoice, m.Review):
        table = model.__table__
        current_sql = conn.exec_driver_sql(
            "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = ?", (table.name,)
        ).scalar_one()
        if "CHECK (" in current_sql:
            continue
        temporary = f"{table.name}__migration"
        sql = str(CreateTable(table).compile(dialect=conn.dialect))
        sql = sql.replace(f"CREATE TABLE {table.name} ", f"CREATE TABLE {temporary} ", 1)
        conn.exec_driver_sql(sql)
        old_columns = {row[1] for row in conn.exec_driver_sql(f'PRAGMA table_info("{table.name}")')}
        columns = ", ".join(f'"{column.name}"' for column in table.columns if column.name in old_columns)
        conn.exec_driver_sql(f'INSERT INTO "{temporary}" ({columns}) SELECT {columns} FROM "{table.name}"')
        conn.exec_driver_sql(f'DROP TABLE "{table.name}"')
        conn.exec_driver_sql(f'ALTER TABLE "{temporary}" RENAME TO "{table.name}"')
        for index in sorted(table.indexes, key=lambda item: item.name):
            conn.execute(CreateIndex(index))


def add_analysis_state(conn) -> None:
    columns = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(service_requests)")}
    for name, declaration in {
        "analysis_state": "VARCHAR(16) NOT NULL DEFAULT 'no_detection'", "analysis_source": "VARCHAR(40)",
        "analysis_confidence": "NUMERIC(5,4)", "detector_label": "VARCHAR(120)", "detected_category": "VARCHAR(80)",
    }.items():
        if name not in columns:
            conn.exec_driver_sql(f"ALTER TABLE service_requests ADD COLUMN {name} {declaration}")
    conn.exec_driver_sql(
        "UPDATE service_requests SET analysis_state='failed', analysis_source='legacy' "
        "WHERE analysis_source IS NULL AND EXISTS (SELECT 1 FROM ai_analyses a WHERE a.request_id=service_requests.id)"
    )


def add_list_indexes(conn) -> None:
    for sql in (
        "CREATE INDEX IF NOT EXISTS ix_requests_customer_created ON service_requests(customer_id, created_at DESC, id DESC)",
        "CREATE INDEX IF NOT EXISTS ix_notifications_user_created ON notifications(user_id, created_at DESC, id DESC)",
        "CREATE INDEX IF NOT EXISTS ix_technicians_category_availability ON technicians(category_id, availability)",
    ):
        conn.exec_driver_sql(sql)


MIGRATIONS = ((1, rebuild_with_checks), (2, add_analysis_state), (3, add_list_indexes))


def migrate(database: Engine = engine) -> None:
    with database.connect() as conn:
        conn.exec_driver_sql("PRAGMA foreign_keys=OFF")
        conn.commit()
        try:
            conn.exec_driver_sql("BEGIN IMMEDIATE")
            Base.metadata.create_all(conn)
            conn.exec_driver_sql("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)")
            versions = set(conn.exec_driver_sql("SELECT version FROM schema_migrations").scalars())
            for version, operation in MIGRATIONS:
                if version not in versions:
                    operation(conn)
                    conn.exec_driver_sql("INSERT INTO schema_migrations (version) VALUES (?)", (version,))
            violations = conn.exec_driver_sql("PRAGMA foreign_key_check").all()
            if violations:
                raise RuntimeError(f"Foreign-key check failed during migration ({len(violations)} rows)")
            conn.commit()
        finally:
            conn.rollback()
            conn.exec_driver_sql("PRAGMA foreign_keys=ON")


if __name__ == "__main__":
    migrate()
