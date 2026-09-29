import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyTransition,
  createAuthorityState,
  Transition
} from "../src/authority-kernel.js";
import {
  capacityLedgerReport,
  createCapacityLedger,
  issueCapacityCertificate,
  registerCapacityProvider
} from "../src/capacity-kernel.js";
import { baseEffect, basePolicy, baseProof } from "../src/fixtures.js";
import { verify } from "../src/verifier.js";

test("BP coalition deployed H2 is rejected by verifier pinned to H1", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    kernel_code_hash: "kernel:H2",
    kernel_abi_hash: "abi:A2"
  }, basePolicy, cleanState());

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "KERNEL_REJECTED");
});

test("governance-approved H2 with valid finality is still rejected outside accepted profile", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    kernel_code_hash: "kernel:H2",
    finalized_checkpoint: {
      ...baseProof.finalized_checkpoint,
      finality_rule: "SAVANNA_F1",
      kernel_code_hash: "kernel:H2"
    }
  }, basePolicy, cleanState());

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "KERNEL_REJECTED");
});

test("finalized malicious H2 state is rejected even when proof claims H1", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    finalized_checkpoint: {
      ...baseProof.finalized_checkpoint,
      finality_rule: "SAVANNA_F1",
      kernel_code_hash: "kernel:H2"
    }
  }, basePolicy, cleanState());

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "FINALIZED_KERNEL_REJECTED");
});

test("kernel ABI mutation is rejected even when kernel code hash matches", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    kernel_abi_hash: "abi:governance-mutated"
  }, basePolicy, cleanState());

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "KERNEL_ABI_REJECTED");
});

test("governance cannot redirect the canonical kernel account pointer", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    kernel_account: "aegis.h2"
  }, basePolicy, cleanState());

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "KERNEL_ACCOUNT_REJECTED");
});

test("governance cannot silently mutate verifier profile hash", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    verifier_profile_hash: "profile:weaker-latest"
  }, basePolicy, cleanState());

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "PROFILE_HASH_REJECTED");
});

test("governance cannot silently replace the accepted finality rule", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    finalized_checkpoint: {
      ...baseProof.finalized_checkpoint,
      finality_rule: "SAVANNA_F2"
    }
  }, basePolicy, cleanState());

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "FINALITY_RULE_REJECTED");
});

test("governance capacity epoch C4 is rejected by verifier pinned to C1", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    capacity_certificate: {
      ...baseProof.capacity_certificate,
      capacity_epoch: "C4",
      acu_limit: 10_000,
      active_acu: 100
    }
  }, basePolicy, cleanState());

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "CAPACITY_EPOCH_REJECTED");
});

test("same V cannot back old and new capacity epochs simultaneously", () => {
  let ledger = createCapacityLedger();
  ledger = registerCapacityProvider(ledger, {
    provider_id: "provider:gov-capture",
    capacity_asset: "V",
    v_locked: 100,
    ram_committed_bytes: 2_000,
    acu_limit: 2_000
  }).ledger;

  ledger = issueCapacityCertificate(ledger, {
    certificate_id: "cert:C1",
    provider_id: "provider:gov-capture",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 100,
    ram_committed_bytes: 1_000,
    active_acu: 100
  }).ledger;

  const result = issueCapacityCertificate(ledger, {
    certificate_id: "cert:C4",
    provider_id: "provider:gov-capture",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C4",
    unique_v_encumbrance: true,
    v_encumbered: 1,
    ram_committed_bytes: 1,
    active_acu: 1
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "CAPACITY_DOUBLE_BACKED");
  assert.equal(capacityLedgerReport(result.ledger).conserved, true);
});

test("admin override cannot bypass a spent nullifier", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    admin_override_authority_state: true
  }, basePolicy, {
    spent_nullifiers: ["nullifier:N1"],
    revoked_mandates: []
  });

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "ADMIN_OVERRIDE_REJECTED");
});

test("admin cannot release quarantined authority without resolution proof", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
  state = applyTransition(state, {
    type: Transition.RESERVE,
    reservation_id: "reservation:q",
    obligation_id: "obligation:q",
    nullifier: "nullifier:q",
    holder_id: "root",
    amount: 10,
    effect_id: "effect:q",
    execution_domain: "BANK_RAIL"
  }).state;
  state = applyTransition(state, {
    type: Transition.QUARANTINE,
    reservation_id: "reservation:q",
    reason: "UNKNOWN_CONSEQUENCE"
  }).state;

  const result = applyTransition(state, {
    type: Transition.RETURN,
    reservation_id: "reservation:q",
    admin_override: true
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "RESOLUTION_PROOF_REQUIRED");
});

test("quarantined authority can release only with resolution proof", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
  state = applyTransition(state, {
    type: Transition.RESERVE,
    reservation_id: "reservation:q2",
    obligation_id: "obligation:q2",
    nullifier: "nullifier:q2",
    holder_id: "root",
    amount: 10,
    effect_id: "effect:q2",
    execution_domain: "BANK_RAIL"
  }).state;
  state = applyTransition(state, {
    type: Transition.QUARANTINE,
    reservation_id: "reservation:q2",
    reason: "UNKNOWN_CONSEQUENCE"
  }).state;

  const result = applyTransition(state, {
    type: Transition.RETURN,
    reservation_id: "reservation:q2",
    resolution_proof_id: "receipt-resolution:1"
  });

  assert.equal(result.ok, true);
});

test("old and new kernel race cannot make pinned verifier accept H2", () => {
  const h1 = verify(baseEffect, baseProof, basePolicy, cleanState());
  const h2 = verify(baseEffect, {
    ...baseProof,
    reservation_id: "reservation:H2-reuse",
    kernel_code_hash: "kernel:H2",
    kernel_abi_hash: "abi:A2"
  }, basePolicy, cleanState());

  assert.equal(h1.status, "VALID");
  assert.equal(h2.status, "INVALID");
  assert.equal(h2.reason, "KERNEL_REJECTED");
});

function cleanState() {
  return {
    spent_nullifiers: [],
    revoked_mandates: []
  };
}
