import React, { useState } from "react";
import { GESTURES } from "../../services/gestureMapping";
import { SIGN_COMMANDS } from "../SignAvatarAssistant";
import { useLanguage } from "../../context/LanguageContext";

export default function SignGuideView({
  isLight = false,
  cardClass = "",
  innerCardClass = "",
  textTitleClass = "",
  onNavigate = null
}) {
  const { t } = useLanguage();
  const [filterCategory, setFilterCategory] = useState("all"); // 'all' | 'commands' | 'asl'
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCommands = SIGN_COMMANDS.filter(cmd => {
    if (filterCategory === "asl") return false;
    const matchQuery =
      cmd.actionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.signName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchQuery;
  });

  const filteredGestures = GESTURES.filter(g => {
    if (filterCategory === "commands") return false;
    const matchQuery =
      g.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.signName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchQuery;
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-fadeIn pb-12">
      {/* ── Top Hero Banner ── */}
      <div className="bg-gradient-to-r from-primary/15 via-cyan-500/10 to-secondary/15 border border-primary/20 p-8 rounded-3xl backdrop-blur relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined !text-2xl">menu_book</span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("sign_guide_badge", "Interactive Gesture Reference")}
            </span>
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${textTitleClass}`}>
            {t("sign_guide_title", "Sign Language Guide & System Commands")}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t(
              "sign_guide_subtitle",
              "Reference manual for all recognized hand gestures, camera navigation shortcuts, and ASL vocabulary across AccessAI."
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate("learn-signs")}
            className="px-5 py-3 rounded-2xl bg-primary hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
          >
            <span className="material-symbols-outlined !text-lg">pan_tool</span>
            <span>{t("open_3d_avatar_practice", "Practice with 3D Avatar")}</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar & Search ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/30 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { id: "all", label: t("filter_all", "All Signs"), icon: "apps" },
            { id: "commands", label: t("filter_commands", "System Navigation"), icon: "navigation" },
            { id: "asl", label: t("filter_asl", "ASL Vocabulary"), icon: "school" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterCategory === f.id
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/40"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="material-symbols-outlined !text-sm">{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_signs_placeholder", "Search gesture name, action...")}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-950/80 border-slate-800 text-white"
            }`}
          />
        </div>
      </div>

      {/* ── Section 1: System Command Signs (Quick Actions) ── */}
      {(filterCategory === "all" || filterCategory === "commands") && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className={`text-xl font-bold ${textTitleClass}`}>
                {t("system_commands_heading", "System Navigation Signs")}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {t("hold_requirement_note", "Hold pose for 0.6s to trigger")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCommands.map((cmd) => (
              <div
                key={cmd.gesture}
                className={`p-5 rounded-3xl ${cardClass} flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:border-cyan-500/40 relative overflow-hidden`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner">
                      {cmd.icon}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-cyan-400">{cmd.actionName}</h3>
                      <div className="text-xs font-bold text-slate-300">{cmd.signName}</div>
                      <span className="text-[10px] font-mono text-slate-500">{cmd.gesture}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-[10px] font-bold">
                    0.6s Hold
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{cmd.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Target: <strong className="text-slate-300">{cmd.targetTab}</strong>
                  </span>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        if (cmd.targetTab === "practice") onNavigate("learn-signs");
                        else onNavigate(cmd.targetTab);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                  >
                    <span>Execute</span>
                    <span className="material-symbols-outlined !text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 2: Detailed ASL Vocabulary Dictionary ── */}
      {(filterCategory === "all" || filterCategory === "asl") && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤟</span>
              <h2 className={`text-xl font-bold ${textTitleClass}`}>
                {t("asl_vocabulary_heading", "ASL Signs & Anatomical Guidelines")}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredGestures.length} {t("signs_cataloged", "signs cataloged")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGestures.map((gesture) => (
              <div
                key={gesture.id}
                className={`p-6 rounded-3xl ${cardClass} flex flex-col gap-4 transition-all hover:border-primary/40`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl p-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                      {gesture.icon}
                    </span>
                    <div>
                      <h3 className={`text-base font-extrabold ${textTitleClass}`}>
                        {gesture.label} ({gesture.signName})
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                          {gesture.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Difficulty: {gesture.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate && onNavigate("learn-signs")}
                    className="px-3 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary text-xs font-bold flex items-center gap-1 transition-all"
                    title="Open in 3D Avatar Demonstration Studio"
                  >
                    <span className="material-symbols-outlined !text-sm">visibility</span>
                    <span>3D Demo</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {gesture.summary}
                </p>

                {gesture.explanation && (
                  <div className={`p-4 rounded-2xl ${innerCardClass} flex flex-col gap-2.5 text-xs`}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                        Handshape:
                      </span>
                      <span className="text-slate-300">{gesture.explanation.handshape}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                        Orientation & Location:
                      </span>
                      <span className="text-slate-300">
                        {gesture.explanation.orientation} {gesture.explanation.location}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                        Movement Dynamics:
                      </span>
                      <span className="text-slate-300">{gesture.explanation.movement}</span>
                    </div>

                    {gesture.explanation.memoryTip && (
                      <div className="mt-1 pt-2 border-t border-slate-700/60 flex items-start gap-1.5 text-amber-300 text-[11px]">
                        <span>💡</span>
                        <span>
                          <strong>Tip:</strong> {gesture.explanation.memoryTip}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 3: Camera Recognition Tips & Signing Box Ergonomics ── */}
      <div className={`p-6 rounded-3xl ${innerCardClass} border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined !text-3xl">videocam</span>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className={`text-sm font-bold ${textTitleClass}`}>
              {t("camera_ergonomics_title", "Optimal Webcam Recognition Tips")}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Keep both hands within 15–35 cm in front of your upper torso. Ensure bright, balanced lighting on fingers without strong backlighting from windows.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate("learn-signs")}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md flex-shrink-0"
        >
          <span className="material-symbols-outlined !text-sm">play_arrow</span>
          <span>{t("open_practice_arena", "Open Practice Arena")}</span>
        </button>
      </div>
    </div>
  );
}

