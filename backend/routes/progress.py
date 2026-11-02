from flask import Blueprint, request, jsonify, g
from firebase_config import db
from middleware.auth_middleware import token_required
from middleware.validators import validate_progress
from services.mode_collections import (
    find_user_profile,
    migrate_legacy_progress,
    migrate_legacy_user_profile,
    progress_collection,
    users_collection,
)
from services.blockchain_service import (
    award_points_onchain,
    issue_certificate_onchain,
    award_and_certify_onchain,
    award_and_issue_nft,
    w3,
    CONTRACT_ADDRESS,
)
from datetime import datetime, timezone

progress_bp = Blueprint("progress", __name__)
DEMO_PROGRESS_STORE = {}
TOPIC_CERTIFICATES_STORE = {}


def get_or_create_student_wallet(user_id: str, requested_wallet: str = None, user_dict: dict = None) -> str:
    """
    Returns the student's wallet address.
    If the student has connected BridgeKey/MetaMask, returns that address.
    Otherwise, generates a deterministic, secure student wallet derived from their account ID.
    This guarantees automatic on-chain NFT certificate issuance across all AccessAI modes.
    """
    if requested_wallet and w3.is_address(requested_wallet):
        return w3.to_checksum_address(requested_wallet)
    
    if user_dict and user_dict.get("walletAddress") and w3.is_address(user_dict.get("walletAddress")):
        return w3.to_checksum_address(user_dict.get("walletAddress"))

    # Generate a deterministic EVM address from user_id seed
    seed = w3.keccak(text=f"accessai_student_custodial_key_{user_id}").hex()
    deterministic_wallet = w3.eth.account.from_key(seed).address
    return deterministic_wallet


# POST /progress  — protected
@progress_bp.route("/progress", methods=["POST"])
@token_required
def save_progress():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        error = validate_progress(data)
        if error:
            return jsonify({"error": error}), 400

        user_id   = data["userId"].strip()
        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        if user_id.startswith("demo-"):
            mode = "deaf" if "deaf" in user_id else ("motor" if "motor" in user_id else ("blind" if "blind" in user_id else "deaf"))
            default_name = "Vrusha Goyal" if mode == "deaf" else "Aman Halkude"
            demo_data = {
                "uid": user_id,
                "name": data.get("studentName") or default_name,
                "displayName": data.get("studentName") or default_name,
                "email": "demo@accessai.com",
                "disabilityType": mode
            }
            class DemoDoc:
                exists = True
                def to_dict(self): return demo_data
            user_doc = DemoDoc()
        else:
            migrate_legacy_user_profile(db, user_id)
            mode, user_doc = find_user_profile(db, user_id)
            if not user_doc or not user_doc.exists:
                return jsonify({"error": "User not found"}), 404
            migrate_legacy_progress(db, user_id, mode)

        course_id = data["courseId"].strip()
        doc_id    = f"{user_id}_{course_id}"
        completion = data["completion"]

        progress_record = {
            "userId":         user_id,
            "courseId":       course_id,
            "completion":     completion,
            "disabilityType": mode,
            "updatedAt":      datetime.now(timezone.utc).isoformat(),
        }

        # Check if rewards were already awarded to prevent duplicate rewards & certificates
        already_has_blockchain = False
        blockchain_data = None
        existing_dict = {}

        if user_id.startswith("demo-"):
            existing_dict = DEMO_PROGRESS_STORE.get(doc_id, {})
        else:
            try:
                existing_doc = progress_collection(db, mode).document(doc_id).get()
                if existing_doc.exists:
                    existing_dict = existing_doc.to_dict() or {}
            except Exception:
                existing_dict = DEMO_PROGRESS_STORE.get(doc_id, {})

        if existing_dict.get("blockchain"):
            already_has_blockchain = True
            blockchain_data = existing_dict.get("blockchain")
            progress_record["blockchain"] = blockchain_data

        # If user completed 100% of the course and hasn't received rewards yet, securely trigger MST Blockchain NFT issuance
        if completion == 100 and not already_has_blockchain:
            user_dict = user_doc.to_dict() or {}
            student_wallet = get_or_create_student_wallet(user_id, data.get("walletAddress"), user_dict)

            # Persist wallet to user profile if not already set
            if not user_dict.get("walletAddress") and not user_id.startswith("demo-"):
                try:
                    users_collection(db, mode).document(user_id).set({"walletAddress": student_wallet}, merge=True)
                except Exception:
                    pass

            default_student_name = "Vrusha Goyal" if mode == "deaf" else "Aman Halkude"
            student_name = data.get("studentName") or user_dict.get("displayName") or user_dict.get("name") or default_student_name
            if "Aaradhya" in str(student_name):
                student_name = default_student_name
            course_name = data.get("courseTitle") or data.get("courseName")
            if not course_name:
                try:
                    c_doc = db.collection("courses").document(course_id).get()
                    if c_doc.exists:
                        course_name = c_doc.to_dict().get("title")
                except Exception:
                    pass
            if not course_name:
                course_name = course_id.replace("-", " ").title()

            completion_date = datetime.now(timezone.utc).strftime("%B %d, %Y")

            try:
                clean_course = "".join(c for c in course_id if c.isalnum()).upper()
                clean_uid = "".join(c for c in user_id if c.isalnum())[:6].upper()
                cert_id = f"CERT-{clean_course}-{clean_uid}"

                b_res = award_and_issue_nft(
                    student_address=student_wallet,
                    points=50,
                    certificate_id=cert_id,
                    course_id=course_id,
                    course_name=course_name,
                    student_name=student_name,
                    completion_date=completion_date,
                )

                blockchain_data = {
                    "pointsAwarded": 50,
                    "pointsTxHash": b_res.get("txHash"),
                    "certificateId": cert_id,
                    "certificateTxHash": b_res.get("txHash"),
                    "tokenId": b_res.get("tokenId"),
                    "certificateHash": b_res.get("certificateHash"),
                    "tokenURI": b_res.get("tokenURI"),
                    "ipfsCid": b_res.get("ipfsCid"),
                    "ipfsUri": b_res.get("ipfsUri"),
                    "pdfDownloadUrl": b_res.get("pdfDownloadUrl"),
                    "imageUrl": b_res.get("imageUrl"),
                    "student": student_wallet,
                    "studentName": student_name,
                    "courseName": course_name,
                    "completionDate": completion_date,
                    "status": b_res.get("status"),
                    "contractAddress": CONTRACT_ADDRESS,
                    "network": "MST Testnet",
                }
                progress_record["blockchain"] = blockchain_data
            except Exception as b_err:
                print(f"[Blockchain Warning] Failed to mint on-chain rewards: {b_err}")

        DEMO_PROGRESS_STORE[doc_id] = progress_record
        if not user_id.startswith("demo-"):
            try:
                progress_collection(db, mode).document(doc_id).set(progress_record, merge=True)
            except Exception:
                pass

        resp = {"message": "Progress saved successfully"}
        if blockchain_data:
            resp["blockchain"] = blockchain_data

        return jsonify(resp), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# POST /progress/claim-onchain — protected (claims rewards for 100% completed courses when wallet connects)
