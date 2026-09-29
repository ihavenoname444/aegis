# Governance Capture Gap Analysis

Audit date: 2026-09-29.

Verdict:

```text
SURVIVES WITH ASSUMPTIONS
```

The reference verifier now rejects governance-published kernels, ABIs, verifier profiles, capacity epochs and finalized states that are outside the institution's explicitly pinned policy. This is enough for the reference model to demonstrate verifier sovereignty. It is not yet enough for production high assurance because real Vaulta deployment accounts, permissions, multisigs, upgrade paths and on-chain contracts are not present in this repository.

## Core Security Statement

```text
Governance capture does not automatically imply expansion of an institution's accepted authority.
```

The principal remains root. Governance may affect liveness, availability, censorship and upgrade coordination, but must not silently expand accepted authority for a verifier that has pinned its profile.

## Required Output

| Question | Current Answer | Status |
|---|---|---|
| Current governance trust assumptions in repo | Earlier docs under-specified governance capture. v0.0.6 now treats governance as adversarial. | IMPROVED |
| Assumptions too strong | Any assumption that latest kernel, latest capacity epoch or finalized chain state equals accepted authority. | IDENTIFIED |
| Exact admin/upgrade authority graph | No real deployment accounts or Vaulta permission graph exists in repo. | UNRESOLVED |
| Kernel trust currently pinned | Yes: `accepted_kernel_account`, `accepted_kernel_hashes`, `accepted_kernel_abi_hashes`. | IMPLEMENTED_REFERENCE |
| Capacity epochs immutable/non-retroactive | Verifier accepts only `accepted_capacity_epochs`; ledger sums live V across epochs. | IMPLEMENTED_REFERENCE |
| Can governance silently alter accepted authority | In reference verifier, no: H2/profile/ABI/finality changes are rejected unless pinned. | IMPLEMENTATION_TESTED |
| Can governance double-back or dilute V capacity | Reference ledger rejects global V double-backing across active certificates and epochs. | IMPLEMENTATION_TESTED |
| Does migration require root/verifier acceptance | In reference tests, unaccepted H2 migration is rejected. Full migration protocol is not implemented. | PARTIAL |
| Can Savanna finality make verifier accept untrusted kernel | Reference verifier rejects finalized H2 state if H2 is not accepted. | IMPLEMENTATION_TESTED |
| Missing formal invariants | Governance non-expansion, profile immutability, capacity non-retroactivity, migration conservation. | PARTIAL |
| Missing adversarial tests | Distributed finality race, real permission graph, contract replacement, state migration overlap. | OPEN |
| Exact code/spec changes required | See sections below. | ACTIVE |
| Next commits | Run TLC, model migration, import deployment permissions, add adapter complete-mediation model. | PLANNED |

## Gap Table

