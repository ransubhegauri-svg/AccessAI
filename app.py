"""
AccessAI Multi-Modal Accessibility REST Microservice
Lightweight, high-performance Flask API for speech processing, natural barge-in interruption,
Indic transliteration, and Deaf/Mute Sign Language recognition.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

import config
from voice_engine.agent import VoiceAgentEngine
from voice_engine.indic_transliterate import (
    is_indic,
    normalize_indic_digits,
    normalize_indic_email,
    normalize_indic_name,
    parse_indic_age,
    parse_indic_gender,
    parse_indic_yes_no,
    transliterate_indic_to_english,
)
from voice_engine.meko_voice_memory import MekoVoiceMemory

# Deaf/Mute Sign Language Engine & Meeting Bridge
from sign_engine.gesture_recognizer import SignLanguageEngine
from sign_engine.sign_dictionary import list_all_signs, get_sign_details
from sign_engine.meeting_bridge import (
    MeetingAccessController,
    QUICK_RESPONSES,
    validate_meeting_message
)

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin requests for AccessAI frontend

# Initialize singletons
agent_engine = VoiceAgentEngine()
voice_memories = {}  # In-memory student cache
sign_engine = SignLanguageEngine()


# ======================================================================================
# 1. VOICE AGENT ENDPOINTS (Visually Impaired & Motor Impaired Learners)
# ======================================================================================

@app.route("/api/voice/health", methods=["GET"])
def health_check():
    """Health check endpoint for container orchestrators and frontend ping."""
    return jsonify({
        "status": "healthy",
        "service": "AccessAI Voice Agent Engine",
        "version": "2.1.0",
        "supported_locales": config.SUPPORTED_LOCALES,
        "engine_state": agent_engine.state.value,
    }), 200


@app.route("/api/voice/process", methods=["POST"])
def process_voice():
    """
    Main audio transcript evaluation endpoint.
    Handles barge-in interruption, pause/resume, and platform intent routing.
    """
    data = request.get_json(silent=True) or {}
    transcript = data.get("transcript", "")
    current_state = data.get("state")
    is_speaking = bool(data.get("is_speaking", False))
    current_speaking_text = data.get("current_speaking_text")
    last_spoken_text = data.get("last_spoken_text")
    last_speech_end_time_ms = data.get("last_speech_end_time_ms")

    result = agent_engine.process_input(
        transcript=transcript,
        current_state=current_state,
        is_speaking=is_speaking,
        current_speaking_text=current_speaking_text,
        last_spoken_text=last_spoken_text,
        last_speech_end_time_ms=last_speech_end_time_ms,
    )

    return jsonify(result), 200


@app.route("/api/voice/transliterate", methods=["POST"])
def transliterate_indic():
    """
    Transliterates and formats Indic speech transcripts (Hindi & Kannada) into English.
    Supports specific target types: name, digits, email, age, gender, yes_no, or generic.
    """
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    target_type = data.get("type", "generic").lower()

    if not text:
        return jsonify({"success": False, "error": "No text provided"}), 400

    result = {
        "original_text": text,
        "is_indic": is_indic(text),
        "type": target_type,
    }

    if target_type == "name":
        result["normalized"] = normalize_indic_name(text)
    elif target_type == "digits":
        result["normalized"] = normalize_indic_digits(text)
    elif target_type == "email":
        result["normalized"] = normalize_indic_email(text)
    elif target_type == "age":
        result["value"] = parse_indic_age(text)
    elif target_type == "gender":
        result["value"] = parse_indic_gender(text)
    elif target_type == "yes_no":
        result["value"] = parse_indic_yes_no(text)
    else:
        result["normalized"] = transliterate_indic_to_english(text)

    return jsonify(result), 200


@app.route("/api/voice/calibrate", methods=["POST"])
def calibrate_student_voice():
    """
    Calibrates speech rate and locale preference for a student Meko profile.
    """
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id", "demo_student")
    voice_rate = data.get("voice_rate")
    language = data.get("language")

    if student_id not in voice_memories:
        voice_memories[student_id] = MekoVoiceMemory(student_id=student_id)

    profile = voice_memories[student_id]
    if voice_rate is not None:
        profile.calibrate_speech_rate(float(voice_rate))
    if language:
        profile.set_language(str(language))

    return jsonify({
        "success": True,
        "meko_packet": profile.to_meko_packet(),
    }), 200


@app.route("/api/voice/commands", methods=["GET"])
def get_supported_commands():
    """Returns directory of supported commands across English, Hindi, and Kannada."""
    return jsonify({
        "barge_in_stop": [
            "stop", "stop talking", "stop speaking", "enough", "be quiet", "cancel",
            "रुको", "रुकिए", "बंद करो", "चुप रहो", "बस करो",
            "ನಿಲ್ಲಿಸು", "ಸಾಕು", "ಮಾತನಾಡಬೇಡ"
        ],
        "pause_wait": [
            "wait", "hold on", "one second", "give me a moment", "just a second",
            "ठहरो", "एक मिनट", "थोड़ा रुको", "एक सेकंड",
            "ಸ್ವಲ್ಪ ನಿಲ್ಲಿ", "ತಡಿ", "ಒಂದು ನಿಮಿಷ"
        ],
        "resume": [
            "resume", "continue", "start listening", "keep going", "wake up",
            "जारी रखो", "फिर से सुनो", "शुरू करो",
            "ಮುಂದುವರಿಸು", "ಪ್ರಾರಂಭಿಸು"
        ],
        "accessibility_modes": [
            "blind mode", "deaf mode", "motor mode", "dyslexia mode", "adhd mode", "teacher portal"
        ]
    }), 200


# ======================================================================================
# 2. SIGN LANGUAGE & DEAF/MUTE MEETING ENDPOINTS
# ======================================================================================

@app.route("/api/sign/health", methods=["GET"])
def sign_health_check():
    """Health check for Sign Language detection engine and vocabulary store."""
    return jsonify({
        "status": "healthy",
        "service": "AccessAI Sign Language & Gesture Engine",
        "version": "1.4.0",
        "vocabulary_count": len(list_all_signs()),
        "hold_window_ms": SignLanguageEngine.HOLD_WINDOW_MS,
        "cooldown_ms": SignLanguageEngine.DEBOUNCE_COOLDOWN_MS,
        "contracts": [
            "Check T: Decision 1 (Two-Way Meeting Schema)",
            "Check T: Decision 2 (Zero Mandatory Permissions)",
            "Check T: Decision 4 (Sign Language Pipeline 650ms Hold)",
            "Check T: Decision 7 (3D Avatar Action Sync)",
            "Check T: Decision 9 (Mandatory Text & 8 Quick Responses)"
        ]
    }), 200


@app.route("/api/sign/gestures", methods=["GET"])
def get_supported_gestures():
    """Returns complete catalog of supported sign gestures and avatar actions."""
    return jsonify({
        "total": len(list_all_signs()),
        "gestures": list_all_signs()
    }), 200


@app.route("/api/sign/evaluate", methods=["POST"])
def evaluate_sign_frame():
    """
    Evaluates 21 MediaPipe hand landmarks with 650ms hold stabilization.
    Payload: { landmarks: [{x, y, z}, ...], handedness: 'Right' | 'Left' }
    """
    data = request.get_json(silent=True) or {}
    landmarks = data.get("landmarks", [])
    handedness = data.get("handedness", "Right")

    if not landmarks or len(landmarks) < 21:
        return jsonify({
            "success": False,
            "error": "At least 21 normalized 3D hand landmarks are required"
        }), 400

    result = sign_engine.evaluate_frame(landmarks, handedness)
    return jsonify({
        "success": True,
        "evaluation": result
    }), 200


@app.route("/api/sign/meeting/join", methods=["POST"])
def join_sign_meeting():
    """
    Role-based student join endpoint enforcing Zero Mandatory Permissions Contract:
    - Microphone is NEVER mandatory or requested for Deaf/Mute participants.
    - Camera is voluntary, default OFF on join, with text as primary fallback.
    - Participant-level access only (isHost: false, cannot kick or end meeting).
    """
    data = request.get_json(silent=True) or {}
    meeting_id = data.get("meeting_id") or data.get("meetingId") or "accessai-room-402"
    student_id = data.get("student_id") or data.get("studentId") or "demo-deaf-001"
    mode = data.get("mode", "deaf_mute")

    session = MeetingAccessController.create_student_join_session(meeting_id, student_id, mode)
    return jsonify(session), 200


@app.route("/api/sign/quick-responses", methods=["GET"])
def get_quick_responses():
    """Returns 8 standardized 1-click responses for deaf/mute students without cameras."""
    return jsonify({
        "count": len(QUICK_RESPONSES),
        "responses": QUICK_RESPONSES
    }), 200


@app.route("/api/sign/message/validate", methods=["POST"])
def validate_message():
    """Validates meeting message against Two-Way Meeting Message Schema (Decision 1)."""
    data = request.get_json(silent=True) or {}
    is_valid, msg = validate_meeting_message(data)
    return jsonify({
        "valid": is_valid,
        "detail": msg
    }), 200 if is_valid else 400


if __name__ == "__main__":
    print(f"Starting AccessAI Multi-Modal Accessibility Backend on port {config.PORT}...")
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
