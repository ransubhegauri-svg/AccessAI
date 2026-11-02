import React, { useState, useEffect, useCallback } from "react";
import API from "../services/api";
import { CAREER_PATHS } from "../data/careerPathsData";
import { getEffectiveStudentName } from "../utils/studentSession";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";

export default function CareerLearningPaths({
  mode = "general",
  speak = null,
  dwellEnabled = false,
  dwell = null,
  cardClass = "bg-white border border-slate-200 shadow-sm text-slate-800",
  innerCardClass = "bg-slate-50 border border-slate-200/80",
  textTitleClass = "text-slate-900",
}) {
  const { user } = useAuth();
  const { account: walletAccount, refreshPoints } = useWallet();

  const [careerProgress, setCareerProgress] = useState([]);
  const [selectedPathId, setSelectedPathId] = useState(CAREER_PATHS[0].id);
  const [activeQuizCourse, setActiveQuizCourse] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState("");
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(null);
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // Certificate Modal State
  const [activeCertData, setActiveCertData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const studentName = getEffectiveStudentName(user, mode);
  const activeWallet = walletAccount || localStorage.getItem("accessai_wallet_address");

  // Fetch real-time career progress from backend
  const fetchProgress = useCallback(async () => {
    try {
      const uId = user?.uid || `demo-uid-${mode}`;
      const res = await API.get(`/career/progress/${uId}`);
      if (res.data?.careerProgress) {
        setCareerProgress(res.data.careerProgress);
      }
    } catch {
      // Local fallback calculation from stored completions
      try {
        const storedCompletions = JSON.parse(localStorage.getItem(`accessai_career_completions_${user?.uid || mode}`) || "[]");
        const fallbackList = CAREER_PATHS.map((cp) => {
          const pathCourseIds = cp.courses.map((c) => c.id);
          const completedInPath = pathCourseIds.filter((cid) => storedCompletions.includes(cid));
          const count = completedInPath.length;
          return {
            ...cp,
            completedCount: count,
            completionPercentage: Math.round((count / 5) * 100),
            isCompleted: count >= 5,
            completedCourseIds: completedInPath,
          };
        });
        setCareerProgress(fallbackList);
      } catch {}
    }
  }, [user?.uid, mode]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Voice narration when tab opens (Blind mode)
  useEffect(() => {
    if (speak && mode === "blind") {
      speak(
        "Career Certificate Program. Select from Web Development, Python Programming, or AI Fundamentals learning paths. Each path requires completing 5 courses and quizzes to earn a verified on-chain Career Readiness Certificate.",
        true
      );
    }
  }, [speak, mode]);

  const selectedPath =
    careerProgress.find((p) => p.id === selectedPathId) ||
    CAREER_PATHS.find((p) => p.id === selectedPathId) ||
    CAREER_PATHS[0];

  const completedCount = selectedPath.completedCount ?? 0;
  const completionPercentage = selectedPath.completionPercentage ?? 0;
  const isPathCompleted = completedCount >= 5;
  const completedCourseIds = selectedPath.completedCourseIds || [];

  // Handle course quiz submission within a career path
  const handleQuizSubmit = async () => {
    if (!activeQuizCourse || !selectedQuizOption) return;
    setQuizSubmitted(true);
    const isCorrect = selectedQuizOption === activeQuizCourse.quiz.answer;
    setQuizCorrect(isCorrect);

    if (isCorrect) {
      if (speak && (mode === "blind" || mode === "motor")) {
        speak("Correct answer! Recording course completion for your Career Certificate Path.", true);
      }
      setSubmittingCourse(true);
      try {
        const uId = user?.uid || `demo-uid-${mode}`;
        const res = await API.post("/career/complete-course", {
          userId: uId,
          pathId: selectedPath.id,
          courseId: activeQuizCourse.id,
          studentName,
          walletAddress: activeWallet || undefined,
        });

        // Store locally as backup
        const storedKey = `accessai_career_completions_${uId}`;
        const stored = JSON.parse(localStorage.getItem(storedKey) || "[]");
        if (!stored.includes(activeQuizCourse.id)) {
          stored.push(activeQuizCourse.id);
          localStorage.setItem(storedKey, JSON.stringify(stored));
        }

        await fetchProgress();
        refreshPoints?.();

        // If this 5th course triggered career certificate issuance
        if (res.data?.careerCertificate || res.data?.blockchain) {
          const cert = res.data.careerCertificate || res.data.blockchain;
          setActiveCertData(cert);
          if (speak && (mode === "blind" || mode === "motor")) {
            speak(
              `Congratulations ${studentName}! You have successfully completed all 5 courses in ${selectedPath.title}. Your Career Readiness Certificate has been minted on the MST Blockchain with Token ID ${cert.tokenId || ""}.`,
              true
            );
          }
        }
      } catch (err) {
        console.warn("Could not save to backend, saving locally:", err);
        const uId = user?.uid || `demo-uid-${mode}`;
        const storedKey = `accessai_career_completions_${uId}`;
        const stored = JSON.parse(localStorage.getItem(storedKey) || "[]");
        if (!stored.includes(activeQuizCourse.id)) {
          stored.push(activeQuizCourse.id);
          localStorage.setItem(storedKey, JSON.stringify(stored));
        }
        await fetchProgress();
      } finally {
        setSubmittingCourse(false);
      }
    } else {
      if (speak && (mode === "blind" || mode === "motor")) {
        speak("Incorrect answer. Please retry the quiz to pass this course requirement.", true);
      }
    }
  };

  // Explicit claim handler if all 5 courses are completed
  const handleClaimCertificate = async () => {
    try {
      const uId = user?.uid || `demo-uid-${mode}`;
      const res = await API.post("/career/claim", {
        userId: uId,
        pathId: selectedPath.id,
        studentName,
        walletAddress: activeWallet || undefined,
      });

      const cert = res.data?.certificate || res.data?.blockchain;
      if (cert) {
        setActiveCertData(cert);
        await fetchProgress();
        refreshPoints?.();
      }
    } catch (err) {
      console.warn("Claim warning:", err);
      // Fallback preview
      const fallbackCert = {
        certificateId: `CERT-CAREER-${selectedPath.id.replace("career-", "").toUpperCase()}-001`,
        studentName,
        careerPathTitle: selectedPath.title,
        completedCourses: selectedPath.courses.map((c) => c.title),
        skillsAcquired: selectedPath.skills,
        completionDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        network: "MST Testnet",
        pointsAwarded: 100,
        careerStatement: selectedPath.careerStatement,
        tokenId: 17,
      };
      setActiveCertData(fallbackCert);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn max-w-6xl mx-auto w-full pb-16">
      {/* ── Program Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <span className="material-symbols-outlined !text-sm">workspace_premium</span>
              Career Readiness Program
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
              MST Blockchain Verified
            </span>
          </div>
          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${textTitleClass}`}>
            Career Certificate Programs
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Complete structured 5-course tracks in high-demand technical fields. Earn verifiable, on-chain career credentials with demonstrated competencies for professional portfolio presentation.
          </p>
        </div>

        {/* Learner Profile Badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-primary/5 border border-primary/20 self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold font-headline shadow-sm">
            {studentName.charAt(0)}
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Enrolled Candidate:</span>
            <span className="text-sm font-bold text-slate-800 block">{studentName}</span>
          </div>
        </div>
      </div>

      {/* ── Career Path Selector Tabs ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CAREER_PATHS.map((path) => {
          const prog = careerProgress.find((p) => p.id === path.id);
          const cCount = prog?.completedCount || 0;
          const isDone = cCount >= 5;
          const isSelected = selectedPathId === path.id;

          return (
            <button
              key={path.id}
              type="button"
              onClick={() => {
                setSelectedPathId(path.id);
                if (speak && mode === "blind") {
                  speak(`Selected ${path.title}. ${cCount} of 5 courses completed.`, true);
                }
              }}
              className={`p-5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-slate-200/80 bg-white hover:border-primary/40 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined !text-lg">{path.icon}</span>
                  </span>
                  {isDone ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                      <span className="material-symbols-outlined !text-xs">check_circle</span>
                      Completed (5/5)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {cCount} / 5 Courses
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{path.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{path.description}</p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mb-1">
                  <span>Track Progress</span>
                  <span className="text-primary font-bold">{Math.round((cCount / 5) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isDone ? "bg-emerald-500" : "bg-primary"
                    }`}
                    style={{ width: `${(cCount / 5) * 100}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Active Path Detail & Course Checklist ── */}
      <div className={`${cardClass} p-6 md:p-8 rounded-3xl flex flex-col gap-6`}>
        {/* Track Overview Card */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-headline">
                {selectedPath.track}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="text-xs text-slate-500 font-medium">5 Mandatory Program Courses</span>
            </div>
            <h2 className={`text-2xl font-bold ${textTitleClass}`}>{selectedPath.title}</h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {selectedPath.description}
            </p>
          </div>

          {/* Action Trigger Card */}
          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
            {isPathCompleted ? (
              selectedPath.certificate || activeCertData ? (
                <button
                  type="button"
                  onClick={() => setActiveCertData(selectedPath.certificate || activeCertData)}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer font-headline"
                >
                  <span className="material-symbols-outlined !text-base">workspace_premium</span>
                  <span>View & Download Career Certificate</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClaimCertificate}
                  className="px-6 py-3 rounded-2xl bg-primary hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer font-headline animate-bounce"
                >
                  <span className="material-symbols-outlined !text-base">verified</span>
                  <span>Claim On-Chain Career Certificate</span>
                </button>
              )
            ) : (
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 block">
                  Complete {5 - completedCount} more course{5 - completedCount > 1 ? "s" : ""} to unlock
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Automated NFT issuance upon final quiz submission
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Skills Acquired Matrix */}
        <div className={`${innerCardClass} p-5 rounded-2xl`}>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-headline">
            <span className="material-symbols-outlined !text-base text-primary">psychology</span>
            Demonstrated Core Competencies & Skills in this Path:
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedPath.skills.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Course Roadmap (All 5 Courses) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-base font-bold ${textTitleClass} flex items-center gap-2`}>
              <span className="material-symbols-outlined text-primary !text-lg">checklist</span>
              <span>5 Required Career Courses & Quizzes</span>
            </h3>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {completedCount} / 5 Completed
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {selectedPath.courses.map((course, idx) => {
              const isCourseDone = completedCourseIds.includes(course.id);

              return (
                <div
                  key={course.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCourseDone
                      ? "bg-emerald-50/50 border-emerald-200/80 text-slate-800"
                      : "bg-slate-50/60 border-slate-200 text-slate-700 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isCourseDone
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isCourseDone ? (
                        <span className="material-symbols-outlined !text-lg">check</span>
                      ) : (
                        `0${idx + 1}`
                      )}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Course {idx + 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-200/70 text-slate-600 font-semibold">
                          {course.duration}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{course.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{course.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {isCourseDone ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <span className="material-symbols-outlined !text-sm">verified</span>
                        Course & Quiz Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveQuizCourse(course);
                          setSelectedQuizOption("");
                          setQuizSubmitted(false);
                          setQuizCorrect(null);
                          if (speak && (mode === "blind" || mode === "motor")) {
                            speak(`Opening quiz check for ${course.title}. Question: ${course.quiz.question}`);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-primary hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer font-headline"
                      >
                        <span className="material-symbols-outlined !text-sm">play_circle</span>
                        <span>Take Course Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Important Career Readiness Statement Disclaimer ── */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-950">
          <span className="material-symbols-outlined !text-xl text-amber-600 shrink-0 mt-0.5">info</span>
          <div>
            <span className="font-bold font-headline block">
              Career-Readiness Credential · Professional Portfolio Notice
            </span>
            <p className="mt-0.5 text-slate-600 leading-relaxed">
              This credential confirms verified completion of all 5 program courses and demonstrated technical skills on the ACCESS AI platform. It is designed as verifiable career-readiness proof that candidates can showcase to employers and university admissions, and does not serve as a contractual employment guarantee.
            </p>
          </div>
        </div>
      </div>

      {/* ── Interactive Course Quiz Modal ── */}
      {activeQuizCourse && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-500 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 flex flex-col gap-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-headline">
                  Career Course Requirement Check
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{activeQuizCourse.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuizCourse(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined !text-base">close</span>
              </button>
            </div>

            {/* Video Lesson Embed */}
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
              <iframe
                src={`https://www.youtube.com/embed/${activeQuizCourse.video}`}
                title={activeQuizCourse.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Quiz Question */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined !text-sm text-primary">quiz</span>
                Assessment Check
              </h4>
              <p className="text-sm font-semibold text-slate-800">{activeQuizCourse.quiz.question}</p>

              {/* Options */}
              <div className="flex flex-col gap-2 mt-3">
                {activeQuizCourse.quiz.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (quizSubmitted && quizCorrect) return;
                      setSelectedQuizOption(opt);
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                      selectedQuizOption === opt
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Submission & Feedback */}
              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleQuizSubmit}
                  disabled={!selectedQuizOption || submittingCourse}
                  className="w-full mt-4 py-3 rounded-xl bg-primary hover:brightness-110 active:scale-95 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer font-headline"
                >
                  {submittingCourse ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Recording Completion on MST...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined !text-sm">check_circle</span>
                      <span>Submit Quiz & Record Completion</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <div
                    className={`p-3 rounded-xl text-center text-xs font-bold ${
                      quizCorrect
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-700"
                        : "bg-red-500/15 border border-red-500/30 text-red-700"
                    }`}
                  >
                    {quizCorrect ? "Correct answer! Course passed. 🎉" : "Incorrect answer. Please retry."}
                  </div>
                  {quizCorrect ? (
                    <button
                      type="button"
                      onClick={() => setActiveQuizCourse(null)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 cursor-pointer"
                    >
                      Return to Learning Path
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedQuizOption("");
                        setQuizCorrect(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
                    >
                      Retry Question
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Career Readiness Certificate Modal ── */}
      {activeCertData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-500 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 flex flex-col gap-6 my-auto animate-scaleUp">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-headline inline-flex items-center gap-1">
                  <span className="material-symbols-outlined !text-xs">verified</span>
                  Official Career Readiness Credential
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-headline mt-1.5">
                  {activeCertData.careerPathTitle || selectedPath.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recipient: <span className="font-bold text-slate-800">{activeCertData.studentName || studentName}</span> · 5 Courses Completed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCertData(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined !text-base">close</span>
              </button>
            </div>

            {/* Visual Certificate Preview */}
            <div className="rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md bg-slate-50">
              <img
                src={`/certificate/image/${activeCertData.certificateId}`}
                alt="Career Readiness Certificate"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/certificate_base.png";
                }}
              />
            </div>

            {/* Key Blockchain Attributes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Certificate ID
                </span>
                <span className="font-mono font-bold text-slate-800 break-all block mt-0.5">
                  {activeCertData.certificateId}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  NFT Token ID
                </span>
                <span className="font-mono font-bold text-indigo-700 block mt-0.5">
                  #{activeCertData.tokenId ?? "Active"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Career Bonus
                </span>
                <span className="font-bold text-emerald-700 block mt-0.5">
                  +100 MST Points
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Network
                </span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  MST Testnet
                </span>
              </div>
            </div>

            {/* Notice statement */}
            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              {activeCertData.careerStatement || selectedPath.careerStatement}
            </p>

            {/* Actions: Download PDF & Public Verification */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/certificate/download/${activeCertData.certificateId}`}
                  download={`AccessAI_Career_Certificate_${activeCertData.certificateId}.pdf`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all font-headline cursor-pointer"
                >
                  <span className="material-symbols-outlined !text-base">download</span>
                  <span>Download PDF</span>
                </a>

                <a
                  href={`/certificate/view/${activeCertData.certificateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs border border-slate-300 transition-all font-headline cursor-pointer"
                >
                  <span className="material-symbols-outlined !text-base">picture_as_pdf</span>
                  <span>View PDF</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/verify?id=${activeCertData.certificateId}`;
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs border border-primary/20 transition-all cursor-pointer font-headline"
                  title="Copy public verification link for employers"
                >
                  <span className="material-symbols-outlined !text-base">
                    {copiedLink ? "check" : "share"}
                  </span>
                  <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
                </button>

                <a
                  href={`/verify?id=${activeCertData.certificateId}`}
                  className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:brightness-110 transition-all font-headline"
                >
                  <span>Verify on MST</span>
                  <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
