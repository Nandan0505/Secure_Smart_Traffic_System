# backend/app/models/inference.py

import os
import joblib
import torch
import numpy as np
import pandas as pd
import warnings
from datetime import datetime
from sklearn.exceptions import InconsistentVersionWarning

warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

from app.core.config import (
    settings,
    SENSOR_MAP,
    SEQUENCE_LEN,
    LSTM_FEATURES,
    LSTM_WEIGHTS_FILE,
    LSTM_SCALER_FILE,
)
from app.core.state import sensor_buffers
from app.models.lstm_model import TrafficLSTM


# ── Model instances ────────────────────────────────────────
lstm_model   = None
lstm_scaler  = None
if_model     = None
if_scaler    = None
if_features  = []       # loaded from features.pkl — 6 features
models_ready = False


# ── Load both models ───────────────────────────────────────
def load_models() -> bool:
    global lstm_model, lstm_scaler
    global if_model, if_scaler, if_features, models_ready

    lstm_pt  = f"{settings.LSTM_DIR}/{LSTM_WEIGHTS_FILE}"   # traffic_lstm.pth
    lstm_scl = f"{settings.LSTM_DIR}/{LSTM_SCALER_FILE}"    # lstm_scaler.pkl
    if_pkl   = f"{settings.IF_DIR}/isolation_forest.pkl"
    if_scl   = f"{settings.IF_DIR}/scaler.pkl"
    if_feat  = f"{settings.IF_DIR}/features.pkl"

    required = [lstm_pt, lstm_scl, if_pkl, if_scl, if_feat]
    missing  = [p for p in required if not os.path.exists(p)]

    if missing:
        print(f"[WARN] Missing model files: {missing}")
        print("[WARN] Copy model files from teammate into saved_models/")
        print("[INFO] Server starts normally — predictions disabled until files added.")
        return False

    try:
        # ── Load LSTM ──────────────────────────────────────
        lstm_scaler = joblib.load(lstm_scl)
        lstm_model  = TrafficLSTM(
            input_size=5,
            hidden_size=64,
            num_layers=2,
            output_size=3
        )
        lstm_model.load_state_dict(
            torch.load(lstm_pt, map_location=torch.device("cpu"))
        )
        lstm_model.eval()
        print("[OK] LSTM loaded — traffic_lstm.pth")

        # ── Load Isolation Forest ──────────────────────────
        if_model    = joblib.load(if_pkl)
        if_scaler   = joblib.load(if_scl)
        if_features = joblib.load(if_feat)   # ["vehicle_count","avg_speed",
                                              #  "network_latency","day_of_week",
                                              #  "hour","minute"]
        print(f"[OK] Isolation Forest loaded — features: {if_features}")

        models_ready = True
        return True

    except Exception as e:
        print(f"[ERROR] Model loading failed: {e}")
        return False


# ── LSTM prediction ────────────────────────────────────────
def predict_congestion(sensor_id: str) -> dict | None:
    if not models_ready:
        return None

    buf = sensor_buffers.get(sensor_id)
    if buf is None or len(buf) < SEQUENCE_LEN:
        return None

    try:
        rows = []
        for reading in buf:
            # Extract hour and minute from timestamp
            # Simulator publishes isoformat — handle both formats
            dt = datetime.now()
            ts = reading.get("timestamp", "")
            if ts:
                try:
                    # Try isoformat first (simulator output)
                    dt = datetime.fromisoformat(ts)
                except ValueError:
                    try:
                        # Fallback to training format
                        dt = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
                    except ValueError:
                        pass

            rows.append([
                reading.get("vehicle_count", 0),
                reading.get("avg_speed", 0.0),
                reading.get("lane_occupancy", 0.0),
                dt.hour,
                dt.minute,
            ])

        X        = np.array(rows, dtype=np.float32)   # (30, 5)
        X_df     = pd.DataFrame(X, columns=LSTM_FEATURES)
        X_scaled = lstm_scaler.transform(X_df)
        X_tensor = torch.tensor(X_scaled).unsqueeze(0) # (1, 30, 5)

        with torch.no_grad():
            preds_scaled = lstm_model(X_tensor).numpy()  # (1, 3)

        # Inverse transform — exactly as predict.py does it
        # Create dummy row with 5 cols, fill first 3 with predictions
        dummy        = np.zeros((1, 5), dtype=np.float32)
        dummy[0, :3] = preds_scaled[0]
        pred_actuals = lstm_scaler.inverse_transform(dummy)[0]

        count_pred = max(0, round(float(pred_actuals[0]), 1))
        speed_pred = max(0, round(float(pred_actuals[1]), 1))

        # Thresholds from predict.py exactly
        if count_pred < 35:
            level = "LOW"
        elif count_pred < 75:
            level = "MEDIUM"
        elif count_pred < 110:
            level = "HIGH"
        else:
            level = "CRITICAL"

        return {
            "sensor_id":               sensor_id,
            "intersection":            SENSOR_MAP.get(sensor_id, sensor_id),
            "predicted_vehicle_count": count_pred,
            "predicted_avg_speed":     speed_pred,
            "congestion_level":        level,
            "timestamp":               datetime.now().strftime("%H:%M:%S"),
        }

    except Exception as e:
        print(f"[LSTM ERROR] sensor={sensor_id} — {e}")
        return None


# ── Isolation Forest detection ─────────────────────────────
def detect_anomaly(msg: dict) -> dict | None:
    if not models_ready:
        return None

    try:
        # Extract hour and minute from timestamp — IF was trained with these
        dt = datetime.now()
        ts = msg.get("timestamp", "")
        if ts:
            try:
                dt = datetime.fromisoformat(ts)
            except ValueError:
                pass

        # Build feature vector in exact same order as features.pkl
        # ["vehicle_count","avg_speed","network_latency","day_of_week","hour","minute"]
        feature_values = []
        for f in if_features:
            if f == "hour":
                feature_values.append(dt.hour)
            elif f == "minute":
                feature_values.append(dt.minute)
            elif f == "day_of_week":
                feature_values.append(dt.weekday())
            else:
                feature_values.append(msg.get(f, 0))

        X        = np.array([feature_values], dtype=np.float32)
        X_df     = pd.DataFrame(X, columns=if_features)
        X_scaled = if_scaler.transform(X_df)

        pred  = if_model.predict(X_scaled)[0]        # -1=anomaly, 1=normal
        score = if_model.decision_function(X_scaled)[0]  # negative=more anomalous

        if pred == -1:
            # Normalise decision score to 0–1 for display
            # decision_function returns negative values for anomalies
            # More negative = more anomalous
            normalised = round(max(0.0, min(1.0, 0.5 - score)), 3)

            return {
                "sensor_id":     msg.get("sensor_id", ""),
                "intersection":  msg.get("intersection", ""),
                "attack_type":   msg.get("attack_type", "unknown"),
                "score":         normalised,
                "severity":      "HIGH" if normalised > 0.8 else "MEDIUM",
                "vehicle_count": msg.get("vehicle_count", 0),
                "avg_speed":     msg.get("avg_speed", 0.0),
                "latency":       msg.get("network_latency", 0.0),
                "timestamp":     datetime.now().strftime("%H:%M:%S"),
            }

    except Exception as e:
        print(f"[IF ERROR] {e}")

    return None