| Assumption | Current Code / Doc | Risk | Attack | Required Fix | Formal Property | Test | Status |
|---|---|---|---|---|---|---|---|
| Latest kernel is trusted | `verify()` now checks pinned kernel account/hash/ABI. | A malicious H2 could redefine authority semantics. | BP coalition deploys H2. | Keep verifier-local kernel pinning. | T16/T17/T20 | `governance-capture.test.js` | IMPLEMENTED_REFERENCE |
| Latest verifier profile is trusted | `verify()` now checks `accepted_verifier_profile_hashes`. | Governance can weaken rules by publishing "latest". | Profile P2 lowers evidence/capacity requirements. | Explicit profile hash acceptance. | T17/T20 | `governance-capture.test.js` | IMPLEMENTED_REFERENCE |
| Finalized state equals accepted authority | `verify()` now checks finalized checkpoint kernel hash and finality rule. | Finality could launder untrusted H2 state. | Network finalizes H2 state. | Require finality validity plus profile acceptance. | T20 | `governance-capture.test.js` | IMPLEMENTED_REFERENCE |
| Capacity epoch upgrades are retroactive | `accepted_capacity_epochs` and ledger reject C4 if not accepted. | Governance multiplies capacity per V. | C4 makes 1 V equal 100x capacity. | Version/hash-bound epoch acceptance. | T18 | `governance-capture.test.js` | IMPLEMENTED_REFERENCE |
| Same V can back multiple epochs | `capacityLedgerReport()` sums active certs across all epochs. | Old and new epochs double-count same V. | Cert C1 and C4 both active on same V. | Global provider-level encumbrance. | T18 | `capacity-ledger.test.js`, `governance-capture.test.js` | IMPLEMENTED_REFERENCE |
| Admin can override nullifier | `verify()` rejects `admin_override_authority_state`. | Admin resurrects spent obligation. | Override spent nullifier. | No admin authority over one-time consumption. | T16 | `governance-capture.test.js` | IMPLEMENTED_REFERENCE |
| Admin can release quarantined authority | `RETURN` from `QUARANTINED` requires `resolution_proof_id`. | Unknown consequence is silently released. | Admin releases lost receipt. | Resolution proof required. | T19 | `governance-capture.test.js` | IMPLEMENTED_REFERENCE |
| Migration is automatically trusted | H2 proof is rejected unless accepted. Full migration not implemented. | Old/new kernels spend same root authority. | Governance migrates without bank opt-in. | Root/verifier-signed migration manifest. | T19/T20 | partial H1/H2 race test | PARTIAL |
| Governance honesty is required | Threat model updated to treat governance as adversarial. | Security rests on foundation/BP reputation. | Captured governance changes rules. | Minimize governance trust; pin verifier policy. | T16-T20 | docs + tests | PARTIAL |
| Real Vaulta permissions are known | No deployment account set exists in repo. | Hidden upgrade key can alter code/config. | `setcode`, `updateauth`, config mutation. | Import actual account permission graph before production claims. | T16/T20 | not available | UNRESOLVED |

## Governance Threat Actors

| Threat | Attack | Precondition | Expected Defense | Residual Risk | Status |
|---|---|---|---|---|---|
| T-GOV-1 malicious BP coalition | Finalizes malicious H2 state. | BPs collude or governance captured. | Verifier rejects unaccepted H2 kernel/finality profile. | Can impair liveness/censor. | IMPLEMENTED_REFERENCE |
| T-GOV-2 captured treasury operators | Push migration or capacity rule change. | Treasury/admin controls upgrade path. | Verifier rejects profile/epoch outside pinned policy. | Real permission graph unknown. | PARTIAL |
| T-GOV-3 malicious kernel upgrade authority | Deploys H2 with changed nullifier logic. | Upgrade key exists. | H2 rejected until verifier accepts H2 hash/ABI. | Production must prevent misleading registries. | IMPLEMENTED_REFERENCE |
| T-GOV-4 collusive capacity providers | Double-back same V. | Providers issue overlapping certs. | Ledger sums active V encumbrance globally. | Real staking contract absent. | PARTIAL |
| T-GOV-5 foundation/admin compromise | Announces latest profile as trusted. | Social or registry influence. | Profile hash pinning; latest is not accepted by default. | Users may manually accept bad profile. | IMPLEMENTED_REFERENCE |
| T-GOV-6 vote-buying/captured governance | Publishes weaker rules. | Governance vote captured. | Existing verifier profile immutable unless changed locally. | Upgrade UX must be explicit. | PARTIAL |
| T-GOV-7 capacity dilution epoch | C4 multiplies capacity per V. | New epoch published. | Old verifier rejects C4. | New verifiers can opt in knowingly. | IMPLEMENTED_REFERENCE |
| T-GOV-8 forced authority migration | Moves bank state to H2. | Migration contract/admin exists. | H2 rejected without verifier/root acceptance. | Full migration conservation not implemented. | PARTIAL |
| T-GOV-9 canonical state rewrite | Redirects canonical pointer. | Registry/admin controls pointer. | Verifier pins concrete profile/kernel/finality references. | Real registry design missing. | PARTIAL |
| T-GOV-10 stale/weaker profile marked current | Governance labels weak profile current. | Social/current registry trusted by user. | Verifier hash pinning rejects changed profile. | Human governance UX risk. | PARTIAL |

## Exact Admin / Upgrade Authority Graph

No production Vaulta deployment accounts are present in this repository. Therefore the exact graph cannot be verified from repo contents.

Required production table:

