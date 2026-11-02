import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import { MeetingChannel } from "../services/meetingChannel";
import LanguageSelector from "../components/LanguageSelector";
import MekoContextInspector from "../components/MekoContextInspector";
import MekoService from "../services/meko";
import { computeCohortAnalytics, getActiveDemoCohort, resetDemoCohortData, recordDemoIntervention, getDemoInterventionHistory } from "../data/simulatedCohortData";

function SparkleIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="teacher-dash-sparkle" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0066ff" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        fill="url(#teacher-dash-sparkle)"
      />
    </svg>
  );
}

// ── AccessAI Student Diagnostic & Telemetry Intelligence Datasets ──
const ACCESSAI_COHORT_METRICS = {
  healthIndex: 94.2,
  avgMastery: 87.4,
  captionReliance: 98.2,
  activeFlaggedIssues: 2,
  modalities: [
    {
      id: "deaf",
      label: "Deaf & Hard of Hearing",
      icon: "sign_language",
      count: 42,
      primaryMetricName: "Sign Recognition Precision",
      primaryMetricVal: "95.4%",
      retentionScore: 92,
      captionRate: "99.1%",
      avgHoldStabilization: "620ms",
      visualFatigue: "Low",
      color: "indigo"
    },
    {
      id: "blind",
      label: "Blind & Low Vision",
      icon: "visibility_off",
      count: 38,
      primaryMetricName: "Voice Command Fluency",
      primaryMetricVal: "92.8%",
      retentionScore: 89,
      captionRate: "N/A (Auditory)",
      avgHoldStabilization: "142 WPM",
      visualFatigue: "Zero (Screen Reader)",
      color: "blue"
    },
    {
      id: "motor",
      label: "Motor Impaired",
      icon: "accessible",
      count: 24,
      primaryMetricName: "Head-Tracking Precision",
      primaryMetricVal: "91.2%",
      retentionScore: 85,
      captionRate: "94.0%",
      avgHoldStabilization: "1.2s Dwell",
      visualFatigue: "Moderate",
      color: "teal"
    }
  ],
  interventionQueue: [
    {
      id: "int-1",
      studentName: "Aman Halkude",
      mode: "blind",
      topic: "Python Nested Loops & Indentation",
      severity: "Moderate",
      struggleTime: "18 mins on Lesson 3 quiz",
      aiRecommendation: "Offer acoustic tone cues for indentation depth and enable 0.8x speech rate."
    },
    {
      id: "int-2",
      studentName: "Vrusha Goyal",
      mode: "deaf",
      topic: "ASL Numbers 11-20 Rapid Finger Flicking",
      severity: "High",
      struggleTime: "4 consecutive failed recognition attempts",
      aiRecommendation: "Suggest slow-motion 0.5x 3D Avatar playback and palm orientation review."
    }
  ]
};

