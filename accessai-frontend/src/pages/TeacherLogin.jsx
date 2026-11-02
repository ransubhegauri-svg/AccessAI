import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageSelector from "../components/LanguageSelector";
import BackButton from "../components/BackButton";

function SparkleIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="teacher-sparkle-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0066ff" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        fill="url(#teacher-sparkle-grad)"
      />
    </svg>
  );
}

export default function TeacherLogin() {
  const navigate = useNavigate();
  const { signInTeacher, loginTeacherDemoUser, loginDemoUser, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInTeacher(email, password);
      navigate("/teacher");
    } catch (err) {
      console.error("Teacher login error:", err);
      setErrorMsg(err.message || "Failed to authenticate educator credentials. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoTeacherLogin = () => {
    loginTeacherDemoUser();
    navigate("/teacher");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#f0f6ff] text-slate-900 font-sans selection:bg-[#0066ff] selection:text-white flex flex-col justify-between">
      {/* ── Top Navbar ── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-16 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate("/?step=role")} fallback="/?step=role" />
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <SparkleIcon className="w-6 h-6" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#0f172a]">Access</span>
              <span className="text-[#0066ff]">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-xs font-bold tracking-wide hidden sm:inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span>Educator Portal</span>
          </span>
          <LanguageSelector />
        </div>
      </header>

      {/* ── Main Content Form ── */}
      <main className="pt-28 pb-16 px-6 md:px-12 flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 md:p-10 relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#16a34a] via-[#0284c7] to-[#0066ff]" />

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] mx-auto flex items-center justify-center mb-4 shadow-2xs">
                <span className="material-symbols-outlined !text-3xl">cast_for_education</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Teacher Login
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Sign in to manage student rosters, monitor learning progress, and broadcast live RN sessions.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
                <span className="material-symbols-outlined !text-base shrink-0 mt-0.5">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Teacher Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 !text-xl pointer-events-none">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@institution.edu"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 text-sm font-medium text-slate-800 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 !text-xl pointer-events-none">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 text-sm font-medium text-slate-800 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#0066ff] hover:bg-blue-600 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as Teacher</span>
                    <span className="text-base font-bold">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                  Or instant access
                </span>
              </div>
            </div>

            {/* Demo Teacher Login Button */}
            <button
              type="button"
              onClick={handleDemoTeacherLogin}
              className="w-full p-3.5 rounded-2xl bg-[#f0fdf4] hover:bg-[#e6fbe9] border border-[#bbf7d0] text-left flex items-center justify-between gap-3 group transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#16a34a] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#15803d]">Demo Teacher Account</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#dcfce7] text-[#15803d] text-[10px] font-extrabold">
                      1-CLICK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    Login as <strong className="text-slate-800">Prof. Ananya Rao</strong> (teacher@accessai.edu)
                  </p>
                </div>
              </div>
              <span className="text-base font-bold text-[#16a34a] group-hover:translate-x-1 transition-transform pl-1">
                →
              </span>
            </button>

            {/* Student 1-Click Demo Logins */}
            <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Student 1-Click Demo Logins:
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    loginDemoUser("deaf", "goyalvrusha@gmail.com", "Vrusha Goyal");
                    navigate("/deaf");
                  }}
                  className="w-full p-2.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/80 text-left flex items-center justify-between text-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">🤟</span>
                    <div className="min-w-0">
                      <span className="font-bold text-indigo-900 block leading-tight">Vrusha Goyal</span>
                      <span className="text-[10px] text-indigo-600 font-medium">Deaf / Sign Language Mode</span>
                    </div>
                  </div>
                  <span className="text-indigo-700 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                    Enter →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    loginDemoUser("blind", "amanhalkude7750+blind@gmail.com", "Aman Halkude");
                    navigate("/blind");
                  }}
                  className="w-full p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 text-left flex items-center justify-between text-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">🎙️</span>
                    <div className="min-w-0">
                      <span className="font-bold text-blue-900 block leading-tight">Aman Halkude</span>
                      <span className="text-[10px] text-[#0866F5] font-medium">Blind / Voice Guided Mode</span>
                    </div>
                  </div>
                  <span className="text-[#0866F5] font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                    Enter →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    loginDemoUser("motor", "amanhalkude7750@gmail.com", "Aarav Patel");
                    navigate("/motor");
                  }}
                  className="w-full p-2.5 rounded-xl bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200/80 text-left flex items-center justify-between text-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">🎯</span>
                    <div className="min-w-0">
                      <span className="font-bold text-teal-900 block leading-tight">Aarav Patel</span>
                      <span className="text-[10px] text-teal-700 font-medium">Motor / Hands-Free Mode</span>
                    </div>
                  </div>
                  <span className="text-teal-700 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                    Enter →
                  </span>
                </button>
              </div>
            </div>

            {/* Return to student role link */}
            <div className="text-center mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                Are you a student?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/?step=mode")}
                  className="font-bold text-[#0066ff] hover:underline cursor-pointer"
                >
                  Go to Student Login →
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-100 bg-white/50">
        AccessAI Educator Workspace • Compliant with Role-Based Separation & Zero Student AI Agent Leakage
      </footer>
    </div>
  );
}

