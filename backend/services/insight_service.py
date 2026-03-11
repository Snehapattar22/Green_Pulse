from collections import deque
from datetime import datetime, timezone

MAX_HISTORY = 500
reading_history = deque(maxlen=MAX_HISTORY)


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def validate_reading(temp, humidity, ir_value):
    t = to_float(temp)
    h = to_float(humidity)
    ir = to_float(ir_value)

    if t is None or h is None or ir is None:
        return None, "Sensor values must be numeric"
    if t < -40 or t > 90:
        return None, "Temperature seems out of range"
    if h < 0 or h > 100:
        return None, "Humidity must be between 0 and 100"
    if ir < 0:
        return None, "IR radiation cannot be negative"

    return (t, h, ir), None


def add_reading(reading):
    reading_history.append(reading)


def get_history(limit=60):
    try:
        parsed = int(limit)
    except (TypeError, ValueError):
        parsed = 60
    safe_limit = max(1, min(parsed, MAX_HISTORY))
    return list(reading_history)[-safe_limit:]


def _risk_level(co2_value):
    if co2_value <= 800:
        return "good"
    if co2_value <= 1200:
        return "moderate"
    return "high"


def _co2_score(co2_value):
    score = 100 - (co2_value - 400) * 0.08
    return max(0, min(100, round(score, 1)))


def _recommendations(latest):
    co2 = latest.get("co2", 0)
    humidity = latest.get("humidity", 0)
    temp = latest.get("temperature", 0)
    tips = []

    if co2 > 1200:
        tips.append("Open windows and increase cross-ventilation immediately.")
    elif co2 > 900:
        tips.append("Increase fresh-air intake to prevent a CO2 spike.")
    else:
        tips.append("Air quality is stable. Maintain current ventilation settings.")

    if humidity > 70:
        tips.append("Use dehumidification to keep humidity near 45-60%.")
    elif humidity < 30:
        tips.append("Humidity is low; use a humidifier for comfort and respiratory health.")

    if temp > 30:
        tips.append("High temperature detected. Improve cooling for occupant comfort.")
    elif temp < 18:
        tips.append("Low temperature detected. Warm-up settings may be needed.")

    return tips[:3]


def build_insights(latest, history):
    if not latest:
        return {
            "status": "no_data",
            "message": "No sensor data has been received yet.",
            "generated_at": utc_now_iso(),
        }

    co2_values = [item.get("co2", 0) for item in history if isinstance(item.get("co2"), (int, float))]
    avg_co2 = round(sum(co2_values) / len(co2_values), 1) if co2_values else latest["co2"]
    peak_co2 = round(max(co2_values), 1) if co2_values else latest["co2"]
    trend_ppm = round((co2_values[-1] - co2_values[0]), 1) if len(co2_values) >= 2 else 0.0
    trend_direction = "rising" if trend_ppm > 20 else "falling" if trend_ppm < -20 else "stable"

    co2 = float(latest["co2"])
    reward = float(latest.get("reward", 0))
    extrapolated_daily_reward = round(reward * 24 * 12, 3)

    return {
        "status": "ok",
        "generated_at": utc_now_iso(),
        "air_quality_score": _co2_score(co2),
        "risk_level": _risk_level(co2),
        "avg_co2": avg_co2,
        "peak_co2": peak_co2,
        "trend_ppm": trend_ppm,
        "trend_direction": trend_direction,
        "reward_projection_daily": extrapolated_daily_reward,
        "recommendations": _recommendations(latest),
    }
