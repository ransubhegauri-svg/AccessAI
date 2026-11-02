import uuid
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# 1. CATALOG OF ITEMS AVAILABLE FOR REDEMPTION
# ---------------------------------------------------------------------------
REWARD_STORE_CATALOG = [
    # ── Premium Courses ──
    {
        "id": "prem-course-ai",
        "type": "course",
        "title": "Advanced Neural-Adaptive AI Systems & Computer Vision",
        "category": "Artificial Intelligence",
        "pointsCost": 100,
        "badge": "Premium Course",
        "icon": "smart_toy",
        "instructor": "Dr. Elena Rostova, AI Research Fellow",
        "duration": "3h 45m",
        "level": "Advanced",
        "rating": 4.95,
        "video": "DBQINq0SsAw",
        "description": "Master deep neural network perception, multi-modal gesture tracking, and real-time computer vision for assistive neuro-adaptive interfaces.",
        "lessons": [
            {"id": "pai-1", "title": "Neural Architectures for Accessibility", "duration": "45m", "video": "DBQINq0SsAw"},
            {"id": "pai-2", "title": "Real-Time Keypoint Landmark Inference", "duration": "55m", "video": "DBQINq0SsAw"},
            {"id": "pai-3", "title": "Multi-Modal Sensor Integration & Latency", "duration": "60m", "video": "DBQINq0SsAw"},
            {"id": "pai-4", "title": "Deploying Edge AI Models in Browser WebGL", "duration": "65m", "video": "DBQINq0SsAw"}
        ],
        "quiz": {
            "question": "Which inference pipeline delivers minimal latency for in-browser computer vision on low-power devices?",
            "options": ["Server-side Cloud WebSockets", "Client-side WebAssembly / WebGL", "Batch MapReduce Workers", "High-frequency Long Polling"],
            "answer": "Client-side WebAssembly / WebGL"
        }
    },
    {
        "id": "prem-course-wcag",
        "type": "course",
        "title": "Full-Stack Accessibility Engineering & WCAG 2.2 AAA",
        "category": "Software Engineering",
        "pointsCost": 100,
        "badge": "Certified Masterclass",
        "icon": "accessibility_new",
        "instructor": "Marcus Vance, Accessibility Architect",
        "duration": "4h 10m",
        "level": "Intermediate to Advanced",
        "rating": 5.0,
        "video": "rfscVS0vtbw",
        "description": "Comprehensive engineering for WCAG 2.2 AAA compliance, assistive keyboard trees, ARIA live region management, and cognitive disability accommodations.",
        "lessons": [
            {"id": "pwc-1", "title": "Semantic Trees, Shadow DOM & Accessibility APIs", "duration": "50m", "video": "rfscVS0vtbw"},
            {"id": "pwc-2", "title": "Live Region Synchronization & Screen Reader Audio", "duration": "60m", "video": "rfscVS0vtbw"},
            {"id": "pwc-3", "title": "Focus Trapping, Modal Inertness & Spatial Navigation", "duration": "65m", "video": "rfscVS0vtbw"},
            {"id": "pwc-4", "title": "Automated CI/CD Accessibility Auditing & axe-core", "duration": "75m", "video": "rfscVS0vtbw"}
        ],
        "quiz": {
            "question": "What is the primary function of the inert attribute on background elements when an accessible modal opens?",
            "options": ["Applies a dark backdrop filter", "Prevents screen reader virtual navigation and focus reaching background content", "Mutes all background media players", "Stops CSS transitions"],
            "answer": "Prevents screen reader virtual navigation and focus reaching background content"
        }
    },
    {
        "id": "prem-course-web3",
        "type": "course",
        "title": "Applied Cryptography & Smart Contract Security on MST",
        "category": "Decentralized Systems",
        "pointsCost": 120,
        "badge": "Specialist Track",
        "icon": "token",
        "instructor": "Dr. Angela Yu & Blockchain Core Team",
        "duration": "4h 30m",
        "level": "Advanced",
        "rating": 4.9,
        "video": "71360000000",
        "description": "Develop and audit decentralized ERC-721 credential contracts, cryptographic SHA-256 merkle trees, and reentrancy-safe state architectures on MST Blockchain.",
        "lessons": [
            {"id": "pbc-1", "title": "Cryptographic Hash Trees & Data Integrity", "duration": "55m", "video": "71360000000"},
            {"id": "pbc-2", "title": "ERC-721 URI Storage & Gas Optimization on MST", "duration": "70m", "video": "71360000000"},
            {"id": "pbc-3", "title": "Preventing Nonce Desynchronization in Production", "duration": "65m", "video": "71360000000"},
            {"id": "pbc-4", "title": "Formal Verification & Reentrancy Guards", "duration": "80m", "video": "71360000000"}
        ],
        "quiz": {
            "question": "Why is the Checks-Effects-Interactions pattern critical in smart contract state modification?",
            "options": ["Reduces EVM bytecode size", "Prevents reentrancy attacks where external calls execute before internal state updates", "Increases gas refunds", "Generates deterministic token IDs"],
            "answer": "Prevents reentrancy attacks where external calls execute before internal state updates"
        }
    },
    {
        "id": "prem-course-asl",
        "type": "course",
        "title": "ASL Linguistics, Simultaneous Translation & Cultural Fluency",
        "category": "Inclusive Computing",
        "pointsCost": 100,
        "badge": "Language Masterclass",
        "icon": "pan_tool",
        "instructor": "Sarah Jenkins, Deaf Studies Fellow",
        "duration": "3h 30m",
        "level": "Advanced",
        "rating": 4.88,
        "video": "nJx-XsxeajQ",
        "description": "Advanced spatial referencing, non-manual morphemes, complex classifiers, and real-time bidirectional translation mechanics.",
        "lessons": [
            {"id": "pas-1", "title": "Spatial Grammar & Conceptual Referents", "duration": "50m", "video": "nJx-XsxeajQ"},
            {"id": "pas-2", "title": "Complex Descriptive & Instrument Classifiers", "duration": "55m", "video": "nJx-XsxeajQ"},
            {"id": "pas-3", "title": "Mouth Morphemes & Prosodic Markers", "duration": "50m", "video": "nJx-XsxeajQ"},
            {"id": "pas-4", "title": "Simultaneous Interpreting Speed & Accuracy", "duration": "55m", "video": "nJx-XsxeajQ"}
        ],
        "quiz": {
            "question": "In ASL, what do mouth morphemes like 'CHA' or 'MM' convey?",
            "options": ["Spoken English syllables", "Specific adverbial and adjectival qualifiers like size, intensity, or comfort", "Grammatical punctuation pauses", "Tone of voice pitch levels"],
            "answer": "Specific adverbial and adjectival qualifiers like size, intensity, or comfort"
        }
    },

    # ── Perks, Tools & Physical Swag ──
    {
        "id": "perk-ai-tutor-vip",
        "type": "perk",
        "title": "VIP AI Tutor Unlimited Audio/Video Voice Pass",
        "category": "AI Learning Perks",
        "pointsCost": 80,
        "badge": "Priority Pass",
        "icon": "headset_mic",
        "duration": "Permanent Unlocked Access",
        "description": "Unlimited priority bandwidth for the real-time AI Tutor with instant code explanation, audio voice dubbing, and interactive visual problem walk-throughs.",
        "perkBenefits": [
            "Zero queue latency on AI Tutor responses",
            "Unlimited interactive voice question sessions",
            "Automatic homework and code snippet diagnosis"
        ]
    },
    {
        "id": "perk-blockchain-badge",
        "type": "perk",
        "title": "On-Chain Verified Blockchain Profile Badge & Frame",
        "category": "Profile Upgrades",
        "pointsCost": 50,
        "badge": "On-Chain Status",
        "icon": "verified",
        "duration": "Permanent Profile Token",
        "description": "Showcase a verified cryptographic gold badge and glowing holographic frame across your profile and certificate transcripts.",
        "perkBenefits": [
            "Golden holographic border around student profile avatar",
            "Permanent 'Verified Web3 Scholar' badge on public certificates",
            "Priority indexing on employer verification search"
        ]
    },
    {
        "id": "perk-physical-kit",
        "type": "swag",
        "title": "Official Holographic Physical Certificate & Swag Kit",
        "category": "Physical Dispatch",
        "pointsCost": 200,
        "badge": "Physical Dispatch",
        "icon": "mail",
        "duration": "Mailed to Student Address",
        "description": "A high-quality embossed parchment diploma with gold foil seal, physical cryptographic QR token, and ACCESS AI stickers shipped directly to your door.",
        "perkBenefits": [
            "Archival quality embossed parchment diploma with security hologram",
            "Direct worldwide postal shipping included",
            "Custom student calligraphy inscription"
        ]
    },
    {
        "id": "perk-pro-tools",
        "type": "perk",
        "title": "Pro Accessibility Tools Suite (Custom Voices & Avatar Skins)",
        "category": "Accessibility Suite",
        "pointsCost": 75,
        "badge": "Customization Pack",
        "icon": "tune",
        "duration": "Lifetime License",
        "description": "Unlock 8 premium natural neural voices, customizable 3D Sign Language avatar outfits, and high-frequency sub-pixel gaze tracking smoothing.",
        "perkBenefits": [
            "8 neural TTS voices with custom pitch and pacing controls",
            "4 3D Sign Avatar character models with high-contrast skins",
            "Enhanced ocular jitter filtering for head & eye tracking"
        ]
    },
    {
        "id": "perk-retake-pass",
        "type": "perk",
        "title": "Instant Quiz Retake & Exam Accelerator Pass",
        "category": "Academic Perks",
        "pointsCost": 30,
        "badge": "Exam Accelerator",
        "icon": "bolt",
        "duration": "5 Retake Tokens",
        "description": "Instantly bypass cooldown timers on quizzes and practice arena assessments with 5 instant re-take credits.",
        "perkBenefits": [
            "5 instant exam re-take credits",
            "Immediate score recalculation",
            "Diagnostic feedback summary on incorrect answers"
        ]
    }
]

