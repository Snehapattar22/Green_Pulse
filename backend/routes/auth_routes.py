from flask import Blueprint, jsonify, request
from services.user_activity_service import record_user_login

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login-activity", methods=["POST"])
def login_activity():
    data = request.json or {}
    user_name = str(data.get("user_name", "")).strip()
    email = str(data.get("email", "")).strip()
    auth_provider = str(data.get("auth_provider", "firebase")).strip() or "firebase"

    if not user_name and not email:
        return jsonify({"error": "user_name or email is required"}), 400

    resolved_name = user_name or email.split("@")[0]
    record_user_login(resolved_name, email=email or None, auth_provider=auth_provider)
    return jsonify({"status": "ok", "name": resolved_name})
