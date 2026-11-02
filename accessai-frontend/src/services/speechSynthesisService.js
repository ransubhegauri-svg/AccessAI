/**
 * AccessAI Speech Synthesis Service for Two-Way Accessible Meetings
 * Converts finalized sign-language text into speech for hearing/abled participants.
 */

export class SpeechSynthesisService {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.isMuted = false;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.currentVoice = null;
    this.speakingListeners = new Set();

    this._initVoices();
  }

  _initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        // Prefer natural English voices or Google US English
        this.currentVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))) || voices[0];
      }
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  speak(text, onEndCallback = null) {
    if (!this.synth || !text || !text.trim() || this.isMuted) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      // Cancel previous incomplete speech before starting new sentence
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }

      utterance.onstart = () => {
        this._notifySpeaking(true);
      };

      utterance.onend = () => {
        this._notifySpeaking(false);
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis utterance error:", e);
        this._notifySpeaking(false);
        if (onEndCallback) onEndCallback();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis exception:", err);
      this._notifySpeaking(false);
      if (onEndCallback) onEndCallback();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this._notifySpeaking(false);
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  setRate(rate) {
    this.rate = Math.max(0.6, Math.min(1.8, rate));
  }

  setPitch(pitch) {
    this.pitch = Math.max(0.7, Math.min(1.4, pitch));
  }

  onSpeakingChange(listener) {
    this.speakingListeners.add(listener);
    return () => this.speakingListeners.delete(listener);
  }

  _notifySpeaking(isSpeaking) {
    this.speakingListeners.forEach(fn => fn(isSpeaking));
  }
}

export const speechService = new SpeechSynthesisService();
export default speechService;

