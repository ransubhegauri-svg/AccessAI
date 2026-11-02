import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector({ className = "", compact = false }) {
  const { language, setLanguage, languages, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const getPrefix = (code) => {
    switch (code) {
      case "en":
        return "Eng";
      case "hi":
        return "Hin";
      case "kn":
        return "Kan";
      default:
        return code.toUpperCase();
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all active:scale-95 shadow-xs cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("choose_language")}: ${currentLang.nativeName}`}
        title={t("choose_language")}
      >
        <span className="material-symbols-outlined !text-base text-slate-500">language</span>
        <span className="font-semibold text-slate-800">{getPrefix(currentLang.code)}</span>
        <span className="text-slate-700">{currentLang.code === "en" ? "English" : currentLang.nativeName}</span>
        <span
          className="material-symbols-outlined !text-base text-slate-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-surface/95 backdrop-blur-xl border border-outline-variant/30 shadow-2xl p-1.5 z-[100] animate-fadeIn focus:outline-none ring-1 ring-black/5"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 border-b border-outline-variant/20 mb-1">
            {t("choose_language")}
          </div>

          {languages.map((l) => {
            const isSelected = l.code === language;
            return (
              <button
                key={l.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 text-primary font-bold border border-primary/20"
                    : "text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{l.flag}</span>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-xs leading-tight">{l.nativeName}</span>
                    <span className="text-[10px] text-on-surface-variant/70 leading-none">{l.label}</span>
                  </div>
                </div>

                {isSelected && (
                  <span className="material-symbols-outlined !text-sm text-primary">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
