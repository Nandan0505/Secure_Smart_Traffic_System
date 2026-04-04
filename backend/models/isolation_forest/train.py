import pandas as pd
import numpy as np
import os, joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import RobustScaler # Better than StandardScaler for outliers
from sklearn.metrics import classification_report, confusion_matrix

np.random.seed(42)

# Using the 90-day dataset for better baseline learning
DATA_PATH     = "./data/raw/kumaraswamy_traffic.csv" 
MODEL_DIR     = "./models/isolation_forest/output"

# 1. TUNED PARAMETERS
# Increased to 0.08 to capture "borderline" attacks and improve recall
CONTAMINATION = 0.08 
# Added Hour/Minute so the model knows 2:00 PM vs 2:00 AM
FEATURES      = ["vehicle_count", "avg_speed", "network_latency", "day_of_week"] 

os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

# 2. FEATURE ENGINEERING: Extracting time context
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['hour'] = df['timestamp'].dt.hour
df['minute'] = df['timestamp'].dt.minute
# New Feature List including Time
FINAL_FEATURES = FEATURES + ["hour", "minute"]

print(f"Total records  : {len(df):,}")
print(f"Attack records : {df['is_attack'].sum():,}")

# 3. ROBUST SCALING
# RobustScaler uses the median/IQR, which prevents attacks from 'hiding' in the mean
scaler = RobustScaler()
df[FINAL_FEATURES] = scaler.fit_transform(df[FINAL_FEATURES])
joblib.dump(scaler, f"{MODEL_DIR}/scaler.pkl")

# 4. TRAINING (The Full-Data Approach)
# We train on the whole set so the model learns the "gap" between normal and attack
X_train = df[FINAL_FEATURES].values

model = IsolationForest(
    n_estimators=300,        # More trees = more stable detection
    contamination=CONTAMINATION,
    max_samples='auto',
    bootstrap=True,          # Better for imbalanced data
    random_state=42,
    n_jobs=-1
)

print(f"Training Isolation Forest on {len(X_train):,} records...")
model.fit(X_train)

# 5. PREDICTION & EVALUATION
y_true = df["label"].values
y_pred_raw = model.predict(X_train)
# Convert -1 (anomaly) to 1 (attack), and 1 (normal) to 0
y_pred = np.where(y_pred_raw == -1, 1, 0)

print("\n── Evaluation (Optimized for Recall) ──────────────")
print(classification_report(y_true, y_pred, target_names=["Normal", "Attack"]))

cm = confusion_matrix(y_true, y_pred)
print(f"Confusion Matrix:\n{cm}")
print(f"True Positives  (Attacks Caught) : {cm[1][1]}")
print(f"False Positives (False Alarms)   : {cm[0][1]}")
print(f"False Negatives (Missed Attacks)  : {cm[1][0]}")

# 6. SAVE MODELS
joblib.dump(model, f"{MODEL_DIR}/isolation_forest.pkl")
joblib.dump(FINAL_FEATURES, f"{MODEL_DIR}/features.pkl")
print(f"\nModel saved → {MODEL_DIR}/isolation_forest.pkl")

# Save the results for verification
df["anomaly_score"] = model.decision_function(X_train)
df["predicted_label"] = y_pred
df.to_csv("./data/raw/kumaraswamy_optimized_scored.csv", index=False)