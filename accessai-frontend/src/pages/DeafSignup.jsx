import { useState } from "react";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";

export default function DeafSignup() {
  const navigate = useNavigate();
  const { signUp, loginDemoUser } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessibilityPref, setAccessibilityPref] = useState("deaf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("err_passwords_match", "Passwords do not match."));
      return;
    }
    if (phone) {
      const cleanedPhone = phone.replace(/\D/g, "");
      if (cleanedPhone.length !== 10) {
        setError(t("err_phone_length", "Mobile number must be exactly 10 digits."));
        return;
      }
    }
    setLoading(true);
    setError("");
    try {
      await signUp({
        name: fullName,
        email,
        password,
        phone,
        disabilityType: accessibilityPref
      });
      navigate(`/${accessibilityPref}`);
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans relative overflow-hidden flex flex-col items-center justify-center p-4 pt-20 pb-12">
      {/* Soft glows */}
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
          <LanguageSelector compact={true} />
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-fixed text-primary border border-outline-variant/20 uppercase tracking-widest">
            {t("mode_deaf", "Deaf Mode")}
          </span>
        </div>
      </header>

      {/* Card */}
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 shadow-2xl rounded-3xl p-8 backdrop-blur-xl relative z-10 my-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight mb-2">
            {t("create_account", "Create Account")}
          </h1>
          <p className="text-sm text-on-surface-variant font-medium">
            {t("signup_subtitle", "Sign up to begin your personalized learning journey.")}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              {t("label_full_name", "Full Name")}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline/60 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              {t("label_email", "Email Address")}
            </label>
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
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              {t("label_phone", "Mobile Number (10 Digits)")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              maxLength={10}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline/60 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              {t("label_password", "Password")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline/60 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              {t("label_confirm_password", "Confirm Password")}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline/60 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              {t("accessibility_preference", "Accessibility Preference")}
            </label>
            <select
              value={accessibilityPref}
              onChange={(e) => setAccessibilityPref(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm cursor-pointer"
            >
              <option value="deaf">{t("pref_deaf", "Deaf Mode (Sign Language Avatar)")}</option>
              <option value="blind">{t("pref_blind", "Blind Mode (Screen Reader & Audio)")}</option>
              <option value="motor">{t("pref_motor", "Motor Impaired (Gaze & Switch Navigation)")}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
              <span>{t("sign_up", "Sign Up")}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-on-surface-variant">
          <span>{t("already_have_account", "Already have an account?")} </span>
          <button
            type="button"
            onClick={() => navigate("/deaf/login")}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            {t("sign_in", "Sign In")}
          </button>
        </div>
      </div>
    </div>
  );
}
