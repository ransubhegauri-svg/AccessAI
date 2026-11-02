"""
Unit Test Suite for AccessAI Deaf/Mute Sign Language Engine & Meeting Bridge
===========================================================================
Tests geometric calculations, gesture classifications, hold stabilization,
meeting access contracts, and REST API endpoints.
"""

import unittest
from sign_engine.gesture_recognizer import (
    HandGeometry,
    GestureDetector,
    SignLanguageEngine,
    LandmarkPoint
)
from sign_engine.sign_dictionary import (
    MEETING_SIGN_VOCABULARY,
    get_sign_details,
    list_all_signs
)
from sign_engine.meeting_bridge import (
    MeetingAccessController,
    validate_meeting_message,
    QUICK_RESPONSES
)
from app import app


def create_mock_landmarks_extended() -> list:
    """Creates a synthetic set of 21 landmarks with all fingers extended (Open Palm)."""
    lms = []
    # 0 is wrist
    lms.append(LandmarkPoint(0.5, 0.8, 0.0))
    # Thumb 1-4
    lms.append(LandmarkPoint(0.4, 0.75, 0.0))
    lms.append(LandmarkPoint(0.35, 0.7, 0.0))
    lms.append(LandmarkPoint(0.3, 0.65, 0.0))
    lms.append(LandmarkPoint(0.25, 0.6, 0.0))  # Tip 4
    # Index 5-8
    lms.append(LandmarkPoint(0.45, 0.6, 0.0))  # MCP 5
    lms.append(LandmarkPoint(0.45, 0.5, 0.0))  # PIP 6
    lms.append(LandmarkPoint(0.45, 0.4, 0.0))  # DIP 7
    lms.append(LandmarkPoint(0.45, 0.3, 0.0))  # Tip 8 (Extended upward)
    # Middle 9-12
    lms.append(LandmarkPoint(0.5, 0.58, 0.0))  # MCP 9
    lms.append(LandmarkPoint(0.5, 0.48, 0.0))
    lms.append(LandmarkPoint(0.5, 0.38, 0.0))
    lms.append(LandmarkPoint(0.5, 0.28, 0.0))  # Tip 12
    # Ring 13-16
    lms.append(LandmarkPoint(0.55, 0.6, 0.0))
    lms.append(LandmarkPoint(0.55, 0.5, 0.0))
    lms.append(LandmarkPoint(0.55, 0.4, 0.0))
    lms.append(LandmarkPoint(0.55, 0.3, 0.0))
    # Pinky 17-20
    lms.append(LandmarkPoint(0.6, 0.65, 0.0))
    lms.append(LandmarkPoint(0.6, 0.55, 0.0))
    lms.append(LandmarkPoint(0.6, 0.45, 0.0))
    lms.append(LandmarkPoint(0.6, 0.35, 0.0))
    return lms


class TestSignEngine(unittest.TestCase):

    def setUp(self):
        self.detector = GestureDetector()
        self.engine = SignLanguageEngine()
        self.client = app.test_client()

    def test_hand_geometry_distance(self):
        p1 = LandmarkPoint(0.0, 0.0, 0.0)
        p2 = LandmarkPoint(3.0, 4.0, 0.0)
        dist = HandGeometry.distance(p1, p2)
        self.assertAlmostEqual(dist, 5.0)

    def test_palm_scale(self):
        lms = create_mock_landmarks_extended()
        scale = HandGeometry.palm_scale(lms)
        self.assertGreater(scale, 0.1)

    def test_open_palm_classification(self):
        lms = create_mock_landmarks_extended()
        result = self.detector.classify(lms, "Right")
        self.assertEqual(result["gesture"], "Open_Palm")
        self.assertEqual(result["avatar_action"], "HELLO")
        self.assertGreaterEqual(result["confidence"], 0.9)

    def test_hold_timing_state_machine(self):
        lms = create_mock_landmarks_extended()
        # Frame 1: initial contact
        r1 = self.engine.evaluate_frame(lms, "Right")
        self.assertEqual(r1["gesture"], "Open_Palm")
        self.assertFalse(r1["is_stable"])

    def test_vocabulary_dictionary(self):
        signs = list_all_signs()
        self.assertGreaterEqual(len(signs), 8)
        details = get_sign_details("Thumb_Up")
        self.assertIsNotNone(details)
        self.assertEqual(details["avatar_action"], "YES")
        self.assertEqual(details["hold_duration_ms"], 650)

    def test_meeting_zero_mandatory_permissions_contract(self):
        session = MeetingAccessController.create_student_join_session(
            "accessai-room-402", "student-deaf-001", "deaf_mute"
        )
        self.assertTrue(session["success"])
        contract = session["zero_mandatory_permissions_contract"]
        self.assertFalse(contract["microphone_required"])
        self.assertFalse(contract["microphone_requested"])
        self.assertFalse(contract["camera_required"])
        self.assertEqual(contract["camera_default_state"], "OFF")
        self.assertTrue(contract["text_fallback_active"])

    def test_role_based_permissions(self):
        session = MeetingAccessController.create_student_join_session()
        auth = session["student_authorization"]
        self.assertEqual(auth["role"], "student")
        self.assertFalse(auth["is_host"])
        self.assertFalse(auth["can_kick"])
        self.assertFalse(auth["can_end_meeting"])

    def test_quick_responses_present(self):
        self.assertEqual(len(QUICK_RESPONSES), 8)
        texts = [q["text"] for q in QUICK_RESPONSES]
        self.assertIn("Yes", texts)
        self.assertIn("No", texts)
        self.assertIn("I need help", texts)

    def test_meeting_message_schema(self):
        valid_msg = {
            "meetingId": "accessai-room-402",
            "senderId": "student-deaf-001",
            "senderName": "Vrusha Goyal",
            "senderMode": "deaf_mute",
            "messageType": "sign_to_text",
            "text": "Hello everyone,"
        }
        is_valid, msg = validate_meeting_message(valid_msg)
        self.assertTrue(is_valid)

        invalid_msg = {
            "meetingId": "accessai-room-402",
            # missing senderName and senderMode
            "text": "Hello"
        }
        is_valid, msg = validate_meeting_message(invalid_msg)
        self.assertFalse(is_valid)

    # ── Flask API Endpoints ──────────────────────────────────────────

    def test_api_sign_health(self):
        res = self.client.get("/api/sign/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["hold_window_ms"], 650)
        self.assertIn("Check T: Decision 2 (Zero Mandatory Permissions)", data["contracts"])

    def test_api_sign_gestures(self):
        res = self.client.get("/api/sign/gestures")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreaterEqual(data["total"], 8)

    def test_api_sign_evaluate(self):
        lms = create_mock_landmarks_extended()
        raw_dicts = [{"x": p.x, "y": p.y, "z": p.z} for p in lms]
        res = self.client.post("/api/sign/evaluate", json={
            "landmarks": raw_dicts,
            "handedness": "Right"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["evaluation"]["gesture"], "Open_Palm")

    def test_api_sign_meeting_join(self):
        res = self.client.post("/api/sign/meeting/join", json={
            "meeting_id": "accessai-room-402",
            "student_id": "demo-deaf-001"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertFalse(data["zero_mandatory_permissions_contract"]["microphone_required"])

    def test_api_sign_quick_responses(self):
        res = self.client.get("/api/sign/quick-responses")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["count"], 8)


if __name__ == "__main__":
    unittest.main()

