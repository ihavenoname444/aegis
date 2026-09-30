import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyTransition,
  conservationReport,
  createAuthorityState,
  Transition
} from "../src/authority-kernel.js";
import { runHostile10001Demo } from "../src/hostile-harness.js";

test("authority state machine conserves delegation, reserve, quarantine and consume", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 100 });

  let result = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:1",
    amount: 60
  });
  assert.equal(result.ok, true);
  state = result.state;
  assert.equal(conservationReport(state).conserved, true);

  result = applyTransition(state, {
    type: Transition.RESERVE,
    reservation_id: "reservation:1",
    obligation_id: "obligation:1",
    nullifier: "nullifier:1",
    holder_id: "agent:1",
    amount: 40,
    effect_id: "effect:1",
    execution_domain: "BANK_RAIL"
  });
  assert.equal(result.ok, true);
  state = result.state;
  assert.deepEqual(conservationReport(state), {
    root_authorized: 100,
    available: 60,
    reserved: 40,
    quarantined: 0,
    consumed: 0,
    released: 0,
    accounted: 100,
    conserved: true
  });

  result = applyTransition(state, {
    type: Transition.QUARANTINE,
    reservation_id: "reservation:1",
    reason: "NO_RECEIPT"
  });
  assert.equal(result.ok, true);
  state = result.state;
  assert.equal(conservationReport(state).quarantined, 40);

  result = applyTransition(state, {
    type: Transition.RESERVE,
    reservation_id: "reservation:extra",
    obligation_id: "obligation:extra",
    nullifier: "nullifier:extra",
    holder_id: "agent:1",
    amount: 21,
    effect_id: "effect:extra",
    execution_domain: "BANK_RAIL"
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "INSUFFICIENT_AVAILABLE");
  assert.equal(conservationReport(result.state).conserved, true);
});

test("same obligation cannot reserve across five rails", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 50 });
  state = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:1",
    amount: 50
  }).state;

  const domains = ["BANK_RAIL", "ETHEREUM", "SOLANA", "X402", "MCP"];
  const attempts = domains.map((domain) => {
    const result = applyTransition(state, {
      type: Transition.RESERVE,
      reservation_id: `reservation:${domain}`,
      obligation_id: "obligation:same",
      nullifier: "nullifier:same",
      holder_id: "agent:1",
      amount: 10,
      effect_id: "effect:same",
      execution_domain: domain
    });
    state = result.state;
    return result;
  });

  assert.equal(attempts.filter((attempt) => attempt.ok).length, 1);
  assert.equal(attempts.filter((attempt) => !attempt.ok).length, 4);
  assert.equal(attempts[1].reason, "OBLIGATION_ALREADY_BOUND");
  assert.equal(conservationReport(state).conserved, true);
});

test("reservation without a nullifier is rejected", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
  state = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:1",
    amount: 10
  }).state;

  const result = applyTransition(state, {
    type: Transition.RESERVE,
    reservation_id: "reservation:no-nullifier",
    obligation_id: "obligation:no-nullifier",
    holder_id: "agent:1",
    amount: 10,
    effect_id: "effect:no-nullifier",
    execution_domain: "BANK_RAIL"
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "INVALID_RESERVATION_BINDING");
  assert.equal(conservationReport(result.state).available, 10);
  assert.equal(conservationReport(result.state).reserved, 0);
  assert.equal(conservationReport(result.state).conserved, true);
});

test("reservation with blank binding fields is rejected", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
  state = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:1",
    amount: 10
  }).state;

  const result = applyTransition(state, {
    type: Transition.RESERVE,
    reservation_id: "reservation:blank-domain",
    obligation_id: "obligation:blank-domain",
    nullifier: "nullifier:blank-domain",
    holder_id: "agent:1",
    amount: 10,
    effect_id: "effect:blank-domain",
    execution_domain: " "
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "INVALID_RESERVATION_BINDING");
  assert.equal(conservationReport(result.state).reserved, 0);
  assert.equal(conservationReport(result.state).conserved, true);
});

test("return with mismatched reservation binding is rejected", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
  state = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:1",
    amount: 10
  }).state;
  state = applyTransition(state, {
    type: Transition.RESERVE,
    reservation_id: "reservation:return-mismatch",
    obligation_id: "obligation:return-mismatch",
    nullifier: "nullifier:return-mismatch",
    holder_id: "agent:1",
    amount: 10,
    effect_id: "effect:bank",
    execution_domain: "BANK_RAIL"
  }).state;

  const result = applyTransition(state, {
    type: Transition.RETURN,
    reservation_id: "reservation:return-mismatch",
    obligation_id: "obligation:evil",
    nullifier: "nullifier:evil",
    holder_id: "attacker",
    amount: 10,
    effect_id: "effect:ethereum",
    execution_domain: "ETHEREUM"
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "RESERVATION_BINDING_MISMATCH");
  assert.equal(conservationReport(result.state).available, 0);
  assert.equal(conservationReport(result.state).reserved, 10);
  assert.equal(conservationReport(result.state).conserved, true);
});

