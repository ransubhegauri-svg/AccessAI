# AccessAI Voice Agent Backend Service 🎙️

Autonomous, low-latency Voice Assistant microservice built specifically for **AccessAI** — an assistive education platform enabling hands-free, multilingual learning for visually impaired, motor impaired, and neurodivergent learners.

---

## 🌟 Key Technical Highlights

1. **Sub-120ms Natural Barge-In Interruption**:
   - Allows students to interrupt the assistant naturally at any moment by saying words like *"stop"*, *"wait"*, *"रुको"* (Hindi), or *"ನಿಲ್ಲಿಸು"* (Kannada).
   - Instant speech synthesizer cancellation (`cancel_speech: true`) with sub-120ms latency.

2. **Trilingual Indic Phonetic Transliteration Engine**:
   - Converts spoken Kannada and Hindi (Devanagari) into clean English Latin text for form fields, logins, and queries.
   - Comprehensive dictionary mapping for Indian names (e.g. *ಅಮನ್* / *अमन* -> **Aman**, *ವೃಷಾ* / *वृषा* -> **Vrusha**, *ಗೌರಿ* / *गौरी* -> **Gauri**).
   - Normalizes Indic numerals (`೦-೯` and `०-९`) and spoken digits into standard ASCII.
   - Transforms spoken email syntax (*"at the rate"*, *"dot"*, *"ಡಾಟ್"*) into standard emails.

3. **Acoustic Self-Echo Suppression**:
   - Loopback cancellation filter prevents the microphone from hearing and responding to the assistant's own TTS output.
   - 1200ms decay window with a 60% keyword overlap classification threshold.

4. **Meko Adaptive Voice Memory Integration**:
   - Dynamically calibrates student speech rate between **0.7x** and **1.5x** to adapt to individual auditory and cognitive processing needs.
   - Emits structured `MEKO_VOICE_PROFILE` memory packets.

---

## 🏗️ Architecture

```
accessai-voice-agent-backend/
├── app.py                      # Flask REST microservice API
├── config.py                   # Port, latency targets, and locale settings
├── voice_engine/
│   ├── __init__.py
│   ├── agent.py                # Core state machine & barge-in logic
│   ├── echo_filter.py          # Acoustic loopback & self-recognition filter
│   ├── indic_transliterate.py  # Trilingual phonetics & name normalizer
│   ├── intent_router.py        # Accessibility mode and command parser
│   └── meko_voice_memory.py    # Meko auditory rate calibration
├── test_voice_agent.py         # Automated test suite
├── requirements.txt            # Python dependencies
└── README.md
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

### 2. Run Tests
```bash
python test_voice_agent.py
```

### 3. Start Service
```bash
python app.py
```
*Service will start at `http://localhost:5002`.*

---

## 📡 REST API Reference

### 1. `POST /api/voice/process`
Evaluates microphone speech transcripts with immediate barge-in evaluation.

**Request Body:**
```json
{
  "transcript": "stop speaking",
  "state": "SPEAKING",
  "is_speaking": true,
  "last_spoken_text": "Welcome to your Python lesson"
}
```

**Response:**
```json
{
  "action": "BARGE_IN_STOP",
  "cancel_speech": true,
  "state": "LISTENING",
  "latency_ms": 1.25,
  "message": "Assistant stopped and listening for your next request."
}
```

### 2. `POST /api/voice/transliterate`
Transliterates spoken Indic speech into clean English Latin text.

**Request Body:**
```json
{
  "text": "ಅಮನ್",
  "type": "name"
}
```

**Response:**
```json
{
  "original_text": "ಅಮನ್",
  "is_indic": true,
  "normalized": "Aman",
  "type": "name"
}
```

### 3. `GET /api/voice/health`
Health check and supported locales (`en-US`, `hi-IN`, `kn-IN`).

---

## 👥 Contributors & Team
- **Voice Agent Backend & Engine**: Gauri Ransubhe ([@ransubhegauri-svg](https://github.com/ransubhegauri-svg))
- **Platform Integration**: AccessAI Team
