# backend/app/api/traffic.py

from fastapi import APIRouter, Query
from app.core.state import (
    traffic_log,
    latest_readings,
    latest_predictions,
    intersection_totals,
    sensor_buffers,
    alert_log,
)
from app.core.config import SENSOR_IDS, SEQUENCE_LEN

router = APIRouter()


@router.get("/live")
def live_traffic(limit: int = Query(default=100, le=500)):
    """Last N readings — for live traffic chart."""
    return list(traffic_log)[-limit:]


@router.get("/sensors")
def sensor_status():
    """Current reading + buffer status per sensor — for sensor grid."""
    return list(latest_readings.values())


@router.get("/predictions")
def predictions():
    """Latest LSTM prediction per sensor — for prediction panel."""
    return list(latest_predictions.values())


@router.get("/analytics")
def analytics():
    """
    Aggregated data for Analytics page.
    Returns intersection averages, traffic history,
    and prediction vs actual comparison.
    """
    # Intersection averages for bar chart
    intersection_avgs = []
    for sid, totals in intersection_totals.items():
        if totals["count"] > 0:
            intersection_avgs.append({
                "sensor_id":    sid,
                "intersection": list(latest_readings.get(sid, {}).get(
                    "intersection", sid
                )) if isinstance(latest_readings.get(sid, {}).get(
                    "intersection", sid
                ), list) else latest_readings.get(sid, {}).get(
                    "intersection", sid
                ),
                "avg_vehicles": round(totals["total_vehicles"] / totals["count"], 1),
                "avg_speed":    round(totals["total_speed"] / totals["count"], 1),
                "total_count":  totals["count"],
            })

    # Traffic history — last 200 readings for history chart
    history = list(traffic_log)[-200:]

    # Prediction vs actual — pair latest predictions with actuals
    pred_vs_actual = []
    for sid in SENSOR_IDS:
        pred = latest_predictions.get(sid)
        actual = latest_readings.get(sid, {})
        if pred and actual:
            pred_vs_actual.append({
                "sensor_id":    sid,
                "intersection": actual.get("intersection", sid),
                "predicted":    pred.get("predicted_vehicle_count", 0),
                "actual":       actual.get("vehicle_count", 0),
                "timestamp":    pred.get("timestamp", ""),
            })

    return {
        "intersection_averages": intersection_avgs,
        "history":               history,
        "prediction_vs_actual":  pred_vs_actual,
    }


@router.get("/stats")
def stats():
    """
    Summary stats for the top stat cards on Dashboard.
    """
    all_readings = list(latest_readings.values())
    active = [r for r in all_readings if r.get("vehicle_count", 0) > 0]

    total_vehicles = sum(r.get("vehicle_count", 0) for r in active)
    avg_speed = (
        round(sum(r.get("avg_speed", 0) for r in active) / len(active), 1)
        if active else 0
    )
    recent_alerts = [
        a for a in list(alert_log)[-20:]
    ]
    threat_level = "CRITICAL" if len(recent_alerts) >= 5 else \
                   "HIGH"     if len(recent_alerts) >= 3 else \
                   "MEDIUM"   if len(recent_alerts) >= 1 else "SAFE"

    return {
        "total_vehicles":  total_vehicles,
        "avg_speed":       avg_speed,
        "active_sensors":  len(active),
        "total_sensors":   len(SENSOR_IDS),
        "threat_level":    threat_level,
        "total_alerts":    len(alert_log),
    }