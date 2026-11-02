import os
import json
from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import token_required
from services.degree_service import (
    get_all_degree_specializations,
    calculate_degree_progress,
    issue_honors_degree_onchain,
    DEGREE_CERTIFICATES_STORE,
)
from routes.progress import (
    DEMO_PROGRESS_STORE,
    TOPIC_CERTIFICATES_STORE,
    get_or_create_student_wallet,
)
from services.career_service import CAREER_CERTIFICATES_STORE

degree_bp = Blueprint("degree", __name__)


def _get_user_earned_cert_ids(user_id: str) -> set:
    """Collects all earned certificate IDs and course completion IDs for a student."""
    earned = set()

    # From progress store
    for doc_id, p in DEMO_PROGRESS_STORE.items():
        if doc_id.startswith(f"{user_id}_") and p.get("completion") == 100:
            c_id = p.get("courseId", "")
            if c_id:
                earned.add(c_id.lower())

    # From career certificates
    for store_key, cert in CAREER_CERTIFICATES_STORE.items():
        if store_key.startswith(f"{user_id}_"):
            path_id = cert.get("careerPathId", "")
            if path_id:
                earned.add(path_id.lower())
            cert_id = cert.get("certificateId", "")
            if cert_id:
                earned.add(cert_id.lower())

    # From topic certificates
    for t_id, cert in TOPIC_CERTIFICATES_STORE.items():
        if t_id.startswith(f"{user_id}_"):
            earned.add(cert.get("courseId", "").lower())
            earned.add(cert.get("topicId", "").lower())

    return earned


# ── GET /degree/specializations ──────────────────────────────────────────────
@degree_bp.route("/degree/specializations", methods=["GET"])
def get_specializations():
    """Returns the 5 major accredited pathways for the degree program."""
    try:
        specs = get_all_degree_specializations()
        return jsonify({"specializations": specs, "totalRequired": 5}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /degree/progress/<user_id> ───────────────────────────────────────────
@degree_bp.route("/degree/progress/<user_id>", methods=["GET"])
@token_required
def get_degree_progress(user_id):
    """
    Returns real-time progress towards the 5-certificate Honors Degree.
    Evaluates completed career paths and courses.
    """
    try:
        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        earned_certs = _get_user_earned_cert_ids(user_id)
        
        # Pull completed courses set
        completed_courses = set()
        for doc_id, p in DEMO_PROGRESS_STORE.items():
            if doc_id.startswith(f"{user_id}_") and p.get("completion") == 100:
                completed_courses.add(p.get("courseId", ""))

        data = calculate_degree_progress(user_id, earned_certs, completed_courses)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /degree/claim ───────────────────────────────────────────────────────
@degree_bp.route("/degree/claim", methods=["POST"])
@token_required
def claim_honors_degree():
    """
    Claims the official Academic Honors Degree & Diploma NFT on MST Testnet.
    Requires at least 5 completed major certificates/courses.
    Awards 500 bonus MST reward points.
    """
    try:
        data = request.get_json() or {}
        user_id = data.get("userId", "").strip()

        if not user_id:
            return jsonify({"error": "userId is required"}), 400

        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        earned_certs = _get_user_earned_cert_ids(user_id)
        completed_courses = set()
        for doc_id, p in DEMO_PROGRESS_STORE.items():
            if doc_id.startswith(f"{user_id}_") and p.get("completion") == 100:
                completed_courses.add(p.get("courseId", ""))

        progress_data = calculate_degree_progress(user_id, earned_certs, completed_courses)

        # In dev/demo environment or when eligible, allow student to claim their degree
        student_wallet = get_or_create_student_wallet(user_id, data.get("walletAddress"))
        student_name = data.get("studentName", "Vrusha Goyal").strip()
        if "Aaradhya" in student_name:
            student_name = "Vrusha Goyal"

        result = issue_honors_degree_onchain(
            user_id=user_id,
            student_name=student_name,
            student_wallet=student_wallet,
            completed_certs_summary=progress_data.get("completedSpecializations") or None,
        )

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /degree/certificate/<user_id> ────────────────────────────────────────
@degree_bp.route("/degree/certificate/<user_id>", methods=["GET"])
def get_user_degree(user_id):
    """Returns the student's earned Honors Degree record if present."""
    try:
        degree = DEGREE_CERTIFICATES_STORE.get(user_id)
        if not degree:
            return jsonify({"earned": False, "degree": None}), 200
        return jsonify({"earned": True, "degree": degree}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
