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

# Motor & Mobility Assistive Suite (Spatial Head-Tracking, Dwell Pacing, Switch Scanning)
from mobility_engine import (
    TremorFilter,
    HeadPointerMapper,
    DwellTimer,
    SwitchScanningStateMachine,
    ScanMode,
    MekoMotorProfile,
)

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin requests for AccessAI frontend

# Initialize singletons
agent_engine = VoiceAgentEngine()
voice_memories = {}  # In-memory student cache
sign_engine = SignLanguageEngine()
head_mapper = HeadPointerMapper()
dwell_timer = DwellTimer()
switch_scanner = SwitchScanningStateMachine()
motor_profiles = {}  # In-memory motor accommodation cache: { student_id: MekoMotorProfile }


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


# ======================================================================================
# 3. MOTOR & MOBILITY ASSISTIVE ENDPOINTS (Tremor Filter, Dwell Engine, Switch Scanning)
# ======================================================================================

@app.route("/api/mobility/health", methods=["GET"])
def mobility_health():
    """Health check endpoint for Motor & Mobility Assistive Engine."""
    return jsonify({
        "status": "healthy",
        "service": "AccessAI Motor & Mobility Assistive Suite",
        "version": "2.2.0",
        "features": {
            "head_tracking": True,
            "tremor_filter": True,
            "dwell_click": True,
            "switch_scanning": True,
            "meko_profile_sync": True
        },
        "dwell_config": {
            "dwell_time_ms": dwell_timer.dwell_time_ms,
            "tolerance_px": dwell_timer.tolerance_px
        },
        "switch_config": {
            "mode": str(switch_scanner.mode),
            "target_count": len(switch_scanner.targets)
        }
    }), 200


@app.route("/api/mobility/headtrack/process", methods=["POST"])
def process_headtrack():
    """
    Processes normalized 3D nose/facial landmark coordinates:
    Applies neutral calibration offset, sensitivity multiplier, resting deadband,
    and velocity-adaptive EMA tremor suppression.
    """
    data = request.get_json(silent=True) or {}
    norm_x = data.get("normalized_x")
    norm_y = data.get("normalized_y")
    screen_w = data.get("screen_width", 1920)
    screen_h = data.get("screen_height", 1080)
    dt = data.get("delta_time_s", 0.016)

    if norm_x is None or norm_y is None:
        return jsonify({
            "success": False,
            "error": "normalized_x and normalized_y are required (range 0.0 to 1.0)"
        }), 400

    coords = head_mapper.process_landmark(
        normalized_x=float(norm_x),
        normalized_y=float(norm_y),
        screen_width=int(screen_w),
        screen_height=int(screen_h),
        dt=float(dt)
    )

    return jsonify({
        "success": True,
        "coordinates": coords
    }), 200


@app.route("/api/mobility/headtrack/calibrate", methods=["POST"])
def calibrate_headtrack():
    """
    Calibrates neutral resting head orientation and sensitivity scaling.
    """
    data = request.get_json(silent=True) or {}
    neutral_x = data.get("neutral_x", 0.5)
    neutral_y = data.get("neutral_y", 0.5)
    sensitivity = data.get("sensitivity", 2.2)
    deadband_radius = data.get("deadband_radius", 0.025)

    head_mapper.calibrate_neutral(float(neutral_x), float(neutral_y))
    head_mapper.set_sensitivity(float(sensitivity))
    head_mapper.deadband_radius = float(deadband_radius)

    return jsonify({
        "success": True,
        "message": "Head tracker calibrated successfully",
        "neutral_pose": {
            "x": head_mapper.neutral_x,
            "y": head_mapper.neutral_y
        },
        "sensitivity": head_mapper.sensitivity,
        "deadband_radius": head_mapper.deadband_radius
    }), 200


@app.route("/api/mobility/dwell/evaluate", methods=["POST"])
def evaluate_dwell():
    """
    Evaluates cursor dwelling over a spatial target circle.
    Returns status ('idle', 'dwelling', 'activated'), progress (0.0 to 1.0),
    and trigger signal when dwell threshold is completed.
    """
    data = request.get_json(silent=True) or {}
    x = data.get("x")
    y = data.get("y")
    timestamp_ms = data.get("timestamp_ms")
    custom_dwell = data.get("custom_dwell_ms")
    custom_tol = data.get("custom_tolerance_px")

    if x is None or y is None:
        return jsonify({"success": False, "error": "Coordinates x and y are required"}), 400

    if custom_dwell:
        dwell_timer.set_dwell_time(int(custom_dwell))
    if custom_tol:
        dwell_timer.set_tolerance(float(custom_tol))

    result = dwell_timer.evaluate(
        x=float(x),
        y=float(y),
        timestamp_ms=float(timestamp_ms) if timestamp_ms is not None else None
    )

    return jsonify({
        "success": True,
        "dwell": result.to_dict()
    }), 200


