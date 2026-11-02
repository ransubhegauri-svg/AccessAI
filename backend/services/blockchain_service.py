import os
import json
import base64
import hashlib
import time
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MST Testnet Configuration
MST_RPC_URL = os.getenv("MST_RPC_URL", "https://testnetrpc.mstblockchain.com")
MST_CHAIN_ID = int(os.getenv("MST_CHAIN_ID", "91562037"))
CONTRACT_ADDRESS = os.getenv("ACCESSAI_CONTRACT_ADDRESS", "0x6eC3BDD3FB10E8C0251F615a56fe52436E62D290")
OWNER_PRIVATE_KEY = os.getenv("MST_PRIVATE_KEY") or os.getenv("MST_OWNER_PRIVATE_KEY")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(MST_RPC_URL))

# Smart Contract ABI for AccessAILearning (ERC-721 NFT & Rewards)
ACCESSAI_ABI = [
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "totalCertificatesIssued",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "student", "type": "address"},
            {"internalType": "uint256", "name": "points", "type": "uint256"},
        ],
        "name": "awardPoints",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "student", "type": "address"},
            {"internalType": "uint256", "name": "points", "type": "uint256"},
            {"internalType": "string", "name": "certificateId", "type": "string"},
            {"internalType": "string", "name": "courseId", "type": "string"},
            {"internalType": "string", "name": "certificateHash", "type": "string"},
            {"internalType": "string", "name": "tokenURI_", "type": "string"},
        ],
        "name": "awardAndIssueCertificateNFT",
        "outputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "student", "type": "address"},
            {"internalType": "string", "name": "certificateId", "type": "string"},
            {"internalType": "string", "name": "courseId", "type": "string"},
            {"internalType": "string", "name": "certificateHash", "type": "string"},
            {"internalType": "string", "name": "tokenURI_", "type": "string"},
        ],
        "name": "issueCertificateNFT",
        "outputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "string", "name": "certificateId", "type": "string"},
            {"internalType": "address", "name": "student", "type": "address"},
            {"internalType": "string", "name": "courseId", "type": "string"},
        ],
        "name": "issueCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "student", "type": "address"}
        ],
        "name": "getRewardPoints",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "student", "type": "address"},
            {"internalType": "string", "name": "courseId", "type": "string"},
        ],
        "name": "hasCompletedCourse",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "string", "name": "certificateId", "type": "string"}
        ],
        "name": "verifyCertificate",
        "outputs": [
            {"internalType": "bool", "name": "exists", "type": "bool"},
            {"internalType": "bool", "name": "isValid", "type": "bool"},
            {"internalType": "address", "name": "student", "type": "address"},
            {"internalType": "string", "name": "courseId", "type": "string"},
            {"internalType": "uint256", "name": "issueDate", "type": "uint256"},
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"internalType": "string", "name": "certificateHash", "type": "string"},
            {"internalType": "string", "name": "tokenURI_", "type": "string"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "string", "name": "certificateHash", "type": "string"}
        ],
        "name": "verifyCertificateByHash",
        "outputs": [
            {"internalType": "bool", "name": "exists", "type": "bool"},
            {"internalType": "bool", "name": "isValid", "type": "bool"},
            {"internalType": "address", "name": "student", "type": "address"},
            {"internalType": "string", "name": "courseId", "type": "string"},
            {"internalType": "uint256", "name": "issueDate", "type": "uint256"},
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"internalType": "string", "name": "certificateId", "type": "string"},
            {"internalType": "string", "name": "tokenURI_", "type": "string"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "verifyCertificateByTokenId",
        "outputs": [
            {"internalType": "bool", "name": "exists", "type": "bool"},
            {"internalType": "bool", "name": "isValid", "type": "bool"},
            {"internalType": "address", "name": "student", "type": "address"},
            {"internalType": "string", "name": "courseId", "type": "string"},
            {"internalType": "uint256", "name": "issueDate", "type": "uint256"},
            {"internalType": "string", "name": "certificateId", "type": "string"},
            {"internalType": "string", "name": "certificateHash", "type": "string"},
            {"internalType": "string", "name": "tokenURI_", "type": "string"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "student", "type": "address"}
        ],
        "name": "getStudentTokenIds",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "tokenURI",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "string", "name": "certificateId", "type": "string"}
        ],
        "name": "isCertificateValid",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "string", "name": "certificateHash", "type": "string"}
        ],
        "name": "isCertificateHashValid",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "revokeCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "string", "name": "certificateId", "type": "string"}
        ],
        "name": "revokeCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]

