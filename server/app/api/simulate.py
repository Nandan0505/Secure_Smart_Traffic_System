# backend/app/api/simulate.py

import os
from fastapi import APIRouter
from app.schemas.alerts import AttackRequest
from app.core.state import sensor_buffers
from app.core.config import SENSOR_IDS, SEQUENCE_LEN
from app.models.inference import models_ready

router = APIRouter()

TRIGGER_PATH = "./data/trigger_attack.txt"


@router.post("/attack")
def trigger_attack(body: AttackRequest):
    """
    Write attack type to trigger file.
    attack_injector.py watches this file and fires within 500ms.
    """
    os.makedirs("./data", exist_ok=True)
    with open(TRIGGER_PATH, "w") as f:
        f.write(body.type)
    return {"status": "triggered", "type": body.type}


@router.get("/status")
def system_status():
    """Full system health — shown on Analytics page bottom card."""
    return {
        "kafka":            "connected",
        "lstm":             "loaded" if models_ready else "waiting for model files",
        "isolation_forest": "loaded" if models_ready else "waiting for model files",
        "sensors": {
            sid: {
                "buffer_count": len(sensor_buffers[sid]),
                "buffer_ready": len(sensor_buffers[sid]) >= SEQUENCE_LEN,
            }
            for sid in SENSOR_IDS
        }
    }