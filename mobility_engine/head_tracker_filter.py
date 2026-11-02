"""
AccessAI Head-Tracking Tremor Suppression & Spatial Pointer Mapper
==================================================================
Converts raw MediaPipe facial mesh / head pose vectors into smooth viewport
cursor coordinates with adaptive exponential moving average (EMA) filtering,
deadband resting zone, and sensitivity scaling for motor-impaired learners.
"""

import math
from typing import Tuple, Dict, Any, Optional


class TremorFilter:
    """
    Adaptive Exponential Moving Average (EMA) Low-Pass Filter.
    Eliminates high-frequency involuntary hand/head jitter and micro-tremors
    while preserving intentional fast saccadic head turns.
    Supports both 1D scalar and 2D coordinate smoothing.
    """

    def __init__(
        self,
        alpha: float = 0.65,
        min_cutoff_velocity: float = 0.002,
        base_alpha: Optional[float] = None,
        resting_deadband: float = 0.002
    ):
        chosen_alpha = base_alpha if base_alpha is not None else alpha
        self.base_alpha = max(0.05, min(0.95, chosen_alpha))
        self.min_cutoff = min_cutoff_velocity
        self.resting_deadband = resting_deadband
        self.filtered_x: Optional[float] = None
        self.filtered_y: Optional[float] = None

    @property
    def prev_val(self) -> Optional[float]:
        return self.filtered_x

    def filter(self, raw_x: float, raw_y: Optional[float] = None, dt: float = 0.016) -> Any:
        """
        Filters input coordinates:
        - If raw_y is None: performs 1D scalar filtering and returns float.
        - If raw_y is provided: performs 2D coordinate filtering and returns (smooth_x, smooth_y).
        """
        # 1D Scalar Mode
        if raw_y is None:
            if self.filtered_x is None:
                self.filtered_x = raw_x
                return raw_x

            diff = raw_x - self.filtered_x
            if abs(diff) <= self.resting_deadband:
                return self.filtered_x

            # Velocity-adaptive alpha
            velocity = abs(diff) / max(dt, 0.001)
            if velocity > 500.0:  # Fast intentional saccade
                effective_alpha = min(0.95, max(0.65, self.base_alpha * 3.5))
            elif velocity < 50.0:
                effective_alpha = self.base_alpha * 0.5
            else:
                effective_alpha = self.base_alpha

            self.filtered_x = self.filtered_x + effective_alpha * diff
            return self.filtered_x

        # 2D Coordinate Mode
        if self.filtered_x is None or self.filtered_y is None:
            self.filtered_x = raw_x
            self.filtered_y = raw_y
            return raw_x, raw_y

        dx = raw_x - self.filtered_x
        dy = raw_y - self.filtered_y
        dist = math.sqrt(dx * dx + dy * dy)

        if dist <= self.resting_deadband:
            return self.filtered_x, self.filtered_y

        if dist < self.min_cutoff:
            alpha = self.base_alpha * 0.4
        elif dist < self.min_cutoff * 4:
            alpha = self.base_alpha
        else:
            alpha = min(0.90, self.base_alpha * 1.35)

        self.filtered_x = self.filtered_x + alpha * dx
        self.filtered_y = self.filtered_y + alpha * dy
        return self.filtered_x, self.filtered_y

    def reset(self):
        """Clears filter memory."""
        self.filtered_x = None
        self.filtered_y = None


class HeadPointerMapper:
    """
    Maps normalized facial/head coordinates into target viewport screen coordinates.
    Implements:
    - Deadband resting zone (suppresses drift when resting head)
    - Sensitivity scaling (0.2x - 5.0x)
    - Viewport boundary clamping
    - Calibrated center reference offset
    """

    def __init__(
        self,
        screen_width: int = 1920,
        screen_height: int = 1080,
        sensitivity: float = 1.4,
        deadband_radius: float = 0.015,
        tremor_alpha: float = 0.65
    ):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.sensitivity = max(0.2, min(5.0, sensitivity))
        self.deadband_radius = max(0.0, min(0.1, deadband_radius))
        self.center_x: float = 0.5
        self.center_y: float = 0.5
        self.is_calibrated: bool = False
        self.filter = TremorFilter(alpha=tremor_alpha)

    @property
    def neutral_x(self) -> float:
        return self.center_x

    @property
    def neutral_y(self) -> float:
        return self.center_y

    def calibrate_neutral(self, neutral_x: float = 0.5, neutral_y: float = 0.5):
        """Sets the neutral forward-facing head position as center."""
        self.calibrate(neutral_x, neutral_y)

    def set_sensitivity(self, sensitivity: float):
        self.sensitivity = max(0.2, min(5.0, sensitivity))

    def calibrate(self, neutral_x: float = 0.5, neutral_y: float = 0.5):
        """Sets the neutral forward-facing head position as center."""
        self.center_x = neutral_x
        self.center_y = neutral_y
        self.is_calibrated = True
        self.filter.reset()

    def process_landmark(
        self,
        normalized_x: float,
        normalized_y: float,
        screen_width: Optional[int] = None,
        screen_height: Optional[int] = None,
        dt: float = 0.016
    ) -> Dict[str, Any]:
        """Convenience method accepting normalized coordinates and viewport size."""
        if screen_width:
            self.screen_width = int(screen_width)
        if screen_height:
            self.screen_height = int(screen_height)
        return self.process(normalized_x, normalized_y)

    def process(self, raw_x: float, raw_y: float) -> Dict[str, Any]:
        """
        Processes normalized input coordinates (0.0 to 1.0) and outputs
        smoothed screen pixels within (0, screen_width) and (0, screen_height).
        """
        # Step 1: Smooth tremors
        smooth_x, smooth_y = self.filter.filter(raw_x, raw_y)

        # Step 2: Offset from calibrated center
        delta_x = smooth_x - self.center_x
        delta_y = smooth_y - self.center_y

        # Step 3: Apply deadband threshold (neutral resting zone)
        dist = math.sqrt(delta_x * delta_x + delta_y * delta_y)
        if dist < self.deadband_radius:
            delta_x = 0.0
            delta_y = 0.0
        else:
            # Scale smoothly past the deadband boundary
            scale_factor = (dist - self.deadband_radius) / max(dist, 0.0001)
            delta_x *= scale_factor
            delta_y *= scale_factor

        # Step 4: Sensitivity multiplier & screen projection
        # Note: Invert X for mirror-like camera feedback
        projected_norm_x = 0.5 - (delta_x * self.sensitivity)
        projected_norm_y = 0.5 + (delta_y * self.sensitivity)

        # Step 5: Screen coordinate clamping
        screen_x = max(0, min(self.screen_width, int(projected_norm_x * self.screen_width)))
        screen_y = max(0, min(self.screen_height, int(projected_norm_y * self.screen_height)))

        return {
            "screen_x": screen_x,
            "screen_y": screen_y,
            "norm_x": round(projected_norm_x, 4),
            "norm_y": round(projected_norm_y, 4),
            "is_calibrated": self.is_calibrated,
            "in_deadband": dist < self.deadband_radius,
            "sensitivity": self.sensitivity
        }

