import { useState } from "react";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DeafLogin() {
  const navigate = useNavigate();
  const { signIn, loginDemoUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      navigate("/deaf");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Soft gradient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-3">
          <BackButton fallback="/?step=mode" />
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl font-bold text-primary font-headline">AccessAI</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-fixed text-primary border border-outline-variant/20 uppercase tracking-widest">
            Deaf Mode
          </span>
        </div>
      </header>

      {/* Card */}
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 shadow-2xl rounded-3xl p-8 backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight mb-2">Welcome Back</h1>
          <p className="text-sm text-on-surface-variant font-medium">Log in to continue your sign-supported learning.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline/60 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline/60 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Demo Fast Login Option */}
        <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              loginDemoUser("deaf", "goyalvrusha@gmail.com", "Vrusha Goyal");
              navigate("/deaf");
            }}
            className="w-full py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-xs text-on-surface-variant font-medium transition-all"
          >
            1-Click Demo Account (Vrusha Goyal)
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-on-surface-variant">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate("/deaf/signup")}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
