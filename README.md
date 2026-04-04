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
- `iot/` — sensor simulator and attack injector
- `models/` — LSTM traffic prediction and Isolation Forest anomaly detection
- `pipeline/` — Spark stream processor, Flask API, and dashboard
- `data/` — sample datasets for testing

## Setup
```bash
docker-compose up -d        # start Kafka
pip install -r requirements.txt
bash start.sh               # launches everything
```

## Team of 3
- Person 1 — IoT & Kafka
- Person 2 — AI Models
- Person 3 — Spark & Dashboard

## Dataset
METR-LA (traffic prediction) · N-BaIoT (anomaly detection)
