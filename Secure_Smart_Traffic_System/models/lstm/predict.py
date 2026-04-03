import numpy as np
import joblib
import torch
import torch.nn as nn
from datetime import datetime
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

SEQUENCE_LEN = 30
# 1. Update Features to match the 5 used in Colab
FEATURES     = ["vehicle_count", "avg_speed", "lane_occupancy", "hour", "minute"]
MODEL_DIR    = "./models/lstm/output"

# 2. Match the Training Architecture exactly
class TrafficLSTM(nn.Module):
    def __init__(self, input_size=5, hidden_size=64, num_layers=2, output_size=3):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, 
                            num_layers=num_layers, 
                            batch_first=True)
        # Simplified to match the "Unexpected key: fc.weight" error
        self.fc   = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        # Output shape: (batch, output_size)
        return self.fc(out[:, -1, :])

# ── Load model + scaler ──────────────────────────────
scaler = joblib.load(f"{MODEL_DIR}/scaler.pkl")

# Initialize with 5 inputs and 3 outputs
model  = TrafficLSTM(input_size=5, output_size=3)
model.load_state_dict(torch.load(
    f"{MODEL_DIR}/lstm_best.pt",
    map_location=torch.device("cpu")
))
model.eval()

def predict_next(sequence: list) -> dict:
    """
    sequence: list of last 30 dicts
    """
    if len(sequence) < SEQUENCE_LEN:
        return {"error": f"Need {SEQUENCE_LEN} readings, got {len(sequence)}"}

    # 3. Build feature matrix with Time context
    rows = []
    for row in sequence[-SEQUENCE_LEN:]:
        # Extract hour/minute from timestamp if provided, else use current
        dt = datetime.now()
        if "timestamp" in row:
            dt = datetime.strptime(row["timestamp"], "%Y-%m-%d %H:%M:%S")
        
        rows.append([
            row["vehicle_count"],
            row["avg_speed"],
            row["lane_occupancy"],
            dt.hour,
            dt.minute
        ])

    X = np.array(rows, dtype=np.float32)

    # Scale
    X_scaled = scaler.transform(X)
    X_tensor = torch.tensor(X_scaled).unsqueeze(0)  # (1, 30, 5)

    with torch.no_grad():
        # model outputs [count, speed, occupancy]
        preds_scaled = model(X_tensor).numpy() 

    # 4. Inverse scale logic
    # We create a dummy with 5 columns to match the scaler's expectation
    dummy = np.zeros((1, 5))
    dummy[0, :3] = preds_scaled[0] # Put the 3 predicted values in first 3 slots
    
    pred_actuals = scaler.inverse_transform(dummy)[0]
    
    count_pred = max(0, round(float(pred_actuals[0]), 1))
    speed_pred = max(0, round(float(pred_actuals[1]), 1))

    # Congestion level based on vehicle count
    if count_pred < 35:    level = "LOW"
    elif count_pred < 75:  level = "MEDIUM"
    elif count_pred < 110: level = "HIGH"
    else:                  level = "CRITICAL"

    return {
        "predicted_vehicle_count": count_pred,
        "predicted_avg_speed": speed_pred,
        "congestion_level": level,
        "status": "Secure AI Forecast"
    }

if __name__ == "__main__":
    # Test with dummy data mimicking the 5-feature requirement
    dummy_sequence = [
        {
            "vehicle_count": 80,
            "avg_speed": 20,
            "lane_occupancy": 0.6,
            "timestamp": "2025-06-10 14:00:00"
        }
        for _ in range(30)
    ]
    result = predict_next(dummy_sequence)
    print("Test prediction result:", result)