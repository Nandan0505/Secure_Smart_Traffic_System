import torch
import torch.nn as nn
import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler
from torch.utils.data import DataLoader, TensorDataset
import joblib

# 1. Load Data
df = pd.read_csv('/content/kumaraswamy_traffic.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['hour'] = df['timestamp'].dt.hour
df['minute'] = df['timestamp'].dt.minute
FEATURES = ['vehicle_count', 'avg_speed', 'lane_occupancy', 'hour', 'minute']

# 2. Scaling
scaler = RobustScaler()
scaled_data = scaler.fit_transform(df[FEATURES].values)
joblib.dump(scaler, 'lstm_scaler.pkl') 

# 3. Create Sequences
def create_sequences(data, seq_length=30):
    xs, ys = [], []
    for i in range(len(data) - seq_length):
        xs.append(data[i:(i + seq_length)])
        ys.append(data[i + seq_length][:3]) 
    return np.array(xs), np.array(ys)

X, y = create_sequences(scaled_data)
X_train = torch.from_numpy(X).float()
y_train = torch.from_numpy(y).float()

# 4. Data Loader (This prevents the memory crash)
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=1024, shuffle=True)

# 5. Model Architecture (Move to GPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class TrafficLSTM(nn.Module):
    def __init__(self, input_size=5, hidden_size=64, num_layers=2, output_size=3):
        super(TrafficLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

model = TrafficLSTM().to(device)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# 6. Fast Training
print(f"Training on {device}...")
for epoch in range(20):
    model.train()
    total_loss = 0
    for batch_X, batch_y in train_loader:
        batch_X, batch_y = batch_X.to(device), batch_y.to(device)
        outputs = model(batch_X)
        loss = criterion(outputs, batch_y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}/20 | Loss: {total_loss/len(train_loader):.6f}")

# 7. Save and Download
torch.save(model.state_dict(), 'traffic_lstm.pth')
print("✅ Training Complete. Model saved as traffic_lstm.pth")