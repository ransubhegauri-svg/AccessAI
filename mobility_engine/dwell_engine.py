"""
AccessAI Spatial Dwell-Click Pacing Engine
==========================================
Enables hands-free target activation through spatial gaze or head-cursor dwell.
Implements:
- Radial tolerance zone (28px - 48px) absorbing motor spasms
- Configurable dwell pacing (default 1400ms, adjustable 800ms - 2500ms)
- Normalized progress tracking (0.0 -> 1.0) for visual circular countdown indicators
- Auto-activation trigger gate
"""

import time
import math
from typing import Dict, Any, Optional


class DwellResult:
    """Encapsulates the state of an active or evaluated dwell cycle."""

    IDLE = "idle"
    DWELLING = "dwelling"
    TRIGGERED = "triggered"
    CANCELLED = "cancelled"

    def __init__(
        self,
        status: str,
        target_id: Optional[str] = None,
        progress: float = 0.0,
        elapsed_ms: float = 0.0,
        target_duration_ms: float = 1400.0,
        is_triggered: bool = False
    ):
        self.status = status
        self.target_id = target_id
        self.progress = max(0.0, min(1.0, progress))
        self.elapsed_ms = elapsed_ms
        self.target_duration_ms = target_duration_ms
        self.is_triggered = is_triggered

    @property
    def triggered(self) -> bool:
        return self.is_triggered

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "target_id": self.target_id,
            "progress": round(self.progress, 3),
            "elapsed_ms": round(self.elapsed_ms, 1),
            "target_duration_ms": self.target_duration_ms,
            "is_triggered": self.is_triggered,
            "triggered": self.is_triggered
        }


class DwellTimer:
    """
    Evaluates cursor dwell over spatial screen targets.
    Prevents accidental activations through continuous radial verification.
    """

    def __init__(
        self,
        default_duration_ms: float = 1400.0,
        default_tolerance_px: float = 36.0,
        dwell_time_ms: Optional[float] = None,
        tolerance_px: Optional[float] = None
    ):
        duration = dwell_time_ms if dwell_time_ms is not None else default_duration_ms
        tolerance = tolerance_px if tolerance_px is not None else default_tolerance_px
        self.default_duration_ms = max(500.0, min(5000.0, duration))
        self.default_tolerance_px = max(10.0, min(120.0, tolerance))

        self.active_target_id: Optional[str] = None
        self.target_anchor_x: float = 0.0
        self.target_anchor_y: float = 0.0
        self.dwell_start_time: float = 0.0
        self.has_triggered: bool = False

    @property
    def dwell_time_ms(self) -> float:
        return self.default_duration_ms

    @property
    def tolerance_px(self) -> float:
        return self.default_tolerance_px

    def set_dwell_time(self, ms: float):
        self.default_duration_ms = max(500.0, min(5000.0, float(ms)))

    def set_tolerance(self, px: float):
        self.default_tolerance_px = max(10.0, min(120.0, float(px)))

    def evaluate(
        self,
        cursor_x: Optional[float] = None,
        cursor_y: Optional[float] = None,
        x: Optional[float] = None,
        y: Optional[float] = None,
        target_id: Optional[str] = "screen_pointer",
        target_center_x: Optional[float] = None,
        target_center_y: Optional[float] = None,
        duration_ms: Optional[float] = None,
        tolerance_px: Optional[float] = None,
        timestamp_ms: Optional[float] = None
    ) -> DwellResult:
        """Evaluates cursor dwell over spatial screen targets."""
        cx = cursor_x if cursor_x is not None else (x if x is not None else 0.0)
        cy = cursor_y if cursor_y is not None else (y if y is not None else 0.0)
        return self.update(
            cursor_x=cx,
            cursor_y=cy,
            target_id=target_id,
            target_center_x=target_center_x,
            target_center_y=target_center_y,
            duration_ms=duration_ms,
            tolerance_px=tolerance_px,
            timestamp_ms=timestamp_ms
        )

    def update(
        self,
        cursor_x: float,
        cursor_y: float,
        target_id: Optional[str],
        target_center_x: Optional[float] = None,
        target_center_y: Optional[float] = None,
        duration_ms: Optional[float] = None,
        tolerance_px: Optional[float] = None,
        timestamp_ms: Optional[float] = None
    ) -> DwellResult:
        """
        Evaluates current cursor position relative to targeted interactive element.
        """
        now = timestamp_ms if timestamp_ms is not None else (time.time() * 1000.0)
        duration = duration_ms if duration_ms is not None else self.default_duration_ms
        tolerance = tolerance_px if tolerance_px is not None else self.default_tolerance_px

        # Case 1: No target active or cursor off interactive elements
        if not target_id:
            if self.active_target_id is not None:
                self.reset()
                return DwellResult(DwellResult.CANCELLED, progress=0.0)
            return DwellResult(DwellResult.IDLE, progress=0.0)

        # Case 2: New target entered
        if target_id != self.active_target_id:
            self.active_target_id = target_id
            self.target_anchor_x = target_center_x if target_center_x is not None else cursor_x
            self.target_anchor_y = target_center_y if target_center_y is not None else cursor_y
            self.dwell_start_time = now
            self.has_triggered = False
            return DwellResult(
                DwellResult.DWELLING,
                target_id=target_id,
                progress=0.0,
                elapsed_ms=0.0,
                target_duration_ms=duration
            )

        # Case 3: Already triggered for this dwell session (prevent repeat firing until cursor leaves)
        if self.has_triggered:
            return DwellResult(
                DwellResult.TRIGGERED,
                target_id=target_id,
                progress=1.0,
                elapsed_ms=duration,
                target_duration_ms=duration,
                is_triggered=False
            )

        # Case 4: Continuing dwell over same target — check radial tolerance
        dx = cursor_x - self.target_anchor_x
        dy = cursor_y - self.target_anchor_y
        dist = math.sqrt(dx * dx + dy * dy)

        if dist > tolerance:
            # Slipped outside tolerance circle — cancel dwell
            self.reset()
            return DwellResult(DwellResult.CANCELLED, target_id=target_id, progress=0.0)

        elapsed = now - self.dwell_start_time
        progress = min(1.0, elapsed / duration)

        if elapsed >= duration:
            self.has_triggered = True
            return DwellResult(
                DwellResult.TRIGGERED,
                target_id=target_id,
                progress=1.0,
                elapsed_ms=elapsed,
                target_duration_ms=duration,
                is_triggered=True
            )

        return DwellResult(
            DwellResult.DWELLING,
            target_id=target_id,
            progress=progress,
            elapsed_ms=elapsed,
            target_duration_ms=duration,
            is_triggered=False
        )

    def reset(self):
        """Resets timer state."""
        self.active_target_id = None
        self.dwell_start_time = 0.0
        self.has_triggered = False

