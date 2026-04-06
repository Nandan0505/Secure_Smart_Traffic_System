# backend/app/core/config.py

from pydantic_settings import BaseSettings
from typing import List, Dict, Tuple


class Settings(BaseSettings):
    KAFKA_BROKER:   str = "localhost:9092"
    TRAFFIC_TOPIC:  str = "traffic_data"
    ALERTS_TOPIC:   str = "security_alerts"
    DATABASE_URL:   str = "postgresql://traffic_user:traffic_pass@localhost:5432/traffic_db"
    LSTM_DIR:       str = "./saved_models/lstm"
    IF_DIR:         str = "./saved_models/isolation_forest"
    HOST:           str = "0.0.0.0"
    PORT:           int = 8000

    class Config:
        env_file = ".env"
        extra    = "ignore"


settings = Settings()

# ── Sensor constants ───────────────────────────────────────
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

RUSH_HOURS: List[Tuple[int, int]] = [(8, 11), (17, 20)]

# ── LSTM features — must match train.py exactly ───────────
LSTM_FEATURES: List[str] = [
    "vehicle_count",
    "avg_speed",
    "lane_occupancy",
    "hour",       # extracted from timestamp at inference time
    "minute",     # extracted from timestamp at inference time
]

SEQUENCE_LEN: int = 30

# ── IF features loaded from features.pkl — don't hardcode ─
# IF_FEATURES is NOT defined here — loaded dynamically in inference.py
# from saved_models/isolation_forest/features.pkl
# Actual value: ["vehicle_count","avg_speed","network_latency","day_of_week","hour","minute"]

ANOMALY_THRESHOLD: float = 0.6

# ── Saved model file names — confirm with teammate ────────
LSTM_WEIGHTS_FILE: str = "traffic_lstm.pth"   # from train.py line 68
LSTM_SCALER_FILE:  str = "lstm_scaler.pkl"    # from train.py line 19