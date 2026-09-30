# AEGIS-V Reference

AEGIS-V Reference is a minimal, deterministic reference artifact for:

```text
Conserved Autonomous Authority
```

It is not a wallet, token dashboard, trading app, or generic AI payment demo.

It models the smallest serious primitive:

```text
aegis.verify(effect, proof, policy)
=> VALID | INVALID | STALE | UNKNOWN
```

## Goal

Show that, given accepted verifier endpoints, delegated authority cannot amplify across execution domains.

Canonical demo:

```text
Root authority = 10,000
Attacker attempts to make autonomous authority become 10,001
AEGIS-V accepts only exact, fresh, capacity-backed, non-replayed authority
Proofs must resolve into one accepted authority universe and one global authority root
Final accounting remains conserved
```

## Non-Goals

- No real Vaulta deployment yet.
- No real V staking contract yet.
- No real bank/HSM adapter yet.
- No frontend.
- No token price model.
- No production cryptography claims.

## Current Architecture Boundary

AEGIS has two distinct layers. An institution can follow Vaulta finality and still independently decide whether each state transition is valid under its pinned verifier profile. That is the deployable overlay direction; this repository is currently only a reference model, not a live production verifier.

Consensus-protected AEGIS state is a stronger future target. A contract alone cannot make its state immune to every privileged code, permission, or protocol change. Enforcing AEGIS transition rules as block-validity rules requires consensus software support and a coordinated network upgrade. Even then, a new network regime does not automatically inherit an institution's trust in the old profile.

The Vaulta-specific audit now includes a partial read-only mainnet snapshot: `eosio@active` resolves to a 15-of-21 producer authority, and privileged `eosio.wrap`/`eosio.msig` permissions resolve through it. This is not an atomic single-LIB state proof, a deployed-source match, or proof of every action's effects. See the [dated snapshot](docs/VAULTA_PRIVILEGE_SNAPSHOT_2026-09-30.md) and [Protected Authority State v0](specs/12-protected-authority-state-v0.md).

## Target Invariants

These are target properties of an accepted profile, not claims that the current Vaulta network or this reference repository proves them end to end.

```text
Authority cannot amplify.
An H1-pinned verifier rejects conflicting authority checkpoints it can authenticate.
Authority cannot replay.
Authority cannot exceed scope.
Authority cannot resurrect after revocation.
Capacity cannot be double-backed.
No receipt does not mean no execution.
Unknown consequence quarantines authority.
High-assurance verification requires canonical authority state.
High-assurance verification requires an accepted authority universe, global authority root and authority-state checkpoint root.
Governance capture does not automatically imply expansion of institution-accepted authority.
Valid high-assurance proof requires a valid uniquely-encumbered V-backed capacity certificate.
Multi-principal approvals activate one conserved root; they do not copy authority.
Recovery/re-binding cannot activate a second root for the same principal or legal attestation.
Reservations require complete, non-blank authority-binding fields.
Return/release evidence must match the original reservation binding.
Transitions with explicit base_sequence fail closed against stale state.
Sequenced authority states require base_sequence on authority-moving transitions.
Failed proposals do not advance canonical authority sequence.
Every attempted transition has a unique monotonic audit sequence.
```

## Quick Start

This repository is intentionally dependency-free for the first reference model.

```bash
npm test
npm run demo:five-rails
npm run demo:hostile
npm run demo:dependency
npm run demo:institutional
npm run conformance
```

CLI shape:

```bash
npm run verify -- --effect test-vectors/effect-bank-payment.json --proof test-vectors/proof-valid.json --policy test-vectors/policy-bank-profile.json
```

## Repository Map

```text
specs/          Protocol and threat-model drafts
src/            Reference verifier and state-machine model
tests/          Adversarial tests
models/         First-pass formal models
test-vectors/   Canonical proof/effect/policy fixtures
demos/          Demo scripts and scenario notes
conformance/    Draft conformance profile
docs/           GitHub upload and development notes
```

## Current Status

Version `0.0.17` is a GitHub-ready reference artifact plus a dependency-free verifier, authority universe binding, authority non-equivocation adversarial tests, authority state-machine model, V-backed capacity ledger model, revocation freshness profiles, governance-capture hardening, mandatory-dependency redline tests, institutional assurance profiles, multi-principal root-binding hardening, recovery/re-binding non-expansion checks, reservation-binding completeness checks, return-binding mismatch rejection, failed-proposal sequence no-op hardening, unique audit-attempt ordering, stale base-sequence rejection, sequenced-mode base-sequence enforcement, property/interleaving tests and first-pass TLA+ specifications.

The first target artifacts are:

```text
five-rails authority amplification demo
10,000 -> 10,001 hostile amplification demo
global V capacity non-double-backing tests
ONLINE / bounded-offline / local-cell revocation profile tests
hostile governance / malicious kernel / capacity dilution tests
mandatory dependency / V substitute / canonical-state tests
mandatory dependency executable demo
institutional bank / central-bank / market-infrastructure policy profiles
authority universe / global authority root / checkpoint-root non-equivocation tests
multi-principal root-binding / conserved activation tests
recovery re-binding / principal-alias non-expansion tests
reservation binding completeness tests
return-binding mismatch rejection tests
failed-proposal sequence no-op tests
unique audit-attempt ordering tests
stale base-sequence reservation rejection tests
sequenced-mode base-sequence-required tests
seeded property tests for authority conservation
first TLA+ conservation models
```

Security review status:

