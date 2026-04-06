# backend/iot/simulator.py
# Run this in its own terminal: python iot/simulator.py
# Publishes one JSON reading per sensor per second to Kafka

import json
import time
import random
from datetime import datetime
from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable

from iot.config import (
    KAFKA_BROKER, TRAFFIC_TOPIC,
    SENSOR_IDS, INTERSECTIONS,
    RUSH_HOURS, TRAFFIC_PROFILE,
    SEND_INTERVAL
)


def get_producer():
    """Retry Kafka connection — useful if Kafka is still starting up."""
    while True:
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BROKER,
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )
            print(f"[SIM] Connected to Kafka at {KAFKA_BROKER}")
            return producer
        except NoBrokersAvailable:
            print("[SIM] Kafka not ready — retrying in 3s...")
            time.sleep(3)


def get_time_period() -> str:
    """Return current traffic period based on Bangalore rush hour pattern."""
    hour = datetime.now().hour
    if 23 <= hour or hour < 6:
        return "night"
    elif 6 <= hour < 8:
        return "morning"
    elif 8 <= hour < 11:
        return "rush_am"
    elif 11 <= hour < 17:
        return "midday"
    elif 17 <= hour < 20:
        return "rush_pm"
    else:
        return "evening"


def generate_reading(sensor_id: str, intersection: str) -> dict:
    """
    Generate one realistic sensor reading.
    Uses time-based traffic profile for Kumaraswamy Layout.
    """
    period  = get_time_period()
    profile = TRAFFIC_PROFILE[period]

    v_min, v_max = profile["vehicle_range"]
    s_min, s_max = profile["speed_range"]

    # Add small per-sensor variation so each intersection looks different
    sensor_idx    = SENSOR_IDS.index(sensor_id)
    v_offset      = sensor_idx * 5
    vehicle_count = random.randint(
        max(0, v_min - v_offset),
        v_max + v_offset
    )
    avg_speed = round(random.uniform(s_min, s_max), 2)

    # Lane occupancy correlates with vehicle count
    max_vehicles    = v_max + v_offset
    lane_occupancy  = round(min(1.0, vehicle_count / max_vehicles), 2)

    # Network latency — normal range for a healthy sensor
    network_latency = round(random.uniform(1.0, 50.0), 2)

    now = datetime.now()

    return {
        "sensor_id":       sensor_id,
        "intersection":    intersection,
        "vehicle_count":   vehicle_count,
        "avg_speed":       avg_speed,
        "lane_occupancy":  lane_occupancy,
        "network_latency": network_latency,
        "timestamp":       now.strftime("%Y-%m-%d %H:%M:%S"),
        "is_attack":       False,
        "attack_type":     None,
    }


def main():
    print("=" * 55)
    print(" IoT Sensor Simulator — Kumaraswamy Layout")
    print(f" Publishing to topic: {TRAFFIC_TOPIC}")
    print(f" Sensors: {SENSOR_IDS}")
    print("=" * 55)

    producer = get_producer()
    reading_count = 0

    while True:
        try:
            for sid, intersection in zip(SENSOR_IDS, INTERSECTIONS):
                msg = generate_reading(sid, intersection)
                producer.send(TRAFFIC_TOPIC, msg)
                reading_count += 1

                print(
                    f"[SIM] {sid} | {intersection[:25]:<25} | "
                    f"vehicles={msg['vehicle_count']:>3} | "
                    f"speed={msg['avg_speed']:>5.1f} | "
                    f"period={get_time_period()}"
                )

            producer.flush()
            time.sleep(SEND_INTERVAL)

        except KeyboardInterrupt:
            print("\n[SIM] Stopped by user.")
            break
        except Exception as e:
            print(f"[SIM ERROR] {e}")
            time.sleep(2)


if __name__ == "__main__":
    main()