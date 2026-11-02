import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { useVoiceAssistant } from "../hooks/useVoice";
import { useHeadTracking } from "../hooks/useHeadTracking";
import HeadTrackingCursor from "../components/HeadTrackingCursor";
import { useMotorInteractionAdapter } from "../hooks/useMotorInteractionAdapter";
import { useWallet } from "../context/WalletContext";
import WalletBadge from "../components/WalletBadge";
import CertificateModal from "../components/CertificateModal";
import { getEffectiveStudentName } from "../utils/studentSession";
import CareerLearningPaths from "../components/CareerLearningPaths";
import DegreeGraduationOffer from "../components/DegreeGraduationOffer";
import RewardStoreModal from "../components/RewardStoreModal";
import BackButton from "../components/BackButton";

// ── MOCK DATA MATCHING PLATFORM ──
const MOCK_COURSES = [
  {
    id: "course-1",
    title: "Introduction to Python",
    description: "Learn the fundamentals of Python programming, including variables, loops, and functions with motor-adaptive code editors.",
    video: "rfscVS0vtbw",
    category: "programming",
    instructor: "Dr. Angela Yu, Coding Educator",
    duration: "2h 15m",
    level: "Beginner",
    rating: 4.9,
    badge: "Motor-Friendly",
    lessons: [
      { id: "les-1-1", title: "Python Setup & Variables", content: "Write your first Python print statement. Practice assigning variables and using standard screen keyboards.", duration: "15 mins", video: "rfscVS0vtbw" },
      { id: "les-1-2", title: "Control Flow & Conditionals", content: "Learn if-else blocks. Indentation is key in Python. AccessAI simplifies indentation with layout guides.", duration: "25 mins", video: "rfscVS0vtbw" },
      { id: "les-1-3", title: "Loops & Iterations", content: "Understand for and while loops. Loop control is demonstrated using step-by-step dwell tracing.", duration: "30 mins", video: "rfscVS0vtbw" },
      { id: "les-1-4", title: "Functions & Logic", content: "Define reusable blocks of code using def. Pass parameters and return values easily.", duration: "35 mins", video: "rfscVS0vtbw" }
    ],
    quiz: {
      question: "Which keyword is used to define a function in Python?",
      options: ["function", "def", "func", "define"],
      answer: "def"
    }
  },
  {
    id: "course-2",
    title: "Java Programming Basics",
    description: "Master object-oriented programming in Java. Build robust console applications using adaptive switch selectors.",
    video: "xk4_1vTe768",
    category: "programming",
    instructor: "John Baugh, Java Specialist",
    duration: "3h 10m",
    level: "Beginner",
    rating: 4.8,
    badge: "Switch-Ready",
    lessons: [
      { id: "les-2-1", title: "Hello World & Java Syntax", content: "Write class definitions, main method entry point, and system output structures.", duration: "25 mins", video: "xk4_1vTe768" },
      { id: "les-2-2", title: "Object-Oriented Concepts", content: "Define classes, instantiate objects, and access properties using public getters and setters.", duration: "35 mins", video: "xk4_1vTe768" },
      { id: "les-2-3", title: "Inheritance & Polymorphism", content: "Extend parent classes to override methods. Practice typing inheritance keywords with gaze gestures.", duration: "40 mins", video: "xk4_1vTe768" },
      { id: "les-2-4", title: "Exception Handling", content: "Use try-catch blocks to capture runtime errors and handle program crashes safely.", duration: "30 mins", video: "xk4_1vTe768" }
    ],
    quiz: {
      question: "Which keyword is used to establish inheritance between classes in Java?",
      options: ["implements", "inherits", "extends", "super"],
      answer: "extends"
    }
  },
  {
    id: "course-3",
    title: "Database Management & SQL",
    description: "Learn to design relational databases, write SQL queries, and manage database records with structured tables.",
    video: "HXV3zeQKqGY",
    category: "databases",
    instructor: "David Vance, DB Architect",
    duration: "2h 45m",
    level: "Intermediate",
    rating: 4.7,
    badge: "Dwell-Optimized",
    lessons: [
      { id: "les-3-1", title: "Relational DB Foundations", duration: "20 mins", content: "Understand tables, rows, columns, and keys. Differentiate between primary keys and foreign keys.", video: "HXV3zeQKqGY" },
      { id: "les-3-2", title: "Writing SELECT Queries", duration: "30 mins", content: "Extract columns, filter records with WHERE clauses, and sort outputs using ORDER BY statements.", video: "HXV3zeQKqGY" },
      { id: "les-3-3", title: "SQL Joins Demystified", duration: "40 mins", content: "Combine records from multiple tables using INNER JOIN, LEFT JOIN, and RIGHT JOIN conditions.", video: "HXV3zeQKqGY" }
    ],
    quiz: {
      question: "Which clause is used to filter records in a SQL SELECT query?",
      options: ["GROUP BY", "HAVING", "WHERE", "ORDER BY"],
      answer: "WHERE"
    }
  },
  {
    id: "course-4",
    title: "Web Development Basics",
    description: "Build responsive websites using modern HTML, CSS, and interactive JavaScript interfaces.",
    video: "kUMe1FH4CHE",
    category: "development",
    instructor: "Sarah Jenkins, Frontend Lead",
    duration: "3h 40m",
    level: "Advanced",
    rating: 4.6,
    badge: "Voice-Controlled",
    lessons: [
      { id: "les-4-1", title: "HTML Page Structure", duration: "45 mins", content: "Create document skeletons, head metadata, and body containers for web pages.", video: "kUMe1FH4CHE" },
      { id: "les-4-2", title: "Styling with CSS", duration: "50 mins", content: "Apply color schemes, fonts, and box-model padding using cascading style sheets.", video: "kUMe1FH4CHE" },
      { id: "les-4-3", title: "JavaScript Interactivity", duration: "55 mins", content: "Add event listeners to DOM elements to trigger functions on button clicks.", video: "kUMe1FH4CHE" }
    ],
    quiz: {
      question: "Which HTML5 element represents the main content of a document?",
      options: ["<content>", "<section>", "<main>", "<body>"],
      answer: "<main>"
    }
  },
  {
    id: "prem-course-ai",
    title: "Advanced Neural-Adaptive AI Systems & Computer Vision",
    description: "Master deep neural network perception, multi-modal gesture tracking, and real-time computer vision for assistive neuro-adaptive interfaces.",
    video: "DBQINq0SsAw",
    category: "programming",
    instructor: "Dr. Elena Rostova, AI Research Fellow",
    duration: "3h 45m",
    level: "Advanced",
    rating: 4.95,
    badge: "Premium Course",
    pointsCost: 100,
    isPremium: true,
    lessons: [
      { id: "pai-1", title: "Neural Architectures for Accessibility", duration: "45 mins", content: "Convolutional neural networks tailored for assistive perception and keypoint extraction.", video: "DBQINq0SsAw" },
      { id: "pai-2", title: "Real-Time Keypoint Landmark Inference", duration: "55 mins", content: "Sub-millisecond inference pipelines using WebAssembly and WebGL execution graphs.", video: "DBQINq0SsAw" },
      { id: "pai-3", title: "Multi-Modal Sensor Integration & Latency", duration: "1h", content: "Fusing camera frames with IMU and microphone signals with minimal buffering delay.", video: "DBQINq0SsAw" },
      { id: "pai-4", title: "Deploying Edge AI Models in Browser WebGL", duration: "1h 05m", content: "Client-side deployment, quantization to FP16, and on-device privacy guarantees.", video: "DBQINq0SsAw" }
    ],
    quiz: {
      question: "Which inference pipeline delivers minimal latency for in-browser computer vision on low-power devices?",
      options: ["Server-side Cloud WebSockets", "Client-side WebAssembly / WebGL", "Batch MapReduce Workers", "High-frequency Long Polling"],
      answer: "Client-side WebAssembly / WebGL"
    }
  },
  {
    id: "prem-course-wcag",
    title: "Full-Stack Accessibility Engineering & WCAG 2.2 AAA",
    description: "Comprehensive engineering for WCAG 2.2 AAA compliance, assistive keyboard trees, ARIA live region management, and cognitive accommodations.",
    video: "rfscVS0vtbw",
    category: "development",
    instructor: "Marcus Vance, Accessibility Architect",
    duration: "4h 10m",
    level: "Advanced",
    rating: 5.0,
    badge: "Certified Masterclass",
    pointsCost: 100,
    isPremium: true,
    lessons: [
      { id: "pwc-1", title: "Semantic Trees, Shadow DOM & Accessibility APIs", duration: "50 mins", content: "Building bulletproof semantic trees and exposing proper roles through the accessibility tree.", video: "rfscVS0vtbw" },
      { id: "pwc-2", title: "Live Region Synchronization & Screen Reader Audio", duration: "1h", content: "Using aria-live polite and assertive channels without auditory collision.", video: "rfscVS0vtbw" },
      { id: "pwc-3", title: "Focus Trapping, Modal Inertness & Spatial Navigation", duration: "1h 05m", content: "Implementing focus loops, restoring focus upon dismissal, and using inert HTML attributes.", video: "rfscVS0vtbw" },
      { id: "pwc-4", title: "Automated CI/CD Accessibility Auditing & axe-core", duration: "1h 15m", content: "Integrating automated axe-core accessibility gates directly into pull request pipelines.", video: "rfscVS0vtbw" }
    ],
    quiz: {
      question: "What is the primary function of the inert attribute on background elements when an accessible modal opens?",
      options: ["Applies a dark backdrop filter", "Prevents screen reader virtual navigation and focus reaching background content", "Mutes all background media players", "Stops CSS transitions"],
      answer: "Prevents screen reader virtual navigation and focus reaching background content"
    }
  },
  {
    id: "prem-course-web3",
    title: "Applied Cryptography & Smart Contract Security on MST",
    description: "Develop and audit decentralized ERC-721 credential contracts, cryptographic SHA-256 merkle trees, and reentrancy-safe state architectures on MST Blockchain.",
    video: "71360000000",
    category: "programming",
    instructor: "Dr. Angela Yu & Blockchain Core Team",
    duration: "4h 30m",
    level: "Advanced",
    rating: 4.9,
    badge: "Specialist Track",
    pointsCost: 120,
    isPremium: true,
    lessons: [
      { id: "pbc-1", title: "Cryptographic Hash Trees & Data Integrity", duration: "55 mins", content: "Merkle verification, sha256 checksums, and on-chain tamper detection.", video: "71360000000" },
      { id: "pbc-2", title: "ERC-721 URI Storage & Gas Optimization on MST", duration: "1h 10m", content: "Storing immutable token metadata and gas-efficient storage slots.", video: "71360000000" },
      { id: "pbc-3", title: "Preventing Nonce Desynchronization in Production", duration: "1h 05m", content: "Managing transaction nonces and mempool pending states reliably.", video: "71360000000" },
      { id: "pbc-4", title: "Formal Verification & Reentrancy Guards", duration: "1h 20m", content: "Auditing smart contracts against reentrancy, integer anomalies, and unauthorized calls.", video: "71360000000" }
    ],
    quiz: {
      question: "Why is the Checks-Effects-Interactions pattern critical in smart contract state modification?",
      options: ["Reduces EVM bytecode size", "Prevents reentrancy attacks where external calls execute before internal state updates", "Increases gas refunds", "Generates deterministic token IDs"],
      answer: "Prevents reentrancy attacks where external calls execute before internal state updates"
    }
  }
];