test("quarantined return with resolution proof still requires matching binding", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
  state = applyTransition(state, {
    type: Transition.RESERVE,
    reservation_id: "reservation:quarantine-mismatch",
    obligation_id: "obligation:quarantine-mismatch",
    nullifier: "nullifier:quarantine-mismatch",
    holder_id: "root",
    amount: 10,
    effect_id: "effect:bank",
    execution_domain: "BANK_RAIL"
  }).state;
  state = applyTransition(state, {
    type: Transition.QUARANTINE,
    reservation_id: "reservation:quarantine-mismatch",
    reason: "UNKNOWN_CONSEQUENCE"
  }).state;

  const result = applyTransition(state, {
    type: Transition.RETURN,
    reservation_id: "reservation:quarantine-mismatch",
    obligation_id: "obligation:quarantine-mismatch",
    nullifier: "nullifier:quarantine-mismatch",
    holder_id: "root",
    amount: 9,
    effect_id: "effect:bank",
    execution_domain: "BANK_RAIL",
    resolution_proof_id: "receipt-resolution:wrong-amount"
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "RESERVATION_BINDING_MISMATCH");
  assert.equal(conservationReport(result.state).quarantined, 10);
  assert.equal(conservationReport(result.state).available, 0);
  assert.equal(conservationReport(result.state).conserved, true);
});

test("stale base-sequence reserve proposal is rejected", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
  state = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:1",
    amount: 10
  }).state;

  const baseSequence = state.sequence;
  const first = applyTransition(state, {
    type: Transition.RESERVE,
    base_sequence: baseSequence,
    reservation_id: "reservation:first",
    obligation_id: "obligation:first",
    nullifier: "nullifier:first",
    holder_id: "agent:1",
    amount: 5,
    effect_id: "effect:first",
    execution_domain: "BANK_RAIL"
  });
  state = first.state;

  const second = applyTransition(state, {
    type: Transition.RESERVE,
    base_sequence: baseSequence,
    reservation_id: "reservation:stale",
    obligation_id: "obligation:stale",
    nullifier: "nullifier:stale",
    holder_id: "agent:1",
    amount: 5,
    effect_id: "effect:stale",
    execution_domain: "ETHEREUM"
  });

  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
  assert.equal(second.reason, "STALE_STATE");
  assert.equal(conservationReport(second.state).available, 5);
  assert.equal(conservationReport(second.state).reserved, 5);
  assert.equal(conservationReport(second.state).conserved, true);
});

test("non-integer base-sequence reserve proposal is rejected", () => {
  let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
  state = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:1",
    amount: 10
  }).state;

  const result = applyTransition(state, {
    type: Transition.RESERVE,
    base_sequence: String(state.sequence),
    reservation_id: "reservation:string-sequence",
    obligation_id: "obligation:string-sequence",
    nullifier: "nullifier:string-sequence",
    holder_id: "agent:1",
    amount: 5,
    effect_id: "effect:string-sequence",
    execution_domain: "BANK_RAIL"
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "STALE_STATE");
  assert.equal(conservationReport(result.state).reserved, 0);
  assert.equal(conservationReport(result.state).conserved, true);
});

test("failed proposal does not advance canonical authority sequence", () => {
  let state = createAuthorityState({
    root_id: "root",
    root_authorized: 10,
    require_base_sequence: true
  });

  const failed = applyTransition(state, {
    type: Transition.RESERVE,
    base_sequence: state.sequence,
    reservation_id: "reservation:too-large",
    obligation_id: "obligation:too-large",
    nullifier: "nullifier:too-large",
    holder_id: "root",
    amount: 11,
    effect_id: "effect:too-large",
    execution_domain: "BANK_RAIL"
  });
  state = failed.state;

  const valid = applyTransition(state, {
    type: Transition.RESERVE,
    base_sequence: 0,
    reservation_id: "reservation:valid-after-failed",
    obligation_id: "obligation:valid-after-failed",
    nullifier: "nullifier:valid-after-failed",
    holder_id: "root",
    amount: 10,
    effect_id: "effect:valid-after-failed",
    execution_domain: "BANK_RAIL"
  });

  assert.equal(failed.ok, false);
  assert.equal(failed.reason, "INSUFFICIENT_AVAILABLE");
  assert.equal(failed.state.sequence, 0);
  assert.equal(valid.ok, true);
  assert.equal(valid.state.sequence, 1);
  assert.equal(conservationReport(valid.state).reserved, 10);
  assert.equal(conservationReport(valid.state).conserved, true);
});

