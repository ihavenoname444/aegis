import { baseEffect, basePolicy, baseProof } from "./fixtures.js";
import { verify } from "./verifier.js";

const cleanState = Object.freeze({
  spent_nullifiers: [],
  revoked_mandates: []
});

const scenarios = [
  {
    name: "accepted proof with canonical state",
    proof: baseProof,
    state: cleanState
  },
  {
    name: "missing canonical authority state",
    proof: baseProof,
    state: undefined
  },
  {
    name: "remove V",
    proof: {
      ...baseProof,
      capacity_certificate: {
        ...baseProof.capacity_certificate,
        v_locked: 0,
        v_encumbered: 0
      }
    },
    state: cleanState
  },
  ...["A", "WRAM", "USDC", "BTC", "TOKEN_X"].map((capacityAsset) => ({
    name: `substitute ${capacityAsset}`,
    proof: {
      ...baseProof,
      capacity_certificate: {
        ...baseProof.capacity_certificate,
        capacity_asset: capacityAsset
      }
    },
    state: cleanState
  })),
  {
    name: "no unique V encumbrance",
    proof: {
      ...baseProof,
      capacity_certificate: {
        ...baseProof.capacity_certificate,
        unique_v_encumbrance: false
      }
    },
    state: cleanState
  },
  {
    name: "generic token gate profile",
    proof: {
      ...baseProof,
      capacity_certificate: {
        ...baseProof.capacity_certificate,
        capacity_profile: "GENERIC_TOKEN_GATE"
      }
    },
    state: cleanState
  }
];

console.log("AEGIS-V MANDATORY DEPENDENCY DEMO");
console.log("Guarantee: global conserved authority across participating domains");
console.log("Policy: no valid high-assurance proof => no autonomous high-value execution");
console.log("");

for (const scenario of scenarios) {
  const result = verify(baseEffect, scenario.proof, basePolicy, scenario.state);
  console.log(`${scenario.name}: ${result.status} ${result.reason}`);
}

console.log("");
console.log("Takeaway: execution can still occur outside AEGIS-V, but it loses the accepted proof");
console.log("that authority has not already been delegated, reserved, consumed, revoked or");
console.log("quarantined elsewhere across participating domains.");
