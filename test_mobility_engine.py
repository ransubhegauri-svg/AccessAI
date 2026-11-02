"""
Unit and Integration Test Suite for AccessAI Motor & Mobility Assistive Backend.
Covers:
- Adaptive Tremor Suppression Filter (velocity-adaptive EMA + deadband)
- Head Pointer Screen Mapping & Neutral Calibration
- Dwell-Click Pacing Engine (radial tolerance circle & progress indicator)
- Hierarchical Switch-Scanning State Machine (Auto, Step, Row-Column & Debounce Guard)
- Meko Motor Accommodation Profile (WCAG AAA 48px + vector memory packets)
- REST Microservice API Endpoints (/api/mobility/...)
"""

import json
import time
import unittest

from mobility_engine import (
    TremorFilter,
    HeadPointerMapper,
    DwellTimer,
    DwellResult,
    SwitchScanningStateMachine,
    ScanMode,
    MekoMotorProfile,
)
from app import app


class TestTremorFilter(unittest.TestCase):
    """Tests the adaptive low-pass filter and tremor suppression mechanics."""

    def setUp(self):
        self.filter = TremorFilter(base_alpha=0.20, resting_deadband=1.5)

    def test_initial_value_passthrough(self):
        val = self.filter.filter(500.0, dt=0.016)
        self.assertEqual(val, 500.0)

    def test_micro_tremor_suppression(self):
        """Micro-jitter within resting deadband should be held or heavily smoothed."""
        self.filter.filter(500.0, dt=0.016)
        # Jitter of +0.8 (within 1.5 deadband)
        smoothed = self.filter.filter(500.8, dt=0.016)
        # Should stay at 500.0 due to deadband
        self.assertEqual(smoothed, 500.0)

    def test_intentional_motion_adaptation(self):
        """High-velocity intentional movement should dynamically scale alpha to eliminate lag."""
        self.filter.filter(100.0, dt=0.016)
        # Large jump: 100 -> 300 in 16ms = velocity 12500 px/s
        jump_val = self.filter.filter(300.0, dt=0.016)
        # Should rapidly approach 300, far exceeding the base 0.20 weight
        self.assertGreater(jump_val, 200.0)

    def test_reset(self):
        self.filter.filter(450.0, dt=0.016)
        self.filter.reset()
        self.assertIsNone(self.filter.prev_val)


class TestHeadPointerMapper(unittest.TestCase):
    """Tests head landmark to screen coordinate mapping and neutral calibration."""

    def setUp(self):
        self.mapper = HeadPointerMapper(sensitivity=2.0, deadband_radius=0.02)

    def test_neutral_pose_centered(self):
        """Looking straight ahead at calibrated neutral (0.5, 0.5) centers on 1920x1080."""
        self.mapper.calibrate_neutral(0.5, 0.5)
        coords = self.mapper.process_landmark(0.5, 0.5, 1920, 1080)
        self.assertAlmostEqual(coords["screen_x"], 960.0, delta=5.0)
        self.assertAlmostEqual(coords["screen_y"], 540.0, delta=5.0)

    def test_screen_boundary_clamping(self):
        """Extreme head rotation should clamp to screen boundaries without NaN or overflow."""
        coords = self.mapper.process_landmark(0.99, 0.99, 1920, 1080)
        self.assertLessEqual(coords["screen_x"], 1920.0)
        self.assertLessEqual(coords["screen_y"], 1080.0)
        self.assertGreaterEqual(coords["screen_x"], 0.0)
        self.assertGreaterEqual(coords["screen_y"], 0.0)

    def test_sensitivity_scaling(self):
        self.mapper.set_sensitivity(3.0)
        self.assertEqual(self.mapper.sensitivity, 3.0)
        # Bounds check: sensitivity < 0.2 clamped
        self.mapper.set_sensitivity(0.05)
        self.assertEqual(self.mapper.sensitivity, 0.2)


