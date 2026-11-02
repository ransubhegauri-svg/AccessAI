import React, { useState } from "react";
import {
  GESTURES,
  GESTURE_CATEGORIES,
  SUPPORTED_SPEEDS,
  getGestureById,
  getGesturesByCategory
} from "../../services/gestureMapping";

/**
 * GestureExplanation - Accessible, Deaf-Friendly Sign Breakdown & Guide
 * 
 * Features:
 * - Clear, high-contrast anatomical instructions (handshape, palm orientation, location, movement)
 * - Critical Non-Manual Markers (facial expressions, head movements)
 * - Visual Memory Tips & Common Learner Pitfalls
 * - Interactive Practice Tracker (mark practiced / mastered)
 * - Replay and Slow-Motion integration
 * - Quick Gesture Category & Item Switcher
 */
export default function GestureExplanation({
  gestureId = "Thumb_Up",
  onSelectGesture = null,
  onReplay = null,
  onSpeedChange = null,
  currentSpeed = 1.0,
  isLight = false,
  className = ""
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [completedSigns, setCompletedSigns] = useState({});

  // Active gesture resolution
  const gesture = getGestureById(gestureId) || GESTURES[0];
  const explanation = gesture.explanation || {};

  // Filtered list of gestures for quick selector
  const availableGestures = getGesturesByCategory(activeCategory);

  const togglePracticed = (id) => {
    setCompletedSigns((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isPracticed = !!completedSigns[gesture.id];

  return (
    <div
      data-testid="gesture-explanation-container"
      className={`flex flex-col gap-5 p-6 rounded-2xl border transition-all ${
        isLight
          ? "bg-white text-slate-800 border-slate-200 shadow-md"
          : "bg-slate-900/90 text-white border-slate-800 shadow-xl backdrop-blur-md"
      } ${className}`}
    >
      {/* ── 1. Category Switcher Tabs ──────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === "all"
              ? "bg-cyan-600 text-white shadow-sm"
              : isLight
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
          }`}
        >
          All Signs ({GESTURES.length})
        </button>
        {Object.values(GESTURE_CATEGORIES).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-cyan-600 text-white shadow-sm"
                : isLight
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quick Horizontal Gesture Selector Chips */}
      {onSelectGesture && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {availableGestures.map((g) => {
            const isSelected = g.id === gesture.id;
            return (
              <button
                key={g.id}
                onClick={() => onSelectGesture(g.id)}
                data-testid={`select-gesture-${g.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white border-cyan-400 shadow-md scale-105"
                    : isLight
                    ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
                {completedSigns[g.id] && <span className="text-emerald-400 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ── 2. Active Gesture Header ───────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-4xl shadow-inner">
            {gesture.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold tracking-tight">{gesture.label}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
                {gesture.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{gesture.summary}</p>
          </div>
        </div>

        {/* Practice Status & Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => togglePracticed(gesture.id)}
            data-testid="mark-practiced-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isPracticed
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                : isLight
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <span>{isPracticed ? "✓ Mastered" : "Mark as Practiced"}</span>
          </button>
        </div>
      </div>

      {/* ── 3. Step-by-Step Anatomical Breakdown ───────────────────── */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <span>🖐️</span> Step-by-Step Formation
        </span>

        {explanation.steps && (
          <div className="flex flex-col gap-2">
            {explanation.steps.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-700"
                    : "bg-slate-800/60 border-slate-800 text-slate-200"
                }`}
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] border border-cyan-500/30">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Detailed Linguistic & Physical Parameters ───────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Handshape */}
        <div
          className={`p-3.5 rounded-xl border text-xs ${
            isLight
              ? "bg-slate-50 border-slate-200 text-slate-700"
              : "bg-slate-800/40 border-slate-800 text-slate-300"
          }`}
        >
          <span className="font-bold text-cyan-400 block mb-1">Handshape & Fingers</span>
          <p className="leading-relaxed">{explanation.handshape}</p>
        </div>

        {/* Orientation & Location */}
        <div
          className={`p-3.5 rounded-xl border text-xs ${
            isLight
              ? "bg-slate-50 border-slate-200 text-slate-700"
              : "bg-slate-800/40 border-slate-800 text-slate-300"
          }`}
        >
          <span className="font-bold text-cyan-400 block mb-1">Palm Orientation & Signing Space</span>
          <p className="leading-relaxed">
            {explanation.orientation} ({explanation.location})
          </p>
        </div>

        {/* Movement */}
        <div
          className={`p-3.5 rounded-xl border text-xs ${
            isLight
              ? "bg-slate-50 border-slate-200 text-slate-700"
              : "bg-slate-800/40 border-slate-800 text-slate-300"
          }`}
        >
          <span className="font-bold text-cyan-400 block mb-1">Movement & Direction</span>
          <p className="leading-relaxed">{explanation.movement}</p>
        </div>

        {/* Non-Manual Markers (Grammar) */}
        <div
          className={`p-3.5 rounded-xl border text-xs ${
            isLight
              ? "bg-slate-50 border-slate-200 text-slate-700"
              : "bg-slate-800/40 border-slate-800 text-slate-300"
          }`}
        >
          <span className="font-bold text-amber-400 block mb-1">
            Non-Manual Markers (Facial Grammar)
          </span>
          <p className="leading-relaxed">{explanation.nonManualMarkers}</p>
        </div>
      </div>

      {/* ── 5. Visual Memory Tip & Pitfalls ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
        {/* Memory Tip */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 text-xs">
          <span className="font-bold text-cyan-300 flex items-center gap-1 mb-1">
            <span>💡</span> Memory Tip (Mnemonic)
          </span>
          <p className="text-slate-300 leading-relaxed">{explanation.memoryTip}</p>
        </div>

        {/* Common Mistakes */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-950/20 to-slate-900 border border-rose-500/20 text-xs">
          <span className="font-bold text-rose-300 flex items-center gap-1 mb-1">
            <span>⚠️</span> Common Pitfalls to Avoid
          </span>
          <ul className="text-slate-300 list-disc list-inside space-y-1">
            {(explanation.commonMistakes || []).map((m, idx) => (
              <li key={idx} className="leading-relaxed">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── 6. Bottom Controls Bar (Replay & Slow-Mo Integration) ──── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          {onReplay && (
            <button
              onClick={onReplay}
              data-testid="explanation-replay-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <span>↺</span>
              <span>Replay 3D Avatar Demo</span>
            </button>
          )}
        </div>

        {/* Slow-Motion Speed Control */}
        {onSpeedChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Study Speed:</span>
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              {SUPPORTED_SPEEDS.map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => onSpeedChange(value)}
                  data-testid={`explanation-speed-${value}`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentSpeed === value
                      ? "bg-emerald-500 text-slate-950 font-extrabold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                  title={description}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
