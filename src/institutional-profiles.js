export const InstitutionalProfile = Object.freeze({
  TIER1_BANK_HIGH_VALUE: "TIER1_BANK_HIGH_VALUE",
  CENTRAL_BANK_SYSTEMIC: "CENTRAL_BANK_SYSTEMIC",
  MARKET_INFRASTRUCTURE_INTEROP: "MARKET_INFRASTRUCTURE_INTEROP"
});

export const institutionalProfiles = Object.freeze({
  [InstitutionalProfile.TIER1_BANK_HIGH_VALUE]: Object.freeze({
    profile_id: InstitutionalProfile.TIER1_BANK_HIGH_VALUE,
    max_checkpoint_age_ms: 3_000,
    allowed_evidence_classes: ["A", "B"],
    required_controls: baseControls()
  }),
  [InstitutionalProfile.CENTRAL_BANK_SYSTEMIC]: Object.freeze({
    profile_id: InstitutionalProfile.CENTRAL_BANK_SYSTEMIC,
    max_checkpoint_age_ms: 1_000,
    allowed_evidence_classes: ["A"],
    required_controls: [
      ...baseControls(),
      "single_capacity_epoch",
      "online_revocation_profile"
    ]
  }),
  [InstitutionalProfile.MARKET_INFRASTRUCTURE_INTEROP]: Object.freeze({
    profile_id: InstitutionalProfile.MARKET_INFRASTRUCTURE_INTEROP,
    max_checkpoint_age_ms: 2_000,
    allowed_evidence_classes: ["A", "B"],
    required_controls: [
      ...baseControls(),
      "bounded_or_online_revocation_profile"
    ]
  })
});

export function evaluateInstitutionalPolicy(policy, profileId) {
  const profile = institutionalProfiles[profileId];
  if (!profile) {
    return {
      ok: false,
      profile_id: profileId,
      passed: [],
      failed: ["unknown_institutional_profile"]
    };
  }

  const results = profile.required_controls.map((control) => ({
    control,
    ok: Boolean(controlChecks[control]?.(policy, profile))
  }));

  return {
    ok: results.every((result) => result.ok),
    profile_id: profileId,
    passed: results.filter((result) => result.ok).map((result) => result.control),
    failed: results.filter((result) => !result.ok).map((result) => result.control)
  };
}

function baseControls() {
  return [
    "canonical_authority_state",
    "complete_mediation",
    "pinned_verifier_profile",
    "pinned_kernel_account",
    "pinned_kernel_code",
    "pinned_kernel_abi",
    "pinned_authority_schema",
    "pinned_finality_rule",
    "accepted_v_capacity_profile",
    "v_capacity_asset",
    "accepted_capacity_epoch",
    "fails_closed_unknown",
    "fresh_finality_bound",
    "accepted_evidence_class"
  ];
}

const controlChecks = Object.freeze({
  canonical_authority_state: (policy) => policy.canonical_authority_state_required === true,
  complete_mediation: (policy) => policy.complete_mediation_required === true,
  pinned_verifier_profile: (policy) => nonEmpty(policy.accepted_verifier_profile_hashes),
  pinned_kernel_account: (policy) => Boolean(policy.accepted_kernel_account),
  pinned_kernel_code: (policy) => nonEmpty(policy.accepted_kernel_hashes),
  pinned_kernel_abi: (policy) => nonEmpty(policy.accepted_kernel_abi_hashes),
  pinned_authority_schema: (policy) => nonEmpty(policy.accepted_authority_schema_hashes),
  pinned_finality_rule: (policy) => nonEmpty(policy.accepted_finality_rules),
  accepted_v_capacity_profile: (policy) => (
    policy.accepted_capacity_profile === "AEGIS_V_HIGH_ASSURANCE_V0"
  ),
  v_capacity_asset: (policy) => policy.accepted_capacity_asset === "V",
  accepted_capacity_epoch: (policy) => nonEmpty(policy.accepted_capacity_epochs),
  fails_closed_unknown: (policy) => policy.unknown_consequence === "QUARANTINE",
  fresh_finality_bound: (policy, profile) => (
    Number.isInteger(policy.maximum_checkpoint_age_ms)
    && policy.maximum_checkpoint_age_ms <= profile.max_checkpoint_age_ms
  ),
  accepted_evidence_class: (policy, profile) => (
    nonEmpty(policy.accepted_evidence_classes)
    && policy.accepted_evidence_classes.every((item) => (
      profile.allowed_evidence_classes.includes(item)
    ))
  ),
  single_capacity_epoch: (policy) => policy.accepted_capacity_epochs?.length === 1,
  online_revocation_profile: (policy) => policy.revocation_profile === "ONLINE_HIGH_ASSURANCE",
  bounded_or_online_revocation_profile: (policy) => (
    policy.revocation_profile === "ONLINE_HIGH_ASSURANCE"
    || policy.revocation_profile === "BOUNDED_OFFLINE"
  )
});

function nonEmpty(value) {
  return Array.isArray(value) && value.length > 0;
}
