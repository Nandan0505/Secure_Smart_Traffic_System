# backend/app/core/startup.py

import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.models.inference import load_models
from app.pipeline.kafka_consumer import start_kafka_consumer


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 55)
    print("  Secure Smart Traffic API")
    print("  No database — pure in-memory live analytics")
    print("=" * 55)

    # Ensure data folder exists for trigger file
    os.makedirs("./data", exist_ok=True)

    # Load ML models from saved_models/
    load_models()

    # Start Kafka consumer background thread
    loop = asyncio.get_event_loop()
    start_kafka_consumer(loop)

    print("  API ready → http://localhost:8000")
    print("  Docs      → http://localhost:8000/docs")
    print("=" * 55)

    yield

    print("[Shutdown] Cleaning up...")