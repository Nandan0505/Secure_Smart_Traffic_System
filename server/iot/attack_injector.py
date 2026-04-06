# backend/iot/attack_injector.py
# Run this in its own terminal: python iot/attack_injector.py
# Two modes:
#   1. Automatic — fires a random attack every 30 seconds
#   2. Manual    — React demo button writes trigger_attack.txt,
#                  this script fires immediately

import json
import time
import random
import os
import threading
from datetime import datetime
from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable

from iot.config import (
    KAFKA_BROKER, TRAFFIC_TOPIC,
    SENSOR_IDS, INTERSECTIONS,
)

TRIGGER_FILE = "./data/trigger_attack.txt"


def get_producer():
    while True:
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BROKER,
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )
            print(f"[ATTACK] Connected to Kafka at {KAFKA_BROKER}")
            return producer
        except NoBrokersAvailable:
            print("[ATTACK] Kafka not ready — retrying in 3s...")
            time.sleep(3)


# ── Replay cache — collects real readings for replay attack ─
replay_cache = []


def _populate_replay_cache():
    """
    Runs in background — listens to Kafka and stores
    real (non-attack) readings for use in replay attacks.
    """
    from kafka import KafkaConsumer
    try:
        consumer = KafkaConsumer(
            TRAFFIC_TOPIC,
            bootstrap_servers=KAFKA_BROKER,
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            auto_offset_reset="latest",
            group_id="replay_cache_collector",
            consumer_timeout_ms=float("inf"),
        )
        for msg in consumer:
            data = msg.value
            if not data.get("is_attack"):
                replay_cache.append(data)
                if len(replay_cache) > 100:
                    replay_cache.pop(0)
    except Exception as e:
        print(f"[REPLAY CACHE] Error: {e}")


# ── Attack functions ───────────────────────────────────────

def spoof_attack(producer: KafkaProducer):
    """
    Sensor spoofing — inject a reading with extreme impossible values.
    vehicle_count=999, avg_speed=0 will be flagged immediately
    by Isolation Forest as a statistical outlier.
    """
    sensor_idx  = random.randint(0, len(SENSOR_IDS) - 1)
    sensor_id   = SENSOR_IDS[sensor_idx]
    intersection = INTERSECTIONS[sensor_idx]

    msg = {
        "sensor_id":       sensor_id,
        "intersection":    intersection,
        "vehicle_count":   999,
        "avg_speed":       0.0,
        "lane_occupancy":  1.0,
        "network_latency": round(random.uniform(500, 999), 2),
        "timestamp":       datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "is_attack":       True,
        "attack_type":     "spoofing",
    }
    producer.send(TRAFFIC_TOPIC, msg)
    producer.flush()
    print(f"[ATTACK] SPOOF injected on {intersection}")
    print(f"         vehicle_count=999, avg_speed=0, latency={msg['network_latency']}")


def replay_attack(producer: KafkaProducer):
    """
    Replay attack — resend a stale legitimate reading with old timestamp.
    The timestamp mismatch + time-context features (hour/minute)
    will look suspicious to the Isolation Forest at peak hours.
    """
    if replay_cache:
        # Use a real captured reading
        msg = dict(random.choice(replay_cache))
        msg["is_attack"]       = True
        msg["attack_type"]     = "replay"
        msg["network_latency"] = round(random.uniform(300, 800), 2)
        # Keep old timestamp — that's the point of a replay attack
        print(f"[ATTACK] REPLAY injected — stale ts: {msg['timestamp']}")
    else:
        # Fallback — craft a stale reading manually
        sensor_idx  = random.randint(0, len(SENSOR_IDS) - 1)
        sensor_id   = SENSOR_IDS[sensor_idx]
        msg = {
            "sensor_id":       sensor_id,
            "intersection":    INTERSECTIONS[sensor_idx],
            "vehicle_count":   random.randint(10, 40),
            "avg_speed":       round(random.uniform(40, 70), 2),
            "lane_occupancy":  round(random.uniform(0.1, 0.3), 2),
            "network_latency": round(random.uniform(300, 800), 2),
            "timestamp":       "2024-01-01 03:00:00",  # clearly stale
            "is_attack":       True,
            "attack_type":     "replay",
        }
        print(f"[ATTACK] REPLAY (fallback) injected on {msg['intersection']}")

    producer.send(TRAFFIC_TOPIC, msg)
    producer.flush()


