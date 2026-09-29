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
  assert.equal(demo.final_report.available, 0);
  assert.equal(demo.final_report.quarantined, 10);
  assert.equal(demo.final_report.reserved, 9_990);
  assert.equal(demo.final_report.conserved, true);
  assert.ok(demo.results.every((result) => result.conserved_after));
});
