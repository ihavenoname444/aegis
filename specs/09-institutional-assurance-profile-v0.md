# Institutional Assurance Profile v0

Institutional adoption is not based on protocol coercion. It is a local risk
policy:

```text
NO VALID AEGIS HIGH-ASSURANCE PROOF
=
NO AUTONOMOUS HIGH-VALUE EXECUTION
```

## Profiles

```text
TIER1_BANK_HIGH_VALUE
CENTRAL_BANK_SYSTEMIC
MARKET_INFRASTRUCTURE_INTEROP
```

## Required Controls

All high-assurance profiles require:

```text
canonical authority state
complete mediation
pinned verifier profile
pinned kernel account/code/ABI
pinned authority schema
pinned finality rule
accepted V capacity profile
accepted capacity epoch
UNKNOWN => QUARANTINE
fresh finality bound
accepted evidence class
```

The central-bank systemic profile additionally requires:

```text
evidence class A only
maximum checkpoint age <= 1000ms
single accepted capacity epoch
ONLINE_HIGH_ASSURANCE revocation
```

## Non-Endorsement

Named institutions are target reviewer archetypes only. This repository does
not claim endorsement, review, partnership or approval from any bank, central
bank, conglomerate or infrastructure provider.