class TestDwellEngine(unittest.TestCase):
    """Tests spatial dwell-click pacing engine."""

    def setUp(self):
        self.dwell = DwellTimer(dwell_time_ms=1000, tolerance_px=36.0)

    def test_initial_state_idle(self):
        res = self.dwell.evaluate(500, 500, timestamp_ms=1000)
        self.assertIn(res.status, ("idle", "dwelling"))
        self.assertEqual(res.progress, 0.0)
        self.assertFalse(res.triggered)

    def test_dwell_progress_and_activation(self):
        """Dwelling inside tolerance circle advances progress and triggers at 1000ms."""
        # Start dwell
        self.dwell.evaluate(500, 500, timestamp_ms=1000)

        # 500ms later (50% progress)
        res_half = self.dwell.evaluate(505, 503, timestamp_ms=1500)
        self.assertEqual(res_half.status, "dwelling")
        self.assertAlmostEqual(res_half.progress, 0.5, places=2)
        self.assertFalse(res_half.triggered)

        # 1000ms later (100% progress & activated)
        res_full = self.dwell.evaluate(502, 504, timestamp_ms=2000)
        self.assertEqual(res_full.status, "triggered")
        self.assertEqual(res_full.progress, 1.0)
        self.assertTrue(res_full.triggered)

    def test_movement_cancels_dwell(self):
        """Moving outside tolerance circle resets dwell timer."""
        self.dwell.evaluate(500, 500, timestamp_ms=1000)
        self.dwell.evaluate(505, 502, timestamp_ms=1500)
        # Move far away (dx = 150px > 36px)
        res_moved = self.dwell.evaluate(650, 500, timestamp_ms=1600)
        self.assertIn(res_moved.status, ("idle", "cancelled"))
        self.assertEqual(res_moved.progress, 0.0)


class TestSwitchScanner(unittest.TestCase):
    """Tests single and dual switch scanning state machine."""

    def setUp(self):
        self.scanner = SwitchScanningStateMachine(
            mode=ScanMode.STEP,
            step_interval_ms=1000,
            debounce_guard_ms=200
        )
        self.scanner.set_targets(["Btn1", "Btn2", "Btn3", "Btn4"])

    def test_step_mode_advance_and_select(self):
        """Switch 1 advances to next target; Switch 2 selects/activates."""
        # Switch 1: Advance to index 1 ("Btn2")
        state1 = self.scanner.handle_event("press", switch_id=1, current_time_ms=1000)
        self.assertEqual(state1["current_index"], 1)
        self.assertEqual(state1["active_target"], "Btn2")
        self.assertFalse(state1["activated"])

        # Switch 2: Select/Activate active target (after debounce window)
        state2 = self.scanner.handle_event("press", switch_id=2, current_time_ms=1300)
        self.assertTrue(state2["activated"])
        self.assertEqual(state2["active_target"], "Btn2")

    def test_spasm_debounce_guard(self):
        """Repeated switch triggers within 200ms debounce guard are ignored."""
        self.scanner.handle_event("press", switch_id=2, current_time_ms=1000)
        # Rapid spasm tap 50ms later (< 200ms)
        spasm_state = self.scanner.handle_event("press", switch_id=2, current_time_ms=1050)
        self.assertTrue(spasm_state.get("debounce_active", False))
        self.assertFalse(spasm_state["activated"])

    def test_row_column_hierarchical_scanning(self):
        """Row-column mode first selects row, then cycles columns in that row."""
        self.scanner.mode = ScanMode.ROW_COLUMN
        grid = [
            ["Row1-Col1", "Row1-Col2"],
            ["Row2-Col1", "Row2-Col2"]
        ]
        self.scanner.set_row_column_grid(grid)

        # In row scan state: select Row 0 via Switch 2
        state = self.scanner.handle_event("activate", switch_id=2, current_time_ms=1000)
        self.assertFalse(self.scanner.in_row_selection)
        self.assertEqual(state["current_row"], 0)

        # Next press in column scan state: activate "Row1-Col1" via Switch 2
        col_select = self.scanner.handle_event("activate", switch_id=2, current_time_ms=1300)
        self.assertTrue(col_select["activated"])
        self.assertEqual(col_select["active_target"], "Row1-Col1")


