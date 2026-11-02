import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CertificateModal({
  isOpen,
  onClose,
  certificateData,
  mode = "general",
  speak = null,
  dwellEnabled = false,
  dwell = 1500,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const isTopic = Boolean(certificateData?.topicName || certificateData?.type === "topic");
  const topicTitle = certificateData?.topicName || certificateData?.topicTitle || "";

  useEffect(() => {
    if (isOpen && certificateData) {
      if (speak && (mode === "blind" || mode === "motor")) {
        const title = certificateData.courseName || "the course";
        const certId = certificateData.certificateId || "CERT";
        const tok = certificateData.tokenId ? `NFT Token ID #${certificateData.tokenId}` : "an NFT certificate";
        const subject = isTopic ? `video topic ${topicTitle} in ${title}` : title;
        speak(
          `Congratulations! You completed ${subject}. Your NFT Certificate ${tok} has been issued on the MST Blockchain with ID ${certId}. You can download the PDF or verify it on-chain anytime.`,
          true
        );
      }
    }
  }, [isOpen, certificateData, mode, speak, isTopic, topicTitle]);

  if (!isOpen || !certificateData) return null;

  const certId = certificateData.certificateId;
  const courseTitle = certificateData.courseName || certificateData.courseId || "Course Completion";
  const studentName = certificateData.studentName || "Valued Learner";
  const tokenId = certificateData.tokenId;
  const certHash = certificateData.certificateHash || certificateData.pdfHash;
  const pointsAwarded = certificateData.pointsAwarded ?? (isTopic ? 0 : 50);
  const downloadUrl = `/certificate/download/${certId}`;
  const viewUrl = `/certificate/view/${certId}`;
  const imageUrl = `/certificate/image/${certId}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(certId);
    setCopied(true);
    if (speak && (mode === "blind" || mode === "motor")) {
      speak("Certificate ID copied to clipboard.");
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Course Completion and NFT Certificate"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/30 text-on-surface my-auto relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Celebration Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined !text-3xl text-emerald-600">
                {isTopic ? "video_library" : "military_tech"}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isTopic ? "Video Topic Completed" : "Course 100% Completed"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-700 border border-indigo-500/25 font-mono">
                  {tokenId ? `NFT Token #${tokenId}` : "ERC-721 NFT"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/25">
                  {pointsAwarded > 0 ? `+${pointsAwarded} MST Points` : "Verified Topic Proof"}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-headline mt-1 text-on-surface">
                {isTopic ? "Topic Certificate & NFT Issued!" : "Certificate & NFT Issued Successfully!"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-high transition self-start sm:self-center"
            aria-label="Close"
          >
            <span className="material-symbols-outlined !text-xl">close</span>
          </button>
        </div>

        {/* Dynamic Personalized Certificate Visual Preview */}
        <div className="rounded-2xl overflow-hidden border-2 border-primary/25 shadow-lg bg-slate-50 mb-5 relative">
          <img
            src={imageUrl}
            alt={`Personalized Certificate for ${studentName}`}
            className="w-full h-auto object-contain max-h-[380px] mx-auto block"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/certificate_base.png";
            }}
          />
        </div>

        {/* Details Grid */}
        <div className={`grid grid-cols-1 ${isTopic ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 mb-5 text-xs`}>
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block font-headline">
              Recipient
            </span>
            <span className="font-bold text-on-surface text-sm mt-0.5 block truncate">
              {studentName}
            </span>
          </div>

          {isTopic && (
            <div>
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block font-headline">
                Video Topic
              </span>
              <span className="font-bold text-emerald-700 text-sm mt-0.5 block truncate" title={topicTitle}>
                {topicTitle}
              </span>
            </div>
          )}

          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block font-headline">
              Course
            </span>
            <span className="font-bold text-primary text-sm mt-0.5 block truncate">
              {courseTitle}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block font-headline">
              Certificate ID
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono font-bold text-on-surface truncate" title={certHash ? `Cryptographic SHA-256 Hash: ${certHash}` : certId}>
                {certId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-primary hover:text-primary-dark p-0.5"
                title="Copy ID"
              >
                <span className="material-symbols-outlined !text-sm">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={downloadUrl}
              download={`AccessAI_Certificate_${certId}.pdf`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all font-headline cursor-pointer"
            >
              <span className="material-symbols-outlined !text-base">download</span>
              <span>Download PDF</span>
            </a>

            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs border border-primary/25 transition-all font-headline cursor-pointer"
            >
              <span className="material-symbols-outlined !text-base">picture_as_pdf</span>
              <span>View PDF</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/verify?id=${certId}`);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs border border-primary/30 transition-all font-headline cursor-pointer"
            >
              <span className="material-symbols-outlined !text-base">verified</span>
              <span>Verify On MST</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-container-high text-on-surface-variant font-bold text-xs border border-outline-variant/40 transition-all cursor-pointer font-headline"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
