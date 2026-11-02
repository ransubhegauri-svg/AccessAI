/**
 * AccessAI Sign Language Detection & Sentence Translation Engine
 * 
 * Powered by MediaPipe Tasks Vision (Gesture Recognizer) + 21-point 3D Landmark Geometric Classification.
 * Supports:
 * - Continuous hands-free sign recognition
 * - Landmark skeleton drawing
 * - Hold stabilization & debouncing
 * - Confidence scoring & uncertainty detection
 * - Natural sentence construction for accessible meetings
 */

import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";

// Meeting-tailored Sign Vocabulary Definitions
export const MEETING_SIGN_VOCABULARY = {
  // Common Conversational & Meeting Gestures
  Open_Palm: {
    label: "Hello Everyone",
    phrase: "Hello everyone,",
    category: "greeting",
    icon: "✋",
    description: "Open palm facing forward"
  },
  Thumb_Up: {
    label: "I Agree / Yes",
    phrase: "I agree with this proposal.",
    category: "agreement",
    icon: "👍",
    description: "Thumbs up gesture"
  },
  Closed_Fist: {
    label: "I Disagree / No",
    phrase: "I respectfully disagree.",
    category: "disagreement",
    icon: "✊",
    description: "Closed fist held steady"
  },
  Pointing_Up: {
    label: "I Have a Question",
    phrase: "Excuse me, I have a question.",
    category: "interaction",
    icon: "☝️",
    description: "Index finger pointing up"
  },
  Victory: {
    label: "Peace / Understood",
    phrase: "Understood, that makes sense.",
    category: "acknowledgment",
    icon: "✌️",
    description: "V / Peace sign with index and middle"
  },
  ILoveYou: {
    label: "Thank You All",
    phrase: "Thank you so much everyone.",
    category: "courtesy",
    icon: "🤟",
    description: "Thumb, index, and pinky extended (ASL ILY)"
  },
  GUN_LEFT: {
    label: "Please Repeat",
    phrase: "Could you please repeat that point?",
    category: "clarification",
    icon: "👈",
    description: "Hand pointing leftwards"
  },
  GUN_RIGHT: {
    label: "Next Topic",
    phrase: "Let us move to the next item.",
    category: "navigation",
    icon: "👉",
    description: "Hand pointing rightwards"
  },
  WAIT_PALM: {
    label: "Please Wait",
    phrase: "Please give me a moment to respond.",
    category: "pacing",
    icon: "⏳",
    description: "Flat hand held horizontally"
  }
};

export class SignLanguageMeetingEngine {
  constructor(options = {}) {
    this.onSignDetected = options.onSignDetected || (() => {});
    this.onSentenceUpdated = options.onSentenceUpdated || (() => {});
    this.onHoldProgress = options.onHoldProgress || (() => {});
    this.onUnclearGesture = options.onUnclearGesture || (() => {});

    this.recognizer = null;
    this.stream = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.animFrameId = null;
    this.lastVideoTime = -1;

    // Detection stabilization states
    this.currentHoldGesture = null;
    this.holdStartTime = 0;
    this.lastRegisteredTime = 0;
    this.HOLD_DURATION_MS = 650;      // 650ms stable hold required to commit a sign
    this.COOLDOWN_MS = 1400;          // Prevent duplicate additions

    // Sentence accumulation buffer
    this.sentenceWords = [];
  }