# ---------------------------------------------------------------------------
# 2. IN-MEMORY STORES FOR UNLOCKED ITEMS & TRANSACTION HISTORY
# ---------------------------------------------------------------------------
# Maps user_id -> set of unlocked item IDs
USER_UNLOCKED_ITEMS = {}

# Transparent transaction history: list of transaction records
REWARD_TRANSACTIONS = [
    {
        "id": "TX-REWARD-INIT-001",
        "userId": "demo-uid-deaf",
        "type": "earned",
        "amount": 50,
        "description": "Completed Course: American Sign Language Alphabet",
        "timestamp": "September 28, 2026, 14:15 UTC",
        "source": "course_completion",
        "txHash": "0x434552542d41434345535341492d44454d4f2d323032362d3030312d41492d41",
    },
    {
        "id": "TX-REWARD-INIT-002",
        "userId": "demo-uid-deaf",
        "type": "earned",
        "amount": 500,
        "description": "Graduation Bonus: Bachelor of Accessible Software Engineering & Applied AI",
        "timestamp": "September 29, 2026, 05:22 UTC",
        "source": "honors_degree",
        "txHash": "0xca589b52771bfd50012ca30d34b0827f3645274fe845abf0cb9f5e5d4918f19b",
    }
]


def get_all_catalog_items():
    """Returns the full rewards catalog."""
    return REWARD_STORE_CATALOG


