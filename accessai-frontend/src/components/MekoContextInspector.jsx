import React, { useState, useEffect } from "react";
import MekoService from "../services/meko";

export default function MekoContextInspector({
  studentDatapackId = "student-voice-memory",
  sharedDatapackId = "course-python-shared",
  buildDatapackId = "accessai-build",
  mekoEnabled = true,
  onToggleMeko
}) {
  const [studentMemories, setStudentMemories] = useState([]);
  const [sharedKnowledge, setSharedKnowledge] = useState([]);
  const [buildDecisions, setBuildDecisions] = useState([]);
  const [activeTab, setActiveTab] = useState("build"); // "build" | "student" | "shared" | "search"
  const [isOpen, setIsOpen] = useState(false);
  const [studentFilterMode, setStudentFilterMode] = useState("all");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [mekoStatus, setMekoStatus] = useState("checking");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [addStatus, setAddStatus] = useState(null);

  const refreshContext = async () => {
    // 1. Local fallback data
    setStudentMemories(MekoService.getDatapack(studentDatapackId));
    setSharedKnowledge(MekoService.getDatapack(sharedDatapackId));
    setBuildDecisions(MekoService.getDatapack(buildDatapackId));

    // 2. Query status & live decisions from Meko
    try {
      const statusRes = await MekoService.checkMekoStatus();
      setMekoStatus(statusRes.status === "connected" ? "connected" : "offline");

      const liveDecs = await MekoService.fetchLiveDecisions();
      if (liveDecs && liveDecs.length > 0) {
        // Map live decision objects with clear titles and teammate attribution
        const formatted = liveDecs.map((d, i) => {
          const raw = d.memory || d.text || "";
          let teammate = "Team Maintainer";
          let title = `Decision #${i + 1}`;
          let desc = raw;

          if (raw.includes("[Teammate:")) {
            const parts = raw.split("]");
            teammate = parts[0].replace("[Teammate:", "").trim();
            const rest = parts.slice(1).join("]").trim();
            if (rest.startsWith("-")) {
              const dashParts = rest.slice(1).trim().split(":");
              title = dashParts[0].replace(/\*/g, "").trim();
              desc = dashParts.slice(1).join(":").trim();
            } else {
              desc = rest;
            }
          } else if (raw.includes(" - ")) {
            const dashParts = raw.split(" - ");
            teammate = dashParts[0].replace(/\[|\]/g, "").trim();
            const sub = dashParts.slice(1).join(" - ").split(":");
            title = sub[0].replace(/\*/g, "").trim();
            desc = sub.slice(1).join(":").trim();
          } else if (raw.includes(":")) {
            const colonParts = raw.split(":");
            title = colonParts[0].replace(/\*/g, "").trim();
            desc = colonParts.slice(1).join(":").trim();
          }

          return {
            id: d.id || `live-dec-${i}`,
            teammate,
            title: title || `Architectural Decision #${i + 1}`,
            decision: desc || raw,
            promoted: true
          };
        });
        setBuildDecisions(formatted);
      }
    } catch (e) {
      setMekoStatus("offline");
    }
  };

  useEffect(() => {
    refreshContext();
  }, [studentDatapackId, sharedDatapackId, buildDatapackId, mekoEnabled]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleForget = (id) => {
    MekoService.forgetMemory(studentDatapackId, id);
    refreshContext();
  };

  const handlePromote = (id) => {
    MekoService.promoteToShared(studentDatapackId, id, sharedDatapackId);
    refreshContext();
  };

  const handleLiveSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const targetDp = activeTab === "build" ? buildDatapackId : null;
      const res = await MekoService.searchLiveMemory(searchQuery, targetDp);
      setSearchResults(res || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddLiveMemory = async (e) => {
    if (e) e.preventDefault();
    if (!newMemoryText.trim()) return;
    setAddStatus("Saving to Meko...");
    try {
      await MekoService.addLiveMemory(newMemoryText.trim(), null, "access-ai-inspector");
      setNewMemoryText("");
      setAddStatus("Memory added to Meko!");
      setTimeout(() => setAddStatus(null), 3000);
      refreshContext();
    } catch (err) {
      setAddStatus("Error saving memory");
      setTimeout(() => setAddStatus(null), 3000);
    }
  };

  const filteredStudentMemories = studentMemories.filter((m) => {
    if (studentFilterMode !== "all" && m.mode !== studentFilterMode) return false;
    if (studentSearchQuery) {
      const q = studentSearchQuery.toLowerCase();
      return (
        (m.studentName && m.studentName.toLowerCase().includes(q)) ||
        (m.studentId && m.studentId.toLowerCase().includes(q)) ||
        (m.text && m.text.toLowerCase().includes(q)) ||
        (m.category && m.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <>
      {/* ── Floating Launcher Pill (Bottom Right) ── */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 font-sans">
          <button
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full font-semibold shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer border ${
              mekoEnabled
                ? "bg-[#10265C] hover:bg-[#0866F5] text-white border-blue-400/40 shadow-blue-500/25"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600"
            }`}
            title="Inspect Meko Persistent Memory & Check T Decisions"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                mekoStatus === "connected"
                  ? "bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-xs font-bold tracking-tight">Meko Persistent Memory</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-mono font-bold">
              {mekoStatus === "connected" ? "LIVE MCP" : "CACHED"}
            </span>
          </button>
        </div>
      )}

      {/* ── Slide-Over Drawer & Backdrop ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 font-sans flex justify-end animate-fadeIn">
          {/* Backdrop (Click outside to close) */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-Over Drawer Container */}
          <div className="relative w-full max-w-md md:max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col h-full z-10 overflow-hidden">
            {/* Header (Sticky at top) */}
            <div className="px-5 py-4 bg-slate-800/95 border-b border-slate-700/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                  <span className="material-symbols-outlined !text-lg">psychology</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs tracking-wider text-blue-400 uppercase">
                      Meko Context Layer
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold uppercase">
                      Check T Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">YugabyteDB Persistent Vector Memory</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                    mekoStatus === "connected"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-amber-950 text-amber-300 border border-amber-800"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      mekoStatus === "connected" ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                    }`}
                  />
                  <span>{mekoStatus === "connected" ? "MCP Live" : "Local Sync"}</span>
                </span>

                {/* Prominent, accessible Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-base cursor-pointer transition-colors border border-slate-700 ml-1"
                  title="Close Inspector (Esc)"
                  aria-label="Close Inspector"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Subheader / Tabs */}
            <div className="grid grid-cols-4 text-xs border-b border-slate-800 bg-slate-950/60 shrink-0">
              <button
                onClick={() => setActiveTab("build")}
                className={`py-2.5 text-center font-bold transition-all cursor-pointer ${
                  activeTab === "build"
                    ? "border-b-2 border-[#0866F5] text-blue-400 bg-slate-800/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Check T ({buildDecisions.length})
              </button>
              <button
                onClick={() => setActiveTab("student")}
                className={`py-2.5 text-center font-medium transition-all cursor-pointer ${
                  activeTab === "student"
                    ? "border-b-2 border-[#0866F5] text-blue-400 bg-slate-800/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Student ({studentMemories.length})
              </button>
              <button
                onClick={() => setActiveTab("shared")}
                className={`py-2.5 text-center font-medium transition-all cursor-pointer ${
                  activeTab === "shared"
                    ? "border-b-2 border-[#0866F5] text-blue-400 bg-slate-800/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Shared ({sharedKnowledge.length})
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`py-2.5 text-center font-medium transition-all cursor-pointer ${
                  activeTab === "search"
                    ? "border-b-2 border-[#0866F5] text-blue-400 bg-slate-800/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🔍 Live Query
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {activeTab === "build" ? (
                buildDecisions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">Loading live Check T decisions...</div>
                ) : (
                  buildDecisions.map((dec) => (
                    <div
                      key={dec.id}
                      className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-blue-500/40 transition-colors flex flex-col gap-1.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-extrabold text-blue-300 text-xs leading-snug">
                          {dec.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shrink-0">
                          Promoted
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                        <span>👤</span>
                        <span>{dec.teammate}</span>
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px] pt-1 border-t border-slate-700/40">
                        {dec.decision}
                      </p>
                    </div>
                  ))
                )
              ) : activeTab === "student" ? (
                studentMemories.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    No student episodic memories extracted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      <button
                        onClick={() => setStudentFilterMode("all")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                          studentFilterMode === "all"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
                        }`}
                      >
                        All ({studentMemories.length})
                      </button>
                      <button
                        onClick={() => setStudentFilterMode("deaf")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                          studentFilterMode === "deaf"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-indigo-950/70 text-indigo-300 hover:text-indigo-200 border border-indigo-800/60"
                        }`}
                      >
                        🤟 Deaf ({studentMemories.filter((m) => m.mode === "deaf").length})
                      </button>
                      <button
                        onClick={() => setStudentFilterMode("blind")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                          studentFilterMode === "blind"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-blue-950/70 text-blue-300 hover:text-blue-200 border border-blue-800/60"
                        }`}
                      >
                        🎙️ Blind ({studentMemories.filter((m) => m.mode === "blind").length})
                      </button>
                      <button
                        onClick={() => setStudentFilterMode("motor")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                          studentFilterMode === "motor"
                            ? "bg-teal-600 text-white shadow-xs"
                            : "bg-teal-950/70 text-teal-300 hover:text-teal-200 border border-teal-800/60"
                        }`}
                      >
                        🎯 Motor ({studentMemories.filter((m) => m.mode === "motor").length})
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 !text-sm">search</span>
                      <input
                        type="text"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        placeholder="Search 90 individual student memories..."
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    {/* Student Memory Cards */}
                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {filteredStudentMemories.map((m) => (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700/80 hover:border-blue-500/30 transition-colors flex flex-col gap-1.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-blue-300">
                                {m.studentName ? `${m.studentName} (${m.studentId})` : m.id}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  m.mode === "deaf"
                                    ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                                    : m.mode === "blind"
                                    ? "bg-blue-950 text-blue-300 border border-blue-800"
                                    : "bg-teal-950 text-teal-300 border border-teal-800"
                                }`}
                              >
                                {m.mode ? m.mode.toUpperCase() : m.category}
                              </span>
                            </div>
                            {m.promoted && (
                              <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full font-bold text-[9px]">
                                Promoted
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200 leading-relaxed text-[11px]">{m.text}</p>
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-700/40 text-[10px] text-slate-400">
                            <span className="font-mono text-[9px] text-slate-500">scope: student-voice-memory</span>
                            <div className="flex items-center gap-2">
                              {!m.promoted && (
                                <button
                                  onClick={() => handlePromote(m.id)}
                                  className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer font-medium"
                                >
                                  Promote to Shared
                                </button>
                              )}
                              <button
                                onClick={() => handleForget(m.id)}
                                className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                              >
                                Forget
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : activeTab === "shared" ? (
                sharedKnowledge.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">No shared canon yet.</div>
                ) : (
                  sharedKnowledge.map((kb) => (
                    <div
                      key={kb.id}
                      className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-900/50 flex flex-col gap-1"
                    >
                      <span className="text-[10px] text-blue-400 uppercase font-semibold">
                        Contributed by: {kb.contributor}
                      </span>
                      <p className="text-slate-200 leading-relaxed text-[11px]">{kb.text}</p>
                    </div>
                  ))
                )
              ) : (
                /* Live Search Tab */
                <div className="space-y-3.5">
                  <form onSubmit={handleLiveSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Meko vector memory..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="px-3.5 py-2 bg-[#0866F5] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Live Results from Meko ({searchResults.length}):
                      </span>
                      {searchResults.map((r, i) => (
                        <div
                          key={r.id || i}
                          className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-[11px]"
                        >
                          <p>{r.memory || r.text}</p>
                          {r.score && (
                            <span className="text-[9px] text-emerald-400 mt-1 block">
                              Similarity Match: {(r.score * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Memory Form */}
                  <form onSubmit={handleAddLiveMemory} className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Store New Durable Fact in Meko:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMemoryText}
                        onChange={(e) => setNewMemoryText(e.target.value)}
                        placeholder="e.g. Student prefers Hindi captions..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Save
                      </button>
                    </div>
                    {addStatus && <span className="text-[10px] text-emerald-400 block">{addStatus}</span>}
                  </form>
                </div>
              )}
            </div>

            {/* Footer (Sticky at bottom) */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between items-center shrink-0">
              <span className="truncate max-w-[260px]">
                Datapack:{" "}
                <code className="text-slate-300">
                  {activeTab === "build"
                    ? buildDatapackId
                    : activeTab === "student"
                    ? studentDatapackId
                    : sharedDatapackId}
                </code>
              </span>
              <button
                onClick={refreshContext}
                className="hover:text-white font-bold text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>↻</span>
                <span>Sync Live</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
