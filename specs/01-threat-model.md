# Threat Model

## Protected Statement

```text
Model compromise does not imply root authority compromise.
Governance capture does not automatically imply expansion of an institution's accepted authority.
```

This is true only under complete mediation:

- the AI/agent does not hold root credentials;
- the AI/agent cannot bypass the verifier;
- external execution gateways require accepted AEGIS proofs;
- root authority keys remain in institutional/HSM/MPC control.
- external verifiers pin the exact profiles, kernels, capacity epochs and finality rules they accept.
- governance-published upgrades are not trusted until explicitly accepted.

## Governance Capture Assumption

AEGIS-V must assume that governance, BPs, foundations, treasury operators, protocol admins, capacity providers or upgrade authorities may become captured, collusive, compromised or hostile.

Governance may affect liveness:

```text
censor
halt
delay
refuse inclusion
withhold liveness
```

Governance must not silently expand institution-accepted authority:

```text
latest kernel != trusted kernel
latest epoch != accepted epoch
finalized state != accepted authority state
governance-approved profile != verifier-accepted profile
```

## Attacks

| Attack | Expected Result |
|---|---|
| Replay same proof on another rail | INVALID |
| Change recipient | INVALID |
| Change execution domain | INVALID |
| Child agent amplifies authority | INVALID |
| Use revoked mandate | INVALID |
| Use stale checkpoint | STALE |
| Missing capacity certificate | INVALID |
| Double-backed V capacity | INVALID |
| Missing consequence receipt | UNKNOWN or QUARANTINED |
| Agent holds bypass credential | BYPASSABLE / ADVISORY ONLY |
| BP coalition deploys malicious H2 kernel | INVALID unless verifier accepts H2 |
| Governance publishes diluted C4 capacity epoch | INVALID unless verifier accepts C4 |
| Finalized state is produced by unaccepted kernel | INVALID |
| Admin override attempts to bypass nullifier | INVALID |
| Admin releases quarantined authority without resolution proof | INVALID |
| Same V backs old and new epochs simultaneously | INVALID |

## Trust Separation

```text
ROOT TRUST:
Principal controls root.

PROTOCOL TRUST:
Vaulta native authorization behaves as specified.

KERNEL TRUST:
Exact accepted kernel hash and ABI behave as specified.

FINALITY TRUST:
Vaulta finalizes according to defined assumptions.

CAPACITY TRUST:
Accepted capacity certificate follows accepted epoch rules.

VERIFIER TRUST:
External verifier enforces its pinned profile correctly.

ADAPTER TRUST:
Destination does not expose a bypass path.

GOVERNANCE:
Not assumed universally honest.
```

## Non-Claims

AEGIS-V does not prove real-world legal identity by itself.

AEGIS-V does not force external systems to execute.

AEGIS-V does not roll back real-world effects.

AEGIS-V does not make arbitrary external information true.
