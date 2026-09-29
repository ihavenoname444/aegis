import { runHostile10001Demo } from "./hostile-harness.js";

const demo = runHostile10001Demo();
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(demo, null, 2));
  process.exit(0);
}

const report = demo.final_report;
const summary = demo.summary;

console.log("AEGIS-V HOSTILE AUTHORITY AMPLIFICATION DEMO");
console.log(`Root authority: ${demo.root_authorized}`);
console.log(`Attacker instruction: GET ${demo.requested_by_attacker}`);
console.log(`Child agents: ${demo.child_count}`);
console.log(`Execution domains: ${demo.domains.join(", ")}`);
console.log("");
console.log("MACHINE SUMMARY");
console.log(JSON.stringify(summary, null, 2));
console.log("");
console.log("FINAL CONSERVATION REPORT");
console.log(JSON.stringify(report, null, 2));
console.log("");
console.log("PROOF ATTACKS");
for (const attack of demo.proof_attacks) {
  console.log(`${attack.attack}: ${attack.status} ${attack.reason}`);
}
console.log("");
console.log("FAILED +1 ATTEMPTS");
for (const result of demo.results.filter((item) => item.parallel_group === "get-10001")) {
  console.log(`${result.id}: ok=${result.ok} reason=${result.reason}`);
}
console.log("");
console.log("TRACE SAMPLE");
for (const result of [
  ...demo.results.slice(0, 3),
  ...demo.results.filter((item) => item.parallel_group === "same-obligation-five-rails"),
  ...demo.results.slice(-3)
]) {
  console.log(JSON.stringify(result));
}
