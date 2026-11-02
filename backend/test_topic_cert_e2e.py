import os
import sys
import json
import hashlib
import requests

BASE_URL = "http://127.0.0.1:5000"

def test_e2e():
    print("==================================================")
    print("ACCESS AI: TOPIC CERTIFICATE & NAME INTEGRITY E2E TEST")
    print("==================================================")

    # 1. Test POST /progress/topic with student "Vrusha Goyal"
    print("\n--- Test 1: Issuing Personalized Topic Certificate for 'Vrusha Goyal' ---")
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer demo-token-deaf"
    }
    payload_vrusha = {
        "userId": "demo-uid-deaf",
        "courseId": "course-1",
        "courseTitle": "American Sign Language Alphabet",
        "topicId": "les-1-1",
        "topicTitle": "Introduction to Fingerspelling",
        "studentName": "Vrusha Goyal",
        "walletAddress": "0x1111111111111111111111111111111111111111"
    }

    resp = requests.post(f"{BASE_URL}/progress/topic", headers=headers, json=payload_vrusha)
    print(f"Status Code: {resp.status_code}")
    data = resp.json()
    cert = data.get("blockchain") or data.get("certificate")
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {data}"
    assert cert is not None, f"No certificate returned: {data}"
    
    student_name = cert.get("studentName")
    print(f"Generated Certificate Student Name: '{student_name}'")
    assert student_name == "Vrusha Goyal", f"Student name mismatch! Expected 'Vrusha Goyal', got '{student_name}'"
    assert "Aaradhya" not in student_name, f"Forbidden name 'Aaradhya' found in certificate: '{student_name}'"
    
    cert_id = cert.get("certificateId")
    cert_hash = cert.get("certificateHash")
    token_id = cert.get("tokenId")
    topic_name = cert.get("topicName")
    course_name = cert.get("courseName")

    print(f"Certificate ID: {cert_id}")
    print(f"Token ID: #{token_id}")
    print(f"Course Name: {course_name}")
    print(f"Topic Name: {topic_name}")
    print(f"Certificate Hash: {cert_hash}")
    print("[PASS] Test 1 Passed: Personalized topic certificate successfully issued with student name 'Vrusha Goyal'!")

    # 2. Test PDF SHA-256 Hash Matching
    print("\n--- Test 2: Verifying PDF SHA-256 Hash Consistency ---")
    pdf_resp = requests.get(f"{BASE_URL}/certificate/download/{cert_id}")
    assert pdf_resp.status_code == 200, f"Failed to download PDF: {pdf_resp.status_code}"
    
    computed_pdf_hash = "0x" + hashlib.sha256(pdf_resp.content).hexdigest()
    print(f"Downloaded PDF Bytes: {len(pdf_resp.content)} bytes")
    print(f"Computed PDF Hash:  {computed_pdf_hash}")
    print(f"Certificate Hash:   {cert_hash}")
    assert computed_pdf_hash.lower() == cert_hash.lower(), f"Hash mismatch! {computed_pdf_hash} != {cert_hash}"
    print("[PASS] Test 2 Passed: Downloaded PDF SHA-256 hash matches blockchain certificate hash exactly!")

    # 3. Test Duplicate Prevention for same student and topic
    print("\n--- Test 3: Duplicate Certificate Prevention ---")
    resp_dup = requests.post(f"{BASE_URL}/progress/topic", headers=headers, json=payload_vrusha)
    print(f"Duplicate Request Status Code: {resp_dup.status_code}")
    data_dup = resp_dup.json()
    print(f"Duplicate Message: {data_dup.get('message')}")
    print(f"Duplicate Status: {data_dup.get('status')}")
    assert data_dup.get("status") in ["already_earned", "already_exists"], f"Expected duplicate prevention, got: {data_dup}"
    dup_cert = data_dup.get("blockchain") or data_dup.get("certificate")
    assert dup_cert.get("certificateId") == cert_id, "Certificate ID changed on duplicate call!"
    print("[PASS] Test 3 Passed: Duplicate certificate successfully prevented for same student & topic!")

    # 4. Test Name Isolation with a different user (e.g. Guest User: Vrusha Goyal vs Registered User: Priya Patel)
    print("\n--- Test 4: Testing Multiple Different Users for Name Isolation ---")
    payload_user2 = {
        "userId": "demo-uid-user2",
        "courseId": "course-1",
        "courseTitle": "American Sign Language Alphabet",
        "topicId": "les-1-2",
        "topicTitle": "Numbers & Counting Signs",
        "studentName": "Priya Patel",
        "walletAddress": "0x2222222222222222222222222222222222222222"
    }
    headers_user2 = {
        "Content-Type": "application/json",
        "Authorization": "Bearer demo-token-user2"
    }
    resp_user2 = requests.post(f"{BASE_URL}/progress/topic", headers=headers_user2, json=payload_user2)
    assert resp_user2.status_code == 200, f"User 2 request failed: {resp_user2.json()}"
    cert_user2 = resp_user2.json().get("blockchain")
    print(f"User 2 Certificate Recipient: '{cert_user2.get('studentName')}'")
    assert cert_user2.get("studentName") == "Priya Patel", f"Expected 'Priya Patel', got '{cert_user2.get('studentName')}'"
    assert cert_user2.get("certificateId") != cert_id, "Certificate ID collided!"
    print("[PASS] Test 4 Passed: Multiple different users receive their own distinct certificates with correct names!")

    # 5. Test GET /progress/certificates/<userId>
    print("\n--- Test 5: Fetching User's Earned Certificates for Profile Page ---")
    resp_certs = requests.get(f"{BASE_URL}/progress/certificates/demo-uid-deaf", headers=headers)
    assert resp_certs.status_code == 200, f"Failed to get certificates: {resp_certs.json()}"
    user_certs = resp_certs.json()
    topic_certs = user_certs.get("topicCertificates", [])
    print(f"Found {len(topic_certs)} topic certificate(s) for user 'demo-uid-deaf'")
    assert any(c.get("certificateId") == cert_id for c in topic_certs), "Minted topic certificate not in user certificates list!"
    print("[PASS] Test 5 Passed: Profile certificate retrieval returns user's earned topic certificates!")

    # 6. Verify On-Chain Query
    print("\n--- Test 6: Verifying Certificate on MST Testnet Smart Contract ---")
    from services.blockchain_service import verify_onchain_certificate
    onchain_data = verify_onchain_certificate(cert_id)
    print(f"On-Chain Exists: {onchain_data.get('exists')}")
    print(f"On-Chain Valid: {onchain_data.get('isValid')}")
    print(f"On-Chain Student: {onchain_data.get('student')}")
    print(f"On-Chain Token ID: {onchain_data.get('tokenId')}")
    print(f"On-Chain Hash: {onchain_data.get('certificateHash')}")
    assert onchain_data.get("exists") == True, "Certificate does not exist on-chain!"
    assert onchain_data.get("isValid") == True, "Certificate is not valid on-chain!"
    assert onchain_data.get("certificateHash").lower() == cert_hash.lower(), "On-chain hash does not match!"
    print("[PASS] Test 6 Passed: Certificate is successfully verified directly against MST Testnet smart contract!")

    print("\n==================================================")
    print("ALL 6 TESTS PASSED WITH 100% SUCCESS!")
    print("==================================================")

if __name__ == "__main__":
    test_e2e()
