/**
 * AccessAI Teacher Live Speech Transcriber
 * Provides continuous speech-to-text for educator lectures.
 * Broadcasts real-time captions to student participants over MeetingChannel.
 * Completely independent of student-facing AI agents.
 */

export class TeacherTranscriber {
  constructor({ language = "en-IN", onCaption = () => {}, onStateChange = () => {} }) {
    // Detect browser locale or default to Indian English
    const detectedLang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-IN";
    this.language = language || detectedLang;
    this.onCaption = onCaption;
    this.onStateChange = onStateChange;

    this.recognition = null;
    this.isActive = false;
    this.isDestroyed = false;
    this.lastError = null;
    this.errorCount = 0;
    this._initRecognition();
  }

  _initRecognition() {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      console.warn("[TeacherTranscriber] Speech Recognition not supported in this browser.");
      this.onStateChange("unsupported", "Speech Recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = this.language;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        this.errorCount = 0;
        this.lastError = null;
        this.onStateChange("listening", null);
      };

      rec.onresult = (event) => {
        if (!event.results || event.results.length === 0) return;

        let interim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const heard = (finalTranscript || interim).trim();
        if (heard) {
          const isFinal = Boolean(finalTranscript.trim());
          this.onCaption(heard, isFinal);
        }
      };

      rec.onerror = (e) => {
        console.warn("[TeacherTranscriber] Recognition error event:", e.error);
        if (e.error === "no-speech") {
          // Normal pause during speaking - do not treat as fatal error
          return;
        }
        if (e.error === "aborted") return;

        this.lastError = e.error;
        this.errorCount++;

        let errorMsg = `Speech recognition error: ${e.error}`;
        if (e.error === "network") {
          errorMsg = "Network error: Browser cannot reach speech recognition service. Check internet connection or use manual caption bar.";
        } else if (e.error === "audio-capture") {
          errorMsg = "Microphone capture error. Ensure your microphone is plugged in, permitted, and not muted.";
        } else if (e.error === "not-allowed") {
          errorMsg = "Microphone permission denied. Please allow microphone access in your browser address bar.";
          this.isActive = false;
        }

        this.onStateChange("error", errorMsg);
      };

      rec.onend = () => {
        if (this.isDestroyed || !this.isActive) {
          this.onStateChange("idle", null);
          return;
        }

        // Back off slightly on repeated network errors to avoid flooding
        const delay = this.lastError === "network" ? 2000 : 150;

        setTimeout(() => {
          if (this.isActive && !this.isDestroyed && this.recognition) {
            try {
              this.recognition.start();
            } catch (err) {
              if (err.name !== "InvalidStateError") {
                console.warn("[TeacherTranscriber] Auto-restart error:", err);
              }
            }
          }
        }, delay);
      };

      this.recognition = rec;
    } catch (err) {
      console.error("[TeacherTranscriber] Failed to create SpeechRecognition instance:", err);
      this.onStateChange("error", "Failed to initialize speech recognition: " + err.message);
    }
  }

  setLanguage(newLang) {
    if (!newLang || this.language === newLang) return;
    console.log(`[TeacherTranscriber] Switching language from ${this.language} to ${newLang}`);
    this.language = newLang;
    const wasActive = this.isActive;
    this.stop();
    this._initRecognition();
    if (wasActive) {
      this.start();
    }
  }

  start() {
    if (!this.recognition) return false;
    this.isActive = true;
    try {
      this.recognition.start();
      return true;
    } catch (err) {
      if (err.name !== "InvalidStateError") {
        console.warn("[TeacherTranscriber] Start error:", err);
      }
      return false;
    }
  }

  stop() {
    this.isActive = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.onStateChange("idle", null);
  }

  restart() {
    this.stop();
    this.errorCount = 0;
    this.lastError = null;
    this._initRecognition();
    return this.start();
  }

  destroy() {
    this.isDestroyed = true;
    this.stop();
    if (this.recognition) {
      this.recognition.onstart = null;
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition = null;
    }
  }
}

export default TeacherTranscriber;
