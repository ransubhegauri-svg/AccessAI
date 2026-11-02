"""
AccessAI Sign Language Gesture Recognizer & Evaluation Engine
============================================================
Processes MediaPipe 21-landmark 3D coordinate arrays with geometric angle classification,
650ms hold stabilization, 1400ms debouncing, and phrase generation.
"""

import time
import math
from typing import List, Dict, Any, Optional
from .sign_dictionary import get_sign_details, GESTURE_TO_AVATAR_ACTION


class LandmarkPoint:
    """Represents a single normalized 3D hand landmark coordinate."""
    __slots__ = ("x", "y", "z")

    def __init__(self, x: float, y: float, z: float = 0.0):
        self.x = float(x)
        self.y = float(y)
        self.z = float(z)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "LandmarkPoint":
        return cls(d.get("x", 0.0), d.get("y", 0.0), d.get("z", 0.0))


class HandGeometry:
    """Computes geometric calculations and joint relationships across 21 hand landmarks."""

    @staticmethod
    def distance(p1: LandmarkPoint, p2: LandmarkPoint) -> float:
        """Euclidean distance between two 3D landmarks."""
        dx = p1.x - p2.x
        dy = p1.y - p2.y
        dz = p1.z - p2.z
        return math.sqrt(dx * dx + dy * dy + dz * dz)

    @staticmethod
    def palm_scale(landmarks: List[LandmarkPoint]) -> float:
        """Wrist (0) to Middle Finger MCP (9) represents human palm reference scale."""
        if len(landmarks) < 10:
            return 1.0
        return HandGeometry.distance(landmarks[0], landmarks[9])

    @staticmethod
    def is_finger_extended(landmarks: List[LandmarkPoint], tip: int, pip: int, mcp: int, scale: float) -> bool:
        """Determines if a finger is extended away from palm."""
        dist_tip_mcp = HandGeometry.distance(landmarks[tip], landmarks[mcp])
        dist_pip_mcp = HandGeometry.distance(landmarks[pip], landmarks[mcp])
        dist_tip_wrist = HandGeometry.distance(landmarks[tip], landmarks[0])
        dist_pip_wrist = HandGeometry.distance(landmarks[pip], landmarks[0])
        return (dist_tip_mcp > dist_pip_mcp * 1.05) and (dist_tip_mcp > scale * 0.38) and (dist_tip_wrist >= dist_pip_wrist * 0.82)

    @staticmethod
    def is_finger_curled(landmarks: List[LandmarkPoint], tip: int, pip: int, mcp: int, scale: float) -> bool:
        """Determines if a finger is curled into the palm."""
        dist_tip_mcp = HandGeometry.distance(landmarks[tip], landmarks[mcp])
        dist_pip_mcp = HandGeometry.distance(landmarks[pip], landmarks[mcp])
        dist_tip_wrist = HandGeometry.distance(landmarks[tip], landmarks[0])
        dist_pip_wrist = HandGeometry.distance(landmarks[pip], landmarks[0])
        return (dist_tip_mcp < dist_pip_mcp * 1.25) or (dist_tip_wrist < dist_pip_wrist * 1.15) or (dist_tip_mcp < scale * 0.58)