const DETAILED_STUDENT_PROFILES = {
  "active-student-session": {
    name: "Vrusha Goyal",
    mode: "deaf",
    streak: "8 Days 🔥",
    studyMinutes: 145,
    signAccuracyHeatmap: [
      { sign: "Open Palm (Hello)", accuracy: 98, status: "Mastered" },
      { sign: "Thumbs Up (Yes/Agree)", accuracy: 96, status: "Mastered" },
      { sign: "Closed Fist (No/Disagree)", accuracy: 95, status: "Mastered" },
      { sign: "Pointing Up (Question)", accuracy: 94, status: "Mastered" },
      { sign: "Victory (Peace)", accuracy: 96, status: "Mastered" },
      { sign: "ILY Sign (Thank You)", accuracy: 91, status: "Proficient" },
      { sign: "Numbers 1-10", accuracy: 88, status: "In Progress" },
      { sign: "Numbers 11-20", accuracy: 72, status: "Needs Practice" }
    ],
    accommodations: {
      captions: "Always On (High Contrast Cyan)",
      speed: "1.0x Normal",
      input: "Hands-Free Sign Camera + Text",
      language: "English / Hindi / ASL"
    },
    blockchainCerts: [
      { name: "ASL Alphabet & Syntax Mastery", hash: "0x89f...2d1", date: "Oct 28, 2026" },
      { name: "Inclusive Digital Collaboration", hash: "0x4b2...9a7", date: "Oct 30, 2026" }
    ],
    aiNotes: "Demonstrates exceptional palm orientation on conversational greetings. Hand jitter detected during rapid number changes—recommend 0.5x gesture replay."
  }
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "analytics" | "students" | "progress" | "rn" | "settings"
  const [selectedStudent, setSelectedStudent] = useState(null); // For Profile drawer
  const [students, setStudents] = useState(() => getActiveDemoCohort());
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  // Selected student for AccessAI Student Drilldown
  const [drilldownStudentKey, setDrilldownStudentKey] = useState("active-student-session");
  const [demoCohort, setDemoCohort] = useState(() => getActiveDemoCohort());
  const [demoAnalytics, setDemoAnalytics] = useState(() => computeCohortAnalytics());
  const [demoInterventions, setDemoInterventions] = useState(() => getDemoInterventionHistory());
  const [demoFilterMode, setDemoFilterMode] = useState("all"); // "all" | "deaf" | "blind" | "motor"
  const [demoSearch, setDemoSearch] = useState("");
  const [rosterFilterMode, setRosterFilterMode] = useState("all"); // "all" | "flagship" | "deaf" | "blind" | "motor"
  const isFlagshipStudent = (st) =>
    st &&
    (st.id === "demo-deaf-001" ||
      st.id === "demo-blind-001" ||
      st.id === "demo-motor-001" ||
      st.name === "Vrusha Goyal" ||
      st.name === "Aman Halkude" ||
      st.name === "Aarav Patel");
  const [rosterSearch, setRosterSearch] = useState("");
  const [interventionToast, setInterventionToast] = useState(null);
  const [syncingStudentId, setSyncingStudentId] = useState(null);
  const overviewQuickStudents = [
    ...students.filter(isFlagshipStudent),
    ...students.filter((st) => !isFlagshipStudent(st))
  ].slice(0, 6);

  const filteredRosterStudents = students.filter((s) => {
    if (rosterFilterMode === "flagship") {
      if (!isFlagshipStudent(s)) return false;
    } else if (rosterFilterMode !== "all" && s.mode !== rosterFilterMode) {
      return false;
    }
    if (rosterSearch) {
      const q = rosterSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.mode && s.mode.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // ── RN (Realtime Network) State ──
  const [rnConnected, setRnConnected] = useState(false);
  const [rnMessages, setRnMessages] = useState([]);
  const [rnBroadcastText, setRnBroadcastText] = useState("");
  const [rnParticipants, setRnParticipants] = useState([]);
  const channelRef = useRef(null);

  // Fetch student records from Supabase / Local storage
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      let fetchedList = [];

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .neq("role", "teacher");
        if (!error && Array.isArray(data) && data.length > 0) {
          fetchedList = data.map((p) => ({
            id: p.id,
            name: p.name || p.full_name || p.email?.split("@")[0] || "Registered Student",
            email: p.email || "student@accessai.edu",
            mode: p.disability_type || p.disabilityType || "deaf",
            enrolledCourses: p.enrolled_courses || 2,
            progress: p.progress || 0,
            assessmentScore: p.assessment_score || "Pending",
            lastActive: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Active today"
          }));
        }
      } catch (err) {}

      // Load the comprehensive 90-Student Simulated Demo Cohort
      const demoCohortList = getActiveDemoCohort();
      const combined = [...fetchedList];
      for (const d of demoCohortList) {
        if (!combined.some((s) => s.id === d.id || s.name === d.name)) {
          combined.push({
            ...d,
            enrolledCourses: d.enrolledCourses || (d.learningActivity?.currentCourse ? 3 : 2),
            progress: d.progress || 78,
            assessmentScore: d.assessmentScore || "88%",
            lastActive: d.lastActive || "Active today",
            isDemo: true
          });
        }
      }

      setStudents(combined);
    } catch (err) {
      console.warn("Could not fetch students:", err);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Initialize Realtime Network
  useEffect(() => {
    const channel = new MeetingChannel("accessai-classroom-main", {
      id: user?.uid || user?.id || "teacher-host",
      name: user?.displayName || user?.user_metadata?.name || "Teacher / Host",
      mode: "teacher",
      role: "Teacher / Host"
    });

    channelRef.current = channel;
    setRnConnected(true);
    setRnParticipants(channel.getParticipants());

    const unsubscribe = channel.onMessage((incoming) => {
      setRnMessages((prev) => [...prev, incoming]);
    });

    return () => {
      unsubscribe();
      channel.destroy();
    };
  }, [user]);

  const handleSendBroadcast = (e) => {
    if (e) e.preventDefault();
    if (!rnBroadcastText.trim() || !channelRef.current) return;

    channelRef.current.sendTextMessage(rnBroadcastText.trim(), {
      senderMode: "teacher",
      senderName: user?.displayName || "Instructor",
      isTeacherAnnouncement: true
    });

    setRnBroadcastText("");
  };

  const handleSendIntervention = async (item) => {
    if (!item) return;
    const sId = item.studentId || item.id;
    setSyncingStudentId(sId);
    setInterventionToast(`Syncing guidance for ${item.studentName} to Meko Cloud (Datapack 3bbeb08c)...`);

    try {
      const res = await MekoService.sendDemoIntervention(item, item.aiRecommendation);
      if (res && (res.meko_synced || res.success)) {
        if (channelRef.current) {
          channelRef.current.sendTextMessage(
            `[Personal Guidance for ${item.studentName}]: ${item.aiRecommendation}`,
            { senderMode: "teacher", isIntervention: true }
          );
        }

        const entry = res.entry || recordDemoIntervention(item, item.aiRecommendation);
        if (entry) {
          setDemoInterventions((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)]);
        }

        setInterventionToast(`✓ Confirmed by Meko Cloud: Guidance for ${item.studentName} saved to Datapack 3bbeb08c!`);
      } else {
        const errDetail = res?.meko_response?.error || "Meko server returned unconfirmed response";
        setInterventionToast(`⚠️ Meko Sync Warning: ${errDetail}`);
      }
    } catch (err) {
      setInterventionToast(`❌ Meko Connection Error: ${err.message}`);
    } finally {
      setSyncingStudentId(null);
      setTimeout(() => setInterventionToast(null), 6000);
    }
  };

  const handleResetDemoCohort = async () => {
    await MekoService.resetDemoCohort();
    resetDemoCohortData();
    const fresh = getActiveDemoCohort();
    setDemoCohort(fresh);
    setDemoAnalytics(computeCohortAnalytics(fresh));
    setDemoInterventions(getDemoInterventionHistory());
    setStudents(fresh);
    setInterventionToast("90-Student Demo Dataset reset successfully. Real student records remain untouched.");
    setTimeout(() => setInterventionToast(null), 4000);
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const teacherName = user?.displayName || user?.user_metadata?.name || "Prof. Ananya Rao";
  const teacherEmail = user?.email || "teacher@accessai.edu";
  const teacherSubject = user?.user_metadata?.subject || "Inclusive Digital Learning & Accessibility";

  const activeStudentProfile = DETAILED_STUDENT_PROFILES[drilldownStudentKey] || DETAILED_STUDENT_PROFILES["active-student-session"];

  return (
    <div className="h-screen max-h-screen w-full flex overflow-hidden bg-[#f7f9fb] text-[#191c1e] font-sans selection:bg-[#0866F5] selection:text-white">
      {/* ════════════════════════════════════════════════════════════════
          COLUMN 1: LEFT SIDEBAR NAVIGATION (240px wide, identical to student dashboards)
          ════════════════════════════════════════════════════════════════ */}
      <aside className="w-[240px] border-r border-[#E2EDF8] bg-white flex flex-col justify-between sticky top-0 h-screen z-40 flex-shrink-0 overflow-y-auto">
        <div className="p-3">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#0866F5] text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <SparkleIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col cursor-pointer min-w-0" onClick={() => navigate("/teacher")}>
              <span className="text-lg font-black text-[#10265C] tracking-tight leading-none truncate">AccessAI</span>
              <span className="text-[8px] font-black uppercase tracking-wider text-[#0866F5] mt-0.5 truncate">
                TEACHER & EDUCATOR STUDIO
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {[
              { id: "overview", label: "Overview & Studio", icon: "home" },
              { id: "analytics", label: "Student Analysis (AI)", icon: "monitoring" },
              { id: "students", label: "Student Roster", icon: "school" },
              { id: "progress", label: "Curriculum & Mastery", icon: "assessment" },
              { id: "meeting", label: "Live Meeting Room", icon: "video_camera_front" },
              { id: "rn", label: "Realtime Network (RN)", icon: "podcasts" },
              { id: "blockchain", label: "MST Credential Verifier", icon: "verified_user" }
            ].map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "meeting") {
                      navigate("/teacher/meeting/accessai-room-402");
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full h-[38px] flex items-center gap-2.5 px-3 py-1 rounded-xl text-left text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#0866F5] text-white shadow-xs font-bold"
                      : "text-slate-700 hover:text-[#10265C] hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined !text-lg ${isSelected ? "text-white" : "text-[#0866F5]"}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Meeting Shortcut Banner */}
          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Class Ready</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed mb-2.5">
              Broadcast teacher video & auto-transcribe speech to student captions.
            </p>
            <button
              onClick={() => navigate("/teacher/meeting/accessai-room-402")}
              className="w-full py-1.5 rounded-lg bg-[#10b981] hover:bg-emerald-600 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined !text-sm">video_call</span>
              <span>Launch Studio</span>
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0866F5] to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                AR
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate leading-tight">{teacherName}</span>
                <span className="text-[10px] text-slate-500 truncate">{teacherEmail}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <span className="material-symbols-outlined !text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════
          COLUMN 2: MAIN SCROLLABLE WORKSPACE
          ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex justify-between items-center px-6 md:px-8 h-16 bg-white border-b border-slate-200/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-extrabold text-[#10265C] tracking-tight">
              {activeTab === "overview" && "Educator Overview & Classroom Hub"}
              {activeTab === "analytics" && "AccessAI Student Diagnostic & Cognitive Intelligence"}
              {activeTab === "students" && "Enrolled Student Roster & Accommodation Profiles"}
              {activeTab === "progress" && "Curriculum Modules & Assessment Mastery"}
              {activeTab === "rn" && "Classroom Realtime Network (RN) Broadcast"}
              {activeTab === "blockchain" && "MST Blockchain Credential Ledger"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
              Live Session Active
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {interventionToast && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-fadeIn">
                ✓ {interventionToast}
              </span>
            )}

            <button
              onClick={() => navigate("/teacher/meeting/accessai-room-402")}
              className="px-3.5 py-1.5 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined !text-base">video_call</span>
              <span className="hidden sm:inline">Start Live Meeting</span>
            </button>

            <LanguageSelector compact={true} />
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
          {/* ══════════════════════════════════════════════════════════════
              TAB: OVERVIEW
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Hero Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-7 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0866F5]/30 text-sky-300 border border-[#0866F5]/50 text-[10px] font-bold tracking-wide uppercase">
                      Educator Studio
                    </span>
                    <span className="text-xs text-slate-300">• {teacherSubject}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Welcome back, {teacherName}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 mt-1.5 leading-relaxed">
                    AccessAI unified instructor hub. Monitor multi-modal accessibility cohorts across Deaf (Sign/Captions), Blind (Voice), and Motor (Head-Tracking) modes, and broadcast real-time lessons.
                  </p>
                </div>

                <div className="flex items-center gap-3 relative z-10 flex-wrap">
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="px-4 py-2.5 rounded-xl bg-[#0866F5] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs md:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-lg">monitoring</span>
                    <span>Student Analytics</span>
                  </button>
                  <button
                    onClick={() => navigate("/teacher/meeting/accessai-room-402")}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 active:scale-95 text-white font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-lg">video_call</span>
                    <span>Launch Live Meeting</span>
                  </button>
                </div>
              </div>

              {/* Top Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0866F5] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined !text-2xl">group</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cohort</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">{students.length} Students</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {students.filter((s) => s.mode === "deaf").length} Deaf · {students.filter((s) => s.mode === "blind").length} Blind · {students.filter((s) => s.mode === "motor").length} Motor
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16a34a] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined !text-2xl">trending_up</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Progress</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                      {students.length > 0
                        ? `${Math.round(students.reduce((acc, s) => acc + (s.progress || 0), 0) / students.length)}%`
                        : "82%"}
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined !text-2xl">psychology</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Health Index</p>
                    <h3 className="text-2xl font-black text-purple-700 mt-0.5">94.2% Optimal</h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined !text-2xl">verified</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blockchain Ledger</p>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">MST Testnet Live</h3>
                  </div>
                </div>
              </div>

              {/* Overview 2-Col Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Recent Student Activity */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Enrolled Students Quick Review</h3>
                      <p className="text-xs text-slate-500">Current learners active in inclusive courses.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("students")}
                      className="text-xs font-bold text-[#0866F5] hover:underline cursor-pointer"
                    >
                      View Full Roster →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {overviewQuickStudents.map((s) => (
                      <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0866F5] font-bold text-xs flex items-center justify-center shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 block leading-tight">{s.name}</span>
                              {s.isDemo && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                  DEMO
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{s.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.mode === "deaf" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                            s.mode === "blind" ? "bg-blue-50 text-[#0866F5] border border-blue-200" :
                            "bg-teal-50 text-teal-700 border border-teal-200"
                          }`}>
                            {s.mode.toUpperCase()}
                          </span>
                          <span className="text-xs font-extrabold text-[#0866F5]">{s.progress}%</span>
                          <button
                            onClick={() => {
                              setSelectedStudent(s);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0866F5] hover:text-white text-[11px] font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 1 Col: Quick RN Broadcast */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[#0866F5] !text-xl">podcasts</span>
                      <h3 className="text-base font-bold text-slate-900">Instant Classroom Broadcast</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Send a high-priority announcement to all student devices across WebSockets and BroadcastChannel.
                    </p>

                    <form onSubmit={handleSendBroadcast} className="mt-3 flex flex-col gap-2.5">
                      <textarea
                        rows={3}
                        value={rnBroadcastText}
                        onChange={(e) => setRnBroadcastText(e.target.value)}
                        placeholder="Type class announcement..."
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#0866F5] text-xs font-medium resize-none outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!rnBroadcastText.trim()}
                        className="w-full py-2 rounded-xl bg-[#0866F5] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                      >
                        Send Announcement
                      </button>
                    </form>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>RN Peers Active:</span>
                    <span className="font-bold text-emerald-600">{rnParticipants.length} Connected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: ACCESSAI STUDENT ANALYSIS & DIAGNOSTICS SUITE
              ══════════════════════════════════════════════════════════════ */}
                    {/* ══════════════════════════════════════════════════════════════
              TAB: ACCESSAI STUDENT ANALYSIS & DIAGNOSTICS SUITE
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Header Info & Data Separation Notice */}
              <div className="bg-gradient-to-r from-[#0d1f4d] via-[#10265C] to-[#0d1f4d] text-white p-6 md:p-7 rounded-3xl shadow-sm border border-blue-900/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
                      DEMO DATASET • 90 SIMULATED LEARNERS
                    </span>
                    <span className="text-xs text-blue-200 font-bold">
                      30 Deaf/Mute • 30 Blind • 30 Motor Impaired
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                      Meko Persistent Memory Active
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Multi-Modal Student Cognitive Diagnostics & Friction Analysis
                  </h2>
                  <p className="text-xs text-blue-200/80 mt-1 max-w-2xl leading-relaxed">
                    Simulated cohort evaluating how AccessAI personalizes accommodations, captures accessibility bottlenecks (Zero-PII), and recommends closed-loop educator interventions via Meko.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleResetDemoCohort}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Reset simulated activity without affecting genuine student records"
                  >
                    <span className="material-symbols-outlined !text-base">restart_alt</span>
                    <span>Reset Demo Data</span>
                  </button>
                  <button
                    onClick={() => {
                      setInterventionToast("Exported PDF Diagnostic Cohort Report!");
                      setTimeout(() => setInterventionToast(null), 3000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0866F5] hover:bg-blue-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-base">download</span>
                    <span>Export Report</span>
                  </button>
                </div>
              </div>

              {/* 1. TOP 4 COHORT METRICS (90 Students Distribution) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                      <span className="uppercase tracking-wider">Total Demo Learners</span>
                      <span className="material-symbols-outlined text-[#0866F5] !text-xl">groups</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">90</div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">30 Deaf • 30 Blind • 30 Motor</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] mt-3">
                    <span className="text-slate-400">Accommodations:</span>
                    <span className="font-bold text-emerald-600">100% Unique Profiles</span>
                  </div>
                </div>

                {/* Deaf */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                      <span className="uppercase tracking-wider flex items-center gap-1">🤟 Deaf / Mute</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-black text-[10px] border border-indigo-200">
                        30 Active
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">95.4%</div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Sign Recognition Precision</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] mt-3">
                    <span className="text-slate-400">Captions Reliance:</span>
                    <span className="font-bold text-indigo-600">99.4% (640ms Hold)</span>
                  </div>
                </div>

                {/* Blind */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                      <span className="uppercase tracking-wider flex items-center gap-1">🎙️ Blind / Low Vision</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0866F5] font-black text-[10px] border border-blue-200">
                        30 Active
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">92.8%</div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Voice Command Fluency</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] mt-3">
                    <span className="text-slate-400">Auditory Reliance:</span>
                    <span className="font-bold text-[#0866F5]">100% (0.95x Rate)</span>
                  </div>
                </div>

                {/* Motor */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                      <span className="uppercase tracking-wider flex items-center gap-1">♿ Motor Impaired</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-black text-[10px] border border-teal-200">
                        30 Active
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">91.2%</div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Head/Switch Target Precision</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] mt-3">
                    <span className="text-slate-400">Dwell & Padding:</span>
                    <span className="font-bold text-teal-600">1.4s Dwell (48px)</span>
                  </div>
                </div>
              </div>

              {/* 2. CATEGORY-WISE LEARNING DIFFICULTIES & ACCESSIBILITY-SPECIFIC FRICTION */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0866F5] !text-xl">psychology</span>
                    <span>Category-Wise Learning Difficulties & Accessibility-Specific Friction</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Granular breakdown of cognitive roadblocks experienced by each disability cohort.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Deaf / Mute (30) */}
                  <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-xs text-indigo-950 flex items-center gap-1.5">
                          <span>🤟</span> Deaf / Mute (30 Students)
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                          Visual Channel
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/90 border border-indigo-200 text-xs mb-3">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Struggle:</span>
                        <span className="font-bold text-slate-900">{demoAnalytics.difficultiesByCategory.deaf.primaryStruggle}</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {demoAnalytics.difficultiesByCategory.deaf.commonIssues.map((iss, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span className="leading-tight text-[11px]">{iss}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-indigo-200/60 text-[10px] text-indigo-900 font-medium flex justify-between">
                      <span>Gesture Hold: {demoAnalytics.difficultiesByCategory.deaf.avgHoldStabilization}</span>
                      <span>Caption Rate: {demoAnalytics.difficultiesByCategory.deaf.captionReliance}</span>
                    </div>
                  </div>

                  {/* Blind / Low Vision (30) */}
                  <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-xs text-blue-950 flex items-center gap-1.5">
                          <span>🎙️</span> Blind / Low Vision (30 Students)
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Auditory Channel
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/90 border border-blue-200 text-xs mb-3">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Struggle:</span>
                        <span className="font-bold text-slate-900">{demoAnalytics.difficultiesByCategory.blind.primaryStruggle}</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {demoAnalytics.difficultiesByCategory.blind.commonIssues.map((iss, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#0866F5] font-bold">•</span>
                            <span className="leading-tight text-[11px]">{iss}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-blue-200/60 text-[10px] text-blue-900 font-medium flex justify-between">
                      <span>Speech Rate: {demoAnalytics.difficultiesByCategory.blind.avgSpeechRate}</span>
                      <span>Auditory Reliance: {demoAnalytics.difficultiesByCategory.blind.auditoryReliance}</span>
                    </div>
                  </div>

                  {/* Motor Impaired (30) */}
                  <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-xs text-teal-950 flex items-center gap-1.5">
                          <span>♿</span> Motor Impaired (30 Students)
                        </span>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                          Physical / Switch Channel
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/90 border border-teal-200 text-xs mb-3">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Struggle:</span>
                        <span className="font-bold text-slate-900">{demoAnalytics.difficultiesByCategory.motor.primaryStruggle}</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {demoAnalytics.difficultiesByCategory.motor.commonIssues.map((iss, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-teal-600 font-bold">•</span>
                            <span className="leading-tight text-[11px]">{iss}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-teal-200/60 text-[10px] text-teal-900 font-medium flex justify-between">
                      <span>Dwell Pacing: {demoAnalytics.difficultiesByCategory.motor.avgDwellTime}</span>
                      <span>Target Padding: {demoAnalytics.difficultiesByCategory.motor.targetExpansion}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. RANKED LISTS: MOST FREQUENT ISSUES & DIFFICULT TOPICS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Frequently Encountered Accessibility Issues */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 !text-xl">report_problem</span>
                        <span>Frequently Encountered Accessibility Issues</span>
                      </h3>
                      <span className="text-xs text-slate-400">Ranked across 90</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Issues automatically captured by assistive agent telemetry in Meko.
                    </p>

                    <div className="space-y-3">
                      {demoAnalytics.topAccessibilityIssues.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              <span className="truncate max-w-[280px]">{item.issue}</span>
                            </span>
                            <span className="font-extrabold text-[#0866F5] shrink-0">{item.count} Students ({item.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#0866F5] h-full rounded-full transition-all"
                              style={{ width: `${Math.min(item.percentage * 3.5, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Commonly Difficult Learning Topics */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0866F5] !text-xl">menu_book</span>
                        <span>Commonly Difficult Learning Topics</span>
                      </h3>
                      <span className="text-xs text-slate-400">Curriculum Heatmap</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Lessons where students experienced high dwell times or quiz retries.
                    </p>

                    <div className="space-y-3">
                      {demoAnalytics.topDifficultTopics.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0866F5] text-[10px] font-black flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              <span className="truncate max-w-[280px]">{item.topic}</span>
                            </span>
                            <span className="font-extrabold text-amber-600 shrink-0">{item.count} Struggling ({item.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(item.percentage * 3.5, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. TEACHER INTERVENTION QUEUE & INTERVENTION HISTORY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Cols: Active Intervention Queue */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 !text-xl">notifications_active</span>
                      <h3 className="text-base font-bold text-slate-900">
                        Teacher Intervention Queue ({demoAnalytics.interventionQueue.length})
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500">Prioritized by cognitive severity</span>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {demoAnalytics.interventionQueue.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 flex flex-col justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>{item.studentName}</span>
                              <span className="text-[10px] font-semibold text-slate-500">({item.categoryLabel})</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                              {item.severity} Friction
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">{item.topic}</p>
                          <p className="text-[11px] text-amber-800 mt-0.5 font-medium">⚠️ {item.issue} ({item.struggleTime})</p>
                          <p className="text-xs text-slate-600 mt-2 bg-white/90 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                            <strong>AI Diagnosis:</strong> {item.aiRecommendation}
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                          <button
                            onClick={() => handleSendIntervention(item)}
                            disabled={syncingStudentId === (item.studentId || item.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0866F5] hover:bg-blue-600 disabled:bg-blue-400 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            {syncingStudentId === (item.studentId || item.id) ? (
                              <>
                                <span className="material-symbols-outlined !text-sm animate-spin">sync</span>
                                <span>Syncing to Meko...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined !text-sm">send</span>
                                <span>Send 1-Click Guidance</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 5 Cols: Intervention History */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 !text-xl">history_edu</span>
                        <span>Intervention History</span>
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        {demoInterventions.length} Executed
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Closed-loop educator guidance synchronized to Meko memory.
                    </p>

                    <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                      {demoInterventions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No interventions sent yet. Use the 1-Click Guidance buttons to assist students.
                        </div>
                      ) : (
                        demoInterventions.map((hist) => (
                          <div key={hist.id} className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 flex flex-col gap-1.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900">{hist.studentName}</span>
                              <span className="text-[10px] text-slate-400">{hist.timestamp}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#0866F5]">{hist.topic}</span>
                            <p className="text-slate-600 text-[11px] leading-relaxed bg-white/80 p-2 rounded-lg border border-emerald-100">
                              {hist.recommendation}
                            </p>
                            <div className="flex justify-end">
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-300">
                                Synced to Meko Cloud ✓
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. INTERACTIVE 90-STUDENT DIRECTORY (DEMO DATASET) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        90-Student Simulated Roster Directory
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0866F5] border border-blue-200 text-[10px] font-bold uppercase">
                        DEMO DATA
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Select any student to inspect individual accommodations, learning history, and friction traces.
                    </p>
                  </div>

                  {/* Filters & Search */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
                      {[
                        { id: "all", label: "All (90)" },
                        { id: "deaf", label: "Deaf (30)" },
                        { id: "blind", label: "Blind (30)" },
                        { id: "motor", label: "Motor (30)" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setDemoFilterMode(tab.id)}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            demoFilterMode === tab.id ? "bg-white text-[#0866F5] shadow-xs" : "hover:text-slate-900"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={demoSearch}
                      onChange={(e) => setDemoSearch(e.target.value)}
                      placeholder="Search student or topic..."
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 outline-none w-48"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto max-h-[460px] overflow-y-auto custom-scrollbar border border-slate-200/60 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 sticky top-0 z-10 backdrop-blur-xs">
                      <tr>
                        <th className="py-3 px-4">Demo Student</th>
                        <th className="py-3 px-3">Mode</th>
                        <th className="py-3 px-3">Language</th>
                        <th className="py-3 px-3">Current Topic</th>
                        <th className="py-3 px-3">Progress</th>
                        <th className="py-3 px-3">Friction & Struggle</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {demoCohort
                        .filter((s) => (demoFilterMode === "all" ? true : s.mode === demoFilterMode))
                        .filter((s) =>
                          demoSearch
                            ? s.name.toLowerCase().includes(demoSearch.toLowerCase()) ||
                              s.email.toLowerCase().includes(demoSearch.toLowerCase()) ||
                              s.learningActivity?.currentTopic?.toLowerCase().includes(demoSearch.toLowerCase())
                            : true
                        )
                        .map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0866F5] font-black text-xs flex items-center justify-center shrink-0">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block leading-tight">{student.name}</span>
                                  <span className="text-[10px] text-slate-400">{student.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {student.mode === "deaf" ? (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold inline-flex items-center gap-1">
                                  <span>🤟</span> Deaf
                                </span>
                              ) : student.mode === "blind" ? (
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0866F5] border border-blue-200 text-[10px] font-bold inline-flex items-center gap-1">
                                  <span>🎙️</span> Blind
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold inline-flex items-center gap-1">
                                  <span>♿</span> Motor
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-600">{student.language}</td>
                            <td className="py-3 px-3 font-semibold text-slate-900 truncate max-w-[180px]">
                              {student.learningActivity?.currentTopic}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-extrabold text-[#0866F5]">{student.progress}%</span>
                            </td>
                            <td className="py-3 px-3 truncate max-w-[200px]">
                              <span className="text-amber-800 font-medium text-[11px]">
                                {student.learningActivity?.accessibilityFriction?.issueName}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0866F5] hover:text-white text-slate-700 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: STUDENTS (Roster Table)
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "students" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">Enrolled Student Directory</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase">
                      {students.length} Learners Loaded
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Inspect individual accommodation settings, learning friction traces, and assessment scores across all 90 students.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="px-3.5 py-1.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-[#0866F5] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>📊</span>
                    <span>View Cognitive Analytics Suite</span>
                  </button>
                  <button
                    onClick={fetchStudents}
                    disabled={isLoadingStudents}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    <span className={`material-symbols-outlined !text-sm ${isLoadingStudents ? "animate-spin" : ""}`}>
                      refresh
                    </span>
                    <span>Refresh List</span>
                  </button>
                </div>
              </div>

              {/* Roster Category Filter Pills and Search Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setRosterFilterMode("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      rosterFilterMode === "all"
                        ? "bg-[#0866F5] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Cohort ({students.length})
                  </button>
                  <button
                    onClick={() => setRosterFilterMode("deaf")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      rosterFilterMode === "deaf"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60"
                    }`}
                  >
                    <span>🤟</span>
                    <span>Deaf / Sign ({students.filter((s) => s.mode === "deaf").length})</span>
                  </button>
                  <button
                    onClick={() => setRosterFilterMode("blind")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      rosterFilterMode === "blind"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-blue-50 text-[#0866F5] hover:bg-blue-100 border border-blue-200/60"
                    }`}
                  >
                    <span>🎙️</span>
                    <span>Blind / Voice ({students.filter((s) => s.mode === "blind").length})</span>
                  </button>
                  <button
                    onClick={() => setRosterFilterMode("motor")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      rosterFilterMode === "motor"
                        ? "bg-teal-600 text-white shadow-2xs"
                        : "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/60"
                    }`}
                  >
                    <span>🎯</span>
                    <span>Motor / Hands-Free ({students.filter((s) => s.mode === "motor").length})</span>
                  </button>
                </div>

                <div className="relative min-w-[240px]">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 !text-sm">search</span>
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search 90 students by name, email, mode..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#0866F5] focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* Student Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto max-h-[640px]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/95 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 sticky top-0 backdrop-blur-xs z-10">
                      <tr>
                        <th className="py-3.5 px-6">Student ({filteredRosterStudents.length})</th>
                        <th className="py-3.5 px-4">Accommodation Mode</th>
                        <th className="py-3.5 px-4">Courses</th>
                        <th className="py-3.5 px-4">Progress</th>
                        <th className="py-3.5 px-4">Assessment</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredRosterStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0866F5] font-bold flex items-center justify-center text-xs shrink-0">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 block leading-tight">{student.name}</span>
                                  {isFlagshipStudent(student) && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-200 text-amber-950 border border-amber-400 shadow-2xs">
                                      ⭐ FLAGSHIP DEMO
                                    </span>
                                  )}
                                  {student.isDemo && !isFlagshipStudent(student) && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                      DEMO
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-400">{student.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {student.mode === "deaf" ? (
                              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1">
                                <span>🤟</span> Deaf / Sign Mode
                              </span>
                            ) : student.mode === "blind" ? (
                              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0866F5] border border-blue-200 text-xs font-semibold inline-flex items-center gap-1">
                                <span>🎙️</span> Blind / Voice Mode
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold inline-flex items-center gap-1">
                                <span>🎯</span> Motor / Hands-Free
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {student.enrolledCourses} Enrolled
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#0866F5] h-full rounded-full transition-all"
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                              {student.assessmentScore}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                            {student.lastActive}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0866F5] hover:text-white text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: PROGRESS & CURRICULUM
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "progress" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#0866F5] !text-2xl">menu_book</span>
                  <h3 className="text-lg font-bold text-slate-900">Curriculum Modules & Competency</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Track how students across different accessibility accommodations perform on each unit.
                </p>

                <div className="space-y-4 mt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-800">1. Web Accessibility (WCAG 2.2 AAA Standards)</span>
                      <span className="text-xs font-bold text-emerald-600">84% Mastery</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#10b981] h-full rounded-full" style={{ width: "84%" }} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Full Voice Reader & High Contrast compatibility verified.</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-800">2. Real-Time Sign Language Recognition (ISL / ASL)</span>
                      <span className="text-xs font-bold text-[#0866F5]">76% Mastery</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0866F5] h-full rounded-full" style={{ width: "76%" }} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">3D Avatar visual feedback & camera gesture tracking active.</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-800">3. Hands-Free Head Tracking & Dwell Click Navigation</span>
                      <span className="text-xs font-bold text-amber-600">65% Mastery</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: "65%" }} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Sensitivity calibration & adaptive click timing applied.</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#10b981] !text-2xl">verified_user</span>
                  <h3 className="text-lg font-bold text-slate-900">MST Blockchain Assessment Verification</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  When students complete practical assessments, certificates are cryptographically signed and anchored to the MST Blockchain smart contracts for tamper-proof verification.
                </p>

                <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                    <span>Smart Contract Network:</span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-sky-200">MST Testnet (0x4a7...9f1)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                    <span>Tamper Protection:</span>
                    <span className="text-emerald-700 font-bold">SHA-256 Merkle Anchored</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                    <span>Public Verifier:</span>
                    <button
                      onClick={() => navigate("/verify")}
                      className="text-[#0866F5] hover:underline cursor-pointer font-bold text-xs"
                    >
                      Open MST Credential Verifier →
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Assessment Records Synced</span>
                  <span className="font-semibold text-slate-700">Live DB Connection</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: REALTIME NETWORK (RN)
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "rn" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Video Studio Launch */}
              <div className="lg:col-span-3 bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 md:p-7 border border-emerald-500/30 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <span className="material-symbols-outlined !text-3xl">video_camera_front</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white tracking-wide">
                        Accessible Video Classroom Studio
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                        WebRTC + Live Captions
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Host a real-time video lecture with WebRTC video streaming. Your live speech is automatically transcribed into captions on student screens.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/teacher/meeting/accessai-room-402")}
                  className="px-6 py-3 rounded-2xl bg-[#10b981] hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs md:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined !text-lg">video_call</span>
                  <span>Launch Video Meeting</span>
                </button>
              </div>

              {/* RN Announcement Form */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
                      <span className="material-symbols-outlined !text-xl">broadcast_on_home</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Realtime Network (RN) Broadcast</h3>
                      <p className="text-xs text-slate-500">Instant synchronization with all active student tabs.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{rnConnected ? "RN Connected" : "Connecting..."}</span>
                  </span>
                </div>

                <form onSubmit={handleSendBroadcast} className="mt-2 flex flex-col gap-3">
                  <textarea
                    rows={3}
                    value={rnBroadcastText}
                    onChange={(e) => setRnBroadcastText(e.target.value)}
                    placeholder="Compose announcement to all students via RN..."
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#0866F5] text-xs font-medium resize-none outline-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">BroadcastChannel + Supabase Realtime active</span>
                    <button
                      type="submit"
                      disabled={!rnBroadcastText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#0866F5] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Broadcast via RN
                    </button>
                  </div>
                </form>

                {/* Message Log */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live RN Message Feed</h4>
                  {rnMessages.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">No messages sent yet in this session.</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {rnMessages.map((msg, idx) => (
                        <div key={msg.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-[#0866F5]">{msg.senderName || "Teacher"}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnostics Box */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">RN Diagnostics</h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between">
                      <span className="text-slate-500">Classroom Channel:</span>
                      <span className="font-mono font-bold text-slate-800">accessai-classroom-main</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between">
                      <span className="text-slate-500">Teacher Role:</span>
                      <span className="font-bold text-emerald-700">Host (isHost: true)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between">
                      <span className="text-slate-500">Active RN Peers:</span>
                      <span className="font-bold text-slate-800">{rnParticipants.length} Connected</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/teacher/meeting/accessai-room-402")}
                  className="w-full py-2.5 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Enter Live Classroom
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: BLOCKCHAIN
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "blockchain" && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col gap-6 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-2xl">verified_user</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">MST Blockchain Credential Ledger</h2>
                  <p className="text-xs text-slate-500">Tamper-proof academic achievements verified on-chain.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">Contract Address:</span>
                  <span className="font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-800">
                    0x4a7E298d022B8C4F1A527f32489C82312d6E19f1
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">Consensus Engine:</span>
                  <span className="font-bold text-emerald-600">MST Proof-of-Authority (PoA)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">Total Credentials Minted:</span>
                  <span className="font-bold text-slate-900">128 On-Chain Verified Certificates</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/verify")}
                  className="px-5 py-2.5 rounded-xl bg-[#0866F5] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined !text-base">verified</span>
                  <span>Open Public MST Verifier Portal</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Meko Context Inspector ── */}
      <MekoContextInspector studentDatapackId="student-voice-memory" sharedDatapackId="course-python-shared" buildDatapackId="accessai-build" />

      {/* ── Student Profile Drawer ── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 md:p-8 animate-fadeIn relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#0866F5] font-extrabold text-xl flex items-center justify-center shrink-0">
                {selectedStudent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedStudent.name}</h3>
                  {selectedStudent.isDemo && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
                      DEMO DATA
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0866F5] border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                    Mode: {selectedStudent.mode}
                  </span>
                  {selectedStudent.language && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      🌐 {selectedStudent.language}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Individual Accommodations */}
            {selectedStudent.accommodations && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Individual Accommodation Settings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedStudent.accommodations).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col">
                      <span className="text-[10px] text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-bold text-slate-800 text-[11px] mt-0.5">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning History & Friction */}
            {selectedStudent.learningActivity && (
              <div className="mb-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Learning Activity & Accessibility Friction Trace
                </h4>
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{selectedStudent.learningActivity.currentCourse}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      {selectedStudent.learningActivity.accessibilityFriction?.severity} Friction
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    <strong>Difficult Lesson:</strong> {selectedStudent.learningActivity.difficultLesson}
                  </p>
                  <p className="text-[11px] text-amber-900 font-medium">
                    ⚠️ <strong>Friction Issue:</strong> {selectedStudent.learningActivity.accessibilityFriction?.issueName} - {selectedStudent.learningActivity.accessibilityFriction?.details}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <strong>Repeated Help Requests:</strong> {selectedStudent.learningActivity.repeatedHelpRequestsCount} times ("{selectedStudent.learningActivity.lastHelpRequest}")
                  </p>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-[11px] text-slate-700">
                    <strong>AI Recommended Intervention:</strong> {selectedStudent.learningActivity.aiRecommendation}
                  </div>
                </div>
              </div>
            )}

            {/* General progress info */}
            <div className="space-y-2.5 text-xs mb-4">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Active Course Progress:</span>
                <span className="text-sm font-extrabold text-[#0866F5]">{selectedStudent.progress}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Assessment Score:</span>
                <span className="text-sm font-extrabold text-emerald-600">{selectedStudent.assessmentScore}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {selectedStudent.learningActivity && (
                <button
                  onClick={() => {
                    handleSendIntervention({
                      studentName: selectedStudent.name,
                      studentId: selectedStudent.id,
                      mode: selectedStudent.mode,
                      topic: selectedStudent.learningActivity.currentTopic,
                      aiRecommendation: selectedStudent.learningActivity.aiRecommendation
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0866F5] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined !text-sm">send</span>
                  <span>Send 1-Click Guidance</span>
                </button>
              )}
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
