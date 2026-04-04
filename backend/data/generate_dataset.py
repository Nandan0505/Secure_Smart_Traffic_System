# data/generate_dataset.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

np.random.seed(42)

SENSORS = {
    "S001": "DSCE_Main_Gate",
    "S002": "50_Feet_Road_North",
    "S003": "50_Feet_Road_South",
    "S004": "Kumaraswamy_Layout_Bus_Stand",
}

HOURLY_BASE = {
    0:2,  1:1,  2:1,  3:1,  4:2,  5:5,
    6:15, 7:35, 8:80, 9:55, 10:30, 11:25,
    12:30, 13:28, 14:25, 15:30, 16:85, 17:60,
    18:40, 19:30, 20:25, 21:20, 22:15, 23:8,
}

# 90 days × 4 sensors × 50 attack minutes = 18,000 attacks
ATTACK_WINDOWS = [
    (9  * 60, 9  * 60 + 20, "replay"),              # 9:00–9:20 AM
    (14 * 60, 14 * 60 + 30, "spoofing_fake_clear"),  # 2:00–2:30 PM
]

def get_attack(mfm: int):
    for start, end, atype in ATTACK_WINDOWS:
        if start <= mfm < end:
            return True, atype
    return False, None

def generate_dataset(days=90) -> pd.DataFrame:
    records   = []
    base_date = datetime(2025, 6, 10, 0, 0, 0)
    print(f"Generating {days} days of data...")

    for day_offset in range(days):
        current_day = base_date + timedelta(days=day_offset)
        is_weekend  = current_day.weekday() >= 5

        for sensor_id, intersection in SENSORS.items():
            for minute_offset in range(24 * 60):
                dt   = current_day + timedelta(minutes=minute_offset)
                hour = dt.hour
                mfm  = hour * 60 + dt.minute

                is_attack, attack_type = get_attack(mfm)

                # ── Attack window ─────────────────────────
                if is_attack:
                    if attack_type == "spoofing_fake_clear":
                        # Noise added — not flat line
                        vehicle_count = int(np.random.uniform(0, 5))
                        avg_speed     = round(np.random.uniform(42, 45), 2)
                        latency       = round(np.random.uniform(1800, 2000), 1)

                    elif attack_type == "replay":
                        # Noise added — not flat line
                        vehicle_count = int(np.random.uniform(125, 130))
                        avg_speed     = round(np.random.uniform(5, 8), 2)
                        latency       = round(np.random.uniform(1600, 2000), 1)

                # ── Normal window ─────────────────────────
                else:
                    base_count  = HOURLY_BASE[hour]
                    if is_weekend:
                        base_count = int(base_count * 0.6)

                    noise_count = np.random.normal(1.0, 0.10)
                    noise_speed = np.random.normal(1.0, 0.10)

                    if sensor_id == "S001" and not is_weekend:
                        if hour == 8  and 25 <= dt.minute <= 45: base_count = 110
                        if hour == 16 and 25 <= dt.minute <= 45: base_count = 115

                    # Normal capped at 124 — clear gap from replay (125–130)
                    vehicle_count = int(np.clip(base_count * noise_count, 0, 124))
                    raw_speed     = 45 - (vehicle_count / 124) * 35
                    # Normal speed capped at 41 — clear gap from spoofing (42–45)
                    avg_speed     = round(np.clip(raw_speed * noise_speed, 5, 41), 2)
                    # Normal latency max 500 — clear gap from attacks (1600+)
                    latency       = round(np.random.uniform(10, 500), 1)

                lane_occupancy = round(min(vehicle_count / 130, 1.0), 3)

                records.append({
                    "timestamp":       dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "sensor_id":       sensor_id,
                    "intersection":    intersection,
                    "vehicle_count":   vehicle_count,
                    "avg_speed":       avg_speed,
                    "lane_occupancy":  lane_occupancy,
                    "network_latency": latency,
                    "day_of_week":     dt.weekday(),
                    "is_attack":       is_attack,
                    "attack_type":     attack_type,
                    "label":           1 if is_attack else 0
                })

    return pd.DataFrame(records)

if __name__ == "__main__":
    os.makedirs("./data/raw",    exist_ok=True)
    os.makedirs("./data/sample", exist_ok=True)

    df = generate_dataset(days=90)

    print(f"Total records  : {len(df):,}")
    print(f"Attack records : {df['is_attack'].sum():,} "
          f"({df['label'].mean()*100:.1f}%)")
    print(f"Attack breakdown:\n{df['attack_type'].value_counts()}")

    df.to_csv("./data/raw/kumaraswamy_traffic.csv", index=False)
    df.sample(n=1000, random_state=42).to_csv(
        "./data/sample/sample_1000.csv", index=False)

    print("Saved → data/raw/kumaraswamy_traffic.csv")