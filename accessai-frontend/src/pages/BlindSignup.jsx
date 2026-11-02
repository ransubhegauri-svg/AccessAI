import { useState, useEffect, useRef, useCallback } from "react";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";
import { useVoiceAssistant } from "../hooks/useVoice";
import API from "../services/api";
import VoiceEmailInput from "../components/VoiceEmailInput";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";
import {
  normalizeIndicName,
  normalizeIndicDigits,
  normalizeIndicEmail,
  parseIndicAge,
  parseIndicGender,
  parseIndicYesNo,
  normalizeIndicPassword
} from "../utils/indicTransliterate";

const BLIND_STEP_NONE = "NONE";
const BLIND_STEP_SIGNUP_FIRST_NAME = "SIGNUP_FIRST_NAME";
const BLIND_STEP_SIGNUP_LAST_NAME = "SIGNUP_LAST_NAME";
const BLIND_STEP_SIGNUP_EMAIL = "SIGNUP_EMAIL";
const BLIND_STEP_SIGNUP_PHONE = "SIGNUP_PHONE";
const BLIND_STEP_SIGNUP_AGE = "SIGNUP_AGE";
const BLIND_STEP_SIGNUP_GENDER = "SIGNUP_GENDER";
const BLIND_STEP_SIGNUP_PASSWORD = "SIGNUP_PASSWORD";
const BLIND_STEP_SIGNUP_CONFIRM = "SIGNUP_CONFIRM";
const BLIND_STEP_SIGNUP_SUMMARY = "SIGNUP_SUMMARY";
const BLIND_STEP_SIGNUP_SPELLING_FIRST = "SIGNUP_SPELLING_FIRST";
const BLIND_STEP_SIGNUP_SPELLING_LAST = "BLIND_SPELLING_LAST";
const BLIND_STEP_SIGNUP_CONFIRM_FIRST_NAME = "SIGNUP_CONFIRM_FIRST_NAME";
const BLIND_STEP_SIGNUP_CONFIRM_LAST_NAME = "SIGNUP_CONFIRM_LAST_NAME";

