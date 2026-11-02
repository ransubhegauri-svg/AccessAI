import React, { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function RewardStoreModal({
  isOpen = true,
  onClose,
  embedded = false,
  onLaunchCourse,
  mode = "deaf",
}) {
  const { user } = useAuth();
  const {
    account,
    rewardPoints,
    availablePoints: walletAvailablePoints,
    unlockedItems: walletUnlockedItems,
    redeemItem: walletRedeemItem,
    refreshRewardsData,
  } = useWallet();

  const [catalog, setCatalog] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all"); // 'all', 'course', 'perk', 'swag', 'history'
  const [loading, setLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [redeemError, setRedeemError] = useState(null);
  const [balanceData, setBalanceData] = useState({
    availablePoints: walletAvailablePoints ?? 550,
    totalEarned: 550,
    totalSpent: 0,
    unlockedItems: walletUnlockedItems || [],
  });
  const [transactions, setTransactions] = useState([]);

  const userId = user?.uid || (mode === "blind" ? "demo-uid-blind" : mode === "motor" ? "demo-uid-motor" : "demo-uid-deaf");

  // Fetch catalog & balance on mount or open
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [catRes, balRes, histRes] = await Promise.all([
          API.get("/rewards/catalog").catch(() => ({ data: { catalog: [] } })),
          API.get(`/rewards/balance/${userId}${rewardPoints ? `?onchain_points=${rewardPoints}` : ""}`).catch(() => ({
            data: {
              availablePoints: walletAvailablePoints ?? 550,
              totalEarned: Math.max(550, rewardPoints || 0),
              totalSpent: 0,
              unlockedItems: [],
            },
          })),
          API.get(`/rewards/history/${userId}`).catch(() => ({ data: { transactions: [] } })),
        ]);

        if (isMounted) {
          if (catRes.data?.catalog) {
            setCatalog(catRes.data.catalog);
          }
          if (balRes.data?.success) {
            setBalanceData({
              availablePoints: balRes.data.availablePoints,
              totalEarned: balRes.data.totalEarned,
              totalSpent: balRes.data.totalSpent,
              unlockedItems: balRes.data.unlockedItems || [],
            });
          }
          if (histRes.data?.transactions) {
            setTransactions(histRes.data.transactions);
          }
        }
      } catch (err) {
        console.warn("Failed to load rewards store data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (isOpen || embedded) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, embedded, userId, rewardPoints, walletAvailablePoints]);

  const availablePoints = balanceData.availablePoints;
  const unlockedItems = new Set(balanceData.unlockedItems);

  // Handle item purchase
  const handleRedeem = async (item) => {
    if (unlockedItems.has(item.id)) return;
    if (availablePoints < item.pointsCost) {
      setRedeemError(`Insufficient points! You need ${item.pointsCost - availablePoints} more points to purchase this item.`);
      setTimeout(() => setRedeemError(null), 5000);
      return;
    }

    setRedeemingId(item.id);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      let res;
      if (walletRedeemItem) {
        res = await walletRedeemItem(item.id, userId);
      } else {
        const resp = await API.post("/rewards/redeem", {
          userId,
          itemId: item.id,
          onchainPoints: rewardPoints,
        });
        res = resp.data;
      }

      if (res && (res.success || res.status === "success")) {
        setRedeemSuccess(`🎉 Successfully unlocked "${item.title}" for ${item.pointsCost} Points!`);
        setBalanceData((prev) => ({
          ...prev,
          availablePoints: res.availablePoints !== undefined ? res.availablePoints : Math.max(0, prev.availablePoints - item.pointsCost),
          totalSpent: res.totalSpent !== undefined ? res.totalSpent : prev.totalSpent + item.pointsCost,
          unlockedItems: [...prev.unlockedItems, item.id],
        }));

        if (res.transaction) {
          setTransactions((prev) => [res.transaction, ...prev]);
        }

        if (refreshRewardsData) {
          refreshRewardsData(userId);
        }

        // Save unlocked items locally so CoursePlayer and other views can load immediately
        try {
          const stored = JSON.parse(localStorage.getItem("accessai_unlocked_reward_items") || "[]");
          if (!stored.includes(item.id)) {
            stored.push(item.id);
            localStorage.setItem("accessai_unlocked_reward_items", JSON.stringify(stored));
          }
        } catch {
          // ignore localStorage err
        }
      } else {
        setRedeemError(res?.error || "Redemption could not be completed.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to purchase item.";
      setRedeemError(msg);
    } finally {
      setRedeemingId(null);
    }
  };

  const filteredItems = catalog.filter((item) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "course") return item.type === "course";
    if (activeCategory === "perk") return item.type === "perk";
    if (activeCategory === "swag") return item.type === "swag";
    return true;
  });

  if (!isOpen && !embedded) return null;

  const content = (
    <div className="flex flex-col gap-6">
      {/* ── Top Hero Points Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white p-6 md:p-8 shadow-xl border border-amber-400/30">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                ⭐ MST Blockchain Rewards Store
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Live On-Chain Balance
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Spend Reward Points on Premium Courses & Perks
            </h2>
            <p className="text-amber-100 text-xs md:text-sm max-w-2xl leading-relaxed">
              Every course you complete earns you +50 PTS, and your Academic Honors Degree awards +500 PTS. Redeem points below for certified masterclasses, VIP AI Tutor passes, glowing on-chain badges, and official physical diplomas.
            </p>
          </div>

          {/* Points Balance Pill */}
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col items-center justify-center min-w-[210px] text-center shadow-lg">
            <span className="text-[11px] font-bold text-amber-200 uppercase tracking-widest">
              Available to Spend
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white drop-shadow">
                {availablePoints}
              </span>
              <span className="text-base font-extrabold text-amber-200">PTS</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-amber-100/90 pt-1 border-t border-white/10 w-full justify-center">
              <span>Earned: <strong>{balanceData.totalEarned}</strong></span>
              <span>•</span>
              <span>Spent: <strong>{balanceData.totalSpent}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Alerts ── */}
      {redeemSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 !text-xl">check_circle</span>
            <span className="font-semibold">{redeemSuccess}</span>
          </div>
          <button
            onClick={() => setRedeemSuccess(null)}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {redeemError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600 !text-xl">error</span>
            <span className="font-semibold">{redeemError}</span>
          </div>
          <button
            onClick={() => setRedeemError(null)}
            className="text-xs font-bold text-rose-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Category Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Items", icon: "widgets", count: catalog.length },
            { id: "course", label: "Premium Courses", icon: "school", count: catalog.filter((i) => i.type === "course").length },
            { id: "perk", label: "Perks & Upgrades", icon: "stars", count: catalog.filter((i) => i.type === "perk").length },
            { id: "swag", label: "Physical Swag", icon: "local_shipping", count: catalog.filter((i) => i.type === "swag").length },
            { id: "history", label: "Transparent History", icon: "receipt_long", count: transactions.length },
          ].map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span className="material-symbols-outlined !text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{activeCategory === "history" ? transactions.length : filteredItems.length}</strong> items
        </div>
      </div>

      {/* ── Tab Content: Transparent History ── */}
      {activeCategory === "history" ? (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 !text-lg">verified_user</span>
              <span>
                <strong>Transparent Ledger:</strong> Every reward point earned or spent is recorded immutably with cryptographic transaction proofs.
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">MST Testnet (91562037)</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
              <span className="material-symbols-outlined !text-4xl mb-2 text-slate-300">receipt_long</span>
              <p className="font-semibold text-sm">No transaction records found yet.</p>
              <p className="text-xs mt-1">Complete courses or redeem items to generate reward transactions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Points</th>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Blockchain Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {transactions.map((tx) => {
                    const isEarned = tx.type === "earned";
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{tx.id}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isEarned
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            <span className="material-symbols-outlined !text-xs">
                              {isEarned ? "arrow_downward" : "arrow_upward"}
                            </span>
                            {isEarned ? "Earned" : "Spent"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{tx.description}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{tx.source?.replace("_", " ")}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-mono font-black text-sm ${
                              isEarned ? "text-emerald-600" : "text-amber-700"
                            }`}
                          >
                            {isEarned ? `+${tx.amount}` : `-${tx.amount}`} PTS
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{tx.timestamp}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {tx.txHash ? (
                            <a
                              href={`https://scan.mst.today/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                              title={tx.txHash}
                            >
                              <span>{`${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}`}</span>
                              <span className="material-symbols-outlined !text-xs">open_in_new</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">On-Chain Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ── Grid of Catalog Items ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filteredItems.map((item) => {
            const isUnlocked = unlockedItems.has(item.id);
            const canAfford = availablePoints >= item.pointsCost;
            const deficit = item.pointsCost - availablePoints;
            const isRedeeming = redeemingId === item.id;
            const isCourse = item.type === "course";

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-3xl border transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                  isUnlocked
                    ? "border-emerald-400/80 bg-gradient-to-b from-emerald-50/20 to-white"
                    : canAfford
                    ? "border-amber-300 hover:border-amber-500"
                    : "border-slate-200 opacity-90"
                } p-6`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isUnlocked
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {item.badge}
                    </span>

                    {/* Points Cost Tag */}
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-xl font-mono font-black text-xs ${
                        isUnlocked
                          ? "bg-emerald-500 text-white"
                          : canAfford
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span>⭐</span>
                      <span>{item.pointsCost} PTS</span>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isUnlocked
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <span className="material-symbols-outlined !text-2xl">{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Metadata line for courses */}
                  {isCourse && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 pb-2 border-b border-slate-100">
                      <span>👤 {item.instructor?.split(",")[0]}</span>
                      <span>•</span>
                      <span>⏱️ {item.duration}</span>
                      <span>•</span>
                      <span>⭐ {item.rating}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Benefits / Curriculum Preview */}
                  {item.lessons && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Course Curriculum ({item.lessons.length} Modules):
                      </span>
                      <ul className="space-y-1">
                        {item.lessons.slice(0, 3).map((les, idx) => (
                          <li key={les.id} className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            <span className="truncate">{les.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.perkBenefits && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Perk Benefits:
                      </span>
                      <ul className="space-y-1">
                        {item.perkBenefits.map((ben, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <span className="material-symbols-outlined !text-xs text-emerald-600 flex-shrink-0">
                              check
                            </span>
                            <span>{ben}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Action CTA */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  {isUnlocked ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <span className="material-symbols-outlined !text-base">check_circle</span>
                        <span>Unlocked & Ready</span>
                      </div>
                      {isCourse && onLaunchCourse && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onClose) onClose();
                            onLaunchCourse(item);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-primary hover:brightness-110 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined !text-base">play_circle</span>
                          <span>Launch Course Player</span>
                        </button>
                      )}
                    </div>
                  ) : canAfford ? (
                    <button
                      type="button"
                      disabled={isRedeeming}
                      onClick={() => handleRedeem(item)}
                      className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isRedeeming ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Redeeming On-Chain...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined !text-base">redeem</span>
                          <span>Redeem for {item.pointsCost} PTS</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs text-center border border-slate-200/80 flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined !text-base text-slate-400">lock</span>
                      <span>Need {deficit} more PTS to unlock</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Rewards Store"
    >
      <div className="bg-slate-50 border border-slate-300 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto p-6 md:p-8 relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 !text-2xl">storefront</span>
            <span className="font-extrabold text-lg text-slate-900 font-headline">
              ACCESS AI Rewards & Course Marketplace
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-600 transition cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined !text-xl">close</span>
          </button>
        </div>

        {content}
      </div>
    </div>
  );
}
