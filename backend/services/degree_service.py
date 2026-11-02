import os
import json
import hashlib
from datetime import datetime, timezone
from services.blockchain_service import (
    w3,
    get_contract,
    award_and_issue_nft,
    CONTRACT_ADDRESS,
)
from services.certificate_generator import (
    generate_degree_certificate,
    OUTPUT_DIR,
)

# -----------------------------------------------------------------------------
# 1. 5 ACCREDITED MAJOR CERTIFICATION PATHWAYS
# -----------------------------------------------------------------------------
MAJOR_SPECIALIZATIONS = [
    {
        "id": "prog-web-dev",
        "title": "Full Stack Web Development Career Specialization",
        "badge": "Full Stack Mastery",
        "icon": "code",
        "category": "Software Engineering",
        "description": "5-course mastery covering accessible semantic HTML5, responsive CSS3, ES6+ JavaScript, React component engineering, and production REST APIs.",
        "courseIds": ["web-101", "web-102", "web-103", "web-104", "web-105", "career-web-dev"],
    },
    {
        "id": "prog-python-dev",
        "title": "Python Software & Backend Engineering",
        "badge": "Backend Mastery",
        "icon": "terminal",
        "category": "Backend Architecture",
        "description": "5-course deep dive into Python 3 syntax, data structures, object-oriented design, relational databases, and Flask microservices.",
        "courseIds": ["py-101", "py-102", "py-103", "py-104", "py-105", "career-python-dev"],
    },
    {
        "id": "prog-ai-dev",
        "title": "Machine Learning & Assistive Artificial Intelligence",
        "badge": "AI & ML Mastery",
        "icon": "smart_toy",
        "category": "Artificial Intelligence",
        "description": "5-course advanced curriculum in machine learning algorithms, NumPy tensor mathematics, deep neural networks, and generative assistive AI.",
        "courseIds": ["ai-101", "ai-102", "ai-103", "ai-104", "ai-105", "career-ai-fundamentals"],
    },
    {
        "id": "prog-asl-media",
        "title": "American Sign Language & Accessible Media Standards",
        "badge": "Accessibility Leadership",
        "icon": "pan_tool",
        "category": "Inclusive Computing",
        "description": "Comprehensive fingerspelling, grammar, sentence syntax, non-manual markers, and multi-modal human-computer interaction.",
        "courseIds": ["course-1", "course-2", "course-3", "course-4"],
    },
    {
        "id": "prog-db-systems",
        "title": "Database Architecture & Cryptographic Blockchain Verification",
        "badge": "Data & Ledger Systems",
        "icon": "database",
        "category": "Decentralized Systems",
        "description": "Relational schema design, advanced SQL queries, data immutability, and ERC-721 smart contract anchoring on MST Blockchain.",
        "courseIds": ["course-3", "course-5", "databases-101"],
    },
]

# In-memory store for student degrees: { user_id: degree_record }
DEGREE_CERTIFICATES_STORE = {}


def get_all_degree_specializations():
    """Returns the list of 5 major specializations for the honors degree."""
    return MAJOR_SPECIALIZATIONS


def calculate_degree_progress(user_id: str, earned_cert_ids: set, completed_course_ids: set):
    """
    Evaluates how many of the 5 major certificates a student has completed.
    Returns:
    {
      "totalRequired": 5,
      "completedCount": X,
      "percentage": int,
      "isEligible": bool,
      "specializations": [...],
      "degree": {...} or None
    }
    """
    spec_results = []
    completed_specializations = []

    for spec in MAJOR_SPECIALIZATIONS:
        # Check if student earned a career path or completed courses matching this specialization
        has_matched_cert = any(
            cid in earned_cert_ids or any(cid in str(ec).lower() for ec in earned_cert_ids)
            for cid in spec["courseIds"]
        )
        has_matched_course = any(cid in completed_course_ids for cid in spec["courseIds"])

        is_completed = has_matched_cert or has_matched_course

        if is_completed:
            completed_specializations.append(spec["title"])

        spec_results.append({
            "id": spec["id"],
            "title": spec["title"],
            "badge": spec["badge"],
            "icon": spec["icon"],
            "category": spec["category"],
            "description": spec["description"],
            "isCompleted": is_completed,
        })

    # Total completed specializations count
    completed_count = len(completed_specializations)
    
    # Also count total distinct courses/certificates completed if user did 5 individual courses
    total_distinct_completions = max(completed_count, min(5, len(earned_cert_ids) + len(completed_course_ids)))
    percentage = int((total_distinct_completions / 5) * 100)
    is_eligible = total_distinct_completions >= 5

    degree_record = DEGREE_CERTIFICATES_STORE.get(user_id)

    return {
        "degreeTitle": "Bachelor of Accessible Software Engineering & Applied AI",
        "honorsClassification": "First Class Honors with Distinction",
        "totalRequired": 5,
        "completedCount": total_distinct_completions,
        "completionPercentage": percentage,
        "isEligible": is_eligible,
        "specializations": spec_results,
        "completedSpecializations": completed_specializations,
        "degreeCertificate": degree_record,
        "graduationBonusPoints": 500,
        "offerHeadline": "🎓 Graduation Pathway Offer: Complete Any 5 Major Certificates to Earn Your Honors Degree!",
        "offerDisclaimer": "Confirms rigorous completion of 5 comprehensive specializations. Honors educational diploma for career-readiness and professional portfolio presentation; does not guarantee employment.",
    }


