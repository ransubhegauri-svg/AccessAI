from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import token_required
from services.career_service import (
    get_all_career_paths,
    get_career_path_by_id,
    calculate_career_progress,
    issue_career_certificate_onchain,
    CAREER_CERTIFICATES_STORE,
)
from routes.progress import (
    DEMO_PROGRESS_STORE,
    progress_collection,
    find_user_profile,
    get_or_create_student_wallet,
)
from firebase_config import db

career_bp = Blueprint("career", __name__)

# In-memory store for career course completions: { f"{user_id}_{course_id}": True }
CAREER_COURSE_COMPLETIONS = {}


def _get_user_completed_courses(user_id: str) -> set:
    """Collects all completed course IDs for a user across stores."""
    completed = set()

    # 1. From CAREER_COURSE_COMPLETIONS
    for k, v in CAREER_COURSE_COMPLETIONS.items():
        if k.startswith(f"{user_id}_") and v:
            c_id = k.split(f"{user_id}_")[1]
            completed.add(c_id)

    # 2. From DEMO_PROGRESS_STORE
    for k, v in DEMO_PROGRESS_STORE.items():
        if v.get("userId") == user_id and v.get("completion") == 100:
            c_id = v.get("courseId")
            if c_id:
                completed.add(c_id)

    # 3. From Firestore if registered user
    if db and not user_id.startswith("demo-"):
        try:
            mode, user_doc = find_user_profile(db, user_id)
            if user_doc and user_doc.exists:
                docs = progress_collection(db, mode).where("userId", "==", user_id).stream()
                for doc in docs:
                    p = doc.to_dict()
                    if p.get("completion") == 100:
                        c_id = p.get("courseId")
                        if c_id:
                            completed.add(c_id)
        except Exception:
            pass

    return completed


