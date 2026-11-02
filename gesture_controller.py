"""
========================================================================================
AccessAI Standalone Gesture Controller (MediaPipe + PyAutoGUI + Multi-Page DOM Bridge)
========================================================================================
A completely modular, isolated gesture recognition engine that runs independently
without any side-effects, dependencies, or merge conflicts with the existing codebase.

Features & Requirements:
1. Targeted Element Click Fix (Thumbs Up 👍):
   - Queries the exact currently highlighted/focused element (using active tracker variable,
     .focus-glow, or custom active class) and executes activeElement.click() or dispatches a
     synthesized MouseEvent('click', { bubbles: true, cancelable: true, view: window }).
   - Strictly prevents any hardcoded event routing or fallback logic that forces it to open
     a default page or wrong route when a grid box is selected.

2. Precise Grid & Sidebar Navigation (Gun Signs):
   - Left Gun (Horizontal Forward 👉): Move sequentially to the next grid box (i + 1).
     If at the end of the row, scroll down instead of jumping to the sidebar.
   - Right Gun (Horizontal Backward 👈): Move sequentially to the previous grid box (i - 1).
     Transition to the sidebar ONLY when currently on the first/top-left box (Box 0).
   - Sidebar Cycling: When inside the sidebar, Left/Right guns cycle through sidebar options.

3. Smooth Vertical Scrolling:
   - Vertical Upward Gun Sign 🔼: Trigger smooth page scroll up.
   - Vertical Downward Gun Sign 🔽: Trigger smooth page scroll down.

4. Visual Glow & Multi-Page Persistence:
   - Maintain a high-contrast outline glow strictly on the currently focused element.
   - Use a robust MutationObserver to ensure bindings persist across route changes.

Usage:
    python backend/gesture_controller.py
    python backend/gesture_controller.py --camera 0 --cols 3 --debounce 0.4
    python backend/gesture_controller.py --no-gui
========================================================================================
"""

import sys
import time
import math
import json
import socket
import threading
import argparse
import urllib.request
from typing import Tuple, Optional, Dict, Any, List
from http.server import HTTPServer, BaseHTTPRequestHandler

# Configure Windows console encoding for UTF-8 compatibility
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import cv2
import mediapipe as mp
import pyautogui

# Safety configuration for PyAutoGUI
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.01  # Minimize lag during simulated keypresses


# ======================================================================================
# 1. GEOMETRIC UTILITIES & LANDMARK CALCULATIONS
# ======================================================================================
class HandGeometry:
    """Calculates distances, angles, and directional vectors for 21 MediaPipe hand landmarks."""

    @staticmethod
    def distance(lm1: Any, lm2: Any) -> float:
        """Euclidean distance in normalized 3D landmark coordinates."""
        dx = lm1.x - lm2.x
        dy = lm1.y - lm2.y
        dz = getattr(lm1, 'z', 0.0) - getattr(lm2, 'z', 0.0)
        return math.sqrt(dx * dx + dy * dy + dz * dz)

    @staticmethod
    def palm_scale(landmarks) -> float:
        """Wrist (0) to Middle Finger MCP (9) represents human palm reference scale."""
        return HandGeometry.distance(landmarks[0], landmarks[9])

    @staticmethod
    def is_finger_extended(landmarks, tip_idx: int, pip_idx: int, mcp_idx: int, palm_scale: float) -> bool:
        """Determines if a finger is extended away from palm."""
        dist_tip_mcp = HandGeometry.distance(landmarks[tip_idx], landmarks[mcp_idx])
        dist_pip_mcp = HandGeometry.distance(landmarks[pip_idx], landmarks[mcp_idx])
        dist_tip_wrist = HandGeometry.distance(landmarks[tip_idx], landmarks[0])
        dist_pip_wrist = HandGeometry.distance(landmarks[pip_idx], landmarks[0])
        # Recalibrated with slightly lower confidence thresholds to prevent missing gestures
        return (dist_tip_mcp > dist_pip_mcp * 1.05) and (dist_tip_mcp > palm_scale * 0.38) and (dist_tip_wrist >= dist_pip_wrist * 0.82)

    @staticmethod
    def is_finger_curled(landmarks, tip_idx: int, pip_idx: int, mcp_idx: int, palm_scale: float) -> bool:
        """Determines if a finger is curled into the palm."""
        dist_tip_mcp = HandGeometry.distance(landmarks[tip_idx], landmarks[mcp_idx])
        dist_pip_mcp = HandGeometry.distance(landmarks[pip_idx], landmarks[mcp_idx])
        dist_tip_wrist = HandGeometry.distance(landmarks[tip_idx], landmarks[0])
        dist_pip_wrist = HandGeometry.distance(landmarks[pip_idx], landmarks[0])
        return (dist_tip_mcp < dist_pip_mcp * 1.25) or (dist_tip_wrist < dist_pip_wrist * 1.15) or (dist_tip_mcp < palm_scale * 0.58)


# ======================================================================================
# 2. GESTURE DETECTOR
# ======================================================================================
class GestureDetector:
    """
    Discriminates:
    - Left Hand Gun Sign: Next grid box (currentIndex + 1) / Row wrap down (no sidebar jump)
    - Right Hand Gun Sign: Prev grid box (currentIndex - 1) / Sidebar transition ONLY at currentIndex 0
    - Vertical Index Finger Up / Vertical Gun Up 🔼: Continuous smooth scroll up (-150px)
    - Vertical Index Finger Down / Vertical Gun Down 🔽: Continuous smooth scroll down (+150px)
    - Thumbs Up 👍: Targeted direct click on exact active/focused DOM element (zero hardcoded fallback)
    - Open Palm ✋: Strictly reserved for Help function / modal across all pages
    """

    def __init__(self):
        self.geom = HandGeometry()
        self.palm_anchor_y: Optional[float] = None
        self.prev_palm_y: Optional[float] = None
        self.prev_palm_time: float = 0.0

    def detect(self, landmarks, handedness: str = "Right") -> Dict[str, Any]:
        """
        Analyzes landmarks with strict chirality checks and recalibrated accuracy thresholds.

        Chirality rules:
        - Left Hand Gun Sign  => GUN_LEFT  (increment index + 1 / row wrap)
        - Right Hand Gun Sign => GUN_RIGHT (decrement index - 1 / sidebar ONLY at 0)
        - Vertical Index Up / Vertical Gun Up   => SCROLL_UP   (-150px)
        - Vertical Index Down / Vertical Gun Down => SCROLL_DOWN (+150px)
        - Extended Thumb + all 4 fingers curled => THUMB_UP    (targeted DOM click)
        - Open Palm (all fingers extended)      => OPEN_PALM   (help modal)
        """
        if not landmarks or len(landmarks) < 21:
            return {"gesture": "NONE", "confidence": 0.0, "details": {}}

        scale = self.geom.palm_scale(landmarks)
        if scale < 0.015:
            return {"gesture": "NONE", "confidence": 0.0, "details": {}}

        # Finger extension states
        index_ext = self.geom.is_finger_extended(landmarks, 8, 6, 5, scale)
        mid_ext = self.geom.is_finger_extended(landmarks, 12, 10, 9, scale)
        ring_ext = self.geom.is_finger_extended(landmarks, 16, 14, 13, scale)
        pinky_ext = self.geom.is_finger_extended(landmarks, 20, 18, 17, scale)

        # Finger curled states
        index_curled = self.geom.is_finger_curled(landmarks, 8, 6, 5, scale)
        mid_curled = self.geom.is_finger_curled(landmarks, 12, 10, 9, scale)
        ring_curled = self.geom.is_finger_curled(landmarks, 16, 14, 13, scale)
        pinky_curled = self.geom.is_finger_curled(landmarks, 20, 18, 17, scale)

        # Non-extended curl guarantees for non-pointing fingers
        other_three_curled = mid_curled and ring_curled and pinky_curled and (not mid_ext) and (not ring_ext) and (not pinky_ext)
        all_four_curled = index_curled and mid_curled and ring_curled and pinky_curled and (not index_ext) and (not mid_ext) and (not ring_ext) and (not pinky_ext)

        # Thumb analysis
        thumb_dist_mcp9 = self.geom.distance(landmarks[4], landmarks[9])
        thumb_dist_mcp5 = self.geom.distance(landmarks[4], landmarks[5])
        thumb_dist_ip2 = self.geom.distance(landmarks[4], landmarks[2])
        thumb_out = (thumb_dist_mcp9 > scale * 0.25) or (thumb_dist_ip2 > scale * 0.14) or (thumb_dist_mcp5 > scale * 0.18)
        thumb_pointing_up = (landmarks[4].y < landmarks[3].y) and (landmarks[4].y < landmarks[2].y) and (landmarks[4].y < landmarks[5].y)
        thumb_cocked = thumb_out or thumb_pointing_up

        # Vector of index finger pointing (mirrored coordinates: landmark 8 tip relative to landmark 5 mcp)
        screen_dx = landmarks[8].x - landmarks[5].x
        screen_dy = landmarks[8].y - landmarks[5].y
        abs_dx = abs(screen_dx)
        abs_dy = abs(screen_dy)

        # Strict chirality determination (tied explicitly to performed hand sign)
        chirality = (handedness or "Right").strip().capitalize()
        is_left_hand = chirality == "Left"
        is_right_hand = chirality == "Right"

        # ------------------------------------------------------------------------------
        # A. OPEN PALM DETECTION (Strictly reserved for triggering Help function/modal ✋)
        # ------------------------------------------------------------------------------
        if index_ext and mid_ext and ring_ext and pinky_ext and thumb_out:
            return {
                "gesture": "OPEN_PALM",
                "direction": "CENTER",
                "confidence": 0.95,
                "details": {"action": "HELP", "handedness": chirality}
            }

        # ------------------------------------------------------------------------------
        # B. THUMBS UP DETECTION (Targeted Click on Active Element 👍)
        # Explicitly detect an extended Thumb with all four fingers fully curled
        # ------------------------------------------------------------------------------
        if thumb_cocked and thumb_pointing_up and all_four_curled:
            return {
                "gesture": "THUMB_UP",
                "direction": "UP",
                "confidence": 0.96,
                "details": {"handedness": chirality}
            }

        # ------------------------------------------------------------------------------
        # C. VERTICAL SCROLL GESTURES (Dedicated gestures for page scrolling 🔼 / 🔽)
        # - Vertical Index Finger Up (or Vertical Gun Up): Scroll Up (-150px)
        # - Vertical Index Finger Down (or Vertical Gun Down): Scroll Down (+150px)
        # ------------------------------------------------------------------------------
        if index_ext and other_three_curled:
            # Check for dedicated vertical orientation: vertical vector strictly dominates
            if abs_dy > 0.030 and abs_dy >= abs_dx * 0.70:
                # Vertical Index Finger Up / Vertical Gun Up (y decreases upwards)
                if screen_dy < 0:
                    return {
                        "gesture": "SCROLL_UP",
                        "direction": "UP",
                        "confidence": 0.96,
                        "details": {"dy": screen_dy, "dx": screen_dx, "handedness": chirality}
                    }
                # Vertical Index Finger Down / Vertical Gun Down (y increases downwards)
                else:
                    return {
                        "gesture": "SCROLL_DOWN",
                        "direction": "DOWN",
                        "confidence": 0.96,
                        "details": {"dy": screen_dy, "dx": screen_dx, "handedness": chirality}
                    }

        # ------------------------------------------------------------------------------
        # D. LEFT & RIGHT GUN SIGNS (Strict Hand Chirality Check 👉 / 👈)
        # Recalibrate landmark tracking for extended Index Finger and Thumb
        # (with Middle, Ring, and Pinky fully curled).
        # Direction is explicitly tied to hand chirality:
        # - Left Hand Gun Sign  => GUN_LEFT  (Increment currentIndex + 1 / row wrap)
        # - Right Hand Gun Sign => GUN_RIGHT (Decrement currentIndex - 1 / sidebar at 0)
        # ------------------------------------------------------------------------------
        if index_ext and thumb_cocked and other_three_curled:
            # Ensure not pointing purely vertically (which is handled by scroll gestures above)
            if abs_dx >= abs_dy * 0.50 or abs_dx > 0.025:
                if is_left_hand:
                    return {
                        "gesture": "GUN_LEFT",
                        "direction": "FORWARD",
                        "confidence": 0.96,
                        "details": {"handedness": "Left", "dx": screen_dx, "dy": screen_dy}
                    }
                elif is_right_hand:
                    return {
                        "gesture": "GUN_RIGHT",
                        "direction": "BACKWARD",
                        "confidence": 0.96,
                        "details": {"handedness": "Right", "dx": screen_dx, "dy": screen_dy}
                    }
                else:
                    # Chirality fallback if handedness is unclassified
                    if screen_dx > 0:
                        return {
                            "gesture": "GUN_LEFT",
                            "direction": "FORWARD",
                            "confidence": 0.90,
                            "details": {"handedness": chirality, "dx": screen_dx, "dy": screen_dy}
                        }
                    else:
                        return {
                            "gesture": "GUN_RIGHT",
                            "direction": "BACKWARD",
                            "confidence": 0.90,
                            "details": {"handedness": chirality, "dx": screen_dx, "dy": screen_dy}
                        }

        return {"gesture": "NONE", "confidence": 0.0, "details": {}}