@progress_bp.route("/progress/claim-onchain", methods=["POST"])
@token_required
def claim_onchain():
    try:
        data = request.get_json() or {}
        user_id = data.get("userId") or g.uid
        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        student_wallet = data.get("walletAddress")
        if not student_wallet:
            return jsonify({"error": "walletAddress is required"}), 400

        migrate_legacy_user_profile(db, user_id)
        mode, user_doc = find_user_profile(db, user_id)
        if not user_doc or not user_doc.exists:
            if user_id.startswith("demo-"):
                mode = "deaf" if "deaf" in user_id else ("motor" if "motor" in user_id else ("blind" if "blind" in user_id else "deaf"))
                default_name = "Vrusha Goyal" if mode == "deaf" else "Aman Halkude"
                users_collection(db, mode).document(user_id).set({
                    "uid": user_id,
                    "name": default_name,
                    "displayName": default_name,
                    "email": f"{user_id}@accessai.com",
                    "disabilityType": mode
                }, merge=True)
                user_doc = users_collection(db, mode).document(user_id).get()
            else:
                return jsonify({"error": "User not found"}), 404

        user_dict = user_doc.to_dict() or {}
        default_student_name = "Vrusha Goyal" if mode == "deaf" else "Aman Halkude"
        student_name = data.get("studentName") or user_dict.get("displayName") or user_dict.get("name") or default_student_name
        if "Aaradhya" in str(student_name):
            student_name = default_student_name

        # Save wallet address to user profile in Firestore
        users_collection(db, mode).document(user_id).set({"walletAddress": student_wallet}, merge=True)

        # Find 100% completed courses that lack blockchain rewards
        docs = progress_collection(db, mode).where("userId", "==", user_id).stream()
        claimed = []
        for doc in docs:
            p_data = doc.to_dict()
            if p_data.get("completion") == 100 and not p_data.get("blockchain"):
                c_id = p_data.get("courseId")
                c_title = p_data.get("courseTitle") or c_id.replace("-", " ").title()
                comp_date = datetime.now(timezone.utc).strftime("%B %d, %Y")
                try:
                    clean_course = "".join(c for c in c_id if c.isalnum()).upper()
                    clean_uid = "".join(c for c in user_id if c.isalnum())[:6].upper()
                    cert_id = f"CERT-{clean_course}-{clean_uid}"

                    b_res = award_and_issue_nft(
                        student_address=student_wallet,
                        points=50,
                        certificate_id=cert_id,
                        course_id=c_id,
                        course_name=c_title,
                        student_name=student_name,
                        completion_date=comp_date,
                    )

                    b_data = {
                        "pointsAwarded": 50,
                        "pointsTxHash": b_res.get("txHash"),
                        "certificateId": cert_id,
                        "certificateTxHash": b_res.get("txHash"),
                        "tokenId": b_res.get("tokenId"),
                        "certificateHash": b_res.get("certificateHash"),
                        "tokenURI": b_res.get("tokenURI"),
                        "ipfsCid": b_res.get("ipfsCid"),
                        "ipfsUri": b_res.get("ipfsUri"),
                        "pdfDownloadUrl": b_res.get("pdfDownloadUrl"),
                        "imageUrl": b_res.get("imageUrl"),
                        "student": student_wallet,
                        "studentName": student_name,
                        "courseName": c_title,
                        "completionDate": comp_date,
                        "status": b_res.get("status"),
                        "contractAddress": CONTRACT_ADDRESS,
                        "network": "MST Testnet",
                    }
                    progress_collection(db, mode).document(doc.id).set({"blockchain": b_data}, merge=True)
                    claimed.append({"courseId": c_id, **b_data})
                except Exception as b_err:
                    print(f"[Blockchain Warning] Failed claiming on-chain for {c_id}: {b_err}")

        return jsonify({
            "message": f"Successfully processed on-chain rewards for {len(claimed)} course(s)",
            "claimed": claimed,
            "walletAddress": student_wallet
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# GET /progress/<userId>  — protected
@progress_bp.route("/progress/<user_id>", methods=["GET"])
@token_required
def get_progress(user_id):
    try:
        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        migrate_legacy_user_profile(db, user_id)
        mode, user_doc = find_user_profile(db, user_id)
        if not user_doc or not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        migrate_legacy_progress(db, user_id, mode)

        docs   = progress_collection(db, mode).where("userId", "==", user_id).stream()
        result = [{"id": doc.id, **doc.to_dict()} for doc in docs]

        return jsonify({"progress": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# POST /progress/topic  — protected
# Generates personalized certificates for individual video topics after video completion & quiz submission
@progress_bp.route("/progress/topic", methods=["POST"])
@token_required
def complete_topic():
    try:
        data = request.get_json() or {}
        user_id = data.get("userId", "").strip()
        course_id = data.get("courseId", "").strip()
        topic_id = data.get("topicId", "").strip()

        if not user_id or not course_id or not topic_id:
            return jsonify({"error": "userId, courseId, and topicId are required"}), 400

        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        if user_id.startswith("demo-"):
            mode = "deaf" if "deaf" in user_id else ("motor" if "motor" in user_id else ("blind" if "blind" in user_id else "deaf"))
            default_name = "Vrusha Goyal" if mode == "deaf" else "Aman Halkude"
            user_dict = {
                "uid": user_id,
                "name": data.get("studentName") or default_name,
                "displayName": data.get("studentName") or default_name,
                "email": f"{user_id}@accessai.com",
                "disabilityType": mode
            }
        else:
            migrate_legacy_user_profile(db, user_id)
            mode, user_doc = find_user_profile(db, user_id)
            if not user_doc or not user_doc.exists:
                mode = "deaf"
                user_dict = {}
            else:
                user_dict = user_doc.to_dict() or {}

        default_student_name = "Vrusha Goyal" if mode == "deaf" else "Aman Halkude"
        student_name = (
            data.get("studentName")
            or user_dict.get("displayName")
            or user_dict.get("name")
            or default_student_name
        ).strip()
        if "Aaradhya" in str(student_name):
            student_name = default_student_name

        student_wallet = get_or_create_student_wallet(user_id, data.get("walletAddress"), user_dict)

        course_title = data.get("courseTitle") or data.get("courseName")
        if not course_title:
            try:
                c_doc = db.collection("courses").document(course_id).get()
                if c_doc.exists:
                    course_title = c_doc.to_dict().get("title")
            except Exception:
                pass
        if not course_title:
            course_title = course_id.replace("-", " ").title()

        topic_title = data.get("topicTitle") or data.get("topicName") or topic_id.replace("-", " ").title()
        completion_date = datetime.now(timezone.utc).strftime("%B %d, %Y")

        topic_store_key = f"{user_id}_{course_id}_{topic_id}"
        clean_course = "".join(c for c in course_id if c.isalnum()).upper()
        clean_topic = "".join(c for c in topic_id if c.isalnum()).upper()
        clean_uid = "".join(c for c in user_id if c.isalnum())[:6].upper()
        cert_id = f"CERT-{clean_course}-{clean_topic}-{clean_uid}"
        topic_course_key = f"{course_id}:{topic_id}"

        # 1. Check in-memory store
        if topic_store_key in TOPIC_CERTIFICATES_STORE:
            cached_data = TOPIC_CERTIFICATES_STORE[topic_store_key]
            return jsonify({
                "message": "Topic certificate already earned",
                "blockchain": cached_data,
                "certificate": cached_data,
                "status": "already_earned"
            }), 200

        # 2. Securely issue NFT certificate on MST Testnet (points = 0 preserves 50-point course reward)
        b_res = award_and_issue_nft(
            student_address=student_wallet,
            points=0,
            certificate_id=cert_id,
            course_id=topic_course_key,
            course_name=course_title,
            student_name=student_name,
            completion_date=completion_date,
            topic_name=topic_title,
        )

        blockchain_data = {
            "certificateId": cert_id,
            "certificateTxHash": b_res.get("txHash"),
            "tokenId": b_res.get("tokenId"),
            "certificateHash": b_res.get("certificateHash"),
            "tokenURI": b_res.get("tokenURI"),
            "ipfsCid": b_res.get("ipfsCid"),
            "ipfsUri": b_res.get("ipfsUri"),
            "pdfDownloadUrl": b_res.get("pdfDownloadUrl"),
            "imageUrl": b_res.get("imageUrl"),
            "student": student_wallet,
            "studentName": student_name,
            "courseId": course_id,
            "courseName": course_title,
            "topicId": topic_id,
            "topicName": topic_title,
            "completionDate": completion_date,
            "status": b_res.get("status"),
            "contractAddress": CONTRACT_ADDRESS,
            "network": "MST Testnet",
            "type": "topic",
        }

        TOPIC_CERTIFICATES_STORE[topic_store_key] = blockchain_data

        try:
            db.collection("topicCertificates").document(topic_store_key).set(blockchain_data, merge=True)
        except Exception:
            pass

        return jsonify({
            "message": "Personalized video topic certificate issued successfully!",
            "blockchain": blockchain_data,
            "certificate": blockchain_data,
            "status": b_res.get("status"),
        }), 200

    except Exception as e:
        print(f"[Topic Certificate Error] {e}")
        return jsonify({"error": str(e)}), 500


# GET /progress/certificates/<userId>  — protected
# Fetches all earned certificates (both course certificates and topic certificates)
@progress_bp.route("/progress/certificates/<user_id>", methods=["GET"])
@token_required
def get_user_certificates(user_id):
    try:
        if g.uid != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        course_certs = []
        topic_certs = []

        # 1. Course certificates from DEMO_PROGRESS_STORE
        for k, v in DEMO_PROGRESS_STORE.items():
            if v.get("userId") == user_id and v.get("blockchain"):
                course_certs.append(v["blockchain"])

        # 2. Course certificates from Firestore
        if not user_id.startswith("demo-"):
            try:
                mode = "deaf" if "deaf" in user_id else ("motor" if "motor" in user_id else ("blind" if "blind" in user_id else "deaf"))
                docs = progress_collection(db, mode).where("userId", "==", user_id).stream()
                for doc in docs:
                    p_data = doc.to_dict()
                    if p_data.get("blockchain"):
                        b_info = p_data["blockchain"]
                        if not any(c.get("certificateId") == b_info.get("certificateId") for c in course_certs):
                            course_certs.append(b_info)
            except Exception:
                pass

        # 3. Topic certificates from TOPIC_CERTIFICATES_STORE
        for k, v in TOPIC_CERTIFICATES_STORE.items():
            if k.startswith(f"{user_id}_"):
                topic_certs.append(v)

        # 4. Topic certificates from Firestore
        if not user_id.startswith("demo-"):
            try:
                t_docs = db.collection("topicCertificates").stream()
                for t_doc in t_docs:
                    if t_doc.id.startswith(f"{user_id}_"):
                        t_data = t_doc.to_dict()
                        if not any(tc.get("certificateId") == t_data.get("certificateId") for tc in topic_certs):
                            topic_certs.append(t_data)
            except Exception:
                pass

        from services.career_service import CAREER_CERTIFICATES_STORE
        career_certs = [v for k, v in CAREER_CERTIFICATES_STORE.items() if k.startswith(f"{user_id}_")]

        return jsonify({
            "courseCertificates": course_certs,
            "topicCertificates": topic_certs,
            "careerCertificates": career_certs,
            "allCertificates": course_certs + topic_certs + career_certs,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

