import { basePolicy } from "./fixtures.js";
import {
  evaluateInstitutionalPolicy,
  InstitutionalProfile
} from "./institutional-profiles.js";

const centralBankPolicy = {
  ...basePolicy,
  accepted_evidence_classes: ["A"],
  maximum_checkpoint_age_ms: 1_000,
  revocation_profile: "ONLINE_HIGH_ASSURANCE"
};

const advisoryPolicy = {
  ...basePolicy,
  canonical_authority_state_required: false,
  complete_mediation_required: false,
  accepted_capacity_asset: "USDC",
  unknown_consequence: "ALLOW"
};

const scenarios = [
  {
    name: "tier-1 bank high-value policy",
    profile: InstitutionalProfile.TIER1_BANK_HIGH_VALUE,
    policy: basePolicy
  },
  {
    name: "central-bank systemic policy",
    profile: InstitutionalProfile.CENTRAL_BANK_SYSTEMIC,
    policy: centralBankPolicy
  },
  {
    name: "advisory AI policy trying to look high-assurance",
    profile: InstitutionalProfile.TIER1_BANK_HIGH_VALUE,
    policy: advisoryPolicy
  }
];

console.log("AEGIS-V INSTITUTIONAL READINESS DEMO");
console.log("Question: can this verifier policy support autonomous high-value execution?");
console.log("");

for (const scenario of scenarios) {
  const result = evaluateInstitutionalPolicy(scenario.policy, scenario.profile);
  console.log(`${scenario.name}: ${result.ok ? "PASS" : "FAIL"}`);
  console.log(`  profile=${scenario.profile}`);
  console.log(`  failed=${result.failed.length ? result.failed.join(", ") : "none"}`);
}

console.log("");
console.log("Takeaway: institutions do not need to trust an AI agent's intent.");
console.log("They can require a local policy profile that pins authority, finality,");
console.log("capacity, revocation, mediation and fail-closed behavior before execution.");
