# backend/app/pipeline/kafka_consumer.py

import json
import asyncio
import threading
from datetime import datetime
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
import time

from app.core.config import settings, SENSOR_MAP
from app.core.state import (
    sensor_buffers,
    traffic_log,
    alert_log,
    latest_predictions,
    latest_readings,
    connected_clients,
    intersection_totals,
)
from app.models.inference import predict_congestion, detect_anomaly


# ── WebSocket broadcast ────────────────────────────────────

async def _broadcast(message: dict):
    """Push message to every connected React WebSocket client."""
    dead = set()
    for ws in connected_clients.copy():
        try:
            await ws.send_json(message)
        except Exception:
            dead.add(ws)
    connected_clients.difference_update(dead)


# ── Process one Kafka message ──────────────────────────────

def _process(msg: dict, loop: asyncio.AbstractEventLoop):
    sid = msg.get("sensor_id")
    if not sid:
        return

    # ── Extract time context ───────────────────────────────
    dt = datetime.now()
    ts = msg.get("timestamp", "")
    if ts:
        try:
            dt = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                dt = datetime.fromisoformat(ts)
            except ValueError:
                pass

    msg["hour"]       = dt.hour
    msg["minute"]     = dt.minute
    msg["day_of_week"] = dt.weekday()

    # ── Update sensor buffer for LSTM ─────────────────────
    if sid in sensor_buffers:
        sensor_buffers[sid].append(msg)

    # ── Update latest reading per sensor ──────────────────
    latest_readings[sid] = {
        "sensor_id":       sid,
        "intersection":    msg.get("intersection", SENSOR_MAP.get(sid, sid)),
        "vehicle_count":   msg.get("vehicle_count", 0),
        "avg_speed":       msg.get("avg_speed", 0.0),
        "lane_occupancy":  msg.get("lane_occupancy", 0.0),
        "network_latency": msg.get("network_latency", 0.0),
        "is_attack":       msg.get("is_attack", False),
        "timestamp":       ts,
        "buffer_count":    len(sensor_buffers[sid]),
        "buffer_ready":    len(sensor_buffers[sid]) >= 30,
    }

    # ── Update intersection totals for analytics ───────────
    if sid in intersection_totals:
        t = intersection_totals[sid]
        t["total_vehicles"] += msg.get("vehicle_count", 0)
        t["total_speed"]    += msg.get("avg_speed", 0.0)
        t["count"]          += 1

    # ── Build traffic entry for log ────────────────────────
    traffic_entry = {
        "sensor_id":       sid,
        "intersection":    msg.get("intersection", SENSOR_MAP.get(sid, sid)),
        "vehicle_count":   msg.get("vehicle_count", 0),
        "avg_speed":       msg.get("avg_speed", 0.0),
        "lane_occupancy":  msg.get("lane_occupancy", 0.0),
        "network_latency": msg.get("network_latency", 0.0),
        "is_attack":       msg.get("is_attack", False),
        "timestamp":       ts,
    }
    traffic_log.append(traffic_entry)

    # Broadcast live traffic to React
    asyncio.run_coroutine_threadsafe(
        _broadcast({"type": "new_traffic", "data": traffic_entry}),
        loop
    )

    # ── Anomaly detection ──────────────────────────────────
    alert = detect_anomaly(msg)
    if alert:
        alert_log.append(alert)
        asyncio.run_coroutine_threadsafe(
            _broadcast({"type": "new_alert", "data": alert}),
            loop
        )
        print(
            f"[ALERT] {(alert.get('attack_type') or 'unknown').upper()} @ "
            f"{alert.get('intersection', 'unknown')} | score={alert.get('score', 0)}"
        )

    # ── LSTM prediction ────────────────────────────────────
    prediction = predict_congestion(sid)
    if prediction:
        latest_predictions[sid] = prediction
        asyncio.run_coroutine_threadsafe(
            _broadcast({"type": "new_prediction", "data": prediction}),
            loop
        )


# ── Kafka consumer thread ──────────────────────────────────

def start_kafka_consumer(loop: asyncio.AbstractEventLoop):

    def _run():
        print("[Kafka] Connecting...")

        # Retry loop — Kafka might not be ready immediately
        consumer = None
        for attempt in range(10):
            try:
                consumer = KafkaConsumer(
                    settings.TRAFFIC_TOPIC,
                    bootstrap_servers=settings.KAFKA_BROKER,
                    value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                    auto_offset_reset="latest",
                    group_id="fastapi_traffic_dashboard",
                    consumer_timeout_ms=1000,
                )
                print("[Kafka] Connected. Listening for messages...")
                break
            except NoBrokersAvailable:
                print(f"[Kafka] Attempt {attempt + 1}/10 — not ready, retrying in 3s")
                time.sleep(3)

        if consumer is None:
            print("[Kafka ERROR] Could not connect after 10 attempts.")
            return

        while True:
            try:
                for message in consumer:
                    _process(message.value, loop)
            except Exception as e:
                print(f"[Kafka LOOP ERROR] {e}")
                time.sleep(2)

    t = threading.Thread(target=_run, daemon=True, name="KafkaConsumer")
    t.start()
    print("[Kafka] Background thread started.")