# ======================================================================================
# 3. CONTINUOUS ACTION MANAGER (THROTTLE & FRAME-COUNTER STABILITY FILTER)
# ======================================================================================
class ActionDebouncer:
    """
    Continuous, State-Aware Gesture Action Manager with Throttle / Frame-Counter:
    - Left/Right Gun: Holding the gesture continuously moves focus sequentially
      through boxes at throttled intervals without needing to drop and raise the hand repeatedly.
    - Vertical Gun Up/Down & Open Palm Moving Up/Down: Holding triggers continuous smooth scrolling (100px).
    - Thumbs Up: Executes a dynamic targeted click on the currently tracked/highlighted DOM element.
    """

    VALID_ACTIONS = (
        "GUN_LEFT", "GUN_RIGHT",
        "SCROLL_UP", "SCROLL_DOWN",
        "GUN_SCROLL_UP", "GUN_SCROLL_DOWN",
        "THUMB_UP", "OPEN_PALM"
    )

    def __init__(
        self,
        required_frames: int = 2,
        cooldown_seconds: float = 0.50,
        nav_initial_delay: float = 1.00,  # Strict 1.0s (1000ms) hold delay before auto-repeat
        nav_repeat_interval: float = 0.50, # Controlled 500ms pacing per step
        scroll_repeat_interval: float = 0.15,
        click_cooldown: float = 0.80,
        help_cooldown: float = 1.00
    ):
        self.required_frames = required_frames
        self.cooldown_seconds = cooldown_seconds

        self.nav_initial_delay = nav_initial_delay
        self.nav_repeat_interval = nav_repeat_interval
        self.scroll_repeat_interval = scroll_repeat_interval
        self.click_cooldown = click_cooldown
        self.help_cooldown = help_cooldown

        self.active_candidate: Optional[str] = None
        self.consecutive_count: int = 0
        self.hold_start_time: float = 0.0
        self.last_trigger_time: float = 0.0
        self.last_triggered_action: Optional[str] = None
        self.initial_fired: bool = False

    def reset(self):
        self.active_candidate = None
        self.consecutive_count = 0
        self.hold_start_time = 0.0
        self.initial_fired = False

    def update(self, detected_gesture: str, current_time: Optional[float] = None) -> Optional[str]:
        now = current_time if current_time is not None else time.time()

        if detected_gesture not in self.VALID_ACTIONS or detected_gesture == "NONE":
            self.reset()
            return None

        # Track consecutive frames of current gesture
        if detected_gesture == self.active_candidate:
            self.consecutive_count += 1
        else:
            self.active_candidate = detected_gesture
            self.consecutive_count = 1
            self.hold_start_time = now
            self.initial_fired = False

        # ------------------------------------------------------------------------------
        # 1. CONTINUOUS SEQUENTIAL NAVIGATION: Left Gun (Forward) / Right Gun (Backward)
        # Continuous frame throttle (350ms): smoothly navigates without skipping
        # ------------------------------------------------------------------------------
        if detected_gesture in ("GUN_LEFT", "GUN_RIGHT"):
            if not self.initial_fired:
                if self.consecutive_count >= self.required_frames:
                    self.initial_fired = True
                    self.last_trigger_time = now
                    self.last_triggered_action = detected_gesture
                    return detected_gesture
            else:
                # Hold throttle: continuous sequential movement every 350ms without resetting hand
                total_hold = now - self.hold_start_time
                time_since_last = now - self.last_trigger_time
                if total_hold >= self.nav_initial_delay and time_since_last >= self.nav_repeat_interval:
                    self.last_trigger_time = now
                    self.last_triggered_action = detected_gesture
                    return detected_gesture

        # ------------------------------------------------------------------------------
        # 2. ACCURATE SMOOTH SCROLLING: Index Pointing Up / Down & Vertical Gun
        # ------------------------------------------------------------------------------
        elif detected_gesture in ("SCROLL_UP", "SCROLL_DOWN", "GUN_SCROLL_UP", "GUN_SCROLL_DOWN"):
            if not self.initial_fired:
                if self.consecutive_count >= self.required_frames:
                    self.initial_fired = True
                    self.last_trigger_time = now
                    self.last_triggered_action = detected_gesture
                    return detected_gesture
            else:
                # Continuous smooth scroll throttle
                time_since_last = now - self.last_trigger_time
                if time_since_last >= self.scroll_repeat_interval:
                    self.last_trigger_time = now
                    self.last_triggered_action = detected_gesture
                    return detected_gesture

        # ------------------------------------------------------------------------------
        # 3. DYNAMIC CLICK EXECUTION: Thumbs Up 👍
        # ------------------------------------------------------------------------------
        elif detected_gesture == "THUMB_UP":
            if not self.initial_fired:
                if self.consecutive_count >= self.required_frames:
                    self.initial_fired = True
                    self.last_trigger_time = now
                    self.last_triggered_action = detected_gesture
                    return detected_gesture
            else:
                time_since_last = now - self.last_trigger_time
                if time_since_last >= self.click_cooldown:
                    self.last_trigger_time = now
                    self.last_triggered_action = detected_gesture
                    return detected_gesture

        # ------------------------------------------------------------------------------
        # 4. HELP & COMMANDS TRIGGER: Open Palm ✋
        # ------------------------------------------------------------------------------
        elif detected_gesture == "OPEN_PALM":
            if not self.initial_fired:
                if self.consecutive_count >= self.required_frames:
                    self.initial_fired = True
                    self.last_trigger_time = now
                    self.last_triggered_action = detected_gesture
                    return detected_gesture
            else:
                time_since_last = now - self.last_trigger_time
                if time_since_last >= self.help_cooldown:
                    self.last_trigger_time = now
                    self.last_triggered_action = detected_gesture
                    return detected_gesture

        return None

    def get_cooldown_progress(self) -> float:
        """Returns visual feedback progress for HUD cooldown bar."""
        if not self.active_candidate or not self.initial_fired:
            return 0.0
        now = time.time()
        if self.active_candidate in ("GUN_LEFT", "GUN_RIGHT"):
            elapsed = now - self.last_trigger_time
            if elapsed < self.nav_repeat_interval:
                return 1.0 - (elapsed / self.nav_repeat_interval)
        elif self.active_candidate in ("SCROLL_UP", "SCROLL_DOWN", "GUN_SCROLL_UP", "GUN_SCROLL_DOWN"):
            elapsed = now - self.last_trigger_time
            if elapsed < self.scroll_repeat_interval:
                return 1.0 - (elapsed / self.scroll_repeat_interval)
        elif self.active_candidate == "OPEN_PALM":
            elapsed = now - self.last_trigger_time
            if elapsed < self.help_cooldown:
                return 1.0 - (elapsed / self.help_cooldown)
        elif self.active_candidate == "THUMB_UP":
            elapsed = now - self.last_trigger_time
            if elapsed < self.click_cooldown:
                return 1.0 - (elapsed / self.click_cooldown)
        return 0.0


