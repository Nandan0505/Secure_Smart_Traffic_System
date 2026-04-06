# backend/app/core/state.py
# All shared in-memory state — no database needed
# deque automatically drops oldest entries when full

from collections import deque
from typing import Dict, Deque, Set
from app.core.config import SENSOR_IDS, SEQUENCE_LEN

# ── LSTM input buffers ─────────────────────────────────────
# Each sensor accumulates 30 readings before LSTM can predict
sensor_buffers: Dict[str, Deque] = {
    sid: deque(maxlen=SEQUENCE_LEN) for sid in SENSOR_IDS
}

# ── Live traffic log ───────────────────────────────────────
# Last 500 readings — used by dashboard chart and analytics
traffic_log: Deque = deque(maxlen=500)

# ── Security alerts ────────────────────────────────────────
# Last 200 alerts — used by security center and ticker
alert_log: Deque = deque(maxlen=200)

# ── LSTM predictions ───────────────────────────────────────
# Last prediction per sensor — used by prediction panel
# Dict so React always gets the latest per sensor, not a list
latest_predictions: Dict[str, dict] = {}

# ── Per-sensor latest reading ──────────────────────────────
# Used by sensor status grid — one card per sensor
latest_readings: Dict[str, dict] = {
    sid: {
        "sensor_id": sid,
        "intersection": sid,
        "vehicle_count": 0,
        "avg_speed": 0.0,
        "lane_occupancy": 0.0,
        "timestamp": "--:--:--",
        "buffer_count": 0,
        "buffer_ready": False
    } for sid in SENSOR_IDS
}

# ── WebSocket clients ──────────────────────────────────────
# Set of active WebSocket connections
connected_clients: Set = set()

# ── Analytics aggregates ───────────────────────────────────
# Per-intersection running totals — for comparison bar chart
intersection_totals: Dict[str, dict] = {
    sid: {"total_vehicles": 0, "total_speed": 0.0, "count": 0}
    for sid in SENSOR_IDS
}