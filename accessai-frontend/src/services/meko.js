/**
 * AccessAI Meko Context Client
 * Shared context layer integration for Track A (Open Project - hackCBS 9.0).
 * Implements: Datapacks as scopes, persistent memory across sessions,
 * multi-student telemetry/friction logging, recall before reasoning,
 * and promotion to shared knowledge.
 */
import API from "./api";
import { DEMO_COHORT_STUDENTS } from "../data/simulatedCohortData";

const MEKO_STORAGE_KEY_PREFIX = "accessai_meko_datapack_";

// API Configuration — read from environment (.env), never hardcode secrets here.
export const MEKO_CONFIG = {
  API_BASE_URL: process.env.REACT_APP_MEKO_API_BASE_URL || "https://mcp.mekodata.ai/mcp",
  API_KEY: process.env.REACT_APP_MEKO_API_KEY || "",
  USE_MOCK: process.env.REACT_APP_MEKO_USE_MOCK === "true",
};

// Comprehensive 90-Student Persistent Memories for Meko Datapack (30 Deaf, 30 Blind, 30 Motor)
export const COHORT_STUDENT_MEMORIES = (DEMO_COHORT_STUDENTS || []).map((s) => {
  const acc = s.accommodations || {};
  let accStr = "";
  if (s.mode === "deaf") {
    accStr = `Captions: ${acc.captions || "Cyan"}, Speed: ${acc.speed || "0.75x"}, Sign: ${acc.signLanguage || "ASL"}, Hold: ${acc.gestureHoldWindow || "640ms"}`;
  } else if (s.mode === "blind") {
    accStr = `Screen Reader: ${acc.screenReader || "NVDA"}, Speed: ${acc.speed || "0.95x"}, Pitch Cues: ${acc.indentationCues || "Audio Tone"}`;
  } else {
    accStr = `Dwell: ${acc.dwellClickTimer || "1.4s"}, Hit Target: ${acc.hitTargetMinSize || "48px"}, Input: ${acc.inputMethod || "Single Switch"}`;
  }
  const friction = s.learningActivity?.accessibilityFriction || {};
  return {
    id: `mem-${s.id}`,
    studentId: s.id,
    studentName: s.name,
    mode: s.mode,
    category: `${s.mode}_accommodation`,
    text: `[Durable Student Profile - ${s.name} (${s.id})]: Mode: ${s.mode.toUpperCase()} (${s.categoryLabel}). Language: ${s.language}. Accommodations: ${accStr}. Learning Friction: ${friction.issueName || "Pacing"} - ${friction.details || "Requires accommodation tuning."}`,
    timestamp: new Date(Date.now() - (s.studyMinutes || 60) * 60000).toISOString(),
    promoted: false,
    isDemo: true
  };
});

export const DEFAULT_STUDENT_MEMORIES = COHORT_STUDENT_MEMORIES;

