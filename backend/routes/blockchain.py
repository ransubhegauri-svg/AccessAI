from flask import Blueprint, jsonify, request
from services.blockchain_service import (
    get_onchain_student_points,
    verify_onchain_certificate,
    verify_onchain_certificate_by_hash,
    verify_onchain_certificate_by_token_id,
    get_student_token_ids,
    revoke_certificate_onchain,
    CONTRACT_ADDRESS,
    MST_CHAIN_ID,
    MST_RPC_URL,
)

blockchain_bp = Blueprint("blockchain", __name__)

@blockchain_bp.route("/blockchain/info", methods=["GET"])
def get_blockchain_info():
    return jsonify({
        "network": "MST Testnet",
        "chainId": MST_CHAIN_ID,
        "rpcUrl": MST_RPC_URL,
        "contractAddress": CONTRACT_ADDRESS,
        "explorerUrl": f"https://testnetscan.mstblockchain.com/address/{CONTRACT_ADDRESS}",
        "tokenStandard": "ERC-721",
        "tokenName": "AccessAI Course Certificate NFT",
        "tokenSymbol": "AAICERT",
    }), 200

@blockchain_bp.route("/blockchain/points/<address>", methods=["GET"])
def get_points(address):
    try:
        points = get_onchain_student_points(address)
        return jsonify({
            "address": address,
            "rewardPoints": points,
            "contractAddress": CONTRACT_ADDRESS,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@blockchain_bp.route("/blockchain/certificate/<cert_id>", methods=["GET"])
def get_certificate(cert_id):
    try:
        cert_data = verify_onchain_certificate(cert_id)
        if not cert_data["exists"]:
            return jsonify({"error": "Certificate not found on MST Blockchain", "exists": False}), 404
        return jsonify({
            "certificateId": cert_id,
            "verification": cert_data,
            "contractAddress": CONTRACT_ADDRESS,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blockchain_bp.route("/blockchain/certificate/hash/<cert_hash>", methods=["GET"])
def get_certificate_by_hash(cert_hash):
    try:
        cert_data = verify_onchain_certificate_by_hash(cert_hash)
        if not cert_data["exists"]:
            return jsonify({"error": "Certificate hash not found on MST Blockchain", "exists": False}), 404
        return jsonify({
            "certificateHash": cert_hash,
            "verification": cert_data,
            "contractAddress": CONTRACT_ADDRESS,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blockchain_bp.route("/blockchain/certificate/token/<token_id>", methods=["GET"])
def get_certificate_by_token(token_id):
    try:
        cert_data = verify_onchain_certificate_by_token_id(int(token_id))
        if not cert_data["exists"]:
            return jsonify({"error": "Certificate NFT token ID not found on MST Blockchain", "exists": False}), 404
        return jsonify({
            "tokenId": int(token_id),
            "verification": cert_data,
            "contractAddress": CONTRACT_ADDRESS,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blockchain_bp.route("/blockchain/student/<address>/nfts", methods=["GET"])
def get_student_nfts_route(address):
    try:
        token_ids = get_student_token_ids(address)
        nfts = []
        for tid in token_ids:
            c = verify_onchain_certificate_by_token_id(tid)
            if c["exists"]:
                nfts.append(c)
        return jsonify({
            "student": address,
            "count": len(nfts),
            "nfts": nfts,
            "contractAddress": CONTRACT_ADDRESS,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blockchain_bp.route("/blockchain/certificate/revoke", methods=["POST"])
def revoke_certificate_route():
    try:
        data = request.get_json() or {}
        cert_id = data.get("certificateId")
        token_id = data.get("tokenId")
        if not cert_id and token_id is None:
            return jsonify({"error": "certificateId or tokenId is required"}), 400

        target = token_id if token_id is not None else cert_id
        res = revoke_certificate_onchain(target)
        return jsonify(res), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
