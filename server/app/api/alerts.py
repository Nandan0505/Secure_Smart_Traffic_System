# backend/app/api/alerts.py

from fastapi import APIRouter, Query
from collections import Counter
from app.core.state import alert_log

router = APIRouter()


@router.get("/live")
def live_alerts(limit: int = Query(default=50, le=200)):
    """Latest alerts — for alert feed and ticker."""
    return list(alert_log)[-limit:]


@router.get("/breakdown")
def attack_breakdown():
    """Attack type counts — for donut chart."""
    types = [a.get("attack_type", "unknown") for a in alert_log]
    counts = Counter(types)
    return [
        {"attack_type": k, "count": v}
        for k, v in counts.items()
    ]


@router.get("/timeline")
def score_timeline(limit: int = Query(default=50, le=200)):
    """Anomaly scores over time — for line chart."""
    alerts = list(alert_log)[-limit:]
    return [
        {
            "timestamp":   a.get("timestamp", ""),
            "score":       a.get("score", 0),
            "attack_type": a.get("attack_type", ""),
            "severity":    a.get("severity", ""),
        }
        for a in alerts
    ]


@router.get("/stats")
def alert_stats():
    """Security center stat cards."""
    alerts = list(alert_log)
    types  = [a.get("attack_type", "unknown") for a in alerts]
    most_common = Counter(types).most_common(1)

    return {
        "total_alerts":       len(alerts),
        "high_severity":      sum(1 for a in alerts if a.get("severity") == "HIGH"),
        "most_common_attack": most_common[0][0] if most_common else "none",
    }