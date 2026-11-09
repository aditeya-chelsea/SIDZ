import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.config import settings, BASE_DIR
from backend.app.database import init_db, AsyncSessionLocal
from backend.app.seeds.sample_data import seed_sample_data
from backend.app.routers import (
    investigations,
    findings,
    graph,
    tools,
    reports,
    websocket,
)

FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed demo data
    await init_db()
    async with AsyncSessionLocal() as db:
        await seed_sample_data(db)
    yield
    # Shutdown

app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description=f"{settings.APP_SUBTITLE} - Local-First Passive OSINT Engine",
    version=settings.VERSION,
    lifespan=lifespan,
)

# CORS restricted to localhost origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(investigations.router)
app.include_router(findings.router)
app.include_router(graph.router)
app.include_router(tools.router)
app.include_router(reports.router)
app.include_router(websocket.router)

@app.get("/api/status")
async def get_system_status():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "subtitle": settings.APP_SUBTITLE,
        "version": settings.VERSION,
        "mode": "local-first",
        "binding": f"{settings.HOST}:{settings.PORT}",
        "guidelines": "Defensive & Educational OSINT. No credential harvesting or unauthorized probing.",
    }

# Serve Frontend static assets if built
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API or WebSocket calls
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            return None
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
