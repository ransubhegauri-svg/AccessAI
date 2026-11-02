import os
import sys
import json
import time
import hashlib
import requests
from services.blockchain_service import w3, verify_onchain_certificate

BASE_URL = "http://127.0.0.1:5000"

def test_career_program():
    print("=" * 70)
    print("ACCESS AI: CAREER CERTIFICATE PROGRAM E2E TEST (MST TESTNET)")
    print("=" * 70)

    # 1. Test GET /career/paths
    print("\n--- Test 1: Fetching Career Learning Paths ---")
    resp_paths = requests.get(f"{BASE_URL}/career/paths")
    assert resp_paths.status_code == 200, f"Failed to get paths: {resp_paths.text}"
    paths = resp_paths.json().get("careerPaths", [])
    print(f"Total Career Learning Paths: {len(paths)}")
    for p in paths:
        print(f" - [{p['id']}] {p['title']} ({len(p['courses'])} courses, {len(p['skills'])} skills)")
    assert len(paths) == 3, f"Expected 3 career paths, got {len(paths)}"
    for p in paths:
        assert len(p["courses"]) == 5, f"Path {p['id']} does not have 5 courses!"
        assert len(p["skills"]) >= 5, f"Path {p['id']} does not have required skills!"
    print("[PASS] Test 1 Passed: 3 Career Paths with 5 courses and skills validated successfully!")

    # 2. Test Step-by-Step Progress & Completion for Student "Vrusha Goyal"
    print("\n--- Test 2: Progress Tracking & Completing 5 Courses in Web Development ---")
    user_id = f"demo-uid-career-v{int(time.time())}"
    student_wallet = w3.eth.account.create().address
    print(f"Test Student ID: {user_id}")
    print(f"Test Student Wallet: {student_wallet}")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer demo-token-{user_id}"
    }
    web_courses = ["web-101", "web-102", "web-103", "web-104", "web-105"]

    for idx, c_id in enumerate(web_courses):
        payload = {
            "userId": user_id,
            "pathId": "career-web-dev",
            "courseId": c_id,
            "studentName": "Vrusha Goyal",
            "walletAddress": student_wallet,
        }
        resp = requests.post(f"{BASE_URL}/career/complete-course", headers=headers, json=payload)
        assert resp.status_code == 200, f"Failed completing course {c_id}: {resp.text}"
        data = resp.json()
        print(f"Completed Course {idx+1}/5 [{c_id}]: {data.get('completedCount')}/5 completed ({data.get('completionPercentage')}%)")

        if idx < 4:
            assert data.get("isPathCompleted") is False, "Path marked completed prematurely!"
        else:
            assert data.get("isPathCompleted") is True, "Path not marked completed after 5 courses!"
            cert = data.get("careerCertificate") or data.get("blockchain")
            assert cert is not None, "Career certificate not issued after 5th course!"

            print("\n--- Test 3: Validating Minted Career Certificate ---")
            cert_id = cert.get("certificateId")
            tx_hash = cert.get("certificateTxHash")
            token_id = cert.get("tokenId")
            pdf_hash = cert.get("certificateHash")
            student_name = cert.get("studentName")
            path_title = cert.get("careerPathTitle")
            statement = cert.get("careerStatement")

            print(f"Career Certificate ID: {cert_id}")
            print(f"Recipient Student Name: '{student_name}'")
            print(f"Career Path Title: '{path_title}'")
            print(f"NFT Token ID: #{token_id}")
            print(f"Transaction Hash: {tx_hash}")
            print(f"Certificate SHA-256 Hash: {pdf_hash}")
            print(f"Career Statement: {statement}")

            assert student_name == "Vrusha Goyal", f"Expected 'Vrusha Goyal', got '{student_name}'"
            assert "Aaradhya" not in student_name, "Forbidden name 'Aaradhya' found in career certificate!"
            assert "career-readiness" in statement.lower() or "readiness" in statement.lower(), "Missing career-readiness description!"
            assert "guarantee" not in statement.lower(), "Job guarantee found in career statement!"
            print("[PASS] Test 2 & 3 Passed: 5 courses tracked and Career Readiness Certificate minted on MST Testnet!")

    # 4. Test PDF SHA-256 Hash Consistency
    print("\n--- Test 4: Verifying Career Certificate PDF SHA-256 Hash ---")
    pdf_resp = requests.get(f"{BASE_URL}/certificate/download/{cert_id}")
    assert pdf_resp.status_code == 200, "Failed to download Career Certificate PDF"
    calc_hash = "0x" + hashlib.sha256(pdf_resp.content).hexdigest()
    print(f"Downloaded PDF Bytes: {len(pdf_resp.content)} bytes")
    print(f"Computed PDF Hash:  {calc_hash}")
    print(f"On-Chain Hash:      {pdf_hash}")
    assert calc_hash.lower() == pdf_hash.lower(), f"Hash mismatch! {calc_hash} != {pdf_hash}"
    print("[PASS] Test 4 Passed: Career Certificate PDF SHA-256 hash matches blockchain record bit-for-bit!")

    # 5. Test Duplicate Prevention
    print("\n--- Test 5: Career Certificate Duplicate Prevention ---")
    claim_payload = {
        "userId": user_id,
        "pathId": "career-web-dev",
        "studentName": "Vrusha Goyal",
        "walletAddress": student_wallet,
    }
    resp_claim = requests.post(f"{BASE_URL}/career/claim", headers=headers, json=claim_payload)
    print(f"Duplicate Claim Status Code: {resp_claim.status_code}")
    claim_data = resp_claim.json()
    assert claim_data.get("status") in ["already_earned", "already_exists", "success"], f"Unexpected claim status: {claim_data}"
    dup_cert = claim_data.get("certificate") or claim_data.get("blockchain")
    assert dup_cert.get("certificateId") == cert_id, "Certificate ID changed on duplicate claim!"
    print("[PASS] Test 5 Passed: Duplicate career certificate prevented for same student & path!")

    # 6. Test On-Chain Verification Query
    print("\n--- Test 6: Verifying Career Certificate On-Chain ---")
    onchain = verify_onchain_certificate(cert_id)
    print(f"On-Chain Exists: {onchain.get('exists')}")
    print(f"On-Chain Valid: {onchain.get('isValid')}")
    print(f"On-Chain Student: {onchain.get('student')}")
    print(f"On-Chain Token ID: {onchain.get('tokenId')}")
    print(f"On-Chain Hash: {onchain.get('certificateHash')}")
    assert onchain.get("exists") is True, "Career certificate does not exist on-chain!"
    assert onchain.get("isValid") is True, "Career certificate is not valid on-chain!"
    assert onchain.get("certificateHash").lower() == pdf_hash.lower(), "On-chain hash mismatch!"
    print("[PASS] Test 6 Passed: Career Certificate successfully verified on MST Testnet smart contract!")

    # 7. Test User Progress Endpoint & Catalog
    print("\n--- Test 7: Verifying Career Progress Endpoint ---")
    prog_resp = requests.get(f"{BASE_URL}/career/progress/{user_id}", headers=headers)
    assert prog_resp.status_code == 200
    prog_data = prog_resp.json()
    web_prog = next((p for p in prog_data.get("careerProgress", []) if p["id"] == "career-web-dev"), None)
    assert web_prog is not None, "Web development path not in progress response!"
    print(f"Career Path '{web_prog['title']}': {web_prog['completedCount']}/5 Completed ({web_prog['completionPercentage']}%)")
    assert web_prog["completedCount"] == 5, f"Expected 5 completed, got {web_prog['completedCount']}"
    assert web_prog["isCompleted"] is True, "Path not marked completed in progress query!"
    assert web_prog["certificate"] is not None, "Certificate not attached to completed path!"
    print("[PASS] Test 7 Passed: Real-time progress tracker reflects all 5 courses completed with certificate!")

    print("\n" + "=" * 70)
    print("ALL 7 CAREER PROGRAM TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    test_career_program()
