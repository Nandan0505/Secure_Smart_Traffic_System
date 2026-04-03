# models/lstm/train_lstm.py
import pandas as pd
import numpy as np
import os, joblib
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error

torch.manual_seed(42)
np.random.seed(42)

# ── Config ────────────────────────────────────────────────
DATA_PATH    = "./data/raw/kumaraswamy_90day_traffic.csv"
MODEL_DIR    = "./models/lstm/output"
SEQUENCE_LEN = 30
FEATURES     = ["vehicle_count", "avg_speed", "lane_occupancy", "network_latency"]
TARGET_IDX   = 0        # vehicle_count is index 0 in FEATURES
TEST_SPLIT   = 0.2
EPOCHS       = 30
BATCH_SIZE   = 64
LR           = 0.001
DEVICE       = torch.device("cpu")

os.makedirs(MODEL_DIR, exist_ok=True)

# ── Load data ─────────────────────────────────────────────
print("Loading dataset...")
df = pd.read_csv(DATA_PATH, parse_dates=["timestamp"])
df = df[df["is_attack"] == False].sort_values("timestamp").reset_index(drop=True)
print(f"Normal records: {len(df):,}")

# ── Scale ─────────────────────────────────────────────────
scaler = MinMaxScaler()
df[FEATURES] = scaler.fit_transform(df[FEATURES])
joblib.dump(scaler, f"{MODEL_DIR}/scaler.pkl")
print("Scaler saved.")

# ── Build sequences ───────────────────────────────────────
def build_sequences(data: np.ndarray, seq_len: int):
    X, y = [], []
    for i in range(len(data) - seq_len):
        X.append(data[i : i + seq_len])
        y.append(data[i + seq_len, TARGET_IDX])
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

X_all, y_all = [], []
for sid in df["sensor_id"].unique():
    sdf = df[df["sensor_id"] == sid][FEATURES].values
    if len(sdf) < SEQUENCE_LEN + 1:
        continue
    X, y = build_sequences(sdf, SEQUENCE_LEN)
    X_all.append(X)
    y_all.append(y)

X_all = np.concatenate(X_all)
y_all = np.concatenate(y_all)
print(f"Sequences: X={X_all.shape}  y={y_all.shape}")

# ── Split ─────────────────────────────────────────────────
split   = int(len(X_all) * (1 - TEST_SPLIT))
X_train = torch.tensor(X_all[:split])
y_train = torch.tensor(y_all[:split])
X_test  = torch.tensor(X_all[split:])
y_test  = torch.tensor(y_all[split:])

train_loader = DataLoader(
    TensorDataset(X_train, y_train),
    batch_size=BATCH_SIZE, shuffle=True
)

# ── LSTM Model ────────────────────────────────────────────
class TrafficLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size,
                            num_layers=num_layers,
                            batch_first=True, dropout=0.2)
        self.fc   = nn.Sequential(
            nn.Linear(hidden_size, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :]).squeeze()

model     = TrafficLSTM(input_size=len(FEATURES)).to(DEVICE)
optimizer = torch.optim.Adam(model.parameters(), lr=LR)
criterion = nn.MSELoss()

# ── Train ─────────────────────────────────────────────────
print("\nTraining LSTM (PyTorch)...")
best_loss = float("inf")

for epoch in range(1, EPOCHS + 1):
    model.train()
    epoch_loss = 0
    for xb, yb in train_loader:
        xb, yb = xb.to(DEVICE), yb.to(DEVICE)
        optimizer.zero_grad()
        pred = model(xb)
        loss = criterion(pred, yb)
        loss.backward()
        optimizer.step()
        epoch_loss += loss.item()

    avg_loss = epoch_loss / len(train_loader)

    if avg_loss < best_loss:
        best_loss = avg_loss
        torch.save(model.state_dict(), f"{MODEL_DIR}/lstm_best.pt")

    if epoch % 5 == 0:
        print(f"Epoch {epoch:02d}/{EPOCHS} | Loss: {avg_loss:.6f}")

# ── Evaluate ──────────────────────────────────────────────
model.load_state_dict(torch.load(f"{MODEL_DIR}/lstm_best.pt"))
model.eval()
with torch.no_grad():
    y_pred = model(X_test.to(DEVICE)).cpu().numpy()

mae  = mean_absolute_error(y_test.numpy(), y_pred)
rmse = np.sqrt(mean_squared_error(y_test.numpy(), y_pred))
print(f"\n── Evaluation ───────────────────")
print(f"MAE  : {mae:.4f}")
print(f"RMSE : {rmse:.4f}")

# ── Save final ────────────────────────────────────────────
torch.save(model.state_dict(), f"{MODEL_DIR}/lstm_final.pt")
# Save model config for inference
joblib.dump({
    "input_size":   len(FEATURES),
    "hidden_size":  64,
    "num_layers":   2,
    "sequence_len": SEQUENCE_LEN,
    "features":     FEATURES,
    "target_idx":   TARGET_IDX
}, f"{MODEL_DIR}/model_config.pkl")

print(f"\nSaved → {MODEL_DIR}/lstm_final.pt")
print(f"Saved → {MODEL_DIR}/model_config.pkl")