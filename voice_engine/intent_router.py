"""
AccessAI Voice Intent Router
Classifies spoken commands into platform navigation, accessibility modes, and assistive workflows.
"""

import re
from typing import Any, Dict, Optional


class IntentRouter:
    """
    Multilingual intent parser for AccessAI assistive platform.
    Supports English, Hindi, and Kannada triggers.
    """

    # Navigation targets
    MODE_PATTERNS = {
        "blind": re.compile(r"\b(blind mode|screen reader|audio mode|ब्लाइंड मोड|ದೃಷ್ಟಿಹೀನ ಮೋಡ್)\b", re.I),
        "deaf": re.compile(r"\b(deaf mode|sign language|avatar mode|डेफ मोड|ಬಧಿರ ಮೋಡ್)\b", re.I),
        "motor": re.compile(r"\b(motor mode|head tracking|hands free|मोटर मोड|ಚಲನಶೀಲತೆ ಮೋಡ್)\b", re.I),
        "dyslexia": re.compile(r"\b(dyslexia mode|reading guide|डिस्लेक्सिया|ಡಿಸ್ಲೆಕ್ಸಿಯಾ ಮೋಡ್)\b", re.I),
        "adhd": re.compile(r"\b(adhd mode|focus mode|focus reader|एडीएचडी|ಗಮನ ಮೋಡ್)\b", re.I),
        "teacher": re.compile(r"\b(teacher portal|teacher mode|शिक्षक पोर्टल|ಶಿಕ್ಷಕರ ಮೋಡ್)\b", re.I),
    }

    ACTION_PATTERNS = {
        "start_lesson": re.compile(r"\b(start lesson|begin lesson|start course|read lesson|पाठ शुरू करो|ಪಾಠ ಪ್ರಾರಂಭಿಸು)\b", re.I),
        "repeat": re.compile(r"\b(repeat|say again|speak again|one more time|फिर से बोलो|ಮತ್ತೆ ಹೇಳು)\b", re.I),
        "next": re.compile(r"\b(next lesson|next question|next|move on|अगला|ಮುಂದೆ)\b", re.I),
        "help": re.compile(r"\b(help me|what can i do|guidance|commands|मदद|ಸಹಾಯ)\b", re.I),
        "spelling_mode": re.compile(r"\b(spell it|spelling mode|letter by letter|स्पेलिंग मोड|ಅಕ್ಷರಶಃ ಮೋಡ್)\b", re.I),
    }

    def classify_intent(self, transcript: str) -> Dict[str, Any]:
        """
        Classifies speech transcript into structured intent and payload.
        """
        text = transcript.strip().lower()

        # Check accessibility mode navigation
        for mode, pattern in self.MODE_PATTERNS.items():
            if pattern.search(text):
                return {
                    "intent": "NAVIGATE_MODE",
                    "target_mode": mode,
                    "confidence": 0.95,
                    "speech_feedback": f"Switching to {mode.capitalize()} Accessibility Mode.",
                }

        # Check specific platform actions
        for action, pattern in self.ACTION_PATTERNS.items():
            if pattern.search(text):
                feedback_map = {
                    "start_lesson": "Starting your customized learning session now.",
                    "repeat": "Repeating the previous instruction.",
                    "next": "Proceeding to the next topic.",
                    "help": "You can say blind mode, motor mode, repeat, or stop at any time.",
                    "spelling_mode": "Spelling mode activated. Say letters one by one.",
                }
                return {
                    "intent": action.upper(),
                    "confidence": 0.92,
                    "speech_feedback": feedback_map.get(action, "Command recognized."),
                }

        return {
            "intent": "UNKNOWN",
            "raw_text": transcript,
            "confidence": 0.4,
            "speech_feedback": "I heard you, but did not recognize that command. Say help for options.",
        }
