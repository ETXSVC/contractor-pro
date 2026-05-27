# Contractor Pro

Full-stack construction management platform — project tracking, document vault, time records, proposals, invoices, change orders, budget cost codes, and a CPU-accelerated cost estimator with background job processing for PDF generation and DWG/BIM file parsing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 |
| Backend | FastAPI, Python 3.12, Uvicorn (ASGI) |
| Production server | Gunicorn + Uvicorn workers (4 processes) |
| Database | PostgreSQL 16, SQLAlchemy 2.x async (asyncpg) |
| Migrations | Alembic |
| Auth | JWT (python-jose + passlib/bcrypt) |
| File uploads | python-multipart (disk storage) |
| Background jobs | Celery + Redis (CPU-bound tasks) |
| DWG/BIM parsing | ezdxf |
| PDF generation | ReportLab |
| Containerization | Docker (2-stage: Node builder + Python runtime) |

---

## Features

- **Dashboard** — live project stats, revenue metrics, team activity feed
- **Projects** — create, edit, track progress (In Progress / Bidding / Completed)
- **Tasks** — kanban board with priority, assignee, and due date
- **Document Vault** — drag-and-drop upload (PDF, DWG, DOCX, XLSX, images), view and download in-browser, background DWG layer parsing via Celery
- **Team** — member directory with department, status, and contact info
- **Proposals** — bid pipeline (Drafting → Sent → Approved/Declined)
- **Invoices** — invoice management with Paid/Pending/Overdue status
- **Change Orders** — formal change order tracking with approval workflow
- **Budget** — cost code ledger (budgeted vs actual vs committed)
- **Time Records** — billable/non-billable time logging per project
- **Cost Estimator** — instant budget breakdown by sq footage and project type; background PDF report generation via Celery

---

## Multi-Tenant Architecture

Every record is scoped to a `tenant_id`. Registering creates a new isolated tenant. JWT tokens carry `tenant_id` and are verified on every protected route via `Depends(get_current_user)`.

---

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 20+ (frontend build only)
- Docker Desktop (PostgreSQL + Redis)

### Setup

```bash
# 1. Start local services
docker-compose up -d        # PostgreSQL on port 5434, Redis on port 6379

# 2. Create Python virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Install frontend dependencies
npm install

# 5. Start both servers (two terminals)
# Terminal 1 — FastAPI backend on port 8000:
uvicorn api.main:app --reload --port 8000

# Terminal 2 — Vite frontend on port 5173 (proxies /api/* to :8000):
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) and create an account via the **Create Account** tab.

Tables are created automatically on first startup via SQLAlchemy `create_all`.

### Environment Variables

| Variable | Default (local) | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://contractor:contractor_pass@localhost:5434/contractor_pro` | PostgreSQL connection string |
| `JWT_SECRET` | `secret` | JWT signing secret |
| `NODE_ENV` | `development` | Enables CORS for Vite dev server |
| `CELERY_BROKER_URL` | `redis://localhost:6379/0` | Redis broker for background jobs |

Create a `.env` file in the project root to override any of these.

### Running the Celery worker (optional for local dev)

```bash
celery -A api.worker worker --loglevel=info
```

---

## Project Structure

