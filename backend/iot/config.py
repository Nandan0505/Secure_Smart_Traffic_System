# iot/config.py

KAFKA_BROKER = "localhost:9092"
TRAFFIC_TOPIC = "traffic_data"
ALERTS_TOPIC = "security_alerts"

# Kumaraswamy Layout, Bangalore — real intersections
SENSOR_IDS = ["S001", "S002", "S003", "S004", "S005"]

INTERSECTIONS = [
    "Kumaraswamy_Layout_Bus_Stand",
    "Kumaraswamy_Layout_15th_Cross",
    "Banashankari_6th_Stage_Junction",
    "MRCR_Circle",
    "Dollars_Colony_Junction"
]

# Maps sensor to intersection (1:1)
SENSOR_MAP = {
    "S001": "Kumaraswamy_Layout_Bus_Stand",
    "S002": "Kumaraswamy_Layout_15th_Cross",
    "S003": "Banashankari_6th_Stage_Junction",
    "S004": "MRCR_Circle",
    "S005": "Dollars_Colony_Junction"
}

# Bangalore local rush hours
RUSH_HOURS = [(8, 11), (17, 20)]   # morning school+office, evening return

# Kumaraswamy Layout is a residential area —
# mid-day is moderate, nights are very quiet
TRAFFIC_PROFILE = {
    "night":     {"vehicle_range": (2, 15),   "speed_range": (40, 70)},  # 11pm–6am
    "morning":   {"vehicle_range": (20, 60),  "speed_range": (20, 45)},  # 6am–8am
    "rush_am":   {"vehicle_range": (70, 130), "speed_range": (5, 20)},   # 8am–11am
    "midday":    {"vehicle_range": (15, 50),  "speed_range": (25, 55)},  # 11am–5pm
    "rush_pm":   {"vehicle_range": (80, 140), "speed_range": (5, 18)},   # 5pm–8pm
    "evening":   {"vehicle_range": (20, 55),  "speed_range": (20, 45)},  # 8pm–11pm
}

# Pipeline settings
SEND_INTERVAL    = 1     # seconds between sensor publishes
WINDOW_SIZE      = 30    # minutes of LSTM history
ANOMALY_THRESHOLD = 0.6  # Isolation Forest flag threshold