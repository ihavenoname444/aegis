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