// ── Text-to-Speech Engine ──
function useTTS() {
  const { speak, stop, agentState } = useVoiceAssistant();
  const speaking = agentState === "SPEAKING";

  const speakText = useCallback((text, priority = false) => {
    speak(text);
  }, [speak]);

  return { speak: speakText, stop, speaking };
}

// ── Dwell-click Engine ──
const DWELL_MS = 5000; // 5.0 seconds auto-select

function useDwell(enabled, onActivate, dwellDuration = DWELL_MS) {
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const [dwellEl, setDwellEl] = useState(null);
  const [progress, setProgress] = useState(0);

  const start = useCallback((el, cb) => {
    if (!enabled) return;
    setDwellEl(el);
    setProgress(0);
    const start = Date.now();
    const duration = dwellDuration || DWELL_MS;
    progressRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / duration) * 100);
      setProgress(pct);
    }, 25);
    timerRef.current = setTimeout(() => {
      clearInterval(progressRef.current);
      setDwellEl(null);
      setProgress(0);
      cb();
    }, duration);
  }, [enabled, dwellDuration]);

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);
    setDwellEl(null);
    setProgress(0);
  }, []);

  return { start, cancel, dwellEl, progress };
}

// ── Voice Commands Engine ──
function useVoiceCommands(commands, active) {
  const { registerContext, transcript, listening, setTranscript } = useVoiceAssistant();
  const commandsRef = useRef(commands);
  const contextIdRef = useRef(`MOTOR_DASHBOARD_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  useEffect(() => {
    const unregister = registerContext(contextIdRef.current, (spokenText) => {
      setTranscript(spokenText);
      let text = spokenText.toLowerCase().trim();
      
      const fillers = ["take me to", "navigate to", "go to", "open", "show", "my", "the"];
      fillers.forEach(f => {
        text = text.replace(new RegExp(`\\b${f}\\b`, "g"), "").trim();
      });

      // Sort patterns by length descending so longer/more specific phrases match first
      const sortedEntries = Object.entries(commandsRef.current).sort(
        (a, b) => b[0].length - a[0].length
      );

      let matched = false;
      for (const [pattern, handler] of sortedEntries) {
        // Prevent "lock" from erroneously matching "unlock"
        if (pattern === "lock" && text.includes("unlock")) {
          continue;
        }
        if (text.includes(pattern)) {
          handler(spokenText);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        const originalText = spokenText.toLowerCase().trim();
        for (const [pattern, handler] of sortedEntries) {
          if (pattern === "lock" && originalText.includes("unlock")) {
            continue;
          }
          if (originalText.includes(pattern)) {
            handler(spokenText);
            break;
          }
        }
      }
    }, active);
    return () => unregister();
  }, [registerContext, active, setTranscript]);

  return { listening, transcript };
}

// ── Switch scanning hook (SPACE or TAB to scan focus) ──
function useSwitchScan(enabled, containerRef, focusedIndex, setFocusedIndex) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const getFocusable = () => Array.from(
      containerRef.current.querySelectorAll('button:not([disabled]), input, select, [tabindex="0"]')
    );
    const onKey = (e) => {
      if (e.key === " " || e.key === "Tab") {
        e.preventDefault();
        const els = getFocusable();
        if (!els.length) return;
        const nextIdx = (focusedIndex + 1) % els.length;
        setFocusedIndex(nextIdx);
        els[nextIdx].focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const els = getFocusable();
        if (els[focusedIndex]) {
          els[focusedIndex].click();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, containerRef, focusedIndex, setFocusedIndex]);
}

// ── DwellButton (Dark Premium SaaS styled) ──
function DwellButton({ label, sublabel, icon, onClick, active = false, color = "indigo", size = "normal", dwellEnabled, dwell, speak, disabled = false }) {
  const id = useRef(Math.random().toString(36).slice(2));
  const isLarge = size === "large";

  const handleEnter = () => {
    if (disabled) return;
    if (speak) speak(`${label}. ${sublabel || ""}`);
    dwell.start(id.current, onClick);
  };

  const ringColorMap = {
    indigo: "border-indigo-100 hover:border-indigo-400 bg-indigo-50/50 text-indigo-700",
    cyan: "border-cyan-100 hover:border-cyan-400 bg-cyan-50/50 text-cyan-700",
    green: "border-green-100 hover:border-green-400 bg-green-50/50 text-green-700",
    amber: "border-amber-200 hover:border-amber-400 bg-amber-50 text-amber-800",
    red: "border-red-100 hover:border-red-400 bg-red-50/50 text-red-700"
  };

  const activeColorMap = {
    indigo: "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10",
    cyan: "bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/10",
    green: "bg-green-600 text-white border-green-600 shadow-md shadow-green-600/10",
    amber: "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/10",
    red: "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/10"
  };

  const overlayMap = {
    indigo: "bg-indigo-600/10",
    cyan: "bg-cyan-600/10",
    green: "bg-green-600/10",
    amber: "bg-amber-600/15",
    red: "bg-red-600/10"
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={dwell.cancel}
      onFocus={() => speak && speak(`${label}. ${sublabel || ""}`)}
      data-switchable
      className={`w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-200 outline-none text-left relative overflow-hidden select-none ${
        disabled 
          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" 
          : active 
            ? activeColorMap[color] 
            : `bg-white border-slate-100 text-slate-700 hover:text-slate-900 ${ringColorMap[color]}`
      } ${isLarge ? "py-6 px-5 min-h-[120px]" : "py-4 px-4 min-h-[80px]"}`}
    >
      {/* Visual dwell progress */}
      {dwellEnabled && dwell.dwellEl === id.current && (
        <div 
          className={`absolute left-0 top-0 bottom-0 transition-all duration-[25ms] ease-linear z-0 ${overlayMap[color]}`}
          style={{ width: `${dwell.progress}%` }}
        />
      )}

      {/* Button contents */}
      <div className="relative z-10 flex flex-col items-center gap-1.5 text-center w-full">
        {icon && <span className="material-symbols-outlined !text-2xl">{icon}</span>}
        <span className="text-sm font-bold tracking-wide">{label}</span>
        {sublabel && <span className="text-[10px] opacity-75 font-medium">{sublabel}</span>}
      </div>

      {/* Dwell timer countdown visual bar */}
      {dwellEnabled && dwell.dwellEl === id.current && (
        <div className="absolute bottom-1 left-4 right-4 h-1 bg-white/10 rounded-full overflow-hidden z-10">
          <div 
            className="h-full bg-cyan-400 rounded-full" 
            style={{ width: `${dwell.progress}%`, transition: "width 0.03s linear" }}
          />
        </div>
      )}
    </button>
  );
}

export default function MotorDashboard() {
  const { user, logout, DEMO_MODE } = useAuth();
  const {
    account: walletAccount,
    rewardPoints,
    connect,
    refreshPoints,
    availablePoints,
    unlockedItems: walletUnlockedItems,
    openStore,
  } = useWallet();
  const { speak, stop, speaking } = useTTS();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync activeTab state with URL subpaths
  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const tab = pathParts[1] || "home";
    setActiveTab(tab);
    if (tab !== "courses" && tab !== "my-learning" && tab !== "home" && tab !== "rewards-store") {
      setSelectedCourse(null);
      setActiveCoursePlay(null);
    }
  }, [location.pathname]);

  // UI Theme Config (Light theme optimized for motor mode readability)
  const bgClass = "bg-[#f8fafc] text-slate-800";
  const sidebarClass = "bg-slate-50 border-slate-200 text-slate-800 border-r";
  const cardClass = "bg-white border border-slate-200 shadow-sm text-slate-700";
  const innerCardClass = "bg-slate-50 border border-slate-200/60";
  const textTitleClass = "text-slate-900";
  const textSubtitleClass = "text-slate-500";
  const borderClass = "border-slate-200";
  const inputClass = "bg-white border border-slate-300 text-slate-900";

  // Dashboard state tabs
  const [activeTab, setActiveTab] = useState("home"); // home, courses, my-learning, ai-tutor, activity, profile, settings
  const [selectedCourse, setSelectedCourse] = useState(null); // Course detail overlay
  const [activeCoursePlay, setActiveCoursePlay] = useState(null); // Player view
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);

  const isOverview = activeTab === "home" && !selectedCourse && !activeCoursePlay;

  const handleBackClick = () => {
    if (activeCoursePlay || selectedCourse) {
      setActiveCoursePlay(null);
      setSelectedCourse(null);
      speak("Returned to previous course view.");
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number" &&
      window.history.state.idx > 0
    ) {
      navigate(-1);
    } else {
      navigate("/motor", { replace: true });
    }
  };

  const isCourseUnlocked = (cId) => {
    return purchasedIds.includes(cId) || (walletUnlockedItems && walletUnlockedItems.includes(cId));
  };

  const handleLaunchCourse = (course) => {
    setSelectedCourse(course);
    setActiveCoursePlay(course);
    setCurrentLessonIdx(0);
    setActiveTab("courses");
    speak(`Launching course player for ${course.title}.`);
  };

  const navigateTo = (tab, spokenNotice) => {
    setActiveTab(tab);
    navigate(`/motor/${tab === "home" ? "" : tab}`);
    if (spokenNotice) speak(spokenNotice, true);
  };

  // Search and lists
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [purchasedIds, setPurchasedIds] = useState(["course-1", "course-2"]);
  const [progress, setProgress] = useState({
    "course-1": { completion: 75 },
    "course-2": { completion: 25 }
  });

  // AI Tutor chat states
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello! I am your AccessAI Motor-Adaptive Tutor. Click on prompt cards or type using voice assistant to discuss programming topics and generate quizzes!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiTutorTab, setAiTutorTab] = useState("chat"); // chat, homework, quiz-gen
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [earnedCertData, setEarnedCertData] = useState(null);
  const [topicCertificates, setTopicCertificates] = useState(() => {
    try {
      const stored = localStorage.getItem("accessai_topic_certs_motor");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [issuingCert, setIssuingCert] = useState(false);
  const [careerCertificates, setCareerCertificates] = useState(() => {
    try {
      const stored = localStorage.getItem("accessai_career_certs_motor");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync earned certificates from backend
  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const uId = user?.uid || "demo-uid-motor";
        const [res, cRes] = await Promise.all([
          API.get(`/progress/certificates/${uId}`),
          API.get(`/career/certificates/${uId}`).catch(() => ({ data: { certificates: [] } })),
        ]);
        if (res.data?.topicCertificates?.length > 0) {
          setTopicCertificates(res.data.topicCertificates);
          localStorage.setItem("accessai_topic_certs_motor", JSON.stringify(res.data.topicCertificates));
        }
        const backendCareerCerts = cRes.data?.certificates || res.data?.careerCertificates || [];
        if (backendCareerCerts.length > 0) {
          setCareerCertificates(backendCareerCerts);
          localStorage.setItem("accessai_career_certs_motor", JSON.stringify(backendCareerCerts));
        }
      } catch (e) {
        // demo / local fallback
      }
    };
    fetchCerts();
  }, [user?.uid]);

  // Settings states
  const [dwellEnabled, setDwellEnabled] = useState(true);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const [voiceActive, setVoiceActive] = useState(true);
  const [cursorSize, setCursorSize] = useState("xl"); // normal, xl, xxl
  const [fontSize, setFontSize] = useState("large"); // medium, large, x-large

  // Head Tracking (real MediaPipe-powered)
  const headTracking = useHeadTracking();
  const mainScrollRef = useRef(null);

  // Automatically start head tracking & virtual cursor upon entering Motor Mode
  useEffect(() => {
    if (!headTracking.enabled) {
      headTracking.setEnabled(true);
    }
  }, []); // Run on mount

  // Smooth scroll utility for both container and window
  const scrollContentBy = useCallback((deltaY, smooth = true) => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollBy({
        top: deltaY,
        behavior: smooth ? "smooth" : "auto",
      });
    }
    if (typeof window !== "undefined") {
      window.scrollBy({
        top: deltaY,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Cursor-based auto scroll: when virtual cursor moves near bottom or top edges, scroll smoothly
  useEffect(() => {
    if (!headTracking.enabled || headTracking.locked || !headTracking.cursorPos) return;

    let animId = null;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const y = headTracking.cursorPos.y;
    const x = headTracking.cursorPos.x;

    // Only scroll within the main content area (right of sidebar)
    const isInContentColumn = x > 280;
    const bottomThreshold = vh - 90;
    const topThreshold = 80;

    let scrollDelta = 0;
    if (isInContentColumn && y >= bottomThreshold) {
      const intensity = Math.min(1, (y - bottomThreshold) / 60);
      scrollDelta = Math.round(5 + intensity * 15); // 5px to 20px per frame down
    } else if (isInContentColumn && y <= topThreshold) {
      const intensity = Math.min(1, (topThreshold - y) / 60);
      scrollDelta = -Math.round(5 + intensity * 15); // 5px to 20px per frame up
    }

    if (scrollDelta !== 0) {
      const step = () => {
        if (mainScrollRef.current) {
          mainScrollRef.current.scrollTop += scrollDelta;
        }
        if (typeof window !== "undefined") {
          window.scrollBy(0, scrollDelta);
        }
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [headTracking.cursorPos, headTracking.enabled, headTracking.locked]);

  // Eye-tracking simulator calibration (legacy sim, kept for compat)
  const [eyeTrackingState, setEyeTrackingState] = useState("calibrated"); // disabled, calibrating, calibrated
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [cursorSimPos, setCursorSimPos] = useState({ x: 100, y: 100 });

  // Switch scan index tracker
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef(null);
  const announcedRef = useRef(false);
  const [dwellMs, setDwellMs] = useState(5000); // 5.0 seconds auto-select

  // Hooks setup
  const dwell = useDwell(dwellEnabled, () => {}, dwellMs);
  useSwitchScan(switchEnabled, containerRef, focusedIndex, setFocusedIndex);

  // Motor interaction adapter bridges virtual cursor to existing dwell engine without duplicate engines
  const motorAdapter = useMotorInteractionAdapter({
    cursorPos: headTracking.cursorPos,
    enabled: headTracking.enabled && dwellEnabled,
    dwellEngine: dwell,
    dwellDuration: dwellMs,
    containerRef,
  });

  // Cursor lock/unlock keyboard shortcuts (Space or 'L')
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.code === "Space" || e.key === "l" || e.key === "L") {
        if (headTracking.enabled) {
          e.preventDefault();
          const nextLocked = headTracking.toggleCursorLock();
          speak(nextLocked ? "Cursor movement locked." : "Cursor movement unlocked.");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [headTracking, speak]);

  // Handle accessible audio announcements when cursor is unlocked by head or eye gesture
  useEffect(() => {
    if (!headTracking.tracker) return;
    headTracking.tracker.onGestureUnlock = (reason) => {
      const gestureName = reason === "gesture_eye" ? "eye gesture" : "head gesture";
      speak(`Cursor unlocked by ${gestureName}.`);
    };
    return () => {
      if (headTracking.tracker) {
        headTracking.tracker.onGestureUnlock = null;
      }
    };
  }, [headTracking.tracker, speak]);

  // Load backend data if not in demo mode
  useEffect(() => {
    if (DEMO_MODE) return;
    const fetchDB = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          API.get("/courses"),
          API.get(`/progress/${user?.uid}`)
        ]);
        if (cRes.data?.courses?.length > 0) {
          const motorCourses = cRes.data.courses.filter(c => 
            c.category === "programming" || 
            c.category === "databases" || 
            c.category === "development"
          );
          if (motorCourses.length > 0) setCourses(motorCourses);
        }
        if (pRes.data?.progress) {
          const pMap = {};
          pRes.data.progress.forEach(p => { pMap[p.courseId] = p; });
          setProgress(pMap);
        }
      } catch (e) {
        console.warn("Could not load backend courses. Using mock datasets.", e);
      }
    };
    fetchDB();
  }, [user?.uid, DEMO_MODE]);

  // Voice greeting on first render
  useEffect(() => {
    if (!announcedRef.current) {
      announcedRef.current = true;
      setTimeout(() => {
        speak(`Welcome to your AccessAI learning dashboard, Aman. All inputs support motor-dwell click timers. Switch scanning is available. Say help at any time to list verbal shortcuts.`, true);
      }, 800);
    }
  }, [speak]);

  // Calibration sequence simulation
  const startCalibration = () => {
    setEyeTrackingState("calibrating");
    setCalibrationProgress(0);
    let cur = 0;
    const interval = setInterval(() => {
      cur += 20;
      setCalibrationProgress(cur);
      if (cur >= 100) {
        clearInterval(interval);
        setEyeTrackingState("calibrated");
        speak("Eye tracking calibration completed successfully.");
      }
    }, 400);
  };

  // Cursor overlay simulation
  useEffect(() => {
    const handleMove = (e) => {
      setCursorSimPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Marketplace actions
  const handleBuyCourse = (courseId) => {
    if (purchasedIds.includes(courseId)) return;
    setPurchasedIds(prev => [...prev, courseId]);
    setProgress(prev => ({ ...prev, [courseId]: { completion: 0 } }));
    speak("Course enrolled. You can now start learning.");
  };

  const updateProgress = async (courseId, pct) => {
    setProgress(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], completion: pct }
    }));

    if (pct === 100) {
      const cObj = courses.find(c => c.id === courseId) || {};
      const activeWallet = walletAccount || localStorage.getItem("accessai_wallet_address");
      const studentName = getEffectiveStudentName(user, "motor");
      const cleanCourse = courseId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const cleanUid = ((user?.uid || "MOTOR01").replace(/[^a-zA-Z0-9]/g, "")).slice(0, 6).toUpperCase();
      const fallbackCert = {
        certificateId: `CERT-${cleanCourse}-${cleanUid}`,
        courseName: cObj.title || courseId,
        studentName,
        pointsAwarded: 50,
      };

      try {
        const res = await API.post("/progress", {
          userId: user?.uid || "demo-uid-motor",
          courseId,
          courseTitle: cObj.title || courseId,
          courseName: cObj.title || courseId,
          studentName,
          completion: 100,
          walletAddress: activeWallet || undefined,
        });

        const bData = res.data?.blockchain;
        const certInfo = bData || fallbackCert;

        setProgress(prev => ({
          ...prev,
          [courseId]: { ...prev[courseId], completion: 100, blockchain: certInfo }
        }));
        refreshPoints?.();
        setEarnedCertData(certInfo);
      } catch (err) {
        console.error("Failed to persist progress:", err);
        setProgress(prev => ({
          ...prev,
          [courseId]: { ...prev[courseId], completion: 100, blockchain: fallbackCert }
        }));
        setEarnedCertData(fallbackCert);
      }
    }
  };

  const handleTopicQuizSubmit = async (opt) => {
    if (!activeCoursePlay) return;
    const isCorrect = opt === activeCoursePlay.quiz.answer;
    if (isCorrect) {
      speak("Correct! Minting your personalized NFT topic certificate on MST Testnet.", true);
      const currentLesson = activeCoursePlay.lessons[currentLessonIdx] || {
        id: `topic-${currentLessonIdx + 1}`,
        title: `Topic ${currentLessonIdx + 1}`,
      };
      const studentName = getEffectiveStudentName(user, "motor");
      const activeWallet = walletAccount || localStorage.getItem("accessai_wallet_address");

      setIssuingCert(true);
      try {
        const res = await API.post("/progress/topic", {
          userId: user?.uid || "demo-uid-motor",
          courseId: activeCoursePlay.id,
          courseTitle: activeCoursePlay.title,
          topicId: currentLesson.id,
          topicTitle: currentLesson.title,
          studentName,
          walletAddress: activeWallet || undefined,
        });

        const bData = res.data?.blockchain || res.data?.certificate;
        if (bData) {
          setTopicCertificates(prev => {
            const exists = prev.some(tc => tc.certificateId === bData.certificateId);
            const updated = exists ? prev : [bData, ...prev];
            localStorage.setItem("accessai_topic_certs_motor", JSON.stringify(updated));
            return updated;
          });
          setEarnedCertData(bData);
        }
      } catch (err) {
        console.warn("Topic cert issue failed, fallback locally:", err);
        const cleanCourse = activeCoursePlay.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const cleanTopic = currentLesson.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const cleanUid = ((user?.uid || "MOTOR01").replace(/[^a-zA-Z0-9]/g, "")).slice(0, 6).toUpperCase();
        const fallbackTopicCert = {
          certificateId: `CERT-${cleanCourse}-${cleanTopic}-${cleanUid}`,
          courseName: activeCoursePlay.title,
          topicName: currentLesson.title,
          studentName,
          pointsAwarded: 0,
          type: "topic",
        };
        setTopicCertificates(prev => [fallbackTopicCert, ...prev]);
        setEarnedCertData(fallbackTopicCert);
      } finally {
        setIssuingCert(false);
      }

      const nextPct = Math.round(((currentLessonIdx + 1) / activeCoursePlay.lessons.length) * 100);
      updateProgress(activeCoursePlay.id, nextPct);
    } else {
      speak("Incorrect. Try another selection.", true);
    }
  };

  // AI Tutor operations
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    setTimeout(() => {
      let responseText = "Understood. The motor adaptive framework translates complex wrist triggers into binary switch scanning sequences.";
      const query = chatInput.toLowerCase();
      if (query.includes("python") || query.includes("code") || query.includes("programming")) {
        responseText = "Python is highly readable and great for motor-adaptive coding. AccessAI supports coding exercises optimized for switch scanning.";
      } else if (query.includes("java") || query.includes("oop")) {
        responseText = "Java is a class-based, object-oriented language. Try using our voice dictation tools to write boilerplate Java classes.";
      } else if (query.includes("dbms") || query.includes("sql") || query.includes("database")) {
        responseText = "Database Management Systems (DBMS) organize table schemas. Write SELECT queries using switch keys or eye-gaze selections.";
      } else if (query.includes("calibration") || query.includes("eye")) {
        responseText = "Eye-tracking is configured with a 1.4 second dwell. You can shorten this dwell duration in your Accessibility Settings tab.";
      } else if (query.includes("quiz")) {
        responseText = "Let's begin the quiz. Question: Which keyword defines a function in Python? Options: function, def, var, or func.";
      }
      setChatMessages(prev => [...prev, { sender: "ai", text: responseText }]);
      speak(responseText);
    }, 1000);
  };

  const handleQuickQuestion = (qText) => {
    setChatInput(qText);
    setTimeout(() => handleSendMessage(), 150);
  };

  // Filters catalog
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || c.category === category;
    const matchesDifficulty = difficulty === "all" || c.level.toLowerCase() === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Global voice shortcuts
  const { listening, transcript } = useVoiceCommands({
    "home": () => { navigate("/motor"); speak("Navigating to Home Dashboard."); },
    "degree": () => { navigate("/motor/degree-offer"); speak("Navigating to Academic Honors Degree Pathway Offer. Complete 5 major certificates to earn your degree diploma and 500 bonus points."); },
    "honors degree": () => { navigate("/motor/degree-offer"); speak("Navigating to Academic Honors Degree Pathway Offer."); },
    "graduation": () => { navigate("/motor/degree-offer"); speak("Navigating to Academic Honors Degree Pathway Offer."); },
    "career": () => { navigate("/motor/career-paths"); speak("Navigating to Career Paths."); },
    "career paths": () => { navigate("/motor/career-paths"); speak("Navigating to Career Paths."); },
    "course": () => { navigate("/motor/courses"); speak("Navigating to Courses."); },
    "library": () => { navigate("/motor/courses"); speak("Navigating to Courses."); },
    "learning": () => { navigate("/motor/my-learning"); speak("Navigating to Enrolled Courses."); },
    "tutor": () => { navigate("/motor/ai-tutor"); speak("Navigating to AI Tutor."); },
    "activity": () => { navigate("/motor/activity"); speak("Navigating to Activity Dashboard."); },
    "certificate": () => { navigate("/motor/profile"); speak("Navigating to Profile."); },
    "profile": () => { navigate("/motor/profile"); speak("Navigating to Profile."); },
    "setting": () => { navigate("/motor/settings"); speak("Navigating to Accessibility Settings."); },
    "turn on dwell": () => { setDwellEnabled(true); speak("Dwell click timers activated."); },
    "turn off dwell": () => { setDwellEnabled(false); speak("Dwell click timers deactivated."); },
    "turn on switch": () => { setSwitchEnabled(true); speak("Switch navigation activated."); },
    "turn off switch": () => { setSwitchEnabled(false); speak("Switch navigation deactivated."); },
    // ── Head tracking voice commands ──
    "turn on head tracking": () => {
      headTracking.setEnabled(true);
      speak("Head tracking activated. Move your head to control the cursor. Open your mouth to click.");
    },
    "enable head tracking": () => {
      headTracking.setEnabled(true);
      speak("Head tracking enabled.");
    },
    "turn off head tracking": () => {
      headTracking.setEnabled(false);
      speak("Head tracking deactivated.");
    },
    "disable head tracking": () => {
      headTracking.setEnabled(false);
      speak("Head tracking disabled.");
    },
    "recalibrate": () => {
      headTracking.recalibrate();
      speak("Head tracking recalibrated. Keep your head in a neutral position.");
    },
    "lock": () => {
      headTracking.lockCursor();
      speak("Cursor movement locked.");
    },
    "lock cursor": () => {
      headTracking.lockCursor();
      speak("Cursor movement locked.");
    },
    "lock pointer": () => {
      headTracking.lockCursor();
      speak("Cursor movement locked.");
    },
    "freeze cursor": () => {
      headTracking.lockCursor();
      speak("Cursor movement locked.");
    },
    "unlock": () => {
      headTracking.unlockCursor("voice");
      speak("Cursor movement unlocked.");
    },
    "unlock cursor": () => {
      headTracking.unlockCursor("voice");
      speak("Cursor movement unlocked.");
    },
    "unlock pointer": () => {
      headTracking.unlockCursor("voice");
      speak("Cursor movement unlocked.");
    },
    "unfreeze cursor": () => {
      headTracking.unlockCursor("voice");
      speak("Cursor movement unlocked.");
    },
    "toggle cursor lock": () => {
      const isLocked = headTracking.toggleCursorLock();
      speak(isLocked ? "Cursor locked." : "Cursor unlocked.");
    },
    "scroll down": () => {
      scrollContentBy(380, true);
      speak("Scrolling down.");
    },
    "scroll up": () => {
      scrollContentBy(-380, true);
      speak("Scrolling up.");
    },
    "scroll to bottom": () => {
      scrollContentBy(2500, true);
      speak("Scrolling to bottom.");
    },
    "scroll bottom": () => {
      scrollContentBy(2500, true);
      speak("Scrolling to bottom.");
    },
    "scroll to top": () => {
      scrollContentBy(-2500, true);
      speak("Scrolling to top.");
    },
    "scroll top": () => {
      scrollContentBy(-2500, true);
      speak("Scrolling to top.");
    },
    "page down": () => {
      scrollContentBy(500, true);
      speak("Page down.");
    },
    "page up": () => {
      scrollContentBy(-500, true);
      speak("Page up.");
    },
    "switch mode": () => {
      speak("Opening mode selection.");
      navigate("/");
    },
    "change mode": () => {
      speak("Opening mode selection.");
      navigate("/");
    },
    "modes": () => {
      speak("Opening mode selection.");
      navigate("/");
    },
    "three modes": () => {
      speak("Opening mode selection.");
      navigate("/");
    },
    "points": () => {
      if (rewardPoints !== undefined && rewardPoints !== null) {
        speak(`You have ${rewardPoints} reward points earned on MST Blockchain.`);
      } else {
        speak("Connect your BridgeKey wallet to view on-chain reward points.");
      }
    },
    "my points": () => {
      if (rewardPoints !== undefined && rewardPoints !== null) {
        speak(`You have ${rewardPoints} reward points earned on MST Blockchain.`);
      } else {
        speak("Connect your BridgeKey wallet to view on-chain reward points.");
      }
    },
    "rewards": () => navigateTo("rewards-store", `Navigated to Rewards Store and Marketplace. You have ${availablePoints !== undefined ? availablePoints : 550} points available.`),
    "store": () => navigateTo("rewards-store", `Navigated to Rewards Store and Marketplace. You have ${availablePoints !== undefined ? availablePoints : 550} points available.`),
    "rewards store": () => navigateTo("rewards-store", `Navigated to Rewards Store. Available balance: ${availablePoints !== undefined ? availablePoints : 550} points.`),
    "shop": () => navigateTo("rewards-store", "Navigated to Rewards Store."),
    "redeem": () => navigateTo("rewards-store", "Navigated to Rewards Store. Browse items to redeem with your points."),
    "buy course": () => navigateTo("rewards-store", "Navigated to Rewards Store. You can redeem premium courses with your reward points."),
    "spend points": () => navigateTo("rewards-store", `Navigated to Rewards Store. You have ${availablePoints !== undefined ? availablePoints : 550} points available to spend.`),
    "verify": () => {
      speak("Navigating to Certificate Verification page.");
      navigate("/verify");
    },
    "verify certificate": () => {
      speak("Navigating to Certificate Verification page.");
      navigate("/verify");
    },
    "connect wallet": () => {
      speak("Connecting BridgeKey wallet.");
      connect();
    },
    "sign out": () => {
      speak("Logging you out. Returning to mode selection.");
      logout();
      navigate("/");
    },
    "help": () => speak("Shortcuts: home, courses, learning, tutor, settings, points, verify certificate, connect wallet, scroll down, scroll up, switch mode, turn on head tracking, recalibrate, lock, unlock, turn on dwell, sign out.")
  }, voiceActive && !speaking);

  // Initial Greeting & Idle Prompt Logic
  useEffect(() => {
    // Greet immediately on dashboard load
    const name = user?.displayName || "student";
    speak(`Welcome ${name}. You are on the Home Dashboard. You have 2 active courses, a 7-day learning streak, and one lesson ready to continue. Say 'Courses', 'Continue Learning', 'AI Tutor', or 'Help' to begin.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Wait until assistant is not speaking to start idle timer
    if (speaking) return;

    // Start 15s idle timer
    const idleTimer = setTimeout(() => {
      speak("I'm still here. Say 'Help' to hear the options again.");
    }, 15000);

    return () => clearTimeout(idleTimer);
  }, [speaking, transcript, speak]);

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen ${bgClass} font-sans flex relative overflow-hidden ${
        fontSize === "x-large" ? "text-lg" : fontSize === "large" ? "text-base" : "text-sm"
      }`}
    >
      {/* SaaS background blur design elements */}
      <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Head Tracking Cursor Overlay ── */}
      <HeadTrackingCursor
        cursorPos={headTracking.cursorPos}
        dwellProgress={dwell.dwellEl ? dwell.progress : motorAdapter.dwellProgress}
        dwellTarget={dwell.dwellEl || motorAdapter.currentTarget}
        currentTarget={motorAdapter.currentTarget}
        status={headTracking.status}
        errorMsg={headTracking.errorMsg}
        locked={headTracking.locked}
        onToggleLock={headTracking.toggleCursorLock}
      />

      {/* Simulated Eye-Tracking Cursor follow dot (legacy sim) */}
      {!headTracking.enabled && eyeTrackingState === "calibrated" && cursorSize !== "normal" && (
        <div 
          className={`fixed pointer-events-none rounded-full bg-cyan-400/25 border border-cyan-400/80 z-[9999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-100 ${
            cursorSize === "xxl" ? "w-16 h-16" : "w-10 h-10"
          }`}
          style={{ left: cursorSimPos.x, top: cursorSimPos.y }}
        >
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        </div>
      )}

      {/* ── LEFT SIDEBAR: LARGE ACCESSIBLE TARGETS ── */}
      <aside className={`w-80 flex flex-col justify-between sticky top-0 h-screen z-50 backdrop-blur-xl ${sidebarClass}`}>
        <div className="p-6 flex flex-col gap-8">
          {/* Logo & Mode pill */}
          <div 
            onClick={() => navigate("/")}
            title="Return to AccessAI 3 Modes selection"
            className="flex flex-col gap-2 cursor-pointer group"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">AccessAI</span>
            <span className="self-start text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-700 border border-cyan-500/25 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Motor Mode • Click to change
            </span>
          </div>

          {/* Large sidebar targets */}
          <nav className="flex flex-col gap-3">
            {[
              { id: "home", label: "Home Dashboard", icon: "home", sub: 'say "go to home"' },
              { id: "degree-offer", label: "Honors Degree (Offer)", icon: "school", sub: 'say "go to degree"' },
              { id: "career-paths", label: "Career Paths", icon: "workspace_premium", sub: 'say "go to career"' },
              { id: "rewards-store", label: "Rewards Store (Redeem)", icon: "storefront", sub: 'say "go to store"' },
              { id: "courses", label: "Course Library", icon: "grid_view", sub: 'say "go to courses"' },
              { id: "my-learning", label: "My Enrolled", icon: "menu_book", sub: 'say "go to learning"' },
              { id: "ai-tutor", label: "AI Tutor Support", icon: "smart_toy", sub: 'say "go to tutor"' },
              { id: "activity", label: "Study Progress", icon: "analytics", sub: 'say "go to activity"' },
              { id: "profile", label: "Profile & Badges", icon: "account_circle", sub: 'say "go to profile"' },
              { id: "settings", label: "Settings Adaptive", icon: "tune", sub: 'say "go to settings"' }
            ].map(item => (
              <DwellButton
                key={item.id}
                label={item.label}
                sublabel={item.sub}
                icon={item.icon}
                active={activeTab === item.id && !selectedCourse && !activeCoursePlay}
                color="cyan"
                dwellEnabled={dwellEnabled}
                dwell={dwell}
                speak={speak}
                onClick={() => navigate(`/motor/${item.id === "home" ? "" : item.id}`)}
              />
            ))}
          </nav>
        </div>

        {/* Footer profile & actions */}
        <div className={`p-6 border-t ${borderClass} flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm">
              AH
            </div>
            <div>
              <p className="text-xs font-semibold">Aman Halkude</p>
              <p className="text-[10px] text-slate-500">Adaptive User</p>
            </div>
          </div>
          <DwellButton
            label="Switch Mode"
            sublabel='say "switch mode"'
            icon="swap_horiz"
            color="indigo"
            dwellEnabled={dwellEnabled}
            dwell={dwell}
            speak={speak}
            onClick={() => {
              speak("Opening mode selection to choose from all 3 modes.");
              navigate("/");
            }}
          />
          <DwellButton
            label="Sign Out"
            sublabel='say "sign out"'
            icon="logout"
            color="red"
            dwellEnabled={dwellEnabled}
            dwell={dwell}
            speak={speak}
            onClick={() => {
              speak("Signing you out.");
              logout();
              navigate("/");
            }}
          />
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main ref={mainScrollRef} className="flex-1 min-h-screen overflow-y-auto p-8 relative z-10 flex flex-col gap-6">
        
        {/* Top Navbar Status indicators */}
        <div className={`flex justify-between items-center ${cardClass} p-4 rounded-2xl`}>
          <div className="flex gap-4 items-center flex-wrap">
            {!isOverview && (
              <BackButton
                fallback="/motor"
                onClick={handleBackClick}
              />
            )}
            {voiceActive && listening && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Mic Listening
              </div>
            )}
            {/* Head Tracking status badge */}
            {(headTracking.status === "ready" || headTracking.status === "active") && (
              <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                Head Tracking Active
              </div>
            )}
            {/* Cursor & Voice scroll badge */}
            <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="material-symbols-outlined text-sm">unfold_more</span>
              <span>Scroll: Move Cursor to Edge or say "Scroll Down"</span>
            </div>
            {/* Lock / Unlock Cursor Movement Toggle */}
            {(headTracking.status === "ready" || headTracking.status === "active") && (
              <button
                type="button"
                onClick={() => {
                  const next = headTracking.toggleCursorLock();
                  speak(next ? "Cursor movement locked." : "Cursor movement unlocked.");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  headTracking.locked
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/20"
                    : "bg-slate-800/80 border-white/10 text-slate-300 hover:border-violet-500/40 hover:text-white"
                }`}
                title="Lock or unlock cursor position (Shortcut: Space or L)"
              >
                <span>{headTracking.locked ? "🔒" : "🔓"}</span>
                <span>{headTracking.locked ? "Cursor: LOCKED (Space to Unlock)" : "Lock Cursor"}</span>
              </button>
            )}
            {/* Dwell Selection duration badge */}
            {dwellEnabled && (
              <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-xl text-xs font-bold">
                <span className="material-symbols-outlined text-sm">timer</span>
                Auto-Select: 5.0s Dwell
              </div>
            )}
            {(headTracking.status === "loading" || headTracking.status === "initializing") && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" style={{borderTop:'2px solid transparent',borderRadius:'50%'}} />
                Head Tracking Loading…
              </div>
            )}
            {(headTracking.status === "no-camera" || headTracking.status === "permission-denied" || headTracking.status === "unavailable") && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold">
                Camera Access Denied / Unavailable
              </div>
            )}
            {!headTracking.enabled && eyeTrackingState === "calibrated" && (
              <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 px-3 py-1.5 rounded-xl text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                Gaze Sim Active
              </div>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <WalletBadge />
            <button
              onClick={() => setVoiceActive(v => !v)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                voiceActive ? "bg-cyan-600 border-cyan-500 text-white" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}
            >
              {voiceActive ? "Voice Assistant: ON" : "Voice Assistant: OFF"}
            </button>
            <button
              onClick={() => setDwellEnabled(d => !d)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                dwellEnabled ? "bg-cyan-600 border-cyan-500 text-white" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}
            >
              {dwellEnabled ? "Dwell Clicks: ON" : "Dwell Clicks: OFF"}
            </button>
          </div>
        </div>

        {voiceActive && transcript && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-4 rounded-xl text-xs font-semibold">
            Heard Command: "{transcript}"
          </div>
        )}

        {/* 1. HOME DASHBOARD VIEW */}
        {activeTab === "home" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            {/* Greeting card banner */}
            <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 border border-slate-200 p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
              <div className="flex flex-col gap-2 max-w-xl">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome, Aman!</h1>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Start your lessons effortlessly. Every element reacts when you rest your gaze or hover. Need help? Say "help" to activate speech controls.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex flex-col items-center shadow-sm">
                  <span className="text-2xl font-bold text-yellow-600">7🔥</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Study Streak</span>
                </div>
                <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex flex-col items-center shadow-sm">
                  <span className="text-2xl font-bold text-cyan-600">25m</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Today</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl flex flex-col gap-3 ${cardClass}`}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600">workspace_premium</span>
                  Daily Progress
                </h3>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Goal: 30 minutes</span>
                  <span>83%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: "83%" }} />
                </div>
              </div>

              <div className={`p-6 rounded-2xl flex flex-col gap-3 ${cardClass}`}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600">task_alt</span>
                  Course Progress
                </h3>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>2 Owned Courses</span>
                  <span>50% average</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: "50%" }} />
                </div>
              </div>

              <div className={`p-6 rounded-2xl flex flex-col justify-between gap-4 ${cardClass}`}>
                <div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-base">smart_toy</span> AI Tutor Help
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">Generate a quiz verbally or upload code.</p>
                </div>
                <DwellButton
                  label="Launch AI Tutor"
                  color="indigo"
                  dwellEnabled={dwellEnabled}
                  dwell={dwell}
                  onClick={() => setActiveTab("ai-tutor")}
                />
              </div>
            </div>

            {/* Resume Learning section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold tracking-tight">Continue Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.filter(c => purchasedIds.includes(c.id)).map(course => {
                  const pct = progress[course.id]?.completion || 0;
                  return (
                    <div key={course.id} className={`p-6 rounded-2xl flex flex-col justify-between gap-6 ${cardClass}`}>
                      <div>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-cyan-500/10 text-cyan-700 rounded border border-cyan-500/20">{course.level}</span>
                        <h3 className="text-base font-bold mt-2 text-slate-900">{course.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-500">Completion</span>
                          <span className="text-cyan-600 font-bold">{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                          <div className="h-full bg-cyan-500" style={{ width: `${pct}%` }} />
                        </div>
                        <DwellButton
                          label="Resume Course"
                          color="cyan"
                          dwellEnabled={dwellEnabled}
                          dwell={dwell}
                          onClick={() => { setActiveCoursePlay(course); setCurrentLessonIdx(0); }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations & Calibration section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl flex flex-col gap-4 ${cardClass}`}>
                <h3 className="text-sm font-bold text-slate-900">Recommended for you</h3>
                <div className="flex flex-col gap-3">
                  {courses.filter(c => !purchasedIds.includes(c.id)).slice(0, 2).map(course => (
                    <div 
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-cyan-500 rounded-xl flex justify-between items-center cursor-pointer transition-all shadow-sm text-slate-800"
                    >
                      <div>
                        <h4 className="text-xs font-bold line-clamp-1">{course.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{course.instructor} · {course.duration}</p>
                      </div>
                      <span className="material-symbols-outlined text-cyan-600">arrow_forward</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calibration card helper */}
              <div className={`p-6 rounded-2xl flex flex-col justify-between gap-4 ${cardClass}`}>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-900">
                    <span className="material-symbols-outlined text-cyan-600">face</span> Eye Tracking Simulation
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Simulate eye tracking calibration. Clicking starts eye tracking overlays.
                  </p>
                </div>

                {eyeTrackingState === "calibrating" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Calibrating gaze metrics...</span>
                      <span>{calibrationProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${calibrationProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <DwellButton
                    label="Calibrate Gazepoint Tracker"
                    color="cyan"
                    dwellEnabled={dwellEnabled}
                    dwell={dwell}
                    onClick={startCalibration}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC HONORS DEGREE VIEW */}
        {activeTab === "degree-offer" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <DegreeGraduationOffer
              mode="motor"
              dwellEnabled={dwellEnabled}
              dwell={dwell}
              speak={speak}
              cardClass={cardClass}
              innerCardClass={innerCardClass}
              textTitleClass={textTitleClass}
            />
          </div>
        )}

        {/* CAREER LEARNING PATHS VIEW */}
        {activeTab === "career-paths" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <CareerLearningPaths
              mode="motor"
              dwellEnabled={dwellEnabled}
              dwell={dwell}
              speak={speak}
              cardClass={cardClass}
              innerCardClass={innerCardClass}
              textTitleClass={textTitleClass}
            />
          </div>
        )}

        {/* REWARDS STORE & MARKETPLACE VIEW */}
        {activeTab === "rewards-store" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <RewardStoreModal
              embedded={true}
              onLaunchCourse={handleLaunchCourse}
              mode="motor"
            />
          </div>
        )}

        {/* 2. COURSE LIBRARY VIEW */}
        {activeTab === "courses" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${textTitleClass}`}>Explore Course Catalog</h1>
              <p className="text-xs text-slate-500">Oversized dwell cards enable easy course discovery and enrollment.</p>
            </div>

            {/* Academic Honors Degree Pathway Offer Banner */}
            <DegreeGraduationOffer
              mode="motor"
              dwellEnabled={dwellEnabled}
              dwell={dwell}
              speak={speak}
              cardClass={cardClass}
              innerCardClass={innerCardClass}
              textTitleClass={textTitleClass}
            />

            {/* Categories filter boxes - NOT small dropdowns */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${innerCardClass} p-4 rounded-2xl`}>
              {[
                { id: "all", label: "📚 All Classes" },
                { id: "programming", label: "💻 Python & Java" },
                { id: "databases", label: "🗄️ Database & SQL" },
                { id: "development", label: "🌐 Web Dev Basics" }
              ].map(cat => (
                <DwellButton
                  key={cat.id}
                  label={cat.label}
                  active={category === cat.id}
                  color="cyan"
                  dwellEnabled={dwellEnabled}
                  dwell={dwell}
                  onClick={() => setCategory(cat.id)}
                />
              ))}
            </div>

            {/* Search target */}
            <div className={`p-4 rounded-xl flex items-center gap-3 ${cardClass}`}>
              <span className="material-symbols-outlined text-slate-550">search</span>
              <input 
                type="text" 
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none border-none text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Catalog list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCourses.map(course => {
                const isOwned = isCourseUnlocked(course.id);
                return (
                  <div 
                    key={course.id}
                    className={`rounded-2xl overflow-hidden hover:border-cyan-500 transition-all flex flex-col justify-between ${cardClass}`}
                  >
                    <div className="p-6 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="self-start text-[9px] uppercase font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">{course.badge}</span>
                        {course.isPremium && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-400/40">
                            ⭐ {course.pointsCost} PTS
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold leading-snug text-slate-900">{course.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                        <span>Lvl: {course.level}</span>
                        <span>Rating: ⭐ {course.rating}</span>
                      </div>
                    </div>
                    <div className={`p-6 border-t ${borderClass} flex flex-col gap-2`}>
                      <DwellButton
                        label="View Syllabus Details"
                        color="cyan"
                        dwellEnabled={dwellEnabled}
                        dwell={dwell}
                        onClick={() => setSelectedCourse(course)}
                      />
                      {isOwned ? (
                        <DwellButton
                          label="Start Learning (Enrolled)"
                          color="green"
                          dwellEnabled={dwellEnabled}
                          dwell={dwell}
                          onClick={() => { setActiveCoursePlay(course); setCurrentLessonIdx(0); }}
                        />
                      ) : course.isPremium ? (
                        <DwellButton
                          label={`⭐ Unlock for ${course.pointsCost} PTS`}
                          color="amber"
                          dwellEnabled={dwellEnabled}
                          dwell={dwell}
                          onClick={() => { openStore ? openStore() : navigateTo("rewards-store", `Opening rewards store to unlock ${course.title}.`); }}
                        />
                      ) : (
                        <DwellButton
                          label="Enroll ($9.99)"
                          color="green"
                          dwellEnabled={dwellEnabled}
                          dwell={dwell}
                          onClick={() => handleBuyCourse(course.id)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. MY LEARNING VIEW */}
        {activeTab === "my-learning" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your Enrolled Courses</h1>
              <p className="text-xs text-slate-400">Launch learning players or submit review feedback verbally.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.filter(c => isCourseUnlocked(c.id)).map(course => {
                const pct = progress[course.id]?.completion || 0;
                return (
                  <div key={course.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>{course.instructor}</span>
                        <span className="text-cyan-400">{course.level}</span>
                      </div>
                      <h3 className="text-lg font-bold mt-2">{course.title}</h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3">{course.description}</p>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <div className="flex justify-between text-xs mb-2">
                        <span>Completion Rate</span>
                        <span className="font-bold text-cyan-400">{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-cyan-500" style={{ width: `${pct}%` }} />
                      </div>
                      <DwellButton
                        label="Launch Adaptive Player"
                        color="cyan"
                        dwellEnabled={dwellEnabled}
                        dwell={dwell}
                        onClick={() => { setActiveCoursePlay(course); setCurrentLessonIdx(0); }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. COURSE DETAILS VIEW */}
        {selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-8 animate-fadeIn max-w-4xl mx-auto w-full">
            <DwellButton
              label="◀ Back to library"
              color="indigo"
              dwellEnabled={dwellEnabled}
              dwell={dwell}
              onClick={() => setSelectedCourse(null)}
            />

            <div className="bg-gradient-to-br from-indigo-900/60 to-slate-950/40 border border-white/5 p-8 rounded-3xl flex flex-col gap-4">
              <span className="self-start text-xs font-semibold px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded border border-cyan-500/20">{selectedCourse.badge}</span>
              <h1 className="text-3xl font-extrabold">{selectedCourse.title}</h1>
              <p className="text-slate-300 text-sm leading-relaxed">{selectedCourse.description}</p>
              
              <div className="flex gap-6 text-xs text-slate-400 border-t border-white/5 pt-4">
                <span>Instructor: {selectedCourse.instructor}</span>
                <span>Rating: ⭐ {selectedCourse.rating}</span>
                <span>Duration: {selectedCourse.duration}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 flex flex-col gap-4">
                <h3 className="text-lg font-bold">Curriculum Syllabus</h3>
                <div className="flex flex-col gap-3">
                  {selectedCourse.lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="p-4 bg-slate-900/35 border border-white/5 rounded-xl flex justify-between items-center">
                      <span className="text-sm font-semibold">0{idx + 1}. {lesson.title}</span>
                      <span className="text-xs text-slate-500">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Motor Accessibility</h4>
                  <ul className="text-xs text-slate-400 flex flex-col gap-2.5">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-cyan-400 !text-sm">check_circle</span> Large hover dwell areas</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-cyan-400 !text-sm">check_circle</span> Switch keyboard cycling</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-cyan-400 !text-sm">check_circle</span> Voice assist navigations</li>
                  </ul>
                </div>

                <DwellButton
                  label={purchasedIds.includes(selectedCourse.id) ? "Start Learning" : "Enroll Now ($9.99)"}
                  color="green"
                  dwellEnabled={dwellEnabled}
                  dwell={dwell}
                  onClick={() => {
                    if (!purchasedIds.includes(selectedCourse.id)) {
                      handleBuyCourse(selectedCourse.id);
                    }
                    setActiveCoursePlay(selectedCourse);
                    setCurrentLessonIdx(0);
                    setSelectedCourse(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. COURSE PLAYER & LESSON PAGE */}
        {activeCoursePlay && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-5xl mx-auto w-full">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <DwellButton
                label="✕ Close Player"
                color="red"
                dwellEnabled={dwellEnabled}
                dwell={dwell}
                onClick={() => setActiveCoursePlay(null)}
              />
              <div className="text-right text-xs">
                <p className="text-slate-500 font-bold">Lesson {currentLessonIdx + 1} of {activeCoursePlay.lessons.length}</p>
                <p className="text-cyan-400 font-extrabold">{activeCoursePlay.lessons[currentLessonIdx].title}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Media Player */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="relative aspect-video bg-[#000] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${activeCoursePlay.lessons[currentLessonIdx].video}?autoplay=1&enablejsapi=1&rel=0&controls=1`} 
                    title={activeCoursePlay.lessons[currentLessonIdx].title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-none"
                  />
                </div>

                {/* Oversized lesson player controllers */}
                <div className="grid grid-cols-2 gap-4">
                  <DwellButton
                    label="◀ Previous Lesson"
                    sublabel='say "previous"'
                    disabled={currentLessonIdx === 0}
                    color="indigo"
                    dwellEnabled={dwellEnabled}
                    dwell={dwell}
                    onClick={() => setCurrentLessonIdx(i => i - 1)}
                  />
                  <DwellButton
                    label="Next Lesson ▶"
                    sublabel='say "next"'
                    disabled={currentLessonIdx === activeCoursePlay.lessons.length - 1}
                    color="cyan"
                    dwellEnabled={dwellEnabled}
                    dwell={dwell}
                    onClick={() => {
                      setCurrentLessonIdx(i => i + 1);
                      const nextProgress = Math.round(((currentLessonIdx + 1) / activeCoursePlay.lessons.length) * 100);
                      updateProgress(activeCoursePlay.id, nextProgress);
                    }}
                  />
                </div>
              </div>

              {/* Quiz and interactive widgets */}
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-base">quiz</span> Quiz Check
                  </h4>
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed">{activeCoursePlay.quiz.question}</p>
                  
                  {/* Selectable quiz answers in large targets */}
                  <div className="flex flex-col gap-2 mt-2">
                    {activeCoursePlay.quiz.options.map((opt, i) => (
                      <DwellButton
                        key={i}
                        label={opt}
                        color="cyan"
                        dwellEnabled={dwellEnabled}
                        dwell={dwell}
                        disabled={issuingCert}
                        onClick={() => handleTopicQuizSubmit(opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-tr from-indigo-950/40 to-slate-900/35 border border-indigo-500/10 p-6 rounded-2xl flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-base">auto_awesome</span> AI Lesson Explainer
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This course unit explains programming concepts. Rest your cursor target on option cards to select the correct answer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. AI TUTOR VIEW */}
        {activeTab === "ai-tutor" && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-4xl mx-auto w-full h-[calc(100vh-140px)]">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">AccessAI Adaptive Tutor</h1>
                <p className="text-xs text-slate-400 font-medium">Use large triggers or voice dictation to generate custom review questions.</p>
              </div>

              <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-white/5 gap-2">
                {[
                  { id: "chat", label: "Chat bot", icon: "forum" },
                  { id: "homework", label: "Upload Code", icon: "school" },
                  { id: "quiz-gen", label: "Gen Quiz", icon: "quiz" }
                ].map(subTab => (
                  <button
                    key={subTab.id}
                    onClick={() => setAiTutorTab(subTab.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      aiTutorTab === subTab.id ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="material-symbols-outlined !text-sm">{subTab.icon}</span>
                    {subTab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chatbot view */}
            {aiTutorTab === "chat" && (
              <div className="flex-1 flex flex-col justify-between gap-4 overflow-hidden">
                {/* Large suggested prompt triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-white/5">
                  <DwellButton
                    label="Explain Eye Calibration"
                    color="indigo"
                    dwellEnabled={dwellEnabled}
                    dwell={dwell}
                    onClick={() => handleQuickQuestion("Explain Eye Calibration setting")}
                  />
                  <DwellButton
                    label="Explain Python function definition syntax"
                    color="indigo"
                    dwellEnabled={dwellEnabled}
                    dwell={dwell}
                    onClick={() => handleQuickQuestion("Explain Python function syntax")}
                  />
                </div>

                {/* Dialog messages */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 pr-2">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-cyan-600 text-white font-medium rounded-tr-none"
                          : "bg-slate-900/60 border border-white/5 text-slate-300 rounded-tl-none flex gap-3 items-start"
                      }`}>
                        {msg.sender === "ai" && <span className="material-symbols-outlined text-cyan-400 !text-sm mt-0.5">smart_toy</span>}
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Text entry field */}
                <div className="flex gap-3 bg-slate-900/50 border border-white/5 p-3 rounded-2xl items-center">
                  <button 
                    onClick={() => setIsVoiceChatActive(v => !v)}
                    className={`p-3 rounded-xl transition-all ${
                      isVoiceChatActive ? "bg-emerald-600 text-white animate-pulse" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="material-symbols-outlined !text-lg">settings_voice</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Ask tutor something..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-transparent text-xs outline-none text-white"
                  />
                  <button onClick={handleSendMessage} className="p-3 bg-cyan-600 text-white rounded-xl">
                    <span className="material-symbols-outlined !text-sm">send</span>
                  </button>
                </div>
              </div>
            )}

            {/* Homework submission view */}
            {aiTutorTab === "homework" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400">upload_file</span>
                    Submit Code / File
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Submit adaptive scripts or homework answers. Hover trigger allows file selection.
                  </p>

                  <div 
                    onClick={() => speak("Drag files here or hover click to select locally.")}
                    className="border-2 border-dashed border-white/10 hover:border-cyan-500/25 rounded-2xl p-12 text-center bg-slate-955/20 cursor-pointer flex flex-col items-center gap-2"
                  >
                    <span className="material-symbols-outlined !text-4xl text-slate-600 animate-pulse">cloud_upload</span>
                    <span className="text-xs font-semibold text-slate-300">Gaze here to select local files</span>
                    <span className="text-[10px] text-slate-650">File size max 50MB</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quiz gen */}
            {aiTutorTab === "quiz-gen" && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-6 animate-fadeIn">
                <div>
                  <h3 className="text-base font-bold">Generate Practice Questions</h3>
                  <p className="text-xs text-slate-400">Generate a custom motor-friendly review check.</p>
                </div>
                <DwellButton
                  label="Create Programming Quiz"
                  color="cyan"
                  dwellEnabled={dwellEnabled}
                  dwell={dwell}
                  onClick={() => {
                    setChatMessages(prev => [...prev, { sender: "ai", text: "New Quiz Compiled: What does SQL stand for? (Options: Structured Query Language, Simple Query Language, System Query Language)" }]);
                    setAiTutorTab("chat");
                    speak("Practice exam generated. Check tutor chat.");
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 7. ACTIVITY DASHBOARD VIEW */}
        {activeTab === "activity" && (
          <div className="flex flex-col gap-8 animate-fadeIn max-w-5xl mx-auto w-full">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Study Activity</h1>
              <p className="text-xs text-slate-400">Track weekly focus minutes and consistency parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily activity chart (Bar chart) */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Minutes</h3>
                
                <div className="flex justify-between items-end h-48 px-4 mt-6">
                  {[
                    { day: "Mon", min: 15, h: "25%" },
                    { day: "Tue", min: 45, h: "75%" },
                    { day: "Wed", min: 30, h: "50%" },
                    { day: "Thu", min: 10, h: "15%" },
                    { day: "Fri", min: 60, h: "100%" },
                    { day: "Sat", min: 25, h: "40%" },
                    { day: "Sun", min: 40, h: "65%" }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                      <div className="relative w-8 bg-slate-950 border border-white/5 rounded-md h-36 flex items-end">
                        <div className="w-full bg-gradient-to-t from-cyan-600 to-indigo-500 rounded-md" style={{ height: bar.h }} />
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-cyan-400 font-bold">{bar.min}m</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats column */}
              <div className="flex flex-col gap-6">
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Focus categories</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { topic: "Python Basics", pct: 95, color: "bg-cyan-500" },
                      { topic: "Java OOP & Classes", pct: 40, color: "bg-indigo-500" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">{item.topic}</span>
                          <span>{item.pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-tr from-cyan-955/20 to-slate-900/40 border border-cyan-500/10 p-6 rounded-2xl">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase">AI Recommendation</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Reviewing Python syntax and structures using Dwell timer builds coding recall 15% faster.
                  </p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold">Earned Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { title: "Switch Mastery", desc: "Completed 10 cycles", icon: "verified" },
                  { title: "Dwell Champion", desc: "No manual clicks used", icon: "local_fire_department" },
                  { title: "Python Master", desc: "Python quiz 100%", icon: "school" },
                  { title: "Verbal Communicator", desc: "Spoke 20+ voice queries", icon: "forum" }
                ].map((badge, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <span className="material-symbols-outlined !text-2xl">{badge.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{badge.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. PROFILE & CERTIFICATES */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-8 animate-fadeIn max-w-4xl mx-auto w-full">
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
                {getEffectiveStudentName(user, "motor").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 flex flex-col gap-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{getEffectiveStudentName(user, "motor")}</h2>
                <p className="text-sm text-slate-400">Gaze & Switch adaptive user account · Active Learner</p>
                <div className="flex justify-center md:justify-start gap-4 mt-3">
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 font-bold">
                    {topicCertificates.length} Topic Proofs
                  </span>
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-bold">
                    {Object.values(progress || {}).filter(p => p?.completion === 100).length} Completed Courses
                  </span>
                  <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 font-bold">7-Day Streak</span>
                </div>
              </div>
            </div>

            {/* Academic Honors Degree Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined !text-lg">school</span>
                  Academic Honors Degree & Pathway
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  5 Major Specializations Required
                </span>
              </div>
              <DegreeGraduationOffer
                mode="motor"
                dwellEnabled={dwellEnabled}
                dwell={dwell}
                speak={speak}
                cardClass={cardClass}
                innerCardClass={innerCardClass}
                textTitleClass={textTitleClass}
              />
            </div>

            {/* Career Readiness Certificates */}
            {careerCertificates.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined !text-lg">workspace_premium</span>
                    Career Readiness Credentials ({careerCertificates.length})
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    5 of 5 Courses Verified
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {careerCertificates.map((cc) => (
                    <div key={cc.certificateId} className="bg-slate-900/40 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between gap-4 border-l-4 border-l-indigo-500">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            Career NFT Credential
                          </span>
                          <div className="flex items-center gap-1.5">
                            {cc.tokenId && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-bold font-mono">
                                Token #{cc.tokenId}
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                              Valid On-Chain
                            </span>
                          </div>
                        </div>
                        <h4 className="text-base font-bold mt-2 text-white">{cc.careerPathTitle || cc.courseName || "Career Path"}</h4>
                        <p className="text-xs text-indigo-400 font-semibold mt-0.5">{cc.track || "5-Course Comprehensive Program"}</p>
                        <p className="text-xs text-slate-400 font-mono mt-2">ID: <span className="text-cyan-400">{cc.certificateId}</span></p>
                        <p className="text-[11px] text-slate-500 italic mt-1.5">
                          * Career-readiness credential confirming skills learned.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <DwellButton
                          label="Verify on MST"
                          color="cyan"
                          dwellEnabled={dwellEnabled}
                          dwell={dwell}
                          onClick={() => {
                            navigate(`/verify?id=${cc.certificateId}`);
                            speak("Opening public blockchain verification.");
                          }}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <DwellButton
                            label="Download PDF"
                            color="emerald"
                            dwellEnabled={dwellEnabled}
                            dwell={dwell}
                            onClick={() => {
                              window.open(`http://127.0.0.1:5000/certificate/download/${cc.certificateId}`, "_blank");
                              speak("Downloading Career Certificate PDF.");
                            }}
                          />
                          <DwellButton
                            label="View Certificate"
                            color="indigo"
                            dwellEnabled={dwellEnabled}
                            dwell={dwell}
                            onClick={() => {
                              window.open(`http://127.0.0.1:5000/certificate/view/${cc.certificateId}`, "_blank");
                              speak("Viewing Career Certificate in full screen.");
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Topic Certificates */}
            {topicCertificates.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined !text-lg">video_library</span>
                  Video Topic Certificates ({topicCertificates.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {topicCertificates.map((tc) => (
                    <div key={tc.certificateId} className="bg-slate-900/40 border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between gap-4 border-l-4 border-l-cyan-400">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            Topic NFT Certificate
                          </span>
                          {tc.tokenId && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold font-mono">
                              Token #{tc.tokenId}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold mt-2">{tc.topicName || "Topic Lesson"}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Course: {tc.courseName || "Course"}</p>
                        <p className="text-xs text-slate-400 mt-2 font-mono">ID: {tc.certificateId}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <DwellButton
                          label="Verify on MST"
                          color="cyan"
                          dwellEnabled={dwellEnabled}
                          dwell={dwell}
                          onClick={() => navigate(`/verify?id=${tc.certificateId}`)}
                        />
                        <DwellButton
                          label="Download PDF"
                          color="emerald"
                          dwellEnabled={dwellEnabled}
                          dwell={dwell}
                          onClick={() => {
                            window.open(`http://127.0.0.1:5000/certificate/download/${tc.certificateId}`, "_blank");
                            speak("Downloading topic certificate PDF.");
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">My On-Chain Certificates</h2>
                <button
                  type="button"
                  onClick={() => navigate("/verify")}
                  className="text-xs text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Verify on MST Testnet</span>
                  <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.entries(progress || {})
                  .filter(([_, p]) => p?.completion === 100)
                  .map(([cId, p]) => {
                    const cMatch = courses.find(c => c.id === cId) || { title: cId };
                    const certCode = p?.blockchain?.certificateId || `CERT-${cId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${(user?.uid || "STU").slice(0, 6).toUpperCase()}`;
                    const tokenId = p?.blockchain?.tokenId;

                    return (
                      <div key={cId} className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-4 border-l-4 border-l-emerald-500">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400">MST Testnet NFT</span>
                            {tokenId && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold font-mono">
                                Token #{tokenId}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold mt-1">{cMatch.title}</h3>
                          <p className="text-xs text-slate-400 mt-2 font-mono">ID: {certCode}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <DwellButton
                            label="Verify on MST"
                            color="cyan"
                            dwellEnabled={dwellEnabled}
                            dwell={dwell}
                            onClick={() => navigate(`/verify?id=${certCode}`)}
                          />
                          <DwellButton
                            label="Download PDF"
                            color="emerald"
                            dwellEnabled={dwellEnabled}
                            dwell={dwell}
                            onClick={() => {
                              window.open(`http://127.0.0.1:5000/certificate/download/${certCode}`, "_blank");
                              speak("Downloading certificate PDF.");
                            }}
                          />
                          <DwellButton
                            label="Copy ID"
                            color="indigo"
                            dwellEnabled={dwellEnabled}
                            dwell={dwell}
                            onClick={() => {
                              navigator.clipboard.writeText(certCode);
                              speak("Certificate code copied to clipboard.");
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}

                {Object.values(progress || {}).filter(p => p?.completion === 100).length === 0 && (
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-4 border-l-4 border-l-cyan-500">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400">MST Testnet Live NFT</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold font-mono">
                          Token #1
                        </span>
                      </div>
                      <h3 className="text-base font-bold mt-1">American Sign Language Fundamentals</h3>
                      <p className="text-xs text-slate-400 mt-2 font-mono">ID: CERT-ACCESSAI-DEMO-2026-001</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <DwellButton
                        label="Verify Demo"
                        color="cyan"
                        dwellEnabled={dwellEnabled}
                        dwell={dwell}
                        onClick={() => navigate("/verify?id=CERT-ACCESSAI-DEMO-2026-001")}
                      />
                      <DwellButton
                        label="Download PDF"
                        color="emerald"
                        dwellEnabled={dwellEnabled}
                        dwell={dwell}
                        onClick={() => {
                          window.open("http://127.0.0.1:5000/certificate/download/CERT-ACCESSAI-DEMO-2026-001", "_blank");
                          speak("Downloading demo certificate PDF.");
                        }}
                      />
                      <DwellButton
                        label="Copy ID"
                        color="indigo"
                        dwellEnabled={dwellEnabled}
                        dwell={dwell}
                        onClick={() => {
                          navigator.clipboard.writeText("CERT-ACCESSAI-DEMO-2026-001");
                          speak("Demo certificate ID copied to clipboard.");
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 9. ACCESSIBILITY SETTINGS */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-8 animate-fadeIn max-w-3xl mx-auto w-full">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Accessibility Configurations</h1>
              <p className="text-xs text-slate-400 font-medium">Calibrate dwell mouse clicks, head tracking, cycling scan speeds, and visual pointers.</p>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 flex flex-col gap-6">

              {/* ── HEAD TRACKING SECTION ─────────────────────────────────── */}
              <div className="pb-6 border-b border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-400">face_retouching_natural</span>
                  <h3 className="text-sm font-bold text-slate-200">Head Tracking Control</h3>
                  <span className="ml-auto text-[9px] uppercase font-bold px-2 py-0.5 bg-violet-500/15 text-violet-400 border border-violet-500/25 rounded-full">
                    MediaPipe AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Uses your webcam to track head movement. Move your head to control the cursor.
                  <span className="text-violet-400 font-semibold"> Open your mouth</span> to click, or hold still to dwell-select.
                  <span className="text-cyan-400 font-semibold"> Tilt head left/right</span> to scroll.
                </p>

                {/* Enable/Disable toggle */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Enable head tracking</span>
                  <button
                    onClick={() => {
                      headTracking.setEnabled(v => !v);
                      if (!headTracking.enabled) {
                        speak("Head tracking activated. Move your head to control the cursor. Open your mouth to click.");
                      } else {
                        speak("Head tracking deactivated.");
                      }
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      headTracking.enabled
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-slate-900 border-white/5 text-slate-400 hover:border-violet-500/40"
                    }`}
                  >
                    {(headTracking.status === "loading" || headTracking.status === "initializing")
                      ? "Initialising…"
                      : headTracking.enabled
                      ? "Head Tracking: ON"
                      : "Head Tracking: OFF"}
                  </button>
                </div>

                {/* Status indicator */}
                {headTracking.enabled && (
                  <div className={`flex items-center gap-3 p-3 rounded-xl text-xs font-semibold ${
                    headTracking.status === "ready" || headTracking.status === "active"
                      ? "bg-violet-500/10 border border-violet-500/20 text-violet-300"
                      : headTracking.status === "loading" || headTracking.status === "initializing"
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      headTracking.status === "ready" || headTracking.status === "active"
                        ? "bg-violet-400 animate-pulse"
                        : headTracking.status === "loading" || headTracking.status === "initializing"
                        ? "bg-amber-400 animate-spin"
                        : "bg-red-400"
                    }`} />
                    {headTracking.status === "ready" || headTracking.status === "active"
                      ? "Camera active · Head tracking running · Look forward and keep head neutral."
                      : headTracking.status === "loading" || headTracking.status === "initializing"
                      ? "Loading AI face model… this may take 5-10 seconds on first run."
                      : headTracking.errorMsg || "Could not start head tracking."}
                  </div>
                )}

                {/* Calibration controls */}
                {(headTracking.status === "ready" || headTracking.status === "active") && (
                  <div className="flex flex-col gap-3">
                    {/* Quick recalibrate */}
                    <DwellButton
                      label="Quick Recalibrate"
                      sublabel="Look straight ahead, then click"
                      icon="my_location"
                      color="indigo"
                      dwellEnabled={dwellEnabled}
                      dwell={dwell}
                      speak={speak}
                      onClick={() => {
                        headTracking.recalibrate();
                        speak("Recalibrated. Keep head in neutral position.");
                      }}
                    />
                    {/* Full 5-step calibration */}
                    {!headTracking.calibrationStep ? (
                      <DwellButton
                        label="Full 5-Point Calibration"
                        sublabel="For best accuracy — takes ~15 seconds"
                        icon="tune"
                        color="cyan"
                        dwellEnabled={dwellEnabled}
                        dwell={dwell}
                        speak={speak}
                        onClick={() => {
                          headTracking.startCalibration();
                          speak("Starting calibration. Look straight at the screen and hold still.");
                        }}
                      />
                    ) : headTracking.calibrationStep !== "complete" ? (
                      <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl p-4 flex flex-col gap-3">
                        <p className="text-xs font-bold text-indigo-300">
                          Calibrating — Step: {headTracking.calibrationStep?.toUpperCase()}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {headTracking.calibrationStep === "center" && "Look straight ahead at the screen."}
                          {headTracking.calibrationStep === "left" && "Turn your head to the LEFT as far as comfortable."}
                          {headTracking.calibrationStep === "right" && "Turn your head to the RIGHT as far as comfortable."}
                          {headTracking.calibrationStep === "up" && "Look UP as far as comfortable."}
                          {headTracking.calibrationStep === "down" && "Look DOWN as far as comfortable."}
                          {headTracking.calibrationStep === "confirm" && "Calibration complete!"}
                        </p>
                        <DwellButton
                          label={`Record: ${headTracking.calibrationStep?.toUpperCase()}`}
                          icon="check_circle"
                          color="green"
                          dwellEnabled={dwellEnabled}
                          dwell={dwell}
                          speak={speak}
                          onClick={() => {
                            headTracking.recordCalibrationStep();
                            speak(`Recorded ${headTracking.calibrationStep}. ${headTracking.calibrationStep === "down" ? "Calibration complete!" : "Next step."}`);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-3 text-xs font-bold text-green-400">
                        ✓ Calibration saved! Head tracking is now optimized for your range of motion.
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-settings when enabled */}
                {headTracking.enabled && (
                  <div className="flex flex-col gap-4 pt-2">
                    {/* Sensitivity slider */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Cursor sensitivity</span>
                        <span className="text-violet-400 font-bold">{headTracking.sensitivity} / 5</span>
                      </div>
                      <input
                        type="range" min="1" max="5" step="1"
                        value={headTracking.sensitivity}
                        onChange={e => headTracking.setSensitivity(Number(e.target.value))}
                        className="w-full accent-violet-500 h-2 rounded-full cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* ── END HEAD TRACKING ──────────────────────────────────────── */}

              {/* Dwell config */}
              <div className="pb-6 border-b border-white/5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-200">Dwell Selection Engine</h3>
                  <button 
                    onClick={() => setDwellEnabled(d => !d)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      dwellEnabled ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-900 border-white/5 text-slate-400"
                    }`}
                  >
                    {dwellEnabled ? "Dwell Auto-Select: ON" : "Dwell Auto-Select: OFF"}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Hold your cursor over any menu option or button to automatically select it.
                </p>

                {/* Dwell duration selector */}
                <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-white/5">
                  <span className="text-slate-400">Auto-Select Duration</span>
                  <div className="flex gap-2">
                    {[
                      { ms: 1400, label: "1.4s" },
                      { ms: 3000, label: "3.0s" },
                      { ms: 5000, label: "5.0s (Default)" },
                    ].map(opt => (
                      <button
                        key={opt.ms}
                        onClick={() => {
                          setDwellMs(opt.ms);
                          speak(`Auto-select dwell duration set to ${opt.ms / 1000} seconds.`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          dwellMs === opt.ms
                            ? "bg-indigo-600 border border-indigo-400 text-white shadow-sm"
                            : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cursor Movement Lock in Settings */}
                <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-200 font-semibold">Cursor Movement Lock</span>
                    <span className="text-[11px] text-slate-500">Shortcut: Press Space or 'L' key</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = headTracking.toggleCursorLock();
                      speak(next ? "Cursor movement locked." : "Cursor movement unlocked.");
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      headTracking.locked
                        ? "bg-amber-500/25 border-amber-500/50 text-amber-300"
                        : "bg-slate-900 border-white/10 text-slate-300 hover:border-violet-500/40"
                    }`}
                  >
                    {headTracking.locked ? "🔒 Cursor: LOCKED" : "🔓 Lock Cursor"}
                  </button>
                </div>
              </div>

              {/* Switch key cycle */}
              <div className="pb-6 border-b border-white/5 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-slate-200">Switch Scanning Cycling</h3>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-slate-400">Enable Space/Enter button highlights</span>
                  <button 
                    onClick={() => setSwitchEnabled(s => !s)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      switchEnabled ? "bg-cyan-600 border-cyan-500 text-white" : "bg-slate-900 border-white/5 text-slate-400"
                    }`}
                  >
                    {switchEnabled ? "Highlights Active" : "Highlights Disabled"}
                  </button>
                </div>
              </div>

              {/* Cursor setting */}
              <div className="pb-6 border-b border-white/5 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-slate-200">Simulated cursor pointer circle</h3>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-slate-400">Highlight target size</span>
                  <div className="flex gap-2">
                    {["normal", "xl", "xxl"].map(sz => (
                      <button
                        key={sz}
                        onClick={() => setCursorSize(sz)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          cursorSize === sz ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FontSize */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-slate-200">Text Scaling</h3>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-slate-400">Adjust content size</span>
                  <div className="flex gap-2">
                    {["medium", "large", "x-large"].map(fs => (
                      <button
                        key={fs}
                        onClick={() => setFontSize(fs)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          fontSize === fs ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {fs}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Hands-Free Scroll Controls */}
      {headTracking.enabled && (
        <div 
          className="fixed bottom-6 right-56 z-[99992] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-cyan-500/30 shadow-2xl"
          role="region"
          aria-label="Cursor & Voice Scroll Controls"
        >
          <span className="text-[11px] font-bold text-slate-400 hidden xl:inline">
            Scroll:
          </span>
          <button
            type="button"
            data-switchable
            onClick={() => scrollContentBy(-380, true)}
            onMouseEnter={() => {
              dwell.startDwell("btn_scroll_up", () => scrollContentBy(-380, true));
            }}
            onMouseLeave={dwell.cancelDwell}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all border border-cyan-500/20 active:scale-95 cursor-pointer shadow-sm"
            title="Scroll up (hover to dwell, move cursor to top edge, or say 'scroll up')"
          >
            <span className="material-symbols-outlined text-sm">arrow_upward</span>
            <span>Up</span>
          </button>
          <button
            type="button"
            data-switchable
            onClick={() => scrollContentBy(380, true)}
            onMouseEnter={() => {
              dwell.startDwell("btn_scroll_down", () => scrollContentBy(380, true));
            }}
            onMouseLeave={dwell.cancelDwell}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
            title="Scroll down (hover to dwell, move cursor to bottom edge, or say 'scroll down')"
          >
            <span className="material-symbols-outlined text-sm">arrow_downward</span>
            <span>Down</span>
          </button>
        </div>
      )}

      <CertificateModal
        isOpen={!!earnedCertData}
        onClose={() => setEarnedCertData(null)}
        certificateData={earnedCertData}
        mode="motor"
        speak={speak}
        dwellEnabled={dwellEnabled}
        dwell={dwell}
      />
    </div>
  );
}