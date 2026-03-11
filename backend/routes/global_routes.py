from flask import Blueprint, jsonify
from services.global_live_service import get_live_global_environment

global_bp = Blueprint("global", __name__)


@global_bp.route("/global/live", methods=["GET"])
def global_live():
    return jsonify(get_live_global_environment())
