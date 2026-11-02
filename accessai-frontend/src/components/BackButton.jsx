import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ fallback = "/", onClick, className = "" }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
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
      navigate(fallback, { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back"
      title="Go back"
      className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white hover:bg-slate-100 text-[#10265C] border border-slate-200/90 shadow-2xs transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0866F5] focus-visible:ring-offset-2 cursor-pointer shrink-0 ${className}`}
    >
      <span
        className="material-symbols-outlined !text-xl md:!text-2xl leading-none select-none"
        aria-hidden="true"
      >
        arrow_back
      </span>
    </button>
  );
}

