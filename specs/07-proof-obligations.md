# Proof Obligations

Before AEGIS-V can claim high-assurance architecture, these obligations must be proven or falsified.

## Authority Obligations

```text
O1: Authority cannot amplify.
O2: Authority cannot replay.
O3: Authority cannot exceed exact scope.
O4: Authority cannot resurrect after revocation.
O5: Authority cannot be consumed twice.
```

## Capacity Obligations

```text
O6: Valid high-assurance proof implies valid capacity certificate.
O7: V encumbered by live certificates cannot exceed V locked.
O8: Same V position cannot back two live capacity certificates.
O9: V cannot substitute for physical RAM/WRAM backing.
O10: Capacity epochs cannot be silently diluted.
O19: Valid high-assurance proof requires canonical authority state.
O20: A/WRAM/USDC/BTC/TOKEN_X cannot substitute for V under an accepted AEGIS-V high-assurance capacity profile.
O21: Generic token-gating cannot satisfy the accepted high-assurance capacity profile.
```

## Verifier Obligations

```text
O11: Verifier accepts only explicit profile/kernel/schema/proof versions.
O12: Verifier can fail closed on stale checkpoints.
O13: Verification does not require a hot-path public RPC call.
O14: Missing evidence produces UNKNOWN/QUARANTINE, not false failure.
```

## Integration Obligations

```text
O15: High-assurance integrations require complete mediation.
O16: Bypass credentials downgrade integration to advisory mode.
O17: External systems retain execution sovereignty.
O18: Reconciliation updates canonical authority state but cannot roll back reality.
```

## Governance-Capture Theorems

```text
T16 GOVERNANCE NON-EXPANSION:
No governance transition can increase authority accepted by an existing verifier profile without explicit verifier/root acceptance.

T17 PROFILE IMMUTABILITY:
Meaning of an accepted profile is immutable once identified by its hashes and version identifiers.

T18 CAPACITY EPOCH NON-RETROACTIVITY:
A new capacity epoch cannot alter the semantics of capacity already accepted under an older epoch.

T19 MIGRATION CONSERVATION:
Migration between kernels/backends preserves authority conservation and cannot duplicate live authority.

T20 VERIFIER SOVEREIGNTY:
External verifier acceptance cannot be changed solely by network governance.

T21 MANDATORY CANONICAL STATE:
Without canonical authority state or an equivalent shared coordination layer, a verifier cannot know global remaining authority across participating domains.

T22 V PROFILE REDLINE:
Under AEGIS_V_HIGH_ASSURANCE_V0, a proof without unique V encumbrance is invalid.
```

Current evidence:

```text
T16: implementation-tested for H2/profile/finality rejection.
T17: implementation-tested through verifier_profile_hash pinning.
T18: implementation-tested through capacity epoch pinning and cross-epoch V encumbrance.
T19: partial; H2 migration rejected, full migration protocol not implemented.
T20: implementation-tested for finalized H2 state rejection.
T21: implementation-tested for missing canonical state returning UNKNOWN.
T22: implementation-tested for V removal and A/WRAM/USDC/BTC/TOKEN_X substitution rejection.
```
