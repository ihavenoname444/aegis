import { verify } from "./verifier.js";
import { conservationReport } from "./authority-kernel.js";
import { consumedState, fiveRailScenarios } from "./scenarios.js";

console.log("AEGIS-V FIVE-RAILS CONSERVED AUTHORITY DEMO");
console.log("Root authority: 100 USD");
console.log("Rails: bank, Ethereum, Solana, x402, MCP");
console.log("Verifier mode: local, tokenless, complete mediation required");
console.log("");

for (const scenario of fiveRailScenarios()) {
  const result = verify(scenario.effect, scenario.proof, scenario.policy, scenario.state);
  const ok = result.status === scenario.expected ? "PASS" : "FAIL";
  console.log(`${ok} | ${scenario.name}`);
  console.log(`     ${scenario.claim}`);
  console.log(`     result=${result.status} reason=${result.reason}`);
}

console.log("");
console.log("FINAL CONSERVATION REPORT");
console.log(conservationReport(consumedState));
console.log("");
console.log("Takeaway: accepted endpoints do not ask the AI what it is allowed to do.");
console.log("They verify one exact AEGIS proof against local policy and conserved authority state.");
