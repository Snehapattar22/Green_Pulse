import secrets
from flask import Blueprint, jsonify, request
from services.reward_store_service import (
    add_reward_entry,
    get_leaderboard,
    get_reward_history,
    get_reward_summary,
)
from services.user_activity_service import get_user_activity, list_user_profiles

reward_bp = Blueprint("reward", __name__)
admin_bp = Blueprint("admin", __name__)

ADMIN_PASSCODE = "greenpulse-admin-2026"
admin_tokens = set()


def _is_admin(request_obj):
    token = request_obj.headers.get("X-Admin-Token", "").strip()
    return token in admin_tokens


@admin_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.json or {}
    passcode = str(data.get("passcode", "")).strip()
    if passcode != ADMIN_PASSCODE:
        return jsonify({"error": "Invalid admin passcode"}), 401

    token = secrets.token_urlsafe(24)
    admin_tokens.add(token)
    return jsonify({"token": token})


@admin_bp.route("/rewards", methods=["POST"])
def assign_reward():
    if not _is_admin(request):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    entry, error_message = add_reward_entry(
        name=data.get("name"),
        points=data.get("points"),
        reason=data.get("reason"),
        issued_by=data.get("issued_by", "admin"),
    )
    if error_message:
        return jsonify({"error": error_message}), 400

    return jsonify({"status": "ok", "entry": entry}), 201


@admin_bp.route("/rewards/history", methods=["GET"])
def admin_history():
    if not _is_admin(request):
        return jsonify({"error": "Unauthorized"}), 401
    limit = request.args.get("limit", default=100, type=int)
    return jsonify({"items": get_reward_history(limit), "summary": get_reward_summary()})


@admin_bp.route("/users", methods=["GET"])
def admin_users():
    if not _is_admin(request):
        return jsonify({"error": "Unauthorized"}), 401
    limit = request.args.get("limit", default=100, type=int)
    return jsonify({"items": list_user_profiles(limit)})


@admin_bp.route("/users/<path:user_name>/activity", methods=["GET"])
def admin_user_activity(user_name):
    if not _is_admin(request):
        return jsonify({"error": "Unauthorized"}), 401
    limit = request.args.get("limit", default=80, type=int)
    data = get_user_activity(user_name, limit)
    if not data:
        return jsonify({"error": "User activity not found"}), 404
    return jsonify(data)


@reward_bp.route("/history", methods=["GET"])
def reward_history():
    limit = request.args.get("limit", default=60, type=int)
    return jsonify({"items": get_reward_history(limit)})


@reward_bp.route("/leaderboard", methods=["GET"])
def reward_leaderboard():
    limit = request.args.get("limit", default=20, type=int)
    return jsonify({"items": get_leaderboard(limit)})


@reward_bp.route("/summary", methods=["GET"])
def reward_summary():
    return jsonify(get_reward_summary())
