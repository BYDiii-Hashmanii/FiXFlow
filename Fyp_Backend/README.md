# FixFlow API

FixFlow is a FastAPI service backed by SQLite. Each application route is served under `/api` and as a bare path. A customer can simulate invoice payment by selecting a method. The API does not contact a payment provider.

## Local setup

Use Python 3.12. From `Fyp_Backend`:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `DEV_MODE=true` in `.env` for a local, randomly generated session key, or set `SECRET_KEY` to a unique value of at least 32 bytes. Generate a key with `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Use the same secret across production workers. Changing the secret invalidates existing sessions.

```powershell
python -m app.database.migrations
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

`GET /api/health` is the health check. OpenAPI docs are at `/docs`. The server applies schema migrations on startup. [Versioned SQLite migrations](app/database/migrations.py) are authoritative. [The PostgreSQL design](docs/design.sql) is historical.

## Data and configuration

- Set `DATABASE_PATH` and `UPLOAD_DIR` to writable, backed-up locations when deploying. Existing project defaults are `fixflow.db` and `uploads/`.
- Set `CORS_ORIGINS` to a JSON array of allowed browser origins. The defaults allow local Angular development on port 4200.
- Set `YOLO_MODEL_PATH` to the authorized detector weights. The app can accept bookings when the weights are unavailable. `PRELOAD_IMAGE_MODEL=false` skips startup model loading. `IMAGE_TIMEOUT_SECONDS` and `CHAT_TIMEOUT_SECONDS` bound waits. `OLLAMA_MODEL_NAME` selects the model from a separately configured local Ollama service.
- `SEED_DEMO` is off by default. To provision development data on a fresh scratch database, set `DATABASE_PATH` to a new file and `DEMO_PASSWORD` to a local password, then run `python -m app.database.seed`. Alternatively use `SEED_DEMO=true` with the same settings at startup. Public registration creates customers. An existing owner account creates technicians through the owner portal.

Before migrating a populated database, stop writes and copy the SQLite file. Run reconciliation against a backup first:

```powershell
python -m app.database.reconcile --database fixflow.db.bak
```

The default is read-only. The script reports historical jobs lacking an accepted offer and inconsistent paid invoices. Conflicting amounts and assignments require source records to resolve. The optional `--apply` flag repairs only closure states when payer and amount already match.

## Verification

```powershell
python -m pytest -q
```

The suite creates temporary databases and upload directories. It exercises both route aliases and invokes image analysis with controlled test results. The legacy `test_backend.py` and `verify_e2e.py` scripts are outside pytest discovery and should never be run against the live database.
