# pipeline/flask_app.py
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask, jsonify, render_template
from flask_socketio import SocketIO
from kafka import KafkaConsumer
import json, threading, joblib, torch
import numpy as np
import torch.nn as nn
from datetime import datetime
from collections import deque
import warnings
from sklearn.exceptions import InconsistentVersionWarning

# Ignore the scikit-learn version mismatch warnings
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

from iot.config import (
    KAFKA_BROKER, TRAFFIC_TOPIC,
    SENSOR_IDS, SENSOR_MAP
)

app      = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# ── Constants ─────────────────────────────────────────────
SEQUENCE_LEN = 30
FEATURES     = ["vehicle_count", "avg_speed", "lane_occupancy",
                "network_latency", "day_of_week"]   # 5 — matches Colab
TARGET_IDX   = 0
LSTM_DIR     = "./models/lstm/output"
IF_DIR       = "./models/isolation_forest/output"

# ── Buffers ───────────────────────────────────────────────
sensor_buffers = {sid: deque(maxlen=SEQUENCE_LEN) for sid in SENSOR_IDS}
alert_log      = deque(maxlen=50)
traffic_log    = deque(maxlen=100)

# ── LSTM Architecture — matches Colab exactly ─────────────
class TrafficLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size,
                            num_layers=num_layers,
                            batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, 3)  # ← 3 outputs matches Colab

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :]).squeeze()

# ── Load LSTM ─────────────────────────────────────────────
lstm_scaler = joblib.load(f"{LSTM_DIR}/scaler.pkl")
lstm_model  = TrafficLSTM(input_size=len(FEATURES))
lstm_model.load_state_dict(torch.load(
    f"{LSTM_DIR}/lstm_best.pt",
    map_location=torch.device("cpu")
))
lstm_model.eval()
print("LSTM loaded.")

# ── Load Anomaly Detector ─────────────────────────────────
if_model    = joblib.load(f"{IF_DIR}/isolation_forest.pkl")
if_scaler   = joblib.load(f"{IF_DIR}/scaler.pkl")
if_features = joblib.load(f"{IF_DIR}/features.pkl")
print("Anomaly detector loaded.")

# ── LSTM Prediction ───────────────────────────────────────
def predict_congestion(sensor_id: str) -> dict:
    buf = sensor_buffers[sensor_id]
    if len(buf) < SEQUENCE_LEN:
        return None

    X = np.array([
        [row.get(f, 0) for f in FEATURES]
        for row in buf
    ], dtype=np.float32)

    X_scaled = lstm_scaler.transform(X)
    X_tensor = torch.tensor(X_scaled).unsqueeze(0)

    with torch.no_grad():
     pred_scaled = lstm_model(X_tensor)
     pred_scaled = pred_scaled[0, 0].item()

    dummy                = np.zeros((1, len(FEATURES)), dtype=np.float32)
    dummy[0, TARGET_IDX] = pred_scaled
    pred_actual          = float(lstm_scaler.inverse_transform(dummy)[0, TARGET_IDX])
    pred_actual          = max(0, round(pred_actual, 1))

    if pred_actual < 30:    level = "LOW"
    elif pred_actual < 70:  level = "MEDIUM"
    elif pred_actual < 100: level = "HIGH"
    else:                   level = "CRITICAL"

    return {
        "sensor_id":               sensor_id,
        "intersection":            SENSOR_MAP[sensor_id],
        "predicted_vehicle_count": pred_actual,
        "congestion_level":        level,
        "timestamp":               datetime.now().strftime("%H:%M:%S")
    }

# ── Anomaly Detection ─────────────────────────────────────
def detect_anomaly(msg: dict):
    try:
        X        = np.array([[msg.get(f, 0) for f in if_features]],
                            dtype=np.float32)
        X_scaled = if_scaler.transform(X)
        pred     = if_model.predict(X_scaled)[0]
        score    = if_model.predict_proba(X_scaled)[0][1]

        if pred == 1:
            return {
                "sensor_id":    msg["sensor_id"],
                "intersection": msg["intersection"],
                "attack_type":  msg.get("attack_type", "unknown"),
                "score":        round(float(score), 3),
                "vehicle_count":msg["vehicle_count"],
                "avg_speed":    msg["avg_speed"],
                "latency":      msg.get("network_latency", 0),
                "timestamp":    datetime.now().strftime("%H:%M:%S"),
                "severity":     "HIGH" if score > 0.8 else "MEDIUM"
            }
    except Exception as e:
        print(f"[ANOMALY ERROR] {e}")
    return None

# ── Kafka Consumer Thread ─────────────────────────────────
def kafka_listener():
    print("Connecting to Kafka...")
    try:
        consumer = KafkaConsumer(
            TRAFFIC_TOPIC,
            bootstrap_servers=KAFKA_BROKER,
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            auto_offset_reset="latest",
            group_id="dashboard_group"
        )
        print("Kafka connected.")
    except Exception as e:
        print(f"[KAFKA ERROR] {e}")
        return

    for message in consumer:
        msg = message.value
        sid = msg.get("sensor_id")

        # Add day_of_week if missing
        try:
            ts = datetime.fromisoformat(msg.get("timestamp", ""))
            msg["day_of_week"] = ts.weekday()
        except:
            msg["day_of_week"] = datetime.now().weekday()

        if sid in sensor_buffers:
            sensor_buffers[sid].append(msg)

        traffic_log.append({
            "timestamp":     msg.get("timestamp", ""),
            "sensor_id":     sid,
            "intersection":  msg.get("intersection", ""),
            "vehicle_count": msg.get("vehicle_count", 0),
            "avg_speed":     msg.get("avg_speed", 0),
        })

        alert = detect_anomaly(msg)
        if alert:
            alert_log.append(alert)
            socketio.emit("new_alert", alert)
            print(f"[ALERT] {alert['attack_type']} on {alert['intersection']}")

        prediction = predict_congestion(sid)
        if prediction:
            socketio.emit("new_prediction", prediction)

        socketio.emit("new_traffic", {
            "timestamp":     msg.get("timestamp", ""),
            "sensor_id":     sid,
            "intersection":  msg.get("intersection", ""),
            "vehicle_count": msg.get("vehicle_count", 0),
            "avg_speed":     msg.get("avg_speed", 0),
        })

# ── Routes ────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/traffic")
def api_traffic():
    return jsonify(list(traffic_log))

@app.route("/api/alerts")
def api_alerts():
    return jsonify(list(alert_log))

@app.route("/api/status")
def api_status():
    return jsonify({
        "kafka":   "connected",
        "lstm":    "loaded",
        "anomaly": "loaded",
        "sensors": {
            sid: len(sensor_buffers[sid])
            for sid in SENSOR_IDS
        }
    })

# ── Start ─────────────────────────────────────────────────
if __name__ == "__main__":
    t = threading.Thread(target=kafka_listener, daemon=True)
    t.start()
    print("=" * 55)
    print(" Kumaraswamy Layout — Traffic Dashboard")
    print(" http://localhost:5000")
    print("=" * 55)
    socketio.run(app, debug=False, port=5000)