def get_item_by_id(item_id: str):
    """Finds an item by its unique ID."""
    for item in REWARD_STORE_CATALOG:
        if item["id"] == item_id:
            return item
    return None


def get_user_unlocked_items(user_id: str) -> list:
    """Returns list of item IDs unlocked by the user."""
    return list(USER_UNLOCKED_ITEMS.get(user_id, set()))


def get_user_transaction_history(user_id: str) -> list:
    """Returns the chronological transparent history of reward points for a user."""
    user_txs = [
        tx for tx in REWARD_TRANSACTIONS
        if tx["userId"] == user_id or user_id in tx["userId"]
    ]
    # Sort latest first
    return sorted(user_txs, key=lambda x: x.get("timestamp", ""), reverse=True)


def calculate_user_points_balance(user_id: str, onchain_points: int = None) -> dict:
    """
    Computes real-time available points, earned points, and spent points.
    """
    history = get_user_transaction_history(user_id)
    
    total_spent = sum(tx["amount"] for tx in history if tx.get("type") == "spent")
    recorded_earned = sum(tx["amount"] for tx in history if tx.get("type") == "earned")
    
    # Baseline total earned from onchain if higher, otherwise recorded
    baseline_earned = max(recorded_earned, onchain_points if onchain_points is not None else 0)
    
    # Ensure demo users with recent degree or courses have generous baseline
    if user_id.startswith("demo-") and baseline_earned < 550:
        baseline_earned = 550

    available_points = max(0, baseline_earned - total_spent)

    return {
        "userId": user_id,
        "availablePoints": available_points,
        "totalEarned": baseline_earned,
        "totalSpent": total_spent,
        "unlockedItems": get_user_unlocked_items(user_id),
        "transactionCount": len(history),
    }