def get_contract():
    checksum_addr = w3.to_checksum_address(CONTRACT_ADDRESS)
    return w3.eth.contract(address=checksum_addr, abi=ACCESSAI_ABI)

def generate_certificate_hash(certificate_id: str, student_address: str, course_id: str) -> str:
    """
    Computes a deterministic cryptographic SHA-256 hash of the certificate credentials.
    """
    payload = f"{certificate_id}:{student_address.lower()}:{course_id}:accessai:mst"
    return "0x" + hashlib.sha256(payload.encode("utf-8")).hexdigest()

def generate_token_uri(certificate_id: str, student_address: str, course_id: str, course_name: str = None, cert_hash: str = None) -> str:
    """
    Constructs an ERC-721 compliant Base64 Data URI storing decentralized metadata
    permanently accessible on-chain and in NFT viewers.
    """
    display_title = course_name or course_id.replace("-", " ").title()
    if not cert_hash:
        cert_hash = generate_certificate_hash(certificate_id, student_address, course_id)

    metadata = {
        "name": f"AccessAI Certificate: {display_title}",
        "description": f"Official course completion certificate NFT issued on MST Testnet for {display_title} by AccessAI.",
        "image": "https://raw.githubusercontent.com/accessai/assets/main/certificate-nft.png",
        "external_url": f"https://testnetscan.mstblockchain.com/address/{CONTRACT_ADDRESS}",
        "attributes": [
            {"trait_type": "Platform", "value": "AccessAI"},
            {"trait_type": "Course ID", "value": course_id},
            {"trait_type": "Course Title", "value": display_title},
            {"trait_type": "Certificate ID", "value": certificate_id},
            {"trait_type": "Certificate Hash", "value": cert_hash},
            {"trait_type": "Student Address", "value": student_address},
            {"trait_type": "Reward Points", "value": 50},
            {"trait_type": "Network", "value": "MST Testnet"},
            {"trait_type": "Standard", "value": "ERC-721"}
        ]
    }
    encoded = base64.b64encode(json.dumps(metadata).encode("utf-8")).decode("utf-8")
    return f"data:application/json;base64,{encoded}"

from services.certificate_generator import generate_certificate, OUTPUT_DIR, compute_ipfs_cid

