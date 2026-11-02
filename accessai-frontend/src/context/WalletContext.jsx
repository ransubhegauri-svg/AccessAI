import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  connectWallet as connectWalletService,
  connectDemoWallet,
  fetchStudentPointsOnChain,
  ensureMSTNetwork,
  getBridgeKeyProvider,
  isBridgeKeyInstalled,
  WalletNotInstalledError,
  WalletUserRejectedError,
  MST_TESTNET_CONFIG,
  CONTRACT_ADDRESS,
} from "../services/blockchain";
import API from "../services/api";
import BridgeKeyModal from "../components/BridgeKeyModal";
import RewardStoreModal from "../components/RewardStoreModal";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(() => {
    return localStorage.getItem("accessai_wallet_address") || null;
  });
  const [balance, setBalance] = useState("0");
  const [rewardPoints, setRewardPoints] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(550);
  const [unlockedItems, setUnlockedItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("accessai_unlocked_reward_items") || "[]");
    } catch {
      return [];
    }
  });
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [walletNotice, setWalletNotice] = useState(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [isNotInstalled, setIsNotInstalled] = useState(false);

  const refreshRewardsData = useCallback(async (userId = "demo-uid-deaf") => {
    try {
      const res = await API.get(`/rewards/balance/${userId}`);
      if (res.data?.success) {
        setAvailablePoints(res.data.availablePoints);
        setUnlockedItems(res.data.unlockedItems || []);
        localStorage.setItem("accessai_unlocked_reward_items", JSON.stringify(res.data.unlockedItems || []));
      }
    } catch (err) {
      console.warn("Could not sync rewards data:", err);
    }
  }, []);

  const redeemItem = useCallback(async (itemId, userId = "demo-uid-deaf") => {
    try {
      const res = await API.post("/rewards/redeem", {
        userId,
        itemId,
        onchainPoints: rewardPoints,
      });
      if (res.data?.success) {
        setAvailablePoints(res.data.availablePoints);
        setUnlockedItems(res.data.unlockedItems || []);
        localStorage.setItem("accessai_unlocked_reward_items", JSON.stringify(res.data.unlockedItems || []));
        return res.data;
      }
      return res.data;
    } catch (err) {
      console.error("Failed to redeem item:", err);
      throw err;
    }
  }, [rewardPoints]);

  const fetchPoints = useCallback(async (walletAddr) => {
    if (!walletAddr) return;
    try {
      const pts = await fetchStudentPointsOnChain(walletAddr);
      setRewardPoints(pts);
      // Also sync available points if higher
      setAvailablePoints((prev) => Math.max(prev, pts));
    } catch (err) {
      console.warn("Failed to fetch on-chain student points:", err);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setWalletError(null);
    setWalletNotice(null);
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    clearMessages();

    // Check if BridgeKey or EVM provider is available
    if (!isBridgeKeyInstalled()) {
      setIsNotInstalled(true);
      setInstallModalOpen(true);
      setIsConnecting(false);
      setWalletNotice("BridgeKey wallet not detected. Please install the extension.");
      return null;
    }

    try {
      const data = await connectWalletService();
      setAccount(data.address);
      setBalance(data.balance);
      localStorage.setItem("accessai_wallet_address", data.address);
      setIsNotInstalled(false);

      // Fetch on-chain points
      await fetchPoints(data.address);

      // Automatically claim any 100% completed courses without on-chain rewards
      try {
        await API.post("/progress/claim-onchain", {
          walletAddress: data.address,
        });
        await fetchPoints(data.address);
      } catch (claimErr) {
        console.log("Auto-claim skipped or user not authenticated:", claimErr?.response?.status || claimErr.message);
      }

      return data.address;
    } catch (err) {
      console.warn("Wallet connection notice/error:", err);
      if (err instanceof WalletNotInstalledError || err.isNotInstalled) {
        setIsNotInstalled(true);
        setInstallModalOpen(true);
        setWalletNotice("BridgeKey wallet not detected. Please install the extension.");
      } else if (err instanceof WalletUserRejectedError || err.isUserRejected || err.code === 4001) {
        setWalletNotice("Connection was cancelled in your wallet.");
      } else {
        setWalletError(err.message || "Failed to connect BridgeKey wallet. Please try again.");
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [fetchPoints, clearMessages]);

  const connectDemo = useCallback(async () => {
    setIsConnecting(true);
    clearMessages();
    try {
      const demoData = await connectDemoWallet();
      setAccount(demoData.address);
      setBalance(demoData.balance);
      localStorage.setItem("accessai_wallet_address", demoData.address);
      await fetchPoints(demoData.address);
      setInstallModalOpen(false);
      setWalletNotice("Connected to MST Testnet (Evaluator Mode)");
      setTimeout(() => setWalletNotice(null), 4000);
      return demoData.address;
    } catch (err) {
      console.error("Demo wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchPoints, clearMessages]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance("0");
    setRewardPoints(0);
    clearMessages();
    localStorage.removeItem("accessai_wallet_address");
  }, [clearMessages]);

  // Listen for account and network changes on active provider
  useEffect(() => {
    const provider = getBridgeKeyProvider();
    if (!provider) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        localStorage.setItem("accessai_wallet_address", accounts[0]);
        fetchPoints(accounts[0]);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    if (account) {
      fetchPoints(account);
    }

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [account, fetchPoints, disconnect]);

  const value = {
    account,
    balance,
    rewardPoints,
    availablePoints,
    unlockedItems,
    isStoreModalOpen,
    setIsStoreModalOpen,
    openStore: () => setIsStoreModalOpen(true),
    closeStore: () => setIsStoreModalOpen(false),
    redeemItem,
    refreshRewardsData,
    isConnecting,
    walletError,
    walletNotice,
    isNotInstalled,
    installModalOpen,
    setInstallModalOpen,
    connect,
    connectDemo,
    disconnect,
    clearMessages,
    refreshPoints: () => fetchPoints(account),
    contractAddress: CONTRACT_ADDRESS,
    networkConfig: MST_TESTNET_CONFIG,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      <BridgeKeyModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        onConnectDemo={connectDemo}
      />
      <RewardStoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