def redeem_reward_item(user_id: str, item_id: str, onchain_points: int = None) -> dict:
    """
    Purchases/redeems a course or perk using reward points.
    - Validates item existence
    - Checks sufficient points balance
    - Checks if already purchased
    - Deducts points & logs transparent transaction
    - Unlocks item immediately
    """
    item = get_item_by_id(item_id)
    if not item:
        return {"success": False, "error": f"Item '{item_id}' not found in rewards catalog."}

    user_unlocked = USER_UNLOCKED_ITEMS.setdefault(user_id, set())
    if item_id in user_unlocked:
        return {
            "success": False,
            "error": f"You have already unlocked '{item['title']}'!",
            "alreadyUnlocked": True,
            "item": item,
        }

    balance_info = calculate_user_points_balance(user_id, onchain_points)
    points_cost = item["pointsCost"]

    if balance_info["availablePoints"] < points_cost:
        deficit = points_cost - balance_info["availablePoints"]
        return {
            "success": False,
            "error": f"Insufficient reward points. You need {deficit} more points to purchase this item.",
            "availablePoints": balance_info["availablePoints"],
            "requiredPoints": points_cost,
            "deficit": deficit,
        }

    # Record purchase
    user_unlocked.add(item_id)

    tx_id = f"TX-SPEND-{uuid.uuid4().hex[:8].upper()}"
    timestamp_str = datetime.now(timezone.utc).strftime("%B %d, %Y, %H:%M UTC")

    tx_record = {
        "id": tx_id,
        "userId": user_id,
        "type": "spent",
        "amount": points_cost,
        "description": f"Purchased: {item['title']}",
        "timestamp": timestamp_str,
        "source": "store_redemption",
        "itemId": item_id,
        "itemType": item["type"],
        "itemTitle": item["title"],
        "txHash": f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}"[:66],
    }

    REWARD_TRANSACTIONS.insert(0, tx_record)

    # Compute updated balance
    updated_balance = calculate_user_points_balance(user_id, onchain_points)

    return {
        "success": True,
        "message": f"Congratulations! You have successfully unlocked '{item['title']}' for {points_cost} Points.",
        "item": item,
        "transaction": tx_record,
        "availablePoints": updated_balance["availablePoints"],
        "totalSpent": updated_balance["totalSpent"],
        "unlockedItems": list(user_unlocked),
    }