def award_and_issue_nft(
    student_address: str,
    points: int,
    certificate_id: str,
    course_id: str,
    course_name: str = None,
    student_name: str = None,
    completion_date: str = None,
    topic_name: str = None,
    custom_pdf_hash: str = None,
    custom_token_uri: str = None,
    custom_ipfs_cid: str = None,
    custom_ipfs_uri: str = None,
) -> dict:
    """
    Atomically generates a personalized course/topic completion certificate (PNG & PDF),
    calculates its cryptographic SHA-256 hash and standard IPFS CIDv1,
    and issues an ERC-721 NFT on the MST Testnet blockchain in a single atomic transaction.
    
    Includes multi-layer duplicate prevention:
    1. Checks if student already earned a certificate for this course/topic on-chain.
    2. Checks if certificate ID already exists on-chain.
    """
    if not OWNER_PRIVATE_KEY:
        raise ValueError("MST_PRIVATE_KEY is not configured on the backend server.")

    account = w3.eth.account.from_key(OWNER_PRIVATE_KEY)
    contract = get_contract()
    checksum_student = w3.to_checksum_address(student_address)
    display_course = course_name or course_id.replace("-", " ").title()
    student_display_name = student_name or f"Student ({student_address[:6]}...{student_address[-4:]})"

    # 1. Duplicate check: Course or topic already completed by student
    has_completed = contract.functions.hasCompletedCourse(checksum_student, course_id).call()
    if has_completed:
        existing = contract.functions.verifyCertificate(certificate_id).call()
        clean_id = "".join(c for c in certificate_id if c.isalnum() or c in "-_")
        pdf_path = os.path.join(OUTPUT_DIR, f"{clean_id}.pdf")
        if not os.path.exists(pdf_path):
            cert_data = generate_certificate(
                student_name=student_display_name,
                course_name=display_course,
                certificate_id=certificate_id,
                tx_hash="MST Testnet Confirmed",
                token_id=existing[5] if existing[0] else None,
                completion_date=completion_date,
                topic_name=topic_name,
            )
            ret_hash = existing[6] if (existing[0] and existing[6]) else cert_data["pdfHash"]
            ret_cid = cert_data["ipfsCid"]
            ret_uri = cert_data["ipfsUri"]
        else:
            with open(pdf_path, "rb") as f:
                p_bytes = f.read()
            from services.certificate_generator import compute_ipfs_cid
            ret_hash = existing[6] if (existing[0] and existing[6]) else ("0x" + hashlib.sha256(p_bytes).hexdigest())
            ret_cid = compute_ipfs_cid(p_bytes)
            ret_uri = f"ipfs://{ret_cid}"

        return {
            "status": "already_earned",
            "message": "Student already earned an NFT certificate for this topic/course",
            "txHash": None,
            "tokenId": existing[5] if existing[0] else None,
            "certificateId": certificate_id,
            "certificateHash": ret_hash,
            "ipfsCid": ret_cid,
            "ipfsUri": ret_uri,
            "student": checksum_student,
            "studentName": student_display_name,
            "courseId": course_id,
            "courseName": display_course,
            "topicName": topic_name,
            "pdfDownloadUrl": f"/certificate/download/{certificate_id}",
            "imageUrl": f"/certificate/image/{certificate_id}",
        }

    # 2. Duplicate check: Certificate ID already exists
    existing_id = contract.functions.verifyCertificate(certificate_id).call()
    if existing_id[0]:
        return {
            "status": "already_exists",
            "message": "Certificate ID already exists on-chain",
            "txHash": None,
            "tokenId": existing_id[5],
            "certificateId": certificate_id,
            "certificateHash": existing_id[6],
            "student": existing_id[2],
            "studentName": student_display_name,
            "courseId": course_id,
            "courseName": display_course,
            "topicName": topic_name,
            "pdfDownloadUrl": f"/certificate/download/{certificate_id}",
            "imageUrl": f"/certificate/image/{certificate_id}",
        }

    # Pre-calculate deterministic token ID and cryptographic reference for visual card
    total_issued = contract.functions.totalCertificatesIssued().call()
    next_token_id = total_issued + 1
    tx_display = "0x" + hashlib.sha256(f"MST:{certificate_id}:{checksum_student}:{course_id}".encode()).hexdigest()

    # 3. Generate dynamic personalized certificate & calculate PDF SHA-256 hash and IPFS CID (or use pre-generated)
    if custom_pdf_hash and custom_token_uri:
        pdf_hash = custom_pdf_hash
        token_uri = custom_token_uri
        ipfs_cid = custom_ipfs_cid or ""
        ipfs_uri = custom_ipfs_uri or (f"ipfs://{ipfs_cid}" if ipfs_cid else "")
    else:
        cert_data = generate_certificate(
            student_name=student_display_name,
            course_name=display_course,
            certificate_id=certificate_id,
            tx_hash=tx_display,
            token_id=next_token_id,
            completion_date=completion_date,
            topic_name=topic_name,
        )

        pdf_hash = cert_data["pdfHash"]
        token_uri = cert_data["tokenURI"]
        ipfs_cid = cert_data["ipfsCid"]
        ipfs_uri = cert_data["ipfsUri"]

    # 4. Build and sign atomic transaction on MST Testnet with exact PDF SHA-256 hash
    nonce = w3.eth.get_transaction_count(account.address, "pending")
    gas_price = w3.eth.gas_price

    tx = contract.functions.awardAndIssueCertificateNFT(
        checksum_student,
        points,
        certificate_id,
        course_id,
        pdf_hash,
        token_uri
    ).build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gasPrice": gas_price,
        "chainId": MST_CHAIN_ID,
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=OWNER_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    # 5. Wait for receipt to extract confirmed block and tokenId
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    
    # Read the updated token ID assigned to this cert ID
    verified = contract.functions.verifyCertificate(certificate_id).call()
    token_id = verified[5] if verified[0] else next_token_id

    return {
        "status": "success",
        "txHash": tx_hash.hex(),
        "blockNumber": receipt.blockNumber,
        "tokenId": token_id,
        "certificateId": certificate_id,
        "certificateHash": pdf_hash,
        "tokenURI": token_uri,
        "ipfsCid": ipfs_cid,
        "ipfsUri": ipfs_uri,
        "student": checksum_student,
        "studentName": student_display_name,
        "courseId": course_id,
        "courseName": display_course,
        "topicName": topic_name,
        "pointsAwarded": points,
        "pdfDownloadUrl": f"/certificate/download/{certificate_id}",
        "imageUrl": f"/certificate/image/{certificate_id}",
    }