# ======================================================================================
# 4. OPTIMIZED SMOOTH SCROLLER (VELOCITY-BASED EMA + REST ZONE)
# ======================================================================================
class SmoothScroller:
    """High-performance smooth scrolling engine for two-finger / open-palm mode."""

    def __init__(
        self,
        speed_multiplier: float = 1.0,
        deadband: float = 0.035,
        smoothing_alpha: float = 0.35,
        tick_quantum: int = 120
    ):
        self.speed_multiplier = speed_multiplier
        self.deadband = deadband
        self.smoothing_alpha = smoothing_alpha
        self.tick_quantum = tick_quantum

        self.neutral_y: Optional[float] = None
        self.smoothed_speed: float = 0.0
        self.accumulator: float = 0.0
        self.last_update_time: float = 0.0

    def reset(self):
        """Called when hand exits scroll pose."""
        self.neutral_y = None
        self.smoothed_speed = 0.0
        self.accumulator = 0.0

    def update(self, current_anchor_y: float) -> Tuple[int, str]:
        now = time.time()
        if self.neutral_y is None:
            self.neutral_y = current_anchor_y
            self.smoothed_speed = 0.0
            self.accumulator = 0.0
            self.last_update_time = now
            return 0, "NEUTRAL (HOLD)"

        dt = now - self.last_update_time
        self.last_update_time = now
        if dt <= 0:
            dt = 0.033

        offset = self.neutral_y - current_anchor_y
        target_speed = 0.0
        state = "HOLD"

        if offset > self.deadband:
            active_dist = offset - self.deadband
            target_speed = (active_dist * 15.0) ** 1.35 * 450.0 * self.speed_multiplier
            state = f"SCROLL UP 🔼 (+{int(target_speed)})"
        elif offset < -self.deadband:
            active_dist = abs(offset) - self.deadband
            target_speed = -((active_dist * 15.0) ** 1.35 * 450.0 * self.speed_multiplier)
            state = f"SCROLL DOWN 🔽 ({int(target_speed)})"
        else:
            state = "REST ZONE (HOLD)"
            target_speed = 0.0

        self.smoothed_speed = (self.smoothing_alpha * target_speed) + ((1.0 - self.smoothing_alpha) * self.smoothed_speed)
        self.accumulator += self.smoothed_speed * dt

        ticks_to_dispatch = 0
        if abs(self.accumulator) >= self.tick_quantum:
            chunks = int(self.accumulator / self.tick_quantum)
            ticks_to_dispatch = chunks * self.tick_quantum
            self.accumulator -= ticks_to_dispatch

        return ticks_to_dispatch, state


