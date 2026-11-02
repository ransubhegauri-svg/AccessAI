"""
AccessAI Voice Agent Engine
Autonomous speech processing, natural barge-in interruption, and Indic transliteration microservice.
"""

from .agent import VoiceAgentEngine, AgentState
from .echo_filter import EchoFilter
from .indic_transliterate import (
    is_indic,
    is_kannada,
    is_hindi,
    transliterate_indic_to_english,
    normalize_indic_name,
    normalize_indic_digits,
    normalize_indic_email,
    parse_indic_age,
    parse_indic_gender,
    parse_indic_yes_no,
)
from .intent_router import IntentRouter

__all__ = [
    "VoiceAgentEngine",
    "AgentState",
    "EchoFilter",
    "is_indic",
    "is_kannada",
    "is_hindi",
    "transliterate_indic_to_english",
    "normalize_indic_name",
    "normalize_indic_digits",
    "normalize_indic_email",
    "parse_indic_age",
    "parse_indic_gender",
    "parse_indic_yes_no",
    "IntentRouter",
]
