import React from "react";
import { Link, useNavigate } from "react-router-dom";
import CertificateVerification from "../components/CertificateVerification";
import WalletBadge from "../components/WalletBadge";
import BackButton from "../components/BackButton";
import { CONTRACT_ADDRESS } from "../services/blockchain";

export default function VerifyCertificatePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans selection:bg-primary-fixed selection:text-primary flex flex-col justify-between">
      {/* ── Fixed Header ── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-3">
          <BackButton fallback="/" />
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl font-bold text-primary font-headline">AccessAI</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hidden sm:inline-block">
              MST Blockchain Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <WalletBadge />
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-xl border border-outline-variant/40 bg-surface hover:bg-surface-container-high text-on-surface text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined !text-sm">arrow_back</span>
            <span>Back to Platform</span>
          </Link>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 pt-28 pb-16 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-4xl mx-auto text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined !text-sm">verified_user</span>
            <span>Decentralized Credential Ledger • MST Testnet</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 text-on-surface font-headline leading-tight tracking-tight">
            Verify Course Credentials On-Chain
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Every course certificate issued by AccessAI is permanently anchored on the MST Testnet smart contract,
            guaranteeing tamper-proof validity for students, employers, and educational institutions.
          </p>
        </div>

        <CertificateVerification />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/30 py-6 px-margin-mobile md:px-margin-desktop bg-surface/50 text-xs text-on-surface-variant">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Secured by MST Blockchain Testnet</span>
          </div>
          <div className="font-mono text-[11px] text-on-surface-variant">
            Smart Contract:{" "}
            <span className="text-primary font-bold">{CONTRACT_ADDRESS}</span>
          </div>
          <a
            href={`https://testnetscan.mstblockchain.com/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline font-bold flex items-center gap-1"
          >
            <span>Explorer Contract</span>
            <span className="material-symbols-outlined !text-xs">open_in_new</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
