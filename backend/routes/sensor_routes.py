from flask import Blueprint, request, jsonify
from services.ml_service import predict_co2
from services.firebase_service import save_data
from services.reward_service import calculate_reward
from services.insight_service import (
    add_reading,
    build_insights,
    get_history,
    utc_now_iso,
    validate_reading,
)
from services.user_activity_service import record_user_activity

sensor_bp = Blueprint("sensor", __name__)

latest_data = {}

@sensor_bp.route("/sensor", methods=["POST"])
def receive_sensor():

    global latest_data

    data = request.json

    # Safety check
    if not data:
        return jsonify({"error": "No data received"}), 400

    temp = data.get("temperature")
    humidity = data.get("humidity")
    ir_value = data.get("ir_radiation")
    user_name = data.get("user_name", "Anonymous User")
    location = data.get("location", "Unknown Location")
    measure_taken = data.get("measure_taken", "No measure provided")

    # Validate missing fields
    if temp is None or humidity is None or ir_value is None:
        return jsonify({"error": "Missing sensor values"}), 400

    validated, error_message = validate_reading(temp, humidity, ir_value)
    if error_message:
        return jsonify({"error": error_message}), 400

    temp, humidity, ir_value = validated

    # Predict CO2
    co2_prediction = predict_co2(temp, humidity, ir_value)

    # Calculate reward
    reward = calculate_reward(co2_prediction)

    timestamp = utc_now_iso()

    # Save to Firebase
    save_data(temp, humidity, ir_value, co2_prediction, reward, timestamp)

    # Store latest data in memory
    latest_data = {
        "user_name": str(user_name).strip() or "Anonymous User",
        "location": str(location).strip() or "Unknown Location",
        "measure_taken": str(measure_taken).strip() or "No measure provided",
        "temperature": temp,
        "humidity": humidity,
        "ir_radiation": ir_value,
        "co2": co2_prediction,
        "reward": reward,
        "timestamp": timestamp
    }

    add_reading(latest_data)
    record_user_activity(user_name, location, measure_taken, latest_data)
    return jsonify({**latest_data, "analysis": build_insights(latest_data, get_history(60))})


@sensor_bp.route("/latest", methods=["GET"])
def get_latest():
    return jsonify(latest_data)


@sensor_bp.route("/history", methods=["GET"])
def get_sensor_history():
    limit = request.args.get("limit", default=60, type=int)
    items = get_history(limit)
    return jsonify({"count": len(items), "items": items})


@sensor_bp.route("/insights", methods=["GET"])
def get_insights():
    history = get_history(120)
    return jsonify(build_insights(latest_data, history))