# ======================================================================================
# 5. MULTI-PAGE DOM EVENT BRIDGE & HTTP SERVER
# ======================================================================================
class MultiPageDOMBridge:
    """
    Lightweight, non-blocking HTTP and Server-Sent Events (SSE) server on port 8765.
    Ensures gestures work seamlessly across all pages and route changes by:
    1. Broadcasting real-time gesture action events to browser tabs via SSE.
    2. Directing DOM-level element clicks, focus, visual glow, and smooth scrolling.
    3. Maintaining persistent MutationObservers and route listeners across SPA route unmounts.
    4. Two-way synchronization of route, focused index, and card count between DOM and Python.
    """

    def __init__(self, port: int = 8765):
        self.port = port
        self.clients = []
        self.lock = threading.Lock()
        self.server: Optional[HTTPServer] = None
        self.thread: Optional[threading.Thread] = None

        self.current_route: str = "/deaf"
        self.connected_tabs_count: int = 0

    def start(self, executor):
        class BridgeHandler(BaseHTTPRequestHandler):
            bridge_self = self
            action_executor = executor

            def log_message(self, format, *args):
                return  # Silence routine HTTP access logs

            def do_OPTIONS(self):
                self.send_response(200)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "*")
                self.end_headers()

            def do_GET(self):
                if self.path == "/events":
                    self.send_response(200)
                    self.send_header("Content-Type", "text/event-stream")
                    self.send_header("Cache-Control", "no-cache")
                    self.send_header("Connection", "keep-alive")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()

                    with self.bridge_self.lock:
                        self.bridge_self.clients.append(self.wfile)
                        self.bridge_self.connected_tabs_count = len(self.bridge_self.clients)

                    try:
                        init_payload = json.dumps({
                            "type": "CONNECTED",
                            "port": self.bridge_self.port,
                            "context": self.action_executor.context,
                            "boxIndex": self.action_executor.grid_box_index,
                            "sidebarIndex": self.action_executor.sidebar_index
                        })
                        self.wfile.write(f"data: {init_payload}\n\n".encode("utf-8"))
                        self.wfile.flush()
                        while True:
                            time.sleep(1.0)
                    except Exception:
                        with self.bridge_self.lock:
                            if self.wfile in self.bridge_self.clients:
                                self.bridge_self.clients.remove(self.wfile)
                                self.bridge_self.connected_tabs_count = len(self.bridge_self.clients)
                    return

                elif self.path == "/gesture-bridge.js":
                    # Universal, persistent client-side DOM gesture observer script
                    js_code = r"""
                    (function() {
                      if (window.__accessai_bridge_installed) {
                        console.log("[AccessAI] Gesture DOM Bridge already active.");
                        return;
                      }
                      window.__accessai_bridge_installed = true;
                      console.log("[AccessAI] Persistent Multi-Page Gesture DOM Observer active.");

                      // 1. Programmatic Permanent High-Contrast Visual Focus Glow Injection (outline: 3px solid #3b82f6)
                      const STYLE_ID = "accessai-focus-glow-style";
                      function injectFocusStyles() {
                        if (document.getElementById(STYLE_ID)) return;
                        const style = document.createElement("style");
                        style.id = STYLE_ID;
                        style.textContent = `
                          /* High-Contrast Accessible Gesture Focus Glow */
                          .focus-glow,
                          .focused-glow,
                          .accessai-gesture-highlight,
                          [data-accessai-active="true"] {
                            outline: 3px solid #3b82f6 !important;
                            outline-offset: 3px !important;
                            box-shadow: 0 0 0 2px #ffffff,
                                        0 0 16px 4px rgba(59, 130, 246, 0.90),
                                        0 0 32px 8px rgba(59, 130, 246, 0.55),
                                        inset 0 0 10px rgba(59, 130, 246, 0.30) !important;
                            border-radius: 12px !important;
                            transition: outline 0.12s ease-in-out, box-shadow 0.15s ease-in-out !important;
                            z-index: 9999 !important;
                            position: relative !important;
                          }
                          :focus-visible {
                            outline: 3px solid #3b82f6 !important;
                            outline-offset: 3px !important;
                            box-shadow: 0 0 16px 4px rgba(59, 130, 246, 0.90) !important;
                          }
                        `;
                        (document.head || document.documentElement).appendChild(style);
                      }

                      let activeCards = [];
                      let focusedGridElements = [];
                      let currentCardIdx = 0;
                      let activeHighlightedElement = null;
                      let savedTargetId = null;
                      let currentContext = "CONTENT_GRID";
                      let currentSidebarIdx = 0;

                      // Expose global tracker references
                      window.focusedGridElements = focusedGridElements;

                      // Find actual scrollable container (handles <main className="... overflow-y-auto ..."> or window)
                      function getScrollableContainer() {
                        const main = document.querySelector("main.overflow-y-auto") || document.querySelector("main");
                        if (main) {
                          const style = window.getComputedStyle(main);
                          if (style.overflowY === "auto" || style.overflowY === "scroll" || main.scrollHeight > main.clientHeight) {
                            return main;
                          }
                        }
                        const candidates = [
                          document.querySelector("[class*='overflow-y-auto']"),
                          document.getElementById("root"),
                          document.scrollingElement || document.documentElement,
                          document.body
                        ];
                        for (const el of candidates) {
                          if (!el) continue;
                          const style = window.getComputedStyle(el);
                          const overflowY = style.overflowY;
                          if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
                            return el;
                          }
                        }
                        return window;
                      }

                      // Smooth Vertical Scrolling directly on active scroll container (scrollContainer.scrollBy)
                      function performSmoothScroll(deltaY) {
                        const container = getScrollableContainer();
                        if (container && container !== window && typeof container.scrollBy === "function") {
                          try {
                            container.scrollBy({ top: deltaY, behavior: "smooth" });
                          } catch(e) {
                            container.scrollTop += deltaY;
                          }
                        } else {
                          try {
                            window.scrollBy({ top: deltaY, behavior: "smooth" });
                          } catch(e) {
                            window.scrollBy(0, deltaY);
                          }
                        }
                      }

                      // Cleanly remove visual focus glow from any previously highlighted element
                      function clearGlow() {
                        const prevElements = document.querySelectorAll(".focused-glow, .focus-glow, [data-accessai-active='true'], .accessai-gesture-highlight");
                        prevElements.forEach(el => {
                          el.removeAttribute("data-accessai-active");
                          el.classList.remove("accessai-gesture-highlight");
                          el.classList.remove("focus-glow");
                          el.classList.remove("focused-glow");
                          if (el.dataset.origOutline !== undefined) {
                            el.style.outline = el.dataset.origOutline;
                            el.style.outlineOffset = el.dataset.origOutlineOffset;
                            el.style.boxShadow = el.dataset.origBoxShadow;
                          } else {
                            el.style.removeProperty("outline");
                            el.style.removeProperty("outline-offset");
                            el.style.removeProperty("box-shadow");
                          }
                        });
                        activeHighlightedElement = null;
                        window.__accessai_active_element = null;
                      }

                      // Apply active high-contrast outline glow (outline: 3px solid #3b82f6;)
                      function applyGlow(element) {
                        if (!element) return;
                        injectFocusStyles();

                        if (activeHighlightedElement && activeHighlightedElement !== element) {
                          clearGlow();
                        }

                        // Store original inline properties for clean restoration
                        if (element.dataset.origOutline === undefined) {
                          element.dataset.origOutline = element.style.outline || "";
                          element.dataset.origOutlineOffset = element.style.outlineOffset || "";
                          element.dataset.origBoxShadow = element.style.boxShadow || "";
                        }

                        element.setAttribute("data-accessai-active", "true");
                        element.classList.add("accessai-gesture-highlight");
                        element.classList.add("focus-glow");
                        element.classList.add("focused-glow");
                        element.style.setProperty("outline", "3px solid #3b82f6", "important");
                        element.style.setProperty("outline-offset", "3px", "important");
                        element.style.setProperty("box-shadow", "0 0 0 2px #ffffff, 0 0 16px 4px rgba(59, 130, 246, 0.90), 0 0 32px 8px rgba(59, 130, 246, 0.55), inset 0 0 10px rgba(59, 130, 246, 0.30)", "important");
                        element.style.setProperty("border-radius", "12px", "important");
                        element.style.setProperty("transition", "outline 0.12s ease-in-out, box-shadow 0.15s ease-in-out", "important");

                        activeHighlightedElement = element;
                        window.__accessai_active_element = element;
                        savedTargetId = element.id || null;

                        if (!element.hasAttribute("tabindex")) {
                          element.setAttribute("tabindex", "-1");
                        }
                        try { element.focus({ preventScroll: true }); } catch(e) {}
                        element.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                      }

                      function isVisibleInteractive(el) {
                        if (!el || el.offsetParent === null) return false;
                        if (el.closest("#deaf-sidebar") || el.closest("aside") || el.closest("header")) return false;
                        // Avoid selecting persistent floating bot buttons
                        if (el.closest("[class*='z-50']") && el.closest("button")) return false;
                        // Exclude "Open Sign Arena" / "Sign Practice" banner shortcut buttons from being prioritized as grid cards
                        const text = (el.textContent || "").trim().toLowerCase();
                        if (text.includes("open sign arena") || text.includes("sign practice") || text.includes("sign arena")) {
                          return false;
                        }
                        const r = el.getBoundingClientRect();
                        if (r.width === 0 || r.height === 0) return false;
                        const style = window.getComputedStyle(el);
                        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
                        return true;
                      }

                      // Multi-Page Element Indexer across Overview, Courses, Paths, Degree, Quiz, etc.
                      function reindexPageCards() {
                        const pageSpecificSelectors = [
                          "[id^='deaf-home-box-']",
                          "[id^='deaf-course-card-']",
                          "[id^='deaf-enrolled-card-']",
                          "[id^='deaf-path-card-']",
                          "[id^='deaf-degree-card-']",
                          "[id^='deaf-quiz-option-']"
                        ];

                        for (const sel of pageSpecificSelectors) {
                          const nodes = Array.from(document.querySelectorAll(sel)).filter(isVisibleInteractive);
                          if (nodes.length > 0) {
                            nodes.sort((a, b) => {
                              const idMatchA = a.id && a.id.match(/\d+$/);
                              const idMatchB = b.id && b.id.match(/\d+$/);
                              if (idMatchA && idMatchB && a.id.replace(/\d+$/, '') === b.id.replace(/\d+$/, '')) {
                                return parseInt(idMatchA[0], 10) - parseInt(idMatchB[0], 10);
                              }
                              const ra = a.getBoundingClientRect();
                              const rb = b.getBoundingClientRect();
                              if (Math.abs(ra.top - rb.top) > 25) return ra.top - rb.top;
                              return ra.left - rb.left;
                            });
                            activeCards = nodes;
                            focusedGridElements = nodes;
                            window.focusedGridElements = focusedGridElements;
                            return activeCards;
                          }
                        }

                        // Robust fallback for any dynamic route or view (grid cards first)
                        const fallbackSelectors = [
                          "main .grid > div.cursor-pointer",
                          "main .grid > div[class*='rounded']",
                          "main .grid > div[role='button']",
                          "main .grid > div",
                          "main div.cursor-pointer[class*='rounded']",
                          "main .grid > [tabindex='0']",
                          "main .card",
                          "main .grid button",
                          "main button.border-2",
                          "main [role='button']:not([aria-disabled='true'])",
                          "main button:not([disabled])",
                          "main a[href]"
                        ];

                        for (const sel of fallbackSelectors) {
                          const nodes = Array.from(document.querySelectorAll(sel)).filter(isVisibleInteractive);
                          if (nodes.length > 0) {
                            nodes.sort((a, b) => {
                              const idMatchA = a.id && a.id.match(/\\d+$/);
                              const idMatchB = b.id && b.id.match(/\\d+$/);
                              if (idMatchA && idMatchB && a.id.replace(/\\d+$/, '') === b.id.replace(/\\d+$/, '')) {
                                return parseInt(idMatchA[0], 10) - parseInt(idMatchB[0], 10);
                              }
                              const ra = a.getBoundingClientRect();
                              const rb = b.getBoundingClientRect();
                              if (Math.abs(ra.top - rb.top) > 25) return ra.top - rb.top;
                              return ra.left - rb.left;
                            });
                            activeCards = nodes;
                            focusedGridElements = nodes;
                            window.focusedGridElements = focusedGridElements;
                            return activeCards;
                          }
                        }

                        activeCards = [];
                        focusedGridElements = [];
                        window.focusedGridElements = focusedGridElements;
                        return activeCards;
                      }

                      function highlightCard(idx) {
                        reindexPageCards();
                        if (activeCards.length === 0) return;
                        const safeIdx = Math.max(0, Math.min(activeCards.length - 1, idx));
                        currentCardIdx = safeIdx;
                        currentContext = "CONTENT_GRID";
                        const target = activeCards[safeIdx];
                        if (target) {
                          savedTargetId = target.id || null;
                          applyGlow(target);
                        }
                      }

                      function syncDOM() {
                        try {
                          fetch("http://127.0.0.1:8765/sync", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              route: window.location.pathname,
                              title: document.title,
                              cardCount: activeCards.length,
                              currentIndex: currentCardIdx,
                              context: currentContext,
                              sidebarIndex: currentSidebarIdx,
                              time: Date.now()
                            })
                          }).catch(() => {});
                        } catch(e) {}
                      }

                      // Update visual glow whenever document.activeElement changes via keyboard/mouse
                      document.addEventListener("focusin", (e) => {
                        if (e.target && e.target !== document.body && e.target !== document.documentElement) {
                          if (!e.target.closest("#deaf-sidebar") && !e.target.closest("aside") && !e.target.closest("header")) {
                            applyGlow(e.target);
                            const idx = activeCards.indexOf(e.target);
                            if (idx !== -1) currentCardIdx = idx;
                            currentContext = "CONTENT_GRID";
                          }
                        }
                      }, true);

                      // Route-listener: automatically re-index interactive grid nodes on SPA route transitions
                      function handleRouteChange() {
                        setTimeout(() => {
                          currentCardIdx = 0;
                          currentContext = "CONTENT_GRID";
                          clearGlow();
                          reindexPageCards();
                          highlightCard(0);
                          syncDOM();
                        }, 60);
                      }

                      const rawPushState = history.pushState;
                      history.pushState = function() {
                        rawPushState.apply(history, arguments);
                        handleRouteChange();
                      };
                      const rawReplaceState = history.replaceState;
                      history.replaceState = function() {
                        rawReplaceState.apply(history, arguments);
                        handleRouteChange();
                      };
                      window.addEventListener("popstate", handleRouteChange, { passive: true });
                      window.addEventListener("hashchange", handleRouteChange, { passive: true });

                      // Route polling fallback for instant SPA transitions
                      let lastKnownPath = window.location.pathname;
                      setInterval(() => {
                        if (window.location.pathname !== lastKnownPath) {
                          lastKnownPath = window.location.pathname;
                          handleRouteChange();
                        }
                      }, 120);

                      // Robust MutationObserver to automatically re-index interactive grid nodes on dynamic changes
                      let mutTimeout = null;
                      const observer = new MutationObserver((mutations) => {
                        let isRelevant = false;
                        for (const m of mutations) {
                          if (m.target && m.target.id === STYLE_ID) continue;
                          isRelevant = true;
                          break;
                        }
                        if (!isRelevant) return;

                        clearTimeout(mutTimeout);
                        mutTimeout = setTimeout(() => {
                          reindexPageCards();
                          if (currentContext === "CONTENT_GRID") {
                            if (!activeHighlightedElement || !document.body.contains(activeHighlightedElement)) {
                              highlightCard(currentCardIdx);
                            } else {
                              applyGlow(activeHighlightedElement);
                            }
                          }
                        }, 50);
                      });
                      observer.observe(document.body, { childList: true, subtree: true });

                      // Step Backward (Right Hand Gun Sign):
                      // - Continuously decrement focused grid index (currentIndex - 1)
                      // - Sidebar Transition Rule: Decrementing transitions into sidebar ONLY when currentIndex === 0
                      function stepBackward() {
                        const cards = reindexPageCards();
                        if (currentContext === "CONTENT_GRID") {
                          if (currentCardIdx === 0) {
                            // ONLY transition focus to sidebar if currentIndex === 0 (the first/top-left item in grid)
                            currentContext = "SIDEBAR";
                            currentSidebarIdx = 0;
                            const sidebar = document.getElementById("deaf-sidebar") || document.querySelector("aside");
                            if (sidebar) {
                              sidebar.scrollIntoView({ behavior: "smooth", block: "start" });
                              const navButtons = Array.from(sidebar.querySelectorAll("nav button, nav a, nav [role='button']")).filter(b => b.offsetParent !== null);
                              if (navButtons.length > 0) {
                                applyGlow(navButtons[0]);
                              }
                            }
                            syncDOM();
                            return;
                          }

                          // Strictly decrement active grid index (currentIndex - 1)
                          currentCardIdx = Math.max(0, currentCardIdx - 1);
                          highlightCard(currentCardIdx);
                          syncDOM();
                        } else if (currentContext === "SIDEBAR") {
                          // Inside sidebar: cycle through sidebar options backward
                          const sidebar = document.getElementById("deaf-sidebar") || document.querySelector("aside");
                          const navButtons = sidebar ? Array.from(sidebar.querySelectorAll("nav button, nav a, nav [role='button']")).filter(b => b.offsetParent !== null) : [];
                          if (navButtons.length > 0) {
                            currentSidebarIdx = (currentSidebarIdx - 1 + navButtons.length) % navButtons.length;
                            applyGlow(navButtons[currentSidebarIdx]);
                            navButtons[currentSidebarIdx].click();
                          }
                          syncDOM();
                        }
                      }

                      // Step Forward (Left Hand Gun Sign):
                      // - Continuously increment focused grid index (currentIndex + 1)
                      // - When reaching end of row, wrap down to next row (do NOT jump to sidebar)
                      function stepForward() {
                        const cards = reindexPageCards();
                        if (currentContext === "CONTENT_GRID") {
                          const maxIdx = Math.max(0, cards.length - 1);
                          if (currentCardIdx >= maxIdx) {
                            performSmoothScroll(150);
                            return;
                          }
                          // Continuously increment focused grid index (currentIndex + 1)
                          currentCardIdx = Math.min(maxIdx, currentCardIdx + 1);
                          // End of row: wrap down to next row with smooth scroll (do NOT jump to sidebar)
                          if (currentCardIdx > 0 && currentCardIdx % 3 === 0) {
                            performSmoothScroll(150);
                          }
                          highlightCard(currentCardIdx);
                          syncDOM();
                        } else if (currentContext === "SIDEBAR") {
                          // Left Gun (Forward) transitions from sidebar into content grid Box 0
                          currentContext = "CONTENT_GRID";
                          currentCardIdx = 0;
                          highlightCard(0);
                          syncDOM();
                        }
                      }

                      // Dynamic Click Dispatch (Fixing the "Sign Practice" Hardcode Bug):
                      // Completely eliminate static/hardcoded "Sign Practice" route fallback.
                      // 1. Retrieve the exact DOM element currently stored in focus tracker
                      // 2. Synthesize and dispatch a true DOM click event on that precise node
                      function executeDirectClick(targetBoxIdx) {
                        let activeTarget = null;

                        // Priority A: Element with active high-contrast glow or custom attribute
                        activeTarget = document.querySelector('.focused-glow') ||
                                       document.querySelector('.focus-glow') ||
                                       document.querySelector('[data-accessai-active="true"]') ||
                                       document.querySelector('.accessai-gesture-highlight');

                        // Priority B: activeHighlightedElement stored in focus tracker
                        if (!activeTarget || !document.body.contains(activeTarget) || activeTarget === document.body || activeTarget === document.documentElement) {
                          if (activeHighlightedElement && document.body.contains(activeHighlightedElement) && activeHighlightedElement !== document.body && activeHighlightedElement !== document.documentElement) {
                            activeTarget = activeHighlightedElement;
                          }
                        }

                        // Priority C: document.activeElement
                        if (!activeTarget || !document.body.contains(activeTarget) || activeTarget === document.body || activeTarget === document.documentElement) {
                          if (document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement) {
                            activeTarget = document.activeElement;
                          }
                        }

                        // Priority D: focusedGridElements[currentIndex]
                        if (!activeTarget || !document.body.contains(activeTarget) || activeTarget === document.body || activeTarget === document.documentElement) {
                          if (savedTargetId) {
                            activeTarget = document.getElementById(savedTargetId);
                          }
                          if (!activeTarget || !document.body.contains(activeTarget)) {
                            const cards = reindexPageCards();
                            if (cards.length > 0) {
                              const queryIdx = (typeof targetBoxIdx === "number" && targetBoxIdx >= 0) ? targetBoxIdx : currentCardIdx;
                              const safeIdx = Math.max(0, Math.min(cards.length - 1, queryIdx));
                              activeTarget = cards[safeIdx];
                            }
                          }
                        }

                        // Completely eliminate static/hardcoded "Sign Practice" route fallback
                        if (!activeTarget || !document.body.contains(activeTarget) || activeTarget === document.body || activeTarget === document.documentElement) {
                          console.warn("[AccessAI] Thumbs Up: No focused element found in focus tracker. Static/hardcoded Sign Practice fallback completely eliminated.");
                          return false;
                        }

                        console.log("[AccessAI] Thumbs Up: Synthesizing and dispatching true DOM click event on precise node:", activeTarget);

                        applyGlow(activeTarget);

                        if (!activeTarget.hasAttribute("tabindex")) {
                          activeTarget.setAttribute("tabindex", "-1");
                        }
                        try { activeTarget.focus({ preventScroll: true }); } catch(e) {}

                        const rect = activeTarget.getBoundingClientRect();
                        const clientX = rect.left + rect.width / 2;
                        const clientY = rect.top + rect.height / 2;
                        const clickEventInit = {
                          bubbles: true,
                          cancelable: true,
                          view: window,
                          detail: 1,
                          screenX: (window.screenX || 0) + clientX,
                          screenY: (window.screenY || 0) + clientY,
                          clientX: clientX,
                          clientY: clientY,
                          button: 0,
                          buttons: 1
                        };

                        try {
                          activeTarget.dispatchEvent(new MouseEvent('pointerdown', clickEventInit));
                          activeTarget.dispatchEvent(new MouseEvent('mousedown', clickEventInit));
                          activeTarget.dispatchEvent(new MouseEvent('pointerup', clickEventInit));
                          activeTarget.dispatchEvent(new MouseEvent('mouseup', clickEventInit));
                        } catch(e) {}

                        // Direct React onClick invocation if attached to component fiber
                        try {
                          const reactKey = Object.keys(activeTarget).find(k => k.startsWith('__reactProps'));
                          if (reactKey && activeTarget[reactKey] && typeof activeTarget[reactKey].onClick === 'function') {
                            activeTarget[reactKey].onClick({
                              stopPropagation: () => {},
                              preventDefault: () => {},
                              target: activeTarget,
                              currentTarget: activeTarget
                            });
                          }
                        } catch(e) {}

                        // If element contains an inner primary action button, click it as well
                        const innerAction = activeTarget.querySelector("button, a, [role='button']");
                        if (innerAction && innerAction !== activeTarget) {
                          try {
                            if (typeof innerAction.click === 'function') innerAction.click();
                            else innerAction.dispatchEvent(new MouseEvent('click', clickEventInit));
                          } catch(e) {}
                        }

                        // Synthesize and dispatch true DOM click event on that precise node
                        if (typeof activeTarget.click === 'function') {
                          activeTarget.click();
                        } else {
                          activeTarget.dispatchEvent(new MouseEvent('click', clickEventInit));
                        }

                        return true;
                      }

                      // Persistent SSE event receiver
                      function connectSSE() {
                        try {
                          const es = new EventSource("http://127.0.0.1:8765/events");
                          es.onmessage = function(e) {
                            try {
                              const data = JSON.parse(e.data);

                              // A. Content Grid Navigation (Left Gun / Right Gun)
                              if (data.action === "NEXT_ROW") {
                                const scrollPx = data.scrollAmount || 150;
                                performSmoothScroll(scrollPx);
                                highlightCard(data.boxIndex);
                              }
                              else if (data.action === "NEXT_BOX") {
                                if (typeof data.boxIndex === "number") {
                                  highlightCard(data.boxIndex);
                                } else {
                                  stepForward();
                                }
                              }
                              else if (data.action === "PREV_BOX") {
                                if (typeof data.boxIndex === "number") {
                                  highlightCard(data.boxIndex);
                                } else {
                                  stepBackward();
                                }
                              }
                              else if (data.action === "ENTER_CONTENT") {
                                currentContext = "CONTENT_GRID";
                                highlightCard(data.boxIndex || 0);
                              }

                              // B. Sidebar Navigation Actions (Left/Right Gun inside Sidebar)
                              else if (data.action === "SIDEBAR_ENTER" || data.action === "SIDEBAR_CYCLE") {
                                currentContext = "SIDEBAR";
                                const sidebar = document.getElementById("deaf-sidebar") || document.querySelector("aside");
                                if (sidebar) {
                                  sidebar.scrollIntoView({ behavior: "smooth", block: "start" });
                                  const navButtons = Array.from(sidebar.querySelectorAll("nav button, nav a, nav [role='button']")).filter(b => b.offsetParent !== null);
                                  if (navButtons.length > 0) {
                                    const safeIdx = Math.abs(data.sidebarIndex || 0) % navButtons.length;
                                    currentSidebarIdx = safeIdx;
                                    const targetBtn = navButtons[safeIdx];
                                    if (targetBtn) {
                                      applyGlow(targetBtn);
                                      if (data.action === "SIDEBAR_CYCLE") {
                                        targetBtn.click();
                                      }
                                    }
                                  }
                                }
                              }

                              // C. Dedicated Vertical Scroll Gestures (Scroll Up -150px / Scroll Down +150px)
                              else if (data.action === "PAGE_SCROLL") {
                                const delta = typeof data.amount === "number" ? data.amount : (data.direction === "UP" ? -150 : 150);
                                performSmoothScroll(delta);
                              }
                              else if (data.action === "SCROLL") {
                                const scrollPx = data.amount < 0 ? -150 : 150;
                                performSmoothScroll(scrollPx);
                              }

                              // D. Dynamic Click Dispatch on exact focused node
                              else if (data.action === "CLICK_BOX") {
                                executeDirectClick(data.boxIndex);
                              }

                              // E. Open Palm: Strictly reserved for Help function / modal
                              else if (data.action === "OPEN_HELP") {
                                triggerHelpAction();
                              }
                            } catch(err) {
                              console.error("[AccessAI] Error handling SSE message:", err);
                            }
                          };
                          es.onerror = function() {
                            es.close();
                            setTimeout(connectSSE, 2500); // Auto-reconnect
                          };
                        } catch(e) {}
                      }

                      // Open Palm Gesture Handler: Strictly reserved for Help function / modal
                      function triggerHelpAction() {
                        console.log("[AccessAI] Open Palm detected: Strictly triggering Help function / modal.");

                        // 1. Check for dedicated Help button / modal trigger on page
                        const helpSelectors = [
                          "[data-action='help']",
                          "#help-button",
                          "#help-modal-trigger",
                          "button[aria-label*='help' i]",
                          "button[title*='help' i]",
                          "[id*='help-button' i]",
                          "[data-tab='help']"
                        ];
                        for (const sel of helpSelectors) {
                          const el = document.querySelector(sel);
                          if (el && el.offsetParent !== null) {
                            el.click();
                            return;
                          }
                        }

                        // 2. Check for Sign Avatar Assistant "Sign Guide" / "Help" button
                        const allButtons = Array.from(document.querySelectorAll("button, [role='button'], a"));
                        const guideBtn = allButtons.find(b => {
                          const text = (b.textContent || "").toLowerCase();
                          const title = (b.getAttribute("title") || "").toLowerCase();
                          return (text.includes("sign guide") || text.includes("help") || title.includes("guide") || title.includes("help")) && b.offsetParent !== null;
                        });
                        if (guideBtn) {
                          guideBtn.click();
                          return;
                        }

                        // 3. Toggle accessible high-contrast Gesture Help Modal on DOM
                        let helpModal = document.getElementById("accessai-gesture-help-modal");
                        if (helpModal) {
                          helpModal.remove();
                          return;
                        }

                        helpModal = document.createElement("div");
                        helpModal.id = "accessai-gesture-help-modal";
                        helpModal.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:480px;background:rgba(10,15,30,0.96);border:2px solid #38bdf8;box-shadow:0 0 35px rgba(56,189,248,0.45),0 20px 40px rgba(0,0,0,0.85);border-radius:24px;padding:24px;color:#f8fafc;z-index:100000;backdrop-filter:blur(16px);font-family:system-ui,-apple-system,sans-serif;";
                        helpModal.innerHTML = `
                          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:12px;margin-bottom:16px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                              <span style="font-size:24px;">✋</span>
                              <h3 style="margin:0;font-size:18px;font-weight:700;color:#38bdf8;">Gesture Controls & Commands</h3>
                            </div>
                            <button id="accessai-close-help-btn" style="background:rgba(255,255,255,0.1);border:none;color:#94a3b8;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">✕</button>
                          </div>
                          <div style="display:flex;flex-direction:column;gap:12px;font-size:14px;">
                            <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);padding:10px 14px;border-radius:12px;">
                              <span style="font-size:22px;">👉</span>
                              <div><strong style="color:#60a5fa;">Left Hand Gun:</strong> Next grid box (wraps down to next row)</div>
                            </div>
                            <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);padding:10px 14px;border-radius:12px;">
                              <span style="font-size:22px;">👈</span>
                              <div><strong style="color:#60a5fa;">Right Hand Gun:</strong> Prev grid box (enters sidebar ONLY at box 0)</div>
                            </div>
                            <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);padding:10px 14px;border-radius:12px;">
                              <span style="font-size:22px;">🔼</span>
                              <div><strong style="color:#34d399;">Vertical Index / Gun Up:</strong> Smooth scroll UP (-150px)</div>
                            </div>
                            <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);padding:10px 14px;border-radius:12px;">
                              <span style="font-size:22px;">🔽</span>
                              <div><strong style="color:#34d399;">Vertical Index / Gun Down:</strong> Smooth scroll DOWN (+150px)</div>
                            </div>
                            <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);padding:10px 14px;border-radius:12px;">
                              <span style="font-size:22px;">👍</span>
                              <div><strong style="color:#fbbf24;">Thumbs Up:</strong> Dynamically click exact focused element</div>
                            </div>
                            <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);padding:10px 14px;border-radius:12px;">
                              <span style="font-size:22px;">✋</span>
                              <div><strong style="color:#f472b6;">Open Palm:</strong> Strictly reserved for Help & Commands modal</div>
                            </div>
                          </div>
                          <div style="margin-top:16px;text-align:center;font-size:12px;color:#94a3b8;">
                            Perform Open Palm again or click ✕ to close.
                          </div>
                        `;
                        document.body.appendChild(helpModal);
                        document.getElementById("accessai-close-help-btn").onclick = () => helpModal.remove();
                      }

                      injectFocusStyles();
                      reindexPageCards();
                      highlightCard(0);
                      connectSSE();
                      syncDOM();

                      window.accessaiGesture = {
                        stepForward: stepForward,
                        stepBackward: stepBackward,
                        triggerThumbsUp: executeDirectClick,
                        triggerHelp: triggerHelpAction,
                        scrollUp: () => performSmoothScroll(-150),
                        scrollDown: () => performSmoothScroll(150),
                        performSmoothScroll: performSmoothScroll,
                        getScrollableContainer: getScrollableContainer,
                        highlightCard: highlightCard,
                        reindex: reindexPageCards
                      };
                      window.stepForward = stepForward;
                      window.stepBackward = stepBackward;
                      window.triggerThumbsUp = executeDirectClick;
                      window.triggerHelp = triggerHelpAction;
                      window.performSmoothScroll = performSmoothScroll;
                    })();
                    """
                    self.send_response(200)
                    self.send_header("Content-Type", "application/javascript")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(js_code.encode("utf-8"))
                    return

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                status = {
                    "status": "online",
                    "port": self.bridge_self.port,
                    "connectedTabs": self.bridge_self.connected_tabs_count,
                    "route": self.bridge_self.current_route
                }
                self.wfile.write(json.dumps(status).encode("utf-8"))

            def do_POST(self):
                if self.path == "/sync":
                    length = int(self.headers.get("Content-Length", 0))
                    body = self.rfile.read(length).decode("utf-8")
                    try:
                        data = json.loads(body)
                        new_route = data.get("route", "")
                        if new_route and new_route != self.bridge_self.current_route:
                            self.bridge_self.current_route = new_route
                            self.action_executor.handle_route_changed(new_route)
                        self.action_executor.sync_state(data)
                    except Exception:
                        pass

                    self.send_response(200)
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(b'{"ok":true}')

        try:
            self.server = HTTPServer(("127.0.0.1", self.port), BridgeHandler)
            self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
            self.thread.start()
            print(f" [BRIDGE] Multi-Page DOM Event Bridge listening at http://127.0.0.1:{self.port}")
        except Exception as e:
            print(f" [WARN] Could not bind bridge server on port {self.port}: {e}")

    def broadcast_action(self, action_name: str, payload: Dict[str, Any]):
        """Sends real-time action event to all connected browser tabs via SSE."""
        with self.lock:
            if not self.clients:
                return
            message_data = json.dumps({"action": action_name, **payload})
            dead_clients = []
            for client in self.clients:
                try:
                    client.write(f"data: {message_data}\n\n".encode("utf-8"))
                    client.flush()
                except Exception:
                    dead_clients.append(client)
            for dead in dead_clients:
                self.clients.remove(dead)
            self.connected_tabs_count = len(self.clients)


