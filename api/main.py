import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.database import engine, Base
from api.routers import auth, projects, tasks, documents, team, proposals, invoices, change_orders, budgets, time_records, estimate


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path("uploads").mkdir(exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Contractor Pro API", lifespan=lifespan)

if os.getenv("NODE_ENV") != "production":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "mode": os.getenv("NODE_ENV", "development")}


# ── API Routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router,          prefix="/api/auth")
app.include_router(projects.router,      prefix="/api/projects")
app.include_router(tasks.router,         prefix="/api/tasks")
app.include_router(documents.router,     prefix="/api/documents")
app.include_router(team.router,          prefix="/api/team")
app.include_router(proposals.router,     prefix="/api/proposals")
app.include_router(invoices.router,      prefix="/api/invoices")
app.include_router(change_orders.router, prefix="/api/change-orders")
app.include_router(budgets.router,       prefix="/api/budgets")
app.include_router(time_records.router,  prefix="/api/time-records")
app.include_router(estimate.router,      prefix="/api")


# ── Static Files ──────────────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads", check_dir=False), name="uploads")

dist = Path("dist")
if dist.exists():
    app.mount("/", StaticFiles(directory="dist", html=True), name="frontend")