class GestureDetector:
    """Classifies hand signs from 21 MediaPipe landmarks."""

    def __init__(self):
        self.geom = HandGeometry()

    def classify(self, raw_landmarks: Any, handedness: str = "Right") -> Dict[str, Any]:
        """
        Parses 21 hand landmarks and identifies the active sign gesture.
        """
        # Convert raw inputs (dicts or objects) to LandmarkPoints
        landmarks: List[LandmarkPoint] = []
        if isinstance(raw_landmarks, list):
            for lm in raw_landmarks:
                if isinstance(lm, dict):
                    landmarks.append(LandmarkPoint.from_dict(lm))
                elif hasattr(lm, "x") and hasattr(lm, "y"):
                    landmarks.append(LandmarkPoint(lm.x, lm.y, getattr(lm, "z", 0.0)))

        if len(landmarks) < 21:
            return {"gesture": "NONE", "confidence": 0.0, "avatar_action": "IDLE"}

        scale = self.geom.palm_scale(landmarks)
        if scale < 0.01:
            return {"gesture": "NONE", "confidence": 0.0, "avatar_action": "IDLE"}

        # Finger extensions
        idx_ext = self.geom.is_finger_extended(landmarks, 8, 6, 5, scale)
        mid_ext = self.geom.is_finger_extended(landmarks, 12, 10, 9, scale)
        rng_ext = self.geom.is_finger_extended(landmarks, 16, 14, 13, scale)
        pky_ext = self.geom.is_finger_extended(landmarks, 20, 18, 17, scale)

        # Finger curls
        idx_cur = self.geom.is_finger_curled(landmarks, 8, 6, 5, scale)
        mid_cur = self.geom.is_finger_curled(landmarks, 12, 10, 9, scale)
        rng_cur = self.geom.is_finger_curled(landmarks, 16, 14, 13, scale)
        pky_cur = self.geom.is_finger_curled(landmarks, 20, 18, 17, scale)

        # Thumb posture
        thumb_tip = landmarks[4]
        thumb_mcp5 = landmarks[5]
        thumb_dist_mcp9 = self.geom.distance(thumb_tip, landmarks[9])
        thumb_out = (thumb_dist_mcp9 > scale * 0.25)
        thumb_pointing_up = (thumb_tip.y < landmarks[3].y) and (thumb_tip.y < landmarks[2].y) and (thumb_tip.y < thumb_mcp5.y)
        thumb_cocked = thumb_out or thumb_pointing_up

        screen_dx = landmarks[8].x - landmarks[5].x
        screen_dy = landmarks[8].y - landmarks[5].y
        abs_dx = abs(screen_dx)
        abs_dy = abs(screen_dy)

        chirality = (handedness or "Right").capitalize()
        is_left = chirality == "Left"

        # 1. Open Palm (✋ Hello Everyone / Help)
        if idx_ext and mid_ext and rng_ext and pky_ext and thumb_out:
            return {
                "gesture": "Open_Palm",
                "label": "Hello Everyone",
                "confidence": 0.96,
                "avatar_action": "HELLO",
                "details": {"handedness": chirality}
            }

        # 2. Thumbs Up (👍 I Agree / Yes)
        if thumb_cocked and thumb_pointing_up and idx_cur and mid_cur and rng_cur and pky_cur:
            return {
                "gesture": "Thumb_Up",
                "label": "I Agree / Yes",
                "confidence": 0.95,
                "avatar_action": "YES",
                "details": {"handedness": chirality}
            }

        # 3. Closed Fist (✊ I Disagree / No)
        if idx_cur and mid_cur and rng_cur and pky_cur and not thumb_pointing_up:
            return {
                "gesture": "Closed_Fist",
                "label": "I Disagree / No",
                "confidence": 0.94,
                "avatar_action": "NO",
                "details": {"handedness": chirality}
            }

        # 4. Pointing Up (☝️ I Have a Question)
        if idx_ext and mid_cur and rng_cur and pky_cur:
            if abs_dy >= abs_dx * 0.70 and screen_dy < 0:
                return {
                    "gesture": "Pointing_Up",
                    "label": "I Have a Question",
                    "confidence": 0.95,
                    "avatar_action": "POINTING_UP",
                    "details": {"handedness": chirality}
                }

        # 5. Victory (✌️ Understood / Peace)
        if idx_ext and mid_ext and rng_cur and pky_cur:
            return {
                "gesture": "Victory",
                "label": "Understood / Peace",
                "confidence": 0.95,
                "avatar_action": "VICTORY",
                "details": {"handedness": chirality}
            }

        # 6. I Love You (🤟 Thank You / Gratitude)
        if idx_ext and not mid_ext and not rng_ext and pky_ext and thumb_out:
            return {
                "gesture": "I_Love_You",
                "label": "Thank You / Gratitude",
                "confidence": 0.94,
                "avatar_action": "THANK_YOU",
                "details": {"handedness": chirality}
            }

        # 7. Gun Signs (👉 / 👈 Navigation)
        if idx_ext and thumb_cocked and mid_cur and rng_cur and pky_cur:
            if abs_dx >= abs_dy * 0.50:
                if is_left:
                    return {
                        "gesture": "Gun_Left",
                        "label": "Next Topic / Forward",
                        "confidence": 0.92,
                        "avatar_action": "POINTING_UP",
                        "details": {"direction": "forward", "handedness": chirality}
                    }
                else:
                    return {
                        "gesture": "Gun_Right",
                        "label": "Previous Topic / Back",
                        "confidence": 0.92,
                        "avatar_action": "POINTING_UP",
                        "details": {"direction": "back", "handedness": chirality}
                    }

        # 8. Vertical Scroll Gestures (🔼 / 🔽)
        if idx_ext and mid_cur and rng_cur and pky_cur and abs_dy > abs_dx:
            if screen_dy < -0.05:
                return {
                    "gesture": "Scroll_Up",
                    "label": "Scroll Up",
                    "confidence": 0.93,
                    "avatar_action": "POINTING_UP",
                    "details": {"direction": "up"}
                }
            elif screen_dy > 0.05:
                return {
                    "gesture": "Scroll_Down",
                    "label": "Scroll Down",
                    "confidence": 0.93,
                    "avatar_action": "POINTING_UP",
                    "details": {"direction": "down"}
                }

        return {"gesture": "UNKNOWN", "confidence": 0.3, "avatar_action": "IDLE"}


