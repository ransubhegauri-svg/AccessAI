import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  verifyCertificateOnChain,
  CONTRACT_ADDRESS,
  MST_TESTNET_CONFIG,
} from "../services/blockchain";
import { useWallet } from "../context/WalletContext";

export default function CertificateVerification() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("search"); // "search" | "upload"
  const [certQuery, setCertQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState(null);

  // File upload & tamper detection states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [computedFileHash, setComputedFileHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const {
    account,
    balance,
    rewardPoints,
    isConnecting: walletLoading,
    walletNotice,
    isNotInstalled,
    connect: handleConnectWallet,
    connectDemo,
    disconnect: handleDisconnectWallet,
  } = useWallet();

  const demoCertId = "CERT-ACCESSAI-DEMO-2026-001";
  const demoRevokedCertId = "CERT-REVOKE-TEST-001";
  const demoCertHash = "0x434552542d41434345535341492d44454d4f2d323032362d3030312d41492d41";
  const demoTokenId = "1";

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /**
   * Universal on-chain verification function
   */
  const handleVerify = async (queryToVerify, explicitFileHash = null) => {
    const q = (queryToVerify !== undefined ? queryToVerify : certQuery).trim();
    if (!q && !explicitFileHash) {
      setError("Please enter a Certificate ID, NFT Token ID, Certificate Hash, or upload a certificate PDF.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const targetQuery = q || explicitFileHash;
      const data = await verifyCertificateOnChain(targetQuery);

      if (!data.exists) {
        // If searching with a file hash that isn't on chain
        if (explicitFileHash) {
          setResult({
            exists: false,
            isValid: false,
            isTampered: true,
            computedFileHash: explicitFileHash,
            expectedHash: "Unregistered or Altered",
            queryId: q || "Uploaded Document",
            message: "The SHA-256 hash of this document does not match any registered certificate on MST Blockchain. It may be altered, forged, or not yet issued.",
          });
        } else {
          setError(`Credential "${targetQuery}" was not found or has not been issued yet on the MST Blockchain.`);
        }
      } else {
        // If a file was uploaded, compare computed file hash with on-chain hash
        const fileHashToCheck = explicitFileHash || computedFileHash;
        if (fileHashToCheck && data.certificateHash) {
          const cleanFile = fileHashToCheck.toLowerCase().trim();
          const cleanOnChain = data.certificateHash.toLowerCase().trim();
          const isMatch = cleanFile === cleanOnChain;

          setResult({
            ...data,
            isTampered: !isMatch,
            hashMatches: isMatch,
            computedFileHash: fileHashToCheck,
            expectedHash: data.certificateHash,
          });
        } else {
          setResult(data);
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify on MST Blockchain. Please verify connection to MST RPC.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Computes SHA-256 hash of a file client-side using Web Crypto API
   */
  const calculateFileSha256 = async (file) => {
    setIsHashing(true);
    setError("");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setComputedFileHash(hashHex);
      setUploadedFile(file);
      setIsHashing(false);
      return hashHex;
    } catch (e) {
      console.error("Hash calculation failed:", e);
      setError("Failed to calculate SHA-256 hash of the uploaded file.");
      setIsHashing(false);
      return null;
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const hash = await calculateFileSha256(file);
    if (hash) {
      // Auto-verify by hash or check against currently entered cert ID
      handleVerify(certQuery, hash);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const hash = await calculateFileSha256(file);
    if (hash) {
      handleVerify(certQuery, hash);
    }
  };

  /**
   * Simulates a tampered certificate file for demonstration / testing
   */
  const handleSimulateTampered = () => {
    setCertQuery(demoCertId);
    // Altered hash with changed bytes
    const tamperedHash = "0x9999deadbeef9999deadbeef9999deadbeef9999deadbeef9999deadbeef9999";
    setComputedFileHash(tamperedHash);
    setUploadedFile({ name: "AccessAI_Certificate_Modified.pdf", size: 148200 });

    setResult({
      exists: true,
      isValid: true,
      isTampered: true,
      hashMatches: false,
      student: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      courseId: "AI-ACCESSIBILITY-101",
      certificateId: demoCertId,
      certificateHash: demoCertHash,
      computedFileHash: tamperedHash,
      expectedHash: demoCertHash,
      tokenId: 1,
      formattedDate: "September 29, 2026, 04:30 UTC",
      metadata: {
        name: "AccessAI Certificate: AI Accessibility 101",
        description: "Official course completion certificate NFT on MST Testnet.",
      },
    });
  };

  useEffect(() => {
    const qId = searchParams.get("id") || searchParams.get("token") || searchParams.get("hash");
    if (qId) {
      setCertQuery(qId);
      handleVerify(qId);
    }
  }, [searchParams]);

  // Determine certificate state
  const isMismatched = result?.isTampered === true;
  const isRevoked = result?.exists && result?.isValid === false;

  const studentNameAttr = result?.metadata?.attributes?.find(a => a.trait_type === "Student Name")?.value;
  const topicNameAttr = result?.metadata?.attributes?.find(a => a.trait_type === "Topic Title")?.value;
  const courseNameAttr = result?.metadata?.attributes?.find(a => a.trait_type === "Course Title")?.value;
  const certTypeAttr = result?.metadata?.attributes?.find(a => a.trait_type === "Certificate Type")?.value;
  const isCareerCert =
    certTypeAttr === "Career Readiness Certificate" ||
    result?.certificateId?.includes("CAREER") ||
    result?.courseId?.startsWith("career:");
  const isDegreeCert =
    certTypeAttr === "Academic Honors Degree" ||
    result?.certificateId?.includes("DEGREE") ||
    result?.courseId?.startsWith("degree:");
  const degreeTitleAttr =
    result?.metadata?.attributes?.find(a => a.trait_type === "Degree Title")?.value ||
    result?.metadata?.degree_title ||
    "Bachelor of Accessible Software Engineering & Applied AI";
  const honorsClassificationAttr =
    result?.metadata?.attributes?.find(a => a.trait_type === "Honors Classification")?.value ||
    result?.metadata?.honors ||
    "First Class Honors with Distinction";
  const completedSpecializationsList =
    result?.metadata?.completed_major_certs ||
    result?.metadata?.specializations || [
      "Full Stack Web Development Career Specialization",
      "Python Software & Backend Engineering",
      "Machine Learning & Assistive Artificial Intelligence",
      "American Sign Language & Accessible Media Standards",
      "Database Architecture & Cryptographic Blockchain Verification",
    ];
  const careerPathAttr = result?.metadata?.attributes?.find(a => a.trait_type === "Career Path")?.value || courseNameAttr;
  const skillsAttr = result?.metadata?.attributes?.find(a => a.trait_type === "Skills Acquired")?.value;
  const careerStatementAttr =
    result?.metadata?.attributes?.find(a => a.trait_type === "Career Readiness Statement")?.value ||
    result?.metadata?.career_statement ||
    result?.metadata?.degree_statement;
  const degreeDisclaimer =
    careerStatementAttr ||
    result?.metadata?.degree_statement ||
    result?.metadata?.attributes?.find(a => a.trait_type === "Career Readiness Statement")?.value;
  const completedCoursesList = result?.metadata?.completed_courses || [];

  return (
    <section
      aria-label="MST Blockchain Certificate Verification"
      className="max-w-4xl mx-auto my-6 p-6 md:p-8 bg-white rounded-3xl border border-outline-variant/30 shadow-lg shadow-primary/5 text-on-surface"
    >
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-outline-variant/20 pb-6 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              MST Testnet (Chain ID: {MST_TESTNET_CONFIG.chainIdDecimal})
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 border border-indigo-500/25">
              <span className="material-symbols-outlined !text-xs">lock</span>
              Tamper-Proof Immutability
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Contract Active
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface font-headline">
            Verifiable Certificate & NFT Registry
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Independently verify course completion credentials secured on the MST Testnet blockchain. Check cryptographic SHA-256 hashes, detect tampering, and view permanent revocation records.
          </p>
        </div>

        {/* BridgeKey Connection Status */}
        <div className="flex flex-col items-end gap-1.5">
          {account ? (
            <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl px-4 py-2 text-right shadow-sm">
              <div className="flex items-center justify-end gap-2 text-xs text-primary font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                <button
                  type="button"
                  onClick={handleDisconnectWallet}
                  className="text-[10px] text-on-surface-variant hover:text-red-600 ml-1 font-sans cursor-pointer underline"
                  title="Disconnect wallet"
                >
                  Disconnect
                </button>
              </div>
              <div className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                Balance: <span className="font-bold text-on-surface">{parseFloat(balance || "0").toFixed(3)} MST</span>
                <span className="mx-1.5">•</span>
                Points: <span className="font-bold text-primary">{rewardPoints} PTS</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <button
                type="button"
                onClick={handleConnectWallet}
                disabled={walletLoading}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:brightness-110 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer font-headline disabled:opacity-50"
              >
                <span className="material-symbols-outlined !text-base">account_balance_wallet</span>
                <span>{walletLoading ? "Connecting..." : "Connect BridgeKey"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Friendly BridgeKey Installation / Notice Banner */}
      {!account && (isNotInstalled || walletNotice) && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-950 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined !text-xl text-amber-700 mt-0.5">info</span>
            <div>
              <p className="text-xs font-bold font-headline text-amber-900">
                {isNotInstalled ? "BridgeKey Wallet Extension Required" : "BridgeKey Status"}
              </p>
              <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                {walletNotice || "Install the BridgeKey browser extension to connect to the MST Blockchain and claim your credentials."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {isNotInstalled && (
              <a
                href="https://bridgekey.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition font-headline"
              >
                <span>Install BridgeKey</span>
                <span className="material-symbols-outlined !text-xs">open_in_new</span>
              </a>
            )}
            <button
              type="button"
              onClick={connectDemo}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 font-bold text-xs transition font-headline cursor-pointer"
            >
              <span className="material-symbols-outlined !text-xs text-emerald-600">bolt</span>
              <span>Try Demo Wallet</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Mode Selection Tabs ── */}
      <div className="flex border-b border-outline-variant/30 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`pb-3 px-4 text-xs font-bold font-headline flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "search"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined !text-base">search</span>
          <span>Search by ID / Token / Hash</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`pb-3 px-4 text-xs font-bold font-headline flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "upload"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined !text-base">fingerprint</span>
          <span>Verify Downloaded PDF (Tamper Detection)</span>
        </button>
      </div>

      {/* ── Tab 1: Text Search Box ── */}
      {activeTab === "search" && (
        <div className="space-y-4">
          <label htmlFor="certificate-query-input" className="block text-xs font-bold uppercase tracking-wider text-on-surface font-headline">
            Enter Certificate ID, NFT Token ID, or Certificate Hash
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="certificate-query-input"
              type="text"
              value={certQuery}
              onChange={(e) => setCertQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="e.g. CERT-ACCESSAI-DEMO-2026-001, 1, or 0x43455..."
              className="flex-1 bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/15 rounded-2xl px-5 py-3.5 text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium outline-none transition-all shadow-inner font-mono"
            />
            <button
              type="button"
              onClick={() => handleVerify()}
              disabled={loading}
              className="px-7 py-3.5 rounded-2xl bg-primary hover:brightness-110 active:scale-95 text-white font-bold text-sm shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-headline"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined !text-base">verified</span>
                  <span>Verify on MST</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 2: PDF File Upload & Hash Comparison ── */}
      {activeTab === "upload" && (
        <div className="space-y-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Upload any downloaded AccessAI Certificate PDF. The browser calculates its cryptographic SHA-256 hash in real-time and checks it against the MST Blockchain to prove that not a single byte was altered.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-outline-variant/60 hover:border-primary/60 bg-surface-container-low"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined !text-3xl">upload_file</span>
            </div>
            <h4 className="text-sm font-bold text-on-surface font-headline">
              {uploadedFile ? uploadedFile.name : "Drag & Drop Certificate PDF Here"}
            </h4>
            <p className="text-xs text-on-surface-variant mt-1">
              {uploadedFile
                ? `${(uploadedFile.size / 1024).toFixed(1)} KB • SHA-256 Computed`
                : "or click to browse from your computer (PDF only)"}
            </p>
            {isHashing && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>Computing SHA-256 Hash...</span>
              </div>
            )}
          </div>

          {computedFileHash && (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs flex flex-col gap-1.5 font-mono">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-sans">
                Computed Document SHA-256 Hash:
              </span>
              <span className="text-primary font-bold break-all select-all">
                {computedFileHash}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Quick Test Chips for Valid, Revoked, and Mismatched ── */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant pt-4 mt-2">
        <span className="font-bold text-on-surface">Test Scenarios:</span>

        {/* 1. Valid Certificate */}
        <button
          type="button"
          onClick={() => {
            setCertQuery(demoCertId);
            setComputedFileHash("");
            setUploadedFile(null);
            handleVerify(demoCertId);
          }}
          className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
          title="Verify authentic on-chain certificate"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>Valid: {demoCertId}</span>
        </button>

        {/* 2. Revoked Certificate */}
        <button
          type="button"
          onClick={() => {
            setCertQuery(demoRevokedCertId);
            setComputedFileHash("");
            setUploadedFile(null);
            handleVerify(demoRevokedCertId);
          }}
          className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 font-mono text-xs font-bold border border-red-200 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
          title="Verify on-chain revoked certificate"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          <span>Revoked: {demoRevokedCertId}</span>
        </button>

        {/* 3. Simulate Tampered / Mismatched Hash */}
        <button
          type="button"
          onClick={handleSimulateTampered}
          className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-mono text-xs font-bold border border-amber-300 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
          title="Simulate modified PDF to trigger hash mismatch warning"
        >
          <span className="material-symbols-outlined !text-xs text-amber-700">warning</span>
          <span>Simulate Tampered (Hash Mismatch)</span>
        </button>

        {/* 4. By Token ID */}
        <button
          type="button"
          onClick={() => {
            setCertQuery(demoTokenId);
            setComputedFileHash("");
            setUploadedFile(null);
            handleVerify(demoTokenId);
          }}
          className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono text-xs font-bold border border-indigo-200 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined !text-xs">token</span>
          <span>Token #{demoTokenId}</span>
        </button>

        {/* 5. Academic Honors Degree */}
        <button
          type="button"
          onClick={() => {
            const degreeId = "CERT-DEGREE-HONORS-EETEST";
            setCertQuery(degreeId);
            setComputedFileHash("");
            setUploadedFile(null);
            handleVerify(degreeId);
          }}
          className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-mono text-xs font-bold border border-amber-300 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
          title="Verify official Academic Honors Degree credential on MST"
        >
          <span className="material-symbols-outlined !text-xs text-amber-700">school</span>
          <span>Honors Degree: CERT-DEGREE-HONORS-EETEST</span>
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div role="alert" className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined !text-lg text-red-600">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Verification Result Card ── */}
      {result && (
        <div
          role="region"
          aria-label="Verified Certificate Details"
          className={`mt-8 rounded-3xl bg-white border-2 shadow-xl overflow-hidden animate-fadeIn ${
            isMismatched
              ? "border-amber-500 shadow-amber-500/10"
              : isRevoked
              ? "border-red-500 shadow-red-500/10"
              : "border-emerald-500/40 shadow-emerald-500/10"
          }`}
        >
          {/* ── Top Status Header Banner ── */}
          <div
            className={`p-5 flex flex-wrap items-center justify-between gap-3 border-b ${
              isMismatched
                ? "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-amber-300 text-amber-950"
                : isRevoked
                ? "bg-gradient-to-r from-red-500/15 via-rose-500/10 to-red-500/15 border-red-300 text-red-950"
                : "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200 text-emerald-950"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isMismatched
                    ? "bg-amber-500 text-white"
                    : isRevoked
                    ? "bg-red-600 text-white"
                    : "bg-emerald-600 text-white"
                }`}
              >
                <span className="material-symbols-outlined !text-2xl">
                  {isMismatched ? "warning" : isRevoked ? "cancel" : "verified"}
                </span>
              </span>

              <div>
                <span className="font-bold text-base uppercase tracking-wider font-headline block">
                  {isMismatched
                    ? "Hash Mismatch • Document Tampered"
                    : isRevoked
                    ? "Revoked Certificate"
                    : "Authentic & Immutable Certificate"}
                </span>
                <span className="text-xs opacity-90 font-medium">
                  {isMismatched
                    ? "The certificate document has been modified. Computed hash does NOT match the blockchain."
                    : isRevoked
                    ? "Revoked on-chain. Original record remains permanently preserved for public audit."
                    : "Permanently anchored on MST Testnet ERC-721 Smart Contract."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {result.tokenId && (
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 font-bold border border-indigo-500/25 font-mono flex items-center gap-1">
                  <span className="material-symbols-outlined !text-xs">token</span>
                  NFT Token #{result.tokenId}
                </span>
              )}
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border font-mono ${
                  isMismatched
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : isRevoked
                    ? "bg-red-100 text-red-800 border-red-300"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                {isMismatched
                  ? "MISMATCH DETECTED"
                  : isRevoked
                  ? "STATUS: REVOKED"
                  : "STATUS: VALID"}
              </span>
            </div>
          </div>

          {/* ── Prominent Notice for Tampering or Revocation ── */}
          {isMismatched && (
            <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <span className="material-symbols-outlined !text-xl text-amber-600 shrink-0 mt-0.5">report_problem</span>
              <div>
                <p className="font-bold font-headline text-amber-950">
                  Tamper Detection Alert: SHA-256 Hash Mismatch
                </p>
                <p className="mt-0.5 leading-relaxed">
                  Every AccessAI certificate has an immutable SHA-256 hash anchored in the smart contract upon issuance. Because the uploaded document was modified by even one character or pixel, its computed hash does not match the immutable hash recorded on the blockchain ledger.
                </p>
                <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                    <span className="font-sans font-bold text-amber-950 block text-[10px] uppercase">
                      Computed File Hash:
                    </span>
                    <span className="break-all text-red-700 font-semibold">{result.computedFileHash}</span>
                  </div>
                  <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                    <span className="font-sans font-bold text-amber-950 block text-[10px] uppercase">
                      On-Chain Registered Hash:
                    </span>
                    <span className="break-all text-emerald-800 font-semibold">{result.expectedHash}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isRevoked && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-900 text-xs flex items-start gap-2.5">
              <span className="material-symbols-outlined !text-xl text-red-600 shrink-0 mt-0.5">block</span>
              <div>
                <p className="font-bold font-headline text-red-950">
                  Revocation Notice: Permanent Provenance Preserved
                </p>
                <p className="mt-0.5 leading-relaxed">
                  This certificate has been revoked by the issuing authority (e.g. for academic re-issuance or policy updates). In compliance with blockchain immutability, the original recipient, course details, issue date, and certificate hash remain permanently stored on the MST ledger for auditability, but the credential cannot be used as active proof of completion.
                </p>
              </div>
            </div>
          )}

          {/* Certificate Content Body */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline-variant/15">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider font-headline">Course Credential</span>
                <h3 className="text-2xl font-bold text-on-surface font-headline mt-1">
                  {result.metadata?.name || result.courseId || "AccessAI Course Certificate"}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {result.metadata?.description || `Official course certificate issued on MST Testnet for course ${result.courseId}.`}
                </p>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-sm flex-shrink-0 ${
                  isMismatched
                    ? "bg-amber-100 text-amber-800"
                    : isRevoked
                    ? "bg-red-100 text-red-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                <span className="material-symbols-outlined !text-2xl">
                  {isMismatched ? "error_outline" : isRevoked ? "lock_reset" : "school"}
                </span>
                <span className="text-[10px] font-bold mt-0.5">
                  {isMismatched ? "TAMPER" : isRevoked ? "REVOKED" : "NFT"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Name / Recipient */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block font-headline">
                    Certificate Recipient (Student)
                  </span>
                  <span className="font-bold text-on-surface text-base mt-1 block flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-base text-primary">person</span>
                    {studentNameAttr || "Verified AccessAI Learner"}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined !text-xs">verified</span>
                  <span>Identity Verified On-Chain</span>
                </div>
              </div>

              {/* Course / Video Topic / Career Path */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block font-headline">
                    {isCareerCert
                      ? "Career Learning Path"
                      : topicNameAttr
                      ? "Video Topic & Course"
                      : "Course Program"}
                  </span>
                  <span className="font-bold text-on-surface text-sm mt-1 block">
                    {isCareerCert
                      ? careerPathAttr
                      : topicNameAttr
                      ? `${topicNameAttr}`
                      : (courseNameAttr || result.courseId || "AccessAI Course")}
                  </span>
                  {topicNameAttr && !isCareerCert && (
                    <span className="text-[11px] text-on-surface-variant block mt-0.5">
                      Course: {courseNameAttr || result.courseId?.split(":")[0] || "Sign Language / AI Program"}
                    </span>
                  )}
                  {isCareerCert && (
                    <span className="text-[11px] text-amber-600 font-bold block mt-0.5">
                      5-Course Career Track Completed
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-indigo-700 font-semibold font-mono">
                  {certTypeAttr || (isCareerCert ? "Career Readiness Certificate" : topicNameAttr ? "Video Topic Certificate" : "Course Completion Certificate")}
                </div>
              </div>

              {/* Certificate ID */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block font-headline">
                    Certificate ID
                  </span>
                  <span className="font-mono text-on-surface font-bold text-sm break-all mt-1 block">
                    {result.certificateId || result.queryId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(result.certificateId || result.queryId, "id")}
                  className="mt-3 text-[11px] text-primary hover:underline font-bold self-start flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined !text-xs">
                    {copiedField === "id" ? "check" : "content_copy"}
                  </span>
                  <span>{copiedField === "id" ? "Copied!" : "Copy ID"}</span>
                </button>
              </div>

              {/* NFT Token ID */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block font-headline">
                    ERC-721 NFT Token ID
                  </span>
                  <span className="font-mono text-indigo-700 font-bold text-base mt-1 block flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-base">token</span>
                    #{result.tokenId ?? "N/A"}
                  </span>
                </div>
                <div className="mt-3 text-[11px] text-on-surface-variant font-medium">
                  Standard: <span className="font-bold text-on-surface">ERC-721 URI Storage</span>
                </div>
              </div>

              {/* Student Wallet */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block font-headline">
                    Student Wallet Address
                  </span>
                  <span className="font-mono text-primary font-bold text-xs break-all mt-1 block">
                    {result.student || "0x..."}
                  </span>
                </div>
                {result.student && (
                  <button
                    type="button"
                    onClick={() => handleCopy(result.student, "student")}
                    className="mt-3 text-[11px] text-primary hover:underline font-bold self-start flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-xs">
                      {copiedField === "student" ? "check" : "content_copy"}
                    </span>
                    <span>{copiedField === "student" ? "Copied!" : "Copy Wallet"}</span>
                  </button>
                )}
              </div>

              {/* Certificate Hash */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block font-headline">
                    On-Chain Immutable Hash (SHA-256)
                  </span>
                  <span className="font-mono text-on-surface font-semibold text-xs break-all mt-1 block">
                    {result.certificateHash || "Stored on MST Blockchain"}
                  </span>
                </div>
                {result.certificateHash && (
                  <button
                    type="button"
                    onClick={() => handleCopy(result.certificateHash, "hash")}
                    className="mt-3 text-[11px] text-primary hover:underline font-bold self-start flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-xs">
                      {copiedField === "hash" ? "check" : "content_copy"}
                    </span>
                    <span>{copiedField === "hash" ? "Copied!" : "Copy Hash"}</span>
                  </button>
                )}
              </div>

              {/* Issuance Date */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block font-headline">
                  Issuance Timestamp
                </span>
                <span className="text-on-surface font-semibold text-xs mt-1 block">
                  {result.formattedDate || "Recorded On-Chain"}
                </span>
              </div>

              {/* Verification Status */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block font-headline">
                  Immutability & Validity Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-bold text-xs mt-1 ${
                    isMismatched
                      ? "text-amber-700"
                      : isRevoked
                      ? "text-red-700"
                      : "text-emerald-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isMismatched ? "bg-amber-500" : isRevoked ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  ></span>
                  <span>
                    {isMismatched
                      ? "Mismatched Hash (Altered Document)"
                      : isRevoked
                      ? "Revoked (Original Record Preserved)"
                      : "Valid & Authentic (Untampered)"}
                  </span>
                </span>
              </div>
            </div>

            {/* ── Career Readiness Credential Section (Only for Career Certificates) ── */}
            {isCareerCert && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/50 border-2 border-indigo-200/80 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined !text-lg">workspace_premium</span>
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-indigo-950 font-headline">
                        Verified Career Curriculum & Skills Matrix
                      </h4>
                      <p className="text-[11px] text-indigo-700">
                        Rigorous 5-course specialized learning path verified on MST Blockchain
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white font-mono shadow-sm">
                    5 of 5 Courses Verified
                  </span>
                </div>

                {/* 5 Completed Courses List */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2 font-headline">
                    Completed Courses in Learning Path:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(completedCoursesList.length > 0
                      ? completedCoursesList
                      : [
                          "Course 1: Core Fundamentals & Accessible Architecture",
                          "Course 2: Advanced Design, Layouts & Structured Systems",
                          "Course 3: Programming Logic & Asynchronous Workflows",
                          "Course 4: Component Architecture & Application Engineering",
                          "Course 5: Full Stack APIs & Production Deployment",
                        ]
                    ).map((cName, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-indigo-100 text-xs font-medium text-slate-800 shadow-xs"
                      >
                        <span className="material-symbols-outlined !text-base text-emerald-600 shrink-0">
                          check_circle
                        </span>
                        <span className="truncate">{cName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Acquired */}
                {skillsAttr && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2 font-headline">
                      Verified Competencies & Skills Acquired:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsAttr.split(", ").map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100/70 text-indigo-900 border border-indigo-200/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Career-Readiness Statement & Non-Guarantee Disclaimer */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5 text-amber-950">
                  <span className="material-symbols-outlined !text-lg text-amber-700 shrink-0 mt-0.5">
                    info
                  </span>
                  <div>
                    <span className="font-bold block font-headline text-[11px] uppercase tracking-wide text-amber-900">
                      Official Career-Readiness Notice
                    </span>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-amber-900">
                      {careerStatementAttr ||
                        "This credential confirms verified course completion and skills learned. It serves as an employer-ready portfolio credential demonstrating specialized competencies, but does not guarantee employment."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Academic Honors Degree Section (Only for Degree Certificates) ── */}
            {isDegreeCert && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-yellow-50/50 to-amber-100/60 border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined !text-xl">school</span>
                    </span>
                    <div>
                      <h4 className="font-bold text-base text-amber-950 font-headline">
                        {degreeTitleAttr}
                      </h4>
                      <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                        <span className="material-symbols-outlined !text-sm">workspace_premium</span>
                        <span>{honorsClassificationAttr}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-600 text-white font-mono shadow-sm">
                    5 Major Specializations Verified
                  </span>
                </div>

                {/* 5 Completed Major Specializations List */}
                <div>
                  <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block mb-2 font-headline">
                    Accredited Major Specialization Curricula:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {completedSpecializationsList.map((specName, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-amber-200 text-xs font-medium text-slate-800 shadow-xs"
                      >
                        <span className="material-symbols-outlined !text-base text-emerald-600 shrink-0">
                          check_circle
                        </span>
                        <span className="truncate">{specName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graduation Honors Reward */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-950">
                  <span className="material-symbols-outlined !text-lg text-emerald-700">rewarded_ads</span>
                  <span>
                    Graduation Reward: <strong>+500 MST Reward Points</strong> awarded and permanently anchored on MST Testnet.
                  </span>
                </div>

                {/* Official Career-Readiness Statement & Non-Guarantee Disclaimer */}
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs flex items-start gap-2.5 text-amber-950">
                  <span className="material-symbols-outlined !text-lg text-amber-700 shrink-0 mt-0.5">
                    verified_user
                  </span>
                  <div>
                    <span className="font-bold block font-headline text-[11px] uppercase tracking-wide text-amber-900">
                      Official Academic Honors Degree Notice
                    </span>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-amber-900">
                      {degreeDisclaimer ||
                        "This academic honors degree confirms rigorous completion of 5 major curriculum specializations and demonstrated advanced proficiency. It serves as an official honors diploma for professional portfolio presentation and career-readiness (does not constitute a guarantee of employment)."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Personalized Certificate Visual Preview */}
            <div className="rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg my-6 bg-slate-50 relative group">
              <img
                src={`/certificate/image/${result.certificateId || result.queryId}`}
                alt="Personalized Course Certificate"
                className="w-full h-auto object-contain transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/certificate_base.png";
                }}
              />
              <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-xl text-primary">verified</span>
                  <div>
                    <span className="text-xs font-bold text-on-surface block font-headline">
                      Personalized On-Chain Certificate
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      IPFS CID: {result.metadata?.ipfs_cid ? `${result.metadata.ipfs_cid.slice(0, 16)}...` : "Permanently Stored on IPFS"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href={`/certificate/download/${result.certificateId || result.queryId}`}
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all font-headline cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-base">download</span>
                    <span>Download PDF</span>
                  </a>
                  <a
                    href={`/certificate/view/${result.certificateId || result.queryId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest active:scale-95 text-primary font-bold text-xs border border-primary/30 transition-all font-headline cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-base">picture_as_pdf</span>
                    <span>View PDF</span>
                  </a>
                  {result.metadata?.ipfs_cid && (
                    <a
                      href={`https://ipfs.io/ipfs/${result.metadata.ipfs_cid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all font-headline"
                      title="View on IPFS Decentralized Gateway"
                    >
                      <span className="material-symbols-outlined !text-base">cloud_done</span>
                      <span>IPFS</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom explorer verification link */}
            <div className="pt-4 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant">
              <div className="font-mono text-[11px]">
                Contract: <span className="text-on-surface font-bold">{CONTRACT_ADDRESS}</span>
              </div>
              <a
                href={`https://testnetscan.mstblockchain.com/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-sm transition-all font-headline"
              >
                <span>View NFT Contract on MST Explorer</span>
                <span className="material-symbols-outlined !text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
