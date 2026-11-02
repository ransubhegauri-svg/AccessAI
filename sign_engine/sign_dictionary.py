"""
AccessAI Sign Language Vocabulary & Translation Dictionary
===========================================================
Maps recognized 3D hand gestures to conversational phrases,
ASL/ISL glosses, 3D WebGL Avatar animation triggers, and speech synthesis targets.
"""

from typing import Dict, Any, Optional, List

MEETING_SIGN_VOCABULARY: Dict[str, Dict[str, Any]] = {
    "Open_Palm": {
        "id": "Open_Palm",
        "label": "Hello Everyone",
        "phrase": "Hello everyone,",
        "category": "greeting",
        "icon": "✋",
        "description": "Open palm facing forward with all fingers extended",
        "avatar_action": "HELLO",
        "hold_duration_ms": 650,
        "cooldown_ms": 1400
    },
    "Thumb_Up": {
        "id": "Thumb_Up",
        "label": "I Agree / Yes",
        "phrase": "I agree with this proposal.",
        "category": "agreement",
        "icon": "👍",
        "description": "Thumbs up gesture with all four fingers curled into palm",
        "avatar_action": "YES",
        "hold_duration_ms": 650,
        "cooldown_ms": 1400
    },
    "Closed_Fist": {
        "id": "Closed_Fist",
        "label": "I Disagree / No",
        "phrase": "I respectfully disagree.",
        "category": "disagreement",
        "icon": "✊",
        "description": "Closed fist held steady facing camera",
        "avatar_action": "NO",
        "hold_duration_ms": 650,
        "cooldown_ms": 1400
    },
    "Pointing_Up": {
        "id": "Pointing_Up",
        "label": "I Have a Question",
        "phrase": "Excuse me, I have a question.",
        "category": "interaction",
        "icon": "☝️",
        "description": "Index finger pointing upward with remaining fingers curled",
        "avatar_action": "POINTING_UP",
        "hold_duration_ms": 650,
        "cooldown_ms": 1400
    },
    "Victory": {
        "id": "Victory",
        "label": "Understood / Peace",
        "phrase": "Understood, that makes complete sense.",
        "category": "acknowledgment",
        "icon": "✌️",
        "description": "Index and middle fingers extended in V-shape",
        "avatar_action": "VICTORY",
        "hold_duration_ms": 650,
        "cooldown_ms": 1400
    },
    "I_Love_You": {
        "id": "I_Love_You",
        "label": "Thank You / Gratitude",
        "phrase": "Thank you very much for explaining.",
        "category": "politeness",
        "icon": "🤟",
        "description": "Thumb, index, and pinky fingers extended, middle and ring curled",
        "avatar_action": "THANK_YOU",
        "hold_duration_ms": 650,
        "cooldown_ms": 1400
    },
    "Help": {
        "id": "Help",
        "label": "I Need Assistance",
        "phrase": "I need help understanding this concept.",
        "category": "support",
        "icon": "🆘",
        "description": "Flat palm facing upward with closed fist resting on top",
        "avatar_action": "HELP",
        "hold_duration_ms": 650,
        "cooldown_ms": 1400
    },
    "Gun_Left": {
        "id": "Gun_Left",
        "label": "Next Topic / Forward",
        "phrase": "Let's move to the next slide.",
        "category": "navigation",
        "icon": "👉",
        "description": "Left hand index finger pointing horizontally forward with thumb cocked",
        "avatar_action": "POINTING_UP",
        "hold_duration_ms": 400,
        "cooldown_ms": 800
    },
    "Gun_Right": {
        "id": "Gun_Right",
        "label": "Previous Topic / Back",
        "phrase": "Could we please review the previous topic?",
        "category": "navigation",
        "icon": "👈",
        "description": "Right hand index finger pointing backward with thumb cocked",
        "avatar_action": "POINTING_UP",
        "hold_duration_ms": 400,
        "cooldown_ms": 800
    },
    "Scroll_Up": {
        "id": "Scroll_Up",
        "label": "Scroll Up",
        "phrase": "Please scroll up.",
        "category": "ui_control",
        "icon": "🔼",
        "description": "Vertical index finger pointed upward above head height",
        "avatar_action": "POINTING_UP",
        "hold_duration_ms": 300,
        "cooldown_ms": 500
    },
    "Scroll_Down": {
        "id": "Scroll_Down",
        "label": "Scroll Down",
        "phrase": "Please scroll down.",
        "category": "ui_control",
        "icon": "🔽",
        "description": "Vertical index finger pointed downward",
        "avatar_action": "POINTING_UP",
        "hold_duration_ms": 300,
        "cooldown_ms": 500
    }
}

GESTURE_TO_AVATAR_ACTION: Dict[str, str] = {
    "open_palm": "HELLO",
    "openpalm": "HELLO",
    "hello": "HELLO",
    "wave": "HELLO",
    "thumb_up": "YES",
    "thumbsup": "YES",
    "yes": "YES",
    "agree": "YES",
    "closed_fist": "NO",
    "fist": "NO",
    "no": "NO",
    "disagree": "NO",
    "pointing_up": "POINTING_UP",
    "question": "POINTING_UP",
    "victory": "VICTORY",
    "peace": "VICTORY",
    "understood": "VICTORY",
    "i_love_you": "THANK_YOU",
    "ily": "THANK_YOU",
    "thank_you": "THANK_YOU",
    "thanks": "THANK_YOU",
    "help": "HELP",
    "idle": "IDLE",
    "default": "IDLE"
}

def get_sign_details(gesture_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves full sign metadata for a recognized gesture."""
    if not gesture_id:
        return None
    # Direct match
    if gesture_id in MEETING_SIGN_VOCABULARY:
        return MEETING_SIGN_VOCABULARY[gesture_id]
    # Case-insensitive / normalized lookup
    norm = gesture_id.strip().replace(" ", "_").lower()
    for k, v in MEETING_SIGN_VOCABULARY.items():
        if k.lower() == norm or v["label"].lower() == norm:
            return v
    return None

def list_all_signs() -> List[Dict[str, Any]]:
    """Returns list of all active sign vocabulary definitions."""
    return list(MEETING_SIGN_VOCABULARY.values())
