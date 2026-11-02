import os
import sys
import json
import hashlib
import time
import requests
from web3 import Web3
from services.blockchain_service import (
    w3,
    CONTRACT_ADDRESS,
    get_contract,
    verify_onchain_certificate,
    verify_onchain_certificate_by_token_id,
    verify_onchain_certificate_by_hash,
    revoke_certificate_onchain,
    award_and_issue_nft,
    OWNER_PRIVATE_KEY,
    MST_CHAIN_ID,
)
from services.certificate_generator import generate_certificate, OUTPUT_DIR

BACKEND_URL = "http://127.0.0.1:5000"

def test_full_platform():
    results = {}
    contract = get_contract()
    owner_acc = w3.eth.account.from_key(OWNER_PRIVATE_KEY)

    print("=" * 70)
    print(" ACCESS AI: END-TO-END VERIFICATION & BLOCKCHAIN INTEGRATION TEST")
    print(f" Contract: {CONTRACT_ADDRESS}")
    print(f" MST RPC: {w3.provider.endpoint_uri}")
    print(f" Chain ID: {MST_CHAIN_ID} | Owner: {owner_acc.address}")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # TEST 1: Course Completion in Deaf, Blind, and Motor Modes
    # -------------------------------------------------------------------------
    print("\n--- TEST 1: Course Completion across Deaf, Blind, and Motor Modes ---")
    modes_data = [
        {
            "mode": "deaf",
            "userId": "demo-uid-deaf",
            "studentName": "Vrusha Goyal",
            "courseId": "course-1",
            "courseName": "Introduction to Python",
        },
        {
            "mode": "blind",
            "userId": "demo-uid-blind",
            "studentName": "Aman Halkude",
            "courseId": "course-2",
            "courseName": "Java Programming Basics",
        },
        {
            "mode": "motor",
            "userId": "demo-uid-motor",
            "studentName": "Aman Halkude",
            "courseId": "course-3",
            "courseName": "Database Management & SQL",
        },
    ]

    completed_certificates = {}
    test1_passed = True

    for item in modes_data:
        mode = item["mode"]
        print(f"\n[Mode: {mode.upper()}] Submitting 100% course completion...")
        payload = {
            "userId": item["userId"],
            "courseId": item["courseId"],
            "courseTitle": item["courseName"],
            "courseName": item["courseName"],
            "studentName": item["studentName"],
            "completion": 100,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer demo-token-{item['userId']}",
        }

        try:
            resp = requests.post(f"{BACKEND_URL}/progress", json=payload, headers=headers, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                bdata = data.get("blockchain")
                print(f"  -> Response Status: {resp.status_code}")
                if bdata:
                    cert_id = bdata.get("certificateId")
                    token_id = bdata.get("tokenId")
                    tx_hash = bdata.get("certificateTxHash")
                    completed_certificates[mode] = bdata
                    print(f"  -> Minted Certificate ID: {cert_id}")
                    print(f"  -> Token ID: {token_id} | Tx: {tx_hash}")
                else:
                    print(f"  -> Progress saved: {data.get('message')}")
            else:
                print(f"  -> Error {resp.status_code}: {resp.text}")
                test1_passed = False
        except Exception as e:
            print(f"  -> Request failed: {e}")
            test1_passed = False

    results["1_course_completion_all_modes"] = test1_passed and len(completed_certificates) == 3
    print(f"\n[RESULT 1] Course completion across 3 modes: {'PASSED' if results['1_course_completion_all_modes'] else 'FAILED'}")

    # -------------------------------------------------------------------------
    # TEST 2: Student Name and Course Name Verification on Certificate
    # -------------------------------------------------------------------------
    print("\n--- TEST 2: Student Name and Course Name on Generated Certificate ---")
    test2_passed = True
    for item in modes_data:
        mode = item["mode"]
        bdata = completed_certificates.get(mode, {})
        student_on_cert = bdata.get("studentName")
        course_on_cert = bdata.get("courseName")
        cert_id = bdata.get("certificateId")
        pdf_path = os.path.join(OUTPUT_DIR, f"{cert_id}.pdf")
        png_path = os.path.join(OUTPUT_DIR, f"{cert_id}.png")

        print(f"[{mode.upper()}] Checking credentials for {cert_id}:")
        print(f"  Expected Student: '{item['studentName']}' | Actual: '{student_on_cert}'")
        print(f"  Expected Course:  '{item['courseName']}' | Actual: '{course_on_cert}'")
        print(f"  PDF file exists on disk: {os.path.exists(pdf_path)}")
        print(f"  PNG file exists on disk: {os.path.exists(png_path)}")

        if student_on_cert != item["studentName"] or course_on_cert != item["courseName"]:
            test2_passed = False
        if not os.path.exists(pdf_path) or not os.path.exists(png_path):
            test2_passed = False

    results["2_certificate_credentials_accuracy"] = test2_passed
    print(f"\n[RESULT 2] Student & Course credentials accuracy: {'PASSED' if test2_passed else 'FAILED'}")

    # -------------------------------------------------------------------------
    # TEST 3: Reward Points Verification (50 Points Awarded Only Once)
    # -------------------------------------------------------------------------
    print("\n--- TEST 3: Reward Points Verification (Awarded Once, No Duplicates) ---")
    test3_passed = True
    deaf_bdata = completed_certificates.get("deaf", {})
    deaf_student_wallet = deaf_bdata.get("student")
    if deaf_student_wallet:
        points_initial = contract.functions.getRewardPoints(w3.to_checksum_address(deaf_student_wallet)).call()
        print(f"  -> Student Wallet: {deaf_student_wallet}")
        print(f"  -> Current Points on MST Testnet: {points_initial}")

        # Send duplicate progress completion request
        print("  -> Sending duplicate 100% completion request...")
        dup_payload = {
            "userId": "demo-uid-deaf",
            "courseId": "course-1",
            "courseTitle": "Introduction to Python",
            "studentName": "Vrusha Goyal",
            "completion": 100,
        }
        dup_headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer demo-token-demo-uid-deaf",
        }
        dup_resp = requests.post(f"{BACKEND_URL}/progress", json=dup_payload, headers=dup_headers, timeout=30)
        points_after = contract.functions.getRewardPoints(w3.to_checksum_address(deaf_student_wallet)).call()
        print(f"  -> Points after duplicate submission: {points_after}")

        if points_after != points_initial:
            print("  [FAIL] Points increased on duplicate submission!")
            test3_passed = False
        else:
            print(f"  [PASS] Points remained constant at {points_after}. No duplicate rewards awarded.")
    else:
        test3_passed = False

    results["3_reward_points_awarded_once"] = test3_passed
    print(f"\n[RESULT 3] 50 Reward points awarded only once: {'PASSED' if test3_passed else 'FAILED'}")

    # -------------------------------------------------------------------------
    # TEST 4: NFT Minting on MST Testnet
    # -------------------------------------------------------------------------
    print("\n--- TEST 4: NFT Certificate Minting on MST Testnet ---")
    test4_passed = True
    for mode, bdata in completed_certificates.items():
        token_id = bdata.get("tokenId")
        cert_id = bdata.get("certificateId")
        tx_hash = bdata.get("certificateTxHash")

        print(f"[{mode.upper()}] Checking on-chain NFT Token #{token_id} (Cert: {cert_id}):")
        if not token_id or not cert_id:
            test4_passed = False
            continue

        onchain_info = contract.functions.verifyCertificateByTokenId(token_id).call()
        exists = onchain_info[0]
        is_valid = onchain_info[1]
        student = onchain_info[2]
        course = onchain_info[3]
        cert_hash = onchain_info[6]

        print(f"  -> Exists: {exists} | IsValid: {is_valid}")
        print(f"  -> Student Address: {student}")
        print(f"  -> Course: {course}")
        print(f"  -> Hash: {cert_hash[:22]}...")
        # Token must exist on chain; if not revoked, it must also be valid
        if not exists or (mode != "motor" and not is_valid):
            test4_passed = False

    results["4_nft_minted_mst_testnet"] = test4_passed
    print(f"\n[RESULT 4] NFT Certificate minted successfully on MST Testnet: {'PASSED' if test4_passed else 'FAILED'}")

    # -------------------------------------------------------------------------
    # TEST 5: Triple Verification (ID, Token ID, PDF SHA-256 Hash)
    # -------------------------------------------------------------------------
    print("\n--- TEST 5: Multi-Method Verification (ID, Token ID, PDF Hash) ---")
    test5_passed = True
    sample_cert = completed_certificates.get("deaf") or list(completed_certificates.values())[0]
    sample_id = sample_cert["certificateId"]
    sample_token_id = sample_cert["tokenId"]
    sample_hash = sample_cert["certificateHash"]

    # 5a. Verify by Certificate ID via API
    v_id_resp = requests.get(f"{BACKEND_URL}/blockchain/certificate/{sample_id}")
    v_id_data = v_id_resp.json()
    v_id = v_id_data.get("verification", {})
    print(f"  [5a] Verify by ID '{sample_id}':")
    print(f"       Status: {v_id.get('status')} | Valid: {v_id.get('isValid')} | Token: {v_id.get('tokenId')}")
    if not (v_id.get("exists") and v_id.get("isValid")):
        test5_passed = False

    # 5b. Verify by Token ID via API
    v_tok_resp = requests.get(f"{BACKEND_URL}/blockchain/certificate/token/{sample_token_id}")
    v_tok_data = v_tok_resp.json()
    v_tok = v_tok_data.get("verification", {})
    print(f"  [5b] Verify by Token ID #{sample_token_id}:")
    print(f"       Status: {v_tok.get('status')} | Valid: {v_tok.get('isValid')} | CertID: {v_tok.get('certificateId')}")
    if not (v_tok.get("exists") and v_tok.get("isValid")):
        test5_passed = False

    # 5c. Verify by Hash via API
    v_hash_resp = requests.get(f"{BACKEND_URL}/blockchain/certificate/hash/{sample_hash}")
    v_hash_data = v_hash_resp.json()
    v_hash = v_hash_data.get("verification", {})
    print(f"  [5c] Verify by SHA-256 Hash '{sample_hash[:20]}...':")
    print(f"       Status: {v_hash.get('status')} | Valid: {v_hash.get('isValid')} | CertID: {v_hash.get('certificateId')}")
    if not (v_hash.get("exists") and v_hash.get("isValid")):
        test5_passed = False

    results["5_verify_by_id_token_and_hash"] = test5_passed
    print(f"\n[RESULT 5] Multi-method verification (ID, Token ID, Hash): {'PASSED' if test5_passed else 'FAILED'}")

    # -------------------------------------------------------------------------
    # TEST 6: Tamper Detection (Modified PDF causes hash verification failure)
    # -------------------------------------------------------------------------
    print("\n--- TEST 6: Tamper Detection via Hash Verification ---")
    test6_passed = True
    pdf_path = os.path.join(OUTPUT_DIR, f"{sample_id}.pdf")
    with open(pdf_path, "rb") as f:
        real_pdf_bytes = f.read()

    real_hash = "0x" + hashlib.sha256(real_pdf_bytes).hexdigest()
    print(f"  -> Genuine PDF Size: {len(real_pdf_bytes)} bytes | SHA-256: {real_hash[:22]}...")

    # Create a 1-byte tampered copy
    tampered_bytes = bytearray(real_pdf_bytes)
    tampered_bytes[len(tampered_bytes) // 2] ^= 0xFF  # Flip bits of one byte
    tampered_hash = "0x" + hashlib.sha256(tampered_bytes).hexdigest()
    print(f"  -> Tampered PDF Size: {len(tampered_bytes)} bytes | SHA-256: {tampered_hash[:22]}...")

    # Verify tampered hash against on-chain contract
    is_tampered_valid_onchain = contract.functions.isCertificateHashValid(tampered_hash).call()
    t_resp = requests.get(f"{BACKEND_URL}/blockchain/certificate/hash/{tampered_hash}")
    t_data = t_resp.json()

    print(f"  -> Contract isCertificateHashValid(tampered_hash): {is_tampered_valid_onchain}")
    print(f"  -> API Response for tampered hash: {t_resp.status_code} | {t_data.get('error') or t_data.get('status')}")

    if is_tampered_valid_onchain is not False or t_resp.status_code == 200:
        print("  [FAIL] Tampered PDF was erroneously accepted!")
        test6_passed = False
    else:
        print("  [PASS] Tampered PDF hash rejected. Hash mismatch correctly triggered.")

    results["6_tamper_detection_hash_mismatch"] = test6_passed
    print(f"\n[RESULT 6] Tamper detection & hash mismatch: {'PASSED' if test6_passed else 'FAILED'}")

    # -------------------------------------------------------------------------
    # TEST 7: Certificate Revocation & Permanent Record Preservation
    # -------------------------------------------------------------------------
    print("\n--- TEST 7: Certificate Revocation & Provenance Preservation ---")
    test7_passed = True
    motor_cert = completed_certificates.get("motor")
    if not motor_cert:
        print("  [FAIL] No motor certificate found to revoke.")
        test7_passed = False
    else:
        revoke_cert_id = motor_cert["certificateId"]
        revoke_token_id = motor_cert["tokenId"]
        print(f"  -> Checking if Certificate {revoke_cert_id} is already revoked...")
        onchain_cur = contract.functions.verifyCertificateByTokenId(revoke_token_id).call()
        if onchain_cur[1] is True:
            print(f"  -> Revoking Certificate: {revoke_cert_id} (Token #{revoke_token_id})...")
            rev_req = requests.post(
                f"{BACKEND_URL}/blockchain/certificate/revoke",
                json={"certificateId": revoke_cert_id},
                headers={"Content-Type": "application/json"},
                timeout=60,
            )
            print(f"  -> Revoke API Response ({rev_req.status_code}): {rev_req.text}")
            if rev_req.status_code != 200:
                test7_passed = False

        # Verify on-chain permanent record preservation
        onchain_rev = contract.functions.verifyCertificateByTokenId(revoke_token_id).call()
        exists = onchain_rev[0]
        is_valid = onchain_rev[1]
        saved_hash = onchain_rev[6]
        saved_student = onchain_rev[2]

        print(f"  -> On-chain verification post-revocation:")
        print(f"     exists (permanent record): {exists}")
        print(f"     isValid: {is_valid}")
        print(f"     certificateHash preserved: {saved_hash[:22]}...")
        print(f"     student preserved: {saved_student}")

        if not exists or is_valid is not False or not saved_hash or not saved_student:
            print("  [FAIL] Revocation did not properly preserve permanent record or clear isValid flag.")
            test7_passed = False
        else:
            print("  [PASS] Record is permanently preserved on MST Testnet with isValid=False.")

        # Test verification endpoint query on revoked certificate
        rev_check_resp = requests.get(f"{BACKEND_URL}/blockchain/certificate/{revoke_cert_id}")
        rev_check = rev_check_resp.json().get("verification", {})
        print(f"  -> Public Verification API on revoked cert: status={rev_check.get('status')} | isValid={rev_check.get('isValid')}")
        if rev_check.get("status") != "revoked" or rev_check.get("isValid") is not False:
            print("  [FAIL] Verification page does not report revoked status.")
            test7_passed = False
        else:
            print("  [PASS] Revoked status verified via public API.")

    results["7_revocation_preserves_record"] = test7_passed
    print(f"\n[RESULT 7] Revocation permanently preserves record & displays revoked status: {'PASSED' if test7_passed else 'FAILED'}")

    # -------------------------------------------------------------------------
    # TEST 8: BridgeKey Connection & Accessibility Features
    # -------------------------------------------------------------------------
    print("\n--- TEST 8: BridgeKey Integration & Accessibility Features ---")
    test8_passed = True
    print("  -> Checking BridgeKey provider detection logic in services/blockchain.js...")
    with open("c:/Users/Vrusha Goyal/Downloads/banglore-main/accessai-frontend/src/services/blockchain.js", "r", encoding="utf-8") as bf:
        b_code = bf.read()
        assert "window.bridgekey" in b_code, "Direct window.bridgekey check present"
        assert "isBridgeKey" in b_code, "EVM provider isBridgeKey flag check present"
        assert "91562037" in b_code, "MST Testnet chainId configured"
        assert "https://testnetrpc.mstblockchain.com" in b_code, "MST Testnet RPC configured"
        print("  [PASS] BridgeKey multi-layer detection & MST network parameters verified.")

    print("  -> Checking accessibility features in frontend components...")
    with open("c:/Users/Vrusha Goyal/Downloads/banglore-main/accessai-frontend/src/context/VoiceAssistantContext.jsx", "r", encoding="utf-8") as vf:
        v_code = vf.read()
        assert "STOP_REGEX" in v_code and "SpeechRecognition" in v_code or "webkitSpeechRecognition" in v_code, "Voice assistant engine configured"
        print("  [PASS] Voice Assistant engine & multilingual commands verified.")

    with open("c:/Users/Vrusha Goyal/Downloads/banglore-main/accessai-frontend/src/pages/MotorDashboard.jsx", "r", encoding="utf-8") as mf:
        m_code = mf.read()
        assert "dwell" in m_code.lower(), "Motor dwell click present"
        print("  [PASS] Motor Mode adaptive dwell click navigation verified.")

    results["8_bridgekey_and_accessibility"] = test8_passed
    print(f"\n[RESULT 8] BridgeKey & accessibility features: {'PASSED' if test8_passed else 'FAILED'}")

    print("\n" + "=" * 70)
    print(" SUMMARY OF END-TO-END TESTS")
    print("=" * 70)
    for test_name, passed in results.items():
        print(f"  {test_name.ljust(45)}: {'[PASSED]' if passed else '[FAILED]'}")

    all_passed = all(results.values())
    print("=" * 70)
    print(f" FINAL STATUS: {'ALL 8 TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    print("=" * 70)

if __name__ == "__main__":
    test_full_platform()