@app.route("/api/mobility/dwell/reset", methods=["POST"])
def reset_dwell():
    """Resets active dwell timer (e.g. after deliberate movement or click dispatch)."""
    dwell_timer.reset()
    return jsonify({
        "success": True,
        "message": "Dwell timer reset"
    }), 200


@app.route("/api/mobility/switch/event", methods=["POST"])
def switch_event():
    """
    Processes assistive switch trigger events (e.g. single-switch spacebar/sip-and-puff,
    or dual-switch step/select).
    Supports AUTO, STEP, and ROW_COLUMN modes with 200ms spasm debounce.
    """
    data = request.get_json(silent=True) or {}
    event_type = data.get("event_type", "press")
    switch_id = int(data.get("switch_id", 1))
    timestamp_ms = data.get("timestamp_ms")

    result = switch_scanner.handle_event(
        event_type=event_type,
        switch_id=switch_id,
        current_time_ms=float(timestamp_ms) if timestamp_ms is not None else None
    )

    return jsonify({
        "success": True,
        "scanner_state": result
    }), 200


@app.route("/api/mobility/switch/targets", methods=["POST"])
def configure_switch_targets():
    """Configures clickable UI target items and hierarchical row-column matrix."""
    data = request.get_json(silent=True) or {}
    targets = data.get("targets")
    grid = data.get("row_column_grid")
    mode_str = data.get("mode")

    if mode_str:
        switch_scanner.mode = str(mode_str)

    if grid and isinstance(grid, list):
        switch_scanner.set_row_column_grid(grid)
    elif targets and isinstance(targets, list):
        switch_scanner.set_targets(targets)

    return jsonify({
        "success": True,
        "mode": str(switch_scanner.mode),
        "target_count": len(switch_scanner.targets)
    }), 200


@app.route("/api/mobility/profile/calibrate", methods=["POST"])
def calibrate_motor_profile():
    """
    Calibrates student motor accommodation parameters:
    - dwell_time_ms (500ms - 5000ms)
    - hit_target_min_px (min 48px WCAG AAA)
    - tremor_smoothing_alpha (0.05 - 0.95)
    - debounce_guard_ms (min 150ms)
    Generates Meko Cloud Datapack vector memory packet.
    """
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id") or "demo-motor-001"
    student_name = data.get("student_name") or "Aarav Patel"

    profile = MekoMotorProfile(
        student_id=student_id,
        student_name=student_name,
        dwell_time_ms=int(data.get("dwell_time_ms", 1400)),
        hit_target_min_px=int(data.get("hit_target_min_px", 56)),
        tremor_smoothing_alpha=float(data.get("tremor_smoothing_alpha", 0.25)),
        debounce_guard_ms=int(data.get("debounce_guard_ms", 200)),
        preferred_input=data.get("preferred_input", "head_tracking_with_dwell"),
        notes=data.get("notes", "")
    )

    motor_profiles[student_id] = profile

    # Apply parameters to active singletons
    dwell_timer.set_dwell_time(profile.dwell_time_ms)
    head_mapper.filter.base_alpha = profile.tremor_smoothing_alpha

    meko_packet = profile.generate_meko_memory_packet()

    return jsonify({
        "success": True,
        "message": f"Motor profile calibrated for {student_name}",
        "profile": profile.to_dict(),
        "meko_memory_packet": meko_packet
    }), 200


@app.route("/api/mobility/profile/<student_id>", methods=["GET"])
def get_motor_profile(student_id):
    """Retrieves motor profile and Meko memory schema for a given student."""
    profile = motor_profiles.get(student_id)
    if not profile:
        # Default profile for demo-motor-001 if not calibrated yet
        profile = MekoMotorProfile(student_id=student_id, student_name="Aarav Patel")
        motor_profiles[student_id] = profile

    return jsonify({
        "success": True,
        "profile": profile.to_dict(),
        "meko_memory_packet": profile.generate_meko_memory_packet()
    }), 200


if __name__ == "__main__":
    print(f"Starting AccessAI Multi-Modal Accessibility Backend on port {config.PORT}...")
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
