# Secure Smart Traffic System

A real-time smart traffic management system that combines IoT sensor simulation,
Big Data stream processing, AI-based traffic prediction, and cybersecurity
anomaly detection in a single unified pipeline.

## What it does
- Simulates IoT road sensors publishing live traffic data
- Detects spoofing and replay attacks on sensor data in real time
- Predicts traffic congestion 15 minutes ahead using an LSTM model
- Displays everything on a live web dashboard with alerts

## Tech Stack
Kafka · PySpark · LSTM · Isolation Forest · Flask · Chart.js

## Project Structure
```
backend/
├── app.py                  # Flask entry-point + Kafka listener
├── requirements.txt
├── routes/
│   ├── __init__.py
│   ├── traffic.py          # GET /api/traffic/live, /api/traffic/prediction
│   ├── alerts.py           # GET /api/alerts
│   └── simulate.py         # POST /api/simulate/attack
├── models/
│   ├── __init__.py
│   ├── inference.py         # load_models, predict_congestion, detect_attack
│   ├── lstm/
│   │   ├── model.py         # TrafficLSTM class
│   │   ├── predict.py       # standalone prediction helper
│   │   └── train.py         # LSTM training script
│   └── isolation_forest/
│       ├── train.py         # Isolation Forest training script
│       └── detect.py        # standalone detection helper
├── saved_models/
│   ├── lstm_weights.pt
│   ├── iso_forest.pkl
│   └── scaler.pkl
├── pipeline/
│   ├── __init__.py
│   └── spark_consumer.py   # PySpark Structured Streaming
├── iot/
│   ├── __init__.py
│   ├── simulator.py         # IoT sensor simulator
│   ├── attack_injector.py   # attack traffic generator
│   └── config.py            # Kafka, sensor, and traffic config
└── data/
    ├── generate_dataset.py
    ├── raw/
    └── sample/
```

## Setup
```bash
docker-compose up -d          # start Kafka + Zookeeper
cd backend
pip install -r requirements.txt
python app.py                 # launches Flask + Kafka listener
```

## Running individual components
```bash
# All commands run from the backend/ directory
python -m iot.simulator              # start IoT sensor simulator
python -m iot.attack_injector        # start attack injector
python -m models.lstm.train          # retrain LSTM
python -m models.isolation_forest.train  # retrain Isolation Forest
spark-submit pipeline/spark_consumer.py  # start Spark pipeline
```

## Team of 3
- Person 1 — IoT & Kafka
- Person 2 — AI Models
- Person 3 — Spark & Dashboard

## Dataset
METR-LA (traffic prediction) · N-BaIoT (anomaly detection)
