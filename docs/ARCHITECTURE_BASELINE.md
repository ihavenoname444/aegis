# Architecture Baseline

## Verdict

Current model status:

```text
ACCEPTED FOR REFERENCE MODELING
NOT ACCEPTED AS PRODUCTION SECURITY
```

This repository is a reference artifact for the conserved-authority category. It is not a production deployment.

## Trust Boundaries

| Layer | Responsibility | Non-Responsibility |
|---|---|---|
| Real-world root | Legal / organizational authority | Does not come from Vaulta account name |
| Vaulta native auth | Who may call kernel functions | Does not determine mandate validity |
| AEGIS kernel | Deterministic authority state machine | Does not reason in natural language |
| Capacity plane | V/RAM-backed admission | Does not create root authority |
| Finality plane | State is finalized | Does not prove external execution |
| External verifier | Local acceptance decision | Does not force execution |
| Execution rail | Performs external action | Does not define global authority |
| Reconciliation | Updates remaining authority state | Does not roll back reality |

## Complete Mediation

High-assurance mode requires:

```text
agent cannot possess bypass credentials
external gateway verifies proof before signing/executing
proof is bound to exact effect
nullifier/reservation cannot replay
```

If an agent has a root API key, unrestricted wallet key or HSM signing right, the integration is:

```text
BYPASSABLE / ADVISORY ONLY
```

## First Critical Failure Condition

If a recognized high-assurance proof can validate without a V-backed capacity certificate, the V design fails.

