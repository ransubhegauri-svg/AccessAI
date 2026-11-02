"""
AccessAI Meko Motor Profile & Accessibility Accommodation Manager
=================================================================
Manages persistent individual accommodation settings for motor-impaired learners:
- Dwell pacing duration (800ms - 2500ms)
- Minimum hit target expansion (48px padding standard)
- Adaptive tremor filter alpha (0.1 - 0.9)
- Involuntary spasm debounce guard (200ms)
- Structured Meko vector memory packet generation
"""

import time
from typing import Dict, Any, Optional


class MekoMotorProfile:
    """
    Durable student accommodation profile conforming to Meko Persistent Memory standards.
    """

    def __init__(
        self,
        student_id: str = "demo-motor-001",
        student_name: str = "Aarav Patel",
        input_method: str = "head_tracking",
        dwell_time_ms: int = 1400,
        hit_target_min_px: int = 48,
        tremor_smoothing_alpha: float = 0.65,
        debounce_guard_ms: int = 200,
        scan_interval_ms: int = 1200,
        preferred_input: Optional[str] = None,
        notes: Optional[str] = None
    ):
        self.student_id = student_id
        self.student_name = student_name
        self.input_method = preferred_input if preferred_input is not None else input_method
        self.notes = notes or ""
        self.dwell_time_ms = max(500, min(5000, dwell_time_ms))
        self.hit_target_min_px = max(48, min(120, hit_target_min_px))
        self.tremor_smoothing_alpha = max(0.05, min(0.95, tremor_smoothing_alpha))
        self.debounce_guard_ms = max(50, min(1000, debounce_guard_ms))
        self.scan_interval_ms = max(400, min(4000, scan_interval_ms))
        self.last_calibrated_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    def calibrate(
        self,
        dwell_time_ms: Optional[int] = None,
        input_method: Optional[str] = None,
        hit_target_min_px: Optional[int] = None,
        tremor_smoothing_alpha: Optional[float] = None
    ):
        """Updates accommodation parameters."""
        if dwell_time_ms is not None:
            self.dwell_time_ms = max(500, min(5000, int(dwell_time_ms)))
        if input_method:
            self.input_method = str(input_method).lower()
        if hit_target_min_px is not None:
            self.hit_target_min_px = max(48, min(120, int(hit_target_min_px)))
        if tremor_smoothing_alpha is not None:
            self.tremor_smoothing_alpha = max(0.05, min(0.95, float(tremor_smoothing_alpha)))
        self.last_calibrated_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "student_id": self.student_id,
            "student_name": self.student_name,
            "input_method": self.input_method,
            "dwell_time_ms": self.dwell_time_ms,
            "hit_target_min_px": self.hit_target_min_px,
            "tremor_smoothing_alpha": self.tremor_smoothing_alpha,
            "debounce_guard_ms": self.debounce_guard_ms,
            "scan_interval_ms": self.scan_interval_ms,
            "last_calibrated_at": self.last_calibrated_at
        }

    def to_meko_packet(self) -> Dict[str, Any]:
        """
        Emits structured vector memory text for persistence in Meko Datapack.
        """
        memory_text = (
            f"[Durable Motor Accommodation Profile - {self.student_name} ({self.student_id})]: "
            f"Input Method: {self.input_method.upper()}. "
            f"Dwell Pacing: {self.dwell_time_ms}ms with circular countdown. "
            f"Hit Target Expansion: {self.hit_target_min_px}px minimum padding. "
            f"Tremor Smoothing Alpha: {self.tremor_smoothing_alpha}. "
            f"Spasm Debounce Guard: {self.debounce_guard_ms}ms."
        )

        return {
            "datapack_id": "3bbeb08c-6e41-45a6-9d4f-332b4ad3a254",
            "category": "motor_accommodation",
            "student_id": self.student_id,
            "text": memory_text,
            "metadata": {
                "dwell_time_ms": self.dwell_time_ms,
                "hit_target_min_px": self.hit_target_min_px,
                "tremor_smoothing_alpha": self.tremor_smoothing_alpha,
                "debounce_guard_ms": self.debounce_guard_ms
            },
            "profile": self.to_dict()
        }

    def generate_meko_memory_packet(self) -> Dict[str, Any]:
        """Alias for to_meko_packet."""
        return self.to_meko_packet()

