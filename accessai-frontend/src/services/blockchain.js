import { ethers } from "ethers";

export const MST_TESTNET_CONFIG = {
  chainIdHex: "0x5752035",
  chainIdDecimal: 91562037,
  chainName: "MST Testnet",
  rpcUrl: "https://testnetrpc.mstblockchain.com",
  nativeCurrency: {
    name: "MST",
    symbol: "MST",
    decimals: 18,
  },
  blockExplorerUrls: ["https://testnetscan.mstblockchain.com"],
};

export const CONTRACT_ADDRESS = "0x6eC3BDD3FB10E8C0251F615a56fe52436E62D290";

export const CONTRACT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function owner() view returns (address)",
  "function totalCertificatesIssued() view returns (uint256)",
  "function getRewardPoints(address student) view returns (uint256)",
  "function studentRewardPoints(address) view returns (uint256)",
  "function hasCompletedCourse(address student, string courseId) view returns (bool)",
  "function getStudentTokenIds(address student) view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function verifyCertificate(string certificateId) view returns (bool exists, bool isValid, address student, string courseId, uint256 issueDate, uint256 tokenId, string certificateHash, string tokenURI_)",
  "function verifyCertificateByHash(string certificateHash) view returns (bool exists, bool isValid, address student, string courseId, uint256 issueDate, uint256 tokenId, string certificateId, string tokenURI_)",
  "function verifyCertificateByTokenId(uint256 tokenId) view returns (bool exists, bool isValid, address student, string courseId, uint256 issueDate, string certificateId, string certificateHash, string tokenURI_)",
  "function isCertificateValid(string certificateId) view returns (bool)",
  "function isCertificateHashValid(string certificateHash) view returns (bool)",
  "function awardPoints(address student, uint256 points)",
  "function awardAndIssueCertificateNFT(address student, uint256 points, string certificateId, string courseId, string certificateHash, string tokenURI_) returns (uint256)",
  "function issueCertificateNFT(address student, string certificateId, string courseId, string certificateHash, string tokenURI_) returns (uint256)",
  "function revokeCertificate(uint256 tokenId)",
  "function revokeCertificate(string certificateId)",
  "event PointsAwarded(address indexed student, uint256 pointsAdded, uint256 newTotalPoints)",
  "event CertificateNFTIssued(uint256 indexed tokenId, string certificateId, address indexed student, string courseId, string certificateHash, string tokenURI, uint256 issueDate)",
  "event CertificateIssued(string certificateId, address indexed student, string courseId, uint256 issueDate)",
  "event CertificateRevoked(uint256 indexed tokenId, string certificateId, address indexed student)",
];

// Global EIP-6963 provider registry for modern Web3 wallet extensions
const eip6963Providers = [];
if (typeof window !== "undefined") {
  window.addEventListener("eip6963:announceProvider", (event) => {
    if (event?.detail && !eip6963Providers.some((p) => p.info?.uuid === event.detail.info?.uuid)) {
      eip6963Providers.push(event.detail);
      window._eip6963Providers = eip6963Providers;
    }
  });
  try {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  } catch {}
}

export class WalletNotInstalledError extends Error {
  constructor(message = "BridgeKey wallet extension is not installed.") {
    super(message);
    this.name = "WalletNotInstalledError";
    this.isNotInstalled = true;
    this.installUrl = "https://bridgekey.io";
    this.chromeStoreUrl = "https://chrome.google.com/webstore";
  }
}

export class WalletUserRejectedError extends Error {
  constructor(message = "Connection request was cancelled in your wallet.") {
    super(message);
    this.name = "WalletUserRejectedError";
    this.isUserRejected = true;
  }
}

/**
 * Robust multi-layer detection for BridgeKey wallet and EVM browser extensions.
 */