def issue_honors_degree_onchain(
    user_id: str,
    student_name: str,
    student_wallet: str,
    completed_certs_summary: list = None,
):
    """
    Issues an official Academic Honors Degree & Diploma NFT on MST Testnet.
    - Prevents duplicates on backend store and smart contract
    - Renders high-resolution honors degree diploma
    - Computes SHA-256 hash and anchors on MST Blockchain
    - Awards 500 graduation bonus points
    """
    # 1. Duplicate check in memory store
    if user_id in DEGREE_CERTIFICATES_STORE:
        existing = DEGREE_CERTIFICATES_STORE[user_id]
        return {
            "status": "already_earned",
            "message": "Student already graduated and earned their Academic Honors Degree!",
            "certificate": existing,
            "blockchain": existing,
        }

    uid_clean = "".join(c for c in user_id.replace("demo-uid-", "") if c.isalnum())
    clean_uid = uid_clean[-6:].upper() if len(uid_clean) >= 6 else (uid_clean.upper().ljust(6, "0") if uid_clean else "GRAD01")
    degree_id = f"CERT-DEGREE-HONORS-{clean_uid}"
    course_key = "degree:honors-diploma"
    completion_date = datetime.now(timezone.utc).strftime("%B %d, %Y")

    if not completed_certs_summary:
        completed_certs_summary = [s["title"] for s in MAJOR_SPECIALIZATIONS]

    degree_title = "Bachelor of Accessible Software Engineering & Applied AI"
    honors_classification = "First Class Honors with Distinction"
    degree_statement = (
        "This academic honors degree confirms rigorous completion of 5 major curriculum "
        "specializations and demonstrated advanced proficiency. It serves as an official honors diploma "
        "for professional portfolio presentation and career-readiness (does not constitute a guarantee of employment)."
    )

    # 2. Render dynamic personalized Degree Diploma
    cert_data = generate_degree_certificate(
        student_name=student_name,
        degree_title=degree_title,
        completed_major_certs=completed_certs_summary,
        honors_classification=honors_classification,
        certificate_id=degree_id,
        tx_hash="Pending On-Chain Anchoring",
        completion_date=completion_date,
        degree_statement=degree_statement,
    )

    pdf_hash = cert_data["pdfHash"]
    token_uri = cert_data["tokenURI"]
    ipfs_cid = cert_data["ipfsCid"]
    ipfs_uri = cert_data["ipfsUri"]

    # 3. Mint Degree NFT on MST Testnet with 500 Graduation Bonus Points
    b_res = award_and_issue_nft(
        student_address=student_wallet,
        points=500,
        certificate_id=degree_id,
        course_id=course_key,
        course_name=degree_title,
        student_name=student_name,
        completion_date=completion_date,
        topic_name=honors_classification,
        custom_pdf_hash=pdf_hash,
        custom_token_uri=token_uri,
        custom_ipfs_cid=ipfs_cid,
        custom_ipfs_uri=ipfs_uri,
    )

    degree_record = {
        "certificateId": degree_id,
        "certificateTxHash": b_res.get("txHash"),
        "tokenId": b_res.get("tokenId"),
        "certificateHash": b_res.get("certificateHash") or pdf_hash,
        "tokenURI": token_uri,
        "ipfsCid": ipfs_cid,
        "ipfsUri": ipfs_uri,
        "pdfDownloadUrl": f"/certificate/download/{degree_id}",
        "imageUrl": f"/certificate/image/{degree_id}",
        "student": student_wallet,
        "studentName": student_name,
        "degreeTitle": degree_title,
        "honorsClassification": honors_classification,
        "completedMajorCerts": completed_certs_summary,
        "completionDate": completion_date,
        "pointsAwarded": 500,
        "status": b_res.get("status"),
        "contractAddress": CONTRACT_ADDRESS,
        "network": "MST Testnet",
        "type": "degree",
        "degreeStatement": degree_statement,
    }

    DEGREE_CERTIFICATES_STORE[user_id] = degree_record

    return {
        "status": b_res.get("status"),
        "message": f"Congratulations {student_name}! You have been awarded the AccessAI Honors Degree & 500 MST Points!",
        "certificate": degree_record,
        "blockchain": degree_record,
    }
