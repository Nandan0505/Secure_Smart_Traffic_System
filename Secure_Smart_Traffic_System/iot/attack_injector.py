# iot/attack_injector.py
import json, time, random
from datetime import datetime
from kafka import KafkaProducer
import config

producer = KafkaProducer(
    bootstrap_servers=config.KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

replay_cache = []

def spoof_attack():
    sensor_id = random.choice(config.SENSOR_IDS)
    msg = {
        "sensor_id":      sensor_id,
        "intersection":   config.INTERSECTIONS[config.SENSOR_IDS.index(sensor_id)],
        "vehicle_count":  999,
        "avg_speed":      0,
        "lane_occupancy": 1.0,
        "timestamp":      datetime.now().isoformat(),
        "is_attack":      True,
        "attack_type":    "spoofing"
    }
    producer.send(config.TRAFFIC_TOPIC, msg)
    print(f"[ATTACK] Spoof injected on {msg['intersection']}")

def replay_attack():
    if not replay_cache:
        print("[ATTACK] Replay cache empty, skipping")
        return
    msg = random.choice(replay_cache)
    msg["is_attack"]   = True
    msg["attack_type"] = "replay"
    producer.send(config.TRAFFIC_TOPIC, msg)
    print(f"[ATTACK] Replay injected — original ts: {msg['timestamp']}")

def ddos_attack():
    print("[ATTACK] DDoS started — 50 msg/s for 5s")
    for _ in range(250):
        msg = {
            "sensor_id":      random.choice(config.SENSOR_IDS),
            "intersection":   random.choice(config.INTERSECTIONS),
            "vehicle_count":  random.randint(0, 999),
            "avg_speed":      0,
            "lane_occupancy": 1.0,
            "timestamp":      datetime.now().isoformat(),
            "is_attack":      True,
            "attack_type":    "ddos"
        }
        producer.send(config.TRAFFIC_TOPIC, msg)
        time.sleep(0.02)
    print("[ATTACK] DDoS done")

if __name__ == "__main__":
    print("Attack injector running...")
    while True:
        time.sleep(30)
        attack = random.choice([spoof_attack, replay_attack, ddos_attack])
        attack()