test("rejected attempts have unique monotonic audit order", () => {
  let state = createAuthorityState({
    root_id: "root",
    root_authorized: 10,
    require_base_sequence: true
  });

  const tooLarge = applyTransition(state, {
    type: Transition.RESERVE,
    base_sequence: 0,
    reservation_id: "reservation:audit-too-large",
    obligation_id: "obligation:audit-too-large",
    nullifier: "nullifier:audit-too-large",
    holder_id: "root",
    amount: 11,
    effect_id: "effect:audit-too-large",
    execution_domain: "BANK_RAIL"
  });
  state = tooLarge.state;

  const missingBase = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:audit-missing-base",
    amount: 1
  });
  state = missingBase.state;

  const valid = applyTransition(state, {
    type: Transition.DELEGATE,
    base_sequence: 0,
    from: "root",
    to: "agent:audit-valid",
    amount: 1
  });

  assert.equal(tooLarge.ok, false);
  assert.equal(missingBase.ok, false);
  assert.equal(valid.ok, true);
  assert.deepEqual(
    [tooLarge.entry.attempt_sequence, missingBase.entry.attempt_sequence, valid.entry.attempt_sequence],
    [1, 2, 3]
  );
  assert.deepEqual(
    [tooLarge.entry.sequence, missingBase.entry.sequence, valid.entry.sequence],
    [0, 0, 1]
  );
  assert.equal(valid.state.attempt_sequence, 3);
  assert.equal(valid.state.sequence, 1);
  assert.equal(conservationReport(valid.state).conserved, true);
});

test("sequenced authority state rejects authority-moving transition without base_sequence", () => {
  const state = createAuthorityState({
    root_id: "root",
    root_authorized: 10,
    require_base_sequence: true
  });

  const result = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:1",
    amount: 5
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "BASE_SEQUENCE_REQUIRED");
  assert.equal(conservationReport(result.state).available, 10);
  assert.equal(conservationReport(result.state).conserved, true);
});

test("missing base-sequence failure does not stale the next valid proposal", () => {
  let state = createAuthorityState({
    root_id: "root",
    root_authorized: 10,
    require_base_sequence: true
  });

  const missingBase = applyTransition(state, {
    type: Transition.DELEGATE,
    from: "root",
    to: "agent:missing-base",
    amount: 5
  });
  state = missingBase.state;

  const valid = applyTransition(state, {
    type: Transition.DELEGATE,
    base_sequence: 0,
    from: "root",
    to: "agent:valid-after-missing-base",
    amount: 5
  });

  assert.equal(missingBase.ok, false);
  assert.equal(missingBase.reason, "BASE_SEQUENCE_REQUIRED");
  assert.equal(missingBase.state.sequence, 0);
  assert.equal(valid.ok, true);
  assert.equal(valid.state.sequence, 1);
  assert.equal(conservationReport(valid.state).available, 10);
  assert.equal(conservationReport(valid.state).conserved, true);
});

test("sequenced authority state rejects reserve without base_sequence", () => {
  let state = createAuthorityState({
    root_id: "root",
    root_authorized: 10,
    require_base_sequence: true
  });
  state = applyTransition(state, {
    type: Transition.DELEGATE,
    base_sequence: state.sequence,
    from: "root",
    to: "agent:1",
    amount: 5
  }).state;

  const result = applyTransition(state, {
    type: Transition.RESERVE,
    reservation_id: "reservation:missing-base",
    obligation_id: "obligation:missing-base",
    nullifier: "nullifier:missing-base",
    holder_id: "agent:1",
    amount: 5,
    effect_id: "effect:missing-base",
    execution_domain: "BANK_RAIL"
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "BASE_SEQUENCE_REQUIRED");
  assert.equal(conservationReport(result.state).reserved, 0);
  assert.equal(conservationReport(result.state).conserved, true);
});

test("hostile 10000 to 10001 harness rejects amplification", () => {
  const demo = runHostile10001Demo();

  assert.equal(demo.child_count, 1_000);
  assert.equal(demo.root_authorized, 10_000);
  assert.equal(demo.requested_by_attacker, 10_001);
  assert.equal(demo.summary.conserved, true);
  assert.equal(demo.summary.accounted, 10_000);
  assert.equal(demo.summary.accepted_reserved_authority, 10_000);
  assert.equal(demo.summary.same_obligation_successes, 1);
  assert.equal(demo.summary.extra_10001_attempts_rejected, 2);
  assert.equal(demo.summary.proof_attacks_rejected, true);
  assert.deepEqual(demo.proof_attacks, [
    { attack: "stale-proof", status: "STALE", reason: "STALE_CHECKPOINT" },
    {
      attack: "old-capacity-certificate",
      status: "INVALID",
      reason: "CAPACITY_EPOCH_REJECTED"
    },
    { attack: "revoked-mandate-race", status: "INVALID", reason: "MANDATE_REVOKED" }
  ]);
  assert.equal(demo.final_report.available, 0);
  assert.equal(demo.final_report.quarantined, 10);
  assert.equal(demo.final_report.reserved, 9_990);
  assert.equal(demo.final_report.conserved, true);
  assert.ok(demo.results.every((result) => result.conserved_after));
  assert.ok(demo.results.every((result, index) => result.attempt_sequence === index + 1));
  assert.equal(demo.final_state.attempt_sequence, demo.results.length);
  assert.ok(demo.results.every((result) => result.sequence <= result.attempt_sequence));
});
