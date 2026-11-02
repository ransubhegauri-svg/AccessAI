import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVoiceAssistant } from "../hooks/useVoice";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";
import BackButton from "../components/BackButton";


const STATE_IDLE = "IDLE";
const STATE_GREETING = "GREETING";
const STATE_LISTENING = "LISTENING";
const STATE_PROCESSING = "PROCESSING";
const STATE_SPEAKING = "SPEAKING";

const modes = [
  {
    key: "blind",
    title: "Blind / Low Vision",
    description: "Voice-first interface with high-contrast elements and full screen reader optimization.",
    icon: "visibility_off",
    accent: "primary",
    bgFixed: "bg-primary-fixed",
    textAccent: "text-primary",
    ringColor: "ring-primary/20",
    borderActive: "border-primary",
    groupHoverBg: "group-hover:bg-primary"
  },
  {
    key: "deaf",
    title: "Deaf / Hard of Hearing",
    description: "Visual-first interaction with real-time transcription and visual haptic feedback.",
    icon: "hearing_disabled",
    accent: "tertiary",
    bgFixed: "bg-tertiary-fixed",
    textAccent: "text-tertiary",
    ringColor: "ring-tertiary/20",
    borderActive: "border-tertiary",
    groupHoverBg: "group-hover:bg-tertiary"
  },
  {
    key: "motor",
    title: "Motor Impaired",
    description: "Adaptive inputs with oversized hit areas, eye-tracking support, and simplified gestures.",
    icon: "accessible",
    accent: "secondary",
    bgFixed: "bg-secondary-fixed",
    textAccent: "text-secondary",
    ringColor: "ring-secondary/20",
    borderActive: "border-secondary",
    groupHoverBg: "group-hover:bg-secondary"
  }
];

const demoAccounts = [
  {
    mode: "blind",
    title: "Blind / Low Vision",
    name: "Aman Halkude",
    email: "amanhalkude7750+blind@gmail.com",
    icon: "visibility_off",
    accent: "primary",
    badgeBg: "bg-primary-fixed text-primary",
    borderActive: "border-primary",
    description: "Voice-guided navigation and screen reader controls"
  },
  {
    mode: "deaf",
    title: "Deaf / Hard of Hearing",
    name: "Vrusha Goyal",
    email: "goyalvrusha@gmail.com",
    icon: "hearing_disabled",
    accent: "tertiary",
    badgeBg: "bg-tertiary-fixed text-tertiary",
    borderActive: "border-tertiary",
    description: "Real-time captions, haptic cues & visual sign support"
  },
  {
    mode: "motor",
    title: "Motor Impaired",
    name: "Aman Halkude",
    email: "amanhalkude7750@gmail.com",
    icon: "accessible",
    accent: "secondary",
    badgeBg: "bg-secondary-fixed text-secondary",
    borderActive: "border-secondary",
    description: "Head/eye tracking, large hit targets & voice dwell"
  }
];

function SparkleIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sparkle-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0066ff" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        fill="url(#sparkle-grad)"
      />
    </svg>
  );
}

function UkFlag() {
  return (
    <span className="inline-flex items-center justify-center w-[32px] h-[22px] overflow-hidden rounded-[2px] shadow-2xs shrink-0" title="United Kingdom">
      <svg viewBox="0 0 60 30" className="w-full h-full block">
        <clipPath id="uk-clip"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
        <clipPath id="uk-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
        <g clipPath="url(#uk-clip)">
          <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag)" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
        </g>
      </svg>
    </span>
  );
}

function IndiaFlag() {
  return (
    <span className="inline-flex items-center justify-center w-[32px] h-[22px] overflow-hidden rounded-[2px] shadow-2xs shrink-0" title="India">
      <svg viewBox="0 0 225 150" className="w-full h-full block">
        <rect width="225" height="50" fill="#FF9933"/>
        <rect y="50" width="225" height="50" fill="#FFFFFF"/>
        <rect y="100" width="225" height="50" fill="#138808"/>
        <circle cx="112.5" cy="75" r="20" fill="none" stroke="#000080" strokeWidth="3"/>
        <circle cx="112.5" cy="75" r="3.5" fill="#000080"/>
      </svg>
    </span>
  );
}

