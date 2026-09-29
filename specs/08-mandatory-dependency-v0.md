# Mandatory Dependency v0

The goal is not to make AEGIS-V merely useful. The goal is to define a
security guarantee that a user cannot retain after bypassing the accepted
verification boundary.

## Core Guarantee

```text
GLOBAL CONSERVED AUTHORITY GUARANTEE
```

Under accepted assumptions:

```text
root authority cannot amplify
authority cannot duplicate across execution domains
obligation cannot settle twice
live reservations are globally exclusive
revocation semantics are deterministic
UNKNOWN execution fails closed
accepted kernel/profile cannot silently change
governance cannot silently expand institution-accepted authority
capacity cannot be double-backed
external enforcement is complete for the claimed assurance profile
```

The critical dependency is:

```text
Without canonical AEGIS authority state, an independent execution domain cannot
know the principal's global remaining authority across all other participating
domains.
```

If an execution domain bypasses AEGIS-V, it may still execute. It loses the
accepted proof that the authority has not already been delegated, reserved,
consumed, revoked, replayed or quarantined elsewhere.

## Vaulta Dependency

The candidate Vaulta dependency is:

```text
Vaulta native root authorization
+ deterministic AEGIS Kernel
+ Vaulta-finalized authority state
+ portable proof
= accepted authority clearing boundary
```

This does not claim other systems cannot implement equivalent logic. A competing
system can compete if it recreates equivalent global coordination, finality,
proof semantics, upgrade safety and institutional acceptance with an equal or
smaller trusted computing base.

## V Dependency

V is not accepted by name alone.

For the reference high-assurance profile:

```text
ValidHighAssuranceCapacityCertificate
requires
capacity_profile == AEGIS_V_HIGH_ASSURANCE_V0
AND capacity_asset == V
AND unique_v_encumbrance == true
AND accepted_capacity_epoch
AND physical_resource_backing
```

The reference verifier rejects:

```text
REMOVE V
SUBSTITUTE A
SUBSTITUTE WRAM
SUBSTITUTE USDC
SUBSTITUTE BTC
SUBSTITUTE TOKEN_X
```

This proves only the accepted profile rule in this reference model. It does not
yet prove production non-bypassability. Production must show that V supplies a
non-dilutable capacity property that arbitrary collateral cannot preserve without
changing the accepted profile and risk model.

## Institutional Necessity

The institutional policy statement is:

```text
NO VALID AEGIS HIGH-ASSURANCE PROOF
=
NO AUTONOMOUS HIGH-VALUE EXECUTION
```

This is not protocol coercion. It is a local risk policy: a bank refuses
autonomous high-value execution unless the proof preserves global authority
conservation across participating domains.

## Developer Necessity

A developer can integrate:

```text
aegis.verify(effect, proof, policy, canonical_state)
```

Or independently implement and audit:

```text
global authority conservation
cross-domain reservation
revocation/freshness
obligation uniqueness
replay protection
UNKNOWN handling
upgrade safety
governance-capture resistance
portable proof verification
capacity non-double-backing
```

If the independent implementation is simple and equally safe, the moat is weak.
If the independent implementation has materially larger TCB, integration,
conformance and audit cost, AEGIS-V gains a functional moat.

## Acceptance Graph

Code can be forked. Trust acceptance cannot be copied instantly.

The strongest moat is the acceptance graph across:

```text
banks
chains
payment processors
AI runtimes
MCP systems
capacity providers
auditors
verifier endpoints
```

A competing trust domain must recreate security proofs, audits, integrations,
conformance, institutional approvals, operational history and capacity-provider
economics.

## Current Verdict

```text
GLOBAL CONSERVED AUTHORITY DEPENDENCY: SURVIVES IN REFERENCE MODEL
VAULTA SMALLER-TCB CLAIM: UNPROVEN
V PRODUCTION NECESSITY: UNPROVEN, BUT NOW TESTED AS A PROFILE REDLINE
```

Do not upgrade these claims without model checking, production contracts, actual
Vaulta permission graphs and substitute-asset analysis.
