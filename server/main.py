# backend/main.py

import sys
import os

# Make sure imports work from backend/ as root
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.startup import lifespan
from app.api import traffic, alerts, simulate, websocket

# ── Create app ─────────────────────────────────────────────
app = FastAPI(
    title="Secure Smart Traffic Management API",
    description="Real-time traffic prediction and IoT cybersecurity detection",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow React dev server ─────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ───────────────────────────────────────
app.include_router(traffic.router,  prefix="/api/traffic",  tags=["Traffic"])
app.include_router(alerts.router,   prefix="/api/alerts",   tags=["Alerts"])
app.include_router(simulate.router, prefix="/api/simulate", tags=["Simulate"])
app.include_router(websocket.router,                        tags=["WebSocket"])

# ── Health check ───────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "secure-smart-traffic"}


# ── Run ────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )