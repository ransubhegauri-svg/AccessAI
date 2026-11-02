"""
AccessAI Meeting Bridge & Zero-Mandatory Permissions Controller
===============================================================
Enforces Promoted Team Decisions from AGENTS.md / Check T:
- Decision 1: Two-Way Meeting Message Schema
- Decision 2: Zero Mandatory Permissions Contract (Mic never requested, camera voluntary)
- Decision 3: Role-Based Meeting Restriction (Join Only for students, no create/kick/end)
- Decision 9: Mandatory Text-Based Communication & 8 Standardized Quick Responses
"""

import time
from typing import Dict, Any, List, Optional

# Standardized Quick Responses (Decision 9)
QUICK_RESPONSES = [
    {"id": "qr-1", "text": "Yes", "meaning": "Affirmative agreement", "icon": "👍"},
    {"id": "qr-2", "text": "No", "meaning": "Respectful disagreement", "icon": "👎"},
    {"id": "qr-3", "text": "I agree", "meaning": "Concurrence with speaker", "icon": "🤝"},
    {"id": "qr-4", "text": "I disagree", "meaning": "Alternative perspective", "icon": "✋"},
    {"id": "qr-5", "text": "Please repeat", "meaning": "Clarification request", "icon": "🔁"},
    {"id": "qr-6", "text": "I have a question", "meaning": "Hand raise", "icon": "🙋"},
    {"id": "qr-7", "text": "I need help", "meaning": "Pedagogical friction alert", "icon": "🆘"},
    {"id": "qr-8", "text": "Thank you", "meaning": "Polite acknowledgment", "icon": "🙏"}
]

# Active mock meeting rooms
ACTIVE_MEETING_ROOMS = {
    "accessai-room-402": {
        "title": "Computer Science 101: Inclusive Algorithms",
        "host": "Prof. Harrison (Hearing Participant)",
        "status": "active"
    },
    "accessai-room-101": {
        "title": "AccessAI Orientation & Sign Language Hub",
        "host": "Sarah Jenkins (ASL Coordinator)",
        "status": "active"
    }
}


class MeetingAccessController:
    """Manages role-based student access and validates communication payloads."""

    @staticmethod
    def create_student_join_session(
        meeting_id: str = "accessai-room-402",
        user_id: str = "student-deaf-001",
        mode: str = "deaf_mute"
    ) -> Dict[str, Any]:
        """
        Creates an authorized student meeting session complying with Zero Mandatory Permissions.
        """
        room_info = ACTIVE_MEETING_ROOMS.get(meeting_id, {
            "title": f"Accessible Classroom ({meeting_id})",
            "host": "Prof. Harrison (Educator)",
            "status": "active"
        })

        return {
            "success": True,
            "meeting_id": meeting_id,
            "meeting_title": room_info["title"],
            "host_name": room_info["host"],
            "student_authorization": {
                "role": "student",
                "mode": mode,
                "is_host": False,
                "can_kick": False,
                "can_end_meeting": False,
                "permissions": [
                    "join_only",
                    "send_text",
                    "send_signs",
                    "receive_captions",
                    "view_3d_avatar"
                ]
            },
            "zero_mandatory_permissions_contract": {
                "microphone_required": False,
                "microphone_requested": False,
                "camera_required": False,
                "camera_default_state": "OFF",
                "text_fallback_active": True,
                "quick_responses_enabled": True
            },
            "quick_responses": QUICK_RESPONSES
        }


def validate_meeting_message(payload: Dict[str, Any]) -> tuple:
    """
    Validates message against Two-Way Meeting Message Schema (Decision 1):
    { meetingId, senderId, senderName, senderMode, messageType, text, timestamp }
    """
    required_fields = ["meetingId", "senderId", "senderName", "senderMode", "messageType", "text"]
    for f in required_fields:
        if f not in payload or not payload[f]:
            return False, f"Missing required field: {f}"

    valid_modes = ["deaf_mute", "hearing", "blind", "motor", "teacher"]
    if payload["senderMode"] not in valid_modes:
        return False, f"Invalid senderMode. Must be one of {valid_modes}"

    valid_types = ["sign_to_text", "text_message", "speech_to_text"]
    if payload["messageType"] not in valid_types:
        return False, f"Invalid messageType. Must be one of {valid_types}"

    return True, "Valid meeting message schema"


def create_deaf_meeting_session(meeting_id: str, student_id: str) -> Dict[str, Any]:
    return MeetingAccessController.create_student_join_session(meeting_id, student_id, "deaf_mute")
