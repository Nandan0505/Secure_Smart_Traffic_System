# backend/iot/config.py

from typing import List, Dict, Tuple

# ── Kafka ──────────────────────────────────────────────────
KAFKA_BROKER  = "localhost:9092"
TRAFFIC_TOPIC = "traffic_data"
ALERTS_TOPIC  = "security_alerts"

# ── Sensors — 5 real Bangalore intersections ───────────────
SENSOR_IDS: List[str] = ["S001", "S002", "S003", "S004", "S005"]

INTERSECTIONS: List[str] = [
    "Kumaraswamy_Layout_Bus_Stand",
    "Kumaraswamy_Layout_15th_Cross",
    "Banashankari_6th_Stage_Junction",
    "MRCR_Circle",
    "Dollars_Colony_Junction",
]

SENSOR_MAP: Dict[str, str] = {
    "S001": "Kumaraswamy_Layout_Bus_Stand",
    "S002": "Kumaraswamy_Layout_15th_Cross",
    "S003": "Banashankari_6th_Stage_Junction",
    "S004": "MRCR_Circle",
    "S005": "Dollars_Colony_Junction",
}

# ── Bangalore traffic profile ──────────────────────────────
RUSH_HOURS: List[Tuple[int, int]] = [(8, 11), (17, 20)]

TRAFFIC_PROFILE = {
    "night":   {"vehicle_range": (2,  15),  "speed_range": (40, 70)},
    "morning": {"vehicle_range": (20, 60),  "speed_range": (20, 45)},
    "rush_am": {"vehicle_range": (70, 130), "speed_range": (5,  20)},
    "midday":  {"vehicle_range": (15, 50),  "speed_range": (25, 55)},
    "rush_pm": {"vehicle_range": (80, 140), "speed_range": (5,  18)},
    "evening": {"vehicle_range": (20, 55),  "speed_range": (20, 45)},
}

# ── LSTM features — must match train.py exactly ────────────
LSTM_FEATURES = [
    "vehicle_count",
    "avg_speed",
    "lane_occupancy",
    "hour",
    "minute",
]

# ── Isolation Forest features — loaded from features.pkl ──
# Actual: ["vehicle_count","avg_speed","network_latency",
#          "day_of_week","hour","minute"]

SEQUENCE_LEN      = 30
SEND_INTERVAL     = 1      # seconds between publishes
ANOMALY_THRESHOLD = 0.6

# ── Model paths ────────────────────────────────────────────
LSTM_DIR = "./saved_models/lstm"
IF_DIR   = "./saved_models/isolation_forest"

# ── Saved file names — confirm with teammate ───────────────
LSTM_WEIGHTS_FILE = "traffic_lstm.pth"
LSTM_SCALER_FILE  = "lstm_scaler.pkl"