export default function Landing() {
  const { t, language, setLanguage, languages } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStepParam = searchParams.get("step");
  const [stepState, setStepState] = useState(
    currentStepParam === "mode" ? "mode" : currentStepParam === "role" ? "role" : "language"
  );

  useEffect(() => {
    if (currentStepParam === "mode" || currentStepParam === "role") {
      setStepState(currentStepParam);
    } else {
      setStepState("language");
    }
  }, [currentStepParam]);

  const landingStep = stepState;

  const setLandingStep = useCallback((step) => {
    setStepState(step);
    if (step === "mode") {
      setSearchParams({ step: "mode" });
    } else if (step === "role") {
      setSearchParams({ step: "role" });
    } else {
      setSearchParams({});
    }
  }, [setSearchParams]);

  const [selected, setSelected] = useState("blind");
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoExpanded, setDemoExpanded] = useState(false);

  const selectedDemoAcc = useMemo(() => {
    if (!selected) return null;
    return demoAccounts.find((d) => d.mode === selected) || null;
  }, [selected]);
  const navigate = useNavigate();
  const { loginDemoUser, DEMO_MODE, user, disabilityType, logout, role } = useAuth();

  const modes = useMemo(() => [
    {
      key: "blind",
      title: t("mode_blind_title", "Blind & Low Vision"),
      description: t("mode_blind_desc", "Voice-first interface with high-contrast elements and full screen reader optimization."),
      icon: "visibility_off",
      accent: "primary",
      bgFixed: "bg-primary-fixed",
      textAccent: "text-primary",
      ringColor: "ring-primary/20",
      borderActive: "border-primary",
      groupHoverBg: "group-hover:bg-primary"
    },
    {
      key: "deaf",
      title: t("mode_deaf_title", "Deaf & Hard of Hearing"),
      description: t("mode_deaf_desc", "Visual-first interaction with real-time transcription and visual haptic feedback."),
      icon: "hearing_disabled",
      accent: "tertiary",
      bgFixed: "bg-tertiary-fixed",
      textAccent: "text-tertiary",
      ringColor: "ring-tertiary/20",
      borderActive: "border-tertiary",
      groupHoverBg: "group-hover:bg-tertiary"
    },
    {
      key: "motor",
      title: t("mode_motor_title", "Motor & Mobility"),
      description: t("mode_motor_desc", "Hands-free head tracking cursor, dwell clicking, customizable sensitivity, and facial gesture triggers."),
      icon: "accessibility_new",
      accent: "secondary",
      bgFixed: "bg-secondary-fixed",
      textAccent: "text-secondary",
      ringColor: "ring-secondary/20",
      borderActive: "border-secondary",
      groupHoverBg: "group-hover:bg-secondary"
    }
  ], [t]);

  const {
    registerContext,
    speak,
    stop,
    resumeListening: globalResumeListening,
    speechBubble,
    setSpeechBubble,
    transcript,
    setTranscript,
    agentState,
    setAgentState
  } = useVoiceAssistant();

  const [showSpeechBubble, setShowSpeechBubble] = useState(true);

  // Debug Panel States
  const [debugStatus, setDebugStatus] = useState("Idle");
  const [debugTranscript, setDebugTranscript] = useState("");
  const [debugNormalized, setDebugNormalized] = useState("");
  const [debugIntent, setDebugIntent] = useState("None");
  const [debugFunction, setDebugFunction] = useState("None");
  const [debugResult, setDebugResult] = useState("None");

  const selectedRef = useRef(null);
  const hasSpokenRef = useRef(false);

  const textToSpeak = useMemo(() => {
    if (landingStep === "language") {
      return language === "kn"
        ? "ನಮಸ್ಕಾರ, ನಾನು AccessAI. ದಯವಿಟ್ಟು ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ."
        : language === "hi"
        ? "नमस्ते, मैं AccessAI हूँ। कृपया आगे बढ़ने के लिए अपनी भाषा चुनें।"
        : "Hello! I am AccessAI. Please choose your preferred language to begin.";
    }
    return language === "kn"
      ? "ದಯವಿಟ್ಟು ಬ್ಲೈಂಡ್ ಮೋಡ್, ಕಿವುಡ ಮೋಡ್ ಅಥವಾ ಮೋಟಾರ್ ಮೋಡ್ ಅನ್ನು ಆಯ್ಕೆಮಾಡಿ."
      : language === "hi"
      ? "कृपया आगे बढ़ने के लिए ब्लाइंड मोड, डेफ मोड या मोटर मोड चुनें।"
      : "Hello! I am AccessAI. Please say Blind Mode, Deaf Mode, or Motor Mode, or choose an option to begin.";
  }, [landingStep, language]);

  const setSelectedWithRef = useCallback((val) => {
    selectedRef.current = val;
    setSelected(val);
  }, []);

  const speakText = useCallback((text, onEndCallback) => {
    setSpeechBubble(text);
    speak(text, onEndCallback);
  }, [speak, setSpeechBubble]);

  const resumeListening = useCallback(() => {
    setAgentState(STATE_LISTENING);
    setDebugStatus("Listening...");
    globalResumeListening();
  }, [globalResumeListening, setAgentState]);

  const playGreeting = useCallback((force = false) => {
    if (hasSpokenRef.current && !force) return;
    hasSpokenRef.current = true;

    setAgentState(STATE_SPEAKING);
    setDebugStatus("Speaking...");
    stop();
    setShowSpeechBubble(true);

    speakText(textToSpeak, () => {
      setTimeout(() => {
        resumeListening();
      }, 100);
    });
  }, [speakText, resumeListening, stop, setAgentState, textToSpeak]);

  const handleOrbClick = useCallback(() => {
    playGreeting(true);
  }, [playGreeting]);

  // Trigger greeting automatically on page load + first user gesture fallback (bypasses browser autoplay policy)
  useEffect(() => {
    // Attempt immediate speech on load
    const loadTimer = setTimeout(() => {
      playGreeting(false);
    }, 200);

    // If browser autoplay policies block background speech synthesis until user interacts,
    // ensure the very first interaction triggers speech immediately
    const handleFirstGesture = () => {
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      playGreeting(true);
      removeGestureListeners();
    };

    const removeGestureListeners = () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("pointerdown", handleFirstGesture);
    };

    window.addEventListener("click", handleFirstGesture, { once: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });
    window.addEventListener("pointerdown", handleFirstGesture, { once: true });

    return () => {
      clearTimeout(loadTimer);
      removeGestureListeners();
    };
  }, [playGreeting]);

  const selectMode = useCallback((modeKey, playTTS = true) => {
    setSelectedWithRef(modeKey);

    // If Deaf/Mute mode is chosen, cancel speech immediately and keep completely silent
    if (modeKey === "deaf") {
      stop();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeechBubble("Deaf / Hard of Hearing mode selected. Visual sign & caption interface active.");
      setAgentState(STATE_IDLE);
      return;
    }

    if (playTTS) {
      const modeName = modes.find(m => m.key === modeKey)?.title;
      const replyText = `${modeName} selected. Would you like to Login or Sign Up?`;

      setAgentState(STATE_SPEAKING);
      setDebugStatus("Speaking...");
      stop();

      console.log(`Assistant Speaking:\n"${replyText}"`);

      speakText(replyText, () => {
        setTimeout(() => {
          resumeListening();
        }, 100);
      });
    }
  }, [speakText, resumeListening, setSelectedWithRef, stop, setAgentState, setSpeechBubble]);

  const selectBlindMode = useCallback(() => {
    setLandingStep("mode");
    selectMode("blind", true);
  }, [selectMode, setLandingStep]);

  const selectMotorMode = useCallback(() => {
    setLandingStep("mode");
    selectMode("motor", true);
  }, [selectMode, setLandingStep]);

  const selectDeafMode = useCallback(() => {
    setLandingStep("mode");
    selectMode("deaf", false);
  }, [selectMode, setLandingStep]);

  const handleLoginRedirect = useCallback(() => {
    if (!selected) return;
    if (selected === "deaf" && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    navigate(`/${selected}/login`);
  }, [selected, navigate]);

  const handleSignupRedirect = useCallback(() => {
    if (!selected) return;
    if (selected === "deaf" && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    navigate(`/${selected}/signup`);
  }, [selected, navigate]);

  const handleDemoLogin = useCallback((modeKey) => {
    const targetMode = modeKey || selectedRef.current || selected;
    if (!targetMode) {
      setShowDemoModal(true);
      return;
    }

    if (targetMode === "deaf") {
      stop();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      loginDemoUser("deaf");
      navigate("/deaf");
      return;
    }

    const demoAcc = demoAccounts.find((acc) => acc.mode === targetMode);
    const replyText = `Logging into demo account for ${demoAcc?.title || targetMode}.`;

    setAgentState(STATE_SPEAKING);
    setDebugStatus("Speaking...");
    stop();
    loginDemoUser(targetMode);

    let navigated = false;
    const proceed = () => {
      if (!navigated) {
        navigated = true;
        navigate(`/${targetMode}`);
      }
    };

    speakText(replyText, () => {
      proceed();
    });
    // Navigation fallback timer so user is never stuck if speech synthesis is delayed or blocked
    setTimeout(proceed, 1200);
  }, [selected, speakText, loginDemoUser, navigate, stop, setAgentState]);

  const openLogin = useCallback(() => {
    if (!selectedRef.current) {
      const replyText = "Please select Blind Mode or Motor Mode first before logging in.";
      setAgentState(STATE_SPEAKING);
      setDebugStatus("Speaking...");
      stop();
      console.log(`Assistant Speaking:\n"${replyText}"`);
      speakText(replyText, () => {
        setTimeout(() => {
          resumeListening();
        }, 100);
      });
      return;
    }
    const replyText = "Opening adaptive login.";
    setAgentState(STATE_SPEAKING);
    setDebugStatus("Speaking...");
    stop();
    console.log(`Assistant Speaking:\n"${replyText}"`);
    speakText(replyText, () => {
      navigate(`/${selectedRef.current}/login`);
    });
  }, [speakText, resumeListening, stop, navigate, setAgentState]);

  const openSignup = useCallback(() => {
    if (!selectedRef.current) {
      const replyText = "Please select Blind Mode or Motor Mode first before signing up.";
      setAgentState(STATE_SPEAKING);
      setDebugStatus("Speaking...");
      stop();
      console.log(`Assistant Speaking:\n"${replyText}"`);
      speakText(replyText, () => {
        setTimeout(() => {
          resumeListening();
        }, 100);
      });
      return;
    }
    const replyText = "Opening adaptive registration.";
    setAgentState(STATE_SPEAKING);
    setDebugStatus("Speaking...");
    stop();
    console.log(`Assistant Speaking:\n"${replyText}"`);
    speakText(replyText, () => {
      navigate(`/${selectedRef.current}/signup`);
    });
  }, [speakText, resumeListening, stop, navigate, setAgentState]);

  // Normalize transcript text
  const normalizeTranscript = useCallback((text) => {
    let normalized = text.toLowerCase().trim();

    // Exact mapping matches
    if (normalized === "log in" || normalized === "login" || normalized.includes("log in") || normalized.includes("login") || normalized.includes("sign in") || normalized.includes("signin")) {
      return "login";
    }
    if (normalized === "sign up" || normalized === "signup" || normalized.includes("sign up") || normalized.includes("signup") || normalized.includes("register")) {
      return "signup";
    }
    if (normalized.includes("start blind") || normalized.includes("open blind") || normalized.includes("launch blind")) {
      return "start blind";
    }
    if (normalized.includes("start deaf") || normalized.includes("open deaf") || normalized.includes("launch deaf")) {
      return "start deaf";
    }
    if (normalized.includes("start motor") || normalized.includes("open motor") || normalized.includes("launch motor")) {
      return "start motor";
    }
    if (normalized === "blind" || normalized === "blind mode" || normalized.includes("blind")) {
      return "blind mode";
    }
    if (normalized === "motor" || normalized === "motor mode" || normalized.includes("motor")) {
      return "motor mode";
    }
    if (normalized === "deaf" || normalized === "deaf mode" || normalized.includes("deaf") || normalized.includes("mute")) {
      return "deaf mode";
    }
    if (normalized === "student" || normalized === "student mode" || normalized.includes("student")) {
      return "student";
    }
    if (normalized === "teacher" || normalized === "teacher mode" || normalized.includes("teacher") || normalized.includes("educator")) {
      return "teacher";
    }
    if (normalized === "start" || normalized === "go" || normalized === "enter" || normalized === "proceed" || normalized === "continue") {
      return "start";
    }
    if (normalized === "demo" || normalized === "demo mode" || normalized.includes("demo account") || normalized.includes("demo")) {
      return "demo mode";
    }
    if (normalized === "english" || normalized.includes("english") || normalized.includes("अंग्रेजी")) {
      return "english";
    }
    if (normalized === "hindi" || normalized.includes("hindi") || normalized.includes("हिंदी") || normalized.includes("हिन्दी")) {
      return "hindi";
    }
    if (normalized === "kannada" || normalized.includes("kannada") || normalized.includes("ಕನ್ನಡ")) {
      return "kannada";
    }
    if (normalized.includes("change language") || normalized.includes("select language") || normalized.includes("ಭಾಷೆ")) {
      return "change language";
    }

    return normalized;
  }, []);

  // Intent detection and callback mapper
  const detectIntent = useCallback((normalizedText) => {
    if (normalizedText === "student") {
      return {
        intent: "SELECT_ROLE",
        entity: "student",
        action: () => {
          setLandingStep("mode");
          const replyText = "Student mode active. Please choose Blind Mode, Deaf Mode, or Motor Mode.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        },
        funcName: "setLandingStep('mode')"
      };
    }
    if (normalizedText === "teacher") {
      return {
        intent: "SELECT_ROLE",
        entity: "teacher",
        action: () => {
          const replyText = "Opening Educator and Teacher Portal.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          speakText(replyText, () => {
            navigate("/teacher/login");
          });
        },
        funcName: "navigate('/teacher/login')"
      };
    }
    if (normalizedText === "start blind") {
      return {
        intent: "START_MODE",
        entity: "blind",
        action: () => {
          selectMode("blind", false);
          handleDemoLogin("blind");
        },
        funcName: "handleDemoLogin('blind')"
      };
    }
    if (normalizedText === "start deaf") {
      return {
        intent: "START_MODE",
        entity: "deaf",
        action: () => {
          selectMode("deaf", false);
          handleDemoLogin("deaf");
        },
        funcName: "handleDemoLogin('deaf')"
      };
    }
    if (normalizedText === "start motor") {
      return {
        intent: "START_MODE",
        entity: "motor",
        action: () => {
          selectMode("motor", false);
          handleDemoLogin("motor");
        },
        funcName: "handleDemoLogin('motor')"
      };
    }
    if (normalizedText === "start") {
      return {
        intent: "START_MODE",
        entity: selectedRef.current || selected || "blind",
        action: () => {
          if (landingStep !== "mode") {
            setLandingStep("mode");
            const replyText = "Please choose Blind Mode, Deaf Mode, or Motor Mode.";
            setAgentState(STATE_SPEAKING);
            setDebugStatus("Speaking...");
            speakText(replyText, () => {
              setTimeout(() => { resumeListening(); }, 100);
            });
          } else {
            handleDemoLogin(selectedRef.current || selected || "blind");
          }
        },
        funcName: "handleDemoLogin()"
      };
    }
    if (normalizedText === "english") {
      return {
        intent: "SELECT_LANGUAGE",
        entity: "en",
        action: () => {
          setLanguage("en");
          setLandingStep("mode");
          const replyText = "English selected. Please choose Blind Mode, Deaf Mode, or Motor Mode.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        },
        funcName: "setLanguage('en')"
      };
    }
    if (normalizedText === "hindi") {
      return {
        intent: "SELECT_LANGUAGE",
        entity: "hi",
        action: () => {
          setLanguage("hi");
          setLandingStep("mode");
          const replyText = "हिंदी भाषा चुनी गई। कृपया ब्लाइंड मोड, डेफ मोड या मोटर मोड चुनें।";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        },
        funcName: "setLanguage('hi')"
      };
    }
    if (normalizedText === "kannada") {
      return {
        intent: "SELECT_LANGUAGE",
        entity: "kn",
        action: () => {
          setLanguage("kn");
          setLandingStep("mode");
          const replyText = "ಕನ್ನಡ ಭಾಷೆ ಆಯ್ಕೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಬ್ಲೈಂಡ್, ಕಿವುಡ ಅಥವಾ ಮೋಟಾರ್ ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        },
        funcName: "setLanguage('kn')"
      };
    }
    if (normalizedText === "change language") {
      return {
        intent: "CHANGE_LANGUAGE",
        entity: null,
        action: () => {
          setLandingStep("language");
          const replyText = "Please select English, Hindi, or Kannada.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        },
        funcName: "setLandingStep('language')"
      };
    }
    if (normalizedText === "blind mode") {
      return { intent: "SELECT_MODE", entity: "blind", action: selectBlindMode, funcName: "selectBlindMode()" };
    }
    if (normalizedText === "motor mode") {
      return { intent: "SELECT_MODE", entity: "motor", action: selectMotorMode, funcName: "selectMotorMode()" };
    }
    if (normalizedText === "deaf mode") {
      return { intent: "SELECT_MODE", entity: "deaf", action: selectDeafMode, funcName: "selectDeafMode()" };
    }
    if (normalizedText === "login") {
      return { intent: "OPEN_LOGIN", entity: null, action: openLogin, funcName: "openLogin()" };
    }
    if (normalizedText === "signup") {
      return { intent: "OPEN_SIGNUP", entity: null, action: openSignup, funcName: "openSignup()" };
    }
    if (normalizedText === "demo mode") {
      return {
        intent: "DEMO_LOGIN",
        entity: selectedRef.current || null,
        action: () => {
          if (selectedRef.current) {
            handleDemoLogin(selectedRef.current);
          } else {
            setShowDemoModal(true);
            const replyText = "Please select a demo account for Blind, Deaf, or Motor mode.";
            setAgentState(STATE_SPEAKING);
            setDebugStatus("Speaking...");
            speakText(replyText, () => {
              setTimeout(() => { resumeListening(); }, 100);
            });
          }
        },
        funcName: "handleDemoLogin()"
      };
    }
    if (normalizedText.includes("home")) {
      return {
        intent: "NAVIGATE_HOME", entity: null, action: () => {
          const replyText = "You are on the homepage.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          console.log(`Assistant Speaking:\n"${replyText}"`);
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        }, funcName: "navigateHome()"
      };
    }
    if (normalizedText.includes("dashboard") || normalizedText.includes("continue learning")) {
      return {
        intent: "NAVIGATE_DASHBOARD", entity: null, action: () => {
          if (selectedRef.current) {
            const replyText = "Opening dashboard...";
            setAgentState(STATE_SPEAKING);
            setDebugStatus("Speaking...");
              console.log(`Assistant Speaking:\n"${replyText}"`);
            speakText(replyText, () => { navigate(`/${selectedRef.current}`); });
          } else {
            const replyText = "Please select Blind Mode or Motor Mode first.";
            setAgentState(STATE_SPEAKING);
            setDebugStatus("Speaking...");
              console.log(`Assistant Speaking:\n"${replyText}"`);
            speakText(replyText, () => {
              setTimeout(() => { resumeListening(); }, 100);
            });
          }
        }, funcName: "navigateDashboard()"
      };
    }
    if (normalizedText.includes("courses")) {
      return {
        intent: "VIEW_COURSES", entity: null, action: () => {
          const replyText = "Please sign in first to view your courses.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          console.log(`Assistant Speaking:\n"${replyText}"`);
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        }, funcName: "viewCourses()"
      };
    }
    if (normalizedText.includes("profile")) {
      return {
        intent: "VIEW_PROFILE", entity: null, action: () => {
          const replyText = "Please sign in first to view your profile.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          console.log(`Assistant Speaking:\n"${replyText}"`);
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        }, funcName: "viewProfile()"
      };
    }
    if (normalizedText.includes("settings")) {
      return {
        intent: "VIEW_SETTINGS", entity: null, action: () => {
          const replyText = "Please sign in first to view settings.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          console.log(`Assistant Speaking:\n"${replyText}"`);
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        }, funcName: "viewSettings()"
      };
    }
    if (normalizedText.includes("next")) {
      return {
        intent: "NEXT", entity: null, action: () => {
          if (selectedRef.current) {
            openLogin();
          } else {
            const replyText = "Please select an accessibility mode first.";
            setAgentState(STATE_SPEAKING);
            setDebugStatus("Speaking...");
              console.log(`Assistant Speaking:\n"${replyText}"`);
            speakText(replyText, () => {
              setTimeout(() => { resumeListening(); }, 100);
            });
          }
        }, funcName: "goNext()"
      };
    }
    if (normalizedText.includes("back")) {
      return {
        intent: "BACK", entity: null, action: () => {
          setSelectedWithRef(null);
          const replyText = "Selection cleared.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          console.log(`Assistant Speaking:\n"${replyText}"`);
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        }, funcName: "goBack()"
      };
    }
    if (normalizedText.includes("repeat")) {
      return {
        intent: "REPEAT", entity: null, action: () => {
          handleOrbClick();
        }, funcName: "repeatInstructions()"
      };
    }
    if (normalizedText.includes("help")) {
      return {
        intent: "HELP", entity: null, action: () => {
          const replyText = "Supported commands are: Blind Mode, Motor Mode, Login, Sign Up, Home, Dashboard, Courses, Back, Repeat, and Help.";
          setAgentState(STATE_SPEAKING);
          setDebugStatus("Speaking...");
          console.log(`Assistant Speaking:\n"${replyText}"`);
          speakText(replyText, () => {
            setTimeout(() => { resumeListening(); }, 100);
          });
        }, funcName: "showHelp()"
      };
    }

    return null;
  }, [selectBlindMode, selectMotorMode, selectDeafMode, openLogin, openSignup, speakText, resumeListening, setSelectedWithRef, setAgentState, handleOrbClick, navigate, setLandingStep, selectMode, handleDemoLogin, landingStep]);


  // Speech Recognition Context Registration
  useEffect(() => {
    const unregister = registerContext("LANDING", (spokenText, confidence) => {
      setTranscript(spokenText);
      setDebugTranscript(spokenText);

      const normalized = normalizeTranscript(spokenText);
      setDebugNormalized(normalized);

      const intentObj = detectIntent(normalized);
      if (intentObj) {
        setDebugIntent(intentObj.intent);
        setDebugFunction(intentObj.funcName);
        setDebugResult("SUCCESS");
        intentObj.action();
      } else {
        const replyText = "I didn't understand that command. Please try again.";
        setDebugIntent("UNKNOWN");
        setDebugFunction("None");
        setDebugResult("ERROR");

        setAgentState(STATE_SPEAKING);
        setDebugStatus("Speaking...");
        speakText(replyText, () => {
          setTimeout(() => {
            resumeListening();
          }, 100);
        });
      }
    }, true);
    return unregister;
  }, [registerContext, normalizeTranscript, detectIntent, speakText, resumeListening, setAgentState, setTranscript]);





  const getStatusText = () => {
    switch (agentState) {
      case STATE_GREETING:
        return "AccessAI is greeting you...";
      case STATE_LISTENING:
        return "Listening (say 'blind mode' or 'motor mode')...";
      case STATE_PROCESSING:
        return "Processing command...";
      case STATE_SPEAKING:
        return "AccessAI is speaking...";
      default:
        return "Voice agent ready";
    }
  };

  const selectedMode = modes.find((m) => m.key === selected);
  const isListening = agentState === STATE_LISTENING;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#f0f6ff] text-slate-900 font-sans selection:bg-[#0066ff] selection:text-white">
      {/* ── Top Navbar ── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-16 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          {landingStep !== "language" && (
            <BackButton
              onClick={() => {
                if (landingStep === "mode") {
                  setLandingStep("role");
                } else {
                  setLandingStep("language");
                }
              }}
              fallback="/"
            />
          )}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <SparkleIcon className="w-6 h-6" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#0f172a]">Access</span>
              <span className="text-[#0066ff]">AI</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/verify")}
            className="px-3.5 py-1.5 rounded-full bg-[#f0f9ff] text-[#0284c7] border border-[#e0f2fe] text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs cursor-pointer hover:bg-sky-50"
            title="Verify course certificates anchored on MST Blockchain"
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span>Verify Credentials (MST)</span>
          </button>
          <LanguageSelector />
          {user && disabilityType ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 hidden md:inline">
                {user.displayName || user.email}
              </span>
              <button
                onClick={() => navigate(`/${disabilityType}`)}
                className="px-4 py-1.5 rounded-full bg-[#0066ff] text-white text-xs font-semibold hover:bg-blue-600 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                {t("dashboard", "Dashboard")}
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                {t("sign_out", "Sign Out")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setLandingStep("mode");
                setTimeout(() => {
                  const el = document.getElementById("modes-grid");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="px-4 py-1.5 rounded-full bg-[#0066ff] hover:bg-blue-600 text-white text-xs font-semibold active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              Select Mode
            </button>
          )}
          <button className="p-1 rounded-full text-[#4f5d75] hover:text-[#0066ff] transition-colors cursor-pointer" aria-label="Accessibility Settings">
            <span className="material-symbols-outlined !text-2xl text-[#5c6bc0]">accessibility_new</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-24 pb-32 px-6 md:px-12">
        {landingStep === "language" ? (
          <section className="max-w-5xl mx-auto flex flex-col items-center animate-fadeIn">
            {/* 2. Hero (centered) */}
            <div className="text-center mb-8 pt-4">
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <SparkleIcon className="w-8 h-8" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  <span className="text-[#0f172a]">Access</span>
                  <span className="text-[#0066ff]">AI</span>
                </h1>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] tracking-tight mb-2">
                Equal Access Real Opportunities.
              </h2>
              <p className="text-sm md:text-base text-[#64748b]">
                Choose your language and preferred accessibility mode to get started.
              </p>
            </div>

            {/* 3. Adaptive Modes Bar */}
            <div className="relative w-full max-w-3xl mx-auto mb-8">
              {/* Centered pill badge on top border */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="px-3 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-xs font-semibold border border-[#bae6fd] shadow-2xs whitespace-nowrap">
                  3 Adaptive Modes
                </span>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-[#f8fbff] px-8 py-3.5 flex items-center justify-between text-[#0f172a] text-sm font-semibold shadow-2xs">
                <div className="flex-1 flex items-center justify-center gap-2.5">
                  <span className="material-symbols-outlined text-[#0f172a] !text-2xl">hearing</span>
                  <span className="text-[#0f172a]">Deaf Mode</span>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex-1 flex items-center justify-center gap-2.5">
                  <span className="material-symbols-outlined text-[#0f172a] !text-2xl">visibility_off</span>
                  <span className="text-[#0f172a]">Blind Mode</span>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex-1 flex items-center justify-center gap-2.5">
                  <span className="material-symbols-outlined text-[#0f172a] !text-2xl">front_hand</span>
                  <span className="text-[#0f172a]">Hands -Free Mode</span>
                </div>
              </div>
            </div>

            {/* 4. Language cards (3 columns, equal gap) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-8 items-stretch">
              {/* Card 1: English (Selected state) */}
              <div
                onClick={() => setLanguage("en")}
                className={`rounded-2xl bg-white p-6 shadow-xs relative flex flex-col justify-between min-h-[220px] transition-all cursor-pointer ${
                  language === "en"
                    ? "border-2 border-[#0066ff]"
                    : "border border-slate-200 hover:border-blue-400"
                }`}
              >
                {language === "en" && (
                  <div className="absolute -top-3 right-6 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#0066ff] text-white text-[11px] font-bold tracking-wide shadow-2xs">
                      ✓ SELECTED
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-4xl font-extrabold text-[#0f172a] tracking-tight">
                      Eng
                    </div>
                    <UkFlag />
                  </div>
                  <div className="text-2xl font-bold text-[#000000]">English</div>
                  <p className="text-xs text-[#0066ff] font-medium mt-1">English (English (US))</p>
                </div>
                <div>
                  <div className="my-3 border-t border-slate-100"></div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#0066ff] hover:text-blue-700">
                    <span>Select English</span>
                    <span className="text-sm font-bold">→</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Hindi */}
              <div
                onClick={() => setLanguage("hi")}
                className={`rounded-2xl bg-white p-6 shadow-xs relative flex flex-col justify-between min-h-[220px] transition-all cursor-pointer ${
                  language === "hi"
                    ? "border-2 border-[#0066ff]"
                    : "border border-slate-200 hover:border-blue-400"
                }`}
              >
                {language === "hi" && (
                  <div className="absolute -top-3 right-6 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#0066ff] text-white text-[11px] font-bold tracking-wide shadow-2xs">
                      ✓ SELECTED
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-4xl font-extrabold text-[#0f172a] tracking-tight">hindi</div>
                    <IndiaFlag />
                  </div>
                  <div className="text-xl font-bold text-[#0f172a] mt-1">हिंदी</div>
                  <p className="text-xs text-[#0066ff] font-medium mt-0.5">Hin (हिंदी (भारत))</p>
                </div>
                <div>
                  <div className="my-3 border-t border-slate-100"></div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#0066ff] hover:text-blue-700">
                    <span>Select हिंदी</span>
                    <span className="text-sm font-bold">→</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Kannada */}
              <div
                onClick={() => setLanguage("kn")}
                className={`rounded-2xl bg-white p-6 shadow-xs relative flex flex-col justify-between min-h-[220px] transition-all cursor-pointer ${
                  language === "kn"
                    ? "border-2 border-[#0066ff]"
                    : "border border-slate-200 hover:border-blue-400"
                }`}
              >
                {language === "kn" && (
                  <div className="absolute -top-3 right-6 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#0066ff] text-white text-[11px] font-bold tracking-wide shadow-2xs">
                      ✓ SELECTED
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-4xl font-extrabold text-[#0f172a] tracking-tight">ka</div>
                    <IndiaFlag />
                  </div>
                  <div className="text-xl font-bold text-[#0f172a] mt-1">ಕನ್ನಡ</div>
                  <p className="text-xs text-[#0066ff] font-medium mt-0.5">Kannada (ಕನ್ನಡ (ಭಾರತ))</p>
                </div>
                <div>
                  <div className="my-3 border-t border-slate-100"></div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#0066ff] hover:text-blue-700">
                    <span>Select ಕನ್ನಡ</span>
                    <span className="text-sm font-bold">→</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : landingStep === "role" ? (
          <section className="max-w-5xl mx-auto flex flex-col items-center animate-fadeIn">
            {/* Header / Intro */}
            <div className="text-center mb-10 pt-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="px-3.5 py-1 rounded-full bg-blue-100 text-[#0066ff] text-xs font-bold tracking-wide uppercase">
                  Step 2 of 2: Select Role
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-3">
                Select Your Role
              </h1>
              <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Select your role to access your personalized learning environment or educator classroom portal.
              </p>
            </div>

            {/* 2-Card Grid: Student Login vs Teacher Login */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              {/* Student Card */}
              <div
                onClick={() => {
                  if (role === "teacher") logout();
                  setLandingStep("mode");
                }}
                className="group relative bg-white border-2 border-slate-200 hover:border-[#0066ff] rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066ff] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined !text-3xl">school</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#0066ff] transition-colors">
                      Student Login
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0066ff] text-[11px] font-bold">
                      Student Portal
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Personalized multi-modal learning portal tailored for Blind, Deaf, and Motor accessibility needs with conversational AI companions.
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="w-6 h-6 rounded-md bg-blue-100 text-[#0066ff] flex items-center justify-center text-xs shrink-0">🎙️</span>
                      <span>Voice-first assistant & natural interruption</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">🤟</span>
                      <span>3D Sign Language avatar & gesture camera</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center text-xs shrink-0">🎯</span>
                      <span>Hands-free head tracking & dwell clicks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (role === "teacher") logout();
                      setLandingStep("mode");
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#0066ff] hover:bg-blue-600 active:scale-98 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Continue as Student</span>
                    <span className="text-base font-bold">→</span>
                  </button>
                </div>
              </div>

              {/* Teacher Card */}
              <div
                onClick={() => navigate("/teacher/login")}
                className="group relative bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined !text-3xl">cast_for_education</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Teacher Login
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      Educator Portal
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Dedicated educator workspace to manage accessible courses, monitor real-time student progress, review assessments, and host interactive RN sessions.
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">👥</span>
                      <span>Real-time student roster & individual profiles</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center text-xs shrink-0">📈</span>
                      <span>Progress tracking & competency assessments</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center text-xs shrink-0">⚡</span>
                      <span>Realtime Network (RN) classroom broadcasting</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/teacher/login");
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#16a34a] hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Continue to Teacher Portal</span>
                    <span className="text-base font-bold">→</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="max-w-6xl mx-auto flex flex-col items-center animate-fadeIn w-full">
            {/* 2. Demo Account Banner (3 Separate Sibling Buttons in Non-Clickable Container) */}
            <div className="w-full max-w-6xl mx-auto rounded-2xl bg-[#f0f7ff] border border-[#cde3fe] p-4 md:p-5 mb-8 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3.5 flex-wrap">
                {/* Button 1: Demo Account Button (Left, largest) */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin(selectedDemoAcc ? selectedDemoAcc.mode : (selected || "blind"))}
                  aria-label={
                    selectedDemoAcc
                      ? `Log in with demo account for ${selectedDemoAcc.title}`
                      : "Log in with demo account"
                  }
                  className="flex-1 min-w-[280px] p-3 px-4 rounded-xl bg-white/80 hover:bg-white border border-[#cde3fe] hover:border-[#0066ff] shadow-2xs transition-all flex items-center justify-between gap-3 text-left group cursor-pointer active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-2"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#0066ff] flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        bolt
                      </span>
                    </div>
                    <div className="min-w-0">
                      {selectedDemoAcc ? (
                        <>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm md:text-base font-bold text-[#0066ff] truncate">
                              Demo Account: {selectedDemoAcc.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#dbeafe] text-[#0066ff] text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                              INSTANT
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">
                            Login as <strong className="text-slate-900 font-bold">{selectedDemoAcc.name}</strong> ({selectedDemoAcc.email})
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm md:text-base font-bold text-[#0066ff] truncate">
                              Explore with Demo Account
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#dbeafe] text-[#0066ff] text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                              FREE ACCESS
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                            Instant 1-click access without signup or password
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-[#0066ff] group-hover:translate-x-1 transition-transform shrink-0 pl-2">
                    <span className="text-xl font-bold">→</span>
                  </div>
                </button>

                {/* Button 2: Sign In Button */}
                <button
                  type="button"
                  onClick={handleLoginRedirect}
                  disabled={!selected}
                  className={`px-5 py-3.5 rounded-full font-bold text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-2 ${
                    selected
                      ? "bg-[#0066ff] hover:bg-blue-600 active:scale-95 text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                  aria-label={selected ? `Sign in to ${selected}` : "Sign In"}
                >
                  <span className="material-symbols-outlined !text-lg">login</span>
                  <span>Sign In</span>
                </button>

                {/* Button 3: Create Account Button */}
                <button
                  type="button"
                  onClick={handleSignupRedirect}
                  disabled={!selected}
                  className={`px-5 py-3.5 rounded-full font-bold text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-2 ${
                    selected
                      ? "bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-[#0f172a]"
                      : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                  aria-label={selected ? `Create account for ${selected}` : "Create Account"}
                >
                  <span className="material-symbols-outlined !text-lg text-[#0f172a]">person_add</span>
                  <span>Create Account</span>
                </button>
              </div>

              {/* Bottom Option: Select from all 3 demo accounts */}
              <div className="border-t border-[#d8e8fc] pt-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="flex items-center gap-1.5 font-bold text-[#0066ff] hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] rounded-md px-1"
                >
                  <span className="material-symbols-outlined !text-base text-[#0066ff]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    badge
                  </span>
                  <span>Select from all 3 demo accounts</span>
                </button>
                <span className="text-slate-400 font-normal">
                  No login credentials required
                </span>
              </div>
            </div>

            {/* 3. Hero (centered) */}
            <div className="text-center mb-8 pt-1">
              <div className="flex items-center justify-center gap-3 mb-2">
                <SparkleIcon className="w-8 h-8 md:w-9 md:h-9" />
                <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">
                  Welcome to <span className="text-[#0f172a]">Access</span><span className="text-[#0066ff]">AI</span>
                </h1>
              </div>
              <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                An AI-powered platform made for your sensory and mobility needs.
              </p>
              <p className="text-xs md:text-sm text-slate-500 font-normal mt-1">
                Choose a mode below to get started.
              </p>
            </div>

            {/* 4. Mode cards (3 columns, equal gap) */}
            <div id="modes-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-10 items-stretch">
              {/* Card 1: Blind & Low Vision */}
              <div
                onClick={() => selectMode("blind", true)}
                className={`rounded-2xl p-6 relative flex flex-col justify-between transition-all cursor-pointer ${
                  selected === "blind"
                    ? "border-2 border-[#0066ff] bg-white shadow-md"
                    : "border border-slate-200 bg-white hover:border-blue-300 shadow-xs"
                }`}
              >
                {selected === "blind" && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#0066ff] text-white text-[11px] font-bold tracking-wide shadow-2xs">
                      ✓ SELECTED
                    </span>
                  </div>
                )}
                <div>
                  <div className="w-20 h-20 rounded-2xl bg-[#e0efff] flex items-center justify-center text-[#0066ff] mb-5">
                    <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      visibility_off
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
                    Blind & Low Vision
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Get voice guidance and read text from your screen.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemoLogin("blind");
                    }}
                    className="w-full py-3 px-6 rounded-full bg-[#0066ff] hover:bg-blue-600 active:scale-[0.99] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start in this Mode</span>
                    <span className="text-base font-bold">→</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Deaf & Hard of Hearing */}
              <div
                onClick={() => selectMode("deaf", false)}
                className={`rounded-2xl p-6 relative flex flex-col justify-between transition-all cursor-pointer ${
                  selected === "deaf"
                    ? "border-2 border-[#10b981] bg-white shadow-md"
                    : "border border-[#c8f0d8] bg-[#f4fbf6] hover:border-emerald-300 shadow-2xs"
                }`}
              >
                {selected === "deaf" && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#10b981] text-white text-[11px] font-bold tracking-wide shadow-2xs">
                      ✓ SELECTED
                    </span>
                  </div>
                )}
                <div>
                  <div className="w-20 h-20 rounded-2xl bg-[#dbf7e6] flex items-center justify-center text-[#10b981] mb-5">
                    <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      hearing
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
                    Deaf & Hard of Hearing
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    See real-time captions and language support.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemoLogin("deaf");
                    }}
                    className="w-full py-3 px-6 rounded-full bg-[#dbf7e6] hover:bg-[#c3f0d4] active:scale-[0.99] text-[#059669] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start in this Mode</span>
                    <span className="text-base font-bold">→</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Motor & Mobility */}
              <div
                onClick={() => selectMode("motor", true)}
                className={`rounded-2xl p-6 relative flex flex-col justify-between transition-all cursor-pointer ${
                  selected === "motor"
                    ? "border-2 border-[#7c3aed] bg-white shadow-md"
                    : "border border-[#e6dbfd] bg-[#faf7ff] hover:border-purple-300 shadow-2xs"
                }`}
              >
                {selected === "motor" && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#7c3aed] text-white text-[11px] font-bold tracking-wide shadow-2xs">
                      ✓ SELECTED
                    </span>
                  </div>
                )}
                <div>
                  <div className="w-20 h-20 rounded-2xl bg-[#efe8ff] flex items-center justify-center text-[#7c3aed] mb-5">
                    <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      accessibility_new
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
                    Motor & Mobility
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Use hands-free tracking and customizable controls.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemoLogin("motor");
                    }}
                    className="w-full py-3 px-6 rounded-full bg-[#efe8ff] hover:bg-[#e4d7ff] active:scale-[0.99] text-[#7c3aed] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start in this Mode</span>
                    <span className="text-base font-bold">→</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Demo Accounts Selection Modal ── */}
      {showDemoModal && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
          onClick={() => setShowDemoModal(false)}
        >
          <div 
            className="bg-surface rounded-3xl p-6 md:p-8 max-w-lg w-full border border-outline-variant/30 shadow-2xl flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                </div>
                <div>
                  <h2 id="demo-modal-title" className="text-xl font-bold text-on-surface font-headline">
                    Instant Demo Accounts
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Select any profile below to immediately launch its adaptive dashboard.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                aria-label="Close demo modal"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.mode}
                  type="button"
                  onClick={() => {
                    setShowDemoModal(false);
                    selectMode(account.mode, false);
                    handleDemoLogin(account.mode);
                  }}
                  className="w-full text-left p-4 rounded-2xl border border-outline-variant/30 hover:border-primary bg-white/70 hover:bg-white transition-all shadow-sm flex items-center justify-between group cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-xl ${account.badgeBg} flex items-center justify-center text-current`}>
                      <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {account.icon}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">{account.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-surface-container-high text-on-surface-variant">
                          {account.name}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">{account.description}</p>
                      <p className="text-[11px] text-primary/80 font-mono mt-0.5">{account.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-primary font-bold text-xs pl-2 group-hover:translate-x-1 transition-transform">
                    <span>Enter</span>
                    <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-outline-variant/20 pt-3 flex justify-between items-center text-xs text-on-surface-variant/70">
              <span>All demo data is isolated to your local session</span>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="text-primary font-semibold hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom-left Voice Card ── */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
        {/* Round bright-blue mic button with a soft light halo ring */}
        <div className="p-1 rounded-full bg-blue-100/70 border border-blue-200/50 shadow-sm shrink-0">
          <button
            onClick={handleOrbClick}
            className="w-12 h-12 rounded-full bg-[#0066ff] hover:bg-blue-600 active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
            aria-label="Click to repeat voice instructions"
            title="Click to repeat instructions"
          >
            <span className="material-symbols-outlined !text-2xl">mic</span>
          </button>
        </div>

        {/* White rounded voice card with a soft shadow */}
        {showSpeechBubble && (
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-lg max-w-sm flex flex-col gap-2 relative text-slate-800">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-medium text-slate-800 leading-snug">
                {speechBubble ? `"${speechBubble}"` : `"${textToSpeak}"`}
              </p>
              <button
                onClick={() => setShowSpeechBubble(false)}
                className="text-[#0066ff] hover:text-blue-700 font-bold text-sm leading-none p-0.5 -mt-0.5 -mr-0.5 transition-colors cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-normal pt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0"></span>
              <span>Listening (say &quot;blind mode&quot; or &quot;motor mode&quot;)...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom-right Area: Continue Button & Debug Panel ── */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3.5">
        {landingStep === "language" && (
          <button
            type="button"
            onClick={() => setLandingStep("role")}
            className="px-6 py-3 rounded-2xl bg-[#0066ff] hover:bg-blue-600 active:scale-95 text-white text-xs md:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Continue to Role Selection</span>
            <span className="text-base font-bold">→</span>
          </button>
        )}

        {/* Debug Panel */}
        <div className="bg-[#101b2b] border border-slate-800 rounded-2xl p-3.5 shadow-2xl text-white font-mono text-[11px] w-52 flex flex-col gap-1.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="font-bold text-white text-xs font-sans tracking-tight">AccessAI Debug Panel</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.9)] animate-pulse shrink-0" />
          </div>
          <div className="flex flex-col gap-1 pt-0.5">
            <div>
              <span className="text-white">Status:</span>
              <span className="text-[#22c55e] font-semibold">{debugStatus || "Listening..."}</span>
            </div>
            <div>
              <span className="text-white">Transcript:</span>
              <span className="text-[#38bdf8]">"{debugTranscript || "none"}"</span>
            </div>
            <div>
              <span className="text-white">Normalized:</span>
              <span className="text-[#38bdf8]">"{debugNormalized || "none"}"</span>
            </div>
            <div>
              <span className="text-white">Intent:</span>
              <span className="text-[#f59e0b] font-semibold">{debugIntent || "None"}</span>
            </div>
            <div>
              <span className="text-white">Function:</span>
              <span className="text-[#cbd5e1]">{debugFunction || "None"}</span>
            </div>
            <div>
              <span className="text-white">Result:</span>
              <span className="text-white font-semibold">{debugResult || "None"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}