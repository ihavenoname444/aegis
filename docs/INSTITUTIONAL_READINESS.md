# Institutional Readiness

This document frames AEGIS-V for high-assurance reviewers such as large banks,
central banks, market infrastructure operators, custodians and regulated
treasury functions.

It does not claim that any named institution has reviewed, endorsed or adopted
the project.

## Institutional Question

```text
Can an autonomous system execute a high-value action without proving that the
principal's authority has already not been used elsewhere?
```

AEGIS-V answer:

```text
It can execute, but it should not receive high-assurance authorization unless it
can present an accepted proof against canonical authority state.
```

## Reviewer Checklist

| Requirement | AEGIS-V Reference Evidence |
|---|---|
| Exact authority scope | `src/verifier.js`, `tests/verifier.test.js` |
| Cross-domain replay prevention | `tests/authority-kernel.test.js`, hostile demo |
| Canonical state dependency | `tests/mandatory-dependency.test.js` |
| Governance-capture resistance | `tests/governance-capture.test.js` |
| Capacity non-double-backing | `tests/capacity-ledger.test.js` |
| V substitute redlines | `tests/mandatory-dependency.test.js` |
| Institutional policy gates | `tests/institutional-profiles.test.js` |
| Multi-principal root conservation | `src/root-binding.js`, `tests/root-binding.test.js` |
| Fail-closed UNKNOWN handling | `tests/verifier.test.js`, `src/authority-kernel.js` |

## Current Verdict

```text
READY FOR ARCHITECTURE REVIEW: yes
READY FOR PRODUCTION SECURITY CLAIMS: no
READY FOR INSTITUTIONAL PILOT DESIGN: partially
```

The next serious milestone is not more marketing. It is a concrete adapter
model for a bank/HSM/payment-gateway boundary plus a model-checked migration and
distributed finality/revocation story.
