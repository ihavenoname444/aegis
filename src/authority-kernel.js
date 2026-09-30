export function effectMatchesProof(effect, proof) {
  const p = proof.effect;
  if (!p) return false;

  return p.effect_type === effect.effect_type
    && p.action === effect.action
    && p.recipient === effect.recipient
    && p.execution_domain === effect.execution_domain
    && p.asset === effect.asset
    && p.amount === effect.amount
    && p.parameters_commitment === effect.parameters_commitment;
}

export function isNullifierSpent(proof, state) {
  return state.spent_nullifiers.includes(proof.nullifier);
}

export function isMandateRevoked(proof, state) {
  return state.revoked_mandates.includes(proof.mandate_id);
}

export function conservationReport(state) {
  if (state.holders && state.reservations) {
    return stateMachineConservationReport(state);
  }

  const accounted = state.live_delegated
    + state.reserved
    + state.quarantined
    + state.consumed
    + state.released;

  return {
    root_authorized: state.root_authorized,
    accounted,
    conserved: accounted === state.root_authorized
  };
}

export const Transition = Object.freeze({
  DELEGATE: "DELEGATE",
  RESERVE: "RESERVE",
  CONSUME: "CONSUME",
  QUARANTINE: "QUARANTINE",
  RETURN: "RETURN",
  REVOKE_MANDATE: "REVOKE_MANDATE"
});

export const AuthorityReason = Object.freeze({
  OK: "OK",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  HOLDER_NOT_FOUND: "HOLDER_NOT_FOUND",
  INSUFFICIENT_AVAILABLE: "INSUFFICIENT_AVAILABLE",
  RESERVATION_EXISTS: "RESERVATION_EXISTS",
  RESERVATION_NOT_FOUND: "RESERVATION_NOT_FOUND",
  RESERVATION_NOT_ACTIVE: "RESERVATION_NOT_ACTIVE",
  INVALID_RESERVATION_BINDING: "INVALID_RESERVATION_BINDING",
  RESERVATION_BINDING_MISMATCH: "RESERVATION_BINDING_MISMATCH",
  BASE_SEQUENCE_REQUIRED: "BASE_SEQUENCE_REQUIRED",
  STALE_STATE: "STALE_STATE",
  OBLIGATION_ALREADY_BOUND: "OBLIGATION_ALREADY_BOUND",
  NULLIFIER_ALREADY_USED: "NULLIFIER_ALREADY_USED",
  RECEIPT_REQUIRED: "RECEIPT_REQUIRED",
  RESOLUTION_PROOF_REQUIRED: "RESOLUTION_PROOF_REQUIRED",
  UNKNOWN_TRANSITION: "UNKNOWN_TRANSITION"
});

export function createAuthorityState({ root_id = "root", root_authorized, require_base_sequence = false }) {
  if (!isPositiveAmount(root_authorized)) {
    throw new Error("root_authorized must be a positive integer");
  }

  return {
    root_id,
    root_authorized,
    holders: {
      [root_id]: {
        holder_id: root_id,
        parent_id: null,
        available: root_authorized
      }
    },
    reservations: {},
    obligations: {},
    nullifiers: {},
    revoked_mandates: [],
    spent_nullifiers: [],
    trace: [],
    sequence: 0,
    attempt_sequence: 0,
    require_base_sequence
  };
}

export function applyTransition(state, transition) {
  const next = cloneState(state);
  const baseSequenceReason = validateBaseSequence(next, transition);
  const result = baseSequenceReason === AuthorityReason.OK
    ? applyTransitionToClone(next, transition)
    : fail(baseSequenceReason);
  const sequence = result.ok ? next.sequence + 1 : next.sequence;
  const currentAttemptSequence = Number.isInteger(next.attempt_sequence)
    ? next.attempt_sequence
    : next.trace.length;
  const attempt_sequence = currentAttemptSequence + 1;
  const traceEntry = {
    attempt_sequence,
    sequence,
    transition: transition.type,
    ok: result.ok,
    reason: result.reason,
    id: transition.id ?? transition.reservation_id ?? transition.obligation_id ?? null,
    holder_id: transition.holder_id ?? transition.from ?? null,
    amount: transition.amount ?? null,
    execution_domain: transition.execution_domain ?? null,
    parallel_group: transition.parallel_group ?? null
  };

  next.sequence = sequence;
  next.attempt_sequence = attempt_sequence;
  next.trace.push(traceEntry);

  return {
    ok: result.ok,
    reason: result.reason,
    state: next,
    entry: traceEntry,
    report: conservationReport(next)
  };
}

