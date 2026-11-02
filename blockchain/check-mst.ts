import { network } from "hardhat";

async function main() {
  const connection = await network.connect("mstTestnet");
  const chainId = await connection.provider.send("eth_chainId", []);
  const blockNumber = await connection.provider.send("eth_blockNumber", []);

  console.log("MST Testnet connection successful!");
  console.log("Chain ID:", chainId);
  console.log("Latest block:", parseInt(blockNumber, 16));

  await connection.close();
}

main().catch((error) => {
  console.error("Connection failed:", error);
  process.exitCode = 1;
});