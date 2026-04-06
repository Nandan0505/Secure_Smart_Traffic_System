# backend/app/schemas/alerts.py

from pydantic import BaseModel
from typing import Literal


class AlertSchema(BaseModel):
    sensor_id:     str
    intersection:  str
    attack_type:   str
    score:         float
    severity:      str   # HIGH / MEDIUM
    vehicle_count: int
    avg_speed:     float
    latency:       float
    timestamp:     str

    class Config:
        from_attributes = True


class AttackRequest(BaseModel):
    type: Literal["spoofing", "replay", "ddos"] = "spoofing"


class AttackTypeCount(BaseModel):
    attack_type: str
    count:       int