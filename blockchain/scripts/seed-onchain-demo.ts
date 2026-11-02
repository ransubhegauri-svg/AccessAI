import { network } from "hardhat";

async function main() {
  const connection = await network.connect("mstTestnet");
  const { ethers } = connection;

  const contractAddress = "0xBC173442E7801B66E6fFdDef9d2e855A4E79299c";
  const accessAI = await ethers.getContractAt("AccessAILearning", contractAddress);
  const [owner] = await ethers.getSigners();

  console.log("Connected to AccessAILearning at:", contractAddress);
  console.log("Owner Account:", owner.address);

  // 1. Award Points Transaction
  const studentAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  console.log(`\nAwarding 100 points to student: ${studentAddress}...`);
  const tx1 = await accessAI.awardPoints(studentAddress, 100n);
  console.log("Award Points Tx Hash:", tx1.hash);
  await tx1.wait();
  console.log("Points awarded successfully! New balance:", await accessAI.getRewardPoints(studentAddress));

  // 2. Issue Certificate Transaction
  const certId = "CERT-ACCESSAI-DEMO-2026-001";
  const courseId = "AI-ACCESSIBILITY-101";
  console.log(`\nIssuing certificate ${certId} to student: ${studentAddress}...`);
  const tx2 = await accessAI.issueCertificate(certId, studentAddress, courseId);
  console.log("Issue Certificate Tx Hash:", tx2.hash);
  await tx2.wait();
  console.log("Certificate issued successfully!");

  // 3. Verify Certificate On-Chain
  const verification = await accessAI.verifyCertificate(certId);
  console.log("\n--- On-Chain Certificate Verification ---");
  console.log("Certificate ID:", certId);
  console.log("Exists        :", verification.exists);
  console.log("Is Valid      :", verification.isValid);
  console.log("Student       :", verification.student);
  console.log("Course ID     :", verification.courseId);
  console.log("Issue Date    :", new Date(Number(verification.issueDate) * 1000).toUTCString());

  if (connection.close) {
    await connection.close();
  }
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exitCode = 1;
});
