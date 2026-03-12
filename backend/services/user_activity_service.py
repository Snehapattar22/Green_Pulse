from collections import deque
from datetime import datetime, timezone
from threading import Lock

MAX_USER_EVENTS = 500

user_store = {}
store_lock = Lock()


def _safe_name(user_name):
    value = str(user_name or "").strip()
    return value if value else "Anonymous User"


def _safe_location(location):
    value = str(location or "").strip()
    return value if value else "Unknown Location"


def _safe_measure(measure):
    value = str(measure or "").strip()
    return value if value else "No measure provided"


def _safe_email(email):
    value = str(email or "").strip()
    return value if value else None


def _utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def _parse_optional_float(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _new_user(name, timestamp, location, measure, email=None):
    return {
        "name": name,
        "email": email,
        "started_at": timestamp,
        "events": deque(maxlen=MAX_USER_EVENTS),
        "sum_co2": 0.0,
        "predictions_count": 0,
        "activity_count": 0,
        "login_count": 0,
        "best_reduction": 0.0,
        "last_seen": timestamp,
        "last_location": location,
        "last_measure_taken": measure,
        "last_co2": None,
    }


def record_user_activity(user_name, location, measure_taken, reading):
    name = _safe_name(user_name)
    timestamp = reading.get("timestamp") or _utc_now_iso()
    activity = {
        "timestamp": timestamp,
        "location": _safe_location(location),
        "measure_taken": _safe_measure(measure_taken),
        "co2": reading.get("co2"),
        "temperature": reading.get("temperature"),
        "humidity": reading.get("humidity"),
        "ir_radiation": reading.get("ir_radiation"),
    }

    with store_lock:
        if name not in user_store:
            user_store[name] = _new_user(
                name=name,
                timestamp=timestamp,
                location=activity["location"],
                measure=activity["measure_taken"],
            )

        user = user_store[name]
        current_co2 = _parse_optional_float(reading.get("co2"))
        previous_co2 = user["last_co2"]
        reduction = round(
            max(0.0, (previous_co2 - current_co2) if previous_co2 is not None and current_co2 is not None else 0.0),
            2,
        )
        activity["reduction_vs_previous"] = reduction

        user["events"].append(activity)
        user["activity_count"] += 1
        user["last_seen"] = timestamp
        user["last_location"] = activity["location"]
        user["last_measure_taken"] = activity["measure_taken"]

        if current_co2 is not None:
            user["sum_co2"] += current_co2
            user["predictions_count"] += 1
            user["last_co2"] = current_co2
            user["best_reduction"] = max(user["best_reduction"], reduction)


def record_user_login(user_name, email=None, auth_provider="firebase"):
    name = _safe_name(user_name)
    safe_email = _safe_email(email)
    timestamp = _utc_now_iso()
    activity = {
        "timestamp": timestamp,
        "location": "App Login",
        "measure_taken": f"Logged in via {str(auth_provider or 'firebase').strip()}",
        "co2": None,
        "temperature": None,
        "humidity": None,
        "ir_radiation": None,
        "reduction_vs_previous": 0.0,
    }

    with store_lock:
        if name not in user_store:
            user_store[name] = _new_user(
                name=name,
                timestamp=timestamp,
                location=activity["location"],
                measure=activity["measure_taken"],
                email=safe_email,
            )

        user = user_store[name]
        if safe_email:
            user["email"] = safe_email

        user["events"].append(activity)
        user["activity_count"] += 1
        user["login_count"] += 1
        user["last_seen"] = timestamp
        user["last_location"] = activity["location"]
        user["last_measure_taken"] = activity["measure_taken"]


def list_user_profiles(limit=100):
    try:
        parsed_limit = int(limit)
    except (TypeError, ValueError):
        parsed_limit = 100
    safe_limit = max(1, min(parsed_limit, 500))

    with store_lock:
        profiles = []
        for user in user_store.values():
            avg_co2 = (user["sum_co2"] / user["predictions_count"]) if user["predictions_count"] else 0
            profiles.append(
                {
                    "name": user["name"],
                    "email": user.get("email"),
                    "started_at": user["started_at"],
                    "last_seen": user["last_seen"],
                    "last_location": user["last_location"],
                    "last_measure_taken": user["last_measure_taken"],
                    "predictions_count": user["predictions_count"],
                    "activity_count": user["activity_count"],
                    "login_count": user["login_count"],
                    "avg_co2": round(avg_co2, 2),
                    "best_reduction": round(user["best_reduction"], 2),
                    "latest_co2": round(user["last_co2"], 2) if user["last_co2"] is not None else None,
                }
            )

    profiles.sort(key=lambda item: item.get("last_seen", ""), reverse=True)
    return profiles[:safe_limit]


def get_user_activity(user_name, limit=80):
    name = _safe_name(user_name)
    try:
        parsed_limit = int(limit)
    except (TypeError, ValueError):
        parsed_limit = 80
    safe_limit = max(1, min(parsed_limit, MAX_USER_EVENTS))

    with store_lock:
        user = user_store.get(name)
        if not user:
            return None

        events = list(user["events"])[-safe_limit:][::-1]
        avg_co2 = (user["sum_co2"] / user["predictions_count"]) if user["predictions_count"] else 0
        profile = {
            "name": user["name"],
            "email": user.get("email"),
            "started_at": user["started_at"],
            "last_seen": user["last_seen"],
            "last_location": user["last_location"],
            "last_measure_taken": user["last_measure_taken"],
            "predictions_count": user["predictions_count"],
            "activity_count": user["activity_count"],
            "login_count": user["login_count"],
            "avg_co2": round(avg_co2, 2),
            "best_reduction": round(user["best_reduction"], 2),
            "latest_co2": round(user["last_co2"], 2) if user["last_co2"] is not None else None,
        }

    return {"profile": profile, "events": events}
