"""
Unit and Integration Tests for AccessAI Voice Agent Backend
Validates Barge-in Interruption, Acoustic Echo Filter, Intent Routing, and Indic Transliteration.
"""

import unittest
from voice_engine.agent import VoiceAgentEngine, AgentState
from voice_engine.echo_filter import EchoFilter
from voice_engine.indic_transliterate import (
    is_indic,
    normalize_indic_name,
    normalize_indic_digits,
    normalize_indic_email,
    parse_indic_age,
    parse_indic_gender,
    parse_indic_yes_no,
    transliterate_indic_to_english,
)
from app import app


class TestVoiceAgentEngine(unittest.TestCase):
    def setUp(self):
        self.engine = VoiceAgentEngine()

    def test_barge_in_stop_english(self):
        result = self.engine.process_input("stop talking please")
        self.assertEqual(result["action"], "BARGE_IN_STOP")
        self.assertTrue(result["cancel_speech"])
        self.assertEqual(result["state"], "LISTENING")

    def test_barge_in_stop_hindi(self):
        result = self.engine.process_input("रुकिए बंद करो")
        self.assertEqual(result["action"], "BARGE_IN_STOP")
        self.assertTrue(result["cancel_speech"])

    def test_barge_in_stop_kannada(self):
        result = self.engine.process_input("ನಿಲ್ಲಿಸು ಸಾಕು")
        self.assertEqual(result["action"], "BARGE_IN_STOP")
        self.assertTrue(result["cancel_speech"])

    def test_wait_and_resume_cycle(self):
        # 1. Trigger wait
        res_wait = self.engine.process_input("wait a second")
        self.assertEqual(res_wait["action"], "PAUSE")
        self.assertEqual(res_wait["state"], "PAUSED")

        # 2. Ignored random chatter while paused
        res_chat = self.engine.process_input("how are you doing")
        self.assertEqual(res_chat["action"], "IGNORE")
        self.assertEqual(res_chat["state"], "PAUSED")

        # 3. Resume
        res_resume = self.engine.process_input("continue listening")
        self.assertEqual(res_resume["action"], "RESUME")
        self.assertEqual(res_resume["state"], "LISTENING")

    def test_echo_filter_suppression(self):
        echo_filter = EchoFilter()
        spoken = "Welcome to AccessAI learning portal. How can I assist you?"

        # Direct duplicate echo
        self.assertTrue(echo_filter.is_self_echo("welcome to accessai learning portal", spoken))

        # Distinct human phrase should NOT be classified as echo
        self.assertFalse(echo_filter.is_self_echo("take me to blind mode", spoken))

    def test_indic_transliteration_names(self):
        self.assertEqual(normalize_indic_name("ಅಮನ್"), "Aman")
        self.assertEqual(normalize_indic_name("अमन"), "Aman")
        self.assertEqual(normalize_indic_name("ವೃಷಾ"), "Vrusha")
        self.assertEqual(normalize_indic_name("गोयल"), "Goyal")
        self.assertEqual(normalize_indic_name("गौरी"), "Gauri")

    def test_indic_digits_and_numbers(self):
        self.assertEqual(normalize_indic_digits("೯೮೭೬೫೪೩೨೧೦"), "9876543210")
        self.assertEqual(normalize_indic_digits("९८७६५४३२१०"), "9876543210")
        self.assertEqual(normalize_indic_digits("फोन नंबर नौ आठ सात"), "987")

    def test_indic_email_normalization(self):
        spoken = "aman halkude at the rate gmail dot com"
        email = normalize_indic_email(spoken)
        self.assertEqual(email, "amanhalkude@gmail.com")

    def test_mode_navigation_intent(self):
        result = self.engine.process_input("please open blind mode")
        self.assertEqual(result["action"], "EXECUTE_INTENT")
        self.assertEqual(result["intent"], "NAVIGATE_MODE")
        self.assertEqual(result["target_mode"], "blind")


class TestVoiceAgentAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_check(self):
        res = self.client.get("/api/voice/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")

    def test_api_process_barge_in(self):
        payload = {"transcript": "stop speaking", "is_speaking": True}
        res = self.client.post("/api/voice/process", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["action"], "BARGE_IN_STOP")
        self.assertTrue(data["cancel_speech"])

    def test_api_transliterate(self):
        payload = {"text": "ಅಮನ್", "type": "name"}
        res = self.client.post("/api/voice/transliterate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["normalized"], "Aman")


if __name__ == "__main__":
    unittest.main()
