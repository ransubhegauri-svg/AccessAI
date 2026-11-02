# AccessAI Accessibility Backend Service 🎙️ 🤟

Autonomous, low-latency Multi-Modal Accessibility microservice built specifically for **AccessAI** — an assistive education platform enabling hands-free, multilingual learning for deaf/mute, visually impaired, motor impaired, and neurodivergent learners.

---

## 🌟 Key Technical Highlights

### 1. Deaf/Mute Sign Language Engine & Accessible Meeting Bridge 🤟
- **MediaPipe 21 3D Hand Landmark Geometric Classifier**: Real-time evaluation of joint angles, finger extension, and directional vectors for conversational sign language (Open Palm, Thumbs Up, Closed Fist, Pointing Up, Victory, I Love You, Gun Signs).
- **650ms Stable Hold Window & 1400ms Debounce**: Promoted Team Decision #4 — prevents involuntary jitter or transitions from emitting false gestures.
- **Zero Mandatory Permissions Contract**: Promoted Team Decision #2 — microphone permission is NEVER mandatory or requested for Deaf/Mute participants. Camera is 100% voluntary (default OFF), with accessible text and quick responses as primary fallback.
- **3D Sign Avatar Sync**: Promoted Team Decision #7 — automatically translates recognized signs and speech captions into synchronized 3D WebGL avatar actions.
- **8 Standardized Quick Responses**: Promoted Team Decision #9 — allows deaf/mute students without cameras to participate with 1-click verified phrases.

### 2. Autonomous Voice Assistant Engine (Blind & Motor Learners) 🎙️
- **Sub-120ms Natural Barge-In Interruption**: Allows students to interrupt the assistant naturally at any moment by saying *"stop"*, *"wait"*, *"रुको"* (Hindi), or *"ನಿಲ್ಲಿಸು"* (Kannada).
- **Trilingual Indic Phonetic Transliteration Engine**: Converts spoken Kannada and Hindi into clean English Latin text for form fields, logins, and queries with phonetic name normalization (e.g. *ಅಮನ್* -> **Aman**, *ವೃಷಾ* -> **Vrusha**, *ಗೌರಿ* -> **Gauri**).
- **Acoustic Self-Echo Suppression**: Loopback cancellation filter prevents the microphone from hearing and responding to the assistant's own TTS output.
- **Meko Adaptive Voice Memory**: Dynamically calibrates student speech rate between **0.7x** and **1.5x**.

---

## 🏗️ Architecture

```
accessai-backend/
├── app.py                      # Multi-Modal Flask REST API microservice
├── config.py                   # Port, latency targets, and locale settings
├── gesture_controller.py       # Standalone MediaPipe gesture controller CLI & DOM bridge
├── requirements.txt            # Python dependencies
├── README.md
├── sign_engine/                # 🤟 Deaf/Mute Sign Language Package
│   ├── __init__.py
│   ├── gesture_recognizer.py   # 21-landmark 3D classifier & 650ms hold engine
│   ├── sign_dictionary.py      # ASL/ISL vocabulary glosses & avatar triggers
│   └── meeting_bridge.py       # Zero-permissions contract & role-based sessions
├── voice_engine/               # 🎙️ Voice Assistant Package
│   ├── __init__.py
│   ├── agent.py                # Core state machine & barge-in logic
│   ├── echo_filter.py          # Acoustic loopback & self-recognition filter
│   ├── indic_transliterate.py  # Trilingual phonetics & name normalizer
│   ├── intent_router.py        # Accessibility mode and command parser
│   └── meko_voice_memory.py    # Meko auditory rate calibration
├── test_sign_engine.py         # Sign language & meeting test suite (14 tests)
└── test_voice_agent.py         # Voice agent test suite (12 tests)
```

---

## 🚀 Quick Start

### 1. Installation
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Run Test Suites
```bash
# Run Sign Language & Meeting Bridge tests (14 tests)
python test_sign_engine.py

# Run Voice Agent tests (12 tests)
python test_voice_agent.py
```

### 3. Start Service
```bash
python app.py
```
*Service will start at `http://localhost:5002`.*

---

## 📡 REST API Reference

### Sign Language & Deaf/Mute Endpoints 🤟

#### 1. `POST /api/sign/evaluate`
Evaluates 21 MediaPipe hand landmarks against geometric classification and 650ms hold stabilization.

**Request Body:**
```json
{
  "landmarks": [
    { "x": 0.5, "y": 0.8, "z": 0.0 },
    ...
  ],
  "handedness": "Right"
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "gesture": "Thumb_Up",
    "label": "I Agree / Yes",
    "phrase": "I agree with this proposal.",
    "avatar_action": "YES",
    "confidence": 0.95,
    "hold_progress": 1.0,
    "is_stable": true,
    "is_committed": true
  }
}
```

#### 2. `POST /api/sign/meeting/join`
Enforces the Zero Mandatory Permissions Contract and returns role-based student permissions.

**Request Body:**
```json
{
  "meeting_id": "accessai-room-402",
  "student_id": "demo-deaf-001",
  "mode": "deaf_mute"
}
```

**Response:**
```json
{
  "success": true,
  "meeting_id": "accessai-room-402",
  "student_authorization": {
    "role": "student",
    "is_host": false,
    "can_kick": false,
    "can_end_meeting": false,
    "permissions": ["join_only", "send_text", "send_signs", "receive_captions", "view_3d_avatar"]
  },
  "zero_mandatory_permissions_contract": {
    "microphone_required": false,
    "microphone_requested": false,
    "camera_required": false,
    "camera_default_state": "OFF",
    "text_fallback_active": true
  }
}
```

#### 3. `GET /api/sign/gestures`
Returns the complete dictionary of supported ASL/ISL sign vocabulary, hold durations, and 3D avatar mappings.

#### 4. `GET /api/sign/quick-responses`
Returns the 8 standardized 1-click fallback responses for deaf/mute students (`Yes`, `No`, `I agree`, `I disagree`, `Please repeat`, `I have a question`, `I need help`, `Thank you`).

---

### Voice Agent Endpoints 🎙️

#### 1. `POST /api/voice/process`
Evaluates microphone speech transcripts with immediate sub-120ms barge-in cancellation.

#### 2. `POST /api/voice/transliterate`
Transliterates spoken Indic speech (Kannada/Hindi) into normalized English Latin text.

#### 3. `GET /api/voice/health`
Health check and supported locales (`en-US`, `hi-IN`, `kn-IN`).

---

## 👥 Contributors & Team
- **Deaf/Mute Sign Language Engine & Meeting Bridge**: Nupur Walwadkar ([@walwadkarnupur-design](https://github.com/walwadkarnupur-design))
- **Voice Agent Backend & Engine**: Gauri Ransubhe ([@ransubhegauri-svg](https://github.com/ransubhegauri-svg))
- **Platform Integration**: AccessAI Team
