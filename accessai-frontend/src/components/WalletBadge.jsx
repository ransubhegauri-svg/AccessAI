import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export default function WalletBadge() {
  const {
    account,
    balance,
    rewardPoints,
    availablePoints,
    openStore,
    isConnecting,
    walletError,
    walletNotice,
    isNotInstalled,
    setInstallModalOpen,
    connect,
    connectDemo,
    disconnect,
    clearMessages,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);

  const displayPoints = availablePoints !== undefined ? availablePoints : rewardPoints;

  if (!account) {
    return (
      <div className="relative inline-flex items-center gap-2 text-left">
        <button
          type="button"
          onClick={openStore}
          className="inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-400/40 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer font-headline"
          title="Open ACCESS AI Rewards Store & Marketplace"
        >
          <span className="material-symbols-outlined !text-sm text-amber-600">storefront</span>
          <span>{displayPoints} PTS</span>
        </button>

        <button
          type="button"
          onClick={connect}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 bg-primary hover:brightness-110 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50 font-headline"
          title="Connect BridgeKey or Web3 wallet for MST Blockchain rewards"
        >
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
          <span>{isConnecting ? "Connecting..." : "Connect BridgeKey"}</span>
        </button>

        {/* Friendly Installation Prompt or Notification */}
        {(isNotInstalled || walletError || walletNotice) && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-outline-variant/40 rounded-2xl shadow-xl p-3.5 z-50 animate-fadeIn text-on-surface text-xs">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-on-surface">
                <span className="material-symbols-outlined !text-base text-primary">info</span>
                <span>{isNotInstalled ? "BridgeKey Extension" : "Wallet Status"}</span>
              </div>
              <button
                type="button"
                onClick={clearMessages}
                className="text-on-surface-variant hover:text-on-surface"
                aria-label="Close"
              >
                <span className="material-symbols-outlined !text-sm">close</span>
              </button>
            </div>

            <p className="text-[11px] text-on-surface-variant mb-2.5 leading-normal">
              {walletError || walletNotice || "BridgeKey extension not detected in this browser."}
            </p>

            <div className="flex flex-col gap-1.5">
              {isNotInstalled ? (
                <>
                  <a
                    href="https://bridgekey.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-2.5 bg-primary text-white font-bold text-center rounded-lg hover:brightness-110 transition flex items-center justify-center gap-1 text-[11px]"
                  >
                    <span>Install BridgeKey (bridgekey.io)</span>
                    <span className="material-symbols-outlined !text-xs">open_in_new</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setInstallModalOpen(true);
                    }}
                    className="w-full py-1 px-2 text-primary hover:underline text-[11px] font-semibold text-center"
                  >
                    View Setup Options
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={connect}
                  className="w-full py-1.5 px-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition text-[11px]"
                >
                  Retry Connection
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const shortAddr = `${account.slice(0, 6)}...${account.slice(-4)}`;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-surface hover:bg-surface-container-high text-on-surface border border-outline-variant/40 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono font-bold text-primary">{shortAddr}</span>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-bold text-[10px] border border-amber-400/30">
          ⭐ {displayPoints} PTS
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-outline-variant/40 rounded-2xl shadow-xl p-4 z-50 animate-fadeIn text-on-surface">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <span className="text-xs font-bold text-primary uppercase tracking-wider font-headline">
              BridgeKey Wallet
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold border border-emerald-500/25">
              MST Testnet
            </span>
          </div>

          <div className="mt-3 space-y-2.5 text-xs">
            <div>
              <span className="text-on-surface-variant text-[11px] block font-medium">Wallet Address</span>
              <span className="font-mono text-on-surface font-semibold break-all select-all text-[11px]">
                {account}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-outline-variant/15">
              <span className="text-on-surface-variant">MST Balance:</span>
              <span className="font-bold text-on-surface font-mono">
                {parseFloat(balance || "0").toFixed(3)} MST
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-outline-variant/15">
              <span className="text-on-surface-variant">Available Rewards:</span>
              <span className="font-bold text-amber-600 font-mono text-sm">
                ⭐ {displayPoints} PTS
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openStore();
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span className="material-symbols-outlined !text-base">storefront</span>
              <span>Redeem Points in Store</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
            <Link
              to="/verify"
              onClick={() => setIsOpen(false)}
              className="text-xs text-primary hover:underline font-bold"
            >
              Verify Credentials &rarr;
            </Link>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