export function getBridgeKeyProvider() {
  if (typeof window === "undefined") return null;

  // 1. Direct window.bridgekey injection from BridgeKey extension
  if (window.bridgekey && typeof window.bridgekey.request === "function") {
    return window.bridgekey;
  }

  // 2. Multi-provider array (EIP-5749 / multiple wallet extensions installed)
  if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
    const bk = window.ethereum.providers.find(
      (p) => p.isBridgeKey || p.name?.toLowerCase?.().includes("bridgekey")
    );
    if (bk && typeof bk.request === "function") return bk;
  }

  // 3. window.ethereum with isBridgeKey flag
  if (window.ethereum?.isBridgeKey && typeof window.ethereum.request === "function") {
    return window.ethereum;
  }

  // 4. EIP-6963 discovered providers
  const storedProviders = window._eip6963Providers || eip6963Providers;
  if (storedProviders && storedProviders.length > 0) {
    const bk = storedProviders.find(
      (p) =>
        p.info?.name?.toLowerCase().includes("bridgekey") ||
        p.info?.rdns?.includes("bridgekey")
    );
    if (bk?.provider && typeof bk.provider.request === "function") return bk.provider;
    if (storedProviders[0]?.provider && typeof storedProviders[0].provider.request === "function") {
      return storedProviders[0].provider;
    }
  }

  // 5. Standard window.ethereum (MetaMask or EVM provider fallback)
  if (window.ethereum && typeof window.ethereum.request === "function") {
    return window.ethereum;
  }

  return null;
}

export function isBridgeKeyInstalled() {
  return getBridgeKeyProvider() !== null;
}

/**
 * Returns a read-only instance of the contract connected directly to the MST Testnet RPC.
 * This allows judges and users to verify certificates on-chain without needing a wallet installed.
 */
export function getReadOnlyContract() {
  const provider = new ethers.JsonRpcProvider(MST_TESTNET_CONFIG.rpcUrl);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Switch or add MST Testnet to the user's wallet (BridgeKey / EVM wallet).
 */
export async function ensureMSTNetwork(provider = null) {
  const activeProvider = provider || getBridgeKeyProvider();
  if (!activeProvider) {
    throw new WalletNotInstalledError("No Web3 wallet detected. Please install BridgeKey.");
  }

  // Check current chain ID first — if already on MST Testnet, no prompt is needed!
  try {
    const currentChainId = await activeProvider.request({ method: "eth_chainId" });
    if (
      currentChainId === MST_TESTNET_CONFIG.chainIdHex ||
      parseInt(currentChainId, 16) === MST_TESTNET_CONFIG.chainIdDecimal
    ) {
      return true;
    }
  } catch (err) {
    console.warn("Could not check current chainId:", err);
  }

  try {
    await activeProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MST_TESTNET_CONFIG.chainIdHex }],
    });
    return true;
  } catch (switchError) {
    // 4001 = User cancelled switch
    if (switchError.code === 4001) {
      throw new WalletUserRejectedError("Network switch to MST Testnet was cancelled in your wallet.");
    }

    // 4902 or unrecognized chain -> Add MST Testnet to wallet
    const isUnrecognized =
      switchError.code === 4902 ||
      switchError?.data?.originalError?.code === 4902 ||
      switchError.message?.toLowerCase().includes("unrecognized") ||
      switchError.message?.toLowerCase().includes("not added") ||
      switchError.message?.toLowerCase().includes("not found");

    if (isUnrecognized) {
      try {
        await activeProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MST_TESTNET_CONFIG.chainIdHex,
              chainName: MST_TESTNET_CONFIG.chainName,
              rpcUrls: [MST_TESTNET_CONFIG.rpcUrl],
              nativeCurrency: MST_TESTNET_CONFIG.nativeCurrency,
              blockExplorerUrls: MST_TESTNET_CONFIG.blockExplorerUrls,
            },
          ],
        });
        return true;
      } catch (addError) {
        if (addError.code === 4001) {
          throw new WalletUserRejectedError("Adding MST Testnet was cancelled in your wallet.");
        }
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
}

/**
 * Connect to BridgeKey / Web3 wallet.
 * Requests accounts first so the wallet popup opens, then ensures MST Testnet network.
 */
