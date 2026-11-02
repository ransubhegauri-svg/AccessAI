import React, { useState, useEffect, useCallback } from "react";
import API from "../services/api";
import { getEffectiveStudentName } from "../utils/studentSession";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";

export default function DegreeGraduationOffer({
  mode = "general",
  speak = null,
  dwellEnabled = false,
  dwell = null,
  cardClass = "bg-white border border-amber-200/80 shadow-md text-slate-800",
  innerCardClass = "bg-slate-50 border border-slate-200/80",
  textTitleClass = "text-slate-900",
  onNavigateToCourse = null,
}) {
  const { user } = useAuth();
  const { account: walletAccount, refreshPoints } = useWallet();

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(null);
  const [claimError, setClaimError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [degreeData, setDegreeData] = useState({
    totalRequired: 5,
    completedCount: 0,
    completionPercentage: 0,
    isEligible: false,
    degreeTitle: "Bachelor of Accessible Software Engineering & Applied AI",
    honorsClassification: "First Class Honors with Distinction",
    graduationBonusPoints: 500,
    offerHeadline: "🎓 Academic Degree Pathway: Complete 5 Major Certificates to Graduate with Honors!",
    offerDisclaimer:
      "Confirms rigorous completion of 5 comprehensive curriculum specializations. Honors educational diploma for career-readiness and professional portfolio presentation; does not guarantee employment.",
    specializations: [],
    degreeCertificate: null,
  });

  const studentName = getEffectiveStudentName(user, mode);
  const activeWallet = walletAccount || localStorage.getItem("accessai_wallet_address");

  // Fetch degree progress from backend
  const fetchDegreeProgress = useCallback(async () => {
    try {
      setLoading(true);
      const uId = user?.uid || `demo-uid-${mode}`;
      const res = await API.get(`/degree/progress/${uId}`);
      if (res.data) {
        setDegreeData((prev) => ({
          ...prev,
          ...res.data,
        }));
        if (res.data.degreeCertificate) {
          setClaimSuccess(res.data.degreeCertificate);
        }
      }
    } catch (err) {
      console.warn("Using local degree progress evaluation fallback:", err);
      // Fallback: evaluate from localStorage
      try {
        const storedCompletions = JSON.parse(
          localStorage.getItem(`accessai_career_completions_${user?.uid || mode}`) || "[]"
        );
        const count = Math.min(5, storedCompletions.length > 0 ? storedCompletions.length : 2);
        const percentage = Math.round((count / 5) * 100);
        setDegreeData((prev) => ({
          ...prev,
          completedCount: count,
          completionPercentage: percentage,
          isEligible: count >= 5,
        }));
      } catch (e) {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid, mode]);

  useEffect(() => {
    fetchDegreeProgress();
  }, [fetchDegreeProgress]);

  // Voice announcement on initial render (Blind mode)
  useEffect(() => {
    if (speak && mode === "blind") {
      speak(
        "Academic Honors Degree Pathway Offer. Complete any 5 major certificates to earn your Bachelor of Accessible Software Engineering and Applied AI with First Class Honors, plus 500 bonus MST reward points anchored on MST Blockchain.",
        true
      );
    }
  }, [speak, mode]);

  // Fast-track demo simulation for testing / demoing graduation
  const handleFastTrackCompletion = async () => {
    try {
      setLoading(true);
      const uId = user?.uid || `demo-uid-${mode}`;
      // Simulate 5 completed courses in localStorage and trigger progress recalculation
      const mockCompletions = ["web-101", "py-101", "ai-101", "course-1", "databases-101"];
      localStorage.setItem(
        `accessai_career_completions_${uId}`,
        JSON.stringify(mockCompletions)
      );

      // Also record them in backend if possible
      for (const cid of mockCompletions) {
        try {
          await API.post("/career/course/complete", {
            userId: uId,
            courseId: cid,
            pathId: "career-web-dev",
          });
        } catch {}
      }

      await fetchDegreeProgress();

      // Force eligible state for immediate demonstration
      setDegreeData((prev) => ({
        ...prev,
        completedCount: 5,
        completionPercentage: 100,
        isEligible: true,
      }));

      if (speak) {
        speak("All 5 major certificate pathways completed! You are now eligible to claim your Academic Honors Degree.", true);
      }
    } catch (e) {
      console.error("Fast track error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Claim Honors Degree on MST Testnet
  const handleClaimDegree = async () => {
    setClaiming(true);
    setClaimError("");

    if (speak) {
      speak("Minting your official Academic Honors Degree NFT on MST Testnet and awarding 500 bonus reward points. Please wait.", true);
    }

    try {
      const uId = user?.uid || `demo-uid-${mode}`;
      const payload = {
        userId: uId,
        studentName: studentName || "Vrusha Goyal",
        walletAddress: activeWallet,
      };

      const res = await API.post("/degree/claim", payload);

      if (res.data?.certificate || res.data?.blockchain) {
        const cert = res.data.certificate || res.data.blockchain;
        setClaimSuccess(cert);
        setShowModal(true);
        if (refreshPoints) {
          refreshPoints();
        }

        if (speak) {
          speak(
            `Congratulations ${studentName}! Your Bachelor of Accessible Software Engineering and Applied AI degree diploma has been officially minted on MST Blockchain with 500 bonus points!`,
            true
          );
        }
      } else {
        setClaimError(res.data?.error || "Failed to mint Degree on MST Testnet.");
      }
    } catch (err) {
      console.error("Degree claim error:", err);
      const errMsg = err.response?.data?.error || err.message || "Network error while minting on MST Testnet.";
      setClaimError(errMsg);
    } finally {
      setClaiming(false);
    }
  };

  const completedCount = degreeData.completedCount ?? 0;
  const isEligible = degreeData.isEligible || completedCount >= 5;
  const hasAlreadyGraduated = Boolean(claimSuccess || degreeData.degreeCertificate);
  const activeCert = claimSuccess || degreeData.degreeCertificate;

  const publicVerificationUrl = activeCert
    ? `/verify?id=${activeCert.certificateId}`
    : `/verify?id=CERT-DEGREE-HONORS-EETEST`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicVerificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    if (speak) {
      speak("Public verification link copied to clipboard.", true);
    }
  };

  return (
    <div
      role="region"
      aria-label="Academic Degree Pathway Offer"
      className={`rounded-3xl overflow-hidden border-2 transition-all relative ${
        hasAlreadyGraduated
          ? "border-amber-400 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/15 shadow-xl shadow-amber-500/10"
          : isEligible
          ? "border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 shadow-xl shadow-emerald-500/10"
          : "border-amber-300/80 bg-gradient-to-br from-amber-500/10 via-surface to-indigo-500/10 shadow-lg shadow-amber-500/5"
      } ${cardClass} p-6 md:p-8 my-6`}
    >
      {/* ── Top Header & Promotional Badges ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-xs">
              <span className="material-symbols-outlined !text-sm">school</span>
              Academic Honors Degree Offer
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/10 text-indigo-700 border border-indigo-500/30">
              <span className="material-symbols-outlined !text-xs">rewarded_ads</span>
              +500 MST Points Reward
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/10 text-emerald-800 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              MST Testnet Verified
            </span>
          </div>

          <h2 className={`text-2xl md:text-3xl font-extrabold font-headline leading-tight mt-2 ${textTitleClass}`}>
            {degreeData.degreeTitle}
          </h2>

          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-amber-700">
            <span className="material-symbols-outlined !text-base">workspace_premium</span>
            <span>Award Classification: <strong>{degreeData.honorsClassification}</strong></span>
          </div>
        </div>

        {/* Graduation Status Pill */}
        <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
          {hasAlreadyGraduated ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 text-white font-bold text-xs shadow-md">
              <span className="material-symbols-outlined !text-lg">verified</span>
              <span>Degree Earned & Anchored On-Chain</span>
            </div>
          ) : isEligible ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md animate-pulse">
              <span className="material-symbols-outlined !text-lg">celebration</span>
              <span>Honors Graduation Unlocked!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined !text-base text-amber-600">hourglass_top</span>
              <span>{5 - completedCount} More Certificate{5 - completedCount === 1 ? "" : "s"} Needed</span>
            </div>
          )}

          <div className="text-[11px] text-on-surface-variant font-mono">
            Candidate: <strong className="text-on-surface font-sans">{studentName}</strong>
          </div>
        </div>
      </div>

      {/* ── Offer Description & Live Milestone Tracker ── */}
      <div className="my-6 space-y-4">
        <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
          Complete any <strong>5 major accredited certificates</strong> across our specialized career tracks and core courses to automatically earn the prestigious <strong>AccessAI Academic Honors Degree</strong>. Your diploma is permanently anchored on the <strong>MST Testnet ERC-721 smart contract</strong> with an immutable cryptographic SHA-256 hash, accompanied by a <strong>500 MST reward points bonus</strong>!
        </p>

        {/* Progress Bar Container */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="font-bold uppercase tracking-wider text-on-surface font-headline flex items-center gap-1.5">
              <span className="material-symbols-outlined !text-base text-primary">analytics</span>
              Degree Pathway Milestone:
            </span>
            <span className="font-mono font-bold text-primary text-sm">
              {completedCount} / 5 Major Certificates Completed ({Math.min(100, Math.round((completedCount / 5) * 100))}%)
            </span>
          </div>

          {/* Graphical Progress Bar */}
          <div className="w-full h-3.5 bg-surface-container-high rounded-full overflow-hidden p-0.5 border border-outline-variant/20 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isEligible
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/50"
                  : "bg-gradient-to-r from-amber-500 via-primary to-indigo-600"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (completedCount / 5) * 100))}%` }}
            />
          </div>

          {/* Stepper Markers */}
          <div className="grid grid-cols-5 gap-1 pt-1 text-center font-mono text-[11px]">
            {[1, 2, 3, 4, 5].map((step) => {
              const stepDone = completedCount >= step;
              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      stepDone
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-surface-container-high text-on-surface-variant border border-outline-variant/40"
                    }`}
                  >
                    {stepDone ? "✓" : step}
                  </div>
                  <span className="text-[10px] mt-1 text-on-surface-variant hidden sm:inline-block">
                    {step === 5 ? "🎓 Degree" : `Cert #${step}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5 Accredited Major Specializations Grid ── */}
      <div className="my-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3 font-headline flex items-center justify-between">
          <span>Eligible Specialization Curricula (Any 5 Qualify):</span>
          <span className="text-xs font-normal normal-case text-primary font-sans">
            Includes Career Tracks & Core Modules
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(degreeData.specializations?.length > 0
            ? degreeData.specializations
            : [
                {
                  id: "prog-web-dev",
                  title: "Full Stack Web Development Career Specialization",
                  badge: "Full Stack Mastery",
                  icon: "code",
                  category: "Software Engineering",
                  description: "Accessible HTML5, responsive CSS3, ES6+ JS, React components, and REST APIs.",
                  isCompleted: completedCount >= 1,
                },
                {
                  id: "prog-python-dev",
                  title: "Python Software & Backend Engineering",
                  badge: "Backend Mastery",
                  icon: "terminal",
                  category: "Backend Architecture",
                  description: "Python 3, data structures, OOP design, relational SQL, and Flask microservices.",
                  isCompleted: completedCount >= 2,
                },
                {
                  id: "prog-ai-dev",
                  title: "Machine Learning & Assistive Artificial Intelligence",
                  badge: "AI & ML Mastery",
                  icon: "smart_toy",
                  category: "Artificial Intelligence",
                  description: "ML algorithms, NumPy tensor maths, neural networks, and assistive genAI models.",
                  isCompleted: completedCount >= 3,
                },
                {
                  id: "prog-asl-media",
                  title: "American Sign Language & Accessible Media Standards",
                  badge: "Accessibility Leadership",
                  icon: "pan_tool",
                  category: "Inclusive Computing",
                  description: "Fingerspelling, syntax, facial markers, and multi-modal accessible interfaces.",
                  isCompleted: completedCount >= 4,
                },
                {
                  id: "prog-db-systems",
                  title: "Database Architecture & Cryptographic Blockchain Verification",
                  badge: "Data & Ledger Systems",
                  icon: "database",
                  category: "Decentralized Systems",
                  description: "Relational schemas, SQL optimization, and ERC-721 ledger immutability on MST.",
                  isCompleted: completedCount >= 5,
                },
              ]
          ).map((spec, idx) => {
            const isDone = spec.isCompleted || completedCount > idx;
            return (
              <div
                key={spec.id || idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isDone
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs"
                    : `${innerCardClass} text-on-surface`
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isDone ? "bg-emerald-600 text-white" : "bg-primary/10 text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined !text-lg">
                        {isDone ? "check_circle" : spec.icon || "school"}
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                        isDone
                          ? "bg-emerald-200 text-emerald-900 border border-emerald-300"
                          : "bg-surface-container-high text-on-surface-variant border border-outline-variant/30"
                      }`}
                    >
                      {isDone ? "✓ Earned" : "In Progress"}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs md:text-sm font-headline leading-snug">
                    {spec.title}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                    {spec.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-on-surface-variant">{spec.category}</span>
                  <span className="font-bold text-primary">{spec.badge}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Official Career-Readiness & Educational Disclaimer ── */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 flex items-start gap-3 my-5">
        <span className="material-symbols-outlined !text-xl text-amber-700 shrink-0 mt-0.5">
          verified_user
        </span>
        <div>
          <span className="font-bold uppercase tracking-wider font-headline text-[11px] text-amber-900 block">
            Academic Honors Degree & Career-Readiness Disclosure
          </span>
          <p className="mt-0.5 leading-relaxed text-amber-900">
            {degreeData.offerDisclaimer}
          </p>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-outline-variant/20">
        <div className="flex flex-wrap items-center gap-2">
          {hasAlreadyGraduated ? (
            <>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer font-headline"
              >
                <span className="material-symbols-outlined !text-lg">visibility</span>
                <span>View Honors Degree Diploma</span>
              </button>

              <a
                href={`/certificate/download/${activeCert.certificateId}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs border border-outline-variant/40 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined !text-base text-primary">download</span>
                <span>Download PDF</span>
              </a>

              <a
                href={publicVerificationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined !text-base">verified</span>
                <span>Verify on MST</span>
              </a>
            </>
          ) : isEligible ? (
            <button
              type="button"
              onClick={handleClaimDegree}
              disabled={claiming}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50 font-headline animate-pulse"
            >
              {claiming ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Anchoring Degree on MST Testnet (500 PTS)...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined !text-xl">school</span>
                  <span>Claim Honors Degree & 500 MST Points</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-medium">
                Finish {5 - completedCount} more certificate(s) to unlock your degree.
              </span>
            </div>
          )}
        </div>

        {/* Demo Fast-Track Evaluation Button */}
        {!hasAlreadyGraduated && !isEligible && (
          <button
            type="button"
            onClick={handleFastTrackCompletion}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-dashed border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Simulate all 5 specializations to test the Degree graduation flow"
          >
            <span className="material-symbols-outlined !text-sm text-amber-700">speed</span>
            <span>Fast-Track All 5 Milestones (Demo)</span>
          </button>
        )}
      </div>

      {/* Claim Error Display */}
      {claimError && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined !text-base text-red-600">error</span>
          <span>{claimError}</span>
        </div>
      )}

      {/* ── Modal: High-Resolution Honors Degree Diploma Preview ── */}
      {showModal && activeCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AccessAI Academic Honors Degree Diploma"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col max-h-[92vh] text-slate-800 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined !text-2xl">school</span>
                <div>
                  <h3 className="font-bold text-base md:text-lg font-headline">
                    AccessAI Academic Honors Degree Diploma
                  </h3>
                  <span className="text-xs text-amber-100 font-mono">
                    Token ID #{activeCert.tokenId ?? "Active"} • {activeCert.certificateId}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined !text-base">close</span>
              </button>
            </div>

            {/* Modal Body: Diploma Graphic & Verification Details */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Diploma Graphic Preview */}
              <div className="rounded-2xl overflow-hidden border-2 border-amber-300 shadow-lg relative bg-slate-900 group">
                <img
                  src={`/certificate/image/${activeCert.certificateId}`}
                  alt="AccessAI Academic Honors Degree"
                  className="w-full h-auto object-contain max-h-[500px] mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/certificate_base.png";
                  }}
                />
              </div>

              {/* On-Chain Provenance Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Recipient</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1">
                    <span className="material-symbols-outlined !text-base text-primary">person</span>
                    {activeCert.studentName || studentName}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Degree Classification</span>
                  <span className="font-bold text-amber-700 text-xs mt-0.5 block">
                    {activeCert.honorsClassification || "First Class Honors with Distinction"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Graduation Reward</span>
                  <span className="font-bold text-emerald-700 text-xs mt-0.5 block flex items-center gap-1">
                    <span className="material-symbols-outlined !text-base">rewarded_ads</span>
                    +500 MST Points Awarded
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">MST Blockchain TX Hash</span>
                  <span className="font-mono text-primary font-bold text-[11px] break-all block mt-0.5">
                    {activeCert.certificateTxHash || "0x..."}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Standard & Network</span>
                  <span className="font-bold text-slate-800 text-xs block mt-0.5">
                    ERC-721 • MST Testnet (91562037)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Cryptographic SHA-256 Hash</span>
                  <span className="font-mono text-slate-800 text-[11px] break-all block mt-0.5">
                    {activeCert.certificateHash || "Stored on-chain"}
                  </span>
                </div>
              </div>

              {/* Career Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950">
                <span className="font-bold block uppercase text-[10px] tracking-wider text-amber-900 mb-0.5">
                  Educational Honors Degree Notice
                </span>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  {activeCert.degreeStatement || degreeData.offerDisclaimer}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined !text-base">
                  {copiedLink ? "check" : "link"}
                </span>
                <span>{copiedLink ? "Link Copied!" : "Share Verification Link"}</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`/certificate/download/${activeCert.certificateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:brightness-110 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined !text-base">download</span>
                  <span>Download Official PDF</span>
                </a>

                <a
                  href={publicVerificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined !text-base">verified</span>
                  <span>Verify on MST</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
