import json
import math
from datetime import datetime, timezone
from urllib.error import URLError
from urllib.request import urlopen

GLOBAL_POINTS = [
    {"city": "New York", "country": "US", "lat": 40.7128, "lon": -74.0060},
    {"city": "Los Angeles", "country": "US", "lat": 34.0522, "lon": -118.2437},
    {"city": "Mexico City", "country": "MX", "lat": 19.4326, "lon": -99.1332},
    {"city": "London", "country": "GB", "lat": 51.5072, "lon": -0.1276},
    {"city": "Paris", "country": "FR", "lat": 48.8566, "lon": 2.3522},
    {"city": "Cairo", "country": "EG", "lat": 30.0444, "lon": 31.2357},
    {"city": "Delhi", "country": "IN", "lat": 28.6139, "lon": 77.2090},
    {"city": "Singapore", "country": "SG", "lat": 1.3521, "lon": 103.8198},
    {"city": "Tokyo", "country": "JP", "lat": 35.6762, "lon": 139.6503},
    {"city": "Sydney", "country": "AU", "lat": -33.8688, "lon": 151.2093},
    {"city": "Sao Paulo", "country": "BR", "lat": -23.5505, "lon": -46.6333},
    {"city": "Johannesburg", "country": "ZA", "lat": -26.2041, "lon": 28.0473},
]


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def _estimate_city_co2(aqi, pm25, co, lon, hour_float):
    estimate = (
        409
        + (float(aqi) * 0.18)
        + (float(pm25) * 0.65)
        + (float(co) * 0.01)
        + (1.8 * math.sin((hour_float + lon / 30) * math.pi / 12))
    )
    return round(max(390, min(620, estimate)), 2)


def _fetch_city_air_quality(city, hour_float):
    url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality?"
        f"latitude={city['lat']}&longitude={city['lon']}"
        "&current=us_aqi,pm2_5,carbon_monoxide"
        "&hourly=us_aqi,pm2_5"
        "&past_days=1"
    )
    with urlopen(url, timeout=6) as response:
        payload = json.loads(response.read().decode("utf-8"))

    current = payload.get("current", {})
    hourly = payload.get("hourly", {})
    times = hourly.get("time", [])
    aqi_values = hourly.get("us_aqi", [])
    pm_values = hourly.get("pm2_5", [])

    trend_points = []
    for time_value, aqi_value, pm_value in zip(times, aqi_values, pm_values):
        if aqi_value is None or pm_value is None:
            continue
        trend_points.append(
            {
                "timestamp": time_value,
                "aqi": float(aqi_value),
                "pm25": float(pm_value),
            }
        )

    current_aqi = float(current.get("us_aqi") or 0)
    current_pm25 = float(current.get("pm2_5") or 0)
    current_co = float(current.get("carbon_monoxide") or 0)

    return {
        "city": city["city"],
        "country": city["country"],
        "lat": city["lat"],
        "lon": city["lon"],
        "aqi_us": current_aqi,
        "pm2_5": current_pm25,
        "co": current_co,
        "co2_estimate_ppm": _estimate_city_co2(current_aqi, current_pm25, current_co, city["lon"], hour_float),
    }, trend_points[-24:]


def _fallback_city_air_quality(city, hour_float):
    signal = 55 + 18 * math.sin((hour_float + city["lat"] * 0.01) * math.pi / 12)
    pm = 12 + 5 * math.sin((hour_float + city["lon"] * 0.02) * math.pi / 12)
    co = 210 + 35 * math.cos((hour_float + city["lat"] * 0.01) * math.pi / 8)
    aqi = round(max(18, signal), 1)
    pm25 = round(max(4, pm), 1)
    co_safe = round(max(80, co), 1)
    return {
        "city": city["city"],
        "country": city["country"],
        "lat": city["lat"],
        "lon": city["lon"],
        "aqi_us": aqi,
        "pm2_5": pm25,
        "co": co_safe,
        "co2_estimate_ppm": _estimate_city_co2(aqi, pm25, co_safe, city["lon"], hour_float),
    }


def _fallback_trend(hour_float):
    points = []
    for i in range(24):
        h = (hour_float - (23 - i)) % 24
        aqi = 58 + 14 * math.sin((h + 2) * math.pi / 12)
        pm25 = 12 + 4 * math.sin((h + 5) * math.pi / 12)
        co2 = 420 + 2.4 * math.sin((h + 1) * math.pi / 12)
        points.append(
            {
                "time": f"{int(h):02d}:00",
                "aqi": round(max(20, aqi), 1),
                "pm25": round(max(3, pm25), 1),
                "co2": round(co2, 2),
            }
        )
    return points


def get_live_global_environment():
    now = datetime.now(timezone.utc)
    hour_float = now.hour + (now.minute / 60)
    cities = []
    source = "open-meteo"
    had_live = False
    had_fallback = False
    trend_buckets = {}

    for city in GLOBAL_POINTS:
        try:
            live_item, city_trend = _fetch_city_air_quality(city, hour_float)
            if live_item["aqi_us"] is None:
                raise ValueError("Missing AQI")
            cities.append(live_item)
            had_live = True
            for point in city_trend:
                ts = point["timestamp"]
                if ts not in trend_buckets:
                    trend_buckets[ts] = {"aqi": [], "pm25": []}
                trend_buckets[ts]["aqi"].append(point["aqi"])
                trend_buckets[ts]["pm25"].append(point["pm25"])
        except (URLError, TimeoutError, ValueError, json.JSONDecodeError):
            had_fallback = True
            cities.append(_fallback_city_air_quality(city, hour_float))

    avg_aqi = round(sum(item["aqi_us"] for item in cities) / len(cities), 1)
    avg_pm25 = round(sum(item["pm2_5"] for item in cities) / len(cities), 1)
    avg_city_co2 = round(sum(item["co2_estimate_ppm"] for item in cities) / len(cities), 2)

    if had_live and had_fallback:
        source = "mixed"
    elif had_fallback and not had_live:
        source = "fallback"

    trend = []
    if trend_buckets:
        ordered = sorted(trend_buckets.items(), key=lambda item: item[0])[-24:]
        for timestamp, values in ordered:
            avg_trend_aqi = sum(values["aqi"]) / len(values["aqi"])
            avg_trend_pm25 = sum(values["pm25"]) / len(values["pm25"])
            trend_co2 = 416 + (avg_trend_aqi * 0.06) + (avg_trend_pm25 * 0.18)
            trend.append(
                {
                    "time": timestamp[-5:],
                    "aqi": round(avg_trend_aqi, 1),
                    "pm25": round(avg_trend_pm25, 1),
                    "co2": round(trend_co2, 2),
                }
            )
    else:
        trend = _fallback_trend(hour_float)

    global_co2_estimate = trend[-1]["co2"] if trend else round(423 + 0.3 * math.sin(hour_float * math.pi / 12), 2)

    return {
        "generated_at": utc_now_iso(),
        "source": source,
        "global_summary": {
            "avg_aqi_us": avg_aqi,
            "avg_pm2_5": avg_pm25,
            "atmospheric_co2_estimate_ppm": global_co2_estimate,
            "avg_city_co2_estimate_ppm": avg_city_co2,
        },
        "cities": cities,
        "trend": trend,
    }