export default function BlindSignup() {
  const navigate = useNavigate();
  const { signUp, loginDemoUser, DEMO_MODE } = useAuth();
  const { t, language } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessibilityPref, setAccessibilityPref] = useState("blind");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    registerContext,
    speak,
    stop,
    resumeListening: globalResumeListening,
    speechBubble,
    setSpeechBubble,
    transcript,
    setTranscript,
    voiceActive,
    setVoiceActive,
    setSpellingMode
  } = useVoiceAssistant();

  const [blindStep, setBlindStep] = useState(BLIND_STEP_NONE);
  const [showVoiceEmail, setShowVoiceEmail] = useState(false);

  // Conversational helper states
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingValue, setPendingValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [spelledChars, setSpelledChars] = useState([]);

  const isProgrammaticFocusRef = useRef(false);
  const greetingStartedRef = useRef(false);
  const firstNameFailuresRef = useRef(0);
  const lastNameFailuresRef = useRef(0);

  const voiceDataRef = useRef({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
    accessibilityPref: "blind"
  });

  const latestRef = useRef({});
  latestRef.current = {
    blindStep,
    transcript,
    voiceActive,
    isConfirming,
    pendingValue,
    isEditing,
    firstName,
    lastName,
    spelledChars,
    email,
    phone,
    age,
    gender,
    password,
    confirmPassword,
    accessibilityPref,
    showVoiceEmail
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); // Low volume
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15); // Play for 150ms
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  };

  const speakText = useCallback((text, onEndCallback) => {
    setSpeechBubble(text);
    speak(text, onEndCallback);
  }, [speak, setSpeechBubble]);

  const resumeVoiceListening = useCallback(() => {
    globalResumeListening();
  }, [globalResumeListening]);

  const focusFieldForStep = useCallback((step) => {
    isProgrammaticFocusRef.current = true;
    try {
      let el = null;
      switch (step) {
        case BLIND_STEP_SIGNUP_FIRST_NAME:
        case BLIND_STEP_SIGNUP_SPELLING_FIRST:
          el = document.getElementById("blind-first-name");
          break;
        case BLIND_STEP_SIGNUP_LAST_NAME:
        case BLIND_STEP_SIGNUP_SPELLING_LAST:
          el = document.getElementById("blind-last-name");
          break;
        case BLIND_STEP_SIGNUP_EMAIL:
          el = document.getElementById("blind-email");
          break;
        case BLIND_STEP_SIGNUP_PHONE:
          el = document.getElementById("blind-phone");
          break;
        case BLIND_STEP_SIGNUP_AGE:
          el = document.getElementById("blind-age");
          break;
        case BLIND_STEP_SIGNUP_GENDER:
          el = document.getElementById("blind-gender");
          break;
        case BLIND_STEP_SIGNUP_PASSWORD:
          el = document.getElementById("blind-password");
          break;
        case BLIND_STEP_SIGNUP_CONFIRM:
          el = document.getElementById("blind-confirm-password");
          break;
        case BLIND_STEP_SIGNUP_SUMMARY:
          el = document.getElementById("blind-submit-btn");
          break;
        default:
          break;
      }
      if (el) {
        el.focus();
      } else {
        isProgrammaticFocusRef.current = false;
      }
    } catch (err) {
      console.warn("Failed to focus field for step:", step, err);
      isProgrammaticFocusRef.current = false;
    }
  }, []);

  const triggerVoicePrompt = useCallback((promptText, nextStep) => {
    setSpeechBubble(promptText);
    setBlindStep(nextStep);
    speakText(promptText, () => {
      playBeep();
      setTimeout(() => {
        resumeVoiceListening();
      }, 100);
    });
  }, [speakText, resumeVoiceListening]);

  const promptForStep = useCallback((stepName) => {
    console.log("[BlindSignup] Prompting for step:", stepName);
    focusFieldForStep(stepName);

    switch (stepName) {
      case BLIND_STEP_SIGNUP_FIRST_NAME:
        triggerVoicePrompt(
          t("prompt_step_first_name"),
          BLIND_STEP_SIGNUP_FIRST_NAME
        );
        break;
      case BLIND_STEP_SIGNUP_CONFIRM_FIRST_NAME:
        triggerVoicePrompt(
          t("prompt_confirm_first_name", { name: voiceDataRef.current.firstName }),
          BLIND_STEP_SIGNUP_CONFIRM_FIRST_NAME
        );
        break;
      case BLIND_STEP_SIGNUP_LAST_NAME:
        triggerVoicePrompt(
          t("prompt_step_last_name"),
          BLIND_STEP_SIGNUP_LAST_NAME
        );
        break;
      case BLIND_STEP_SIGNUP_CONFIRM_LAST_NAME:
        triggerVoicePrompt(
          t("prompt_confirm_last_name", { name: voiceDataRef.current.lastName }),
          BLIND_STEP_SIGNUP_CONFIRM_LAST_NAME
        );
        break;
      case BLIND_STEP_SIGNUP_EMAIL:
        setBlindStep(BLIND_STEP_SIGNUP_EMAIL);
        setShowVoiceEmail(true);
        break;
      case BLIND_STEP_SIGNUP_PHONE:
        triggerVoicePrompt(
          t("prompt_step_phone"),
          BLIND_STEP_SIGNUP_PHONE
        );
        break;
      case BLIND_STEP_SIGNUP_AGE:
        triggerVoicePrompt(
          t("prompt_step_age"),
          BLIND_STEP_SIGNUP_AGE
        );
        break;
      case BLIND_STEP_SIGNUP_GENDER:
        triggerVoicePrompt(
          t("prompt_step_gender"),
          BLIND_STEP_SIGNUP_GENDER
        );
        break;
      case BLIND_STEP_SIGNUP_PASSWORD:
        triggerVoicePrompt(
          t("prompt_step_password"),
          BLIND_STEP_SIGNUP_PASSWORD
        );
        break;
      case BLIND_STEP_SIGNUP_CONFIRM:
        triggerVoicePrompt(
          t("prompt_confirm_password"),
          BLIND_STEP_SIGNUP_CONFIRM
        );
        break;
      case BLIND_STEP_SIGNUP_SUMMARY:
        triggerVoicePrompt(
          t("prompt_summary_create"),
          BLIND_STEP_SIGNUP_SUMMARY
        );
        break;
      case BLIND_STEP_SIGNUP_SPELLING_FIRST:
        triggerVoicePrompt(
          "Please say your first name one letter at a time.",
          BLIND_STEP_SIGNUP_SPELLING_FIRST
        );
        break;
      case BLIND_STEP_SIGNUP_SPELLING_LAST:
        triggerVoicePrompt(
          "Please say your last name one letter at a time.",
          BLIND_STEP_SIGNUP_SPELLING_LAST
        );
        break;
      default:
        break;
    }
  }, [triggerVoicePrompt, focusFieldForStep, t]);

  const handleInputFocus = useCallback((stepName) => {
    if (isProgrammaticFocusRef.current) {
      isProgrammaticFocusRef.current = false;
      return;
    }
    if (voiceActive || showVoiceEmail) {
      console.log("[Focus Sync] User manually focused field for step:", stepName);
      if (stepName === BLIND_STEP_SIGNUP_EMAIL) {
        if (!showVoiceEmail) {
          setVoiceActive(false);
          setShowVoiceEmail(true);
          setBlindStep(BLIND_STEP_SIGNUP_EMAIL);
        }
      } else {
        if (showVoiceEmail) {
          setShowVoiceEmail(false);
          setVoiceActive(true);
        }
        promptForStep(stepName);
      }
    }
  }, [voiceActive, showVoiceEmail, promptForStep]);

  const startGreeting = useCallback((force = false) => {
    if (greetingStartedRef.current && !force) return;
    greetingStartedRef.current = true;

    triggerVoicePrompt(
      t("prompt_welcome_signup"),
      BLIND_STEP_SIGNUP_FIRST_NAME
    );
  }, [triggerVoicePrompt, t]);

  const handleEmailSuccess = useCallback((capturedEmail) => {
    setEmail(capturedEmail);
    voiceDataRef.current.email = capturedEmail;
    setShowVoiceEmail(false);
    setTimeout(() => {
      if (latestRef.current.isEditing) {
        setIsEditing(false);
        promptForStep(BLIND_STEP_SIGNUP_SUMMARY);
      } else {
        promptForStep(BLIND_STEP_SIGNUP_PHONE);
      }
    }, 400);
  }, [promptForStep]);

  const handleEmailRetry = useCallback(() => {
    setEmail("");
    voiceDataRef.current.email = "";
  }, []);

  const handleActivateVoice = useCallback(() => {
    if (!email) {
      setShowVoiceEmail(true);
    } else {
      promptForStep(BLIND_STEP_SIGNUP_PHONE);
    }
  }, [email, promptForStep]);

  const executeVoiceSignup = useCallback(async () => {
    setLoading(true);
    setError("");
    const data = voiceDataRef.current;
    console.log("Attempting voice registration for email:", data.email);
    if (DEMO_MODE) {
      loginDemoUser("blind", data.email);
      speakText(t("prompt_registration_success"), () => {
        navigate(`/${data.accessibilityPref || "blind"}`);
      });
      setLoading(false);
      return;
    }
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error(t("err_passwords_match", "Passwords do not match."));
      }
      await signUp({
        name: `${data.firstName} ${data.lastName}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        age: parseInt(data.age) || null,
        gender: data.gender,
        disabilityType: data.accessibilityPref || "blind"
      });
      speakText(t("prompt_registration_success"), () => {
        navigate(`/${data.accessibilityPref}`);
      });
    } catch (err) {
      setError(err.message || "Voice registration failed.");
      speakText(t("prompt_registration_failed"), () => {
        setTimeout(() => {
          promptForStep(BLIND_STEP_SIGNUP_FIRST_NAME);
        }, 300);
      });
    } finally {
      setLoading(false);
    }
  }, [speakText, navigate, promptForStep, DEMO_MODE, loginDemoUser, t]);

  const processVoiceInput = useCallback((spokenText, confidence) => {
    const text = spokenText.toLowerCase().trim();
    const activeStep = latestRef.current.blindStep;
    console.log(`[BlindSignup] Step: ${activeStep} | Raw: "${spokenText}" | Confidence: ${confidence}`);

    const isYesNo = text === "yes" || text === "no" || text === "yeah" || text === "correct" || text === "sure";
    const isGlobalCmd = ["next", "continue", "back", "go back", "repeat", "skip", "help", "cancel", "start over", "restart"].includes(text);
    
    if (activeStep === BLIND_STEP_NONE) {
      if (text.includes("register") || text.includes("signup") || text.includes("create account") || text.includes("start")) {
        startGreeting();
      } else if (text.includes("login") || text.includes("sign in")) {
        speakText("Opening login page.", () => navigate("/blind/login"));
      } else if (text.includes("go back") || text.includes("home")) {
        speakText("Returning to home page.", () => navigate("/"));
      }
      return;
    }

    // ── Global Command Handlers ─────────────────────────
    if (text === "start over" || text === "restart") {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAge("");
      setGender("");
      setPassword("");
      setConfirmPassword("");
      setSpelledChars([]);
      voiceDataRef.current = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        password: "",
        confirmPassword: "",
        accessibilityPref: "blind"
      };
      setIsConfirming(false);
      setIsEditing(false);
      setPendingValue("");
      firstNameFailuresRef.current = 0;
      lastNameFailuresRef.current = 0;
      speakText("Let's start over.", () => {
        promptForStep(BLIND_STEP_SIGNUP_FIRST_NAME);
      });
      return;
    }

    if (text === "repeat") {
      promptForStep(activeStep);
      return;
    }

    if (text === "back" || text === "go back") {
      if (latestRef.current.isEditing) {
        setIsEditing(false);
        setIsConfirming(false);
        promptForStep(BLIND_STEP_SIGNUP_SUMMARY);
      } else {
        const stepOrder = [
          BLIND_STEP_SIGNUP_FIRST_NAME,
          BLIND_STEP_SIGNUP_LAST_NAME,
          BLIND_STEP_SIGNUP_EMAIL,
          BLIND_STEP_SIGNUP_PHONE,
          BLIND_STEP_SIGNUP_AGE,
          BLIND_STEP_SIGNUP_GENDER,
          BLIND_STEP_SIGNUP_PASSWORD,
          BLIND_STEP_SIGNUP_CONFIRM,
          BLIND_STEP_SIGNUP_SUMMARY
        ];
        const idx = stepOrder.indexOf(activeStep);
        if (idx > 0) {
          setIsConfirming(false);
          promptForStep(stepOrder[idx - 1]);
        } else {
          speakText("This is the first step.", resumeVoiceListening);
        }
      }
      return;
    }

    if (text === "skip") {
      if (
        activeStep === BLIND_STEP_SIGNUP_PHONE ||
        activeStep === BLIND_STEP_SIGNUP_AGE ||
        activeStep === BLIND_STEP_SIGNUP_GENDER
      ) {
        let fieldName = "";
        if (activeStep === BLIND_STEP_SIGNUP_PHONE) {
          setPhone("");
          voiceDataRef.current.phone = "";
          fieldName = "Mobile number";
        } else if (activeStep === BLIND_STEP_SIGNUP_AGE) {
          setAge("");
          voiceDataRef.current.age = "";
          fieldName = "Age";
        } else if (activeStep === BLIND_STEP_SIGNUP_GENDER) {
          setGender("");
          voiceDataRef.current.gender = "";
          fieldName = "Gender";
        }

        speakText(`${fieldName} skipped.`, () => {
          if (latestRef.current.isEditing) {
            setIsEditing(false);
            promptForStep(BLIND_STEP_SIGNUP_SUMMARY);
          } else {
            const stepOrder = [
              BLIND_STEP_SIGNUP_FIRST_NAME,
              BLIND_STEP_SIGNUP_LAST_NAME,
              BLIND_STEP_SIGNUP_EMAIL,
              BLIND_STEP_SIGNUP_PHONE,
              BLIND_STEP_SIGNUP_AGE,
              BLIND_STEP_SIGNUP_GENDER,
              BLIND_STEP_SIGNUP_PASSWORD,
              BLIND_STEP_SIGNUP_CONFIRM,
              BLIND_STEP_SIGNUP_SUMMARY
            ];
            const idx = stepOrder.indexOf(activeStep);
            promptForStep(stepOrder[idx + 1]);
          }
        });
      } else {
        speakText("This field is required and cannot be skipped.", resumeVoiceListening);
      }
      return;
    }

    if (text === "help") {
      speakText(
        "You can say: Next, Back, Repeat, Skip, Cancel, Help, or Start Over. Or speak your answer clearly.",
        resumeVoiceListening
      );
      return;
    }

    if (text === "cancel") {
      handleEmergencyStop();
      speakText(t("prompt_voice_cancelled"));
      return;
    }

    // ── Word Mode Input Processing for First/Last Name ──
    if (activeStep === BLIND_STEP_SIGNUP_FIRST_NAME || activeStep === BLIND_STEP_SIGNUP_LAST_NAME) {
      if (text === "clear name" || text === "clear") {
        if (activeStep === BLIND_STEP_SIGNUP_FIRST_NAME) {
          setFirstName("");
          voiceDataRef.current.firstName = "";
        } else {
          setLastName("");
          voiceDataRef.current.lastName = "";
        }
        speakText(t("prompt_name_cleared"), resumeVoiceListening);
        return;
      }

      if (text === "repeat name" || text === "repeat") {
        const nameVal = activeStep === BLIND_STEP_SIGNUP_FIRST_NAME ? latestRef.current.firstName : latestRef.current.lastName;
        speakText(`Current name is ${nameVal || "empty"}.`, resumeVoiceListening);
        return;
      }

      if (!spokenText || spokenText.trim().length === 0) {
        speakText(t("prompt_didnt_hear"), resumeVoiceListening);
        return;
      }

      const name = normalizeIndicName(spokenText);
      setPendingValue(name);
      if (activeStep === BLIND_STEP_SIGNUP_FIRST_NAME) {
        setFirstName(name);
        voiceDataRef.current.firstName = name;
        promptForStep(BLIND_STEP_SIGNUP_CONFIRM_FIRST_NAME);
      } else {
        setLastName(name);
        voiceDataRef.current.lastName = name;
        promptForStep(BLIND_STEP_SIGNUP_CONFIRM_LAST_NAME);
      }
      return;
    }

    // ── Name Confirmation Processing ─────────────────────
    if (activeStep === BLIND_STEP_SIGNUP_CONFIRM_FIRST_NAME || activeStep === BLIND_STEP_SIGNUP_CONFIRM_LAST_NAME) {
      const yesNo = parseIndicYesNo(spokenText);
      const isYes = yesNo === "YES" || text.startsWith("yes") || text.includes("correct") || text.includes("sure") || text.includes("yeah") || text === "continue" || text === "next";
      const isNo = yesNo === "NO" || text.startsWith("no") || text.includes("incorrect") || text.includes("wrong") || text.includes("again");
      const isRepeat = text === "repeat" || text.includes("repeat name") || text.includes("say again");

      if (isYes) {
        speakText(t("prompt_saved"), () => {
          if (latestRef.current.isEditing) {
            setIsEditing(false);
            promptForStep(BLIND_STEP_SIGNUP_SUMMARY);
          } else {
            if (activeStep === BLIND_STEP_SIGNUP_CONFIRM_FIRST_NAME) {
              promptForStep(BLIND_STEP_SIGNUP_LAST_NAME);
            } else {
              promptForStep(BLIND_STEP_SIGNUP_EMAIL);
            }
          }
        });
      } else if (isNo) {
        if (activeStep === BLIND_STEP_SIGNUP_CONFIRM_FIRST_NAME) {
          setFirstName("");
          voiceDataRef.current.firstName = "";
          speakText(t("prompt_try_again_first_name"), () => {
            promptForStep(BLIND_STEP_SIGNUP_FIRST_NAME);
          });
        } else {
          setLastName("");
          voiceDataRef.current.lastName = "";
          speakText(t("prompt_try_again_last_name"), () => {
            promptForStep(BLIND_STEP_SIGNUP_LAST_NAME);
          });
        }
      } else if (isRepeat) {
        const nameVal = activeStep === BLIND_STEP_SIGNUP_CONFIRM_FIRST_NAME ? latestRef.current.firstName : latestRef.current.lastName;
        speakText(t("prompt_confirm_heard", { value: nameVal }), resumeVoiceListening);
      } else {
        speakText(t("prompt_confirm_say_yes_no"), resumeVoiceListening);
      }
      return;
    }

    // ── Confirmation Sub-flow ───────────────────────────
    const generalYesNo = parseIndicYesNo(spokenText);
    if (latestRef.current.isConfirming || generalYesNo !== null || text === "yes" || text === "no" || text === "yeah" || text === "correct" || text === "sure") {
      const isYes = generalYesNo === "YES" || text.startsWith("yes") || text.includes("correct") || text.includes("sure") || text.includes("yeah") || text === "continue" || text === "next";
      const isNo = generalYesNo === "NO" || text.startsWith("no") || text.includes("incorrect") || text.includes("wrong") || text.includes("again");

      if (isYes) {
        setIsConfirming(false);
        speakText(t("prompt_saved"), () => {
          if (latestRef.current.isEditing) {
            setIsEditing(false);
            promptForStep(BLIND_STEP_SIGNUP_SUMMARY);
          } else {
            if (activeStep === BLIND_STEP_SIGNUP_FIRST_NAME) {
              setSpelledChars([]);
              promptForStep(BLIND_STEP_SIGNUP_LAST_NAME);
            } else if (activeStep === BLIND_STEP_SIGNUP_LAST_NAME) {
              setSpelledChars([]);
              promptForStep(BLIND_STEP_SIGNUP_EMAIL);
            } else {
              const stepOrder = [
                BLIND_STEP_SIGNUP_FIRST_NAME,
                BLIND_STEP_SIGNUP_LAST_NAME,
                BLIND_STEP_SIGNUP_EMAIL,
                BLIND_STEP_SIGNUP_PHONE,
                BLIND_STEP_SIGNUP_AGE,
                BLIND_STEP_SIGNUP_GENDER,
                BLIND_STEP_SIGNUP_PASSWORD,
                BLIND_STEP_SIGNUP_CONFIRM,
                BLIND_STEP_SIGNUP_SUMMARY
              ];
              const idx = stepOrder.indexOf(activeStep);
              promptForStep(stepOrder[idx + 1]);
            }
          }
        });
      } else if (isNo) {
        setIsConfirming(false);
        setPendingValue("");
        
        if (activeStep === BLIND_STEP_SIGNUP_FIRST_NAME) {
          setFirstName("");
          voiceDataRef.current.firstName = "";
          setSpelledChars([]);
          speakText(t("prompt_try_again_first_name"), () => {
            promptForStep(BLIND_STEP_SIGNUP_FIRST_NAME);
          });
        } else if (activeStep === BLIND_STEP_SIGNUP_LAST_NAME) {
          setLastName("");
          voiceDataRef.current.lastName = "";
          setSpelledChars([]);
          speakText(t("prompt_try_again_last_name"), () => {
            promptForStep(BLIND_STEP_SIGNUP_LAST_NAME);
          });
        } else if (activeStep === BLIND_STEP_SIGNUP_PHONE) {
          setPhone("");
          voiceDataRef.current.phone = "";
          speakText(t("prompt_try_again"), () => promptForStep(activeStep));
        } else if (activeStep === BLIND_STEP_SIGNUP_AGE) {
          setAge("");
          voiceDataRef.current.age = "";
          speakText(t("prompt_try_again"), () => promptForStep(activeStep));
        } else if (activeStep === BLIND_STEP_SIGNUP_GENDER) {
          setGender("");
          voiceDataRef.current.gender = "";
          speakText(t("prompt_try_again"), () => promptForStep(activeStep));
        }
      } else {
        speakText(t("prompt_confirm_say_yes_no"), resumeVoiceListening);
      }
      return;
    }

    if (text === "next" || text === "continue") {
      if (activeStep === BLIND_STEP_SIGNUP_EMAIL) {
        if (latestRef.current.email) {
          promptForStep(BLIND_STEP_SIGNUP_PHONE);
        } else {
          speakText(t("prompt_step_email"), resumeVoiceListening);
        }
      } else if (activeStep === BLIND_STEP_SIGNUP_PHONE) {
        setPhone("");
        voiceDataRef.current.phone = "";
        speakText(t("field_skipped", { field: t("field_mobile_number") }), () => promptForStep(BLIND_STEP_SIGNUP_AGE));
      } else if (activeStep === BLIND_STEP_SIGNUP_AGE) {
        setAge("");
        voiceDataRef.current.age = "";
        speakText(t("field_skipped", { field: t("field_age") }), () => promptForStep(BLIND_STEP_SIGNUP_GENDER));
      } else if (activeStep === BLIND_STEP_SIGNUP_GENDER) {
        setGender("");
        voiceDataRef.current.gender = "";
        speakText(t("field_skipped", { field: t("field_gender") }), () => promptForStep(BLIND_STEP_SIGNUP_PASSWORD));
      } else if (activeStep === BLIND_STEP_SIGNUP_PASSWORD) {
        if (latestRef.current.password) {
          promptForStep(BLIND_STEP_SIGNUP_CONFIRM);
        } else {
          speakText(t("prompt_step_password"), resumeVoiceListening);
        }
      } else if (activeStep === BLIND_STEP_SIGNUP_CONFIRM) {
        if (latestRef.current.confirmPassword) {
          if (latestRef.current.confirmPassword === latestRef.current.password) {
            promptForStep(BLIND_STEP_SIGNUP_SUMMARY);
          } else {
            speakText(t("prompt_passwords_mismatch"), () => promptForStep(BLIND_STEP_SIGNUP_PASSWORD));
          }
        } else {
          speakText(t("prompt_confirm_password"), resumeVoiceListening);
        }
      } else if (activeStep === BLIND_STEP_SIGNUP_SUMMARY) {
        triggerVoicePrompt(t("prompt_registering_account"), BLIND_STEP_NONE);
        executeVoiceSignup();
      }
      return;
    }

    // ── Password Processing ─────────────────────────
    if (activeStep === BLIND_STEP_SIGNUP_PASSWORD) {
      const pwd = normalizeIndicPassword(spokenText);
      if (pwd.length < 6) {
        speakText(t("prompt_password_min_length"), resumeVoiceListening);
        return;
      }
      setPassword(pwd);
      voiceDataRef.current.password = pwd;
      speakText(t("prompt_confirm_password"), () => {
        promptForStep(BLIND_STEP_SIGNUP_CONFIRM);
      });
      return;
    }

    if (activeStep === BLIND_STEP_SIGNUP_CONFIRM) {
      const pwdVal = normalizeIndicPassword(spokenText);
      setConfirmPassword(pwdVal);
      voiceDataRef.current.confirmPassword = pwdVal;

      if (pwdVal !== voiceDataRef.current.password) {
        speakText(t("prompt_passwords_mismatch"), () => {
          setPassword("");
          setConfirmPassword("");
          voiceDataRef.current.password = "";
          voiceDataRef.current.confirmPassword = "";
          promptForStep(BLIND_STEP_SIGNUP_PASSWORD);
        });
      } else {
        speakText(t("prompt_passwords_match"), () => {
          if (latestRef.current.isEditing) {
            setIsEditing(false);
            promptForStep(BLIND_STEP_SIGNUP_SUMMARY);
          } else {
            promptForStep(BLIND_STEP_SIGNUP_SUMMARY);
          }
        });
      }
      return;
    }

    // ── Step-specific Input Processing ──────────────────
    if (activeStep === BLIND_STEP_SIGNUP_PHONE) {
      const normalizedPhone = normalizeIndicDigits(spokenText);
      if (!normalizedPhone || normalizedPhone.length !== 10) {
        speakText(t("prompt_phone_length_error"), resumeVoiceListening);
        return;
      }
      setPhone(normalizedPhone);
      voiceDataRef.current.phone = normalizedPhone;
      setPendingValue(normalizedPhone);
      setIsConfirming(true);
      const digitSpeak = normalizedPhone.split("").join(" ");
      triggerVoicePrompt(t("prompt_confirm_phone", { digits: digitSpeak }), BLIND_STEP_SIGNUP_PHONE);
      return;
    }

    if (activeStep === BLIND_STEP_SIGNUP_AGE) {
      const ageVal = parseIndicAge(spokenText);
      if (!ageVal) {
        speakText(t("prompt_age_parse_error"), resumeVoiceListening);
        return;
      }
      const ageStr = ageVal.toString();
      setAge(ageStr);
      voiceDataRef.current.age = ageStr;
      setPendingValue(ageStr);
      setIsConfirming(true);
      triggerVoicePrompt(t("prompt_confirm_age", { age: ageStr }), BLIND_STEP_SIGNUP_AGE);
      return;
    }

    if (activeStep === BLIND_STEP_SIGNUP_GENDER) {
      let gen = parseIndicGender(spokenText);
      if (!gen) {
        if (text.includes("female")) gen = "Female";
        else if (text.includes("male")) gen = "Male";
        else if (text.includes("prefer not") || text.includes("don't say") || text.includes("no say")) gen = "Prefer not to say";
        else gen = "Other";
      }
      
      setGender(gen);
      voiceDataRef.current.gender = gen;
      setPendingValue(gen);
      setIsConfirming(true);
      triggerVoicePrompt(t("prompt_confirm_gender", { gender: gen }), BLIND_STEP_SIGNUP_GENDER);
      return;
    }

    if (activeStep === BLIND_STEP_SIGNUP_SUMMARY) {
      const summaryYesNo = parseIndicYesNo(spokenText);
      if (summaryYesNo === "YES" || text.includes("create account") || text.includes("submit") || text.includes("register") || text.includes("finish") || text === "yes" || text.includes("yeah")) {
        triggerVoicePrompt(t("prompt_registering_account"), BLIND_STEP_NONE);
        executeVoiceSignup();
        return;
      }
      
      if (text.includes("edit") || text.includes("change") || text.includes("modify")) {
        let targetStep = null;
        let fieldName = "";
        if (text.includes("first name") || text.includes("first")) {
          targetStep = BLIND_STEP_SIGNUP_FIRST_NAME;
          fieldName = "First Name";
        } else if (text.includes("last name") || text.includes("last")) {
          targetStep = BLIND_STEP_SIGNUP_LAST_NAME;
          fieldName = "Last Name";
        } else if (text.includes("name")) {
          targetStep = BLIND_STEP_SIGNUP_FIRST_NAME;
          fieldName = "First Name";
        } else if (text.includes("email") || text.includes("mail")) {
          targetStep = BLIND_STEP_SIGNUP_EMAIL;
          fieldName = "Email";
        } else if (text.includes("phone") || text.includes("number")) {
          targetStep = BLIND_STEP_SIGNUP_PHONE;
          fieldName = "Phone Number";
        } else if (text.includes("age")) {
          targetStep = BLIND_STEP_SIGNUP_AGE;
          fieldName = "Age";
        } else if (text.includes("gender")) {
          targetStep = BLIND_STEP_SIGNUP_GENDER;
          fieldName = "Gender";
        } else if (text.includes("password")) {
          targetStep = BLIND_STEP_SIGNUP_PASSWORD;
          fieldName = "Password";
        }

        if (targetStep) {
          setIsEditing(true);
          setIsConfirming(false);
          speakText(`Let's edit your ${fieldName}.`, () => {
            promptForStep(targetStep);
          });
        } else {
          speakText("I couldn't identify the field to edit. Say edit name, edit email, edit phone, edit age, edit gender, or edit password.", resumeVoiceListening);
        }
        return;
      }

      speakText("Please say Create Account, or say Edit followed by the field name.", resumeVoiceListening);
    }
  }, [triggerVoicePrompt, speakText, navigate, executeVoiceSignup, promptForStep, startGreeting, resumeVoiceListening]);

  // Speech Recognition Context Registration
  useEffect(() => {
    const isPasswordStep = blindStep === BLIND_STEP_SIGNUP_PASSWORD || blindStep === BLIND_STEP_SIGNUP_CONFIRM;
    const unregister = registerContext("BLIND_SIGNUP", (spokenText, confidence) => {
      setTranscript(spokenText);
      processVoiceInput(spokenText, confidence);
    }, voiceActive && !showVoiceEmail, { requireFinalResult: isPasswordStep });
    return unregister;
  }, [registerContext, processVoiceInput, voiceActive, showVoiceEmail, setTranscript, blindStep]);

  // Dynamic Spelling Mode Control
  useEffect(() => {
    const isSpelling = blindStep === BLIND_STEP_SIGNUP_SPELLING_FIRST || blindStep === BLIND_STEP_SIGNUP_SPELLING_LAST;
    setSpellingMode(isSpelling);
    return () => {
      setSpellingMode(false);
    };
  }, [blindStep, setSpellingMode]);

  // Autoplay greeting on mount or click fallback
  useEffect(() => {
    if (!voiceActive) return;

    const timer = setTimeout(() => {
      startGreeting();
    }, 1000);

    const handleUserInteraction = () => {
      startGreeting(true);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [voiceActive, startGreeting]);

  const handleEmergencyStop = () => {
    stop();
    setVoiceActive(false);
  };

  const handleManualSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (phone) {
      const cleanedPhone = phone.replace(/\D/g, "");
      if (cleanedPhone.length !== 10) {
        setError("Mobile number must be exactly 10 digits.");
        return;
      }
    }
    setLoading(true);
    setError("");
    if (DEMO_MODE) {
      loginDemoUser("blind", email);
      navigate("/blind");
      setLoading(false);
      return;
    }
    try {
      await signUp({
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        email,
        password,
        phone,
        age: parseInt(age) || null,
        gender,
        disabilityType: accessibilityPref || "blind"
      });
      navigate(`/${accessibilityPref}`);
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans relative overflow-hidden flex flex-col items-center justify-center p-4 pt-20 pb-12">
      {/* Soft gradient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-3">
          <BackButton fallback="/?step=mode" />
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl font-bold text-primary font-headline">AccessAI</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector compact={true} />
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-fixed text-primary border border-outline-variant/20 uppercase tracking-widest">
            {t("mode_blind_title", "Blind Mode")}
          </span>
        </div>
      </header>

      {/* Card */}
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-2xl border border-outline-variant/30 rounded-3xl p-8 shadow-lg relative z-10 flex flex-col gap-6">
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-3xl flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
              <p className="text-sm font-semibold text-on-surface-variant">{t("btn_creating_account", "Creating account...")}</p>
            </div>
          </div>
        )}

        {/* Conversational Voice Email Input */}
        {showVoiceEmail && (
          <VoiceEmailInput
            onSuccess={handleEmailSuccess}
            onRetry={handleEmailRetry}
            voiceActive={!voiceActive}
            initialPrompt={t("prompt_step_email")}
          />
        )}

        {/* Floating Voice Bubble */}
        {!showVoiceEmail && voiceActive && speechBubble && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-2 relative">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase font-headline">{t("badge_voice_assistant", "Voice Assistant")}</span>
              <button 
                onClick={handleEmergencyStop}
                className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold cursor-pointer"
              >
                {t("btn_stop_voice", "Stop Voice")}
              </button>
            </div>
            <p className="text-sm italic text-on-surface">"{speechBubble}"</p>
            {transcript && (
              <div className="border-t border-outline-variant/20 pt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t("label_heard", "Heard")}: "{transcript}"</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight font-headline">{t("title_signup_blind", "Create Blind Account")}</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {t("sub_signup_blind", "Please register using the voice prompt wizard, or fill out credentials below.")}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleManualSignup} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{t("field_first_name", "First Name")}</label>
              <input
                id="blind-first-name"
                onFocus={() => handleInputFocus(BLIND_STEP_SIGNUP_FIRST_NAME)}
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base transition-all"
                placeholder="Aman"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{t("field_last_name", "Last Name")}</label>
              <input
                id="blind-last-name"
                onFocus={() => handleInputFocus(BLIND_STEP_SIGNUP_LAST_NAME)}
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base transition-all"
                placeholder="Halkude"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{t("field_email", "Email Address")}</label>
              <input
                id="blind-email"
                onFocus={() => handleInputFocus(BLIND_STEP_SIGNUP_EMAIL)}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{t("field_phone", "Phone Number")}</label>
              <input
                id="blind-phone"
                onFocus={() => handleInputFocus(BLIND_STEP_SIGNUP_PHONE)}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{t("field_accessibility", "Accessibility Preferences")}</label>
            <select
              id="blind-pref"
              value={accessibilityPref}
              onChange={(e) => setAccessibilityPref(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base transition-all appearance-none cursor-pointer"
            >
              <option value="blind">{t("pref_blind", "Blind / Low Vision")}</option>
              <option value="deaf">{t("pref_deaf", "Deaf / Hard of Hearing")}</option>
              <option value="motor">{t("pref_motor", "Motor Impaired")}</option>
              <option value="none">{t("pref_none", "None")}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{t("field_age", "Age")}</label>
              <input
                id="blind-age"
                onFocus={() => handleInputFocus(BLIND_STEP_SIGNUP_AGE)}
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base transition-all"
                placeholder="21"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{t("field_gender", "Gender")}</label>
              <select
                id="blind-gender"
                onFocus={() => handleInputFocus(BLIND_STEP_SIGNUP_GENDER)}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base transition-all appearance-none cursor-pointer"
              >
                <option value="">{t("select_gender", "Select Gender")}</option>
                <option value="Male">{t("gender_male", "Male")}</option>
                <option value="Female">{t("gender_female", "Female")}</option>
                <option value="Other">{t("gender_other", "Other")}</option>
                <option value="Prefer not to say">{t("gender_prefer_not", "Prefer not to say")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{t("field_password", "Password")}</label>
              <input
                id="blind-password"
                onFocus={() => handleInputFocus(BLIND_STEP_SIGNUP_PASSWORD)}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{t("field_confirm_password", "Confirm Password")}</label>
              <input
                id="blind-confirm-password"
                onFocus={() => handleInputFocus(BLIND_STEP_SIGNUP_CONFIRM)}
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            id="blind-submit-btn"
            type="submit"
            className="w-full py-4 bg-primary hover:brightness-110 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-primary/20 mt-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>{t("btn_create_account", "Create Account")}</span>
          </button>
        </form>

        <div className="text-center text-xs text-on-surface-variant border-t border-outline-variant/20 pt-4 flex flex-col gap-2">
          <div>
            {t("btn_already_registered", "Already registered?")}{" "}
            <button
              onClick={() => {
                handleEmergencyStop();
                navigate("/blind/login");
              }}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              {t("btn_back_to_login", "Back to Login")}
            </button>
          </div>
          {!voiceActive && !showVoiceEmail && (
            <button
              onClick={handleActivateVoice}
              className="text-emerald-600 font-semibold hover:underline cursor-pointer text-xs mt-1"
            >
              {t("btn_activate_voice", "Activate Voice Assistant")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
