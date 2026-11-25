# FixFlow

FixFlow is a final-year project for reporting, diagnosing, and booking home-maintenance repairs. It connects customers, technicians, and service-company owners through a shared request workflow. Image analysis can suggest a service category and repair guidance, and the customer can review a match before sending a request.

## What the project does

| Portal | Capabilities |
| --- | --- |
| Customer | Register, report an issue with a description or photo, use the camera or gallery, review AI guidance, book a technician, track work, simulate invoice payment, and leave a review. |
| Technician | View incoming offers, accept or decline requests, start and complete jobs, record work and parts, upload before-and-after photos, and issue invoices. |
| Company owner | Manage technicians, availability and rates, and view company-scoped jobs, invoices, and feedback. |

The customer can use **Auto Select** for a ranked recommendation or **Choose Technician** to compare available technicians. If a confident image result disagrees with the customer’s category, FixFlow asks the customer to confirm which category to use. When the report has no usable category, the customer can return home and find the saved report in **My Requests**.

The frontend uses **Angular 21 and TypeScript**. The API uses **FastAPI, Python 3.12, SQLAlchemy, and SQLite**. The AI pipeline uses **YOLO11** to detect defects in photos and **Llama 3.2 via Ollama** for structured guidance. Payments are simulated within the app.

## Clone and fetch updates

Install Git, then clone the repository from PowerShell, Git Bash, or a terminal:

```bash
git clone https://github.com/BYDiii-Hashmanii/FiXFlow.git
cd FiXFlow
```

If GitHub asks you to authenticate, use the GitHub account that has access to the repository.

From an existing clone, download and apply the latest `main` updates:

```bash
git switch main
git fetch origin
git merge --ff-only origin/main
```

`git fetch origin` refreshes the remote branches. The fast-forward merge brings those changes into your local `main` and stops if your branch has diverged.

For group contributions, create a branch from the updated `main`:

```bash
git switch -c feature/your-change
# Edit and test your changes, then stage the files you changed.
git add "path/to/changed-file"
git commit -m "Describe your change"
git push -u origin feature/your-change
```

Open a pull request into `main` on GitHub. Pushing a branch requires write access to the repository.

## Run locally

Install **Python 3.12**, **Node.js 24**, and **npm 11**. The setup commands below use Windows PowerShell. On macOS or Linux, use `python3.12` to create the virtual environment and `.venv/bin/python` to run Python commands. Ollama and the model files are needed for local AI inference.

### 1. Set up the backend

From the repository root:

```powershell
cd Fyp_Backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Create `.env` once. For a first local demo, edit these entries in `Fyp_Backend/.env` before starting the server:

```dotenv
DEV_MODE=true
DATABASE_PATH=fixflow-local.db
SEED_DEMO=true
DEMO_PASSWORD=<replace-with-your-own-local-demo-password>
```

Choose a demo password with at least 8 characters and at most 72 UTF-8 bytes. At startup, the backend applies SQLite migrations and seeds the demo categories and accounts on a fresh database. Once seeded, the accounts keep the password they were created with. Use `SEED_DEMO=false` and configure a unique `SECRET_KEY` of at least 32 bytes for a shared or production deployment.

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- API health check at `http://127.0.0.1:8000/api/health`
- Interactive API documentation at `http://127.0.0.1:8000/docs`

### 2. Set up the frontend

Open another terminal at the repository root:

```powershell
cd Fyp_frontend
npm ci
npm start
```

Open `http://localhost:4200` to choose a portal. The development frontend sends API requests to `http://127.0.0.1:8000/api`.

To try the demo as a **customer**, use `raja@example.com` or register a new account. For the **technician** portal, use `hamza.malik@rayyanrepairs.com`. For the **company owner** portal, use `daaem@rayyanrepair.pk`. Seeded accounts use the password you configured locally in `DEMO_PASSWORD`.

### 3. Enable photo analysis and AI guidance

Obtain the team’s approved model files through its shared storage. You can start the portals and sign in to the demo accounts while setting up the models. Model weights, local databases, uploaded photos, and environment secrets are kept locally.

- **YOLO**. Put `best.pt` at `Fyp_Backend/app/model_handle/fixFlow_Model_cv/FixFlow_Training_Final_model/FixFlow_YOLO11s_v2/weights/best.pt`, or point `YOLO_MODEL_PATH` to your copy in `.env`. Use the FixFlow weights that match the [label map](Fyp_Backend/app/model_handle/image_model/label_map.py).
- **Ollama**. Start the local Ollama service. In the directory containing `Llama-3.2-1B-Instruct-Q4_K_M.gguf`, create a file named `Modelfile` with this line:

  ```text
  FROM ./Llama-3.2-1B-Instruct-Q4_K_M.gguf
  ```

  Then register the model and confirm it appears:

  ```powershell
  ollama create fixflow --file Modelfile
  ollama list
  ```

  The backend uses `OLLAMA_MODEL_NAME=fixflow` by default. Set it to a different local model name if your team uses one, then restart the API with the new configuration.

## Repository layout and checks

| Path | What it contains |
| --- | --- |
| [`Fyp_Backend/`](Fyp_Backend) | FastAPI routes and controllers, SQLite migrations, model integration, and pytest tests. |
| [`Fyp_frontend/`](Fyp_frontend) | Angular customer, technician, and owner portals. |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | GitHub Actions checks. |

Run the backend suite from `Fyp_Backend`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

The backend suite uses temporary databases. To exercise real photo-to-guidance inference, install both model assets and run `test_real_photo_runs_both_models` with `FIXFLOW_TEST_REAL_MODELS=1`.

Run the frontend checks from `Fyp_frontend`:

```powershell
npm run typecheck
npm run lint
npm test -- --watch=false
npm run build
```

See the [backend guide](Fyp_Backend/README.md) for database and API configuration, and the [frontend guide](Fyp_frontend/README.md) for production hosting and routing.
