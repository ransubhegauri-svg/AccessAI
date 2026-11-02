import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { useVoiceAssistant } from "../hooks/useVoice";
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
    category: "webdev",
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

// ── Voice Commands Engine ──
function useVoiceCommands(commands, active) {
  const { registerContext, transcript, listening, setTranscript } = useVoiceAssistant();
  const commandsRef = useRef(commands);
  const contextIdRef = useRef(`BLIND_DASHBOARD_${Math.random().toString(36).substring(2, 9)}`);

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

      let matched = false;
      for (const [pattern, handler] of Object.entries(commandsRef.current)) {
        if (text.includes(pattern)) {
          handler(spokenText);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        const originalText = spokenText.toLowerCase().trim();
        for (const [pattern, handler] of Object.entries(commandsRef.current)) {
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

export default function BlindDashboard() {
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

  // Navigation tab states
  const [activeTab, setActiveTab] = useState("home"); // home, courses, my-learning, ai-tutor, activity, profile, settings

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
  const [selectedCourse, setSelectedCourse] = useState(null); // Course detail modal
  const [activeCoursePlay, setActiveCoursePlay] = useState(null); // Course Player
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
      navigate("/blind", { replace: true });
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
    speak(`Starting course ${course.title}. Loading audio lessons.`);
  };

  // Lists & Filters
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
    { sender: "ai", text: "Hello! I am your AccessAI Audio Tutor. Ask me any question. Every answer will be spoken out loud." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiTutorTab, setAiTutorTab] = useState("chat"); // chat, homework, quiz-gen
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(true);
  const [earnedCertData, setEarnedCertData] = useState(null);
  const [topicCertificates, setTopicCertificates] = useState(() => {
    try {
      const stored = localStorage.getItem("accessai_topic_certs_blind");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [issuingCert, setIssuingCert] = useState(false);
  const [careerCertificates, setCareerCertificates] = useState(() => {
    try {
      const stored = localStorage.getItem("accessai_career_certs_blind");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync earned certificates from backend
  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const uId = user?.uid || "demo-uid-blind";
        const [res, cRes] = await Promise.all([
          API.get(`/progress/certificates/${uId}`),
          API.get(`/career/certificates/${uId}`).catch(() => ({ data: { certificates: [] } })),
        ]);
        if (res.data?.topicCertificates?.length > 0) {
          setTopicCertificates(res.data.topicCertificates);
          localStorage.setItem("accessai_topic_certs_blind", JSON.stringify(res.data.topicCertificates));
        }
        const backendCareerCerts = cRes.data?.certificates || res.data?.careerCertificates || [];
        if (backendCareerCerts.length > 0) {
          setCareerCertificates(backendCareerCerts);
          localStorage.setItem("accessai_career_certs_blind", JSON.stringify(backendCareerCerts));
        }
      } catch (e) {
        // demo / local fallback
      }
    };
    fetchCerts();
  }, [user?.uid]);

  // Settings
  const [ttsSpeed, setTtsSpeed] = useState("normal"); // slow, normal, fast
  const [contrastTheme, setContrastTheme] = useState("light"); // high-contrast, standard-dark, light
  const [fontSize, setFontSize] = useState("xxl"); // xl, xxl
  const [voiceActive, setVoiceActive] = useState(true);

  // Dynamic Contrast Themes config matching Deafmute/Deaf modes
  const isLight = contrastTheme === "light";
  const isDark = contrastTheme === "dark" || contrastTheme === "standard-dark";
  const isHighContrast = contrastTheme === "high-contrast";

  const bgClass = isLight 
    ? "bg-white text-slate-900" 
    : isDark 
      ? "bg-[#090d16] text-[#e2e8f0]" 
      : "bg-black text-[#fbbf24]";

  const sidebarClass = isLight 
    ? "bg-slate-50 border-slate-200 text-slate-900" 
    : isDark 
      ? "bg-[#0a0f1d]/95 border-white/5 text-[#e2e8f0]" 
      : "bg-black border-[#fbbf24] text-[#fbbf24]";

  const cardClass = isLight 
    ? "bg-slate-50 border-slate-200 text-slate-800 border shadow-sm" 
    : isDark 
      ? "bg-[#121b2d]/50 border-white/5 text-slate-350 border" 
      : "bg-black border-2 border-[#fbbf24]/50 text-[#fbbf24]";

  const innerCardClass = isLight 
    ? "bg-white border border-slate-200" 
    : isDark 
      ? "bg-[#0a0f1d]/40 border-white/5" 
      : "bg-black border border-[#fbbf24]/30";

  const textTitleClass = isLight 
    ? "text-slate-900" 
    : isDark 
      ? "text-white" 
      : "text-[#fbbf24]";

  const borderClass = isLight 
    ? "border-slate-200" 
    : isDark 
      ? "border-white/10" 
      : "border-[#fbbf24]/50";

  // Status announce region
  const [statusMsg, setStatusMsg] = useState("");
  const announcedRef = useRef(false);

  // Load database courses
  useEffect(() => {
    if (DEMO_MODE) return;
    const fetchDB = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          API.get("/courses"),
          API.get(`/progress/${user?.uid}`)
        ]);
        if (cRes.data?.courses?.length > 0) {
          const progCourses = cRes.data.courses.filter(c => 
            c.category === "programming" || 
            c.category === "databases" || 
            c.category === "development"
          );
          if (progCourses.length > 0) setCourses(progCourses);
        }
        if (pRes.data?.progress) {
          const pMap = {};
          pRes.data.progress.forEach(p => { pMap[p.courseId] = p; });
          setProgress(pMap);
        }
      } catch (e) {
        console.warn("Could not fetch remote courses. Local mocks loaded.");
      }
    };
    fetchDB();
  }, [user?.uid, DEMO_MODE]);

  // Audio introduction
  useEffect(() => {
    if (!announcedRef.current) {
      announcedRef.current = true;
      setTimeout(() => {
        speak(`Welcome to your AccessAI audio platform, Aman. Navigation tabs are high contrast and voice-guided. Focus on any option to hear its details. Say help to list all voice commands.`, true);
      }, 700);
    }
  }, [speak]);

  // Helper trigger to announce screen change
  const navigateTo = (tabName, announceText) => {
    navigate(`/blind/${tabName === "home" ? "" : tabName}`);
    speak(announceText, true);
    setStatusMsg(announceText);
  };

  const handleBuyCourse = (courseId) => {
    if (purchasedIds.includes(courseId)) return;
    setPurchasedIds(prev => [...prev, courseId]);
    setProgress(prev => ({ ...prev, [courseId]: { completion: 0 } }));
    speak("Course enrolled. You can now start listening to lessons.");
  };

  const updateProgress = async (courseId, pct) => {
    setProgress(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], completion: pct }
    }));

    if (pct === 100) {
      const cObj = courses.find(c => c.id === courseId) || {};
      const activeWallet = walletAccount || localStorage.getItem("accessai_wallet_address");
      const studentName = getEffectiveStudentName(user, "blind");
      const cleanCourse = courseId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const cleanUid = ((user?.uid || "BLIND01").replace(/[^a-zA-Z0-9]/g, "")).slice(0, 6).toUpperCase();
      const fallbackCert = {
        certificateId: `CERT-${cleanCourse}-${cleanUid}`,
        courseName: cObj.title || courseId,
        studentName,
        pointsAwarded: 50,
      };

      try {
        const res = await API.post("/progress", {
          userId: user?.uid || "demo-uid-blind",
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
      speak("Correct answer! Minting your personalized NFT topic certificate on MST Testnet.", true);
      const currentLesson = activeCoursePlay.lessons[currentLessonIdx] || {
        id: `topic-${currentLessonIdx + 1}`,
        title: `Topic ${currentLessonIdx + 1}`,
      };
      const studentName = getEffectiveStudentName(user, "blind");
      const activeWallet = walletAccount || localStorage.getItem("accessai_wallet_address");

      setIssuingCert(true);
      try {
        const res = await API.post("/progress/topic", {
          userId: user?.uid || "demo-uid-blind",
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
            localStorage.setItem("accessai_topic_certs_blind", JSON.stringify(updated));
            return updated;
          });
          setEarnedCertData(bData);
        }
      } catch (err) {
        console.warn("Topic cert issue failed, fallback locally:", err);
        const cleanCourse = activeCoursePlay.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const cleanTopic = currentLesson.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const cleanUid = ((user?.uid || "BLIND01").replace(/[^a-zA-Z0-9]/g, "")).slice(0, 6).toUpperCase();
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

      const nextP = Math.round(((currentLessonIdx + 1) / activeCoursePlay.lessons.length) * 100);
      updateProgress(activeCoursePlay.id, nextP);
    } else {
      speak("Wrong answer. Try another option.", true);
    }
  };

  // AI Tutor operations
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    setTimeout(() => {
      let reply = "Understood. The audio tutor parses code syntax structures to give step-by-step programming advice.";
      const query = chatInput.toLowerCase();
      if (query.includes("python") || query.includes("code") || query.includes("programming")) {
        reply = "Python is highly readable and great for vocal learners. Def is used to declare a function.";
      } else if (query.includes("java") || query.includes("oop")) {
        reply = "Java is class-based and object-oriented. Extends is the keyword used to establish class inheritance.";
      } else if (query.includes("dbms") || query.includes("sql") || query.includes("database")) {
        reply = "Database Management Systems (DBMS) organize data. Use WHERE clauses in SELECT queries to filter rows.";
      } else if (query.includes("quiz")) {
        reply = "Auditory quiz generated: Which keyword is used to define a function in Python? Options: function, def, func, or define.";
      }
      setChatMessages(prev => [...prev, { sender: "ai", text: reply }]);
      speak(reply, true);
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

  // Global voice commands (low vision/blind friendly navigation)
  const { listening, transcript } = useVoiceCommands({
    "course 1": () => { setSelectedCourse(courses[0]); speak("Opening details for Introduction to Python."); },
    "course 2": () => { setSelectedCourse(courses[1]); speak("Opening details for Java Programming Basics."); },
    "course 3": () => { setSelectedCourse(courses[2]); speak("Opening details for Database Management and SQL."); },
    "course 4": () => { setSelectedCourse(courses[3]); speak("Opening details for Web Development Basics."); },
    "list courses": () => {
      const list = courses.map((c, i) => `Course ${i + 1}: ${c.title}`).join(". ");
      speak(`Here are the courses: ${list}. Say open course 1 to start.`, true);
    },
    "degree": () => navigateTo("degree-offer", "Navigated to Academic Honors Degree Pathway Offer. Complete 5 major certificates to earn your Bachelor of Accessible Software Engineering and Applied AI degree diploma with 500 bonus points."),
    "honors degree": () => navigateTo("degree-offer", "Navigated to Academic Honors Degree Pathway Offer."),
    "degree offer": () => navigateTo("degree-offer", "Navigated to Academic Honors Degree Pathway Offer."),
    "graduation": () => navigateTo("degree-offer", "Navigated to Academic Honors Degree Pathway Offer."),
    "degree progress": () => {
      speak("Checking Academic Honors Degree progress. You need 5 major certificates to earn your Bachelor of Accessible Software Engineering and Applied AI degree diploma with First Class Honors and 500 MST Points.");
    },
    "career": () => navigateTo("career-paths", "Navigated to Career Certificate Programs. 3 career tracks available."),
    "career paths": () => navigateTo("career-paths", "Navigated to Career Certificate Programs. 3 career tracks: Web Development, Python Programming, and AI Fundamentals."),
    "career track": () => navigateTo("career-paths", "Navigated to Career Certificate Programs."),
    "career program": () => navigateTo("career-paths", "Navigated to Career Certificate Programs."),
    "career progress": () => {
      speak("Checking Career Paths progress. Each path contains 5 courses. You can earn an on-chain Career Readiness Certificate by completing all 5 courses and quizzes in a path.");
    },
    "home": () => navigateTo("home", "Navigated to Home Dashboard."),
    "course": () => navigateTo("courses", "Navigated to Courses Library."),
    "library": () => navigateTo("courses", "Navigated to Courses Library."),
    "learning": () => navigateTo("my-learning", "Navigated to Enrolled Courses."),
    "tutor": () => navigateTo("ai-tutor", "Navigated to Audio AI Tutor."),
    "activity": () => navigateTo("activity", "Navigated to Activity Dashboard."),
    "certificate": () => navigateTo("profile", "Navigated to Profile and certificates page."),
    "profile": () => navigateTo("profile", "Navigated to Profile and certificates page."),
    "setting": () => navigateTo("settings", "Navigated to Accessibility settings."),
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
    "rewards": () => navigateTo("rewards-store", `Navigated to Rewards Store and Marketplace. You have ${availablePoints !== undefined ? availablePoints : 550} reward points available. Say buy course or select an item to redeem with points.`),
    "store": () => navigateTo("rewards-store", `Navigated to Rewards Store and Marketplace. You have ${availablePoints !== undefined ? availablePoints : 550} reward points available. Say buy course or select an item to redeem with points.`),
    "rewards store": () => navigateTo("rewards-store", `Navigated to Rewards Store. You have ${availablePoints !== undefined ? availablePoints : 550} points available.`),
    "shop": () => navigateTo("rewards-store", "Navigated to Rewards Store."),
    "redeem": () => navigateTo("rewards-store", "Navigated to Rewards Store. Browse items to redeem with your points."),
    "buy course": () => navigateTo("rewards-store", "Navigated to Rewards Store. You can redeem premium courses such as Neural Adaptive AI or Full Stack Accessibility Engineering."),
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
    "sign out": () => { speak("Signing out. Redirecting to landing page."); setTimeout(logout, 1200); },
    "stop": () => stop(),
    "help": () => speak("Commands: home, courses, learning, tutor, activity, settings, points, verify certificate, connect wallet, list courses, open course 1, stop, sign out.")
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
      className={`min-h-screen ${bgClass} font-sans flex relative ${
        fontSize === "xxl" ? "text-lg" : "text-base"
      }`}
    >
      {/* Visual glowing layout lines for low-vision contrast guidance */}
      {contrastTheme === "high-contrast" && (
        <div className="absolute inset-0 border-[6px] border-[#fbbf24] pointer-events-none z-[9999]" />
      )}

      {/* ARIA live region for screen readers */}
      <div role="status" aria-live="assertive" className="sr-only">{statusMsg}</div>

      {/* ── HIGH CONTRAST ACCESSIBLE SIDEBAR ── */}
      <aside 
        role="navigation"
        aria-label="Sidebar navigation"
        className={`w-64 flex flex-col justify-between sticky top-0 h-screen z-50 ${sidebarClass}`}
      >
        <div className="p-3.5 flex flex-col gap-3">
          <div 
            onClick={() => navigateTo("home", "Navigated to Home Dashboard.")}
            className="flex flex-col gap-0.5 cursor-pointer"
            tabIndex={0}
            aria-label="AccessAI Blind Mode logo. Link to Home."
            onFocus={() => speak("AccessAI home logo link.")}
          >
            <span className={`text-xl font-black ${isLight ? "text-slate-900" : isDark ? "text-white" : "text-[#fbbf24]"} tracking-tight`}>AccessAI</span>
            <span className={`self-start text-[9px] font-black uppercase tracking-widest bg-[#fbbf24]/20 px-2 py-0.5 rounded-full ${
              isLight || isHighContrast ? "text-yellow-700 border border-yellow-500/50" : "text-yellow-400 border border-yellow-400/30"
            }`}>
              BLIND MODE
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {[
              { id: "home", label: "Home Dashboard", icon: "home", desc: 'View daily stats and active courses. say "go to home".', shortcut: "go to home" },
              { id: "degree-offer", label: "Honors Degree (Offer)", icon: "school", desc: 'Complete 5 major certificates to earn your degree diploma and 500 MST Points. say "go to degree".', shortcut: "go to degree" },
              { id: "career-paths", label: "Career Paths", icon: "workspace_premium", desc: '5-course career certificate tracks on MST Blockchain. say "go to career".', shortcut: "go to career" },
              { id: "rewards-store", label: "Rewards Store (Redeem)", icon: "storefront", desc: 'Spend reward points on courses, perks, or diplomas. say "go to store".', shortcut: "go to store" },
              { id: "courses", label: "Course Library", icon: "grid_view", desc: 'Explore catalog. say "go to courses".', shortcut: "go to courses" },
              { id: "my-learning", label: "My Learning", icon: "menu_book", desc: 'View enrolled and continue lessons. say "go to learning".', shortcut: "go to learning" },
              { id: "ai-tutor", label: "Audio AI Tutor", icon: "smart_toy", desc: 'Chat verbally or generate exam review. say "go to tutor".', shortcut: "go to tutor" },
              { id: "activity", label: "Activity Stats", icon: "analytics", desc: 'Listen to weekly learning logs. say "go to activity".', shortcut: "go to activity" },
              { id: "profile", label: "Profile & Badges", icon: "account_circle", desc: 'View completion credentials. say "go to profile".', shortcut: "go to profile" },
              { id: "settings", label: "Settings Adaptive", icon: "tune", desc: 'Configure speech speeds and contrast themes. say "go to settings".', shortcut: "go to settings" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id, `Navigated to ${tab.label}.`)}
                onFocus={() => speak(`${tab.label}. ${tab.desc}`)}
                aria-label={`${tab.label}. ${tab.desc}`}
                aria-pressed={activeTab === tab.id}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left text-xs font-black transition-all border ${
                  activeTab === tab.id 
                    ? isHighContrast 
                      ? "bg-[#fbbf24] text-black border-[#fbbf24]" 
                      : "bg-[#fbbf24] text-black border-[#fbbf24] shadow-sm"
                    : isLight 
                      ? "text-slate-700 hover:text-black border-transparent hover:border-yellow-500 bg-slate-200/50"
                      : isDark
                        ? "text-slate-300 hover:text-white border-transparent hover:border-yellow-450 bg-slate-900/60"
                        : "text-[#fbbf24] hover:bg-[#fbbf24]/10 border-transparent hover:border-[#fbbf24]"
                }`}
              >
                <span className="material-symbols-outlined !text-lg">{tab.icon}</span>
                <div className="flex flex-col truncate">
                  <span className="truncate">{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className={`p-3 border-t ${borderClass} flex flex-col gap-2`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fbbf24] text-black flex items-center justify-center font-black text-xs">
              AH
            </div>
            <div>
              <p className={`text-xs font-bold ${isLight ? "text-slate-800" : isDark ? "text-slate-200" : "text-[#fbbf24]"}`}>Aman Halkude</p>
              <p className="text-[9px] text-slate-500">Audio Navigator</p>
            </div>
          </div>
          <button
            onClick={logout}
            onFocus={() => speak("Sign Out button. Press enter to log out.")}
            aria-label="Sign Out"
            className={`w-full py-1.5 font-bold rounded-lg text-center text-xs border ${
              isLight 
                ? "bg-red-50 border-red-200 hover:bg-red-100 text-red-700" 
                : isDark 
                  ? "bg-red-950 border-red-500/30 hover:bg-red-900 text-red-300"
                  : "bg-black border-red-500 hover:bg-red-500/10 text-red-500"
            }`}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AUDITORY AND VISUAL AREA ── */}
      <main className="flex-1 h-screen max-h-screen overflow-y-auto lg:overflow-y-hidden p-4 relative flex flex-col gap-3">
        
        {/* Status indicator banner */}
        <div className={`flex justify-between items-center p-2.5 px-4 rounded-xl border ${
          isLight 
            ? "bg-slate-50 border-slate-200 text-slate-850 shadow-sm" 
            : isDark 
              ? "bg-[#121b2d]/50 border-white/5 text-[#e2e8f0]"
              : "bg-black border-[#fbbf24]/50 text-[#fbbf24]"
        }`}>
          <div className="flex gap-3 items-center">
            {!isOverview && (
              <BackButton
                fallback="/blind"
                onClick={handleBackClick}
              />
            )}
            {voiceActive && listening && (
              <div className={`flex items-center gap-1.5 text-xs font-black uppercase ${isLight || isDark ? "text-amber-600" : "text-[#fbbf24]"}`}>
                <span className={`w-2 h-2 rounded-full animate-ping ${isLight || isDark ? "bg-amber-600" : "bg-[#fbbf24]"}`} />
                Mic Enabled
              </div>
            )}
            <span className="text-[11px] font-bold text-slate-500">TTS Audio Feedback: ACTIVE</span>
          </div>

          <div className="flex gap-2 items-center">
            <WalletBadge />
            <button
              onClick={() => {
                setVoiceActive(v => !v);
                speak(voiceActive ? "Voice recognition disabled." : "Voice recognition activated.");
              }}
              onFocus={() => speak("Voice Assistant toggle button.")}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                voiceActive 
                  ? "bg-[#fbbf24] text-black border-[#fbbf24]" 
                  : isLight 
                    ? "bg-slate-100 text-slate-500 border-slate-200"
                    : isDark 
                      ? "bg-slate-900 text-slate-400 border-white/5"
                      : "bg-black text-[#fbbf24]/50 border-[#fbbf24]/30"
              }`}
            >
              Voice: {voiceActive ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => {
                const nextT = contrastTheme === "light" ? "dark" : contrastTheme === "dark" ? "high-contrast" : "light";
                setContrastTheme(nextT);
                speak(`Theme updated to ${nextT === "light" ? "light mode" : nextT === "dark" ? "dark mode" : "high contrast yellow"}.`);
              }}
              onFocus={() => speak("Contrast theme selector.")}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                isLight 
                  ? "bg-slate-100 border-slate-200 text-slate-700" 
                  : isDark 
                    ? "bg-slate-900 border-white/10 text-slate-300"
                    : "bg-black border-[#fbbf24]/40 text-[#fbbf24]"
              }`}
            >
              Toggle Contrast Theme
            </button>
          </div>
        </div>

        {voiceActive && transcript && (
          <div className={`p-2 px-3 rounded-lg text-xs font-bold shadow-sm border ${
            isLight 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
              : isDark 
                ? "bg-emerald-950/45 border-emerald-500/30 text-emerald-400"
                : "bg-black border-emerald-500 text-emerald-450"
          }`}>
            Voice Heard: "{transcript}"
          </div>
        )}

        {/* 1. HOME DASHBOARD VIEW */}
        {activeTab === "home" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-3 my-auto animate-fadeIn">
            {/* Header welcome */}
            <div className={`p-3.5 px-5 rounded-2xl flex justify-between items-center gap-4 border ${
              isLight 
                ? "bg-slate-50 border-slate-200 shadow-sm" 
                : isDark 
                  ? "bg-[#121b2d]/50 border-white/5" 
                  : "bg-black border-[#fbbf24]"
            }`}>
              <div className="flex items-center gap-3">
                <h1 className={`text-xl font-black ${textTitleClass}`} tabIndex={0} onFocus={() => speak("Welcome back, Aman. Get ready to expand your auditory and sign library.")}>Hello, Aman!</h1>
                <p className={`text-xs ${isLight ? "text-slate-600" : isDark ? "text-slate-300" : "text-[#fbbf24]/90"}`}>
                  Every element announces details on focus. Use TAB to jump inputs.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 border ${
                  isLight 
                    ? "bg-white border-slate-200 shadow-sm" 
                    : isDark 
                      ? "bg-slate-900 border-white/5" 
                      : "bg-black border-[#fbbf24]/50"
                }`}>
                  <span className={`text-base font-bold ${isLight || isDark ? "text-yellow-600" : "text-[#fbbf24]"}`}>7🔥</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Streak</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                tabIndex={0} 
                onFocus={() => speak("Goal progress card. Daily goal: 30 minutes. You have completed 83% of your goal today.")}
                className={`p-3.5 rounded-2xl flex flex-col gap-2 border ${cardClass}`}
              >
                <h3 className={`text-xs font-black uppercase tracking-wider ${isLight || isDark ? "text-slate-700" : "text-[#fbbf24]"}`}>Goal progress</h3>
                <p className="text-xs font-bold">Completed: 25m of 30m (83%)</p>
                <div className={`h-2 rounded-full overflow-hidden border ${innerCardClass}`}>
                  <div className={`h-full ${isLight || isDark ? "bg-amber-500" : "bg-[#fbbf24]"}`} style={{ width: "83%" }} />
                </div>
              </div>

              <div 
                tabIndex={0}
                onFocus={() => speak("AI Study Companion card. Launch the AI Tutor page to practice vocabulary questions verbally.")}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 border ${cardClass}`}
              >
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isLight || isDark ? "text-slate-700" : "text-[#fbbf24]"}`}>AI Speech Tutor</h3>
                  <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : isDark ? "text-slate-400" : "text-[#fbbf24]/80"}`}>Vocal quizzes & summaries.</p>
                </div>
                <button
                  onClick={() => navigateTo("ai-tutor", "Opening AI Tutor chat.")}
                  onFocus={() => speak("Launch AI Tutor page button.")}
                  className="px-3 py-1.5 bg-[#fbbf24] text-black font-black text-xs rounded-xl whitespace-nowrap"
                >
                  Start Audio Chat
                </button>
              </div>
            </div>

            {/* Enrolled resume list */}
            <div className="flex flex-col gap-1.5">
              <h2 className={`text-sm font-black ${textTitleClass}`}>Enrolled Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courses.filter(c => purchasedIds.includes(c.id)).map(course => {
                  const pct = progress[course.id]?.completion || 0;
                  return (
                    <div 
                      key={course.id} 
                      className={`rounded-2xl p-3.5 flex flex-col justify-between gap-2 border ${cardClass}`}
                      tabIndex={0}
                      onFocus={() => speak(`Enrolled course: ${course.title}. Progress: ${pct} percent. Focus down to resume player.`)}
                    >
                      <div>
                        <h3 className={`text-xs font-bold truncate ${textTitleClass}`}>{course.title}</h3>
                        <span className="sr-only">{course.description}</span>
                      </div>
                      <div>
                        <button
                          onClick={() => { setActiveCoursePlay(course); setCurrentLessonIdx(0); speak(`Loading audio course player for ${course.title}.`); }}
                          onFocus={() => speak(`Resume learning course ${course.title} button.`)}
                          className="w-full py-1.5 bg-[#fbbf24] text-black font-black text-xs rounded-xl"
                        >
                          Launch Player ({pct}% Complete)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC HONORS DEGREE VIEW */}
        {activeTab === "degree-offer" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <DegreeGraduationOffer
              mode="blind"
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
              mode="blind"
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
              mode="blind"
            />
          </div>
        )}

        {/* 2. COURSE LIBRARY VIEW */}
        {activeTab === "courses" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h1 className={`text-2xl font-black ${textTitleClass}`}>Explore Course Catalog</h1>
              <p className="text-xs text-slate-550">Audio-described courses supporting full voice integration.</p>
            </div>

            {/* Academic Honors Degree Pathway Offer Banner */}
            <DegreeGraduationOffer
              mode="blind"
              speak={speak}
              cardClass={cardClass}
              innerCardClass={innerCardClass}
              textTitleClass={textTitleClass}
            />

            {/* Keyboard-accessible categories */}
            <div className={`grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-xl border-2 ${cardClass}`}>
              {[
                { id: "all", label: "📚 All Classes" },
                { id: "programming", label: "💻 Python & Java" },
                { id: "databases", label: "🗄️ Database & SQL" },
                { id: "development", label: "🌐 Web Dev Basics" }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); speak(`Filtered catalog by ${cat.label}`); }}
                  onFocus={() => speak(`Filter category: ${cat.label} button.`)}
                  className={`py-3 px-4 rounded-xl text-xs font-black border-2 transition-all ${
                    category === cat.id 
                      ? "bg-[#fbbf24] text-black border-[#fbbf24]" 
                      : isLight 
                        ? "bg-slate-200 border-transparent text-slate-700" 
                        : isDark
                          ? "bg-slate-900 border-white/5 text-slate-300"
                          : "bg-black border-[#fbbf24]/30 text-[#fbbf24]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="flex flex-col gap-4">
              {filteredCourses.map((course, idx) => {
                const isOwned = purchasedIds.includes(course.id);
                return (
                  <div 
                    key={course.id}
                    className={`p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-yellow-400 transition-all border-2 ${cardClass}`}
                    tabIndex={0}
                    onFocus={() => speak(`Course ${idx + 1}: ${course.title}. Instructor: ${course.instructor}. Level: ${course.level}. Duration: ${course.duration}. ${isOwned ? "Enrolled." : course.isPremium ? `Cost: ${course.pointsCost} reward points.` : "Click to view details and buy."}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-bold ${textTitleClass}`}>{course.title}</h3>
                        {course.isPremium && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-400/40">
                            ⭐ {course.pointsCost} PTS
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : isDark ? "text-slate-400" : "text-[#fbbf24]/85"}`}>{course.description}</p>
                      <div className="flex gap-4 text-[10px] font-bold text-slate-500 mt-2 uppercase">
                        <span>Instructor: {course.instructor}</span>
                        <span>Level: {course.level}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        onFocus={() => speak(`View course details and lessons for ${course.title} button.`)}
                        className={`px-4 py-3 border rounded-xl text-xs font-bold flex-1 sm:flex-none ${
                          isLight 
                            ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" 
                            : isDark
                              ? "bg-slate-800 border-white/10 text-white hover:bg-slate-750"
                              : "bg-black border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10"
                        }`}
                      >
                        Syllabus Details
                      </button>
                      {!isOwned ? (
                        <button
                          onClick={() => {
                            if (course.isPremium) {
                              openStore ? openStore() : navigateTo("rewards-store", `Opening rewards store to unlock ${course.title} for ${course.pointsCost} points.`);
                            } else {
                              handleBuyCourse(course.id);
                            }
                          }}
                          onFocus={() => speak(course.isPremium ? `Redeem ${course.title} for ${course.pointsCost} reward points button.` : `Enroll in ${course.title} button.`)}
                          className="px-4 py-3 bg-[#fbbf24] text-black rounded-xl text-xs font-black flex-1 sm:flex-none"
                        >
                          {course.isPremium ? `⭐ Unlock for ${course.pointsCost} PTS` : "Enroll Now"}
                        </button>
                      ) : (
                        <button
                          onClick={() => { setActiveCoursePlay(course); setCurrentLessonIdx(0); speak(`Starting audio player for ${course.title}.`); }}
                          onFocus={() => speak(`Start learning ${course.title} button.`)}
                          className="px-4 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black flex-1 sm:flex-none"
                        >
                          Start Learning
                        </button>
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
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h1 className={`text-2xl font-black ${textTitleClass}`}>My Enrolled Courses</h1>
              <p className="text-xs text-slate-550">Launch audio players or review quizzes.</p>
            </div>

            <div className="flex flex-col gap-4">
              {courses.filter(c => isCourseUnlocked(c.id)).map(course => {
                const pct = progress[course.id]?.completion || 0;
                return (
                  <div 
                    key={course.id}
                    className={`p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-2 ${cardClass}`}
                    tabIndex={0}
                    onFocus={() => speak(`Enrolled Course: ${course.title}. You are ${pct} percent done.`)}
                  >
                    <div>
                      <h3 className={`text-base font-bold ${textTitleClass}`}>{course.title}</h3>
                      <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : isDark ? "text-slate-450" : "text-[#fbbf24]/85"}`}>{course.instructor} · completion rate {pct}%</p>
                    </div>
                    <button
                      onClick={() => { setActiveCoursePlay(course); setCurrentLessonIdx(0); speak(`Opening course player for ${course.title}.`); }}
                      onFocus={() => speak(`Launch audio course player for ${course.title} button.`)}
                      className="px-6 py-3 bg-[#fbbf24] text-black font-black rounded-xl text-xs"
                    >
                      Launch Course Player
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. COURSE DETAILS VIEW */}
        {selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-3xl mx-auto w-full">
            <button
              onClick={() => setSelectedCourse(null)}
              onFocus={() => speak("Back to course catalog button.")}
              className={`self-start text-xs font-bold ${isLight || isDark ? "text-slate-800" : "text-[#fbbf24]"} hover:underline`}
            >
              ◀ Back to catalog
            </button>

            <div 
              className={`p-8 rounded-3xl border-2 ${cardClass}`}
              tabIndex={0}
              onFocus={() => speak(`Syllabus overview. Course: ${selectedCourse.title}. Description: ${selectedCourse.description}. Level is ${selectedCourse.level}. Duration is ${selectedCourse.duration}.`)}
            >
              <h1 className={`text-2xl font-black ${textTitleClass}`}>{selectedCourse.title}</h1>
              <p className={`text-xs mt-2 ${isLight ? "text-slate-600" : isDark ? "text-slate-400" : "text-[#fbbf24]/85"}`}>{selectedCourse.description}</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className={`text-lg font-bold ${textTitleClass}`}>Syllabus lessons</h2>
              {selectedCourse.lessons.map((lesson, idx) => (
                <div 
                  key={lesson.id} 
                  className={`p-4 rounded-xl flex justify-between ${innerCardClass}`}
                  tabIndex={0}
                  onFocus={() => speak(`Lesson ${idx + 1}: ${lesson.title}. Duration: ${lesson.duration}`)}
                >
                  <span className={`text-xs font-bold ${isLight || isDark ? "text-slate-800" : "text-[#fbbf24]"}`}>0{idx + 1}. {lesson.title}</span>
                  <span className="text-xs text-slate-500">{lesson.duration}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (!purchasedIds.includes(selectedCourse.id)) {
                  handleBuyCourse(selectedCourse.id);
                }
                setActiveCoursePlay(selectedCourse);
                setCurrentLessonIdx(0);
                setSelectedCourse(null);
              }}
              onFocus={() => speak("Enroll and launch player button.")}
              className="w-full py-4 bg-[#fbbf24] text-black font-black rounded-xl text-center text-sm"
            >
              Enroll & Start Learning
            </button>
          </div>
        )}

        {/* 5. COURSE PLAYER & LESSON NARRATOR */}
        {activeCoursePlay && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center border-b border-[#fbbf24] pb-4">
              <button
                onClick={() => setActiveCoursePlay(null)}
                onFocus={() => speak("Close course player button.")}
                className={`px-4 py-2 font-bold text-xs rounded-lg border ${
                  isLight 
                    ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" 
                    : isDark 
                      ? "bg-red-950 border-red-500/30 text-red-300 hover:bg-red-900"
                      : "bg-black border-red-500 text-red-500 hover:bg-red-500/10"
                }`}
              >
                ✕ Close Player
              </button>
              <div className="text-right text-xs">
                <span className="text-slate-450">Lesson {currentLessonIdx + 1} of {activeCoursePlay.lessons.length}</span>
                <p className={`font-black ${isLight || isDark ? "text-slate-900" : "text-[#fbbf24]"}`}>{activeCoursePlay.lessons[currentLessonIdx].title}</p>
              </div>
            </div>

            {/* Speech Player controller triggers */}
            <div className={`p-8 rounded-2xl flex flex-col gap-4 border-2 ${cardClass}`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined animate-bounce ${isLight || isDark ? "text-slate-800" : "text-[#fbbf24]"}`}>settings_voice</span>
                <span className={`text-xs font-bold uppercase ${isLight || isDark ? "text-slate-700" : "text-[#fbbf24]"}`}>Narrator audio playback is active</span>
              </div>
              <p 
                className={`text-base leading-relaxed font-semibold p-6 rounded-xl border ${innerCardClass}`}
                tabIndex={0}
                onFocus={() => speak(`Lesson text narrator. Content: ${activeCoursePlay.lessons[currentLessonIdx].content}. Focus down to repeat or step lessons.`)}
              >
                {activeCoursePlay.lessons[currentLessonIdx].content}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => speak(activeCoursePlay.lessons[currentLessonIdx].content, true)}
                  onFocus={() => speak("Repeat audio narration button.")}
                  className={`py-3 border rounded-xl text-xs font-bold transition-all ${
                    isLight 
                      ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" 
                      : isDark
                        ? "bg-slate-800 border-white/10 text-white hover:bg-slate-750"
                        : "bg-black border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10"
                  }`}
                >
                  ↺ Repeat Audio
                </button>
                <button
                  disabled={currentLessonIdx === 0}
                  onClick={() => setCurrentLessonIdx(i => i - 1)}
                  onFocus={() => speak("Previous lesson button.")}
                  className={`py-3 border rounded-xl text-xs font-bold transition-all ${
                    isLight 
                      ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" 
                      : isDark
                        ? "bg-slate-800 border-white/10 text-white hover:bg-slate-750"
                        : "bg-black border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10"
                  } disabled:opacity-30`}
                >
                  ◀ Previous Lesson
                </button>
                <button
                  disabled={currentLessonIdx === activeCoursePlay.lessons.length - 1}
                  onClick={() => {
                    setCurrentLessonIdx(i => i + 1);
                    const nextP = Math.round(((currentLessonIdx + 1) / activeCoursePlay.lessons.length) * 100);
                    updateProgress(activeCoursePlay.id, nextP);
                  }}
                  onFocus={() => speak("Next lesson button.")}
                  className="py-3 bg-[#fbbf24] text-black font-black text-xs rounded-xl disabled:opacity-30"
                >
                  Next Lesson ▶
                </button>
              </div>
            </div>

            {/* Auditory Quiz block */}
            <div className={`p-6 rounded-xl flex flex-col gap-4 border-2 ${cardClass}`}>
              <h3 className={`text-sm font-bold uppercase ${isLight || isDark ? "text-slate-800" : "text-[#fbbf24]"}`}>Auditory Quiz check</h3>
              <p className={`text-xs font-bold leading-relaxed ${isLight || isDark ? "text-slate-700" : "text-slate-250"}`}>{activeCoursePlay.quiz.question}</p>
              
              <div className="flex flex-col gap-2">
                {activeCoursePlay.quiz.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleTopicQuizSubmit(opt)}
                    onFocus={() => speak(`Option: ${opt} button.`)}
                    disabled={issuingCert}
                    className={`w-full py-3.5 px-4 border rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      isLight 
                        ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-750 hover:border-yellow-500" 
                        : isDark
                          ? "bg-slate-950 hover:bg-slate-900 border-white/10 text-slate-300 hover:border-yellow-400"
                          : "bg-black hover:bg-[#fbbf24]/10 border-[#fbbf24] text-[#fbbf24]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. AI NARRATOR VOICE TUTOR */}
        {activeTab === "ai-tutor" && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-3xl mx-auto w-full h-[calc(100vh-140px)]">
            <div className={`border-b pb-4 ${isLight ? "border-slate-200" : isDark ? "border-white/10" : "border-[#fbbf24]"}`}>
              <h1 className={`text-2xl font-black ${textTitleClass}`}>AccessAI Audio Tutor</h1>
              <p className="text-xs text-slate-505">Dicatate your question and AI responses will be narrated out loud.</p>
            </div>

            <div className={`flex gap-2 p-2 rounded-xl border ${innerCardClass}`}>
              {[
                { id: "chat", label: "Auditory Chat", icon: "forum" },
                { id: "homework", label: "Upload Code Help", icon: "school" }
              ].map(subT => (
                <button
                  key={subT.id}
                  onClick={() => setAiTutorTab(subT.id)}
                  onFocus={() => speak(`Sub tab ${subT.label} button.`)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    aiTutorTab === subT.id 
                      ? "bg-[#fbbf24] text-black" 
                      : isLight 
                        ? "text-slate-500 hover:text-slate-900" 
                        : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-[#fbbf24]/60 hover:text-[#fbbf24]"
                  }`}
                >
                  {subT.label}
                </button>
              ))}
            </div>

            {aiTutorTab === "chat" && (
              <div className="flex-1 flex flex-col justify-between gap-4 overflow-hidden">
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b ${isLight ? "border-slate-200" : isDark ? "border-white/10" : "border-[#fbbf24]/50"}`}>
                  <button
                    onClick={() => handleQuickQuestion("Explain Python def keyword and functions")}
                    onFocus={() => speak("Ask prompt about Python functions button.")}
                    className={`p-3 rounded-xl text-xs text-left font-bold ${innerCardClass} ${isLight || isDark ? "text-slate-800" : "text-[#fbbf24]"}`}
                  >
                    Prompt: Python def keyword?
                  </button>
                  <button
                    onClick={() => handleQuickQuestion("Generate auditory programming quiz")}
                    onFocus={() => speak("Ask to generate custom quiz button.")}
                    className={`p-3 rounded-xl text-xs text-left font-bold ${innerCardClass} ${isLight || isDark ? "text-slate-800" : "text-[#fbbf24]"}`}
                  >
                    Prompt: Generate vocal quiz?
                  </button>
                </div>

                {/* Chat content scroll */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 pr-2">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div 
                        className={`max-w-xl p-4 rounded-xl text-xs leading-relaxed border ${
                          msg.sender === "user" 
                            ? "bg-[#fbbf24] text-black font-black border-[#fbbf24]" 
                            : isLight 
                              ? "bg-slate-100 border-slate-200 text-slate-700" 
                              : isDark
                                ? "bg-slate-900 border-white/5 text-slate-350"
                                : "bg-black border-2 border-[#fbbf24]/50 text-[#fbbf24]"
                        }`}
                        tabIndex={0}
                        onFocus={() => speak(`${msg.sender === "user" ? "You asked" : "AI tutor replied"}: ${msg.text}`)}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat text input */}
                <div className={`flex gap-3 p-3 rounded-2xl items-center border-2 ${
                  isLight 
                    ? "bg-white border-slate-300" 
                    : isDark 
                      ? "bg-[#121b2d]/50 border-white/10"
                      : "bg-black border-[#fbbf24]"
                }`}>
                  <button 
                    onClick={() => {
                      const next = !isVoiceChatActive;
                      setIsVoiceChatActive(next);
                      speak(next ? "Voice recording mic activated." : "Mic muted.");
                    }}
                    onFocus={() => speak("Voice dictation toggle mic button.")}
                    className={`p-3 rounded-xl transition-all ${
                      isVoiceChatActive 
                        ? "bg-emerald-600 text-white animate-pulse" 
                        : isLight 
                          ? "bg-slate-200 text-slate-650" 
                          : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="material-symbols-outlined !text-base">settings_voice</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Type or dictate a query..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                    className={`flex-1 bg-transparent text-xs outline-none placeholder-slate-500 ${isLight ? "text-slate-900" : isDark ? "text-white" : "text-[#fbbf24]"}`}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    onFocus={() => speak("Send message button.")}
                    className="p-3 bg-[#fbbf24] text-black rounded-xl"
                  >
                    <span className="material-symbols-outlined !text-sm">send</span>
                  </button>
                </div>
              </div>
            )}

            {aiTutorTab === "homework" && (
              <div 
                className={`p-8 rounded-2xl flex flex-col gap-4 text-center cursor-pointer border-2 ${cardClass}`}
                onClick={() => speak("Audio file select dialog prompt loading.")}
                tabIndex={0}
                onFocus={() => speak("Upload homework or audio scripts. Press enter to upload.")}
              >
                <span className={`material-symbols-outlined !text-4xl animate-pulse ${isLight || isDark ? "text-slate-800" : "text-[#fbbf24]"}`}>cloud_upload</span>
                <p className={`text-xs font-black ${isLight || isDark ? "text-slate-700" : "text-[#fbbf24]"}`}>Press Enter to select file or drop text lessons logs</p>
              </div>
            )}
          </div>
        )}

        {/* 7. ACTIVITY DASHBOARD VIEW */}
        {activeTab === "activity" && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-4xl mx-auto w-full">
            <div>
              <h1 className={`text-2xl font-black ${textTitleClass}`}>Study Activity Records</h1>
              <p className="text-xs text-slate-550">Verbal review logs of weekly completed minutes.</p>
            </div>

            <div 
              className={`p-6 rounded-2xl flex flex-col gap-4 border-2 ${cardClass}`}
              tabIndex={0}
              onFocus={() => speak("Weekly minutes statistics. Monday: 15 minutes, Tuesday: 45 minutes, Wednesday: 30 minutes, Friday: 60 minutes. Total streak is maintained.")}
            >
              <h3 className={`text-xs font-bold uppercase ${isLight || isDark ? "text-slate-700" : "text-[#fbbf24]"}`}>Auditory activity logs</h3>
              
              <div className="flex justify-between items-end h-40 px-4 mt-4">
                {[
                  { day: "Mon", min: 15, h: "25%" },
                  { day: "Tue", min: 45, h: "75%" },
                  { day: "Wed", min: 30, h: "50%" },
                  { day: "Thu", min: 10, h: "15%" },
                  { day: "Fri", min: 60, h: "100%" },
                  { day: "Sat", min: 25, h: "40%" },
                  { day: "Sun", min: 40, h: "65%" }
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`relative w-6 border rounded-md h-28 flex items-end ${innerCardClass}`}>
                      <div className={`w-full ${isLight || isDark ? "bg-amber-500" : "bg-[#fbbf24]"}`} style={{ height: bar.h }} />
                    </div>
                    <span className="text-[10px] text-slate-550 font-bold">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-4">
              <h3 className={`text-lg font-bold ${textTitleClass}`}>Earned Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: "Quick Learner", desc: "First purchase completed", icon: "verified" },
                  { title: "Weekly Master", desc: "Maintained a 7-day streak", icon: "local_fire_department" },
                  { title: "Python Master", desc: "Python quiz 100%", icon: "school" }
                ].map((badge, idx) => (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-2xl flex flex-col items-center gap-2 text-center border-2 ${cardClass}`}
                    tabIndex={0}
                    onFocus={() => speak(`Badge: ${badge.title}. Description: ${badge.desc}`)}
                  >
                    <span className={`material-symbols-outlined !text-2xl ${isLight || isDark ? "text-amber-500" : "text-[#fbbf24]"}`}>{badge.icon}</span>
                    <h4 className={`text-xs font-bold ${textTitleClass}`}>{badge.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. PROFILE & CERTIFICATES */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-4xl mx-auto w-full">
            <div 
              className={`p-8 rounded-3xl border-2 ${cardClass}`}
              tabIndex={0}
              onFocus={() => speak(`User profile ${getEffectiveStudentName(user, "blind")}. Audio-assistance student account.`)}
            >
              <h2 className={`text-2xl font-black ${textTitleClass}`}>{getEffectiveStudentName(user, "blind")}</h2>
              <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : isDark ? "text-slate-400" : "text-[#fbbf24]/85"}`}>
                Audio-assistance student profile · {topicCertificates.length} Topic Proofs · {Object.values(progress || {}).filter(p => p?.completion === 100).length} Courses Completed
              </p>
            </div>

            {/* Career Readiness Certificates Section */}
            {careerCertificates.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-base font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2`}>
                    <span className="material-symbols-outlined !text-lg">workspace_premium</span>
                    Career Readiness Credentials ({careerCertificates.length})
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    5 of 5 Courses Verified
                  </span>
                </div>
                {careerCertificates.map((cc) => (
                  <div
                    key={cc.certificateId}
                    className={`p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-2 border-indigo-500/40 ${cardClass}`}
                    tabIndex={0}
                    onFocus={() =>
                      speak(
                        `Career Readiness Credential: ${cc.careerPathTitle || "Career Path"}. 5 courses verified. Certificate ID: ${cc.certificateId}. Anchored on MST Blockchain.`
                      )
                    }
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
                          Career NFT Credential
                        </span>
                        {cc.tokenId && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold font-mono">
                            Token #{cc.tokenId}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                          Valid On-Chain
                        </span>
                      </div>
                      <h3 className={`text-base font-bold mt-1 ${textTitleClass}`}>
                        {cc.careerPathTitle || cc.courseName || "Career Path"}
                      </h3>
                      <p className="text-xs text-indigo-400 font-semibold">{cc.track || "5-Course Specialized Curriculum"}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {cc.certificateId}</p>
                      <p className="text-[11px] text-slate-500 italic mt-1">
                        * Career-readiness credential confirming skills learned.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          speak("Navigating to public blockchain verification page.");
                          navigate(`/verify?id=${cc.certificateId}`);
                        }}
                        onFocus={() => speak(`Verify career credential on MST Blockchain.`)}
                        className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined !text-base">verified</span> Verify
                      </button>
                      <a
                        href={`http://127.0.0.1:5000/certificate/download/${cc.certificateId}`}
                        download
                        onFocus={() => speak("Download Career Certificate PDF")}
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined !text-base">download</span> PDF
                      </a>
                      <a
                        href={`http://127.0.0.1:5000/certificate/view/${cc.certificateId}`}
                        target="_blank"
                        rel="noreferrer"
                        onFocus={() => speak("View Career Certificate in new tab")}
                        className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined !text-base">visibility</span> View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Video Topic Certificates Section */}
            {topicCertificates.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className={`text-base font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2`}>
                  <span className="material-symbols-outlined !text-lg">video_library</span>
                  Video Topic Certificates ({topicCertificates.length})
                </h3>
                {topicCertificates.map((tc) => (
                  <div
                    key={tc.certificateId}
                    className={`p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-2 border-emerald-500/30 ${cardClass}`}
                    tabIndex={0}
                    onFocus={() => speak(`Topic certificate: ${tc.topicName || "Topic"}. Course: ${tc.courseName || "Course"}. ID: ${tc.certificateId}. Valid on MST Blockchain.`)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Topic NFT Certificate
                        </span>
                        {tc.tokenId && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold font-mono">
                            Token #{tc.tokenId}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-base font-bold mt-1 ${textTitleClass}`}>{tc.topicName || "Topic Lesson"}</h3>
                      <p className="text-xs text-slate-500">Course: {tc.courseName || "Course"}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {tc.certificateId}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tc.certificateId);
                          speak("Certificate code copied to clipboard.");
                        }}
                        onFocus={() => speak(`Copy topic certificate code ${tc.certificateId} button.`)}
                        className="px-4 py-3 bg-[#fbbf24] text-black font-black text-xs rounded-xl cursor-pointer"
                      >
                        Copy ID
                      </button>
                      <a
                        href={`http://127.0.0.1:5000/certificate/download/${tc.certificateId}`}
                        download
                        onFocus={() => speak(`Download official PDF certificate for topic ${tc.topicName}.`)}
                        className="px-4 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined !text-base">download</span> Download PDF
                      </a>
                      <button
                        onClick={() => navigate(`/verify?id=${tc.certificateId}`)}
                        onFocus={() => speak(`Verify topic certificate on MST Blockchain.`)}
                        className="px-4 py-3 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 cursor-pointer"
                      >
                        Verify On-Chain
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-bold ${textTitleClass}`}>Course Completion Certificates</h2>
                <button
                  type="button"
                  onClick={() => navigate("/verify")}
                  className={`text-xs font-bold underline cursor-pointer ${isLight ? "text-amber-700" : "text-[#fbbf24]"}`}
                >
                  Verify on MST Testnet &rarr;
                </button>
              </div>

              {Object.entries(progress || {})
                .filter(([_, p]) => p?.completion === 100)
                .map(([cId, p]) => {
                  const cMatch = courses.find(c => c.id === cId) || { title: cId };
                  const certCode = p?.blockchain?.certificateId || `CERT-${cId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${(user?.uid || "STU").slice(0, 6).toUpperCase()}`;
                  const tokenId = p?.blockchain?.tokenId;

                  return (
                    <div 
                      key={cId} 
                      className={`p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-2 ${cardClass}`}
                      tabIndex={0}
                      onFocus={() => speak(`Certificate NFT for: ${cMatch.title}. Token ID: ${tokenId ? `#${tokenId}` : "Active"}. Certificate ID: ${certCode}. Validated on MST Blockchain.`)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">MST Testnet NFT</span>
                          {tokenId && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold font-mono">
                              Token #{tokenId}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-base font-bold mt-1 ${textTitleClass}`}>{cMatch.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-mono">ID: {certCode}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(certCode);
                            speak("Certificate code copied to clipboard.");
                          }}
                          onFocus={() => speak(`Copy certificate code ${certCode} button.`)}
                          className="px-4 py-3 bg-[#fbbf24] text-black font-black text-xs rounded-xl cursor-pointer"
                        >
                          Copy ID
                        </button>
                        <a
                          href={`http://127.0.0.1:5000/certificate/download/${certCode}`}
                          download
                          onFocus={() => speak(`Download official PDF certificate for ${cMatch.title}.`)}
                          className="px-4 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined !text-base">download</span> Download PDF
                        </a>
                        <button
                          onClick={() => navigate(`/verify?id=${certCode}`)}
                          onFocus={() => speak(`Verify certificate ${certCode} on MST Blockchain.`)}
                          className="px-4 py-3 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 cursor-pointer"
                        >
                          Verify On-Chain
                        </button>
                      </div>
                    </div>
                  );
                })}

              {Object.values(progress || {}).filter(p => p?.completion === 100).length === 0 && (
                <div 
                  className={`p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-2 ${cardClass}`}
                  tabIndex={0}
                  onFocus={() => speak("Demo NFT certificate for American Sign Language Fundamentals. Token ID: #1. ID: CERT-ACCESSAI-DEMO-2026-001. Live on MST Testnet.")}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">MST Testnet Live NFT</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold font-mono">
                        Token #1
                      </span>
                    </div>
                    <h3 className={`text-base font-bold mt-1 ${textTitleClass}`}>American Sign Language Fundamentals</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">ID: CERT-ACCESSAI-DEMO-2026-001</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="http://127.0.0.1:5000/certificate/download/CERT-ACCESSAI-DEMO-2026-001"
                      download
                      onFocus={() => speak("Download sample American Sign Language certificate PDF.")}
                      className="px-4 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined !text-base">download</span> Download PDF
                    </a>
                    <button
                      onClick={() => navigate("/verify?id=CERT-ACCESSAI-DEMO-2026-001")}
                      onFocus={() => speak("Verify demo certificate on MST Blockchain.")}
                      className="px-4 py-3 bg-[#fbbf24] text-black font-black text-xs rounded-xl cursor-pointer"
                    >
                      Verify Demo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9. ACCESSIBILITY SETTINGS */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-2xl mx-auto w-full">
            <div>
              <h1 className={`text-2xl font-black ${textTitleClass}`}>Accessibility Settings</h1>
              <p className="text-xs text-slate-550">Configure speech options and high contrast guidance outlines.</p>
            </div>

            <div className={`p-8 rounded-2xl flex flex-col gap-6 border-2 ${cardClass}`}>
              {/* TTS Speed */}
              <div className="pb-6 border-b border-slate-200/40 flex flex-col gap-3">
                <h3 className={`text-sm font-bold ${isLight || isDark ? "text-slate-800" : "text-[#fbbf24]"}`} tabIndex={0} onFocus={() => speak("TTS narration speed configuration. Select Slow, Normal, or Fast.")}>Audio Speech Speed</h3>
                <div className="flex gap-2">
                  {["slow", "normal", "fast"].map(speed => (
                    <button
                      key={speed}
                      onClick={() => { setTtsSpeed(speed); speak(`Narration speed set to ${speed}.`); }}
                      onFocus={() => speak(`Set speed to ${speed} button.`)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                        ttsSpeed === speed 
                          ? "bg-[#fbbf24] text-black border-[#fbbf24]" 
                          : isLight 
                            ? "bg-slate-200 border-transparent text-slate-700 hover:bg-slate-300" 
                            : isDark
                              ? "bg-slate-955 border-white/5 text-slate-400 hover:bg-slate-900"
                              : "bg-black border-[#fbbf24]/30 text-[#fbbf24] hover:bg-[#fbbf24]/10"
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast */}
              <div className="pb-6 border-b border-slate-200/40 flex flex-col gap-3">
                <h3 className={`text-sm font-bold ${isLight || isDark ? "text-slate-850" : "text-[#fbbf24]"}`} tabIndex={0} onFocus={() => speak("Contrast layout selector. Choose Light theme, Dark theme, or High Contrast.")}>Interface Contrast Mode</h3>
                <div className="flex gap-2">
                  {[
                    { id: "light", label: "SaaS Light" },
                    { id: "standard-dark", label: "Standard Dark" },
                    { id: "high-contrast", label: "Yellow High Contrast" }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => { setContrastTheme(theme.id); speak(`Contrast updated to ${theme.label}.`); }}
                      onFocus={() => speak(`Select ${theme.label} button.`)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        contrastTheme === theme.id 
                          ? "bg-[#fbbf24] text-black border-[#fbbf24]" 
                          : isLight 
                            ? "bg-slate-200 border-transparent text-slate-750 hover:bg-slate-300" 
                            : isDark
                              ? "bg-slate-955 border-white/5 text-slate-400 hover:bg-slate-900"
                              : "bg-black border-[#fbbf24]/30 text-[#fbbf24] hover:bg-[#fbbf24]/10"
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font scaling */}
              <div className="flex flex-col gap-3">
                <h3 className={`text-sm font-bold ${isLight || isDark ? "text-slate-800" : "text-[#fbbf24]"}`} tabIndex={0} onFocus={() => speak("Text scaling options. Select extra large or extra extra large.")}>Content Font Size</h3>
                <div className="flex gap-2">
                  {["xl", "xxl"].map(fs => (
                    <button
                      key={fs}
                      onClick={() => { setFontSize(fs); speak(`Text scaling set to ${fs}.`); }}
                      onFocus={() => speak(`Adjust font to ${fs} button.`)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all border ${
                        fontSize === fs 
                          ? "bg-[#fbbf24] text-black border-[#fbbf24]" 
                          : isLight 
                            ? "bg-slate-200 border-transparent text-slate-750 hover:bg-slate-300" 
                            : isDark
                              ? "bg-slate-955 border-white/5 text-slate-400 hover:bg-slate-900"
                              : "bg-black border-[#fbbf24]/30 text-[#fbbf24] hover:bg-[#fbbf24]/10"
                      }`}
                    >
                      {fs}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Embedded focused element outlines styles */}
      <style>{`
        *:focus-visible { 
          outline: 4px solid #fbbf24 !important; 
          outline-offset: 4px !important; 
        }
      `}</style>

      <CertificateModal
        isOpen={!!earnedCertData}
        onClose={() => setEarnedCertData(null)}
        certificateData={earnedCertData}
        mode="blind"
        speak={speak}
      />
    </div>
  );
}