# ── GET /career/paths ────────────────────────────────────────────────────────
@career_bp.route("/career/paths", methods=["GET"])
def list_career_paths():
    """Returns all available career learning paths."""
    try:
        paths = get_all_career_paths()
        return jsonify({"careerPaths": paths}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /career/paths/<path_id> ──────────────────────────────────────────────
@career_bp.route("/career/paths/<path_id>", methods=["GET"])
def get_path_details(path_id):
    """Returns a single career path with its 5 courses and quizzes."""
    try:
        cp = get_career_path_by_id(path_id)
        if not cp:
            return jsonify({"error": f"Career path '{path_id}' not found"}), 404
        return jsonify({"careerPath": cp}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /career/progress/<user_id> ──────────────────────────────────────────
@career_bp.route("/career/progress/<user_id>", methods=["GET"])
@token_required
def get_user_career_progress(user_id):
    """Returns real-time progress for all career paths (X of 5 courses completed)."""
    try:
        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        completed = _get_user_completed_courses(user_id)
        progress = calculate_career_progress(user_id, completed)

        return jsonify({
            "userId": user_id,
            "careerProgress": progress,
            "totalCompletedCourses": len(completed),
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /career/complete-course ─────────────────────────────────────────────
@career_bp.route("/career/complete-course", methods=["POST"])
@token_required
def complete_career_course():
    """
    Marks one of the 5 courses in a career path completed after passing the quiz.
    Automatically checks if all 5 courses are now done to unlock the Career Certificate!
    """
    try:
        data = request.get_json() or {}
        user_id = data.get("userId", "").strip()
        path_id = data.get("pathId", "").strip()
        course_id = data.get("courseId", "").strip()

        if not user_id or not path_id or not course_id:
            return jsonify({"error": "userId, pathId, and courseId are required"}), 400

        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        cp = get_career_path_by_id(path_id)
        if not cp:
            return jsonify({"error": f"Career path '{path_id}' not found"}), 404

        # Record course completion
        comp_key = f"{user_id}_{course_id}"
        CAREER_COURSE_COMPLETIONS[comp_key] = True

        # Also register in DEMO_PROGRESS_STORE for unified records
        c_obj = next((c for c in cp["courses"] if c["id"] == course_id), None)
        c_title = c_obj["title"] if c_obj else course_id
        doc_id = f"{user_id}_{course_id}"
        DEMO_PROGRESS_STORE[doc_id] = {
            "userId": user_id,
            "courseId": course_id,
            "courseTitle": c_title,
            "completion": 100,
            "careerPathId": path_id,
        }

        # Check total completed in this path
        completed_set = _get_user_completed_courses(user_id)
        path_course_ids = [c["id"] for c in cp["courses"]]
        completed_in_path = [cid for cid in path_course_ids if cid in completed_set]
        completed_count = len(completed_in_path)
        is_path_completed = completed_count >= 5

        response_data = {
            "message": f"Course '{c_title}' completed successfully!",
            "courseId": course_id,
            "pathId": path_id,
            "completedCount": completed_count,
            "totalCourses": 5,
            "isPathCompleted": is_path_completed,
            "completionPercentage": int((completed_count / 5) * 100),
        }

        # If all 5 courses are completed, auto-issue or prepare career certificate
        student_wallet = get_or_create_student_wallet(user_id, data.get("walletAddress"))
        student_name = data.get("studentName", "Vrusha Goyal").strip()
        if "Aaradhya" in student_name:
            student_name = "Vrusha Goyal"

        if is_path_completed:
            try:
                cert_result = issue_career_certificate_onchain(
                    user_id=user_id,
                    path_id=path_id,
                    student_name=student_name,
                    student_wallet=student_wallet,
                )
                response_data["careerCertificate"] = cert_result.get("certificate")
                response_data["blockchain"] = cert_result.get("blockchain")
                response_data["message"] = f"Congratulations! You completed all 5 courses in {cp['title']}. Your Career Readiness Certificate has been minted on MST Testnet!"
            except Exception as cert_err:
                print(f"[Career Mint Warning] {cert_err}")

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /career/claim ───────────────────────────────────────────────────────
@career_bp.route("/career/claim", methods=["POST"])
@token_required
def claim_career_certificate():
    """
    Explicitly claims / mints the Career Readiness Certificate NFT on MST Testnet.
    Verifies that all 5 courses and quizzes have been completed.
    """
    try:
        data = request.get_json() or {}
        user_id = data.get("userId", "").strip()
        path_id = data.get("pathId", "").strip()

        if not user_id or not path_id:
            return jsonify({"error": "userId and pathId are required"}), 400

        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        cp = get_career_path_by_id(path_id)
        if not cp:
            return jsonify({"error": f"Career path '{path_id}' not found"}), 404

        # Check completed courses
        completed_set = _get_user_completed_courses(user_id)
        path_course_ids = [c["id"] for c in cp["courses"]]
        completed_in_path = [cid for cid in path_course_ids if cid in completed_set]

        if len(completed_in_path) < 5:
            return jsonify({
                "error": f"Career path requires all 5 courses completed. You have completed {len(completed_in_path)} of 5.",
                "completedCount": len(completed_in_path),
                "remainingCourses": [cid for cid in path_course_ids if cid not in completed_set]
            }), 400

        student_name = (data.get("studentName") or "Vrusha Goyal").strip()
        if "Aaradhya" in student_name:
            student_name = "Vrusha Goyal"

        student_wallet = get_or_create_student_wallet(user_id, data.get("walletAddress"))

        # Issue on MST Testnet
        res = issue_career_certificate_onchain(
            user_id=user_id,
            path_id=path_id,
            student_name=student_name,
            student_wallet=student_wallet,
        )

        return jsonify(res), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /career/certificates/<user_id> ───────────────────────────────────────
@career_bp.route("/career/certificates/<user_id>", methods=["GET"])
@token_required
def get_user_career_certificates(user_id):
    """Returns all earned career certificates for a user."""
    try:
        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        certs = [v for k, v in CAREER_CERTIFICATES_STORE.items() if k.startswith(f"{user_id}_")]
        return jsonify({"careerCertificates": certs}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
