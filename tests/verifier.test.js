import assert from "node:assert/strict";
import { test } from "node:test";
import { baseEffect, basePolicy, baseProof } from "../src/fixtures.js";
import { verify } from "../src/verifier.js";

test("valid exact effect with V-backed capacity certificate", () => {
  const result = verify(baseEffect, baseProof, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "VALID");
});

test("wrong recipient is invalid", () => {
  const result = verify({ ...baseEffect, recipient: "attacker.example" }, baseProof, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "EFFECT_MISMATCH");
});

test("replayed nullifier is invalid", () => {
  const result = verify(baseEffect, baseProof, basePolicy, {
    spent_nullifiers: ["nullifier:N1"],
    revoked_mandates: []
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "NULLIFIER_SPENT");
});

test("missing capacity certificate is invalid", () => {
  const result = verify(baseEffect, { ...baseProof, capacity_certificate: null }, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "CAPACITY_MISSING");
});

test("rejected network is invalid", () => {
  const result = verify(baseEffect, { ...baseProof, network_id: "wrong-network" }, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "NETWORK_REJECTED");
});

test("rejected proof version is invalid", () => {
  const result = verify(baseEffect, { ...baseProof, proof_version: "proof-v999" }, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "PROOF_VERSION_REJECTED");
});

test("bypass credential makes high-assurance proof invalid", () => {
  const result = verify(baseEffect, { ...baseProof, agent_has_bypass_credential: true }, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "INCOMPLETE_MEDIATION");
});

test("double-backed V capacity is invalid", () => {
  const proof = {
    ...baseProof,
    capacity_certificate: {
      ...baseProof.capacity_certificate,
      v_locked: 100,
      v_encumbered: 101
    }
  };
  const result = verify(baseEffect, proof, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "CAPACITY_DOUBLE_BACKED");
});

test("insufficient physical resource backing is invalid", () => {
  const proof = {
    ...baseProof,
    capacity_certificate: {
      ...baseProof.capacity_certificate,
      ram_committed_bytes: 1
    }
  };
  const result = verify(baseEffect, proof, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "PHYSICAL_RESOURCE_INSUFFICIENT");
});

test("rejected evidence class is invalid", () => {
  const result = verify(baseEffect, { ...baseProof, evidence_class: "D" }, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "EVIDENCE_CLASS_REJECTED");
});

test("revoked mandate is invalid", () => {
  const result = verify(baseEffect, baseProof, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: ["mandate:M1"]
  });
  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "MANDATE_REVOKED");
});

test("stale checkpoint returns STALE", () => {
  const proof = {
    ...baseProof,
    finalized_checkpoint: {
      ...baseProof.finalized_checkpoint,
      id: "checkpoint:old",
      time_ms: 1_000
    }
  };
  const result = verify(baseEffect, proof, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "STALE");
});

test("unknown consequence returns UNKNOWN", () => {
  const proof = {
    ...baseProof,
    consequence: { status: "UNKNOWN" }
  };
  const result = verify(baseEffect, proof, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: []
  });
  assert.equal(result.status, "UNKNOWN");
});
