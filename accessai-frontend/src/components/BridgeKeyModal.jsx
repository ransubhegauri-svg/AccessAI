import React, { useEffect } from "react";

export default function BridgeKeyModal({
  isOpen,
  onClose,
  onConnectDemo,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bridgekey-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/30 text-on-surface transform transition-all animate-scaleUp relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high transition cursor-pointer"
          aria-label="Close dialog"
        >
          <span className="material-symbols-outlined !text-xl">close</span>
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5 shadow-sm">
          <span className="material-symbols-outlined !text-3xl text-primary">account_balance_wallet</span>
        </div>

        {/* Title & Description */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/25 mb-2 font-headline">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            MST Testnet Ecosystem
          </div>
          <h2 id="bridgekey-modal-title" className="text-xl md:text-2xl font-bold font-headline text-on-surface">
            Connect with BridgeKey
          </h2>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            BridgeKey is the official Web3 wallet for the <strong>MST Blockchain</strong>. To receive your on-chain reward points and verify course certificates, please install the browser extension.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href="https://bridgekey.io"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-primary hover:brightness-110 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition font-headline cursor-pointer"
          >
            <span>Install BridgeKey Extension</span>
            <span className="material-symbols-outlined !text-base">open_in_new</span>
          </a>

          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-surface hover:bg-surface-container-high active:scale-95 text-on-surface border border-outline-variant/40 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <span>Open Chrome Web Store</span>
            <span className="material-symbols-outlined !text-sm">storefront</span>
          </a>

          {/* Demo / Evaluator quick connection */}
          {onConnectDemo && (
            <div className="pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  onConnectDemo();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer font-headline"
              >
                <span className="material-symbols-outlined !text-base text-emerald-600">bolt</span>
                <span>Connect with Demo / Judge Wallet</span>
              </button>
              <p className="text-[11px] text-center text-on-surface-variant mt-1.5">
                Evaluator Mode: Test live MST Testnet rewards & NFT verification without installing extensions.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-outline-variant/15 flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>Network: MST Testnet (Chain ID 1025)</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
