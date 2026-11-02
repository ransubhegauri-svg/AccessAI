import { network } from "hardhat";

const { ethers } = await network.connect("mstTestnet");

const provider = ethers.provider;

console.log("Network:", await provider.getNetwork());
console.log("Block number:", await provider.getBlockNumber());