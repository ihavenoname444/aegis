import { Reason, Status } from "./types.js";

export const RevocationMode = Object.freeze({
  ONLINE_HIGH_ASSURANCE: "ONLINE_HIGH_ASSURANCE",
  BOUNDED_OFFLINE: "BOUNDED_OFFLINE",
  LOCAL_CELL: "LOCAL_CELL"
});

export function evaluateRevocation(proof, policy, state) {
  const revoked = revokedMandates(state);
  if (revoked.includes(proof.mandate_id)) {
    return invalid(Reason.MANDATE_REVOKED);
  }

  const profile = policy.revocation_profile;
  if (!profile) return ok();

  const view = state.revocation_view;
  if (!view || !Number.isInteger(view.checked_at_ms)) {
    return stale(Reason.REVOCATION_VIEW_STALE);
  }

  if ((view.revoked_mandates ?? []).includes(proof.mandate_id)) {
    return invalid(Reason.MANDATE_REVOKED);
  }

  const viewAge = policy.now_ms - view.checked_at_ms;

  if (profile.mode === RevocationMode.ONLINE_HIGH_ASSURANCE) {
    if (viewAge > profile.maximum_revocation_view_age_ms) {
      return stale(Reason.REVOCATION_VIEW_STALE);
    }
    return ok();
  }

  if (profile.mode === RevocationMode.BOUNDED_OFFLINE) {
    if (viewAge > profile.maximum_offline_age_ms) {
      return stale(Reason.REVOCATION_VIEW_STALE);
    }
    return ok();
  }

  if (profile.mode === RevocationMode.LOCAL_CELL) {
    if (!proof.local_cell) return invalid(Reason.LOCAL_CELL_REQUIRED);
    if (policy.now_ms > proof.local_cell.expires_at_ms) {
      return stale(Reason.LOCAL_CELL_EXPIRED);
    }
    return ok();
  }

  return ok();
}

function revokedMandates(state) {
  const legacy = state.revoked_mandates ?? [];
  const view = state.revocation_view?.revoked_mandates ?? [];
  return [...new Set([...legacy, ...view])];
}

function ok() {
  return { ok: true, status: Status.VALID, reason: Reason.VALID };
}

function invalid(reason) {
  return { ok: false, status: Status.INVALID, reason };
}

function stale(reason) {
  return { ok: false, status: Status.STALE, reason };
}