def award_points_onchain(student_address: str, points: int, nonce: int = None) -> dict:
    """
    Securely awards reward points to a student on MST Blockchain.
    """
    if not OWNER_PRIVATE_KEY:
        raise ValueError("MST_PRIVATE_KEY is not configured on the backend server.")

    account = w3.eth.account.from_key(OWNER_PRIVATE_KEY)
    contract = get_contract()
    checksum_student = w3.to_checksum_address(student_address)

    if nonce is None:
        nonce = w3.eth.get_transaction_count(account.address, "pending")
    gas_price = w3.eth.gas_price

    tx = contract.functions.awardPoints(checksum_student, points).build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gasPrice": gas_price,
        "chainId": MST_CHAIN_ID,
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=OWNER_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    return {
        "status": "submitted",
        "txHash": tx_hash.hex(),
        "student": checksum_student,
        "points": points,
        "nonce": nonce,
    }

def issue_certificate_onchain(certificate_id: str, student_address: str, course_id: str, nonce: int = None) -> dict:
    """
    Issues an on-chain course completion certificate NFT on MST Testnet.
    """
    return award_and_issue_nft(student_address, 0, certificate_id, course_id)

def award_and_certify_onchain(student_address: str, points: int, certificate_id: str, course_id: str) -> dict:
    """
    Unified entry point for backward compatibility and automated issuance.
    Executes award_and_issue_nft and structures the response.
    """
    res = award_and_issue_nft(student_address, points, certificate_id, course_id)
    return {
        "points": {
            "status": "success" if res.get("txHash") else "already_recorded",
            "txHash": res.get("txHash"),
            "points": points,
            "student": student_address,
        },
        "certificate": res,
    }

def get_onchain_student_points(student_address: str) -> int:
    """
    Public query to fetch student reward points from MST Blockchain.
    """
    contract = get_contract()
    checksum_student = w3.to_checksum_address(student_address)
    return contract.functions.getRewardPoints(checksum_student).call()

def verify_onchain_certificate(certificate_id: str) -> dict:
    """
    Public query to verify a certificate on MST Blockchain by Certificate ID.
    """
    contract = get_contract()
    res = contract.functions.verifyCertificate(certificate_id.strip()).call()
    return {
        "exists": res[0],
        "isValid": res[1],
        "status": "valid" if (res[0] and res[1]) else ("revoked" if res[0] else "unregistered"),
        "student": res[2],
        "courseId": res[3],
        "issueDate": res[4],
        "tokenId": res[5],
        "certificateHash": res[6],
        "tokenURI": res[7],
    }

