import { createAuthorityState } from "./authority-kernel.js";

export const RootBindingReason = Object.freeze({
  OK: "OK",
  INVALID_ROOT_BINDING: "INVALID_ROOT_BINDING",
  INVALID_ROOT_AUTHORITY: "INVALID_ROOT_AUTHORITY",
  AUTHORITY_EXCEEDS_ROOT: "AUTHORITY_EXCEEDS_ROOT",
  ROOT_ALREADY_ACTIVE: "ROOT_ALREADY_ACTIVE",
  PRINCIPAL_ALREADY_ACTIVE: "PRINCIPAL_ALREADY_ACTIVE",
  LEGAL_ATTESTATION_ALREADY_ACTIVE: "LEGAL_ATTESTATION_ALREADY_ACTIVE",
  HIDDEN_MASTER_KEY_REJECTED: "HIDDEN_MASTER_KEY_REJECTED",
  APPROVAL_THRESHOLD_UNMET: "APPROVAL_THRESHOLD_UNMET",
  ROLE_SEPARATION_VIOLATED: "ROLE_SEPARATION_VIOLATED"
});

export function createRootRegistry() {
  return {
    active_roots: {},
    active_principals: {},
    active_legal_attestations: {}
  };
}

export function evaluateRootAuthorization(binding, authorization) {
  if (!isNonEmptyString(binding.root_id) ||
      !isNonEmptyString(binding.principal_id) ||
      !isNonEmptyString(binding.legal_attestation_id)) {
    return fail(RootBindingReason.INVALID_ROOT_BINDING);
  }

  if (!Number.isInteger(binding.root_authorized) || binding.root_authorized <= 0) {
    return fail(RootBindingReason.INVALID_ROOT_AUTHORITY);
  }

  if (!Number.isInteger(authorization.requested_authority) || authorization.requested_authority <= 0) {
    return fail(RootBindingReason.INVALID_ROOT_AUTHORITY);
  }

  if (authorization.requested_authority > binding.root_authorized) {
    return fail(RootBindingReason.AUTHORITY_EXCEEDS_ROOT);
  }

  if (authorization.hidden_master_key === true) {
    return fail(RootBindingReason.HIDDEN_MASTER_KEY_REJECTED);
  }

  const approvals = authorization.approvals ?? [];
  if (binding.approval_policy?.separation_of_duties) {
    const actorsByRole = new Map();
    for (const approval of approvals) {
      if (!actorsByRole.has(approval.actor_id)) actorsByRole.set(approval.actor_id, new Set());
      actorsByRole.get(approval.actor_id).add(approval.role);
    }
    if ([...actorsByRole.values()].some((roles) => roles.size > 1)) {
      return fail(RootBindingReason.ROLE_SEPARATION_VIOLATED);
    }
  }

  for (const rule of binding.approval_policy?.threshold_rules ?? []) {
    if (!ruleApplies(rule, authorization.requested_authority)) continue;
    const approvers = new Set(approvals
      .filter((approval) => approval.role === rule.role)
      .map((approval) => approval.actor_id));
    if (approvers.size < rule.threshold) {
      return fail(RootBindingReason.APPROVAL_THRESHOLD_UNMET);
    }
  }

  return ok();
}

export function activateRootBinding(registry, binding, authorization) {
  const evaluated = evaluateRootAuthorization(binding, authorization);
  const next = normalizeRegistry(clone(registry));
  if (!evaluated.ok) return { ...evaluated, registry: next, state: null };

  if (next.active_roots[binding.root_id]) {
    return {
      ok: false,
      reason: RootBindingReason.ROOT_ALREADY_ACTIVE,
      registry: next,
      state: null
    };
  }

  if (next.active_principals[binding.principal_id]) {
    return {
      ok: false,
      reason: RootBindingReason.PRINCIPAL_ALREADY_ACTIVE,
      registry: next,
      state: null
    };
  }

  if (next.active_legal_attestations[binding.legal_attestation_id]) {
    return {
      ok: false,
      reason: RootBindingReason.LEGAL_ATTESTATION_ALREADY_ACTIVE,
      registry: next,
      state: null
    };
  }

  next.active_roots[binding.root_id] = {
    root_id: binding.root_id,
    principal_id: binding.principal_id,
    vaulta_root_account: binding.vaulta_root_account,
    root_authorized: authorization.requested_authority
  };
  next.active_principals[binding.principal_id] = binding.root_id;
  next.active_legal_attestations[binding.legal_attestation_id] = binding.root_id;

  const state = createAuthorityState({
    root_id: binding.root_id,
    root_authorized: authorization.requested_authority
  });
  state.root_binding = {
    principal_id: binding.principal_id,
    vaulta_root_account: binding.vaulta_root_account,
    legal_attestation_id: binding.legal_attestation_id,
    authorization_id: authorization.authorization_id
  };

  return {
    ok: true,
    reason: RootBindingReason.OK,
    registry: next,
    state,
    report: rootRegistryReport(next)
  };
}

export function rootRegistryReport(registry) {
  const roots = Object.values(registry.active_roots);
  const total_active_authority = roots
    .reduce((total, root) => total + root.root_authorized, 0);
  return {
    active_roots: roots.length,
    total_active_authority,
    roots
  };
}

function ruleApplies(rule, requestedAuthority) {
  if (!Number.isInteger(rule.minimum_amount)) return true;
  return requestedAuthority >= rule.minimum_amount;
}

function ok() {
  return { ok: true, reason: RootBindingReason.OK };
}

function fail(reason) {
  return { ok: false, reason };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeRegistry(registry) {
  return {
    active_roots: registry.active_roots ?? {},
    active_principals: registry.active_principals ?? {},
    active_legal_attestations: registry.active_legal_attestations ?? {}
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}
