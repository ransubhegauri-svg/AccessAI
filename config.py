"""
Configuration parameters for AccessAI Voice Agent Backend.
"""

import os

PORT = int(os.environ.get("VOICE_AGENT_PORT", 5002))
HOST = os.environ.get("VOICE_AGENT_HOST", "0.0.0.0")
DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1")

# Interruption & Echo Thresholds
BARGE_IN_TIMEOUT_MS = 120  # Target latency for instant stop
ECHO_SUPPRESSION_WINDOW_MS = 1200  # Window after TTS speech to filter loopback
ECHO_WORD_OVERLAP_THRESHOLD = 0.6  # Overlap ratio required to classify as echo

# Language locales supported
SUPPORTED_LOCALES = ["en-US", "hi-IN", "kn-IN"]
