import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyTransition,
  conservationReport,
  createAuthorityState,
  Transition
} from "../src/authority-kernel.js";

test("property: authority remains conserved across seeded random transition sequences", () => {
  for (let seed = 1; seed <= 60; seed += 1) {
    let rng = mulberry32(seed);
    let state = createAuthorityState({ root_id: "root", root_authorized: 250 });

    for (let step = 0; step < 120; step += 1) {
      const transition = randomTransition(state, rng, seed, step);
      const result = applyTransition(state, transition);
      state = result.state;

      assert.equal(
        conservationReport(state).conserved,
        true,
        `seed=${seed} step=${step} transition=${transition.type} reason=${result.reason}`
      );
      assertAuthorityShape(state);
    }
  }
});

test("interleaving: same obligation race accepts at most one rail in every ordering", () => {
  const attempts = ["BANK_RAIL", "ETHEREUM", "SOLANA", "X402", "MCP"].map((domain) => ({
    type: Transition.RESERVE,
    reservation_id: `reservation:${domain}`,
    obligation_id: "obligation:same",
    nullifier: "nullifier:same",
    holder_id: "agent:1",
    amount: 10,
    effect_id: "effect:same",
    execution_domain: domain
  }));

  for (const ordering of permutations(attempts)) {
    let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
    state = applyTransition(state, {
      type: Transition.DELEGATE,
      from: "root",
      to: "agent:1",
      amount: 10
    }).state;

    const results = ordering.map((transition) => {
      const result = applyTransition(state, transition);
      state = result.state;
      return result;
    });

    assert.equal(results.filter((result) => result.ok).length, 1);
    assert.equal(conservationReport(state).accounted, 10);
    assert.equal(conservationReport(state).conserved, true);
  }
});

test("interleaving: distinct obligations racing for same funds cannot overspend holder balance", () => {
  const attempts = ["A", "B", "C", "D"].map((label) => ({
    type: Transition.RESERVE,
    reservation_id: `reservation:${label}`,
    obligation_id: `obligation:${label}`,
    nullifier: `nullifier:${label}`,
    holder_id: "agent:1",
    amount: 10,
    effect_id: `effect:${label}`,
    execution_domain: "BANK_RAIL"
  }));

  for (const ordering of permutations(attempts)) {
    let state = createAuthorityState({ root_id: "root", root_authorized: 10 });
    state = applyTransition(state, {
      type: Transition.DELEGATE,
      from: "root",
      to: "agent:1",
      amount: 10
    }).state;

    const results = ordering.map((transition) => {
      const result = applyTransition(state, transition);
      state = result.state;
      return result;
    });

    assert.equal(results.filter((result) => result.ok).length, 1);
    assert.equal(conservationReport(state).available, 0);
    assert.equal(conservationReport(state).reserved, 10);
    assert.equal(conservationReport(state).conserved, true);
  }
});

function randomTransition(state, rng, seed, step) {
  const roll = rng();
  if (roll < 0.35) return randomDelegate(state, rng, seed, step);
  if (roll < 0.70) return randomReserve(state, rng, seed, step);
  if (roll < 0.80) return randomConsume(state, rng, seed, step);
  if (roll < 0.90) return randomQuarantine(state, rng, seed, step);
  return randomReturn(state, rng, seed, step);
}

function randomDelegate(state, rng, seed, step) {
  const holders = Object.values(state.holders);
  const from = pick(holders, rng);
  const amount = randomInt(rng, 1, Math.max(1, from.available + 5));
  return {
    type: Transition.DELEGATE,
    from: from.holder_id,
    to: `agent:${seed}:${step}:${randomInt(rng, 1, 20)}`,
    amount
  };
}

function randomReserve(state, rng, seed, step) {
  const holders = Object.values(state.holders);
  const holder = pick(holders, rng);
  const duplicate = rng() < 0.18 && Object.values(state.reservations).length > 0;
  const existing = duplicate ? pick(Object.values(state.reservations), rng) : null;
  const id = `${seed}:${step}:${randomInt(rng, 1, 1_000_000)}`;
  return {
    type: Transition.RESERVE,
    reservation_id: existing && rng() < 0.33 ? existing.reservation_id : `reservation:${id}`,
    obligation_id: existing && rng() < 0.50 ? existing.obligation_id : `obligation:${id}`,
    nullifier: existing && rng() < 0.50 ? existing.nullifier : `nullifier:${id}`,
    holder_id: holder.holder_id,
    amount: randomInt(rng, 1, Math.max(1, holder.available + 5)),
    effect_id: `effect:${id}`,
    execution_domain: pick(["BANK_RAIL", "ETHEREUM", "SOLANA", "X402", "MCP"], rng)
  };
}

function randomConsume(state, rng, seed, step) {
  const reservation = randomReservation(state, rng);
  return {
    type: Transition.CONSUME,
    reservation_id: reservation?.reservation_id ?? `missing:${seed}:${step}`,
    receipt_id: rng() < 0.15 ? null : `receipt:${seed}:${step}`
  };
}

function randomQuarantine(state, rng, seed, step) {
  const reservation = randomReservation(state, rng);
  return {
    type: Transition.QUARANTINE,
    reservation_id: reservation?.reservation_id ?? `missing:${seed}:${step}`,
    reason: "FUZZ_UNKNOWN"
  };
}

function randomReturn(state, rng, seed, step) {
  const reservation = randomReservation(state, rng);
  return {
    type: Transition.RETURN,
    reservation_id: reservation?.reservation_id ?? `missing:${seed}:${step}`
  };
}

function randomReservation(state, rng) {
  const reservations = Object.values(state.reservations);
  if (reservations.length === 0) return null;
  return pick(reservations, rng);
}

function assertAuthorityShape(state) {
  for (const holder of Object.values(state.holders)) {
    assert.ok(Number.isInteger(holder.available));
    assert.ok(holder.available >= 0, `holder ${holder.holder_id} went negative`);
  }

  for (const reservation of Object.values(state.reservations)) {
    assert.ok(Number.isInteger(reservation.amount));
    assert.ok(reservation.amount > 0);
    assert.equal(
      state.obligations[reservation.obligation_id],
      reservation.reservation_id,
      `obligation mapping broken for ${reservation.obligation_id}`
    );
    assert.equal(
      state.nullifiers[reservation.nullifier].reservation_id,
      reservation.reservation_id,
      `nullifier mapping broken for ${reservation.nullifier}`
    );
  }
}

function permutations(items) {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) => (
    permutations([...items.slice(0, index), ...items.slice(index + 1)])
      .map((rest) => [item, ...rest])
  ));
}

function pick(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function mulberry32(seed) {
  return function next() {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
