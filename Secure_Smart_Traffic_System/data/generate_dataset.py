# data/generate_dataset.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

np.random.seed(42)

# ── Sensors near DSCE, Kumaraswamy Layout ─────────────────
SENSORS = {
    "S001": "DSCE_Main_Gate",
    "S002": "50_Feet_Road_North",
    "S003": "50_Feet_Road_South",
    "S004": "Kumaraswamy_Layout_Bus_Stand",
}

# ── Base vehicle count per hour (residential + college) ───
HOURLY_BASE = {
    0:2,  1:1,  2:1,  3:1,  4:2,  5:5,
    6:15, 7:35, 8:80, 9:55, 10:30,11:25,
    12:30,13:28,14:25,15:30,16:85,17:60,
    18:40,19:30,20:25,21:20,22:15,23:8,
}

CYBERATTACK_START = 14 * 60      # 2:00 PM in minutes from midnight
CYBERATTACK_END   = 14 * 60 + 15 # 2:15 PM

def is_attack_window(minutes_from_midnight: int) -> bool:
    return CYBERATTACK_START <= minutes_from_midnight < CYBERATTACK_END

def generate_dataset() -> pd.DataFrame:
    records = []
    base_time = datetime(2025, 6, 10, 0, 0, 0)  # A Tuesday

    for sensor_id, intersection in SENSORS.items():
        for minute_offset in range(24 * 60):       # 1440 minutes
            dt  = base_time + timedelta(minutes=minute_offset)
            hour = dt.hour
            mfm  = dt.hour * 60 + dt.minute        # minutes from midnight

            base_count = HOURLY_BASE[hour]

            # ── Cyberattack window ────────────────────────
            if is_attack_window(mfm):
                vehicle_count = 0
                avg_speed     = 40.0
                latency       = round(np.random.uniform(800, 2000), 1)
                is_attack     = True
                attack_type   = "spoofing_fake_clear"

            else:
                # ── Normal with 10% noise ─────────────────
                noise_count = np.random.normal(1.0, 0.10)
                noise_speed = np.random.normal(1.0, 0.10)

                # DSCE gate is busier at 8:30 and 16:30
                if sensor_id == "S001":
                    if hour == 8  and 25 <= dt.minute <= 45: base_count = 110
                    if hour == 16 and 25 <= dt.minute <= 45: base_count = 115

                vehicle_count = int(
                    np.clip(base_count * noise_count, 0, 120)
                )

                # Speed inversely correlated with count
                raw_speed = 40 - (vehicle_count / 120) * 35
                avg_speed = round(
                    np.clip(raw_speed * noise_speed, 5, 40), 2
                )

                # Occasional latency spike (~3% of readings)
                if np.random.rand() < 0.03:
                    latency = round(np.random.uniform(1000, 2000), 1)
                else:
                    latency = round(np.random.uniform(10, 500), 1)

                is_attack   = False
                attack_type = None

            lane_occupancy = round(min(vehicle_count / 120, 1.0), 3)

            records.append({
                "timestamp":       dt.strftime("%Y-%m-%d %H:%M:%S"),
                "sensor_id":       sensor_id,
                "intersection":    intersection,
                "vehicle_count":   vehicle_count,
                "avg_speed":       avg_speed,
                "lane_occupancy":  lane_occupancy,
                "network_latency": latency,
                "hour":            hour,
                "minute":          dt.minute,
                "day_of_week":     dt.weekday(),
                "is_attack":       is_attack,
                "attack_type":     attack_type,
                "label":           1 if is_attack else 0
            })

    return pd.DataFrame(records)

if __name__ == "__main__":
    os.makedirs("./data/raw",    exist_ok=True)
    os.makedirs("./data/sample", exist_ok=True)

    print("Generating 24-hour DSCE traffic dataset...")
    df = generate_dataset()

    print(f"Total records  : {len(df):,}")
    print(f"Attack records : {df['is_attack'].sum():,}  "
          f"({df['label'].mean()*100:.1f}%)")

    df.to_csv("./data/raw/kumaraswamy_traffic.csv", index=False)
    print("Saved → data/raw/kumaraswamy_traffic.csv")

    sample = df.sample(n=500, random_state=42)
    sample.to_csv("./data/sample/sample_500.csv", index=False)
    print("Saved → data/sample/sample_500.csv")

    print("\n── Dataset Summary ──────────────────────────────────")
    print(df[["vehicle_count","avg_speed",
              "lane_occupancy","network_latency"]].describe().round(2))

    print("\n── Attack window check (2:00–2:15 PM) ──────────────")
    attack_rows = df[df["is_attack"] == True]
    print(attack_rows[["timestamp","sensor_id",
                        "vehicle_count","avg_speed",
                        "network_latency"]].head(8).to_string(index=False))