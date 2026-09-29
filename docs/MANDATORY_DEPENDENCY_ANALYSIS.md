# Mandatory Dependency Analysis

Audit date: 2026-09-29.

Verdict:

```text
GLOBAL CONSERVED AUTHORITY: SURVIVES IN THE REFERENCE MODEL
VAULTA SMALLER-TCB DEPENDENCY: UNPROVEN
V FUNDAMENTALNESS: NOT PROVEN IN PRODUCTION
V HIGH-ASSURANCE PROFILE REDLINE: IMPLEMENTATION_TESTED
```

## Exact Guarantee

If AEGIS-V disappears tomorrow, institutions lose:

```text
a canonical, independently verifiable guarantee that a principal's authority has
not been duplicated, over-delegated, replayed, reserved, consumed, revoked or
quarantined elsewhere across participating domains.
```

They do not lose the ability to execute. They lose the cross-domain proof that
execution is still inside the principal's remaining global authority.

## Critical Dependency Test

Statement under test:

```text
WITHOUT THE CANONICAL AEGIS AUTHORITY STATE, AN INDEPENDENT EXECUTION DOMAIN
CANNOT KNOW THE PRINCIPAL'S GLOBAL REMAINING AUTHORITY ACROSS ALL OTHER
PARTICIPATING DOMAINS.
```

Current result:

```text
TRUE IN THE REFERENCE MODEL.
```

Reason:

```text
Local execution-domain state can know its own reservations and receipts.
It cannot know reservations, delegations, revocations, quarantines or consumes
that occurred in other participating domains unless it verifies the same
canonical authority state or recreates an equivalent shared coordination layer.
```

Counterexample that would kill this:

```text
An independent domain can cheaply, deterministically and completely learn global
remaining authority across all participating domains without accepting the
canonical authority state or an equivalent coordination layer.
```

No such counterexample is implemented in this repository.

## Current Implemented Redlines

| Redline | Test Evidence | Result |
|---|---|---|
| High-assurance verification requires canonical authority state. | `tests/mandatory-dependency.test.js` | `UNKNOWN / CANONICAL_STATE_REQUIRED` |
| V cannot be removed from the accepted high-assurance profile. | `tests/mandatory-dependency.test.js` | `INVALID / V_REQUIRED` |
| A cannot substitute for V. | `tests/mandatory-dependency.test.js` | `INVALID / CAPACITY_ASSET_REJECTED` |
| WRAM cannot substitute for V. | `tests/mandatory-dependency.test.js` | `INVALID / CAPACITY_ASSET_REJECTED` |
| USDC cannot substitute for V. | `tests/mandatory-dependency.test.js` | `INVALID / CAPACITY_ASSET_REJECTED` |
| BTC cannot substitute for V. | `tests/mandatory-dependency.test.js` | `INVALID / CAPACITY_ASSET_REJECTED` |
| TOKEN_X cannot substitute for V. | `tests/mandatory-dependency.test.js` | `INVALID / CAPACITY_ASSET_REJECTED` |
| Unique V encumbrance is required. | `tests/mandatory-dependency.test.js` | `INVALID / UNIQUE_V_ENCUMBRANCE_REQUIRED` |
| Generic token-gate capacity profile is rejected. | `tests/mandatory-dependency.test.js` | `INVALID / CAPACITY_PROFILE_REJECTED` |
| Ledger rejects substitute-asset providers. | `tests/mandatory-dependency.test.js` | `CAPACITY_ASSET_REJECTED` |
| Ledger rejects non-V certificates from V providers. | `tests/mandatory-dependency.test.js` | `CAPACITY_ASSET_REJECTED` |

## What This Proves

The reference verifier now proves this narrower claim:

```text
An AEGIS_V_HIGH_ASSURANCE_V0 proof is not valid unless it carries explicit,
unique V encumbrance and physical resource backing under an accepted capacity
epoch, and unless the verifier has canonical authority state.
```

That is a real functional dependency inside the accepted profile.

## What This Does Not Prove

It does not yet prove:

```text
V is the only possible asset that could ever support an equivalent system.
Vaulta is the only possible settlement layer.
The production contracts enforce unique V encumbrance.
Capacity providers cannot bypass V through off-chain or admin paths.
Institutions will accept this profile.
```

If another system recreates the same global authority state, proof semantics,
complete mediation, finality safety, upgrade safety and capacity non-double
backing with a smaller TCB, the AEGIS-V/Vaulta moat weakens.

## Vaulta Dependency

The candidate Vaulta dependency is functional if Vaulta provides a materially
smaller trusted computing base for:

```text
root authorization
deterministic kernel state
finalized canonical authority state
portable proofs
explicit account/code/ABI identity
governance-capture resistance through verifier pinning
```

Current status:

```text
UNPROVEN.
```

Required next evidence:

```text
Compare Vaulta against Ethereum, Solana, Sui, Canton and bank/HSM stacks.
Count upgrade authorities, bridge/trust assumptions, custom authorization code,
runtime bypass paths and finality dependencies.
```

## V Dependency

The current strongest honest statement is:

```text
V is mandatory for the AEGIS_V_HIGH_ASSURANCE_V0 capacity profile implemented in
this reference model.
```

The stronger production statement remains unproven:

```text
Removing V destroys a non-dilutable capacity/security property that A, WRAM,
USDC, BTC and arbitrary TOKEN_X cannot preserve without changing the accepted
profile and risk model.
```

## Developer Necessity

The developer choice is:

```text
A. integrate aegis.verify(effect, proof, policy, canonical_state)
```

or:

```text
B. implement and audit global authority conservation, cross-domain reservation,
revocation/freshness, obligation uniqueness, replay protection, UNKNOWN
handling, upgrade safety, governance-capture resistance, portable proof
verification and capacity non-double-backing.
```

This repository is about 6,277 lines across source, tests, specs, docs, demos
and formal-model drafts after v0.0.13. That is still a reference model, not production. The relevant moat
is not line count alone; it is the cost of proving, auditing and getting external
institutions to accept the same semantics.

## Network Effect

The likely durable moat is the acceptance graph:

```text
accepted roots
accepted verifier profiles
accepted capacity providers
accepted adapters
accepted audit history
accepted operational behavior
```

Code can be forked. Institutional acceptance, audit trail and integration
history cannot be cloned instantly.

## Final Answer

Current answer to the directive:

```text
AEGIS-V has a credible mandatory dependency around canonical conserved
authority state.

Vaulta is a candidate substrate for that dependency, but the smaller-TCB claim
is still unproven.

V is mandatory inside the current accepted high-assurance capacity profile, but
V fundamentalness in production remains a live thesis-killer until real
on-chain unique encumbrance and substitute-asset analysis are complete.
```
