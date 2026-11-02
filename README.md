# AccessAI Accessibility Backend Service 🎙️ 🤟 ♿

Autonomous, low-latency Multi-Modal Accessibility microservice built specifically for **AccessAI** — an assistive education platform enabling hands-free, multilingual learning for deaf/mute, visually impaired, motor impaired, and neurodivergent learners.

---

## 🌟 Key Technical Highlights

### 1. Motor & Mobility Assistive Suite (Cerebral Palsy, ALS, Parkinsonian Tremors) ♿
- **Adaptive Tremor Suppression Filter**: Velocity-adaptive Exponential Moving Average (EMA) low-pass filter with resting deadband zone. Dynamically scales alpha (0.05 to 0.95) to suppress high-frequency involuntary micro-tremors without introducing noticeable saccadic lag.
- **Head-Pointer Viewport Mapper**: Maps normalized 3D facial/head landmark pose to screen coordinates $(0 \text{ to } \text{width}, 0 \text{ to } \text{height})$, with 1-point neutral calibration, deadband resting zone, sensitivity scaling $(0.2\times \text{ to } 5.0\times)$, and screen boundary clamping.
- **Spatial Dwell-Click Pacing Engine**: Hands-free click dispatch with configurable pacing ($500\text{ms} - 5000\text{ms}$, default $1400\text{ms}$), radial tolerance circle ($10\text{px} - 120\text{px}$, default $36\text{px}$) absorbing spasms, and progressive countdown calculation $(0.0 \to 1.0)$ for circular UI indicators.
- **Hierarchical Switch-Scanning State Machine**: Full platform control for single-switch, dual-switch, and sip-and-puff users. Supports `Auto-Scan`, `Step-Scan`, and `Row-Column` matrix scanning that reduces motor fatigue from $O(N)$ to $O(\sqrt{N})$. Enforces a $200\text{ms}$ post-activation debounce guard to prevent spasm-triggered double-clicks.
- **Meko Motor Accommodation Profile**: Durable vector memory profile syncing individual dwell times, WCAG AAA minimum $48\text{px}$ hit targets, and tremor smoothing to Meko Cloud Datapack `3bbeb08c-6e41-45a6-9d4f-332b4ad3a254`.

### 2. Deaf/Mute Sign Language Engine & Accessible Meeting Bridge 🤟
- **MediaPipe 21 3D Hand Landmark Geometric Classifier**: Real-time evaluation of joint angles, finger extension, and directional vectors for conversational sign language (Open Palm, Thumbs Up, Closed Fist, Pointing Up, Victory, I Love You, Gun Signs).
- **650ms Stable Hold Window & 1400ms Debounce**: Promoted Team Decision #4 — prevents involuntary jitter or transitions from emitting false gestures.
- **Zero Mandatory Permissions Contract**: Promoted Team Decision #2 — microphone permission is NEVER mandatory or requested for Deaf/Mute participants. Camera is 100% voluntary (default OFF), with accessible text and quick responses as primary fallback.
- **3D Sign Avatar Sync**: Promoted Team Decision #7 — automatically translates recognized signs and speech captions into synchronized 3D WebGL avatar actions.
- **8 Standardized Quick Responses**: Promoted Team Decision #9 — allows deaf/mute students without cameras to participate with 1-click verified phrases.

### 3. Autonomous Voice Assistant Engine (Blind & Low Vision Learners) 🎙️
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
├── mobility_engine/            # ♿ Motor & Mobility Assistive Package
│   ├── __init__.py             # Exports TremorFilter, HeadPointerMapper, DwellTimer, SwitchScanner, MekoMotorProfile
│   ├── head_tracker_filter.py  # Adaptive EMA tremor filter & screen pointer projection
│   ├── dwell_engine.py         # Spatial dwell-click pacing & radial tolerance circle
│   ├── switch_scanner.py       # Hierarchical single/dual switch scanner & spasm debounce guard
│   └── motor_profile.py        # WCAG AAA 48px hit target & Meko Cloud memory sync
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
├── test_mobility_engine.py     # Motor & mobility unit/API test suite (20 tests)
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
# Run Motor & Mobility Assistive tests (20 tests)
python test_mobility_engine.py

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

### Motor & Mobility Endpoints ♿

#### 1. `GET /api/mobility/health`
Returns health status, active motor accommodation features, and switch scanner configurations.

#### 2. `POST /api/mobility/headtrack/process`
Smooths normalized head landmarks using velocity-adaptive EMA tremor suppression and projects to screen coordinates.
```json
{
  "normalized_x": 0.52,
  "normalized_y": 0.48,
  "screen_width": 1920,
  "screen_height": 1080,
  "delta_time_s": 0.016
}
```

#### 3. `POST /api/mobility/headtrack/calibrate`
Calibrates forward-facing neutral head pose and sensitivity scaling.
```json
{
  "neutral_x": 0.5,
  "neutral_y": 0.5,
  "sensitivity": 2.2,
  "deadband_radius": 0.025
}
```

#### 4. `POST /api/mobility/dwell/evaluate`
Evaluates dwell-click pacing over spatial target coordinates.
```json
{
  "x": 960,
  "y": 540,
  "timestamp_ms": 1700000000000,
  "custom_dwell_ms": 1400,
  "custom_tolerance_px": 36
}
```

#### 5. `POST /api/mobility/switch/event`
Handles single/dual switch press events with 200ms spasm debounce guard.
```json
{
  "event_type": "press",
  "switch_id": 1,
  "timestamp_ms": 1700000000000
}
```

#### 6. `POST /api/mobility/profile/calibrate`
Persists individual motor accommodation parameters and emits a structured vector memory packet for Meko Cloud Datapack `3bbeb08c-6e41-45a6-9d4f-332b4ad3a254`.
```json
{
  "student_id": "demo-motor-001",
  "student_name": "Aarav Patel",
  "dwell_time_ms": 1400,
  "hit_target_min_px": 56,
  "tremor_smoothing_alpha": 0.25,
  "debounce_guard_ms": 200
}
```

---

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