const DEFAULT_SHARED_COURSE_KNOWLEDGE = [
  {
    id: "kb-1",
    text: "Auditory Mnemonic for Python: 'def' stands for define - always followed by function name and colon.",
    category: "promoted_lesson",
    contributor: "Priya (Blind Learner cohort)",
    promotedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Check T: 10 Promoted Team Decisions from at least 2 Teammates
export const BUILD_DATAPACK_DECISIONS = [
  {
    id: "dec-1",
    teammate: "Nupur Walwadkar (Developer 1)",
    role: "Deaf/Mute Module Lead",
    title: "Two-Way Meeting Message Schema",
    decision: "Standardized JSON payload: { meetingId, senderId, senderName, senderMode ('deaf_mute' | 'hearing'), messageType ('sign_to_text' | 'text_message' | 'speech_to_text'), text, timestamp }.",
    promoted: true,
    promotedAt: "2026-10-31T14:00:00Z"
  },
  {
    id: "dec-2",
    teammate: "Nupur Walwadkar (Developer 1)",
    role: "Deaf/Mute Module Lead",
    title: "Zero Mandatory Permissions Contract",
    decision: "Microphone permission is NEVER mandatory or requested for Deaf/Mute participants. Camera permission is 100% voluntary, default OFF on join, with text as the primary fallback.",
    promoted: true,
    promotedAt: "2026-10-31T14:15:00Z"
  },
  {
    id: "dec-3",
    teammate: "Nupur Walwadkar (Developer 1)",
    role: "Deaf/Mute Module Lead",
    title: "Role-Based Meeting Restriction (Join Only)",
    decision: "Deaf/Mute students have strictly participant-level access ('role: student', 'isHost: false', 'canKick: false', 'canEndMeeting: false'). POST /meetings/create returns 403 Forbidden for students.",
    promoted: true,
    promotedAt: "2026-10-31T14:30:00Z"
  },
  {
    id: "dec-4",
    teammate: "Nupur Walwadkar (Developer 1)",
    role: "Deaf/Mute Module Lead",
    title: "Sign Language Detection Pipeline",
    decision: "Combines MediaPipe Tasks Vision Gesture Recognizer with 21 3D hand landmarks geometric classification. Implements 650ms stable hold before committing gestures and 1400ms debounce cooldown.",
    promoted: true,
    promotedAt: "2026-10-31T14:45:00Z"
  },
  {
    id: "dec-5",
    teammate: "Nupur Walwadkar (Developer 1)",
    role: "Deaf/Mute Module Lead",
    title: "Text-to-Speech (TTS) Execution Gate",
    decision: "TTS strictly speaks finalized sentences sent by the student. Intermediate continuous gesture predictions are never spoken aloud to prevent audio distortion for hearing participants.",
    promoted: true,
    promotedAt: "2026-10-31T15:00:00Z"
  },
  {
    id: "dec-6",
    teammate: "Developer 2",
    role: "Hearing Module Lead",
    title: "Speech-to-Text & Captions Broadcast",
    decision: "Hearing participants' spoken audio is transcribed via Web Speech Recognition and broadcast to the meeting channel with messageType: 'speech_to_text' to render real-time captions.",
    promoted: true,
    promotedAt: "2026-10-31T15:10:00Z"
  },
  {
    id: "dec-7",
    teammate: "Developer 2",
    role: "Hearing Module Lead",
    title: "3D Sign Avatar Sync",
    decision: "When speech-to-text messages arrive, the 3D WebGL Avatar (Avatar3DCanvas) automatically animates ASL sign poses (avatarAction: 'sign_asl') and lip visemes in sync with the captions ticker.",
    promoted: true,
    promotedAt: "2026-10-31T15:20:00Z"
  },
  {
    id: "dec-8",
    teammate: "Developer 2",
    role: "Hearing Module Lead",
    title: "Multi-Transport Real-Time Synchronization",
    decision: "Dual-layer messaging architecture: Zero-latency BroadcastChannel('accessai_meeting_' + meetingId) for multi-tab evaluation and fallback Supabase Realtime broadcast for distributed network participants.",
    promoted: true,
    promotedAt: "2026-10-31T15:30:00Z"
  },
  {
    id: "dec-9",
    teammate: "Nupur Walwadkar (Developer 1)",
    role: "Deaf/Mute Module Lead",
    title: "Mandatory Text-Based Communication & Quick Responses",
    decision: "Full text chat system with 8 standardized quick responses (Yes, No, I agree, I disagree, Please repeat, I have a question, I need help, Thank you) that function independently of any camera or microphone hardware.",
    promoted: true,
    promotedAt: "2026-10-31T15:40:00Z"
  },
  {
    id: "dec-10",
    teammate: "Developer 2",
    role: "Hearing Module Lead",
    title: "Idempotent Message Deduplication",
    decision: "All messages carry unique idempotency IDs ('txt-...', 'hearing-...') cached in a bounded 200-element LRU set across storage and broadcast events to prevent duplicate transcript entries.",
    promoted: true,
    promotedAt: "2026-10-31T15:50:00Z"
  }
];

export const MekoService = {
  /**
   * Retrieves memories from a scoped datapack (synchronous, localStorage-cached)
   */
  getDatapack(datapackId = "student-voice-memory") {
    if (typeof window === "undefined") return [];
    try {
      if (datapackId === "accessai-build" || datapackId.includes("build")) {
        const stored = localStorage.getItem(`${MEKO_STORAGE_KEY_PREFIX}${datapackId}`);
        if (!stored) {
          localStorage.setItem(`${MEKO_STORAGE_KEY_PREFIX}${datapackId}`, JSON.stringify(BUILD_DATAPACK_DECISIONS));
          return BUILD_DATAPACK_DECISIONS;
        }
        return JSON.parse(stored);
      }

      const stored = localStorage.getItem(`${MEKO_STORAGE_KEY_PREFIX}${datapackId}`);
      if (!stored) {
        const initial = datapackId.includes("shared") 
          ? DEFAULT_SHARED_COURSE_KNOWLEDGE 
          : COHORT_STUDENT_MEMORIES;
        localStorage.setItem(`${MEKO_STORAGE_KEY_PREFIX}${datapackId}`, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(stored);
      // Ensure the complete 90-student cohort memories are present in student datapack
      if (datapackId === "student-voice-memory" || datapackId.includes("student")) {
        if (!Array.isArray(parsed) || parsed.length < 90) {
          const existingIds = new Set((parsed || []).map((p) => p.id));
          const merged = [...(parsed || [])];
          for (const m of COHORT_STUDENT_MEMORIES) {
            if (!existingIds.has(m.id)) {
              merged.push(m);
            }
          }
          localStorage.setItem(`${MEKO_STORAGE_KEY_PREFIX}${datapackId}`, JSON.stringify(merged));
          return merged;
        }
      }
      return parsed;
    } catch (e) {
      return [];
    }
  },

  /**
   * Saves a new memory into the specified scoped datapack
   */
  writeMemory(datapackId, text, category = "observation") {
    if (typeof window === "undefined" || !text) return null;
    const memories = this.getDatapack(datapackId);
    const newEntry = {
      id: `mem-${Date.now().toString(36)}`,
      text: text.trim(),
      category,
      timestamp: new Date().toISOString(),
      promoted: false
    };
    memories.unshift(newEntry);
    localStorage.setItem(`${MEKO_STORAGE_KEY_PREFIX}${datapackId}`, JSON.stringify(memories));

    // Also async sync to live Meko backend in background
    this.addLiveMemory(text, datapackId).catch(() => {});

    return newEntry;
  },

  /**
   * Recalls relevant memories before reasoning (A2 Requirement)
   */
  recallContext(datapackId, topic = "") {
    const memories = this.getDatapack(datapackId);
    if (!topic) return memories;
    const lower = topic.toLowerCase();
    return memories.filter(m => 
      (m.text || m.decision || "").toLowerCase().includes(lower) || 
      (m.category || m.title || "").toLowerCase().includes(lower)
    );
  },

  /**
   * Promotes a student insight or decision to shared knowledge (A2 / Check T Requirement)
   */
  promoteToShared(sourceDatapack, memoryId, sharedDatapack = "course-python-shared") {
    const sourceMemories = this.getDatapack(sourceDatapack);
    const target = sourceMemories.find(m => m.id === memoryId);
    if (!target) return false;

    target.promoted = true;
    localStorage.setItem(`${MEKO_STORAGE_KEY_PREFIX}${sourceDatapack}`, JSON.stringify(sourceMemories));

    const sharedKnowledge = this.getDatapack(sharedDatapack);
    const promotedText = target.text || target.decision;
    sharedKnowledge.unshift({
      id: `kb-${Date.now().toString(36)}`,
      text: promotedText,
      category: target.category || target.title,
      contributor: target.teammate || "Anonymous Learner",
      promotedAt: new Date().toISOString()
    });
    localStorage.setItem(`${MEKO_STORAGE_KEY_PREFIX}${sharedDatapack}`, JSON.stringify(sharedKnowledge));

    // Also async sync to live Meko backend
    this.addLiveMemory(`[Promoted Shared Knowledge] ${promotedText}`, sharedDatapack).catch(() => {});

    return true;
  },

  /**
   * Forgets a memory by ID (A3 Requirement)
   */
  forgetMemory(datapackId, memoryId) {
    if (typeof window === "undefined") return false;
    const memories = this.getDatapack(datapackId);
    const filtered = memories.filter(m => m.id !== memoryId);
    localStorage.setItem(`${MEKO_STORAGE_KEY_PREFIX}${datapackId}`, JSON.stringify(filtered));
    return true;
  },

  // ═══════════════════════════════════════════════════════════════════
  // ASYNC LIVE MEKO MCP METHODS (Connected to Flask Backend Proxy)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Check connection status to live Meko MCP server
   */
  async checkMekoStatus() {
    try {
      const res = await API.get("/api/meko/status");
      return res.data;
    } catch (e) {
      return { status: "offline", error: e.message };
    }
  },

  /**
   * Feature 1: Persistent Memory Across Sessions
   * Saves student communication & accommodation preferences into Meko
   */
  async savePreference(userId, studentName, disabilityType, preferences) {
    try {
      const res = await API.post("/api/meko/preferences", {
        userId,
        studentName,
        disabilityType,
        preferences
      });
      return res.data;
    } catch (e) {
      console.warn("Meko savePreference fallback to local:", e.message);
      return { status: "local_only" };
    }
  },

  /**
   * Feature 1: Persistent Memory Across Sessions
   * Recalls student preferences across sessions
   */
  async recallPreferences(studentNameOrId = "") {
    try {
      const res = await API.get(`/api/meko/preferences?query=${encodeURIComponent(studentNameOrId || "Student accommodation")}`);
      return res.data?.results || [];
    } catch (e) {
      console.warn("Meko recallPreferences fallback:", e.message);
      return [];
    }
  },

  /**
   * Feature 2: Multi-Student Telemetry & Friction Logger
   * Logs an episodic learning struggle into Meko
   */
  async logFriction(modality, topic, frictionType, observation, studentHash = "anon-learner") {
    try {
      const res = await API.post("/api/meko/friction", {
        modality,
        topic,
        frictionType,
        observation,
        studentHash
      });
      return res.data;
    } catch (e) {
      console.warn("Meko logFriction fallback:", e.message);
      return { status: "local_only" };
    }
  },

  /**
   * Feature 2 / Feature 3: Teacher Mode Cohort Friction Retrieval
   * Retrieves active multi-agent friction points for Teacher Dashboard
   */
  async fetchCohortFriction() {
    try {
      const res = await API.get("/api/meko/friction");
      return res.data?.results || [];
    } catch (e) {
      console.warn("Meko fetchCohortFriction fallback:", e.message);
      return [];
    }
  },

  /**
   * Live search in any Meko datapack
   */
  async searchLiveMemory(query, datapackId = null, limit = 10) {
    try {
      const res = await API.post("/api/meko/search", { query, datapack_id: datapackId, limit });
      return res.data?.results || [];
    } catch (e) {
      console.warn("Meko searchLiveMemory fallback:", e.message);
      return [];
    }
  },

  /**
   * Live add memory to any Meko datapack
   */
  async addLiveMemory(text, datapackId = null, agentId = "access-ai-client") {
    try {
      const res = await API.post("/api/meko/add", { text, datapack_id: datapackId, agent_id: agentId });
      return res.data;
    } catch (e) {
      console.warn("Meko addLiveMemory fallback:", e.message);
      return { status: "local_only" };
    }
  },

  /**
   * Feature 3: Live Decisons Recall for Check T
   */
  async fetchLiveDecisions() {
    try {
      const res = await API.get("/api/meko/decisions");
      return res.data?.results || [];
    } catch (e) {
      console.warn("Meko fetchLiveDecisions fallback to cached:", e.message);
      return BUILD_DATAPACK_DECISIONS;
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // 90-STUDENT SIMULATED COHORT DATASET METHODS (DEMO DATASET)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Retrieves 90 demo students (30 Deaf, 30 Blind, 30 Motor)
   */
  async getDemoStudents(mode = "all", search = "") {
    try {
      const res = await API.get(`/api/meko/demo/students?mode=${mode}&search=${encodeURIComponent(search)}`);
      return res.data?.students || [];
    } catch (e) {
      console.warn("Falling back to local simulated cohort:", e.message);
      const { getActiveDemoCohort } = await import("../data/simulatedCohortData");
      let list = getActiveDemoCohort();
      if (mode && mode !== "all") list = list.filter(s => s.mode === mode);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.learningActivity?.currentTopic?.toLowerCase().includes(q));
      }
      return list;
    }
  },

  /**
   * Retrieves aggregated cognitive analytics across the 90 demo students
   */
  async getDemoAnalytics() {
    try {
      const res = await API.get("/api/meko/demo/analytics");
      return res.data;
    } catch (e) {
      console.warn("Falling back to local cohort analytics:", e.message);
      const { computeCohortAnalytics } = await import("../data/simulatedCohortData");
      return computeCohortAnalytics();
    }
  },

  /**
   * Sends teacher intervention for a demo student & syncs to Meko
   */
  async sendDemoIntervention(item, customRecommendation = null) {
    const recommendation = customRecommendation || item.aiRecommendation || "Personalized accommodation guidance applied.";
    try {
      const res = await API.post("/api/meko/demo/intervene", {
        studentId: item.studentId || item.id,
        studentName: item.studentName || item.name,
        mode: item.mode,
        topic: item.topic || item.learningActivity?.currentTopic,
        recommendation
      });
      return res.data;
    } catch (e) {
      console.warn("Saving demo intervention locally:", e.message);
      const { recordDemoIntervention } = await import("../data/simulatedCohortData");
      return { entry: recordDemoIntervention(item, recommendation) };
    }
  },

  /**
   * Resets simulated demo cohort without deleting actual student records
   */
  async resetDemoCohort() {
    try {
      await API.post("/api/meko/demo/reset");
    } catch (e) {}
    const { resetDemoCohortData } = await import("../data/simulatedCohortData");
    resetDemoCohortData();
    return true;
  }
};

export default MekoService;
