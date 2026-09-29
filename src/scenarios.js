import { baseEffect, basePolicy, baseProof } from "./fixtures.js";

export const cleanState = Object.freeze({
  root_authorized: 100,
  live_delegated: 0,
  reserved: 100,
  quarantined: 0,
  consumed: 0,
  released: 0,
  spent_nullifiers: [],
  revoked_mandates: []
});

export const consumedState = Object.freeze({
  root_authorized: 100,
  live_delegated: 0,
  reserved: 0,
  quarantined: 0,
  consumed: 100,
  released: 0,
  spent_nullifiers: ["nullifier:N1"],
  revoked_mandates: []
});

export function fiveRailScenarios() {
  return [
    {
      name: "01 bank payment exact proof",
      claim: "Exact effect with accepted V-backed capacity validates",
      effect: baseEffect,
      proof: baseProof,
      policy: basePolicy,
      state: cleanState,
      expected: "VALID"
    },
    {
      name: "02 ethereum replay after bank consume",
      claim: "Same nullifier cannot be reused on another rail",
      effect: baseEffect,
      proof: baseProof,
      policy: basePolicy,
      state: consumedState,
      expected: "INVALID"
    },
    {
      name: "03 solana wrong execution domain",
      claim: "Proof bound to BANK_RAIL cannot authorize SOLANA",
      effect: { ...baseEffect, execution_domain: "SOLANA" },
      proof: baseProof,
      policy: basePolicy,
      state: cleanState,
      expected: "INVALID"
    },
    {
      name: "04 wrong recipient",
      claim: "Changing beneficiary invalidates the proof",
      effect: { ...baseEffect, recipient: "attacker.example" },
      proof: baseProof,
      policy: basePolicy,
      state: cleanState,
      expected: "INVALID"
    },
    {
      name: "05 stale checkpoint",
      claim: "Verifier sovereignty enforces freshness",
      effect: baseEffect,
      proof: { ...baseProof, finalized_checkpoint: { id: "checkpoint:old", time_ms: 1_000 } },
      policy: basePolicy,
      state: cleanState,
      expected: "STALE"
    },
    {
      name: "06 no V-backed capacity certificate",
      claim: "A + RAM-like data is not enough for high-assurance admission",
      effect: baseEffect,
      proof: { ...baseProof, capacity_certificate: null },
      policy: basePolicy,
      state: cleanState,
      expected: "INVALID"
    },
    {
      name: "07 double-backed V capacity",
      claim: "Same V capacity cannot back more live certificates than locked",
      effect: baseEffect,
      proof: {
        ...baseProof,
        capacity_certificate: {
          ...baseProof.capacity_certificate,
          v_locked: 100,
          v_encumbered: 101
        }
      },
      policy: basePolicy,
      state: cleanState,
      expected: "INVALID"
    },
    {
      name: "08 insufficient physical state resource",
      claim: "V cannot substitute for RAM/WRAM physical backing",
      effect: baseEffect,
      proof: {
        ...baseProof,
        capacity_certificate: {
          ...baseProof.capacity_certificate,
          ram_committed_bytes: 1
        }
      },
      policy: basePolicy,
      state: cleanState,
      expected: "INVALID"
    },
    {
      name: "09 agent holds bypass credential",
      claim: "Without complete mediation the integration is advisory only",
      effect: baseEffect,
      proof: { ...baseProof, agent_has_bypass_credential: true },
      policy: basePolicy,
      state: cleanState,
      expected: "INVALID"
    },
    {
      name: "10 revoked mandate",
      claim: "Authority cannot resurrect after revocation",
      effect: baseEffect,
      proof: baseProof,
      policy: basePolicy,
      state: { ...cleanState, revoked_mandates: ["mandate:M1"] },
      expected: "INVALID"
    },
    {
      name: "11 missing consequence receipt",
      claim: "No receipt is not proof of failure; unresolved consequence quarantines",
      effect: baseEffect,
      proof: { ...baseProof, consequence: { status: "UNKNOWN" } },
      policy: basePolicy,
      state: cleanState,
      expected: "UNKNOWN"
    }
  ];
}

