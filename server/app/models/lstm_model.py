# backend/app/models/lstm_model.py

import torch.nn as nn


class TrafficLSTM(nn.Module):
    def __init__(
        self,
        input_size:  int = 5,   # vehicle_count, avg_speed, lane_occupancy, hour, minute
        hidden_size: int = 64,
        num_layers:  int = 2,
        output_size: int = 3,   # vehicle_count, avg_speed, lane_occupancy (predictions)
    ):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size,
            hidden_size,
            num_layers,
            batch_first=True
            # NO dropout — training didn't use it, adding it breaks weight loading
        )
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])   # shape: (batch, 3)