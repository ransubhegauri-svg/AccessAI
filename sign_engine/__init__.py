"""
AccessAI Deaf/Mute Sign Language Engine & Meeting Bridge Package
================================================================
Provides continuous 21-landmark MediaPipe gesture recognition,
ASL/ISL vocabulary gloss mapping, 650ms hold stabilization,
and role-based meeting accessibility contracts.
"""

from .gesture_recognizer import HandGeometry, GestureDetector, SignLanguageEngine
from .sign_dictionary import (
    MEETING_SIGN_VOCABULARY,
    GESTURE_TO_AVATAR_ACTION,
    get_sign_details,
    list_all_signs
)
from .meeting_bridge import (
    MeetingAccessController,
    validate_meeting_message,
    create_deaf_meeting_session
)

__all__ = [
    "HandGeometry",
    "GestureDetector",
    "SignLanguageEngine",
    "MEETING_SIGN_VOCABULARY",
    "GESTURE_TO_AVATAR_ACTION",
    "get_sign_details",
    "list_all_signs",
    "MeetingAccessController",
    "validate_meeting_message",
    "create_deaf_meeting_session"
]