export function applyTransitions(initialState, transitions) {
  let state = initialState;
  const results = [];

  for (const transition of transitions) {
    const result = applyTransition(state, transition);
    state = result.state;
    results.push(result);
  }

  return {
    state,
    results,
    report: conservationReport(state)
  };
}

function applyTransitionToClone(state, transition) {
  switch (transition.type) {
    case Transition.DELEGATE:
      return delegate(state, transition);
    case Transition.RESERVE:
      return reserve(state, transition);
    case Transition.CONSUME:
      return consume(state, transition);
    case Transition.QUARANTINE:
      return quarantine(state, transition);
    case Transition.RETURN:
      return returnAuthority(state, transition);
    case Transition.REVOKE_MANDATE:
      return revokeMandate(state, transition);
    default:
      return fail(AuthorityReason.UNKNOWN_TRANSITION);
  }
}

function delegate(state, transition) {
  const amount = transition.amount;
  if (!isPositiveAmount(amount)) return fail(AuthorityReason.INVALID_AMOUNT);

  const from = state.holders[transition.from];
  if (!from) return fail(AuthorityReason.HOLDER_NOT_FOUND);
  if (from.available < amount) return fail(AuthorityReason.INSUFFICIENT_AVAILABLE);

  from.available -= amount;
  const to = ensureHolder(state, transition.to, transition.from);
  to.available += amount;
  return ok();
}

function reserve(state, transition) {
  const amount = transition.amount;
  if (!isPositiveAmount(amount)) return fail(AuthorityReason.INVALID_AMOUNT);
  if (!hasValidReservationBinding(transition)) {
    return fail(AuthorityReason.INVALID_RESERVATION_BINDING);
  }

  const holder = state.holders[transition.holder_id];
  if (!holder) return fail(AuthorityReason.HOLDER_NOT_FOUND);
  if (state.reservations[transition.reservation_id]) return fail(AuthorityReason.RESERVATION_EXISTS);
  if (state.obligations[transition.obligation_id]) return fail(AuthorityReason.OBLIGATION_ALREADY_BOUND);
  if (state.nullifiers[transition.nullifier]) return fail(AuthorityReason.NULLIFIER_ALREADY_USED);
  if (holder.available < amount) return fail(AuthorityReason.INSUFFICIENT_AVAILABLE);

  holder.available -= amount;
  state.reservations[transition.reservation_id] = {
    reservation_id: transition.reservation_id,
    obligation_id: transition.obligation_id,
    nullifier: transition.nullifier,
    holder_id: transition.holder_id,
    amount,
    effect_id: transition.effect_id,
    execution_domain: transition.execution_domain,
    status: "RESERVED"
  };
  state.obligations[transition.obligation_id] = transition.reservation_id;
  state.nullifiers[transition.nullifier] = {
    reservation_id: transition.reservation_id,
    status: "RESERVED"
  };
  return ok();
}

function consume(state, transition) {
  const reservation = state.reservations[transition.reservation_id];
  if (!reservation) return fail(AuthorityReason.RESERVATION_NOT_FOUND);
  if (reservation.status !== "RESERVED") return fail(AuthorityReason.RESERVATION_NOT_ACTIVE);
  if (!transition.receipt_id) return fail(AuthorityReason.RECEIPT_REQUIRED);

  reservation.status = "CONSUMED";
  reservation.receipt_id = transition.receipt_id;
  state.nullifiers[reservation.nullifier].status = "SPENT";
  if (!state.spent_nullifiers.includes(reservation.nullifier)) {
    state.spent_nullifiers.push(reservation.nullifier);
  }
  return ok();
}

function quarantine(state, transition) {
  const reservation = state.reservations[transition.reservation_id];
  if (!reservation) return fail(AuthorityReason.RESERVATION_NOT_FOUND);
  if (reservation.status !== "RESERVED") return fail(AuthorityReason.RESERVATION_NOT_ACTIVE);

  reservation.status = "QUARANTINED";
  reservation.quarantine_reason = transition.reason ?? "UNKNOWN_CONSEQUENCE";
  state.nullifiers[reservation.nullifier].status = "QUARANTINED";
  return ok();
}

