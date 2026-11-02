import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import SignLearning from "../components/SignLearning";
import SignAvatarAssistant from "../components/SignAvatarAssistant";
import { SignGuideView } from "../components/DeafMuteMode";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";
import WalletBadge from "../components/WalletBadge";
import { useWallet } from "../context/WalletContext";
import CertificateModal from "../components/CertificateModal";
import { getEffectiveStudentName } from "../utils/studentSession";
import CareerLearningPaths from "../components/CareerLearningPaths";
import DegreeGraduationOffer from "../components/DegreeGraduationOffer";
import RewardStoreModal from "../components/RewardStoreModal";
import BackButton from "../components/BackButton";
import MekoContextInspector from "../components/MekoContextInspector";
import MekoService from "../services/meko";
import { DEAF_MODE_COURSES, DEAF_CATEGORIES, DEAF_LEARN_PRACTISE_EARN } from "../data/deafCoursesData";


// High-quality courses database with guaranteed embeddable YouTube links
const MOCK_COURSES = DEAF_MODE_COURSES;

export default function DeafDashboard() {
  const { user, logout, DEMO_MODE } = useAuth();
  const { t, language, getCourseText } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState("home"); // home, courses, my-learning, ai-tutor, activity, profile, settings

  // Sync activeTab state with URL subpaths
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const tab = pathParts[1] || "home";
    const prevTab = prevTabRef.current;
    setActiveTab(tab);
    
    // Only reset course player if the user explicitly navigates away to a non-learning tab
    const learningTabs = ["home", "courses", "my-learning", "rewards-store"];
    if (tab !== prevTab && !learningTabs.includes(tab)) {
      setSelectedCourse(null);
      setActiveCoursePlay(null);
    }
    prevTabRef.current = tab;
  }, [location.pathname]);
  
  // Nested views
  const [selectedCourse, setSelectedCourse] = useState(null); // Course details page
  const [activeCoursePlay, setActiveCoursePlay] = useState(null); // Course player
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);

  const isOverview = activeTab === "home" && !selectedCourse && !activeCoursePlay;

  const handleBackClick = () => {
    if (activeCoursePlay || selectedCourse) {
      setActiveCoursePlay(null);
      setSelectedCourse(null);
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
      navigate("/deaf", { replace: true });
    }
  };

  // Search & filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const studentUid = user?.uid || "deaf_student";
  // Database lists (Deaf/Mute Mode Employment & Practical Courses)
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [purchasedIds, setPurchasedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`accessai_purchased_courses_deaf_${studentUid}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ["deaf-course-1", "deaf-course-2"];
  });
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(`accessai_course_progress_deaf_${studentUid}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      "deaf-course-1": { completion: 60 },
      "deaf-course-2": { completion: 20 },
      "deaf-course-3": { completion: 0 },
      "deaf-course-4": { completion: 0 },
      "deaf-course-5": { completion: 0 }
    };
  });

  // Course Player enhanced accessibility tabs & interactive exercises
  const [playerTab, setPlayerTab] = useState("guide"); // guide, transcript, exercise, quiz
  const [exerciseText, setExerciseText] = useState("");
  const [exerciseFeedback, setExerciseFeedback] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem(`accessai_completed_lessons_deaf_${studentUid}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { "les-canva-1": true, "les-canva-2": true };
  });

  // Persist progress & purchased courses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`accessai_purchased_courses_deaf_${studentUid}`, JSON.stringify(purchasedIds));
    } catch (e) {}
  }, [purchasedIds, studentUid]);

  useEffect(() => {
    try {
      localStorage.setItem(`accessai_course_progress_deaf_${studentUid}`, JSON.stringify(progress));
    } catch (e) {}
  }, [progress, studentUid]);

  useEffect(() => {
    try {
      localStorage.setItem(`accessai_completed_lessons_deaf_${studentUid}`, JSON.stringify(completedLessons));
    } catch (e) {}
  }, [completedLessons, studentUid]);

  // AI Tutor Chat states
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello! I am your AccessAI Sign Language tutor. Ask me any question about ASL grammar, vocabulary, or ask me to generate a custom quiz!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [aiTutorTab, setAiTutorTab] = useState("chat"); // chat, homework, quiz-gen

  // Quiz state in course player
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [quizCorrect, setQuizCorrect] = useState(null);
  const {
    account: walletAccount,
    refreshPoints,
    availablePoints,
    unlockedItems: walletUnlockedItems,
    openStore,
  } = useWallet();

  const isCourseUnlocked = (cId) => {
    return purchasedIds.includes(cId) || (walletUnlockedItems && walletUnlockedItems.includes(cId));
  };

  const handleLaunchCourse = (course) => {
    setSelectedCourse(course);
    setActiveCoursePlay(course);
    setCurrentLessonIdx(0);
    setQuizSubmitted(false);
    setQuizCorrect(null);
    setSelectedOption("");
    setActiveTab("courses");
    navigate("/deaf/courses");
  };
  const [earnedCertData, setEarnedCertData] = useState(null);
  const [topicCertificates, setTopicCertificates] = useState(() => {
    try {
      const stored = localStorage.getItem("accessai_topic_certs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [issuingCert, setIssuingCert] = useState(false);
  const [careerCertificates, setCareerCertificates] = useState(() => {
    try {
      const stored = localStorage.getItem("accessai_career_certs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync earned certificates from backend
  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const uId = user?.uid || "demo-uid-deaf";
        const [res, cRes] = await Promise.all([
          API.get(`/progress/certificates/${uId}`),
          API.get(`/career/certificates/${uId}`).catch(() => ({ data: { certificates: [] } })),
        ]);
        if (res.data?.topicCertificates?.length > 0) {
          setTopicCertificates(res.data.topicCertificates);
          localStorage.setItem("accessai_topic_certs", JSON.stringify(res.data.topicCertificates));
        }
        const backendCareerCerts = cRes.data?.certificates || res.data?.careerCertificates || [];
        if (backendCareerCerts.length > 0) {
          setCareerCertificates(backendCareerCerts);
          localStorage.setItem("accessai_career_certs", JSON.stringify(backendCareerCerts));
        }
      } catch (e) {
        // demo / local fallback
      }
    };
    fetchCerts();
  }, [user?.uid]);


  // Spatial Accessibility Cursor Focus state (for sign navigation)
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Auto-focus 1st item whenever tab or nested view changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [activeTab, selectedCourse, activeCoursePlay]);

  // Contrast theme
  const [contrastTheme, setContrastTheme] = useState("light"); // light (white), dark, high-contrast
  const [pipInterpreter, setPipInterpreter] = useState(true);

  // User Stats state
  const [studyStreak] = useState(7);
  const [studyMinutesToday] = useState(25);

  // Ensure Voice Agent is completely muted/silent on Deaf/Mute Dashboard
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Load backend database if possible (fallback to mock in demo/dev mode)
  useEffect(() => {
    if (DEMO_MODE) return;
    const fetchDB = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          API.get("/courses"),
          API.get(`/progress/${user?.uid}`)
        ]);
        if (cRes.data?.courses?.length > 0) {
          const deafBackendCourses = cRes.data.courses.filter(c => 
            ["design", "office_skills", "media", "writing", "marketing"].includes(c.category)
          );
          if (deafBackendCourses.length >= 5) setCourses(deafBackendCourses);
        }
        if (pRes.data?.progress) {
          const pMap = {};
          pRes.data.progress.forEach(p => { pMap[p.courseId] = p; });
          setProgress(pMap);
        }
      } catch (e) {
        console.warn("Could not load backend courses, using premium local dataset.", e);
      }
    };
    fetchDB();
  }, [user?.uid, DEMO_MODE]);

  // Handle course buying
  const handleBuyCourse = (courseId) => {
    if (purchasedIds.includes(courseId)) return;
    setPurchasedIds(prev => [...prev, courseId]);
    setProgress(prev => ({ ...prev, [courseId]: { completion: 0 } }));
  };

  // Update lesson progress and automatically award certificate on completion
  const updateProgress = async (courseId, pct) => {
    setProgress(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], completion: pct }
    }));

    if (pct === 100) {
      const cObj = courses.find(c => c.id === courseId) || {};
      const activeWallet = walletAccount || localStorage.getItem("accessai_wallet_address");
      const cleanCourse = courseId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const cleanUid = ((user?.uid || "DEAF01").replace(/[^a-zA-Z0-9]/g, "")).slice(0, 6).toUpperCase();
      const studentName = getEffectiveStudentName(user, "deaf");
      const fallbackCert = {
        certificateId: `CERT-${cleanCourse}-${cleanUid}`,
        courseName: cObj.title || courseId,
        studentName: studentName,
        pointsAwarded: 50,
      };

      try {
        const res = await API.post("/progress", {
          userId: user?.uid || "demo-uid-deaf",
          courseId,
          courseTitle: cObj.title || courseId,
          courseName: cObj.title || courseId,
          studentName: studentName,
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
        console.warn("Progress save warning:", err);
        setProgress(prev => ({
          ...prev,
          [courseId]: { ...prev[courseId], completion: 100, blockchain: fallbackCert }
        }));
        setEarnedCertData(fallbackCert);
      }
    }
  };

  const handleTopicQuizSubmit = async () => {
    if (!selectedOption || !activeCoursePlay) return;
    setQuizSubmitted(true);
    const isCorrect = selectedOption === activeCoursePlay.quiz.answer;
    setQuizCorrect(isCorrect);

    if (isCorrect) {
      const currentLesson = activeCoursePlay.lessons[currentLessonIdx] || {
        id: `topic-${currentLessonIdx + 1}`,
        title: `Topic ${currentLessonIdx + 1}`,
      };
      const studentName = getEffectiveStudentName(user, "deaf");
      const activeWallet = walletAccount || localStorage.getItem("accessai_wallet_address");

      setIssuingCert(true);
      try {
        const res = await API.post("/progress/topic", {
          userId: user?.uid || "demo-uid-deaf",
          courseId: activeCoursePlay.id,
          courseTitle: activeCoursePlay.title,
          topicId: currentLesson.id,
          topicTitle: currentLesson.title,
          studentName: studentName,
          walletAddress: activeWallet || undefined,
        });

        const bData = res.data?.blockchain || res.data?.certificate;
        if (bData) {
          setTopicCertificates(prev => {
            const exists = prev.some(tc => tc.certificateId === bData.certificateId);
            const updated = exists ? prev : [bData, ...prev];
            localStorage.setItem("accessai_topic_certs", JSON.stringify(updated));
            return updated;
          });
          setEarnedCertData(bData);
        }
      } catch (err) {
        console.warn("Topic cert issue failed, fallback locally:", err);
        const cleanCourse = activeCoursePlay.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const cleanTopic = currentLesson.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const cleanUid = ((user?.uid || "DEAF01").replace(/[^a-zA-Z0-9]/g, "")).slice(0, 6).toUpperCase();
        const fallbackTopicCert = {
          certificateId: `CERT-${cleanCourse}-${cleanTopic}-${cleanUid}`,
          courseName: activeCoursePlay.title,
          topicName: currentLesson.title,
          studentName: studentName,
          pointsAwarded: 0,
          type: "topic",
        };
        setTopicCertificates(prev => [fallbackTopicCert, ...prev]);
        setEarnedCertData(fallbackTopicCert);
      } finally {
        setIssuingCert(false);
      }

      // Proportional progress for the course
      const nextPct = Math.round(((currentLessonIdx + 1) / activeCoursePlay.lessons.length) * 100);
      updateProgress(activeCoursePlay.id, nextPct);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = { sender: "user", text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput("");
    
    setTimeout(() => {
      let replyText = "Interesting query! In ASL, palm orientation and facial expressions are key variables.";
      if (chatInput.toLowerCase().includes("alphabet") || chatInput.toLowerCase().includes("abc")) {
        replyText = "The ASL alphabet is a 1-handed system. Make sure you don't bounce your letters when fingerspelling unless you are spelling doubles!";
      } else if (chatInput.toLowerCase().includes("grammar") || chatInput.toLowerCase().includes("sentence")) {
        replyText = "ASL utilizes a Topic-Comment sentence structure. Establish the topic first with raised eyebrows, then describe the action (comment) with eyebrows lowered or relaxed.";
      } else if (chatInput.toLowerCase().includes("quiz")) {
        replyText = "Let's test your skills! What eyebrow movement is required when signing a Yes/No question in ASL? (Hint: They should be raised!)";
      }
      setChatMessages(prev => [...prev, { sender: "ai", text: replyText }]);
    }, 1000);
  };

  const handleQuickQuestion = (qText) => {
    setChatInput(qText);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleGenerateQuiz = () => {
    setChatMessages(prev => [
      ...prev,
      { sender: "ai", text: "Here is your generated ASL vocabulary check: What is the palm orientation when signing numbers 1 to 5 in ASL?" }
    ]);
  };

  // Filter courses library
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || c.category === category;
    const matchesDifficulty = difficulty === "all" || c.level.toLowerCase() === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // UI Theme Config (Match Login page #f7f9fb)
  const isLight = contrastTheme === "light";
  const bgClass = isLight ? "bg-[#f7f9fb] text-[#191c1e]" : "bg-[#090d16] text-[#e2e8f0]";
  const sidebarClass = isLight ? "bg-white border-slate-200 text-[#191c1e]" : "bg-[#0a0f1d]/75 border-white/5 text-[#e2e8f0]";
  const cardClass = isLight ? "bg-white border border-slate-200/80 shadow-sm text-slate-800" : "bg-[#121b2d]/50 border-white/5 text-slate-300";
  const innerCardClass = isLight ? "bg-slate-50 border border-slate-200/50" : "bg-[#0a0f1d]/40 border-white/5";
  const textTitleClass = isLight ? "text-slate-900" : "text-white";
  const inputClass = isLight ? "bg-white border border-slate-300 text-slate-900" : "bg-[#080d16] border border-white/10 text-white";

  return (
    <div className={`h-screen max-h-screen w-full flex overflow-hidden ${bgClass} font-sans`}>
      {/* ── Column 1: Left Sidebar Navigation (240px Wide, 36px Items) ── */}
      <aside className="w-[240px] border-r border-[#E2EDF8] bg-white flex flex-col justify-between sticky top-0 h-screen z-40 flex-shrink-0 overflow-y-auto">
        <div className="p-3">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#0866F5] text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>sign_language</span>
            </div>
            <div className="flex flex-col cursor-pointer min-w-0" onClick={() => navigate("/deaf")}>
              <span className="text-lg font-black text-[#10265C] tracking-tight leading-none truncate">AccessAI</span>
              <span className="text-[8px] font-black uppercase tracking-wider text-[#0866F5] mt-0.5 truncate">
                DEAF & HARD OF HEARING
              </span>
            </div>
          </div>

          {/* Navigation Items (36px Height Each) */}
          <nav className="flex flex-col gap-1">
            {/* Overview - Main Navigation */}
            <button
              onClick={() => navigate("/deaf")}
              className={`w-full h-[36px] flex items-center gap-2.5 px-3 py-1 rounded-lg text-left text-xs font-semibold transition-all flex-shrink-0 ${
                activeTab === "home"
                  ? "bg-[#0866F5] text-white shadow-xs font-bold"
                  : "text-slate-700 hover:text-[#10265C] hover:bg-slate-100"
              }`}
            >
              <span className={`material-symbols-outlined !text-lg ${activeTab === "home" ? "text-white" : "text-[#0866F5]"}`} style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              <span className="truncate">Overview</span>
            </button>

            {/* Standard Nav Links (36px Height Each) */}
            {[
              { id: "meeting", label: "Live Classroom Meet", icon: "video_camera_front" },
              { id: "rewards-store", label: "Reward Store (Redeem)", icon: "storefront" },
              { id: "courses", label: "Course Library", icon: "grid_view" },
              { id: "my-learning", label: "My Learning", icon: "menu_book" },
              { id: "learn-signs", label: "Sign Practice", icon: "signal_cellular_alt" },
              { id: "sign-guide", label: "Sign Guide", icon: "menu_book" },
              { id: "ai-tutor", label: "AI Tutor", icon: "chat_bubble" },
              { id: "activity", label: "Activity Dashboard", icon: "analytics" },
              { id: "profile", label: "Profile & Certificates", icon: "account_circle" },
              { id: "settings", label: "Accessibility Settings", icon: "tune" }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "meeting") {
                    navigate("/meeting");
                  } else {
                    navigate(`/deaf/${item.id === "home" ? "" : item.id}`);
                  }
                }}
                className={`w-full h-[36px] flex items-center gap-2.5 px-3 py-1 rounded-lg text-left text-xs font-semibold transition-all flex-shrink-0 ${
                  activeTab === item.id
                    ? "bg-[#0866F5] text-white shadow-xs font-bold"
                    : "text-slate-700 hover:text-[#10265C] hover:bg-slate-100"
                }`}
              >
                <span className={`material-symbols-outlined !text-lg ${activeTab === item.id ? "text-white" : "text-[#0866F5]"}`}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User profile section at footer (Always visible) */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0866F5] flex items-center justify-center font-bold text-white text-xs shadow-xs flex-shrink-0">
              VG
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#10265C] leading-none truncate">{user?.displayName || "Vrusha Goyal"}</p>
              <p className="text-[9px] text-slate-500 mt-0.5 truncate">{t("deaf_role", "Deaf Accessibility Analyst")}</p>
            </div>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0" title={t("sign_out", "Sign out")}>
            <span className="material-symbols-outlined !text-lg">logout</span>
          </button>
        </div>
      </aside>

      {/* ── Column 2: Flexible Main Area (min-width: 0) ── */}
      <main className="flex-1 min-w-0 h-screen max-h-screen overflow-y-auto p-3.5 md:p-4 bg-[#F4F8FC] flex flex-col justify-between gap-3">

        {/* ── Header Inside Main Column (Never Covered) ── */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {!isOverview && (
              <BackButton
                fallback="/deaf"
                onClick={handleBackClick}
              />
            )}
            <h1 className="text-lg md:text-xl font-black text-[#10265C] tracking-tight truncate">
              Hello, {user?.displayName || "Vrusha Goyal"}!
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="bg-white border border-slate-200 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xs cursor-pointer text-xs font-bold text-slate-700 hover:border-blue-300">
              <span className="material-symbols-outlined !text-sm text-[#0866F5]">language</span>
              <span>Eng English</span>
              <span className="material-symbols-outlined !text-sm text-slate-400">expand_more</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#10265C] text-white flex items-center justify-center shadow-xs cursor-pointer">
              <span className="material-symbols-outlined !text-lg">person</span>
            </div>
          </div>
        </div>

        {/* 1. HOME DASHBOARD VIEW */}
        {activeTab === "home" && !selectedCourse && !activeCoursePlay && (
          <div className="flex flex-col gap-3 my-auto w-full min-w-0 animate-fadeIn">
            
            {/* ── Top Banner Cards Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
              {/* Nova AI Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#EAF5FF] to-[#E0F2FE] border border-[#08BFD0]/40 shadow-xs flex items-center justify-between gap-2.5 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#0866F5] flex items-center justify-center text-white shadow-xs flex-shrink-0">
                    <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      sign_language
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h2 className="text-[14px] font-bold text-[#10265C] truncate">
                        Nova AI – 3D Sign Language Avatar
                      </h2>
                      <span className="text-[8px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-cyan-100 text-[#08BFD0] border border-cyan-200 flex-shrink-0">
                        BOT
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Courses · Home · Practice</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("learn-signs");
                    navigate("/deaf/learn-signs");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#0866F5] text-white text-xs font-bold shadow-xs hover:bg-blue-600 transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer flex-shrink-0"
                >
                  <span>Open Sign Arena</span>
                </button>
              </div>

              {/* Live Classroom Meeting Card */}
              <div
                onClick={() => navigate("/meeting")}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/80 shadow-xs flex items-center justify-between gap-2.5 cursor-pointer hover:border-emerald-400 transition-all min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs flex-shrink-0">
                    <span className="material-symbols-outlined !text-xl">video_camera_front</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xs font-extrabold text-[#10265C] truncate">
                        Live Classroom Meeting
                      </h2>
                      <span className="text-[8px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 flex-shrink-0 animate-pulse">
                        LIVE
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Teacher Video, Live Captions & 3D Sign Avatar</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/meeting");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer flex-shrink-0"
                >
                  <span>Join Class</span>
                  <span className="text-xs font-bold">→</span>
                </button>
              </div>

              {/* Reward Store Card */}
              <div
                onClick={() => {
                  setActiveTab("rewards-store");
                  navigate("/deaf/rewards-store");
                }}
                className="p-3 rounded-2xl bg-[#FFF8F0] border border-orange-200 shadow-xs flex items-center justify-between gap-2.5 cursor-pointer hover:border-orange-300 transition-all min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-xs flex-shrink-0">
                    <span className="material-symbols-outlined !text-xl">storefront</span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs font-extrabold text-[#10265C] truncate">
                      Reward Store
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Redeem Courses & Diplomas</p>
                  </div>
                </div>
                <span className="material-symbols-outlined !text-lg text-slate-400 flex-shrink-0">chevron_right</span>
              </div>
            </div>

            {/* ── Stats Cards Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
              {/* Daily Goals Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-xs min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#0866F5]/10 text-[#0866F5] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined !text-lg">explore</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#10265C] truncate">DAILY GOALS</h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium truncate">Today's goal: 30 minutes</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-400">Progress</span>
                    <span className="font-bold text-[#0866F5]">83% Done</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0866F5] rounded-full" style={{ width: "83%" }}></div>
                  </div>
                </div>
              </div>

              {/* Progress Overview Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-xs min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined !text-lg">check_circle</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#10265C] truncate">PROGRESS OVERVIEW</h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium truncate">2 Completed Courses</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-400">Average</span>
                    <span className="font-bold text-emerald-600">50% Average</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "50%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Continue Learning Section ── */}
            <div className="flex flex-col gap-2 min-w-0">
              <h2 className="text-sm font-bold text-[#10265C] truncate">Continue Learning</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                {/* Course Card 1 (Focused) */}
                <div className="bg-white border-2 border-[#08BFD0] rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-xs relative min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between gap-1">
                    <span className="bg-[#08BFD0] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                      <span className="truncate">FOCUSED ✌️ TO SELECT</span>
                    </span>
                    <span className="text-xs font-black text-[#0866F5] flex-shrink-0">
                      {progress[courses[0]?.id]?.completion || 60}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#10265C] truncate">{courses[0]?.title}</h3>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-[#0866F5] rounded-full" style={{ width: `${progress[courses[0]?.id]?.completion || 60}%` }}></div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const target = courses[0];
                      if (target) {
                        setActiveCoursePlay(target);
                        setCurrentLessonIdx(0);
                        setExerciseText("");
                        setExerciseFeedback(null);
                      }
                    }}
                    className="w-full py-1.5 bg-[#08BFD0] hover:bg-[#07a7b6] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Resume Course</span>
                    <span className="material-symbols-outlined !text-sm">chevron_right</span>
                  </button>
                </div>

                {/* Course Card 2 (Compact) */}
                <div
                  onClick={() => {
                    const target = courses[1];
                    if (target) {
                      setActiveCoursePlay(target);
                      setCurrentLessonIdx(0);
                      setExerciseText("");
                      setExerciseFeedback(null);
                    }
                  }}
                  className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-xs min-w-0 overflow-hidden cursor-pointer hover:border-blue-300 transition-all"
                >
                  <div>
                    <span className="bg-[#EAF4FF] text-[#0866F5] text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                      {courses[1]?.level || "BEGINNER"}
                    </span>
                    <h3 className="text-xs font-bold text-[#10265C] mt-1 truncate">{courses[1]?.title}</h3>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0866F5] rounded-full" style={{ width: `${progress[courses[1]?.id]?.completion || 20}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-[#0866F5] flex-shrink-0">
                      {progress[courses[1]?.id]?.completion || 20}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RECOMMENDED FOR YOU ── */}
            <div className="flex flex-col gap-2 min-w-0">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#10265C] truncate">RECOMMENDED FOR YOU</h2>
              
              <div className="flex flex-col gap-2 min-w-0">
                {courses.filter(c => !purchasedIds.includes(c.id)).slice(0, 2).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="bg-white border border-slate-200 rounded-2xl p-2.5 px-3 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-300 shadow-xs transition-all min-w-0 overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#EAF4FF] text-[#0866F5] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined !text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>sign_language</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#10265C] truncate">{getCourseText(course).title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">{course.instructor} · {course.duration}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined !text-lg text-slate-400 flex-shrink-0">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── More for You (Fully Visible at Bottom) ── */}
            <div className="flex flex-col gap-2 min-w-0">
              <h2 className="text-xs font-bold text-[#10265C] truncate">More for You</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 min-w-0">
                {/* Mint Card */}
                <div className="bg-[#ECFDF5] border border-emerald-200 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-xs cursor-pointer hover:border-emerald-300 transition-all min-w-0 overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                      <span className="material-symbols-outlined !text-sm">campaign</span>
                    </div>
                    <span className="material-symbols-outlined !text-base text-emerald-600 flex-shrink-0">chevron_right</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#10265C] truncate">New ASL course released!</h4>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-medium line-clamp-2">Explore new lessons and grow your skills.</p>
                  </div>
                </div>

                {/* Lavender Card */}
                <div className="bg-[#F5F3FF] border border-purple-200 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-xs cursor-pointer hover:border-purple-300 transition-all min-w-0 overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                      <span className="material-symbols-outlined !text-sm">psychology</span>
                    </div>
                    <span className="material-symbols-outlined !text-base text-purple-600 flex-shrink-0">chevron_right</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#10265C] truncate">Advanced Classified Tutor AI</h4>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-medium line-clamp-2">Personalized support for better learning.</p>
                  </div>
                </div>

                {/* Light Blue Card */}
                <div className="bg-[#F0F9FF] border border-sky-200 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-xs cursor-pointer hover:border-sky-300 transition-all min-w-0 overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="w-7 h-7 rounded-full bg-[#0866F5] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                      <span className="material-symbols-outlined !text-sm">download</span>
                    </div>
                    <span className="material-symbols-outlined !text-base text-[#0866F5] flex-shrink-0">chevron_right</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#10265C] truncate">Update</h4>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-medium line-clamp-2">Latest features & improvements.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ACADEMIC HONORS DEGREE VIEW */}
        {activeTab === "degree-offer" && !selectedCourse && !activeCoursePlay && (
          <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fadeIn">
            <DegreeGraduationOffer
              mode="deaf"
              cardClass={cardClass}
              innerCardClass={innerCardClass}
              textTitleClass={textTitleClass}
            />
          </div>
        )}

        {/* CAREER LEARNING PATHS VIEW */}
        {activeTab === "career-paths" && !selectedCourse && !activeCoursePlay && (
          <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fadeIn">
            <CareerLearningPaths
              mode="deaf"
              cardClass={cardClass}
              innerCardClass={innerCardClass}
              textTitleClass={textTitleClass}
            />
          </div>
        )}

        {/* REWARDS STORE & MARKETPLACE VIEW */}
        {activeTab === "rewards-store" && !selectedCourse && !activeCoursePlay && (
          <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fadeIn">
            <RewardStoreModal
              embedded={true}
              onLaunchCourse={handleLaunchCourse}
              mode="deaf"
            />
          </div>
        )}

        {/* 2. COURSE LIBRARY VIEW */}
        {activeTab === "courses" && !selectedCourse && !activeCoursePlay && (
          <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-fadeIn">
            {/* Header */}
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${textTitleClass} mb-2`}>Explore Course Catalog</h1>
              <p className="text-sm text-slate-500">Accessible, employment-oriented curricula for deaf, hard-of-hearing, and non-speaking learners. 100% visual with synchronized captions and transcripts.</p>
            </div>

            {/* Academic Honors Degree Pathway Offer Banner */}
            <DegreeGraduationOffer
              mode="deaf"
              cardClass={cardClass}
              innerCardClass={innerCardClass}
              textTitleClass={textTitleClass}
            />

            {/* Search + filter bar */}
            <div className={`${cardClass} p-4 rounded-2xl flex flex-col md:flex-row gap-4`}>
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">search</span>
                <input  
                  type="text"
                  placeholder="Search courses by title, topic, or career skill..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`w-full rounded-xl py-2 px-10 text-xs placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${inputClass}`}
                />
              </div>
              <div className="flex gap-3">
                <select value={category} onChange={e => setCategory(e.target.value)} className={`text-xs rounded-xl px-4 py-2 outline-none cursor-pointer border ${inputClass}`}>
                  {DEAF_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={`text-xs rounded-xl px-4 py-2 outline-none cursor-pointer border ${inputClass}`}>
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Courses Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => {
                const isOwned = isCourseUnlocked(course.id);
                const isFocused = index === focusedIndex;
                const coursePct = progress[course.id]?.completion || 0;
                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setFocusedIndex(index);
                      setSelectedCourse(course);
                    }}
                    className={`${cardClass} overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col justify-between relative ${
                      isFocused
                        ? "ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900 border-cyan-400 shadow-2xl shadow-cyan-500/30 scale-[1.02] z-20"
                        : ""
                    }`}
                  >
                    {/* Spatial Accessibility Cursor Focus Badge */}
                    {isFocused && (
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-cyan-500/50 animate-pulse z-30">
                        <span>👉 Focused</span>
                        <span className="text-[9px] opacity-80">(👍 to Select)</span>
                      </div>
                    )}

                    {/* Course Card Cover */}
                    <div className="h-36 bg-gradient-to-br from-primary/20 via-sky-100/50 to-secondary/10 p-5 flex flex-col justify-between border-b border-slate-200/50">
                      <div className="flex items-center justify-between gap-2">
                        <span className="self-start text-[10px] font-bold uppercase tracking-wider bg-white/80 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full backdrop-blur">
                          {course.badge}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-300">
                          {course.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                          <span className="material-symbols-outlined !text-sm text-primary">schedule</span>
                          {course.duration}
                        </span>
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                          ⭐ {course.rating}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="text-primary font-bold">{course.category.replace('_', ' ')}</span>
                          <span>{course.modules?.length || 5} Modules</span>
                        </div>
                        <h3 className={`text-base font-bold mt-1.5 leading-snug line-clamp-1 ${textTitleClass}`}>{course.title}</h3>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{course.description}</p>

                        {/* Learning Outcome Pill */}
                        {course.learningOutcome && (
                          <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-start gap-1.5">
                            <span className="material-symbols-outlined !text-sm text-primary mt-0.5 flex-shrink-0">workspace_premium</span>
                            <span className="line-clamp-2 leading-tight"><strong>Outcome:</strong> {course.learningOutcome}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar & Actions */}
                      <div className="border-t border-slate-200/50 pt-3 flex flex-col gap-2.5">
                        {isOwned && (
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400 font-medium">Progress</span>
                              <span className="text-primary font-bold">{coursePct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${coursePct}%` }}></div>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOwned) {
                              setActiveCoursePlay(course);
                              setCurrentLessonIdx(0);
                              setExerciseText("");
                              setExerciseFeedback(null);
                            } else {
                              handleBuyCourse(course.id);
                              setActiveCoursePlay(course);
                              setCurrentLessonIdx(0);
                              setExerciseText("");
                              setExerciseFeedback(null);
                            }
                          }}
                          className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isFocused
                              ? "bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/40"
                              : isOwned 
                                ? coursePct > 0
                                  ? "bg-primary text-white hover:brightness-110 shadow-md shadow-primary/20"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                                : "bg-primary text-white hover:brightness-110 shadow-md shadow-primary/20"
                          }`}
                        >
                          <span className="material-symbols-outlined !text-sm">
                            {isOwned ? (coursePct > 0 ? "play_circle" : "start") : "school"}
                          </span>
                          <span>
                            {isOwned 
                              ? (coursePct > 0 ? "Continue Learning" : "Start Learning (Enrolled)") 
                              : "Start Learning (Free)"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Learn, Practise & Earn Section ── */}
            <div className="mt-8 flex flex-col gap-5">
              <div className="border-t border-slate-200/80 pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary !text-2xl">verified_user</span>
                  <h2 className={`text-xl font-extrabold tracking-tight ${textTitleClass}`}>
                    Learn, Practise & Earn
                  </h2>
                </div>
                <p className="text-xs text-slate-500 max-w-3xl">
                  Structured career-readiness pathways designed specifically for deaf and hard-of-hearing learners. Build tangible portfolio samples, master asynchronous workplace communication, and prepare for remote employment opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DEAF_LEARN_PRACTISE_EARN.map((card) => (
                  <div
                    key={card.id}
                    className={`${cardClass} p-5 rounded-2xl flex flex-col justify-between border hover:shadow-lg transition-all duration-300`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} text-white flex items-center justify-center shadow-xs flex-shrink-0`}>
                          <span className="material-symbols-outlined !text-xl">{card.icon}</span>
                        </div>
                        <h3 className={`text-sm font-bold ${textTitleClass}`}>{card.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{card.description}</p>
                      <ul className="space-y-2">
                        {card.items.map((item, i) => (
                          <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2">
                            <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined !text-sm">check_circle</span>
                        {card.callToAction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. MY LEARNING VIEW */}
        {activeTab === "my-learning" && !selectedCourse && !activeCoursePlay && (
          <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-fadeIn">
            {/* Header */}
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${textTitleClass} mb-2`}>My Enrolled Courses</h1>
              <p className="text-sm text-slate-500">Resume study on your purchased content with real-time video captioning support.</p>
            </div>

            {/* Courses listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.filter(c => purchasedIds.includes(c.id)).map((course, index) => {
                const pct = progress[course.id]?.completion || 0;
                const isFocused = index === focusedIndex;
                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setFocusedIndex(index);
                      setActiveCoursePlay(course);
                      setCurrentLessonIdx(0);
                    }}
                    className={`${cardClass} p-6 rounded-2xl flex flex-col justify-between gap-4 relative transition-all ${
                      isFocused
                        ? "ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900 border-cyan-400 shadow-2xl shadow-cyan-500/30 scale-[1.02] z-20"
                        : ""
                    }`}
                  >
                    {/* Spatial Accessibility Cursor Focus Badge */}
                    {isFocused && (
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-cyan-500/50 animate-pulse z-30">
                        <span>👉 Focused</span>
                        <span className="text-[9px] opacity-80">(👍 to Select)</span>
                      </div>
                    )}

                    <div className="mt-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                        <span>Instructor: {course.instructor}</span>
                        <span className="text-primary">{course.level}</span>
                      </div>
                      <h3 className={`text-lg font-bold mt-2 ${textTitleClass}`}>{course.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{course.description}</p>
                    </div>

                    <div className="border-t border-slate-200/50 pt-4">
                      <div className="flex justify-between text-xs mb-2">
                        <span>Total Completion</span>
                        <span className="text-primary font-bold">{pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }}></div>
                      </div>
                      <button onClick={() => { setActiveCoursePlay(course); setCurrentLessonIdx(0); }} className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all ${
                        isFocused ? "bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/40" : "bg-primary text-white"
                      }`}>
                        Launch Course Player
                      </button>
                    </div>
                  </div>
                );
              })}
              {purchasedIds.length === 0 && (
                <div className="col-span-2 text-center py-16 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                  <span className="material-symbols-outlined !text-4xl text-slate-450 mb-2">library_books</span>
                  <p className="text-sm text-slate-550">You haven't enrolled in any courses yet.</p>
                  <button onClick={() => setActiveTab("courses")} className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl transition-all">
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COURSE DETAILS VIEW ── */}
        {selectedCourse && !activeCoursePlay && (
          <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fadeIn">
            {/* Back button */}
            <button 
              type="button"
              onClick={() => setSelectedCourse(null)} 
              className="self-start flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined !text-sm">arrow_back</span> Back to Catalog
            </button>

            {/* Banner block */}
            <div className="bg-gradient-to-br from-primary/15 via-sky-100/40 to-secondary/10 border border-slate-200/80 p-8 rounded-3xl flex flex-col md:flex-row justify-between gap-6 items-start md:items-end shadow-xs">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full">
                    {selectedCourse.badge}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                    {selectedCourse.level}
                  </span>
                </div>
                <h1 className={`text-3xl font-extrabold tracking-tight ${textTitleClass}`}>{selectedCourse.title}</h1>
                <p className="text-slate-600 text-sm mt-2 font-medium">
                  Instructor: {selectedCourse.instructor} · Duration: {selectedCourse.duration} · Rated ⭐ {selectedCourse.rating}
                </p>
              </div>

              <button 
                type="button"
                onClick={() => {
                  if (!purchasedIds.includes(selectedCourse.id)) {
                    handleBuyCourse(selectedCourse.id);
                  }
                  setActiveCoursePlay(selectedCourse); 
                  setCurrentLessonIdx(0); 
                  setExerciseText("");
                  setExerciseFeedback(null);
                }} 
                className="px-8 py-3.5 bg-primary hover:brightness-110 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-primary/20 cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                <span className="material-symbols-outlined !text-base">play_arrow</span>
                <span>{purchasedIds.includes(selectedCourse.id) ? "Resume Course" : "Start Learning (Free)"}</span>
              </button>
            </div>

            {/* Layout body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left col - Details */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <div>
                  <h3 className={`text-base font-bold ${textTitleClass} mb-2`}>About This Course</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedCourse.description}</p>
                </div>

                {/* Learning Outcome & Career Pathways */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined !text-base text-primary">workspace_premium</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">Key Learning Outcome</h4>
                    </div>
                    <p className="text-xs text-sky-950 leading-relaxed">{selectedCourse.learningOutcome}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined !text-base text-teal-700">trending_up</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">Career Pathway</h4>
                    </div>
                    <p className="text-xs text-teal-950 leading-relaxed">{selectedCourse.careerPathways}</p>
                  </div>
                </div>

                {/* Course Syllabus */}
                <div>
                  <h3 className={`text-base font-bold ${textTitleClass} mb-3 flex items-center justify-between`}>
                    <span>Course Lessons ({selectedCourse.lessons?.length || 0})</span>
                    <span className="text-xs font-normal text-slate-500">Self-Paced · Text & Visual Steps</span>
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {selectedCourse.lessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id} 
                        onClick={() => {
                          if (!purchasedIds.includes(selectedCourse.id)) {
                            handleBuyCourse(selectedCourse.id);
                          }
                          setActiveCoursePlay(selectedCourse);
                          setCurrentLessonIdx(idx);
                          setExerciseText("");
                          setExerciseFeedback(null);
                        }}
                        className={`${cardClass} p-3.5 px-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{lesson.title}</span>
                            <span className="text-[11px] text-slate-500 font-medium">Step-by-step visual tutorial & practical exercise</span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined !text-xs">schedule</span>
                          {lesson.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right col - Accessibility overview */}
              <div className="flex flex-col gap-6">
                <div className={`${cardClass} p-5 rounded-2xl flex flex-col gap-3.5 border`}>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Deaf-Centric Accessibility Design</h3>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { icon: "closed_caption", text: "100% Visual Subtitles & Captions" },
                      { icon: "menu_book", text: "Full Written Transcripts & Summaries" },
                      { icon: "visibility", text: "Step-by-Step Visual Action Cards" },
                      { icon: "mic_off", text: "Zero Spoken / Audio Requirement" },
                      { icon: "keyboard", text: "Full Keyboard Navigation Support" },
                      { icon: "verified", text: "Portfolio Project Practical Checks" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                        <span className="material-symbols-outlined text-primary !text-base">{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${cardClass} p-5 rounded-2xl flex flex-col gap-2.5 border bg-gradient-to-br from-slate-50 to-indigo-50/30`}>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-base">workspace_premium</span>
                    Portfolio Building
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Completing this course's practical tasks yields verifiable work artifacts you can add directly to your digital portfolio or CV.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COURSE PLAYER & LESSON PAGE VIEW ── */}
        {activeCoursePlay && (() => {
          const currentLesson = activeCoursePlay.lessons[currentLessonIdx] || activeCoursePlay.lessons[0];
          const isCurrentLessonDone = !!completedLessons[currentLesson.id];
          const totalLessons = activeCoursePlay.lessons.length;
          const completedCount = activeCoursePlay.lessons.filter(l => !!completedLessons[l.id]).length;
          const currentCoursePct = Math.round((completedCount / totalLessons) * 100);

          const handleMarkLessonComplete = () => {
            const nextMap = { ...completedLessons, [currentLesson.id]: true };
            setCompletedLessons(nextMap);
            const newCount = activeCoursePlay.lessons.filter(l => !!nextMap[l.id]).length;
            const newPct = Math.round((newCount / totalLessons) * 100);
            updateProgress(activeCoursePlay.id, newPct);
          };

          return (
            <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fadeIn">
              {/* Header info bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/60 pb-4">
                <div>
                  <button 
                    type="button"
                    onClick={() => setActiveCoursePlay(null)} 
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-1 cursor-pointer font-medium"
                  >
                    <span className="material-symbols-outlined !text-sm">arrow_back</span> Return to Catalog
                  </button>
                  <h2 className={`text-xl font-extrabold ${textTitleClass} flex items-center gap-2`}>
                    <span>{activeCoursePlay.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {activeCoursePlay.badge}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium">Lesson {currentLessonIdx + 1} of {totalLessons}</span>
                    <p className="text-primary font-bold text-xs mt-0.5 truncate max-w-[220px]">{currentLesson.title}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center text-xs font-black text-primary bg-primary/5">
                    {currentCoursePct}%
                  </div>
                </div>
              </div>

              {/* Player Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Player & Interactive Visual Guide */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Embedded YouTube video container */}
                  <div className="relative aspect-video bg-[#000] border border-slate-200 rounded-3xl overflow-hidden shadow-md flex items-center justify-center">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${currentLesson.video}?autoplay=1&enablejsapi=1&rel=0&controls=1`}
                      title={currentLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-none"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md border border-white/10 pointer-events-none">
                      <span className="material-symbols-outlined !text-xs text-cyan-400">closed_caption</span>
                      <span>Visual Captions Active</span>
                    </div>
                  </div>

                  {/* Lesson Navigation Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <button
                      type="button"
                      disabled={currentLessonIdx === 0}
                      onClick={() => {
                        setCurrentLessonIdx(i => i - 1);
                        setExerciseText("");
                        setExerciseFeedback(null);
                      }}
                      className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs text-slate-700 font-bold rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined !text-base">skip_previous</span> Previous Lesson
                    </button>

                    <button
                      type="button"
                      onClick={handleMarkLessonComplete}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isCurrentLessonDone 
                          ? "bg-emerald-600 text-white" 
                          : "bg-white text-slate-800 border border-slate-300 hover:border-emerald-500 hover:text-emerald-700"
                      }`}
                    >
                      <span className="material-symbols-outlined !text-base">
                        {isCurrentLessonDone ? "check_circle" : "check"}
                      </span>
                      <span>{isCurrentLessonDone ? "Lesson Completed ✓" : "Mark as Completed"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={currentLessonIdx === totalLessons - 1}
                      onClick={() => {
                        setCurrentLessonIdx(i => i + 1);
                        setExerciseText("");
                        setExerciseFeedback(null);
                      }}
                      className="px-5 py-2 bg-primary text-white hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      Next Lesson <span className="material-symbols-outlined !text-base">skip_next</span>
                    </button>
                  </div>

                  {/* Interactive Accessible Learning Tabs */}
                  <div className={`${cardClass} p-5 rounded-2xl border flex flex-col gap-4`}>
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 border-b border-slate-200/70 pb-3 overflow-x-auto">
                      {[
                        { id: "guide", label: "Visual Steps & Guide", icon: "visibility" },
                        { id: "transcript", label: "Captions & Transcript", icon: "closed_caption" },
                        { id: "exercise", label: "Hands-On Practical Task", icon: "assignment" },
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPlayerTab(t.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            playerTab === t.id
                              ? "bg-primary text-white shadow-xs"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="material-symbols-outlined !text-sm">{t.icon}</span>
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Tab 1: Visual Steps & Tutorial */}
                    {playerTab === "guide" && (
                      <div className="flex flex-col gap-4 animate-fadeIn">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Lesson {currentLessonIdx + 1} Visual Instructions
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed">{currentLesson.content}</p>
                        </div>

                        {currentLesson.visualSteps && (
                          <div className="flex flex-col gap-2 mt-1">
                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              Step-by-Step Action Guide
                            </h5>
                            <div className="space-y-2">
                              {currentLesson.visualSteps.map((step, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs text-slate-700 leading-snug">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Captions & Full Transcript */}
                    {playerTab === "transcript" && (
                      <div className="flex flex-col gap-3 animate-fadeIn">
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center gap-2">
                          <span className="material-symbols-outlined !text-base text-amber-700">info</span>
                          <span>This complete text transcript allows you to follow every lesson explanation without relying on audio or speech.</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-mono">
                          {currentLesson.transcript || "Transcript currently processing for this lesson segment."}
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Hands-On Practical Task */}
                    {playerTab === "exercise" && (
                      <div className="flex flex-col gap-4 animate-fadeIn">
                        {currentLesson.practicalExercise ? (
                          <>
                            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined !text-base text-primary">task</span>
                                {currentLesson.practicalExercise.title}
                              </h4>
                              <p className="text-xs text-indigo-900 leading-relaxed">
                                {currentLesson.practicalExercise.instruction}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-slate-700">
                                Your Practical Solution / Assignment Notes:
                              </label>
                              <textarea
                                rows={3}
                                value={exerciseText}
                                onChange={e => setExerciseText(e.target.value)}
                                placeholder="Describe your completed layout, paste text copy, share link, or note steps taken..."
                                className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!exerciseText.trim()) return;
                                  setExerciseFeedback(currentLesson.practicalExercise.successMessage);
                                  handleMarkLessonComplete();
                                }}
                                disabled={!exerciseText.trim()}
                                className="px-5 py-2.5 rounded-xl bg-primary hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <span className="material-symbols-outlined !text-base">verified</span>
                                <span>{currentLesson.practicalExercise.targetLabel || "Verify & Submit Assignment"}</span>
                              </button>

                              {exerciseFeedback && (
                                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                  <span className="material-symbols-outlined !text-sm">check_circle</span>
                                  {exerciseFeedback}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-slate-500">Practical task instructions for this module are integrated into the lesson walkthrough.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Quiz Check, Progress & Certification */}
                <div className="flex flex-col gap-6">
                  {/* Lesson Quiz Check Panel */}
                  <div className={`${cardClass} p-6 rounded-2xl flex flex-col gap-4 shadow-sm border`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 !text-base">quiz</span>
                      Lesson Comprehension Check
                    </h3>
                    <div>
                      <p className="text-xs leading-relaxed font-semibold text-slate-800">{activeCoursePlay.quiz.question}</p>
                      <div className="flex flex-col gap-2 mt-3.5">
                        {activeCoursePlay.quiz.options.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (quizSubmitted) return;
                              setSelectedOption(opt);
                            }}
                            className={`w-full py-2.5 px-3.5 text-xs text-left rounded-xl transition-all cursor-pointer ${
                              selectedOption === opt 
                                ? "bg-primary text-white font-bold shadow-md shadow-primary/20" 
                                : "bg-slate-50 border border-slate-200 text-slate-700 hover:border-primary/50"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {!quizSubmitted ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTopicQuizSubmit();
                          }}
                          disabled={!selectedOption || issuingCert}
                          className="w-full mt-4 py-2.5 bg-primary hover:brightness-110 active:scale-98 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                        >
                          {issuingCert ? (
                            <>
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                              <span>Minting Certificate on MST...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined !text-sm">verified</span>
                              <span>Submit Answer & Verify Topic</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="mt-4">
                          <div className={`p-3 rounded-xl text-center text-xs font-bold ${
                            quizCorrect ? "bg-green-500/10 border border-green-500/20 text-green-700" : "bg-red-500/10 border border-red-500/20 text-red-600"
                          }`}>
                            {quizCorrect ? "Correct answer! Well done! 🎉" : `Incorrect. ${activeCoursePlay.quiz.explanation || `Correct answer is: ${activeCoursePlay.quiz.answer}`}`}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuizSubmitted(false);
                              setSelectedOption("");
                              setQuizCorrect(null);
                            }}
                            className="w-full mt-3 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-300 cursor-pointer"
                          >
                            Retry Question
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Practice Challenge (Scenario Check) */}
                  {activeCoursePlay.practiceChallenge && (
                    <div className="bg-gradient-to-tr from-sky-50 to-teal-50/50 border border-sky-200/80 p-5 rounded-2xl flex flex-col gap-2.5 shadow-xs">
                      <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined !text-base text-primary">psychology</span>
                        {activeCoursePlay.practiceChallenge.title}
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {activeCoursePlay.practiceChallenge.scenario}
                      </p>
                      <div className="p-3 bg-white/80 rounded-xl border border-sky-200/60 text-xs text-sky-950 font-medium">
                        💡 <strong>Key Takeaway:</strong> {activeCoursePlay.practiceChallenge.feedback}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. AI TUTOR (ChatGPT/Gemini style) */}
        {activeTab === "ai-tutor" && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-fadeIn h-[calc(100vh-100px)]">
            {/* Header tab selectors */}
            <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
              <div>
                <h1 className={`text-2xl font-bold tracking-tight ${textTitleClass} mb-1`}>AccessAI Tutor</h1>
                <p className="text-xs text-slate-500">Ask ASL dictionary terms, test quizzes, or review code syntax.</p>
              </div>
              <div className={`flex p-1.5 rounded-xl border gap-2 bg-slate-100 border-slate-200`}>
                {[
                  { id: "chat", label: "ASL Chatbot", icon: "forum" },
                  { id: "homework", label: "Homework Help", icon: "school" },
                  { id: "quiz-gen", label: "Quiz Generator", icon: "playlist_add_check" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAiTutorTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      aiTutorTab === tab.id 
                        ? "bg-primary text-white shadow-md shadow-primary/10" 
                        : "text-slate-650 hover:text-slate-900"
                    }`}
                  >
                    <span className="material-symbols-outlined !text-base">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: CHATBOT */}
            {aiTutorTab === "chat" && (
              <div className="flex-1 flex flex-col justify-between gap-4 overflow-hidden">
                {/* Suggested prompt pills */}
                <div className="flex gap-2 flex-wrap pb-2 border-b border-slate-200/50">
                  {[
                    "How do I sign the double letter 'LL' in ASL?",
                    "Explain Topic-Comment sentence structure in ASL",
                    "Explain palm orientation for numbers 1 to 5"
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleQuickQuestion(prompt)}
                      className={`px-3.5 py-2 border text-[11px] rounded-xl transition-all hover:bg-slate-100 text-left ${cardClass}`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Message display area */}
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 py-2">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user" 
                          ? "bg-primary text-white font-medium rounded-tr-none" 
                          : `${cardClass} rounded-tl-none flex gap-3 items-start`
                      }`}>
                        {msg.sender === "ai" && (
                          <span className="material-symbols-outlined text-primary !text-lg flex-shrink-0">smart_toy</span>
                        )}
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Text entry field */}
                <div className={`${cardClass} flex gap-3 p-3 rounded-2xl items-center`}>
                  <button onClick={() => setIsVoiceChatActive(v => !v)} className={`p-2.5 rounded-xl transition-all ${
                    isVoiceChatActive ? "bg-emerald-600 text-white animate-pulse" : "bg-slate-200 text-slate-600 hover:text-slate-900"
                  }`} title="Toggle Voice Chat">
                    <span className="material-symbols-outlined !text-xl">settings_voice</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Type or ask your AI tutor a question about sign language..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
                  />
                  <button onClick={handleSendMessage} className="p-2.5 bg-primary text-white rounded-xl hover:brightness-110 transition-all">
                    <span className="material-symbols-outlined !text-lg">send</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HOMEWORK HELP */}
            {aiTutorTab === "homework" && (
              <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
                <div className={`${cardClass} p-6 rounded-2xl flex flex-col gap-4`}>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">upload_file</span>
                    Submit Homework or Sign Video
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload your recorded signing file or paste homework questions here. AccessAI will perform visual tracking and verify sign shape accuracy.
                  </p>

                  <div className="border-2 border-dashed border-slate-350 hover:border-primary rounded-xl p-12 text-center transition-all cursor-pointer bg-slate-50 flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined !text-4xl text-slate-400 animate-pulse">cloud_upload</span>
                    <span className="text-xs font-semibold text-slate-500">Drag and drop file, or select locally</span>
                    <span className="text-[10px] text-slate-400">Supports .mp4, .mov, or images up to 50MB</span>
                  </div>
                </div>

                <div className={`${cardClass} p-6 rounded-2xl flex flex-col gap-3`}>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined !text-base font-bold">auto_awesome</span> Homework Analysis Logs
                  </h4>
                  <p className="text-xs text-slate-450 italic">No files submitted yet. The camera analysis window will load logs here.</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: QUIZ GENERATOR */}
            {aiTutorTab === "quiz-gen" && (
              <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
                <div className={`${cardClass} p-6 rounded-2xl flex flex-col gap-6`}>
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">summarize</span>
                      Generate Custom ASL Quiz
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Specify topics and we will compile a visual mock assessment.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-slate-655 font-bold">Choose Target Topic</span>
                      <select className={`text-xs rounded-xl p-3 outline-none border ${inputClass}`}>
                        <option>Fingerspelling & Alphabet</option>
                        <option>Conversational Syntax (Grammar)</option>
                        <option>Numerical Vocabulary</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-slate-655 font-bold">Complexity</span>
                      <select className={`text-xs rounded-xl p-3 outline-none border ${inputClass}`}>
                        <option>Beginner level check</option>
                        <option>Intermediate grammar check</option>
                        <option>Advanced fluency check</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={handleGenerateQuiz} className="w-full py-3 bg-primary text-white font-bold text-xs rounded-xl hover:brightness-110 transition-all shadow-md shadow-primary/10">
                    Generate Practice Exam
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. ACTIVITY DASHBOARD */}
        {activeTab === "activity" && (
          <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-fadeIn">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">My Activity Dashboard</h1>
              <p className="text-sm text-slate-500">Review your study records, consistent days, and learning analysis.</p>
            </div>

            {/* Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Daily activity chart (Bar chart) */}
              <div className={`${cardClass} p-6 flex flex-col justify-between gap-4`}>
                <h3 className="text-sm font-bold uppercase tracking-wider">Weekly study minutes</h3>
                
                {/* SVG/CSS graph bars */}
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
                      <div className="relative w-8 bg-slate-100 border border-slate-200 rounded-md h-36 flex items-end">
                        <div className="w-full bg-gradient-to-t from-primary to-secondary rounded-md" style={{ height: bar.h }} />
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-primary font-bold">{bar.min}m</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning stats summary */}
              <div className="flex flex-col gap-6">
                <div className={`${cardClass} p-6 rounded-2xl flex flex-col gap-4`}>
                  <h3 className="text-sm font-bold uppercase tracking-wider">Fluency Progress</h3>
                  <div className="flex flex-col gap-4 mt-2">
                    {[
                      { topic: "Fingerspelling", pct: 95, color: "bg-primary" },
                      { topic: "Greetings Dialogue", pct: 60, color: "bg-secondary" },
                      { topic: "Facial Inflection (Syntax)", pct: 40, color: "bg-teal-500" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{item.topic}</span>
                          <span>{item.pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${cardClass} p-6 rounded-2xl flex flex-col gap-3`}>
                  <h3 className="text-sm font-bold uppercase tracking-wider">AI Insight</h3>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    Based on your quiz performance, practicing directional verb placements for 10 minutes on Wednesdays could boost grammar scores by 18%.
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements grid */}
            <div className="flex flex-col gap-4">
              <h2 className={`text-lg font-bold ${textTitleClass}`}>Earned Badges</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { title: "Quick Learner", desc: "First purchase completed", icon: "verified" },
                  { title: "Weekly Master", desc: "Maintained a 7-day streak", icon: "local_fire_department" },
                  { title: "Fluency Starter", desc: "ASL Alphabet score 100%", icon: "school" },
                  { title: "Tutor Pro", desc: "Used AI Tutor for 15+ queries", icon: "forum" }
                ].map((badge, idx) => (
                  <div key={idx} className={`${cardClass} p-5 rounded-2xl flex flex-col items-center text-center gap-3`}>
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined !text-2xl">{badge.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{badge.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. PROFILE & CERTIFICATES */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fadeIn">
            {/* User Bio Card */}
            <div className={`${cardClass} p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6`}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
                {getEffectiveStudentName(user, "deaf").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 flex flex-col gap-1 text-center md:text-left">
                <h2 className={`text-2xl font-bold ${textTitleClass}`}>{getEffectiveStudentName(user, "deaf")}</h2>
                <p className="text-sm text-slate-500">Deaf accessibility portal account · Active Learner</p>
                <div className="flex justify-center md:justify-start gap-4 mt-3">
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 font-bold">
                    {topicCertificates.length} Topic Proofs
                  </span>
                  <span className="text-xs bg-indigo-500/10 text-indigo-600 px-3 py-1 rounded-full border border-indigo-500/20 font-bold">
                    {Object.values(progress || {}).filter(p => p?.completion === 100).length} Completed Courses
                  </span>
                  <span className="text-xs bg-green-500/10 text-green-600 px-3 py-1 rounded-full border border-green-500/20 font-bold">7-Day Streak</span>
                </div>
              </div>
            </div>

            {/* Certificates Catalog */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold tracking-tight ${textTitleClass}`}>My On-Chain Certificates</h2>
                <button
                  type="button"
                  onClick={() => navigate("/verify")}
                  className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Verify Credential on MST</span>
                  <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Academic Honors Degree Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-base">school</span>
                    Academic Honors Degree & Pathway
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-300">
                    5 Major Specializations Required
                  </span>
                </div>
                <DegreeGraduationOffer
                  mode="deaf"
                  cardClass={cardClass}
                  innerCardClass={innerCardClass}
                  textTitleClass={textTitleClass}
                />
              </div>

              {/* Career Readiness Certificates Section */}
              {careerCertificates.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <span className="material-symbols-outlined !text-base">workspace_premium</span>
                      Career Readiness Credentials ({careerCertificates.length})
                    </h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 border border-indigo-200">
                      5/5 Courses Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {careerCertificates.map((cc) => (
                      <div key={cc.certificateId} className={`${cardClass} p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-indigo-600`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-700 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                              Career NFT Credential
                            </span>
                            <div className="flex items-center gap-1.5">
                              {cc.tokenId && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 font-bold font-mono">
                                  Token #{cc.tokenId}
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                                Valid On-Chain
                              </span>
                            </div>
                          </div>
                          <h3 className={`text-base font-bold mt-2 ${textTitleClass}`}>{cc.careerPathTitle || cc.courseName || "Career Path"}</h3>
                          <p className="text-xs text-indigo-600 font-semibold mt-0.5">{cc.track || "5-Course Comprehensive Program"}</p>
                          <p className="text-xs font-mono text-slate-500 mt-2">
                            ID: <span className="text-primary font-semibold">{cc.certificateId}</span>
                          </p>
                          {cc.completionDate && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Issued: {cc.completionDate}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500 italic mt-2">
                            * Career-readiness credential confirming skills learned.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/verify?id=${cc.certificateId}`)}
                            className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 hover:brightness-110 cursor-pointer"
                          >
                            <span className="material-symbols-outlined !text-base">verified</span> Verify on MST
                          </button>
                          <a
                            href={`http://127.0.0.1:5000/certificate/download/${cc.certificateId}`}
                            download
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            title="Download Certificate PDF"
                          >
                            <span className="material-symbols-outlined !text-base">download</span> PDF
                          </a>
                          <a
                            href={`http://127.0.0.1:5000/certificate/view/${cc.certificateId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            title="View Certificate Inline"
                          >
                            <span className="material-symbols-outlined !text-base">visibility</span> View
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Topic Certificates Section */}
              {topicCertificates.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-base">video_library</span>
                    Video Topic Certificates ({topicCertificates.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {topicCertificates.map((tc) => (
                      <div key={tc.certificateId} className={`${cardClass} p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-emerald-500`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Topic NFT Certificate
                            </span>
                            <div className="flex items-center gap-1.5">
                              {tc.tokenId && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-bold font-mono">
                                  Token #{tc.tokenId}
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                                Valid On-Chain
                              </span>
                            </div>
                          </div>
                          <h3 className={`text-base font-bold mt-2 ${textTitleClass}`}>{tc.topicName || tc.topicTitle || "Video Lesson Topic"}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Course: {tc.courseName || tc.courseTitle || "Course"}</p>
                          <p className="text-xs font-mono text-slate-500 mt-2">
                            ID: <span className="text-primary font-semibold">{tc.certificateId}</span>
                          </p>
                          {tc.certificateHash && (
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate" title={tc.certificateHash}>
                              Hash: <span className="text-slate-600">{tc.certificateHash.slice(0, 16)}...</span>
                            </p>
                          )}
                          {tc.completionDate && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Completed: {tc.completionDate}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/verify?id=${tc.certificateId}`)}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 hover:brightness-110 cursor-pointer"
                          >
                            <span className="material-symbols-outlined !text-base">verified</span> Verify on MST
                          </button>
                          <a
                            href={`http://127.0.0.1:5000/certificate/download/${tc.certificateId}`}
                            download
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            title="Download Certificate PDF"
                          >
                            <span className="material-symbols-outlined !text-base">download</span> PDF
                          </a>
                          <a
                            href={`http://127.0.0.1:5000/certificate/view/${tc.certificateId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            title="View Certificate Inline"
                          >
                            <span className="material-symbols-outlined !text-base">visibility</span> View
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Completion Certificates Section */}
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined !text-base">school</span>
                  Course Completion Certificates
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Dynamically render completed courses with on-chain proofs */}
                {Object.entries(progress || {})
                  .filter(([_, p]) => p?.completion === 100)
                  .map(([cId, p]) => {
                    const cMatch = courses.find(c => c.id === cId) || { title: cId };
                    const certCode = p?.blockchain?.certificateId || `CERT-${cId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${(user?.uid || "STU").slice(0, 6).toUpperCase()}`;
                    const txHash = p?.blockchain?.certificateTxHash;
                    const tokenId = p?.blockchain?.tokenId;
                    const certHash = p?.blockchain?.certificateHash;

                    return (
                      <div key={cId} className={`${cardClass} p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-emerald-500`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-500">
                              MST Blockchain NFT
                            </span>
                            <div className="flex items-center gap-1.5">
                              {tokenId && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-bold font-mono">
                                  Token #{tokenId}
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">
                                Valid On-Chain
                              </span>
                            </div>
                          </div>
                          <h3 className={`text-base font-bold mt-1.5 ${textTitleClass}`}>{cMatch.title}</h3>
                          <p className="text-xs font-mono text-slate-500 mt-2">
                            ID: <span className="text-primary font-semibold">{certCode}</span>
                          </p>
                          {certHash && (
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate" title={certHash}>
                              Hash: <span className="text-slate-600">{certHash.slice(0, 16)}...</span>
                            </p>
                          )}
                          {p?.updatedAt && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Issued: {new Date(p.updatedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/verify?id=${certCode}`)}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 hover:brightness-110"
                          >
                            <span className="material-symbols-outlined !text-base">verified</span> Verify on MST
                          </button>
                          <a
                            href={`http://127.0.0.1:5000/certificate/download/${certCode}`}
                            download
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                            title="Download Certificate PDF"
                          >
                            <span className="material-symbols-outlined !text-base">download</span> PDF
                          </a>
                          {txHash && (
                            <a
                              href={`https://testnetscan.mstblockchain.com/tx/${txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
                              title="View Transaction on Explorer"
                            >
                              <span className="material-symbols-outlined !text-sm">open_in_new</span> Tx
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Default demo certificate if no completed courses yet */}
                {Object.values(progress || {}).filter(p => p?.completion === 100).length === 0 && (
                  <div className={`${cardClass} p-6 rounded-2xl flex flex-col justify-between gap-4 border-l-4 border-l-sky-500`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-sky-500">
                          Demo NFT Credential
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-bold font-mono">
                            Token #1
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 font-semibold">
                            MST Testnet Live
                          </span>
                        </div>
                      </div>
                      <h3 className={`text-base font-bold mt-1.5 ${textTitleClass}`}>American Sign Language Fundamentals</h3>
                      <p className="text-xs font-mono text-slate-500 mt-2">
                        ID: <span className="text-primary font-semibold">CERT-ACCESSAI-DEMO-2026-001</span>
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Hash: 0x434552542d41...
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Anchored on MST Testnet</p>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => navigate("/verify?id=CERT-ACCESSAI-DEMO-2026-001")}
                        className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 hover:brightness-110"
                      >
                        <span className="material-symbols-outlined !text-base">verified</span> Verify on MST
                      </button>
                      <a
                        href="http://127.0.0.1:5000/certificate/download/CERT-ACCESSAI-DEMO-2026-001"
                        download
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                        title="Download Certificate PDF"
                      >
                        <span className="material-symbols-outlined !text-base">download</span> PDF
                      </a>
                      <a
                        href="https://testnetscan.mstblockchain.com/tx/0x3a99a3436b2194a727fc8198725c7a96ebac0f7b4ebcc8feac903b24961b924a"
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined !text-sm">open_in_new</span> Tx
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 7. ACCESSIBILITY SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-fadeIn">
            {/* Title */}
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${textTitleClass} mb-2`}>Accessibility Settings</h1>
              <p className="text-sm text-slate-500">Configure visual subtitles, high-contrast, or interface settings.</p>
            </div>

            {/* Config Forms */}
            <div className={`${cardClass} p-8 rounded-2xl flex flex-col gap-6`}>


              {/* Theme Settings */}
              <div className="flex flex-col gap-3 pb-6 border-b border-slate-200/50">
                <h3 className="text-sm font-bold">General Interface Theme</h3>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span>Contrast Settings</span>
                  <div className="flex gap-2">
                    {[
                      { id: "light", label: "SaaS Light" },
                      { id: "dark", label: "Dark" },
                      { id: "high-contrast", label: "High Contrast" }
                    ].map(themeOpt => (
                      <button key={themeOpt.id} onClick={() => {
                        setContrastTheme(themeOpt.id);
                      }} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        contrastTheme === themeOpt.id ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                      }`}>
                        {themeOpt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sign PIP Settings */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold">Video PIP Interpreter</h3>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span>Display secondary PIP Interpreter window</span>
                  <button onClick={() => setPipInterpreter(p => !p)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    pipInterpreter ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {pipInterpreter ? "Interpreter ACTIVE" : "Interpreter INACTIVE"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. LEARN SIGNS (INTERACTIVE GESTURE RECOGNITION) */}
        {activeTab === "learn-signs" && (
          <SignLearning
            isLight={isLight}
            cardClass={cardClass}
            innerCardClass={innerCardClass}
            textTitleClass={textTitleClass}
          />
        )}

        {/* 9. SIGN GUIDE & GESTURE REFERENCE */}
        {activeTab === "sign-guide" && (
          <SignGuideView
            isLight={isLight}
            cardClass={cardClass}
            innerCardClass={innerCardClass}
            textTitleClass={textTitleClass}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setSelectedCourse(null);
              setActiveCoursePlay(null);
              navigate(tab === "home" ? "/deaf" : `/deaf/${tab}`);
            }}
          />
        )}
      </main>

      {/* ── Column 3: Dedicated 300px Right Panel (Nova Sign AI Avatar Bot) ── */}
      <SignAvatarAssistant
        embedded={true}
        isPracticeMode={activeTab === "learn-signs"}
        isLight={isLight}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setSelectedCourse(null);
          setActiveCoursePlay(null);
          navigate(tab === "home" ? "/deaf" : `/deaf/${tab}`);
        }}
        onSelect={() => {
          // Dynamic Spatial Sign Selection based on active screen context:
          if (activeCoursePlay) {
            // In course player: advance lesson or take quiz
            if (currentLessonIdx < activeCoursePlay.lessons.length - 1) {
              setCurrentLessonIdx(i => i + 1);
            } else {
              setQuizSubmitted(false);
            }
          } else if (selectedCourse) {
            // In course detail view: launch or buy course
            if (purchasedIds.includes(selectedCourse.id)) {
              setActiveCoursePlay(selectedCourse);
              setCurrentLessonIdx(0);
            } else {
              handleBuyCourse(selectedCourse.id);
              setActiveCoursePlay(selectedCourse);
              setCurrentLessonIdx(0);
            }
          } else if (activeTab === "courses") {
            // In course catalog: select the focused course
            const targetCourse = filteredCourses[focusedIndex] || filteredCourses[0];
            if (targetCourse) {
              setSelectedCourse(targetCourse);
            }
          } else if (activeTab === "my-learning" || activeTab === "home") {
            // In enrolled / home view: launch focused course
            const enrolled = courses.filter(c => purchasedIds.includes(c.id));
            const targetCourse = enrolled[focusedIndex] || enrolled[0] || courses[0];
            if (targetCourse) {
              setActiveCoursePlay(targetCourse);
              setCurrentLessonIdx(0);
            }
          } else if (activeTab === "learn-signs") {
            // In sign learning: toggle camera
            setFocusedIndex(0);
          }
        }}
        onOpenSignPractice={() => {
          setActiveTab("learn-signs");
          navigate("/deaf/learn-signs");
        }}
      />

      <CertificateModal
        isOpen={!!earnedCertData}
        onClose={() => setEarnedCertData(null)}
        certificateData={earnedCertData}
        mode="deaf"
      />

      {/* ── Meko Context Inspector ── */}
      <MekoContextInspector 
        studentDatapackId="student-deaf-memory" 
        sharedDatapackId="course-leadership-shared" 
        buildDatapackId="accessai-build" 
      />
    </div>
  );
}