export async function connectWallet() {
  const activeProvider = getBridgeKeyProvider();
  if (!activeProvider) {
    throw new WalletNotInstalledError();
  }

  // 1. FIRST request accounts so BridgeKey displays the authorization prompt!
  let accounts;
  try {
    accounts = await activeProvider.request({ method: "eth_requestAccounts" });
  } catch (reqErr) {
    if (
      reqErr.code === 4001 ||
      reqErr.message?.toLowerCase().includes("user rejected") ||
      reqErr.message?.toLowerCase().includes("cancelled")
    ) {
      throw new WalletUserRejectedError("Connection request was cancelled in BridgeKey.");
    }
    if (reqErr.code === -32002) {
      throw new Error("BridgeKey connection request is already pending. Please check your browser extension.");
    }
    throw reqErr;
  }

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts selected in BridgeKey.");
  }

  const address = accounts[0];

  // 2. Ensure network is MST Testnet
  try {
    await ensureMSTNetwork(activeProvider);
  } catch (netErr) {
    console.warn("MST Network switch prompt handled:", netErr);
  }

  // 3. Obtain balance with reliable fallback
  let balanceFormatted = "0";
  try {
    const browserProvider = new ethers.BrowserProvider(activeProvider);
    const balance = await browserProvider.getBalance(address);
    balanceFormatted = ethers.formatEther(balance);
  } catch (balErr) {
    try {
      const readProvider = new ethers.JsonRpcProvider(MST_TESTNET_CONFIG.rpcUrl);
      const balance = await readProvider.getBalance(address);
      balanceFormatted = ethers.formatEther(balance);
    } catch {}
  }

  return {
    provider: activeProvider,
    address,
    balance: balanceFormatted,
    isBridgeKey: true,
  };
}

/**
 * Connect with a Demo/Judge wallet address on MST Testnet.
 * Allows judges and evaluators without the extension to test on-chain verification & rewards.
 */
export async function connectDemoWallet(demoAddress = "0x1111111111111111111111111111111111111111") {
  const readProvider = new ethers.JsonRpcProvider(MST_TESTNET_CONFIG.rpcUrl);
  let balanceFormatted = "0";
  try {
    const balance = await readProvider.getBalance(demoAddress);
    balanceFormatted = ethers.formatEther(balance);
  } catch {}

  return {
    provider: null,
    address: demoAddress,
    balance: balanceFormatted,
    isBridgeKey: false,
    isDemo: true,
  };
}

/**
 * Parses decentralized Base64 JSON tokenURI metadata.
 */
function parseTokenURI(tokenURI) {
  if (!tokenURI) return null;
  try {
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const b64 = tokenURI.replace("data:application/json;base64,", "");
      const jsonStr = atob(b64);
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.warn("Failed to parse tokenURI json:", e);
  }
  return null;
}

/**
 * Universal verification function:
 * Accepts Certificate ID (e.g. "CERT-PYTHON-001"), Certificate Hash (0x...), or Token ID (#1 or 1).
 */
