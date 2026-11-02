"""
Meko Adaptive Voice Memory Integration
Maintains student-scoped auditory profiles, calibrated speech rate (0.8x - 1.5x),
and preferred Indic language settings across sessions.
"""

from typing import Any, Dict, Optional


class MekoVoiceMemory:
    """
    Manages student voice memory packets for adaptive accessibility personalization.
    """

    def __init__(self, student_id: str = "default_student"):
        self.student_id = student_id
        self.voice_rate: float = 1.0
        self.preferred_language: str = "en-US"
        self.auditory_cues_enabled: bool = True
        self.barge_in_sensitivity: float = 0.85

    def calibrate_speech_rate(self, rate: float) -> float:
        """
        Calibrates TTS rate between 0.7x (slow, high comprehension) and 1.5x (fast).
        """
        self.voice_rate = max(0.7, min(1.5, round(rate, 2)))
        return self.voice_rate

    def set_language(self, lang_code: str) -> str:
        """
        Sets preferred speech recognition and synthesis locale (en-US, hi-IN, kn-IN).
        """
        supported = {"en-US", "hi-IN", "kn-IN"}
        if lang_code in supported:
            self.preferred_language = lang_code
        return self.preferred_language

    def to_meko_packet(self) -> Dict[str, Any]:
        """
        Serializes voice memory into a standard Meko Cloud packet format.
        """
        return {
            "packet_type": "MEKO_VOICE_PROFILE",
            "scope": f"student-{self.student_id}-voice",
            "voice_rate": self.voice_rate,
            "preferred_language": self.preferred_language,
            "barge_in_sensitivity": self.barge_in_sensitivity,
            "auditory_cues": self.auditory_cues_enabled,
        }
