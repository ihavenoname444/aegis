import { Reason, Status } from "./types.js";
import { effectMatchesProof, isNullifierSpent } from "./authority-kernel.js";
import { validateCapacityCertificate } from "./capacity-kernel.js";
import { consequencePolicy } from "./consequence-kernel.js";
import { evaluateRevocation } from "./revocation-policy.js";

export function verify(effect, proof, policy, state = defaultState()) {
  if (policy.accepted_network_id !== proof.network_id) {
    return invalid(Reason.NETWORK_REJECTED);
  }

  if (!policy.accepted_profile_versions.includes(proof.profile_version)) {
    return invalid(Reason.PROFILE_REJECTED);
  }

  if (!policy.accepted_kernel_hashes.includes(proof.kernel_code_hash)) {
    return invalid(Reason.KERNEL_REJECTED);
  }

  if (!policy.accepted_authority_schema_hashes.includes(proof.authority_schema_hash)) {
    return invalid(Reason.SCHEMA_REJECTED);
  }

  if (!policy.accepted_proof_versions.includes(proof.proof_version)) {
    return invalid(Reason.PROOF_VERSION_REJECTED);
  }

  if (!policy.accepted_evidence_classes.includes(proof.evidence_class)) {
    return invalid(Reason.EVIDENCE_CLASS_REJECTED);
  }

  if (policy.complete_mediation_required && proof.agent_has_bypass_credential) {
    return invalid(Reason.INCOMPLETE_MEDIATION);
  }

  if (!effectMatchesProof(effect, proof)) {
    return invalid(Reason.EFFECT_MISMATCH);
  }

  if (proof.expiry <= policy.now_ms) {
    return invalid(Reason.EXPIRED_PROOF);
  }

  if (policy.now_ms - proof.finalized_checkpoint.time_ms > policy.maximum_checkpoint_age_ms) {
    return { status: Status.STALE, reason: Reason.STALE_CHECKPOINT };
  }

  const revocation = evaluateRevocation(proof, policy, state);
  if (!revocation.ok) return { status: revocation.status, reason: revocation.reason };

  if (isNullifierSpent(proof, state)) {
    return invalid(Reason.NULLIFIER_SPENT);
  }

  const capacity = validateCapacityCertificate(proof, policy);
  if (!capacity.ok) return invalid(Reason[capacity.reason] ?? capacity.reason);

  const consequence = consequencePolicy(proof, policy);
  if (!consequence.ok) {
    return { status: Status.UNKNOWN, reason: Reason.CONSEQUENCE_UNKNOWN };
  }

  return { status: Status.VALID, reason: Reason.VALID };
}

function invalid(reason) {
  return { status: Status.INVALID, reason };
}

export function defaultState() {
  return {
    root_authorized: 100,
    live_delegated: 0,
    reserved: 100,
    quarantined: 0,
    consumed: 0,
    released: 0,
    spent_nullifiers: [],
    revoked_mandates: []
  };
}