- `docs/CURRENT_REPO_GAP_ANALYSIS.md` is the current adversarial architecture audit.
- `docs/EVIDENCE_LEDGER.md` tracks which claims are tested, assumed, unproven or contradicted.
- `docs/MANDATORY_DEPENDENCY_ANALYSIS.md` defines the exact guarantee that disappears when AEGIS-V is bypassed.
- `docs/AUTHORITY_NON_EQUIVOCATION.md` records the current authority-fork theorem, counterexample and V/WRAM substitution result.
- `docs/INSTITUTIONAL_READINESS.md` frames the reference model for regulated institutional review.
- `docs/COMPOSITION_MODEL.md` defines the first module-composition safety model.
- `docs/THESIS_KILLERS.md` tracks the highest-risk falsification tests.
- `specs/12-protected-authority-state-v0.md` separates verifier sovereignty today from consensus-protected authority state as the protocol target.

## Demo Output

The demo intentionally attacks the verifier:

```text
01 bank payment exact proof: VALID
02 ethereum replay after bank consume: INVALID
03 solana wrong execution domain: INVALID
04 wrong recipient: INVALID
05 stale checkpoint: STALE
06 no V-backed capacity certificate: INVALID
07 double-backed V capacity: INVALID
08 insufficient physical state resource: INVALID
09 agent holds bypass credential: INVALID
10 revoked mandate: INVALID
11 missing consequence receipt: UNKNOWN
```

Final conservation report:

```text
{ root_authorized: 100, accounted: 100, conserved: true }
```

Hostile amplification demo:

```text
Root authority: 10000
Attacker instruction: GET 10001
Child agents: 1000
Execution domains: BANK_RAIL, ETHEREUM, SOLANA, X402, MCP
Final report: { accounted: 10000, conserved: true }
+1 attempts: INSUFFICIENT_AVAILABLE
```

Capacity ledger tests:

```text
V cannot be double-backed across live certificates.
High-assurance capacity requires the accepted AEGIS-V capacity profile.
A, WRAM, USDC, BTC and TOKEN_X cannot substitute for V under that profile.
RAM cannot substitute for missing V.
V cannot substitute for missing physical RAM backing.
Retired certificates release provider capacity.
```

Mandatory dependency tests:

```text
No canonical authority state => UNKNOWN / CANONICAL_STATE_REQUIRED.
Wrong authority universe => INVALID / AUTHORITY_UNIVERSE_REJECTED.
Wrong global authority root => INVALID / GLOBAL_AUTHORITY_ROOT_REJECTED.
Forked checkpoint root => INVALID / AUTHORITY_HISTORY_EQUIVOCATED.
No V encumbrance => INVALID / V_REQUIRED.
No unique V encumbrance => INVALID / UNIQUE_V_ENCUMBRANCE_REQUIRED.
Substitute capacity assets => INVALID / CAPACITY_ASSET_REJECTED.
```

Revocation freshness profiles:

```text
ONLINE_HIGH_ASSURANCE requires a fresh revocation view.
BOUNDED_OFFLINE allows a bounded stale window.
LOCAL_CELL requires an unexpired local authority cell.
Known revoked mandates fail closed in all profiles.
```

Governance-capture hardening:

```text
H2 kernel is rejected unless explicitly accepted.
Kernel account redirect is rejected.
Kernel ABI mutation is rejected.
Verifier profile mutation is rejected.
Finality rule mutation is rejected.
New capacity epoch C4 is rejected unless explicitly accepted.
Finalized malicious H2 state is rejected despite valid finality.
Admin override cannot bypass nullifiers or release quarantined authority.
```

Institutional readiness profiles:

```text
TIER1_BANK_HIGH_VALUE: requires canonical state, authority non-equivocation, complete mediation, pinned kernel/profile/finality and V-backed capacity.
CENTRAL_BANK_SYSTEMIC: adds evidence class A, <=1000ms checkpoint age and online revocation.
MARKET_INFRASTRUCTURE_INTEROP: accepts bounded or online revocation with tighter freshness.
Advisory AI policy attempting high-assurance: FAIL.
```

Root-binding / composition hardening:

```text
2-of-3 treasury plus risk approval activates one institutional root.
Threshold signers do not each become independent roots.
Authorization above the institutional root is rejected.
Separation-of-duties can be enforced across roles.
Hidden emergency master key activation is rejected.
Recovery re-binding under a new root_id is rejected for the same principal.
Principal aliases cannot reuse the same legal attestation to create a second root.
Reservations without a nullifier or with blank binding fields are rejected.
Return/release evidence with mismatched holder, obligation, nullifier, amount, effect or execution domain is rejected.
Failed proposals do not burn or advance canonical authority sequence.
Accepted and rejected attempts remain forensically ordered by attempt_sequence.
Reservations built against stale or type-forged base_sequence values are rejected.
Sequenced states reject authority-moving transitions without base_sequence.
```

## Institutional Review Checklist

A skeptical reviewer should be able to verify that this model distinguishes:

- root authority from Vaulta account authority;
- one canonical authority universe from isolated local authorization;
- multi-principal approval from duplicated authority;
- native auth from AEGIS kernel authority;
- authority validity from capacity sufficiency;
- finality validity from authority validity;
- finalized state from accepted authority state;
- verification from execution;
- reconciliation from rollback;
- high-assurance mode from advisory/bypassable mode.
- institutional policy gates from protocol marketing claims.

## Why This Exists

Autonomous systems will operate across many independent rails. AEGIS-V tests whether there can be a common authority-clearing primitive that lets those rails verify:

```text
This agent had exact, bounded, fresh, non-replayed authority for this exact effect.
```

without requiring every rail to give up execution sovereignty.