| Account | Permission | Controllers | Threshold | Can Modify | Security Impact |
|---|---|---|---|---|---|
| TBD | `setcode` | TBD | TBD | kernel code | Could create H2; verifier must still reject unless accepted. |
| TBD | `updateauth` | TBD | TBD | account permissions | Could alter admin path; verifier policy must not auto-follow. |
| TBD | config admin | TBD | TBD | capacity rules/profile registry | Could publish C4/P2; verifier must reject unless accepted. |
| TBD | migration admin | TBD | TBD | state migration | Could duplicate authority unless migration conservation is proven. |
| TBD | capacity admin | TBD | TBD | V/RAM backing | Could double-back unless global ledger enforced on-chain. |

Status:

```text
UNRESOLVED UNTIL REAL DEPLOYMENT ACCOUNTS AND PERMISSIONS ARE IMPORTED.
```

## Minimal Counterexample If Not Fixed

If an institutional verifier accepts "latest kernel" or "latest capacity epoch" rather than pinned hashes, a captured governance coalition can publish H2/C4 and cause the institution to accept authority under new semantics. That is the governance-capture killer.

v0.0.6 blocks this counterexample in the reference verifier through explicit local pinning. Production still requires real deployment permission verification and a migration protocol.

## Hostile Governance Test Matrix

The current reference suite implements more than the requested twelve hostile
governance checks:

| Test | Attack | Expected Result | Status |
|---|---|---|---|
| HG-1 | BP coalition deploys H2. | rejected by H1-pinned verifier | IMPLEMENTATION_TESTED |
| HG-2 | Governance marks H2 as approved/finalized. | rejected outside accepted profile | IMPLEMENTATION_TESTED |
| HG-3 | Finalized H2 state is presented under an H1 proof. | rejected as finalized untrusted kernel | IMPLEMENTATION_TESTED |
| HG-4 | Kernel ABI is mutated while code hash is claimed accepted. | rejected by ABI pin | IMPLEMENTATION_TESTED |
| HG-5 | Canonical kernel account pointer is redirected. | rejected by kernel account pin | IMPLEMENTATION_TESTED |
| HG-6 | Verifier profile hash is silently weakened. | rejected by profile hash pin | IMPLEMENTATION_TESTED |
| HG-7 | Finality rule label is changed. | rejected by finality-rule pin | IMPLEMENTATION_TESTED |
| HG-8 | Governance publishes C4 capacity epoch. | rejected by C1-pinned verifier | IMPLEMENTATION_TESTED |
| HG-9 | Same provider V backs old and new capacity epochs. | rejected by global capacity ledger | IMPLEMENTATION_TESTED |
| HG-10 | Admin override tries to bypass a spent nullifier. | rejected before authority checks can be bypassed | IMPLEMENTATION_TESTED |
| HG-11 | Admin releases quarantined authority without resolution evidence. | rejected with `RESOLUTION_PROOF_REQUIRED` | IMPLEMENTATION_TESTED |
| HG-12 | Quarantined authority is released with a resolution proof. | accepted as explicit resolution path | IMPLEMENTATION_TESTED |
| HG-13 | Old/new kernel race presents H1 and H2 proofs. | H1 validates; H2 rejected | IMPLEMENTATION_TESTED |

These tests are reference evidence, not production proof. Production still needs
the actual Vaulta account permission graph and a root-approved migration
protocol.

## Thesis Killers K15-K18

| Killer | Claim That Would Kill The Thesis | Current Result | Remaining Risk |
|---|---|---|---|
| K15 | Captured governance can silently expand an institution's accepted authority. | Blocked in the reference verifier through pinned kernel/profile/schema/epoch/finality acceptance. | Real deployment permissions unresolved. |
| K16 | Chain governance can mutate verifier policy without institution consent. | Blocked in the reference verifier because policy is verifier-local. | Upgrade UX and social registry risk remain. |
| K17 | Capacity epochs can be diluted retroactively, making V capacity non-scarce. | Blocked in the reference verifier and ledger by epoch pinning and cross-epoch V encumbrance. | Production staking/capacity contract absent. |
| K18 | Migration lets old and new kernels spend the same authority. | Partially blocked: unaccepted H2 is rejected. | Full migration conservation is not implemented. |
