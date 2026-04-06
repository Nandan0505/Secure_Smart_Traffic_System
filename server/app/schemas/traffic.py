# backend/app/schemas/traffic.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TrafficReadingSchema(BaseModel):
    sensor_id:       str
    intersection:    str
    vehicle_count:   int
    avg_speed:       float
    lane_occupancy:  float
    network_latency: float
    timestamp:       str
    is_attack:       bool = False

    class Config:
        from_attributes = True


class PredictionSchema(BaseModel):
    sensor_id:               str
    intersection:            str
    predicted_vehicle_count: float
    congestion_level:        str   # LOW / MEDIUM / HIGH / CRITICAL
    timestamp:               str

    class Config:
        from_attributes = True


class IntersectionAvgSchema(BaseModel):
    intersection: str
    avg_vehicles: float
    avg_speed:    float