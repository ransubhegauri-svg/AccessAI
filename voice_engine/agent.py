"""
AccessAI Core Voice Agent Engine
Manages the real-time state machine, sub-120ms natural barge-in interruption,
and intent dispatch across English, Hindi, and Kannada.
"""

from enum import Enum
import re
import time
from typing import Any, Dict, Optional

from .echo_filter import EchoFilter
from .intent_router import IntentRouter


class AgentState(str, Enum):
    IDLE = "IDLE"
    LISTENING = "LISTENING"
    PROCESSING = "PROCESSING"
    SPEAKING = "SPEAKING"
    PAUSED = "PAUSED"
    ERROR = "ERROR"


# Natural interruption regex (STOP) across English, Hindi, and Kannada
STOP_REGEX = re.compile(
    r"\b(stop talking|stop speaking|stop reading|that's enough|thats enough|that is enough|"
    r"be quiet|cancel that|never mind|nevermind|cancel|enough|stop)\b|"
    r"(रुको|रुकिए|बंद करो|चुप रहो|बस करो|रद्द करो|समाप्त)|"
    r"(ನಿಲ್ಲಿಸು|ಸಾಕು|ಮಾತನಾಡಬೇಡ|ರದ್ದುಮಾಡು)",
    re.IGNORECASE,
)

# Pause regex (WAIT)
WAIT_REGEX = re.compile(
    r"\b(wait a second|wait a moment|wait a minute|wait a min|give me a second|"
    r"give me a moment|just a second|just a moment|hold on|one second|hang on|wait)\b|"
    r"(ठहरो|एक मिनट|थोड़ा रुको|एक सेकंड|प्रतीक्षा)|"
    r"(ಸ್ವಲ್ಪ ನಿಲ್ಲಿ|ತಡಿ|ಒಂದು ನಿಮಿಷ|ಕಾಯಿರಿ)",
    re.IGNORECASE,
)

# Resume regex (RESUME)
RESUME_REGEX = re.compile(
    r"\b(continue listening|start listening again|start listening|keep going|wake up|continue|resume)\b|"
    r"(जारी रखो|फिर से सुनो|शुरू करो|आगे बढ़ो)|"
    r"(ಮುಂದುವರಿಸು|ಪ್ರಾರಂಭಿಸು|ಮುಂದೆ ಹೋಗು)",
    re.IGNORECASE,
)


class VoiceAgentEngine:
    """
    Sub-120ms response Voice Agent Engine for Assistive Learning.
    Supports low-latency barge-in interruption and acoustic echo suppression.
    """

    def __init__(self):
        self.state: AgentState = AgentState.IDLE
        self.echo_filter = EchoFilter()
        self.intent_router = IntentRouter()
        self.last_spoken_text: Optional[str] = None
        self.last_speech_end_time_ms: Optional[float] = None
        self.current_speaking_text: Optional[str] = None

    @staticmethod
    def is_stop_command(text: str) -> bool:
        if not text:
            return False
        clean = re.sub(r"[.,!?;:]", " ", text)
        clean = re.sub(r"\s+", " ", clean).strip()
        return bool(STOP_REGEX.search(clean))

    @staticmethod
    def is_wait_command(text: str) -> bool:
        if not text:
            return False
        clean = re.sub(r"[.,!?;:]", " ", text)
        clean = re.sub(r"\s+", " ", clean).strip()
        return bool(WAIT_REGEX.search(clean))

    @staticmethod
    def is_resume_command(text: str) -> bool:
        if not text:
            return False
        clean = re.sub(r"[.,!?;:]", " ", text)
        clean = re.sub(r"\s+", " ", clean).strip()
        return bool(RESUME_REGEX.search(clean))

    def process_input(
        self,
        transcript: str,
        current_state: Optional[str] = None,
        is_speaking: bool = False,
        current_speaking_text: Optional[str] = None,
        last_spoken_text: Optional[str] = None,
        last_speech_end_time_ms: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Processes microphone speech transcript with instant barge-in priority.
        """
        start_time = time.time()

        # Update local states if passed from client
        if current_state:
            try:
                self.state = AgentState(current_state)
            except ValueError:
                pass

        if current_speaking_text is not None:
            self.current_speaking_text = current_speaking_text
        if last_spoken_text is not None:
            self.last_spoken_text = last_spoken_text
        if last_speech_end_time_ms is not None:
            self.last_speech_end_time_ms = last_speech_end_time_ms

        text = transcript.strip()
        if not text:
            return {
                "action": "IGNORE",
                "state": self.state.value,
                "reason": "Empty transcript",
            }

        # ── Priority 1: STOP Barge-in / Interruption (Immediate) ──
        if self.is_stop_command(text):
            self.state = AgentState.LISTENING
            self.current_speaking_text = None
            latency_ms = (time.time() - start_time) * 1000
            return {
                "action": "BARGE_IN_STOP",
                "state": AgentState.LISTENING.value,
                "cancel_speech": True,
                "latency_ms": round(latency_ms, 2),
                "message": "Assistant stopped and listening for your next request.",
            }

        # ── Priority 2: WAIT command (Immediate Pause) ──
        if self.is_wait_command(text):
            self.state = AgentState.PAUSED
            self.current_speaking_text = None
            latency_ms = (time.time() - start_time) * 1000
            return {
                "action": "PAUSE",
                "state": AgentState.PAUSED.value,
                "cancel_speech": True,
                "latency_ms": round(latency_ms, 2),
                "message": "Assistant paused. Say resume or continue to wake me.",
            }

        # ── Priority 3: PAUSED State Check ──
        if self.state == AgentState.PAUSED:
            if self.is_resume_command(text):
                self.state = AgentState.LISTENING
                latency_ms = (time.time() - start_time) * 1000
                return {
                    "action": "RESUME",
                    "state": AgentState.LISTENING.value,
                    "cancel_speech": False,
                    "latency_ms": round(latency_ms, 2),
                    "message": "Assistant resumed. How can I help you?",
                }
            # Strictly ignore all background chatter while paused
            return {
                "action": "IGNORE",
                "state": AgentState.PAUSED.value,
                "reason": "Assistant is paused; waiting for resume command.",
            }

        # ── Priority 4: Acoustic Self-Echo Filter ──
        is_echo = self.echo_filter.is_self_echo(
            text, self.last_spoken_text, self.last_speech_end_time_ms
        ) or (
            is_speaking
            and self.echo_filter.is_active_speech_echo(text, self.current_speaking_text)
        )

        if is_echo:
            return {
                "action": "IGNORE_ECHO",
                "state": self.state.value,
                "reason": "Acoustic loopback echo suppressed.",
            }

        # ── Priority 5: Human Interruption during active TTS ──
        cancel_tts = False
        if is_speaking or self.state == AgentState.SPEAKING:
            cancel_tts = True
            self.state = AgentState.LISTENING

        # ── Priority 6: Intent Classification & Routing ──
        self.state = AgentState.PROCESSING
        intent_result = self.intent_router.classify_intent(text)

        latency_ms = (time.time() - start_time) * 1000

        return {
            "action": "EXECUTE_INTENT",
            "state": AgentState.SPEAKING.value if intent_result.get("speech_feedback") else AgentState.LISTENING.value,
            "cancel_speech": cancel_tts,
            "intent": intent_result.get("intent"),
            "target_mode": intent_result.get("target_mode"),
            "speech_feedback": intent_result.get("speech_feedback"),
            "latency_ms": round(latency_ms, 2),
        }
