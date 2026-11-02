import { buildModule } from
  "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AccessAI", (m) => {
  const accessAI = m.contract("AccessAILearning");
  return { accessAI };
});