export async function verifyCertificateOnChain(query) {
  const contract = getReadOnlyContract();
  const trimmed = String(query).trim();

  // 1. If it looks like a numeric token ID (e.g., "1", "#1")
  const numericTokenId = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (/^\d+$/.test(numericTokenId) && Number(numericTokenId) > 0 && Number(numericTokenId) < 1000000) {
    try {
      const res = await contract.verifyCertificateByTokenId(ethers.toBigInt(numericTokenId));
      if (res[0]) {
        const metadata = parseTokenURI(res[7]);
        return {
          exists: res[0],
          isValid: res[1],
          student: res[2],
          courseId: res[3],
          issueDate: Number(res[4]),
          formattedDate: Number(res[4]) > 0 ? new Date(Number(res[4]) * 1000).toLocaleString() : "N/A",
          certificateId: res[5],
          certificateHash: res[6],
          tokenURI: res[7],
          tokenId: Number(numericTokenId),
          metadata,
          queryType: "token_id",
        };
      }
    } catch {}
  }

  // 2. If it looks like a cryptographic certificate hash (starts with 0x)
  if (trimmed.startsWith("0x") && trimmed.length >= 20) {
    try {
      const res = await contract.verifyCertificateByHash(trimmed);
      if (res[0]) {
        const metadata = parseTokenURI(res[7]);
        return {
          exists: res[0],
          isValid: res[1],
          student: res[2],
          courseId: res[3],
          issueDate: Number(res[4]),
          formattedDate: Number(res[4]) > 0 ? new Date(Number(res[4]) * 1000).toLocaleString() : "N/A",
          tokenId: Number(res[5]),
          certificateId: res[6],
          tokenURI: res[7],
          certificateHash: trimmed,
          metadata,
          queryType: "hash",
        };
      }
    } catch {}
  }

  // 3. Query by Certificate ID string
  try {
    const res = await contract.verifyCertificate(trimmed);
    if (res[0]) {
      const metadata = parseTokenURI(res[7]);
      return {
        exists: res[0],
        isValid: res[1],
        student: res[2],
        courseId: res[3],
        issueDate: Number(res[4]),
        formattedDate: Number(res[4]) > 0 ? new Date(Number(res[4]) * 1000).toLocaleString() : "N/A",
        tokenId: Number(res[5]),
        certificateHash: res[6],
        tokenURI: res[7],
        certificateId: trimmed,
        metadata,
        queryType: "certificate_id",
      };
    }
  } catch (err) {
    console.error("verifyCertificate error:", err);
  }

  return {
    exists: false,
    isValid: false,
    student: "",
    courseId: "",
    issueDate: 0,
    formattedDate: "N/A",
    tokenId: null,
    certificateHash: "",
    tokenURI: "",
    certificateId: trimmed,
    metadata: null,
    queryType: "unknown",
  };
}

/**
 * Dedicated verification by Certificate Hash.
 */
export async function verifyCertificateByHashOnChain(certificateHash) {
  const contract = getReadOnlyContract();
  const res = await contract.verifyCertificateByHash(certificateHash.trim());
  const metadata = parseTokenURI(res[7]);
  return {
    exists: res[0],
    isValid: res[1],
    student: res[2],
    courseId: res[3],
    issueDate: Number(res[4]),
    formattedDate: Number(res[4]) > 0 ? new Date(Number(res[4]) * 1000).toLocaleString() : "N/A",
    tokenId: Number(res[5]),
    certificateId: res[6],
    tokenURI: res[7],
    certificateHash: certificateHash.trim(),
    metadata,
  };
}

/**
 * Dedicated verification by NFT Token ID.
 */
export async function verifyCertificateByTokenIdOnChain(tokenId) {
  const contract = getReadOnlyContract();
  const res = await contract.verifyCertificateByTokenId(ethers.toBigInt(tokenId));
  const metadata = parseTokenURI(res[7]);
  return {
    exists: res[0],
    isValid: res[1],
    student: res[2],
    courseId: res[3],
    issueDate: Number(res[4]),
    formattedDate: Number(res[4]) > 0 ? new Date(Number(res[4]) * 1000).toLocaleString() : "N/A",
    certificateId: res[5],
    certificateHash: res[6],
    tokenURI: res[7],
    tokenId: Number(tokenId),
    metadata,
  };
}

/**
 * Fetches total reward points for a student wallet address from MST Blockchain.
 */
export async function fetchStudentPointsOnChain(studentAddress) {
  const contract = getReadOnlyContract();
  const points = await contract.getRewardPoints(studentAddress);
  return Number(points);
}

/**
 * Fetches all certificate NFT token IDs earned by a student.
 */
export async function fetchStudentTokenIdsOnChain(studentAddress) {
  const contract = getReadOnlyContract();
  const tokenIds = await contract.getStudentTokenIds(studentAddress);
  return tokenIds.map(t => Number(t));
}