# ======================================================================================
# 6. ACTION EXECUTOR WITH STRICT STATE SEGREGATION
# ======================================================================================
class ActionExecutor:
    """
    Dispatches navigation commands with STRICT CONTEXT BOUNDARIES:
    - Maintains separate index states for sidebar_items and content_grid_boxes.
    - Never cross-triggers or mixes index counters when switching context.
    - Context: "CONTENT_GRID" vs "SIDEBAR".
    """

    SIDEBAR_ITEMS: List[str] = [
        "home", "degree-offer", "career-paths", "rewards-store", "courses",
        "my-learning", "learn-signs", "ai-tutor", "activity", "profile", "settings"
    ]

    def __init__(self, cols: int = 3, key_mode: str = "tab", bridge: Optional[MultiPageDOMBridge] = None):
        self.cols = max(1, cols)
        self.key_mode = key_mode
        self.bridge = bridge

        # Strict Context State: "CONTENT_GRID" or "SIDEBAR"
        self.context: str = "CONTENT_GRID"

        # Content Grid State (Segregated)
        self.grid_box_index: int = 0
        self.col_index: int = 0
        self.card_count: int = 6

        # Sidebar State (Segregated)
        self.sidebar_index: int = 0

    @property
    def in_sidebar(self) -> bool:
        """Backward compatibility helper."""
        return self.context == "SIDEBAR"

    @property
    def focused_index(self) -> int:
        """Backward compatibility helper."""
        return self.grid_box_index

    @property
    def col_idx(self) -> int:
        """Backward compatibility helper."""
        return self.col_index

    @property
    def sidebar_idx(self) -> int:
        """Backward compatibility helper."""
        return self.sidebar_index

    def handle_route_changed(self, new_route: str):
        """Called when browser navigates to a new page or view."""
        self.context = "CONTENT_GRID"
        self.grid_box_index = 0
        self.col_index = 0
        print(f" [ROUTE] Route transitioned to {new_route} -> Reset grid focus to Box 0")

    def sync_state(self, data: Dict[str, Any]):
        """Synchronizes DOM element counts, context, and focused indexes from browser sync events."""
        if "context" in data and data["context"] in ("CONTENT_GRID", "SIDEBAR"):
            self.context = data["context"]
        if "cardCount" in data and isinstance(data["cardCount"], int) and data["cardCount"] > 0:
            self.card_count = data["cardCount"]
        if "currentIndex" in data and isinstance(data["currentIndex"], int):
            self.grid_box_index = max(0, min(self.card_count - 1, data["currentIndex"]))
            self.col_index = self.grid_box_index % self.cols
        if "sidebarIndex" in data and isinstance(data["sidebarIndex"], int):
            self.sidebar_index = data["sidebarIndex"] % len(self.SIDEBAR_ITEMS)

    def reset_to_first_box(self):
        """Resets cursor tracking to Box 0 in content area."""
        self.context = "CONTENT_GRID"
        self.grid_box_index = 0
        self.col_index = 0
        print(" [STATE] Reset focus to Content Grid Box 0 (Col 0)")
        if self.bridge:
            self.bridge.broadcast_action("ENTER_CONTENT", {"boxIndex": 0})

    def trigger_next(self):
        """
        Left Gun (Horizontal Forward 👉):
        - In CONTENT_GRID: Move sequentially to the next grid box (i + 1).
          If at the end of the row, scroll down instead of jumping to the sidebar.
        - In SIDEBAR: Cycle through sidebar options forward.
        """
        try:
            # A. SIDEBAR CONTEXT: Left Gun (Forward) transitions from Sidebar into Content Grid Box 0
            if self.context == "SIDEBAR":
                self.context = "CONTENT_GRID"
                self.grid_box_index = 0
                self.col_index = 0
                print(" [ACTION] [CONTENT_ENTER] Left Gun (Forward): Transitioned from Sidebar to Content Grid Box 0!")
                if self.bridge:
                    self.bridge.broadcast_action("ENTER_CONTENT", {"boxIndex": 0})
                return

            # B. CONTENT_GRID CONTEXT: Move sequentially to next grid box (index + 1)
            max_idx = max(0, self.card_count - 1)
            next_idx = self.grid_box_index + 1
            if next_idx > max_idx:
                next_idx = max_idx

            if self.col_index >= self.cols - 1:
                # End of row: wrap to the next row and scroll down smoothly
                self.col_index = 0
                self.grid_box_index = next_idx
                if self.key_mode == "tab":
                    pyautogui.press('tab')
                else:
                    if not self.bridge or self.bridge.connected_tabs_count == 0:
                        pyautogui.scroll(-150)
                        pyautogui.press('down')
                print(f" [ACTION] [NEXT_ROW] Left Gun (Row Wrapped): Advanced to Box {self.grid_box_index} (Wrapped to next row)")
                if self.bridge:
                    self.bridge.broadcast_action("NEXT_ROW", {"boxIndex": self.grid_box_index, "scrollAmount": 150})
            else:
                self.col_index += 1
                self.grid_box_index = next_idx
                if self.key_mode == "tab":
                    pyautogui.press('tab')
                else:
                    if not self.bridge or self.bridge.connected_tabs_count == 0:
                        pyautogui.press('right')
                print(f" [ACTION] [NEXT_BOX] Left Gun: Advanced to Box {self.grid_box_index} (Col {self.col_index}/{self.cols - 1})")
                if self.bridge:
                    self.bridge.broadcast_action("NEXT_BOX", {"boxIndex": self.grid_box_index})

        except Exception as e:
            print(f" [WARN] Failed to dispatch next action: {e}")

    def trigger_prev(self):
        """
        Right Gun (Horizontal Backward 👈):
        - In CONTENT_GRID: Move sequentially to the previous grid box (i - 1).
          Transition to the sidebar ONLY when currently on the first/top-left box (Box 0).
        - In SIDEBAR: Cycle through sidebar options backward.
        """
        try:
            # A. SIDEBAR CONTEXT: Right Gun cycles through sidebar options
            if self.context == "SIDEBAR":
                self.sidebar_index = (self.sidebar_index - 1 + len(self.SIDEBAR_ITEMS)) % len(self.SIDEBAR_ITEMS)
                active_item = self.SIDEBAR_ITEMS[self.sidebar_index]
                if self.key_mode == "tab":
                    pyautogui.hotkey('shift', 'tab')
                else:
                    if not self.bridge or self.bridge.connected_tabs_count == 0:
                        pyautogui.press('up')
                print(f" [ACTION] [SIDEBAR_CYCLE] Right Gun: Previous Sidebar Option -> {active_item} ({self.sidebar_index + 1}/{len(self.SIDEBAR_ITEMS)})")
                if self.bridge:
                    self.bridge.broadcast_action("SIDEBAR_CYCLE", {
                        "sidebarItem": active_item,
                        "sidebarIndex": self.sidebar_index
                    })
                return

            # B. CONTENT_GRID CONTEXT: Check if actively on the first/top-left box (Box 0)
            if self.grid_box_index == 0:
                # Transition to sidebar ONLY when currently on the first/top-left box!
                self.context = "SIDEBAR"
                self.sidebar_index = 0
                if self.key_mode == "tab":
                    pyautogui.hotkey('shift', 'tab')
                else:
                    if not self.bridge or self.bridge.connected_tabs_count == 0:
                        pyautogui.press('left')
                print(" [ACTION] [SIDEBAR_TRANSITION] Right Gun: On First Grid Box (Box 0) -> Transitioned to Sidebar!")
                if self.bridge:
                    self.bridge.broadcast_action("SIDEBAR_ENTER", {
                        "sidebarItem": self.SIDEBAR_ITEMS[self.sidebar_index],
                        "sidebarIndex": self.sidebar_index
                    })
                return

            # C. CONTENT_GRID CONTEXT (grid_box_index > 0): Strictly decrement active grid index (currentIndex - 1)
            self.grid_box_index -= 1
            self.col_index = self.grid_box_index % self.cols
            if self.key_mode == "tab":
                pyautogui.hotkey('shift', 'tab')
            else:
                if not self.bridge or self.bridge.connected_tabs_count == 0:
                    pyautogui.press('left')
            print(f" [ACTION] [PREV_BOX] Right Gun: Strictly Backwards -> Box {self.grid_box_index} (Col {self.col_index})")
            if self.bridge:
                self.bridge.broadcast_action("PREV_BOX", {"boxIndex": self.grid_box_index})

        except Exception as e:
            print(f" [WARN] Failed to dispatch prev action: {e}")

    def trigger_select(self):
        """
        Thumbs Up (👍):
        - Targeted Element Click Fix: Executes a direct click strictly on the currently
          focused/highlighted element.
        - Strictly prevents any hardcoded event routing or fallback logic that forces it
          to open a default page or wrong route when a grid box is selected.
        """
        try:
            print(f" [ACTION] [TARGETED_CLICK] Thumbs Up: Triggering targeted click on focused Box #{self.grid_box_index} ({self.context})")
            if self.bridge and self.bridge.connected_tabs_count > 0:
                self.bridge.broadcast_action("CLICK_BOX", {
                    "boxIndex": self.grid_box_index,
                    "sidebarIndex": self.sidebar_index,
                    "context": self.context
                })
            else:
                # Fallback only when no browser bridge is connected: native Enter key
                pyautogui.press('enter')
        except Exception as e:
            print(f" [WARN] Failed to dispatch select action: {e}")

    def trigger_help(self):
        """Open Palm (✋): Trigger Help function / modal across active pages."""
        try:
            print(" [ACTION] [HELP] Open Palm: Triggering Help function / modal ✋")
            if self.bridge and self.bridge.connected_tabs_count > 0:
                self.bridge.broadcast_action("OPEN_HELP", {})
            else:
                pyautogui.press('f1')
        except Exception as e:
            print(f" [WARN] Failed to dispatch help action: {e}")

    def trigger_scroll_up(self, amount: int = 150):
        """Vertical Index Finger Up / Vertical Gun Up 🔼: Continuous smooth scroll up (-150px)."""
        try:
            if self.bridge and self.bridge.connected_tabs_count > 0:
                self.bridge.broadcast_action("PAGE_SCROLL", {"direction": "UP", "amount": -abs(amount)})
            else:
                pyautogui.scroll(amount)
            print(" [ACTION] [SCROLL_UP] Vertical Scroll Up: Smooth Page Scroll Up (-150px) 🔼")
        except Exception as e:
            print(f" [WARN] Scroll up failed: {e}")

    def trigger_scroll_down(self, amount: int = 150):
        """Vertical Index Finger Down / Vertical Gun Down 🔽: Continuous smooth scroll down (+150px)."""
        try:
            if self.bridge and self.bridge.connected_tabs_count > 0:
                self.bridge.broadcast_action("PAGE_SCROLL", {"direction": "DOWN", "amount": abs(amount)})
            else:
                pyautogui.scroll(-amount)
            print(" [ACTION] [SCROLL_DOWN] Vertical Scroll Down: Smooth Page Scroll Down (+150px) 🔽")
        except Exception as e:
            print(f" [WARN] Scroll down failed: {e}")

    def trigger_scroll(self, amount: int):
        """Executes continuous wheel delta scroll up or down."""
        if amount != 0:
            try:
                scroll_dir = "UP" if amount > 0 else "DOWN"
                scroll_px = -150 if amount > 0 else 150
                if self.bridge and self.bridge.connected_tabs_count > 0:
                    self.bridge.broadcast_action("PAGE_SCROLL", {"direction": scroll_dir, "amount": scroll_px})
                else:
                    pyautogui.scroll(amount)
            except Exception as e:
                print(f" [WARN] Scroll dispatch failed: {e}")


