from collections import deque
from datetime import datetime, timezone
from threading import Lock
from uuid import uuid4

MAX_REWARD_LOG = 1000
reward_log = deque(maxlen=MAX_REWARD_LOG)
lock = Lock()


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def _safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def add_reward_entry(name, points, reason, issued_by):
    clean_name = str(name or "").strip()
    clean_reason = str(reason or "Admin assignment").strip()
    clean_issuer = str(issued_by or "admin").strip()
    numeric_points = _safe_float(points)

    if not clean_name:
        return None, "Name is required"
    if numeric_points is None or numeric_points <= 0:
        return None, "Points must be a positive number"

    entry = {
        "id": str(uuid4()),
        "name": clean_name,
        "points": round(numeric_points, 3),
        "reason": clean_reason[:160],
        "issued_by": clean_issuer,
        "timestamp": utc_now_iso(),
    }

    with lock:
        reward_log.append(entry)

    return entry, None


def get_reward_history(limit=50):
    try:
        parsed_limit = int(limit)
    except (TypeError, ValueError):
        parsed_limit = 50
    safe_limit = max(1, min(parsed_limit, MAX_REWARD_LOG))
    return list(reward_log)[-safe_limit:][::-1]


def get_leaderboard(limit=20):
    totals = {}
    for entry in reward_log:
        user = entry["name"]
        totals[user] = totals.get(user, 0) + float(entry["points"])

    ordered = sorted(totals.items(), key=lambda item: item[1], reverse=True)
    try:
        parsed_limit = int(limit)
    except (TypeError, ValueError):
        parsed_limit = 20
    safe_limit = max(1, min(parsed_limit, len(ordered) if ordered else 1))
    return [{"name": name, "points": round(points, 3)} for name, points in ordered[:safe_limit]]


def get_reward_summary():
    total_points = round(sum(float(entry["points"]) for entry in reward_log), 3)
    total_events = len(reward_log)
    active_users = len({entry["name"] for entry in reward_log})
    return {
        "total_points": total_points,
        "total_events": total_events,
        "active_users": active_users,
    }
