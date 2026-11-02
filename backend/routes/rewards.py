import json
from flask import Blueprint, request, jsonify
from services.rewards_service import (
    get_all_catalog_items,
    get_item_by_id,
    calculate_user_points_balance,
    redeem_reward_item,
    get_user_unlocked_items,
    get_user_transaction_history,
)

rewards_bp = Blueprint("rewards", __name__)


# ── GET /rewards/catalog ─────────────────────────────────────────────────────
@rewards_bp.route("/rewards/catalog", methods=["GET"])
def get_catalog():
    """Returns the full rewards store catalog (courses, perks, tools, swag)."""
    try:
        catalog = get_all_catalog_items()
        categories = list({item.get("category") for item in catalog})
        types = list({item.get("type") for item in catalog})
        return jsonify({
            "success": True,
            "catalog": catalog,
            "categories": sorted(categories),
            "types": sorted(types),
            "totalItems": len(catalog),
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /rewards/balance/<user_id> ──────────────────────────────────────────
@rewards_bp.route("/rewards/balance/<user_id>", methods=["GET"])
def get_balance(user_id):
    """Returns current real-time points balance, unlocked items, and summary."""
    try:
        # Check optional onchain points query param
        onchain_points = request.args.get("onchain_points", default=None, type=int)
        balance = calculate_user_points_balance(user_id, onchain_points)
        history = get_user_transaction_history(user_id)
        return jsonify({
            "success": True,
            **balance,
            "recentTransactions": history[:5],
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /rewards/history/<user_id> ──────────────────────────────────────────
@rewards_bp.route("/rewards/history/<user_id>", methods=["GET"])
def get_history(user_id):
    """Returns complete transparent transaction history of reward points earned & spent."""
    try:
        history = get_user_transaction_history(user_id)
        return jsonify({
            "success": True,
            "userId": user_id,
            "transactions": history,
            "totalTransactions": len(history),
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /rewards/redeem ────────────────────────────────────────────────────
@rewards_bp.route("/rewards/redeem", methods=["POST"])
def redeem_item():
    """
    Spends reward points to unlock a premium course or perk item.
    Payload: { "userId": str, "itemId": str, "onchainPoints": int (optional) }
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        user_id = data.get("userId") or "demo-uid-deaf"
        item_id = data.get("itemId")
        onchain_points = data.get("onchainPoints")

        if not item_id:
            return jsonify({"success": False, "error": "itemId is required"}), 400

        result = redeem_reward_item(user_id, item_id, onchain_points)
        status_code = 200 if result.get("success") else 400

        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