```
contractor-pro/
├── api/                        # FastAPI backend
│   ├── main.py                 # App entry point, static file mounts, lifespan
│   ├── database.py             # SQLAlchemy async engine + session factory
│   ├── models.py               # SQLAlchemy ORM models (all 11 tables)
│   ├── schemas.py              # Pydantic v2 request/response schemas
│   ├── auth.py                 # JWT create/decode, bcrypt hash/verify
│   ├── deps.py                 # FastAPI dependencies (get_db, get_current_user)
│   ├── worker.py               # Celery app + CPU-bound task definitions
│   └── routers/
│       ├── auth.py             # POST /api/auth/register, /login
│       ├── projects.py
│       ├── tasks.py
│       ├── documents.py        # Multipart upload + DWG dispatch
│       ├── team.py
│       ├── proposals.py
│       ├── invoices.py
│       ├── change_orders.py
│       ├── budgets.py
│       ├── time_records.py
│       └── estimate.py         # POST /api/estimate (public)
├── alembic/                    # Database migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── alembic.ini
├── requirements.txt
├── src/                        # React 19 frontend (unchanged)
│   ├── main.tsx
│   ├── App.tsx
│   ├── contexts/AuthContext.tsx
│   ├── lib/api.ts
│   ├── types.ts
│   └── components/
├── uploads/                    # Runtime: uploaded files (volume-mounted in prod)
├── dist/                       # Runtime: Vite production build (served by FastAPI)
├── Dockerfile                  # 2-stage: Node builder + Python runtime
├── docker-compose.yml          # Local dev: PostgreSQL + Redis
└── deploy.bat                  # One-click build + push + 5-container deploy
```

---

## API Routes

All routes except `/api/auth/*`, `/api/health`, and `/api/estimate` require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account + tenant |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/health` | Health check |
| GET/POST | `/api/projects` | List / create projects |
| PATCH/DELETE | `/api/projects/{id}` | Update / delete project |
| GET/POST | `/api/tasks` | List / create tasks |
| PATCH/DELETE | `/api/tasks/{id}` | Update / delete task |
| GET/POST | `/api/documents` | List / create (metadata) |
| POST | `/api/documents/upload` | Upload file (multipart/form-data) |
| DELETE | `/api/documents/{id}` | Delete document + file |
| GET/POST | `/api/team` | List / add team members |
| GET/POST | `/api/proposals` | List / create proposals |
| GET/POST | `/api/invoices` | List / create invoices |
| PATCH | `/api/invoices/{id}` | Update invoice |
| GET/POST | `/api/change-orders` | List / create change orders |
| PATCH | `/api/change-orders/{id}` | Update change order |
| GET/POST | `/api/budgets` | List / create budget cost codes |
| PATCH | `/api/budgets/{id}` | Update budget line |
| GET/POST | `/api/time-records` | List / create time records |
| DELETE | `/api/time-records/{id}` | Delete time record |
| POST | `/api/estimate` | Cost estimator (no auth) |

Uploaded files served at `/uploads/<filename>`. Interactive API docs at `/docs` (FastAPI Swagger UI).

---

## Background Jobs (Celery)

Heavy CPU-bound work runs in isolated Celery worker processes — never blocks the API server.

| Task | Trigger | Description |
|---|---|---|
| `tasks.generate_pdf_report` | Manual / scheduled | ReportLab PDF project report |
| `tasks.parse_dwg` | On DWG upload | ezdxf layer/entity extraction |

Dispatch example:
```python
from api.worker import generate_pdf_report
generate_pdf_report.delay(project_id="...", tenant_id="...")
```

---

## Production Deployment

### One-click deploy

```bat
deploy.bat
```

The script:
1. Builds a 2-stage Docker image (Node 20 builds frontend, Python 3.12-slim runs it)
2. Pushes to private registry at `212.28.191.134:5000`
3. SSHs to VPS — ensures `contractor-net`, PostgreSQL, and Redis containers are running
4. Pulls and starts the app container (4 Gunicorn/Uvicorn workers)
5. Pulls and starts the Celery worker container (2 concurrent workers)

### Volumes

| Volume | Mount | Purpose |
|---|---|---|
| `contractor_pgdata` | `/var/lib/postgresql/data` | Database persistence |
| `contractor_uploads` | `/app/uploads` | Uploaded file persistence (shared by app + worker) |

### Scaling

To handle more load, increase Gunicorn workers in the `CMD`:
```
-w 8
```
Each worker is a separate OS process — fully utilizes multi-core CPUs for concurrent requests. For Celery, increase `--concurrency` on the worker container.

### Adding a future migration

```bash
alembic revision --autogenerate -m "add column X"
alembic upgrade head
```

The migration runs automatically on next deploy.
