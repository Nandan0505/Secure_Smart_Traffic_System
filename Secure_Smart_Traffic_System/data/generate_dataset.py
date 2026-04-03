import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

np.random.seed(42)

# ── Sensors near DSCE ─────────────────────────────────────
SENSORS = {
    "S001": "DSCE_Main_Gate",
    "S002": "50_Feet_Road_North",
    "S003": "50_Feet_Road_South",
    "S004": "Kumaraswamy_Layout_Bus_Stand",
}

# ── Base vehicle count per hour (Normal Weekday) ──────────
HOURLY_BASE = {
    0:2,  1:1,  2:1,  3:1,  4:2,  5:5,
    6:15, 7:35, 8:80, 9:55, 10:30, 11:25,
    12:30, 13:28, 14:25, 15:30, 16:85, 17:60,
    18:40, 19:30, 20:25, 21:20, 22:15, 23:8,
}

# Attack window: 2:00 PM to 2:15 PM
ATTACK_START_MIN = 14 * 60
ATTACK_END_MIN = 14 * 60 + 15

def generate_dataset(days=90) -> pd.DataFrame:
    records = []
    # Start Date: June 10th, 2025
    base_date = datetime(2025, 6, 10, 0, 0, 0)

    print(f"Starting generation for {days} days...")

    for day_offset in range(days):
        current_day = base_date + timedelta(days=day_offset)
        is_weekend = current_day.weekday() >= 5 # Sat=5, Sun=6
        
        # Inject attack only on roughly 5% of days to keep it "anomalous"
        day_has_attack = np.random.rand() < 0.05 

        for sensor_id, intersection in SENSORS.items():
            for minute_offset in range(24 * 60):
                dt = current_day + timedelta(minutes=minute_offset)
                hour = dt.hour
                mfm = hour * 60 + dt.minute
                
                # 1. Base Traffic Logic
                base_count = HOURLY_BASE[hour]
                
                # Weekends in KS Layout are ~40% quieter
                if is_weekend:
                    base_count *= 0.6
                
                # 2. Cyberattack Logic
                is_attack = False
                attack_type = None
                
                if day_has_attack and (ATTACK_START_MIN <= mfm < ATTACK_END_MIN):
                    vehicle_count = 0 # Spoofing "Clear Road"
                    avg_speed = 40.0
                    latency = round(np.random.uniform(800, 2000), 1) # High Latency
                    is_attack = True
                    attack_type = "spoofing_fake_clear"
                else:
                    # Normal traffic with 10% variance
                    noise_count = np.random.normal(1.0, 0.10)
                    noise_speed = np.random.normal(1.0, 0.10)

                    # Peak spikes for DSCE Gate (S001)
                    if sensor_id == "S001" and not is_weekend:
                        if hour == 8 and 25 <= dt.minute <= 45: base_count = 110
                        if hour == 16 and 25 <= dt.minute <= 45: base_count = 115

                    vehicle_count = int(np.clip(base_count * noise_count, 0, 130))
                    
                    # Speed decreases as count increases
                    raw_speed = 45 - (vehicle_count / 130) * 35
                    avg_speed = round(np.clip(raw_speed * noise_speed, 5, 45), 2)
                    
                    # Normal latency (low)
                    latency = round(np.random.uniform(10, 500), 1)
                    
                lane_occupancy = round(min(vehicle_count / 130, 1.0), 3)

                records.append({
                    "timestamp": dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "sensor_id": sensor_id,
                    "intersection": intersection,
                    "vehicle_count": vehicle_count,
                    "avg_speed": avg_speed,
                    "lane_occupancy": lane_occupancy,
                    "network_latency": latency,
                    "day_of_week": dt.weekday(),
                    "is_attack": is_attack,
                    "label": 1 if is_attack else 0
                })

    return pd.DataFrame(records)

if __name__ == "__main__":
    os.makedirs("./data/raw", exist_ok=True)
    os.makedirs("./data/sample", exist_ok=True)

    df = generate_dataset(days=90)

    # Save 90-day master file
    df.to_csv("./data/raw/kumaraswamy_90day_traffic.csv", index=False)
    
    # Save a smaller sample for quick testing
    df.sample(n=1000).to_csv("./data/sample/sample_1000.csv", index=False)

    print(f"✅ Success! Generated {len(df):,} records.")
    print(f"Saved to: ./data/raw/kumaraswamy_90day_traffic.csv")