  async initialize() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      this.recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      return true;
    } catch (err) {
      console.warn("GPU init failed, using CPU delegate:", err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        this.recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        return true;
      } catch (cpuErr) {
        console.error("Critical MediaPipe Initialization Error:", cpuErr);
        throw cpuErr;
      }
    }
  }

  async startCamera(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.useExistingStream = false;
    this.isStopped = false;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      });

      // Lock hardware / browser digital zoom and auto-framing to 1.0x (stable)
      try {
        const videoTrack = this.stream.getVideoTracks()[0];
        if (videoTrack && videoTrack.getCapabilities) {
          const caps = videoTrack.getCapabilities();
          if (caps.zoom) {
            await videoTrack.applyConstraints({
              advanced: [{ zoom: caps.zoom.min || 1 }]
            }).catch(() => {});
          }
        }
      } catch (zoomErr) {}

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this._startPredictionLoop();
      return true;
    } catch (err) {
      console.error("Camera access error:", err);
      throw err;
    }
  }

  attachExistingVideo(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.useExistingStream = true;
    this.isStopped = false;
    this._startPredictionLoop();
    return true;
  }

  stopCamera() {
    this.isStopped = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (!this.useExistingStream && this.videoElement) {
      this.videoElement.srcObject = null;
    }
    if (this.canvasElement) {
      const ctx = this.canvasElement.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      }
    }
    this.currentHoldGesture = null;
    this.onHoldProgress(0);
  }

  _startPredictionLoop() {
    const loop = () => {
      if (this.isStopped) return;
      const video = this.videoElement;
      const canvas = this.canvasElement;
      const recognizer = this.recognizer;

      if (!video || !canvas || !recognizer) return;
      if (!this.stream && !this.useExistingStream) return;

      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        if (video.currentTime !== this.lastVideoTime) {
          this.lastVideoTime = video.currentTime;
          const startTimeMs = performance.now();
          const results = recognizer.recognizeForVideo(video, startTimeMs);

          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          let detectedGesture = "None";
          let confidence = 0;
          let isUnclear = false;

          if (results && results.landmarks && results.landmarks.length > 0) {
            // 1. Draw Skeleton Landmarks
            results.landmarks.forEach((handLm) => {
              this._drawHandSkeleton(ctx, handLm, canvas.width, canvas.height);
            });

            // 2. Classify gesture
            const firstHand = results.landmarks[0];
            const handedness = results.handednesses && results.handednesses[0] && results.handednesses[0][0]
              ? results.handednesses[0][0].categoryName
              : "Right";

            // Check geometric rule-based classification first (highest precision)
            const geom = this._classifyGeometricLandmarks(firstHand, handedness);
            if (geom) {
              detectedGesture = geom.name;
              confidence = geom.score;
            } else if (results.gestures && results.gestures.length > 0) {
              const top = results.gestures[0][0];
              if (top.categoryName && top.categoryName !== "None") {
                detectedGesture = top.categoryName;
                confidence = top.score;
              }
            }

            // Check for uncertainty / unclear gestures
            if (confidence > 0 && confidence < 0.65) {
              isUnclear = true;
              this.onUnclearGesture("Gesture unclear - hold hand steady or repeat sign.");
            } else if (confidence >= 0.65) {
              this.onUnclearGesture(null);
            }

            // 3. Hold timer & sentence accumulation
            this._processHoldCommit(detectedGesture, confidence);
          } else {
            // No hand detected
            this.currentHoldGesture = null;
            this.onHoldProgress(0);
            this.onUnclearGesture(null);
          }

          this.onSignDetected({
            gesture: detectedGesture,
            confidence: Math.round(confidence * 100),
            isUnclear,
            metadata: MEETING_SIGN_VOCABULARY[detectedGesture] || null
          });
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  _processHoldCommit(gesture, confidence) {
    const now = Date.now();

    if (!gesture || gesture === "None" || confidence < 0.72) {
      this.currentHoldGesture = null;
      this.onHoldProgress(0);
      return;
    }

    if (this.currentHoldGesture !== gesture) {
      this.currentHoldGesture = gesture;
      this.holdStartTime = now;
      this.onHoldProgress(20);
      return;
    }

    const elapsed = now - this.holdStartTime;
    const progress = Math.min(100, Math.round((elapsed / this.HOLD_DURATION_MS) * 100));
    this.onHoldProgress(progress);

    // Commit sign once hold duration satisfied and cooldown passed
    if (elapsed >= this.HOLD_DURATION_MS && (now - this.lastRegisteredTime > this.COOLDOWN_MS)) {
      this.lastRegisteredTime = now;
      this.currentHoldGesture = null;
      this.onHoldProgress(0);

      this.commitSignToSentence(gesture, confidence);
    }
  }

  commitSignToSentence(gesture, confidence = 0.95) {
    const vocab = MEETING_SIGN_VOCABULARY[gesture];
    if (!vocab) return;

    this.sentenceWords.push({
      gesture,
      label: vocab.label,
      phrase: vocab.phrase,
      timestamp: new Date().toISOString(),
      confidence
    });

    const fullSentence = this.assembleSentence();
    this.onSentenceUpdated(fullSentence, [...this.sentenceWords]);
  }

  assembleSentence() {
    if (this.sentenceWords.length === 0) return "";
    return this.sentenceWords.map((item) => item.phrase).join(" ");
  }

  clearSentence() {
    this.sentenceWords = [];
    this.onSentenceUpdated("", []);
  }

  removeLastWord() {
    this.sentenceWords.pop();
    const fullSentence = this.assembleSentence();
    this.onSentenceUpdated(fullSentence, [...this.sentenceWords]);
  }

  addCustomText(text) {
    if (!text || !text.trim()) return;
    this.sentenceWords.push({
      gesture: "CUSTOM",
      label: text.trim(),
      phrase: text.trim(),
      timestamp: new Date().toISOString(),
      confidence: 1.0
    });
    const fullSentence = this.assembleSentence();
    this.onSentenceUpdated(fullSentence, [...this.sentenceWords]);
  }

  // ── Geometric Landmark Classification Engine ──
  _classifyGeometricLandmarks(lm, handednessStr) {
    if (!lm || lm.length < 21) return null;

    const d = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    const wrist = lm[0];

    const isExt = (tip, pip, mcp) => d(lm[tip], wrist) > d(lm[pip], wrist) * 1.12 && d(lm[pip], wrist) > d(lm[mcp], wrist) * 0.95;
    const isCurl = (tip, pip, mcp) => d(lm[tip], wrist) < d(lm[pip], wrist) * 1.05 || d(lm[tip], wrist) < d(lm[mcp], wrist) * 1.15;

    const thumbExt = d(lm[4], lm[9]) > d(lm[2], lm[9]) * 1.25;
    const thumbCurl = d(lm[4], lm[9]) < d(lm[2], lm[9]) * 1.15;

    const indexExt = isExt(8, 6, 5);
    const indexCurl = isCurl(8, 6, 5);
    const middleExt = isExt(12, 10, 9);
    const middleCurl = isCurl(12, 10, 9);
    const ringExt = isExt(16, 14, 13);
    const ringCurl = isCurl(16, 14, 13);
    const pinkyExt = isExt(20, 18, 17);
    const pinkyCurl = isCurl(20, 18, 17);

    // 1. Thumbs Up (Agreement / Yes)
    if (thumbExt && indexCurl && middleCurl && ringCurl && pinkyCurl && lm[4].y < lm[2].y - 0.04) {
      return { name: "Thumb_Up", score: 0.96 };
    }

    // 2. Open Palm (Greeting / Hello)
    if (thumbExt && indexExt && middleExt && ringExt && pinkyExt) {
      return { name: "Open_Palm", score: 0.95 };
    }

    // 3. Closed Fist (Disagreement / No)
    if (thumbCurl && indexCurl && middleCurl && ringCurl && pinkyCurl) {
      return { name: "Closed_Fist", score: 0.92 };
    }

    // 4. Pointing Up (Question / Permission)
    if (indexExt && middleCurl && ringCurl && pinkyCurl && lm[8].y < lm[6].y - 0.05) {
      return { name: "Pointing_Up", score: 0.94 };
    }

    // 5. Victory / Peace (Understood / Two)
    if (indexExt && middleExt && ringCurl && pinkyCurl) {
      return { name: "Victory", score: 0.93 };
    }

    // 6. ASL ILY Sign (Thank You / Affection)
    if (thumbExt && indexExt && middleCurl && ringCurl && pinkyExt) {
      return { name: "ILoveYou", score: 0.94 };
    }

    // 7. Directional Gun Signs (Repeat / Next Topic)
    if (indexExt && thumbExt && (middleCurl || !middleExt) && (ringCurl || !ringExt) && (pinkyCurl || !pinkyExt)) {
      const dxRaw = lm[8].x - lm[5].x;
      const gesture = dxRaw > 0.02 ? "GUN_LEFT" : "GUN_RIGHT";
      return { name: gesture, score: 0.91 };
    }

    return null;
  }

  // ── Canvas Skeleton Rendering ──
  _drawHandSkeleton(ctx, landmarks, w, h) {
    const CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [0, 13], [13, 14], [14, 15], [15, 16],// Ring
      [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [5, 9], [9, 13], [13, 17]             // Palm base
    ];

    ctx.save();
    // Neon Accessible Contrast Palette
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.85)"; // Neon Cyan
    ctx.shadowColor = "rgba(56, 189, 248, 0.6)";
    ctx.shadowBlur = 8;

    // Draw connecting bones
    CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];
      ctx.beginPath();
      ctx.moveTo(p1.x * w, p1.y * h);
      ctx.lineTo(p2.x * w, p2.y * h);
      ctx.stroke();
    });

    // Draw joints
    landmarks.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20 ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = idx === 8 || idx === 4 ? "#f43f5e" : "#38bdf8"; // Red on key tips, Cyan on joints
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 10;
      ctx.fill();
    });

    ctx.restore();
  }

  destroy() {
    this.stopCamera();
    if (this.recognizer) {
      try {
        this.recognizer.close();
      } catch (e) {}
      this.recognizer = null;
    }
  }
}

export default SignLanguageMeetingEngine;

