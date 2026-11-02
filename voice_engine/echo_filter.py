"""
Acoustic Echo Filter & Self-Recognition Suppression Module
Prevents the assistant from hearing and reacting to its own synthesized voice audio.
"""

import re
import time
from typing import Optional, Set


class EchoFilter:
    """
    Suppresses audio loopback and self-recognition echo from TTS speech output.
    """

    def __init__(self, time_window_ms: int = 1200, overlap_threshold: float = 0.6):
        self.time_window_ms = time_window_ms
        self.overlap_threshold = overlap_threshold

    @staticmethod
    def _clean_text(text: Optional[str]) -> str:
        if not text:
            return ""
        # Remove punctuation and normalize whitespace
        cleaned = re.sub(r"[^a-zA-Z0-9\u0900-\u097F\u0C80-\u0CFF\s]", " ", text)
        return re.sub(r"\s+", " ", cleaned).strip().lower()

    @staticmethod
    def _extract_keywords(text: str) -> Set[str]:
        words = text.split(" ")
        return {w for w in words if len(w) > 2}

    def is_self_echo(
        self,
        heard_text: str,
        last_spoken_text: Optional[str],
        last_speech_end_time_ms: Optional[float] = None,
    ) -> bool:
        """
        Determines if the transcribed speech is an echo of the assistant's own output.
        """
        if not last_spoken_text or not heard_text:
            return False

        # If timestamp is provided, verify time window
        if last_speech_end_time_ms is not None:
            now_ms = time.time() * 1000
            time_since_speech = now_ms - last_speech_end_time_ms
            if time_since_speech > self.time_window_ms:
                return False

        clean_heard = self._clean_text(heard_text)
        clean_spoken = self._clean_text(last_spoken_text)

        if not clean_heard or not clean_spoken:
            return False

        # Direct containment check
        if clean_spoken in clean_heard or clean_heard in clean_spoken:
            return True

        # Word overlap analysis
        spoken_keywords = self._extract_keywords(clean_spoken)
        heard_words = [w for w in clean_heard.split(" ") if len(w) > 2]

        if not heard_words:
            return False

        match_count = sum(1 for w in heard_words if w in spoken_keywords)
        return (match_count / len(heard_words)) >= self.overlap_threshold

    def is_active_speech_echo(self, heard_text: str, current_speaking_text: Optional[str]) -> bool:
        """
        Detects if current interim microphone input matches what TTS is actively uttering.
        """
        if not current_speaking_text or not heard_text:
            return False

        clean_heard = self._clean_text(heard_text)
        clean_spoken = self._clean_text(current_speaking_text)

        if not clean_heard or not clean_spoken:
            return False

        if clean_spoken in clean_heard or clean_heard in clean_spoken:
            return True

        spoken_keywords = self._extract_keywords(clean_spoken)
        heard_words = [w for w in clean_heard.split(" ") if len(w) > 2]

        if not heard_words:
            return False

        match_count = sum(1 for w in heard_words if w in spoken_keywords)
        return (match_count / len(heard_words)) >= self.overlap_threshold
