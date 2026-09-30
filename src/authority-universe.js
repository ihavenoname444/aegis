import { Reason, Status } from "./types.js";

export function validateAuthorityUniverse(proof, policy, state) {
  if (policy.authority_non_equivocation_required !== true) {
    return valid();
  }

  if (!proof.authority_universe_id
    || proof.authority_universe_id !== policy.accepted_authority_universe_id) {
    return invalid(Reason.AUTHORITY_UNIVERSE_REJECTED);
  }

  if (!proof.global_authority_root_id
    || proof.global_authority_root_id !== policy.accepted_global_authority_root_id) {
    return invalid(Reason.GLOBAL_AUTHORITY_ROOT_REJECTED);
  }

  const checkpoint = proof.finalized_checkpoint;
  if (!checkpoint?.id || !checkpoint.authority_state_root) {
    return invalid(Reason.AUTHORITY_CHECKPOINT_REQUIRED);
  }

  if (checkpoint.authority_universe_id
    && checkpoint.authority_universe_id !== proof.authority_universe_id) {
    return invalid(Reason.AUTHORITY_UNIVERSE_REJECTED);
  }

  if (checkpoint.global_authority_root_id
    && checkpoint.global_authority_root_id !== proof.global_authority_root_id) {
    return invalid(Reason.GLOBAL_AUTHORITY_ROOT_REJECTED);
  }

  const acceptedRoots = policy.accepted_authority_state_roots ?? [];
  const acceptedCheckpoints = policy.accepted_authority_checkpoints ?? {};
  if (acceptedRoots.length === 0 && Object.keys(acceptedCheckpoints).length === 0) {
    return invalid(Reason.AUTHORITY_CHECKPOINT_REJECTED);
  }

  if (acceptedRoots.length && !acceptedRoots.includes(checkpoint.authority_state_root)) {
    return invalid(Reason.AUTHORITY_CHECKPOINT_REJECTED);
  }

  const acceptedRoot = checkpointRoot(acceptedCheckpoints[checkpoint.id]);
  if (acceptedRoot && acceptedRoot !== checkpoint.authority_state_root) {
    return invalid(Reason.AUTHORITY_CHECKPOINT_REJECTED);
  }

  if (hasEquivocatedCheckpoint(checkpoint, state)) {
    return invalid(Reason.AUTHORITY_HISTORY_EQUIVOCATED);
  }

  return valid();
}

function hasEquivocatedCheckpoint(candidate, state) {
  const accepted = [
    ...checkpointRecords(state?.accepted_authority_checkpoints),
    ...checkpointRecords(state?.accepted_checkpoints)
  ];

  return accepted.some((checkpoint) => conflicts(candidate, checkpoint));
}

function conflicts(candidate, checkpoint) {
  if (!checkpoint?.authority_state_root) return false;

  const sameUniverse = sameOrUnspecified(
    candidate.authority_universe_id,
    checkpoint.authority_universe_id
  );
  const sameRoot = sameOrUnspecified(
    candidate.global_authority_root_id,
    checkpoint.global_authority_root_id
  );

  if (!sameUniverse || !sameRoot) return false;

  if (checkpoint.id === candidate.id) {
    return checkpoint.authority_state_root !== candidate.authority_state_root;
  }

  if (Number.isInteger(candidate.sequence)
    && Number.isInteger(checkpoint.sequence)
    && checkpoint.sequence === candidate.sequence) {
    return checkpoint.authority_state_root !== candidate.authority_state_root;
  }

  return false;
}

function checkpointRecords(source) {
  if (!source) return [];
  if (Array.isArray(source)) return source.map(normalizeCheckpoint);
  return Object.entries(source).map(([id, value]) => {
    if (typeof value === "string") {
      return { id, authority_state_root: value };
    }
    return normalizeCheckpoint({ id, ...value });
  });
}

function checkpointRoot(checkpoint) {
  if (!checkpoint) return null;
  if (typeof checkpoint === "string") return checkpoint;
  return checkpoint.authority_state_root;
}

function normalizeCheckpoint(checkpoint) {
  if (!checkpoint) return {};
  if (typeof checkpoint === "string") return { authority_state_root: checkpoint };
  return checkpoint;
}

function sameOrUnspecified(a, b) {
  return !a || !b || a === b;
}

function valid() {
  return { ok: true, status: Status.VALID, reason: Reason.VALID };
}

function invalid(reason) {
  return { ok: false, status: Status.INVALID, reason };
}
