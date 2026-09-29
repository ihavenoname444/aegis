import {
  applyTransition,
  conservationReport,
  createAuthorityState,
  Transition
} from "./authority-kernel.js";
import { baseEffect, basePolicy, baseProof } from "./fixtures.js";
import { verify } from "./verifier.js";

const DOMAINS = Object.freeze(["BANK_RAIL", "ETHEREUM", "SOLANA", "X402", "MCP"]);
const ROOT_ID = "institution:root";
const CHILD_COUNT = 1_000;
const CHILD_AMOUNT = 10;
const ROOT_AUTHORIZED = CHILD_COUNT * CHILD_AMOUNT;

export function runHostile10001Demo() {
  let state = createAuthorityState({
    root_id: ROOT_ID,
    root_authorized: ROOT_AUTHORIZED
  });
  const results = [];

  for (let index = 0; index < CHILD_COUNT; index += 1) {
    ({ state } = run(state, results, {
      type: Transition.DELEGATE,
      id: `delegate:${index}`,
      from: ROOT_ID,
      to: childId(index),
      amount: CHILD_AMOUNT
    }));
  }

  for (const domain of DOMAINS) {
    ({ state } = run(state, results, {
      type: Transition.RESERVE,
      id: `parallel-replay:${domain}`,
      reservation_id: `reservation:replay:${domain}`,
      obligation_id: "obligation:same-economic-effect",
      nullifier: "nullifier:same-economic-effect",
      holder_id: childId(0),
      amount: CHILD_AMOUNT,
      effect_id: "effect:merchant-invoice-10001",
      execution_domain: domain,
      parallel_group: "same-obligation-five-rails"
    }));
  }

  ({ state } = run(state, results, {
    type: Transition.QUARANTINE,
    id: "timeout-lost-receipt",
    reservation_id: "reservation:replay:BANK_RAIL",
    reason: "TIMEOUT_LOST_RECEIPT"
  }));

  for (let index = 1; index < CHILD_COUNT; index += 1) {
    const domain = DOMAINS[index % DOMAINS.length];
    ({ state } = run(state, results, {
      type: Transition.RESERVE,
      id: `exhaust:${index}`,
      reservation_id: `reservation:exhaust:${index}`,
      obligation_id: `obligation:exhaust:${index}`,
      nullifier: `nullifier:exhaust:${index}`,
      holder_id: childId(index),
      amount: CHILD_AMOUNT,
      effect_id: `effect:exhaust:${index}`,
      execution_domain: domain,
      parallel_group: "parallel-exhaustion"
    }));
  }

  ({ state } = run(state, results, {
    type: Transition.RESERVE,
    id: "attacker-extra-one",
    reservation_id: "reservation:attacker-extra-one",
    obligation_id: "obligation:attacker-extra-one",
    nullifier: "nullifier:attacker-extra-one",
    holder_id: ROOT_ID,
    amount: 1,
    effect_id: "effect:get-10001",
    execution_domain: "BANK_RAIL",
    parallel_group: "get-10001"
  }));

  ({ state } = run(state, results, {
    type: Transition.RESERVE,
    id: "attacker-child-extra-one",
    reservation_id: "reservation:attacker-child-extra-one",
    obligation_id: "obligation:attacker-child-extra-one",
    nullifier: "nullifier:attacker-child-extra-one",
    holder_id: childId(999),
    amount: 1,
    effect_id: "effect:get-10001",
    execution_domain: "ETHEREUM",
    parallel_group: "get-10001"
  }));

  const proofAttacks = runProofAttacks();
  const report = conservationReport(state);

  return {
    name: "hostile-10000-to-10001",
    root_authorized: ROOT_AUTHORIZED,
    requested_by_attacker: ROOT_AUTHORIZED + 1,
    child_count: CHILD_COUNT,
    domains: DOMAINS,
    results,
    proof_attacks: proofAttacks,
    final_state: state,
    final_report: report,
    summary: summarize(results, proofAttacks, report)
  };
}

function run(state, results, transition) {
  const result = applyTransition(state, transition);
  results.push({
    sequence: result.entry.sequence,
    transition: result.entry.transition,
    id: result.entry.id,
    ok: result.ok,
    reason: result.reason,
    holder_id: result.entry.holder_id,
    amount: result.entry.amount,
    execution_domain: result.entry.execution_domain,
    parallel_group: result.entry.parallel_group,
    conserved_after: result.report.conserved
  });
  return result;
}

function runProofAttacks() {
  const stale = verify(baseEffect, {
    ...baseProof,
    finalized_checkpoint: { id: "checkpoint:stale", time_ms: 1_000 }
  }, basePolicy, { spent_nullifiers: [], revoked_mandates: [] });

  const oldCapacity = verify(baseEffect, {
    ...baseProof,
    capacity_certificate: {
      ...baseProof.capacity_certificate,
      capacity_epoch: "OLD-CAPACITY-EPOCH"
    }
  }, basePolicy, { spent_nullifiers: [], revoked_mandates: [] });

  const revoked = verify(baseEffect, baseProof, basePolicy, {
    spent_nullifiers: [],
    revoked_mandates: [baseProof.mandate_id]
  });

  return [
    { attack: "stale-proof", status: stale.status, reason: stale.reason },
    { attack: "old-capacity-certificate", status: oldCapacity.status, reason: oldCapacity.reason },
    { attack: "revoked-mandate-race", status: revoked.status, reason: revoked.reason }
  ];
}

function summarize(results, proofAttacks, report) {
  const successfulReservations = results.filter((result) => (
    result.transition === Transition.RESERVE && result.ok
  ));
  const failedReservations = results.filter((result) => (
    result.transition === Transition.RESERVE && !result.ok
  ));
  const sameObligationSuccesses = successfulReservations.filter((result) => (
    result.parallel_group === "same-obligation-five-rails"
  ));
  const extraAttempts = failedReservations.filter((result) => (
    result.parallel_group === "get-10001"
  ));

  return {
    conserved: report.conserved,
    accounted: report.accounted,
    root_authorized: report.root_authorized,
    accepted_reserved_authority: report.reserved + report.quarantined + report.consumed,
    successful_reservations: successfulReservations.length,
    failed_reservations: failedReservations.length,
    same_obligation_successes: sameObligationSuccesses.length,
    extra_10001_attempts_rejected: extraAttempts.length,
    proof_attacks_rejected: proofAttacks.every((attack) => attack.status !== "VALID")
  };
}

function childId(index) {
  return `agent:${String(index).padStart(4, "0")}`;
}
