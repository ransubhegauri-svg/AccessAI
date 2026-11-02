import os
import json
import base64
from flask import Blueprint, send_file, jsonify, request
from services.certificate_generator import (
    generate_certificate,
    OUTPUT_DIR,
)
from services.blockchain_service import (
    verify_onchain_certificate,
    CONTRACT_ADDRESS,
)

certificates_bp = Blueprint("certificates", __name__)


def _ensure_certificate_files(cert_id: str) -> dict:
    """
    Ensures that the PNG and PDF files exist for a given certificate ID.
    If not yet generated, queries on-chain/database details and dynamically renders them.
    """
    clean_id = "".join(c for c in cert_id if c.isalnum() or c in "-_")
    pdf_path = os.path.join(OUTPUT_DIR, f"{clean_id}.pdf")
    png_path = os.path.join(OUTPUT_DIR, f"{clean_id}.png")

    if os.path.exists(pdf_path) and os.path.exists(png_path):
        return {"clean_id": clean_id, "pdf_path": pdf_path, "png_path": png_path}

    # Query on-chain data to populate dynamically
    onchain = verify_onchain_certificate(cert_id)
    course_name = onchain.get("courseId") or "Course Completion"
    token_id = onchain.get("tokenId")
    student_addr = onchain.get("student")
    token_uri = onchain.get("tokenURI") or ""
    
    extracted_student_name = None
    extracted_course_name = None
    extracted_topic_name = None

    meta_json = {}
    if token_uri.startswith("data:application/json;base64,"):
        try:
            raw_b64 = token_uri.replace("data:application/json;base64,", "")
            meta_json = json.loads(base64.b64decode(raw_b64).decode("utf-8"))
            for attr in meta_json.get("attributes", []):
                if attr.get("trait_type") == "Student Name":
                    extracted_student_name = attr.get("value")
                elif attr.get("trait_type") == "Course Title" or attr.get("trait_type") == "Degree Title":
                    extracted_course_name = attr.get("value")
                elif attr.get("trait_type") == "Topic Title":
                    extracted_topic_name = attr.get("value")
        except Exception:
            pass

    student_display_name = extracted_student_name or (f"Student ({student_addr[:6]}...{student_addr[-4:]})" if student_addr else "Vrusha Goyal")
    course_display_name = extracted_course_name or (course_name.split(":")[0].replace("-", " ").title() if ":" in course_name else course_name.replace("-", " ").title())
    
    # Check if this is an Honors Degree Certificate
    if "degree" in clean_id.lower() or course_name.startswith("degree:") or clean_id.startswith("CERT-DEGREE"):
        from services.certificate_generator import generate_degree_certificate
        degree_specializations = meta_json.get("specializations", [
            "Full-Stack Web Engineering Mastery",
            "Python Software Development & Systems",
            "Artificial Intelligence & Machine Learning",
            "Accessible Media & American Sign Language",
            "Database Systems & Distributed Ledger Technology"
        ])
        honors_title = meta_json.get("degree_title", "Bachelor of Accessible Software Engineering & Applied AI")
        res = generate_degree_certificate(
            student_name=student_display_name,
            degree_title=honors_title,
            completed_specializations=degree_specializations,
            certificate_id=cert_id,
            tx_hash=onchain.get("transactionHash") or "On-Chain Verified on MST",
            token_id=token_id if token_id else 1,
            issue_date=meta_json.get("issue_date")
        )
        return {"clean_id": clean_id, "pdf_path": res["pdfPath"], "png_path": res["imagePath"]}

    # Check if this is a Career Certificate
    if "career" in clean_id.lower() or course_name.startswith("career:"):
        from services.certificate_generator import generate_career_certificate
        career_courses = meta_json.get("completed_courses", [
            "1. Architecture & Accessible Semantics",
            "2. Modern Layouts & Design Systems",
            "3. Logic & Asynchronous Programming",
            "4. Component Architecture & Engineering",
            "5. APIs & Production Deployment"
        ])
        career_skills = meta_json.get("skills", [
            "Technical Problem Solving",
            "Accessible Software Architecture",
            "Applied System Design"
        ])
        res = generate_career_certificate(
            student_name=student_display_name,
            career_path_title=course_display_name,
            completed_courses=career_courses,
            skills_acquired=career_skills,
            certificate_id=cert_id,
            tx_hash="On-Chain Verified on MST",
            token_id=token_id if token_id else 1,
            career_statement=meta_json.get("career_statement"),
        )
        return {"clean_id": clean_id, "pdf_path": res["pdfPath"], "png_path": res["imagePath"]}

    # Standard course/topic certificate
    res = generate_certificate(
        student_name=student_display_name,
        course_name=course_display_name,
        certificate_id=cert_id,
        tx_hash="On-Chain Verified on MST",
        token_id=token_id if token_id else 1,
        topic_name=extracted_topic_name,
    )
    return {"clean_id": clean_id, "pdf_path": res["pdfPath"], "png_path": res["imagePath"]}


@certificates_bp.route("/certificate/download/<cert_id>", methods=["GET"])
def download_certificate(cert_id):
    """
    Downloads the dynamically generated personalized PDF certificate.
    """
    try:
        files = _ensure_certificate_files(cert_id)
        return send_file(
            files["pdf_path"],
            as_attachment=True,
            download_name=f"AccessAI_Certificate_{files['clean_id']}.pdf",
            mimetype="application/pdf"
        )
    except Exception as e:
        return jsonify({"error": f"Failed to download certificate: {str(e)}"}), 500


@certificates_bp.route("/certificate/view/<cert_id>", methods=["GET"])
def view_certificate_pdf(cert_id):
    """
    Serves the PDF inline for viewing in the browser or an iframe.
    """
    try:
        files = _ensure_certificate_files(cert_id)
        return send_file(files["pdf_path"], mimetype="application/pdf")
    except Exception as e:
        return jsonify({"error": f"Failed to view certificate: {str(e)}"}), 500


@certificates_bp.route("/certificate/image/<cert_id>", methods=["GET"])
def view_certificate_image(cert_id):
    """
    Serves the certificate PNG image.
    """
    try:
        files = _ensure_certificate_files(cert_id)
        return send_file(files["png_path"], mimetype="image/png")
    except Exception as e:
        return jsonify({"error": f"Failed to load certificate image: {str(e)}"}), 500


@certificates_bp.route("/certificate/generate", methods=["POST"])
def generate_custom_certificate():
    """
    Utility endpoint to manually generate/regenerate a certificate.
    """
    try:
        data = request.get_json() or {}
        res = generate_certificate(
            student_name=data.get("studentName", "Vrusha Goyal"),
            course_name=data.get("courseName", "Introduction to Artificial Intelligence"),
            certificate_id=data.get("certificateId", "CERT-DEMO-001"),
            tx_hash=data.get("txHash"),
            token_id=data.get("tokenId"),
            completion_date=data.get("completionDate"),
            topic_name=data.get("topicName"),
        )
        return jsonify({
            "message": "Certificate generated successfully",
            "certificateId": res["certificateId"],
            "pdfHash": res["pdfHash"],
            "ipfsCid": res["ipfsCid"],
            "ipfsUri": res["ipfsUri"],
            "pdfDownloadUrl": f"/certificate/download/{res['certificateId']}",
            "imageUrl": f"/certificate/image/{res['certificateId']}",
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