def verify_onchain_certificate_by_hash(certificate_hash: str) -> dict:
    """
    Public query to verify a certificate on MST Blockchain by Certificate Hash.
    """
    contract = get_contract()
    res = contract.functions.verifyCertificateByHash(certificate_hash.strip()).call()
    return {
        "exists": res[0],
        "isValid": res[1],
        "status": "valid" if (res[0] and res[1]) else ("revoked" if res[0] else "unregistered"),
        "student": res[2],
        "courseId": res[3],
        "issueDate": res[4],
        "tokenId": res[5],
        "certificateId": res[6],
        "tokenURI": res[7],
        "certificateHash": certificate_hash.strip(),
    }

def verify_onchain_certificate_by_token_id(token_id: int) -> dict:
    """
    Public query to verify a certificate on MST Blockchain by NFT Token ID.
    """
    contract = get_contract()
    res = contract.functions.verifyCertificateByTokenId(int(token_id)).call()
    return {
        "exists": res[0],
        "isValid": res[1],
        "status": "valid" if (res[0] and res[1]) else ("revoked" if res[0] else "unregistered"),
        "student": res[2],
        "courseId": res[3],
        "issueDate": res[4],
        "certificateId": res[5],
        "certificateHash": res[6],
        "tokenURI": res[7],
        "tokenId": int(token_id),
    }

def get_student_token_ids(student_address: str) -> list:
    """
    Public query to fetch all NFT token IDs earned by a student.
    """
    contract = get_contract()
    checksum_student = w3.to_checksum_address(student_address)
    return contract.functions.getStudentTokenIds(checksum_student).call()

def revoke_certificate_onchain(cert_id_or_token_id) -> dict:
    """
    Securely revokes a certificate on MST Blockchain using the owner key.
    Permanently preserves the original record on-chain while setting isValid = false.
    """
    if not OWNER_PRIVATE_KEY:
        raise ValueError("MST_PRIVATE_KEY is not configured on the backend server.")

    account = w3.eth.account.from_key(OWNER_PRIVATE_KEY)
    contract = get_contract()

    # Determine whether target is numeric tokenId or string certificateId
    target = str(cert_id_or_token_id).strip()
    is_numeric = target.isdigit()

    if is_numeric:
        tid = int(target)
        cert_info = contract.functions.verifyCertificateByTokenId(tid).call()
        if not cert_info[0]:
            raise ValueError(f"Certificate Token #{tid} does not exist on MST Blockchain")
        if not cert_info[1]:
            raise ValueError(f"Certificate Token #{tid} is already revoked")
        call_fn = contract.functions.revokeCertificate(tid)
        cert_id = cert_info[4]
    else:
        cert_info = contract.functions.verifyCertificate(target).call()
        if not cert_info[0]:
            raise ValueError(f"Certificate '{target}' does not exist on MST Blockchain")
        if not cert_info[1]:
            raise ValueError(f"Certificate '{target}' is already revoked")
        call_fn = contract.functions.revokeCertificate(target)
        cert_id = target
        tid = cert_info[5]

    nonce = w3.eth.get_transaction_count(account.address, "pending")
    gas_price = w3.eth.gas_price

    tx = call_fn.build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gasPrice": gas_price,
        "chainId": MST_CHAIN_ID,
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=OWNER_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    # Wait for confirmation on MST Testnet
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

    # Re-verify updated status
    updated = contract.functions.verifyCertificate(cert_id).call()

    return {
        "status": "revoked",
        "txHash": tx_hash.hex(),
        "blockNumber": receipt.blockNumber,
        "certificateId": cert_id,
        "tokenId": tid,
        "exists": updated[0],
        "isValid": updated[1],
        "certificateHash": updated[6],
        "student": updated[2],
        "courseId": updated[3],
        "issueDate": updated[4],
        "message": f"Certificate {cert_id} successfully revoked on MST Blockchain. The original NFT record is permanently preserved.",
    }