function returnAuthority(state, transition) {
  const reservation = state.reservations[transition.reservation_id];
  if (!reservation) return fail(AuthorityReason.RESERVATION_NOT_FOUND);
  if (!["RESERVED", "QUARANTINED"].includes(reservation.status)) {
    return fail(AuthorityReason.RESERVATION_NOT_ACTIVE);
  }
  if (!hasValidReturnBinding(transition)) {
    return fail(AuthorityReason.INVALID_RESERVATION_BINDING);
  }
  if (!returnBindingMatchesReservation(transition, reservation)) {
    return fail(AuthorityReason.RESERVATION_BINDING_MISMATCH);
  }
  if (reservation.status === "QUARANTINED" && !transition.resolution_proof_id) {
    return fail(AuthorityReason.RESOLUTION_PROOF_REQUIRED);
  }

  const holder = state.holders[reservation.holder_id];
  holder.available += reservation.amount;
  reservation.status = "RELEASED";
  state.nullifiers[reservation.nullifier].status = "RELEASED";
  return ok();
}

function revokeMandate(state, transition) {
  if (!state.revoked_mandates.includes(transition.mandate_id)) {
    state.revoked_mandates.push(transition.mandate_id);
  }
  return ok();
}

function ensureHolder(state, holderId, parentId) {
  if (!state.holders[holderId]) {
    state.holders[holderId] = {
      holder_id: holderId,
      parent_id: parentId,
      available: 0
    };
  }
  return state.holders[holderId];
}

function stateMachineConservationReport(state) {
  const available = sum(Object.values(state.holders).map((holder) => holder.available));
  const reservations = Object.values(state.reservations);
  const reserved = sumByStatus(reservations, "RESERVED");
  const quarantined = sumByStatus(reservations, "QUARANTINED");
  const consumed = sumByStatus(reservations, "CONSUMED");
  const released = sumByStatus(reservations, "RELEASED");
  const accounted = available + reserved + quarantined + consumed;

  return {
    root_authorized: state.root_authorized,
    available,
    reserved,
    quarantined,
    consumed,
    released,
    accounted,
    conserved: accounted === state.root_authorized
  };
}

function sumByStatus(reservations, status) {
  return sum(reservations
    .filter((reservation) => reservation.status === status)
    .map((reservation) => status === "RELEASED" ? 0 : reservation.amount));
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function ok() {
  return { ok: true, reason: AuthorityReason.OK };
}

function fail(reason) {
  return { ok: false, reason };
}

function isPositiveAmount(amount) {
  return Number.isInteger(amount) && amount > 0;
}

function hasValidReservationBinding(transition) {
  return [
    transition.reservation_id,
    transition.obligation_id,
    transition.nullifier,
    transition.holder_id,
    transition.effect_id,
    transition.execution_domain
  ].every(isNonEmptyString);
}

function hasValidReturnBinding(transition) {
  return [
    transition.reservation_id,
    transition.obligation_id,
    transition.nullifier,
    transition.holder_id,
    transition.effect_id,
    transition.execution_domain
  ].every(isNonEmptyString) && isPositiveAmount(transition.amount);
}

function returnBindingMatchesReservation(transition, reservation) {
  return transition.reservation_id === reservation.reservation_id
    && transition.obligation_id === reservation.obligation_id
    && transition.nullifier === reservation.nullifier
    && transition.holder_id === reservation.holder_id
    && transition.amount === reservation.amount
    && transition.effect_id === reservation.effect_id
    && transition.execution_domain === reservation.execution_domain;
}

function validateBaseSequence(state, transition) {
  if (!isAuthorityMovingTransition(transition.type)) return AuthorityReason.OK;
  if (transition.base_sequence === undefined) {
    return state.require_base_sequence ? AuthorityReason.BASE_SEQUENCE_REQUIRED : AuthorityReason.OK;
  }
  return Number.isInteger(transition.base_sequence) && transition.base_sequence === state.sequence
    ? AuthorityReason.OK
    : AuthorityReason.STALE_STATE;
}

function isAuthorityMovingTransition(type) {
  return Object.values(Transition).includes(type);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
