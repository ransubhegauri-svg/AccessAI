import { network } from "hardhat";

async function main() {
  // Connect to the active network (specified via CLI --network or default)
  const connection = await network.connect();
  const { ethers, networkName } = connection;

  console.log("====================================================");
  console.log(` Deploying AccessAILearning to MST Blockchain`);
  console.log(` Network: ${networkName}`);
  console.log("====================================================");

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer signer found. Please check your network and account configuration in hardhat.config.ts.");
  }

  console.log(`Deployer Account : ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account Balance  : ${ethers.formatEther(balance)} MST\n`);

  if (balance === 0n) {
    throw new Error("Deployer account has 0 MST tokens. Please fund your account with MST testnet tokens before deploying.");
  }

  console.log("Submitting deployment transaction to MST Testnet...");
  const accessAI = await ethers.deployContract("AccessAILearning");

  const deploymentTx = accessAI.deploymentTransaction();
  if (deploymentTx) {
    console.log(`Transaction Hash : ${deploymentTx.hash}`);
  }

  console.log("Waiting for block confirmation on MST Testnet...");
  await accessAI.waitForDeployment();

  const contractAddress = await accessAI.getAddress();
  const ownerAddress = await accessAI.owner();

  console.log("\n====================================================");
  console.log(" AccessAILearning DEPLOYMENT SUCCESSFUL!");
  console.log("====================================================");
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Transaction Hash : ${deploymentTx?.hash || "N/A"}`);
  console.log(`Contract Owner   : ${ownerAddress}`);
  console.log(`Network          : ${networkName}`);
  console.log("====================================================");

  if (connection.close) {
    await connection.close();
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
