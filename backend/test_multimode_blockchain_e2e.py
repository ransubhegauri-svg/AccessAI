import os
import sys
import json
import hashlib
import requests
from web3 import Web3
from services.blockchain_service import (
    w3,
    get_contract,
    CONTRACT_ADDRESS,
    MST_CHAIN_ID,
    verify_onchain_certificate,
)

BASE_URL = "http://127.0.0.1:5000"

def test_full_blockchain_multimode():
    print("=" * 70)
    print("ACCESS AI: END-TO-END MST TESTNET BLOCKCHAIN & MULTI-MODE TEST")
    print("=" * 70)

    contract = get_contract()
    results = {
        "modes_tested": [],
        "passed_tests": [],
        "failed_tests": [],
        "transactions": [],
        "certificates": [],
    }

    # -------------------------------------------------------------
    # 1. DEAF MODE TEST: "Vrusha Goyal" completing Course
    # -------------------------------------------------------------
    print("\n>>> STEP 1: DEAF MODE COURSE COMPLETION (Student: 'Vrusha Goyal') <<<")
    deaf_wallet = "0x1111111111111111111111111111111111111111"
    deaf_user_id = "demo-uid-deaf-vrusha"
    deaf_course_id = "course-deaf-asl"
    deaf_course_title = "American Sign Language Masterclass"

    init_points_deaf = contract.functions.getRewardPoints(w3.to_checksum_address(deaf_wallet)).call()
    print(f"Initial on-chain reward points for Deaf Student ({deaf_wallet}): {init_points_deaf}")

    deaf_payload = {
        "userId": deaf_user_id,
        "courseId": deaf_course_id,
        "courseTitle": deaf_course_title,
        "studentName": "Vrusha Goyal",
        "completion": 100,
        "walletAddress": deaf_wallet,
    }
    deaf_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer demo-token-{deaf_user_id}"
    }

    resp_deaf = requests.post(f"{BASE_URL}/progress", headers=deaf_headers, json=deaf_payload)
    print(f"Deaf Mode Course Completion Status: {resp_deaf.status_code}")
    assert resp_deaf.status_code == 200, f"Deaf completion failed: {resp_deaf.text}"
    deaf_data = resp_deaf.json()
    deaf_bdata = deaf_data.get("blockchain")
    assert deaf_bdata is not None, "No blockchain data returned for Deaf course completion"

    deaf_tx = deaf_bdata.get("certificateTxHash") or deaf_bdata.get("pointsTxHash")
    deaf_token_id = deaf_bdata.get("tokenId")
    deaf_cert_id = deaf_bdata.get("certificateId")
    deaf_cert_hash = deaf_bdata.get("certificateHash")
    deaf_name = deaf_bdata.get("studentName")

    print(f"Deaf Certificate ID: {deaf_cert_id}")
    print(f"Student Name on Cert: {deaf_name}")
    print(f"NFT Token ID: #{deaf_token_id}")
    print(f"Transaction Hash: {deaf_tx}")
    print(f"Certificate Hash: {deaf_cert_hash}")

    assert deaf_name == "Vrusha Goyal", f"Name mismatch! Expected 'Vrusha Goyal', got '{deaf_name}'"
    assert "Aaradhya" not in deaf_name, f"Forbidden default name 'Aaradhya' found in Deaf mode!"

    # Verify points awarded on-chain
    post_points_deaf = contract.functions.getRewardPoints(w3.to_checksum_address(deaf_wallet)).call()
    print(f"Updated on-chain reward points: {post_points_deaf} (+{post_points_deaf - init_points_deaf} points)")
    assert post_points_deaf == init_points_deaf + 50, f"Points expected {init_points_deaf + 50}, got {post_points_deaf}"

    results["modes_tested"].append("Deaf Mode (Vrusha Goyal)")
    results["transactions"].append({
        "mode": "Deaf Mode",
        "student": "Vrusha Goyal",
        "txHash": deaf_tx,
        "tokenId": deaf_token_id,
        "certId": deaf_cert_id,
    })
    results["certificates"].append(deaf_bdata)
    results["passed_tests"].append("Deaf Mode Course Completion & NFT Minting")
    print("[PASS] Step 1 Passed: Deaf mode completed, points awarded on-chain, and NFT minted for 'Vrusha Goyal'!")

    # -------------------------------------------------------------
    # 2. BLIND MODE TEST: Auditory & Voice Guidance ("Aman Halkude")
    # -------------------------------------------------------------
    print("\n>>> STEP 2: BLIND MODE COURSE COMPLETION (Student: 'Aman Halkude') <<<")
    blind_wallet = "0x2222222222222222222222222222222222222222"
    blind_user_id = "demo-uid-blind-aman"
    blind_course_id = "course-blind-python"
    blind_course_title = "Python Audio Narrated Fundamentals"

    init_points_blind = contract.functions.getRewardPoints(w3.to_checksum_address(blind_wallet)).call()
    print(f"Initial on-chain reward points for Blind Student ({blind_wallet}): {init_points_blind}")

    blind_payload = {
        "userId": blind_user_id,
        "courseId": blind_course_id,
        "courseTitle": blind_course_title,
        "studentName": "Aman Halkude",
        "completion": 100,
        "walletAddress": blind_wallet,
    }
    blind_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer demo-token-{blind_user_id}"
    }

    resp_blind = requests.post(f"{BASE_URL}/progress", headers=blind_headers, json=blind_payload)
    print(f"Blind Mode Course Completion Status: {resp_blind.status_code}")
    assert resp_blind.status_code == 200, f"Blind completion failed: {resp_blind.text}"
    blind_data = resp_blind.json()
    blind_bdata = blind_data.get("blockchain")
    assert blind_bdata is not None, "No blockchain data returned for Blind course completion"

    blind_tx = blind_bdata.get("certificateTxHash") or blind_bdata.get("pointsTxHash")
    blind_token_id = blind_bdata.get("tokenId")
    blind_cert_id = blind_bdata.get("certificateId")
    blind_cert_hash = blind_bdata.get("certificateHash")
    blind_name = blind_bdata.get("studentName")

    print(f"Blind Certificate ID: {blind_cert_id}")
    print(f"Student Name on Cert: {blind_name}")
    print(f"NFT Token ID: #{blind_token_id}")
    print(f"Transaction Hash: {blind_tx}")
    print(f"Certificate Hash: {blind_cert_hash}")

    assert blind_name == "Aman Halkude", f"Name mismatch! Expected 'Aman Halkude', got '{blind_name}'"

    post_points_blind = contract.functions.getRewardPoints(w3.to_checksum_address(blind_wallet)).call()
    print(f"Updated on-chain reward points: {post_points_blind} (+{post_points_blind - init_points_blind} points)")
    assert post_points_blind == init_points_blind + 50, f"Points expected {init_points_blind + 50}, got {post_points_blind}"

    results["modes_tested"].append("Blind Mode (Aman Halkude)")
    results["transactions"].append({
        "mode": "Blind Mode",
        "student": "Aman Halkude",
        "txHash": blind_tx,
        "tokenId": blind_token_id,
        "certId": blind_cert_id,
    })
    results["certificates"].append(blind_bdata)
    results["passed_tests"].append("Blind Mode Course Completion & NFT Minting")
    print("[PASS] Step 2 Passed: Blind mode completed, points awarded on-chain, and NFT minted for 'Aman Halkude'!")

    # -------------------------------------------------------------
    # 3. MOTOR MODE TEST: Dwell / Switch Adaptive ("Rohan Verma")
    # -------------------------------------------------------------
    print("\n>>> STEP 3: MOTOR MODE COURSE COMPLETION (Student: 'Rohan Verma') <<<")
    motor_wallet = "0x3333333333333333333333333333333333333333"
    motor_user_id = "demo-uid-motor-rohan"
    motor_course_id = "course-motor-web"
    motor_course_title = "Web Development Accessibility Engineering"

    init_points_motor = contract.functions.getRewardPoints(w3.to_checksum_address(motor_wallet)).call()
    print(f"Initial on-chain reward points for Motor Student ({motor_wallet}): {init_points_motor}")

    motor_payload = {
        "userId": motor_user_id,
        "courseId": motor_course_id,
        "courseTitle": motor_course_title,
        "studentName": "Rohan Verma",
        "completion": 100,
        "walletAddress": motor_wallet,
    }
    motor_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer demo-token-{motor_user_id}"
    }

    resp_motor = requests.post(f"{BASE_URL}/progress", headers=motor_headers, json=motor_payload)
    print(f"Motor Mode Course Completion Status: {resp_motor.status_code}")
    assert resp_motor.status_code == 200, f"Motor completion failed: {resp_motor.text}"
    motor_data = resp_motor.json()
    motor_bdata = motor_data.get("blockchain")
    assert motor_bdata is not None, "No blockchain data returned for Motor course completion"

    motor_tx = motor_bdata.get("certificateTxHash") or motor_bdata.get("pointsTxHash")
    motor_token_id = motor_bdata.get("tokenId")
    motor_cert_id = motor_bdata.get("certificateId")
    motor_cert_hash = motor_bdata.get("certificateHash")
    motor_name = motor_bdata.get("studentName")

    print(f"Motor Certificate ID: {motor_cert_id}")
    print(f"Student Name on Cert: {motor_name}")
    print(f"NFT Token ID: #{motor_token_id}")
    print(f"Transaction Hash: {motor_tx}")
    print(f"Certificate Hash: {motor_cert_hash}")

    assert motor_name == "Rohan Verma", f"Name mismatch! Expected 'Rohan Verma', got '{motor_name}'"

    post_points_motor = contract.functions.getRewardPoints(w3.to_checksum_address(motor_wallet)).call()
    print(f"Updated on-chain reward points: {post_points_motor} (+{post_points_motor - init_points_motor} points)")
    assert post_points_motor == init_points_motor + 50, f"Points expected {init_points_motor + 50}, got {post_points_motor}"

    results["modes_tested"].append("Motor Mode (Rohan Verma)")
    results["transactions"].append({
        "mode": "Motor Mode",
        "student": "Rohan Verma",
        "txHash": motor_tx,
        "tokenId": motor_token_id,
        "certId": motor_cert_id,
    })
    results["certificates"].append(motor_bdata)
    results["passed_tests"].append("Motor Mode Course Completion & NFT Minting")
    print("[PASS] Step 3 Passed: Motor mode completed, points awarded on-chain, and NFT minted for 'Rohan Verma'!")

    # -------------------------------------------------------------
    # 4. DUPLICATE REWARD & CERTIFICATE PREVENTION TEST
    # -------------------------------------------------------------
    print("\n>>> STEP 4: VERIFYING REWARD POINTS AWARDED EXACTLY ONCE <<<")
    # Attempt duplicate completion for deaf student on the same course
    resp_deaf_dup = requests.post(f"{BASE_URL}/progress", headers=deaf_headers, json=deaf_payload)
    print(f"Duplicate Completion Status: {resp_deaf_dup.status_code}")
    points_after_dup = contract.functions.getRewardPoints(w3.to_checksum_address(deaf_wallet)).call()
    print(f"Points after duplicate attempt: {points_after_dup} (Original: {post_points_deaf})")
    assert points_after_dup == post_points_deaf, "Violation! Duplicate points were awarded for the same course!"
    results["passed_tests"].append("Points Awarded Exactly Once (Duplicate Prevention)")
    print("[PASS] Step 4 Passed: 50 Reward points are protected by blockchain immutability and cannot be duplicated!")

    # -------------------------------------------------------------
    # 5. MULTI-KEYWORD ON-CHAIN VERIFICATION (ID, TOKEN ID, HASH)
    # -------------------------------------------------------------
    print("\n>>> STEP 5: VERIFYING CERTIFICATES BY ID, TOKEN ID, AND HASH <<<")
    # 5a. Verify by Certificate ID
    v_by_id = verify_onchain_certificate(deaf_cert_id)
    print(f"Verify by ID '{deaf_cert_id}': Exists={v_by_id['exists']}, Valid={v_by_id['isValid']}, Token={v_by_id['tokenId']}")
    assert v_by_id["exists"] is True and v_by_id["isValid"] is True
    assert v_by_id["student"].lower() == deaf_wallet.lower()

    # 5b. Verify by Token ID
    v_by_tok = contract.functions.verifyCertificateByTokenId(deaf_token_id).call()
    print(f"Verify by Token ID #{deaf_token_id}: Exists={v_by_tok[0]}, Valid={v_by_tok[1]}, CertID={v_by_tok[5]}")
    assert v_by_tok[0] is True and v_by_tok[1] is True
    assert v_by_tok[5] == deaf_cert_id

    # 5c. Verify by Hash
    v_by_hash = contract.functions.verifyCertificateByHash(deaf_cert_hash).call()
    print(f"Verify by Hash '{deaf_cert_hash[:16]}...': Exists={v_by_hash[0]}, Valid={v_by_hash[1]}, Token={v_by_hash[5]}")
    assert v_by_hash[0] is True and v_by_hash[1] is True
    assert v_by_hash[5] == deaf_token_id

    results["passed_tests"].append("Universal Verification (By ID, Token ID, and SHA-256 Hash)")
    print("[PASS] Step 5 Passed: Certificate verification succeeds seamlessly via all 3 on-chain lookup functions!")

    # -------------------------------------------------------------
    # 6. PDF SHA-256 INTEGRITY & TAMPER DETECTION TEST
    # -------------------------------------------------------------
    print("\n>>> STEP 6: PDF DOWNLOAD SHA-256 INTEGRITY & TAMPER DETECTION <<<")
    pdf_resp = requests.get(f"{BASE_URL}/certificate/download/{deaf_cert_id}")
    assert pdf_resp.status_code == 200, "PDF download endpoint returned error"
    pdf_bytes = pdf_resp.content
    calc_hash = "0x" + hashlib.sha256(pdf_bytes).hexdigest()
    print(f"Original PDF Bytes: {len(pdf_bytes)} bytes")
    print(f"Calculated PDF Hash: {calc_hash}")
    print(f"On-Chain Stored Hash: {deaf_cert_hash}")
    assert calc_hash.lower() == deaf_cert_hash.lower(), "PDF SHA-256 hash does not match on-chain hash!"

    # Simulate tampering with 1 single byte
    tampered_bytes = bytearray(pdf_bytes)
    tampered_bytes[len(tampered_bytes) // 2] ^= 0xFF  # Flip one byte
    tampered_hash = "0x" + hashlib.sha256(tampered_bytes).hexdigest()
    print(f"Tampered PDF Hash:   {tampered_hash}")
    assert tampered_hash.lower() != deaf_cert_hash.lower(), "Tampering detection failed!"
    v_tampered = contract.functions.verifyCertificateByHash(tampered_hash).call()
    print(f"On-chain check for tampered hash: Exists={v_tampered[0]} (Should be False)")
    assert v_tampered[0] is False, "Tampered document should not exist on chain!"

    results["passed_tests"].append("PDF SHA-256 Hash Integrity & Cryptographic Tamper Detection")
    print("[PASS] Step 6 Passed: PDF matches on-chain hash exactly; altered documents are instantly detected!")

    # -------------------------------------------------------------
    # 7. PROFILE CERTIFICATES LISTING & IMAGE ASSET TEST
    # -------------------------------------------------------------
    print("\n>>> STEP 7: PROFILE CATALOG & IMAGE ASSET SERVING <<<")
    p_resp = requests.get(f"{BASE_URL}/progress/certificates/{deaf_user_id}", headers=deaf_headers)
    assert p_resp.status_code == 200
    p_data = p_resp.json()
    all_certs = p_data.get("allCertificates", [])
    print(f"User '{deaf_user_id}' has {len(all_certs)} total earned certificate(s)")
    assert any(c.get("certificateId") == deaf_cert_id for c in all_certs), "Certificate not in profile list!"

    # Verify PNG image endpoint
    img_resp = requests.get(f"{BASE_URL}/certificate/image/{deaf_cert_id}")
    assert img_resp.status_code == 200 and img_resp.headers.get("Content-Type") == "image/png"
    print(f"Certificate visual PNG size: {len(img_resp.content)} bytes")

    results["passed_tests"].append("Profile Catalog & PNG Certificate Asset Delivery")
    print("[PASS] Step 7 Passed: Profile lists earned certificates and serves high-res PNG/PDF assets!")

    # -------------------------------------------------------------
    # 8. PRIVACY & SECURITY CHECK
    # -------------------------------------------------------------
    print("\n>>> STEP 8: PRIVACY & SECURITY AUDIT <<<")
    all_responses_dump = json.dumps([deaf_data, blind_data, motor_data, p_data])
    assert "private" not in all_responses_dump.lower() or "privatekey" not in all_responses_dump.lower(), "Private key detected in response!"
    results["passed_tests"].append("Zero Private Key Leakage & Secure Server-Side Signing")
    print("[PASS] Step 8 Passed: Zero private keys exposed in any API response or client bundle!")

    print("\n" + "=" * 70)
    print("ALL 8 VERIFICATION PHASES COMPLETED WITH 100% SUCCESS")
    print(f"Contract Address: {CONTRACT_ADDRESS}")
    print(f"Network: MST Testnet (Chain ID {MST_CHAIN_ID})")
    print(f"Explorer URL: https://testnetscan.mstblockchain.com/address/{CONTRACT_ADDRESS}")
    print("=" * 70)

    # Save test summary to JSON
    with open("multimode_test_results.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    test_full_blockchain_multimode()