def ddos_attack(producer: KafkaProducer):
    """
    DDoS simulation — flood 250 messages in 5 seconds (50/sec).
    Overwhelms the pipeline with junk readings from random sensors.
    """
    print("[ATTACK] DDoS started — 250 messages over 5 seconds")
    for i in range(250):
        sensor_idx = random.randint(0, len(SENSOR_IDS) - 1)
        msg = {
            "sensor_id":       SENSOR_IDS[sensor_idx],
            "intersection":    INTERSECTIONS[sensor_idx],
            "vehicle_count":   random.randint(0, 999),
            "avg_speed":       0.0,
            "lane_occupancy":  1.0,
            "network_latency": round(random.uniform(500, 999), 2),
            "timestamp":       datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "is_attack":       True,
            "attack_type":     "ddos",
        }
        producer.send(TRAFFIC_TOPIC, msg)
        time.sleep(0.02)   # 50 messages per second
    producer.flush()
    print("[ATTACK] DDoS complete — 250 messages sent")


ATTACK_MAP = {
    "spoofing": spoof_attack,
    "replay":   replay_attack,
    "ddos":     ddos_attack,
}


# ── Trigger file watcher ───────────────────────────────────

def _watch_trigger_file(producer: KafkaProducer):
    """
    Watches ./data/trigger_attack.txt every 500ms.
    When React demo button POSTs to /api/simulate/attack,
    FastAPI writes this file, and we fire the attack here.
    """
    os.makedirs("./data", exist_ok=True)
    print("[ATTACK] Watching for manual trigger from React demo button...")

    while True:
        if os.path.exists(TRIGGER_FILE):
            try:
                with open(TRIGGER_FILE, "r") as f:
                    attack_type = f.read().strip().lower()
                os.remove(TRIGGER_FILE)

                fn = ATTACK_MAP.get(attack_type)
                if fn:
                    print(f"[ATTACK] Manual trigger received: {attack_type}")
                    fn(producer)
                else:
                    print(f"[ATTACK] Unknown attack type: {attack_type}")
            except Exception as e:
                print(f"[ATTACK] Trigger file error: {e}")

        time.sleep(0.5)


# ── Main ───────────────────────────────────────────────────

def main():
    print("=" * 55)
    print(" Attack Injector — Kumaraswamy Layout")
    print(" Auto attack: every 30 seconds")
    print(" Manual trigger: POST /api/simulate/attack")
    print("=" * 55)

    producer = get_producer()

    # Background thread — populate replay cache from live Kafka stream
    t1 = threading.Thread(
        target=_populate_replay_cache,
        daemon=True,
        name="ReplayCacheCollector"
    )
    t1.start()

    # Background thread — watch for manual trigger from React
    t2 = threading.Thread(
        target=_watch_trigger_file,
        args=(producer,),
        daemon=True,
        name="TriggerFileWatcher"
    )
    t2.start()

    # Main loop — random automatic attack every 30 seconds
    print("[ATTACK] Running — automatic attack every 30s")
    while True:
        try:
            time.sleep(30)
            attack_fn = random.choice(list(ATTACK_MAP.values()))
            attack_fn(producer)
        except KeyboardInterrupt:
            print("\n[ATTACK] Stopped by user.")
            break
        except Exception as e:
            print(f"[ATTACK ERROR] {e}")
            time.sleep(5)


if __name__ == "__main__":
    main()