class SignLanguageEngine:
    """
    Main stateful engine implementing:
    - 650ms stable hold window before committing a sign
    - 1400ms debounce cooldown preventing duplicate events
    - Sentence builder accumulation
    """

    HOLD_WINDOW_MS = 650
    DEBOUNCE_COOLDOWN_MS = 1400

    def __init__(self):
        self.detector = GestureDetector()
        self.active_gesture: Optional[str] = None
        self.gesture_start_time: float = 0.0
        self.last_committed_gesture: Optional[str] = None
        self.last_committed_time: float = 0.0
        self.sentence_buffer: List[str] = []

    def evaluate_frame(self, landmarks_data: Any, handedness: str = "Right") -> Dict[str, Any]:
        """
        Evaluates a frame of 21 landmarks against hold timing and debouncing.
        """
        now = time.time() * 1000.0  # current time in ms
        detection = self.detector.classify(landmarks_data, handedness)
        gesture = detection.get("gesture", "NONE")

        is_stable = False
        is_committed = False
        hold_progress = 0.0
        details = get_sign_details(gesture)

        if gesture in ("NONE", "UNKNOWN"):
            self.active_gesture = None
            self.gesture_start_time = 0.0
        else:
            if gesture == self.active_gesture:
                elapsed = now - self.gesture_start_time
                hold_target = details.get("hold_duration_ms", self.HOLD_WINDOW_MS) if details else self.HOLD_WINDOW_MS
                hold_progress = min(elapsed / float(hold_target), 1.0)

                if elapsed >= hold_target:
                    is_stable = True
                    # Check debounce cooldown
                    cooldown = details.get("cooldown_ms", self.DEBOUNCE_COOLDOWN_MS) if details else self.DEBOUNCE_COOLDOWN_MS
                    if (now - self.last_committed_time) >= cooldown or gesture != self.last_committed_gesture:
                        is_committed = True
                        self.last_committed_gesture = gesture
                        self.last_committed_time = now
                        if details and details.get("phrase"):
                            self.sentence_buffer.append(details["phrase"])
            else:
                self.active_gesture = gesture
                self.gesture_start_time = now
                hold_progress = 0.0

        return {
            "gesture": gesture,
            "label": details.get("label", gesture) if details else gesture,
            "phrase": details.get("phrase", "") if details else "",
            "confidence": detection.get("confidence", 0.0),
            "avatar_action": detection.get("avatar_action", "IDLE"),
            "hold_progress": round(hold_progress, 2),
            "is_stable": is_stable,
            "is_committed": is_committed,
            "sentence": " ".join(self.sentence_buffer)
        }

    def clear_sentence(self):
        """Resets the accumulated sentence buffer."""
        self.sentence_buffer.clear()
