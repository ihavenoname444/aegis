# Threat Model

## Protected Statement

```text
Model compromise does not imply root authority compromise.
```

This is true only under complete mediation:

- the AI/agent does not hold root credentials;
- the AI/agent cannot bypass the verifier;
- external execution gateways require accepted AEGIS proofs;
- root authority keys remain in institutional/HSM/MPC control.

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

## Non-Claims

AEGIS-V does not prove real-world legal identity by itself.

AEGIS-V does not force external systems to execute.

AEGIS-V does not roll back real-world effects.

AEGIS-V does not make arbitrary external information true.

