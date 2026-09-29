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
Root authority = 100
Agent attempts to spend/use the same authority across five rails
AEGIS-V accepts only exact, fresh, capacity-backed, non-replayed authority
Final accounting remains conserved
```

## Non-Goals

- No real Vaulta deployment yet.
- No real V staking contract yet.
- No real bank/HSM adapter yet.
- No frontend.
- No token price model.
- No production cryptography claims.

## Core Invariants

```text
Authority cannot amplify.
Authority cannot replay.
Authority cannot exceed scope.
Authority cannot resurrect after revocation.
Capacity cannot be double-backed.
No receipt does not mean no execution.
Unknown consequence quarantines authority.
High-assurance verification requires canonical authority state.
Governance capture does not automatically imply expansion of institution-accepted authority.
Valid high-assurance proof requires a valid uniquely-encumbered V-backed capacity certificate.
```

## Quick Start

This repository is intentionally dependency-free for the first reference model.

```bash
npm test
npm run demo:five-rails
npm run demo:hostile
npm run demo:dependency
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

Version `0.0.7` is a GitHub-ready reference artifact plus a dependency-free verifier, authority state-machine model, V-backed capacity ledger model, revocation freshness profiles, governance-capture hardening, mandatory-dependency redline tests, property/interleaving tests and first-pass TLA+ specification.

The first target artifacts are:

```text
five-rails authority amplification demo
10,000 -> 10,001 hostile amplification demo
global V capacity non-double-backing tests
ONLINE / bounded-offline / local-cell revocation profile tests
hostile governance / malicious kernel / capacity dilution tests
mandatory dependency / V substitute / canonical-state tests
mandatory dependency executable demo
seeded property tests for authority conservation
first TLA+ conservation model
```

Security review status:

- `docs/CURRENT_REPO_GAP_ANALYSIS.md` is the current adversarial architecture audit.
- `docs/EVIDENCE_LEDGER.md` tracks which claims are tested, assumed, unproven or contradicted.
- `docs/MANDATORY_DEPENDENCY_ANALYSIS.md` defines the exact guarantee that disappears when AEGIS-V is bypassed.

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

## Institutional Review Checklist

A skeptical reviewer should be able to verify that this model distinguishes:

- root authority from Vaulta account authority;
- native auth from AEGIS kernel authority;
- authority validity from capacity sufficiency;
- finality validity from authority validity;
- finalized state from accepted authority state;
- verification from execution;
- reconciliation from rollback;
- high-assurance mode from advisory/bypassable mode.

## Why This Exists

Autonomous systems will operate across many independent rails. AEGIS-V tests whether there can be a common authority-clearing primitive that lets those rails verify:

```text
This agent had exact, bounded, fresh, non-replayed authority for this exact effect.
```

without requiring every rail to give up execution sovereignty.