# ======================================================================================
# 7. HEADS-UP DISPLAY (HUD) & VISUAL FEEDBACK
# ======================================================================================
class GestureHUD:
    """Renders modern glassmorphism UI overlays, bounding landmarks, and status banners."""

    @staticmethod
    def draw(
        frame,
        gesture: str,
        cooldown_prog: float,
        last_action: Optional[str],
        fps: float,
        scroll_state: str,
        executor: ActionExecutor,
        neutral_y: Optional[float],
        connected_tabs: int
    ):
        h, w, _ = frame.shape

        # 1. Top Header Glass Bar
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (w, 64), (18, 22, 32), -1)
        cv2.rectangle(overlay, (0, h - 45), (w, h), (18, 22, 32), -1)
        cv2.addWeighted(overlay, 0.78, frame, 0.22, 0, frame)

        # Title & Mode
        cv2.putText(frame, "AccessAI Gesture Controller", (16, 26), cv2.FONT_HERSHEY_DUPLEX, 0.60, (255, 255, 255), 2)
        cv2.putText(frame, f"FPS: {fps:.1f}", (w - 95, 26), cv2.FONT_HERSHEY_DUPLEX, 0.48, (180, 200, 220), 1)

        # Bridge Status & Active Context Display (Segregated)
        bridge_str = f"DOM Bridge: {connected_tabs} Tab(s) Connected" if connected_tabs > 0 else "DOM Bridge: Listening (:8765)"
        bridge_col = (100, 230, 140) if connected_tabs > 0 else (180, 190, 200)
        cv2.putText(frame, bridge_str, (w - 260, 52), cv2.FONT_HERSHEY_SIMPLEX, 0.38, bridge_col, 1)

        if executor.context == "SIDEBAR":
            sidebar_name = executor.SIDEBAR_ITEMS[executor.sidebar_index]
            context_str = f"CONTEXT: [SIDEBAR] Item #{executor.sidebar_index + 1}: {sidebar_name.upper()}"
            context_color = (0, 165, 255)
        else:
            context_str = f"CONTEXT: [CONTENT_GRID] Box #{executor.grid_box_index} (Col {executor.col_index}/{executor.cols - 1})"
            context_color = (50, 215, 50)
        cv2.putText(frame, context_str, (16, 52), cv2.FONT_HERSHEY_DUPLEX, 0.44, context_color, 1)

        # 2. Gesture Pill / Status Badge
        badge_text = "READY / SEARCHING"
        badge_color = (90, 100, 110)

        if gesture == "GUN_LEFT":
            badge_text = "LEFT HAND GUN -> NEXT GRID BOX 👉" if executor.context == "CONTENT_GRID" else "LEFT HAND GUN -> ENTER GRID"
            badge_color = (255, 170, 0)
        elif gesture == "GUN_RIGHT":
            badge_text = "RIGHT HAND GUN -> PREV GRID BOX 👈" if executor.context == "CONTENT_GRID" else "RIGHT HAND GUN -> PREV SIDEBAR"
            badge_color = (0, 140, 255)
        elif gesture == "THUMB_UP":
            badge_text = "THUMBS UP -> TARGETED CLICK ON ACTIVE ITEM 👍"
            badge_color = (180, 80, 255)
        elif gesture in ("SCROLL_UP", "GUN_SCROLL_UP", "PALM_SCROLL_UP"):
            badge_text = "SCROLL UP 🔼 (-150px)"
            badge_color = (0, 210, 90)
        elif gesture in ("SCROLL_DOWN", "GUN_SCROLL_DOWN", "PALM_SCROLL_DOWN"):
            badge_text = "SCROLL DOWN 🔽 (+150px)"
            badge_color = (0, 210, 90)
        elif gesture == "OPEN_PALM":
            badge_text = "OPEN PALM -> HELP & COMMANDS ✋"
            badge_color = (240, 100, 180)
        elif gesture == "SCROLL_MODE":
            badge_text = scroll_state
            badge_color = (0, 210, 90)

        tw, _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_DUPLEX, 0.50, 2)[0]
        bx1 = max(10, (w - tw) // 2 - 14)
        bx2 = min(w - 10, bx1 + tw + 28)
        cv2.rectangle(frame, (bx1, 10), (bx2, 48), badge_color, -1, cv2.LINE_AA)
        cv2.putText(frame, badge_text, (bx1 + 14, 35), cv2.FONT_HERSHEY_DUPLEX, 0.48, (255, 255, 255), 2, cv2.LINE_AA)

        # 3. Neutral Rest Zone Reticle for Continuous Smooth Scrolling
        if gesture == "SCROLL_MODE" and neutral_y is not None:
            ny_px = int(neutral_y * h)
            deadband_px = int(0.035 * h)
            cv2.rectangle(frame, (w // 2 - 120, ny_px - deadband_px), (w // 2 + 120, ny_px + deadband_px), (0, 255, 128), 1)
            cv2.line(frame, (w // 2 - 120, ny_px), (w // 2 + 120, ny_px), (0, 255, 128), 2)
            cv2.putText(frame, "SCROLL REST ZONE", (w // 2 - 70, ny_px - deadband_px - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 255, 128), 1)

        # 4. Strict Debounce Cooldown Bar (visual progress)
        if cooldown_prog > 0:
            bar_w = int((w - 32) * cooldown_prog)
            cv2.rectangle(frame, (16, 60), (16 + bar_w, 63), (0, 180, 255), -1)

        # 5. Bottom Footer Info
        footer = "Left Hand: Next (wrap row) | Right Hand: Prev (sidebar at 0) | V-Gun: Scroll Up/Down | Thumb Up: Click Active | 'q': Exit"
        cv2.putText(frame, footer, (16, h - 16), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (210, 220, 230), 1, cv2.LINE_AA)


# ======================================================================================
# 8. MAIN CONTROLLER LOOP
# ======================================================================================
class GestureControllerApp:
    """Coordinates webcam capture, MediaPipe tracking, gesture logic, and event execution."""

    def __init__(
        self,
        camera_id: int = 0,
        cols: int = 3,
        debounce_cooldown: float = 0.35,
        scroll_speed: float = 1.0,
        key_mode: str = "arrows",
        gui: bool = True
    ):
        self.camera_id = camera_id
        self.cols = cols
        self.gui = gui
        self.key_mode = key_mode

        # Core Modules
        self.detector = GestureDetector()
        self.debouncer = ActionDebouncer(required_frames=2, cooldown_seconds=debounce_cooldown)
        self.scroller = SmoothScroller(speed_multiplier=scroll_speed)

        # Start Multi-Page DOM Event Bridge
        self.bridge = MultiPageDOMBridge(port=8765)
        self.executor = ActionExecutor(cols=cols, key_mode=key_mode, bridge=self.bridge)
        self.bridge.start(self.executor)

        # MediaPipe Hands with slightly lowered confidence thresholds to prevent missing gestures
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.60,
            min_tracking_confidence=0.55
        )
        self.mp_draw = mp.solutions.drawing_utils
        self.mp_draw_styles = mp.solutions.drawing_styles

    def run(self):
        print("====================================================================")
        print(" AccessAI MediaPipe Gesture Controller Running (Precision Refactor)")
        print("====================================================================")
        print(" • Left Hand Gun Sign            : Next Grid Box (i+1) | End of row: wrap down (no sidebar jump)")
        print(" • Right Hand Gun Sign           : Prev Grid Box (i-1) | Box 0 ONLY: arrive at sidebar")
        print(" • Sidebar Cycling 📋            : Left/Right guns cycle through sidebar options")
        print(" • Vertical Index / Gun Up 🔼    : Continuous smooth scroll up (-150px)")
        print(" • Vertical Index / Gun Down 🔽  : Continuous smooth scroll down (+150px)")
        print(" • Thumbs Up 👍                  : Targeted click strictly on active/focused DOM element")
        print(" • Open Palm ✋                  : Strictly reserved for Help & Commands modal")
        print(f" • Continuous Navigation ⏱️      : Holds auto-advance every {self.debouncer.nav_repeat_interval * 1000:.0f}ms")
        print(" • Visual Glow (.focus-glow) 🌟  : High-contrast outline: 3px solid #3b82f6")
        print(" • Multi-Page Persistence 🌐     : MutationObserver re-indexes dynamically across routes")
        print(" • DOM Bridge Server 🚀          : http://127.0.0.1:8765/events")
        print("   Browser Console Activation Snippet (paste once in browser DevTools):")
        print("   fetch('http://127.0.0.1:8765/gesture-bridge.js').then(r=>r.text()).then(eval)")
        print(" • Exit 🛑                       : Press 'q' or 'ESC' in window, or Ctrl+C")
        print("====================================================================")

        cap = cv2.VideoCapture(self.camera_id)
        if not cap.isOpened():
            print(f"[ERROR] Could not open camera {self.camera_id}. Check connection or index.")
            sys.exit(1)

        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        prev_time = time.time()
        fps = 30.0

        try:
            while cap.isOpened():
                success, frame = cap.read()
                if not success:
                    print("[WARN] Blank frame grabbed. Retrying...")
                    time.sleep(0.01)
                    continue

                # Mirror frame horizontally for natural intuitive interaction
                frame = cv2.flip(frame, 1)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = self.hands.process(rgb_frame)

                detected_gesture = "NONE"
                active_anchor = None
                scroll_state = "IDLE"

                if results.multi_hand_landmarks:
                    for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                        handedness_label = "Right"
                        if results.multi_handedness and idx < len(results.multi_handedness):
                            handedness_label = results.multi_handedness[idx].classification[0].label

                        # Draw hand skeleton if GUI active
                        if self.gui:
                            self.mp_draw.draw_landmarks(
                                frame,
                                hand_landmarks,
                                self.mp_hands.HAND_CONNECTIONS,
                                self.mp_draw_styles.get_default_hand_landmarks_style(),
                                self.mp_draw_styles.get_default_hand_connections_style()
                            )

                        # Detect gesture on first primary hand with chirality and calibrated thresholds
                        res = self.detector.detect(hand_landmarks.landmark, handedness_label)
                        if res["gesture"] != "NONE":
                            detected_gesture = res["gesture"]
                            active_anchor = res.get("anchor")
                            break

                # Continuous Throttle & Cooldown Action Processing (350ms frame throttle)
                triggered_action = self.debouncer.update(detected_gesture)
                if triggered_action == "GUN_LEFT":
                    self.executor.trigger_next()
                elif triggered_action == "GUN_RIGHT":
                    self.executor.trigger_prev()
                elif triggered_action in ("SCROLL_UP", "GUN_SCROLL_UP"):
                    self.executor.trigger_scroll_up(150)
                elif triggered_action in ("SCROLL_DOWN", "GUN_SCROLL_DOWN"):
                    self.executor.trigger_scroll_down(150)
                elif triggered_action == "THUMB_UP":
                    self.executor.trigger_select()
                elif triggered_action == "OPEN_PALM":
                    self.executor.trigger_help()

                # 3. Calculate FPS
                now = time.time()
                dt = now - prev_time
                if dt > 0:
                    fps = 0.9 * fps + 0.1 * (1.0 / dt)
                prev_time = now

                # 4. Render GUI Window
                if self.gui:
                    cooldown_prog = self.debouncer.get_cooldown_progress()
                    GestureHUD.draw(
                        frame,
                        detected_gesture,
                        cooldown_prog,
                        self.debouncer.last_triggered_action,
                        fps,
                        scroll_state,
                        self.executor,
                        self.scroller.neutral_y,
                        self.bridge.connected_tabs_count
                    )
                    cv2.imshow("AccessAI Gesture Controller (MediaPipe)", frame)

                    key = cv2.waitKey(1) & 0xFF
                    if key in (ord('q'), 27):  # 'q' or ESC
                        print("[INFO] Exiting gesture controller...")
                        break
                    elif key == ord('r'):  # 'r' to reset focus
                        self.executor.reset_to_first_box()

        except KeyboardInterrupt:
            print("\n[INFO] Gesture controller stopped by user.")
        finally:
            cap.release()
            cv2.destroyAllWindows()
            self.hands.close()
            print("[INFO] Resources released successfully.")


# ======================================================================================
# 9. CLI ENTRYPOINT
# ======================================================================================
def parse_args():
    parser = argparse.ArgumentParser(
        description="AccessAI Isolated MediaPipe Gesture Controller",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument("--camera", type=int, default=0, help="Webcam device ID")
    parser.add_argument("--cols", type=int, default=3, help="Number of boxes/cards per row in grid")
    parser.add_argument("--debounce", type=float, default=0.35, help="Cooldown time in seconds between actions (continuous 350ms throttle)")
    parser.add_argument("--scroll-speed", type=float, default=1.0, help="Scroll sensitivity multiplier")
    parser.add_argument("--key-mode", type=str, choices=["arrows", "tab"], default="tab",
                        help="Key events: 'arrows' or 'tab'")
    parser.add_argument("--no-gui", action="store_true", help="Run headless in terminal without OpenCV window")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    app = GestureControllerApp(
        camera_id=args.camera,
        cols=args.cols,
        debounce_cooldown=args.debounce,
        scroll_speed=args.scroll_speed,
        key_mode=args.key_mode,
        gui=not args.no_gui
    )
    app.run()
