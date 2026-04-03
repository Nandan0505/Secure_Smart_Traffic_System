# iot/simulator.py
import json, time, random
from datetime import datetime
from kafka import KafkaProducer
import config

producer = KafkaProducer(
    bootstrap_servers=config.KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

def is_rush_hour():
    hour = datetime.now().hour
    return any(s <= hour < e for s, e in config.RUSH_HOURS)

def generate_reading(sensor_id, intersection):
    rush = is_rush_hour()
    vehicle_count = random.randint(80, 150) if rush else random.randint(5, 60)
    avg_speed     = random.uniform(5, 25)   if rush else random.uniform(30, 80)
    return {
        "sensor_id":       sensor_id,
        "intersection":    intersection,
        "vehicle_count":   vehicle_count,
        "avg_speed":       round(avg_speed, 2),
        "lane_occupancy":  round(random.uniform(0.6, 1.0) if rush else random.uniform(0.1, 0.5), 2),
        "timestamp":       datetime.now().isoformat(),
        "is_attack":       False
    }

if __name__ == "__main__":
    print("Simulator running...")
    while True:
        for sid, intersection in zip(config.SENSOR_IDS, config.INTERSECTIONS):
            msg = generate_reading(sid, intersection)
            producer.send(config.TRAFFIC_TOPIC, msg)
            print(f"[SIM] {msg['intersection']} | vehicles={msg['vehicle_count']} speed={msg['avg_speed']}")
        time.sleep(config.SEND_INTERVAL)