class TestMekoMotorProfile(unittest.TestCase):
    """Tests Meko persistent motor profile calibration and WCAG AAA compliance."""

    def test_wcag_aaa_target_size_enforcement(self):
        """Ensures interactive hit target size is never below 48px WCAG AAA standard."""
        profile = MekoMotorProfile(
            student_id="demo-motor-001",
            student_name="Aarav Patel",
            hit_target_min_px=30  # Below 48px
        )
        self.assertEqual(profile.hit_target_min_px, 48)

    def test_meko_memory_packet_structure(self):
        """Verifies structured vector memory format for Datapack 3bbeb08c-6e41-45a6-9d4f-332b4ad3a254."""
        profile = MekoMotorProfile(
            student_id="demo-motor-001",
            student_name="Aarav Patel",
            dwell_time_ms=1400,
            hit_target_min_px=56,
            tremor_smoothing_alpha=0.25
        )
        packet = profile.generate_meko_memory_packet()
        self.assertEqual(packet["datapack_id"], "3bbeb08c-6e41-45a6-9d4f-332b4ad3a254")
        self.assertEqual(packet["student_id"], "demo-motor-001")
        self.assertIn("Aarav Patel", packet["text"])
        self.assertIn("dwell_time_ms", packet["metadata"])


class TestMobilityAPI(unittest.TestCase):
    """Integration tests for all /api/mobility/... Flask REST endpoints."""

    def setUp(self):
        self.client = app.test_client()

    def test_mobility_health(self):
        resp = self.client.get("/api/mobility/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["features"]["head_tracking"])
        self.assertTrue(data["features"]["dwell_click"])

    def test_headtrack_process_and_calibrate(self):
        # Calibrate neutral
        cal_resp = self.client.post("/api/mobility/headtrack/calibrate", json={
            "neutral_x": 0.5,
            "neutral_y": 0.5,
            "sensitivity": 2.5
        })
        self.assertEqual(cal_resp.status_code, 200)

        # Process landmark
        proc_resp = self.client.post("/api/mobility/headtrack/process", json={
            "normalized_x": 0.55,
            "normalized_y": 0.48,
            "screen_width": 1920,
            "screen_height": 1080,
            "delta_time_s": 0.016
        })
        self.assertEqual(proc_resp.status_code, 200)
        data = proc_resp.get_json()
        self.assertTrue(data["success"])
        self.assertIn("screen_x", data["coordinates"])
        self.assertIn("screen_y", data["coordinates"])

    def test_dwell_evaluate_and_reset(self):
        # Initial dwell evaluate
        resp = self.client.post("/api/mobility/dwell/evaluate", json={
            "x": 600,
            "y": 400,
            "timestamp_ms": 1000,
            "custom_dwell_ms": 1200
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertTrue(data["success"])
        self.assertIn(data["dwell"]["status"], ("idle", "dwelling"))

        # Reset dwell
        reset_resp = self.client.post("/api/mobility/dwell/reset")
        self.assertEqual(reset_resp.status_code, 200)

    def test_switch_event_and_targets(self):
        # Configure targets
        t_resp = self.client.post("/api/mobility/switch/targets", json={
            "targets": ["A", "B", "C"],
            "mode": "step"
        })
        self.assertEqual(t_resp.status_code, 200)
        self.assertEqual(t_resp.get_json()["target_count"], 3)

        # Send switch event
        ev_resp = self.client.post("/api/mobility/switch/event", json={
            "event_type": "press",
            "switch_id": 1,
            "timestamp_ms": 1000
        })
        self.assertEqual(ev_resp.status_code, 200)
        data = ev_resp.get_json()
        self.assertTrue(data["success"])

    def test_profile_calibrate_and_get(self):
        # Calibrate profile
        cal_resp = self.client.post("/api/mobility/profile/calibrate", json={
            "student_id": "demo-motor-001",
            "student_name": "Aarav Patel",
            "dwell_time_ms": 1300,
            "hit_target_min_px": 52,
            "tremor_smoothing_alpha": 0.22
        })
        self.assertEqual(cal_resp.status_code, 200)
        cal_data = cal_resp.get_json()
        self.assertTrue(cal_data["success"])
        self.assertEqual(cal_data["profile"]["dwell_time_ms"], 1300)

        # Get profile
        get_resp = self.client.get("/api/mobility/profile/demo-motor-001")
        self.assertEqual(get_resp.status_code, 200)
        get_data = get_resp.get_json()
        self.assertEqual(get_data["profile"]["student_name"], "Aarav Patel")


if __name__ == "__main__":
    unittest.main()
