"""
AccessAI Motor & Mobility Assistive Engine Package
==================================================
Provides real-time head-tracking tremor suppression, spatial dwell-click pacing,
hierarchical switch-scanning state machines, and Meko motor profile calibration.
"""

from .head_tracker_filter import TremorFilter, HeadPointerMapper
from .dwell_engine import DwellTimer, DwellResult
from .switch_scanner import SwitchScanningStateMachine, ScanMode
from .motor_profile import MekoMotorProfile

__all__ = [
    "TremorFilter",
    "HeadPointerMapper",
    "DwellTimer",
    "DwellResult",
    "SwitchScanningStateMachine",
    "ScanMode",
    "MekoMotorProfile"
]

