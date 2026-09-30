# Current Repository Gap Analysis

Audit date: 2026-09-30.

Repository audited: `outputs/aegis-v-reference`.

Verdict for this run:

```text
MODIFY
```

The current repository is a useful reference verifier/demo scaffold. It is not yet a high-assurance autonomous authority architecture. It now includes a deterministic reference authority state machine, a `10,000 -> 10,001` hostile amplification harness, authority-universe/root/checkpoint binding, a reference V-backed capacity ledger, revocation freshness profiles, governance-capture hardening, mandatory-dependency redline tests, institutional assurance profiles, multi-principal root-binding hardening, recovery/re-binding non-expansion checks, reservation-binding completeness checks, return-binding mismatch rejection, failed-proposal sequence no-op hardening, unique audit-attempt ordering, stale base-sequence rejection, sequenced-mode base-sequence enforcement, seeded property tests, enumerated interleaving tests and first-pass TLA+ conservation specifications. It still does not implement migration safety, authority cells, distributed revocation/finality race modeling, production staking contract, or completed formal proof obligations required by the master architecture.

## Protected-State Architecture Update

The architecture now distinguishes an **independently verified overlay** from a future **consensus-protected authority state domain**. The current verifier demonstrates policy pinning and rejection of selected invalid reference states; it does not make Vaulta consensus reject those states, authenticate the full live transition history, or guarantee that institutional adapters cannot bypass verification.

`specs/12-protected-authority-state-v0.md` defines the overlay boundary, the minimum consensus primitive, the H1/H2 migration rule, data-availability requirements, proof-method tradeoffs, the conditional theorem, and the next ten audit/proposal commits. It is a design proposal only; no consensus code or protocol implementation was added.

The Vaulta-specific privileged account graph is now **PARTIALLY OBSERVED** in [`docs/VAULTA_PRIVILEGE_SNAPSHOT_2026-09-30.md`](VAULTA_PRIVILEGE_SNAPSHOT_2026-09-30.md): `eosio@active`, `eosio.wrap@active`, and `eosio.msig@active` resolve through a 15-of-21 producer authority; `eosio.wrap` is privileged and its ABI exposes `exec`. The capture is not an atomic single-LIB proof; deployed-source identity, action-level authority mapping, active multisig proposals, and validator software remain unverified. Generic Antelope documentation is not itself evidence of Vaulta configuration.

Current verdict: the repository supports a verifier-level reference overlay; protocol-level AEGIS high assurance on current Vaulta is **NOT ESTABLISHED**. No broader implementation should start until the live chain audit and protected-state proposal are independently reviewed.

Post-audit implementation update:

- `src/authority-kernel.js` now includes executable transitions for `DELEGATE`, `RESERVE`, `CONSUME`, `QUARANTINE`, `RETURN`, and `REVOKE_MANDATE`.
- `src/authority-kernel.js` now rejects `RESERVE` transitions with missing or blank reservation/economic binding fields.
- `src/authority-kernel.js` now rejects transitions carrying stale or non-integer `base_sequence` preconditions.
- `src/authority-kernel.js` now supports `require_base_sequence` for sequenced states and rejects authority-moving transitions missing `base_sequence` in that mode.
- `src/authority-kernel.js` now separates canonical authority `sequence` from monotonic audit `attempt_sequence`.
- `src/authority-universe.js` now rejects proofs outside the accepted authority universe/global authority root and rejects known checkpoint-root equivocation.
- `src/verifier.js` now requires authority non-equivocation after freshness and before revocation/nullifier/capacity admission.
- `tests/authority-universe.test.js` now implementation-tests authority universe mismatch, global root mismatch, missing checkpoint root, unaccepted checkpoint root and known history equivocation.
- `src/hostile-harness.js` now runs a `10,000` root / `1,000` child / five-domain hostile amplification trace.
- `src/capacity-kernel.js` now includes a provider-level capacity ledger that rejects global V double-backing and V/RAM substitution failures.
- `src/revocation-policy.js` now implements `ONLINE_HIGH_ASSURANCE`, `BOUNDED_OFFLINE`, and `LOCAL_CELL` freshness profiles.
- `tests/authority-kernel.test.js` now implementation-tests conservation through delegation, reservation, quarantine and explicit `+1` rejection.
- `tests/authority-kernel.test.js` now implementation-tests missing-nullifier and blank-binding reservation rejection.
- `tests/authority-kernel.test.js` now implementation-tests stale and type-forged `base_sequence` reservation rejection.
- `tests/authority-kernel.test.js` now implementation-tests sequenced-mode missing-`base_sequence` rejection for delegation and reservation.
- `tests/authority-kernel.test.js` now implementation-tests `RETURN` rejection when release evidence mismatches the original reservation binding.
- `tests/authority-kernel.test.js` now implementation-tests that failed proposals do not advance canonical authority sequence.
- `tests/authority-kernel.test.js` now implementation-tests monotonic `attempt_sequence` for rejected attempts and the full hostile trace.
- `tests/capacity-ledger.test.js` now implementation-tests V double-backing, zero-V certificate rejection, RAM-only substitution rejection, V-only substitution rejection and capacity retirement.
- `tests/revocation-policy.test.js` now implementation-tests revocation T0/T1/T2-style behavior for online, bounded-offline and local-cell modes.
- `tests/governance-capture.test.js` now implementation-tests malicious H2 kernel rejection, profile hash pinning, ABI pinning, finality-rule pinning, finalized-H2 rejection, capacity-epoch non-retroactivity, cross-epoch V double-back rejection and admin override rejection.
- `docs/GOVERNANCE_CAPTURE_GAP_ANALYSIS.md` now records the explicit governance-capture model and remaining production assumptions.
- `tests/mandatory-dependency.test.js` now implementation-tests missing canonical authority state, V removal, A/WRAM/USDC/BTC/TOKEN_X substitution, missing unique V encumbrance and generic token-gate profile rejection.
- `src/mandatory-dependency-demo.js` now runs the dependency redlines as a reviewer-facing CLI demo.
- `docs/MANDATORY_DEPENDENCY_ANALYSIS.md` now defines the exact guarantee lost when AEGIS-V is bypassed and marks V production necessity as unproven.
- `specs/11-authority-non-equivocation-v0.md` now formalizes the current authority-cannot-fork property and the non-coordinating-domain counterexample.
- `docs/AUTHORITY_NON_EQUIVOCATION.md` now records the current theorem, strongest counterexample, V/WRAM substitution result and next experiments.
- `src/institutional-profiles.js` now defines tier-1 bank, central-bank systemic and market-infrastructure policy gates.
- `tests/institutional-profiles.test.js` now implementation-tests institutional high-assurance versus advisory/bypassable policy failure.
- `docs/INSTITUTIONAL_READINESS.md` now frames the artifact for regulated institutional architecture review without claiming endorsement.
- `src/root-binding.js` now models institutional root activation through threshold approvals without copying authority to each signer.
- `tests/root-binding.test.js` now implementation-tests multi-principal conservation, role separation, root-overrun rejection, hidden master-key rejection, recovery re-binding rejection and legal-attestation alias rejection.
- `specs/10-root-binding-v0.md` now defines the first root-binding boundary between legal/institutional authority and AEGIS authority state.
- `models/RootBinding.tla` now specifies the first recovery/re-binding non-expansion invariant; it has not yet been TLC-checked in this run.
- `docs/COMPOSITION_MODEL.md` now defines the first explicit composition-safety model and marks general module composition as unproven.
- `docs/THESIS_KILLERS.md` now tracks the highest-risk falsification tests, including multi-principal authority creation.
- `tests/authority-properties.test.js` now property-tests seeded random transition sequences and enumerated reservation interleavings.
- `models/AuthorityKernel.tla` now specifies the first conservation invariant; it has not yet been TLC-checked in this run.
- `models/AuthorityKernel.tla` now tracks reservation id uniqueness alongside obligation/nullifier uniqueness.
- `models/AuthorityKernel.tla` now includes a sequence precondition on reservation transitions.
- `models/AuthorityKernel.tla` now models active and quarantined binding tuples for consume/quarantine/return transitions.
- `models/AuthorityKernel.tla` now models rejected proposals as canonical authority no-ops that still advance `attemptSequence`.
- This remains implementation evidence, not formal proof.

## 1. Existing Repository Tree Summary

```text
README.md
package.json
LICENSE
specs/
  00-problem.md
  01-threat-model.md
  02-authority-state-machine.md
  03-proof-envelope-v0.md
  04-capacity-epoch-v0.md
  05-verifier-profile-v0.md
  06-evidence-classes-v0.md
  07-proof-obligations.md
  08-mandatory-dependency-v0.md
  09-institutional-assurance-profile-v0.md
  10-root-binding-v0.md
docs/
  ARCHITECTURE_BASELINE.md
  COMPOSITION_MODEL.md
  GITHUB_UPLOAD.md
  CURRENT_REPO_GAP_ANALYSIS.md
  EVIDENCE_LEDGER.md
  GOVERNANCE_CAPTURE_GAP_ANALYSIS.md
  INSTITUTIONAL_READINESS.md
  MANDATORY_DEPENDENCY_ANALYSIS.md
  THESIS_KILLERS.md
src/
  authority-kernel.js
  capacity-kernel.js
  canonical.js
  cli.js
  consequence-kernel.js
  demo.js
  fixtures.js
  institutional-demo.js
  institutional-profiles.js
  mandatory-dependency-demo.js
  revocation-policy.js
  root-binding.js
  scenarios.js
  types.js
  verifier.js
tests/
  authority-kernel.test.js
  authority-properties.test.js
  capacity-ledger.test.js
  governance-capture.test.js
  institutional-profiles.test.js
  mandatory-dependency.test.js
  revocation-policy.test.js
  root-binding.test.js
  scenarios.test.js
  verifier.test.js
models/
  AuthorityKernel.tla
  AuthorityKernel.cfg
  RootBinding.tla
  RootBinding.cfg
  README.md
test-vectors/
  effect-bank-payment.json
  policy-bank-profile.json
  proof-valid.json
conformance/
  profile-1.md
demos/
  capacity-ledger.md
  five-rails-100-dollar.md
  governance-capture.md
  hostile-10000-to-10001.md
  institutional-readiness.md
  mandatory-dependency.md
  revocation-profiles.md
```

## 2. What The First Git Implementation Already Got Right

- Clear non-goals: not wallet, token dashboard, production deployment or price model.
- Local verifier API exists: `verify(effect, proof, policy)`.
- Verifier returns `VALID`, `INVALID`, `STALE`, `UNKNOWN`.
- Proof checks accepted network, profile, kernel hash, schema hash, proof version, evidence class.
- Exact effect mismatch rejects wrong recipient/domain/action/amount through a bundled equality check.
- Missing capacity certificate rejects.
- Simple capacity checks reject over-encumbered V and insufficient RAM commitment.
- Complete mediation is at least represented as `agent_has_bypass_credential`.
- Consequence uncertainty returns `UNKNOWN`.
- 87 implementation/property tests pass.
- Demo clearly communicates that accepted endpoints verify proof, not AI intent.
- Reference authority state machine now conserves accounting across delegated, reserved, quarantined and consumed authority.
- Reservation binding completeness is now implementation-tested for missing and blank binding fields.
- Stale base-sequence reserve proposals are now implementation-tested and rejected.
- Sequenced states now require `base_sequence` on authority-moving transitions.
- Hostile harness now rejects a concrete `10,000 -> 10,001` amplification attempt.
- Capacity ledger now rejects global V double-backing and V/RAM substitution failures.
- Governance-capture tests now reject unaccepted H2 kernels, mutated ABIs, mutated verifier profiles, changed kernel accounts, changed finality rules, finalized malicious H2 state, C4 capacity epochs and admin override attempts.
- Mandatory-dependency tests now reject missing canonical state, V removal, A/WRAM/USDC/BTC/TOKEN_X substitutions, missing unique V encumbrance and generic token-gate profiles.
- Institutional-profile tests now distinguish high-assurance bank/central-bank/market-infrastructure policy from advisory AI policy.
- Multi-principal root-binding tests now reject signer-authority duplication, root overrun, separation-of-duties violation, hidden master-key activation, recovery re-binding duplication and legal-attestation alias duplication.
- Seeded property tests now preserve conservation across random transition sequences.
- Enumerated interleaving tests now reject same-obligation and same-funds race amplification.
- Revocation freshness profiles now distinguish fresh approval from stale revocation knowledge.
- First-pass TLA+ conservation model exists.

## 3. What It Got Wrong

The largest remaining issue is proof strength. `authority-kernel.js` now contains a real reference state machine and the repo has property/interleaving tests plus a TLA+ draft, but it is still not a completed model-checked or mathematically proven kernel.

Current implementation still risks giving the impression that tests are enough. They are not. The core AEGIS Kernel must ultimately be backed by model checking and formal proof obligations for transitions such as `DELEGATE`, `SPLIT`, `RESERVE`, `CONSUME`, `QUARANTINE`, `REVOKE`, `RETURN`, `EXPIRE`, and `MIGRATE`.

## 4. What Is Outdated Relative To The Master Architecture

- The five-rails verifier demo still uses root amount `100`; the hostile harness uses the required `10,000`.
- `1,000` child agents are modeled in the hostile harness.
- Same-obligation five-domain reserve attempts are modeled as deterministic hostile attempts and enumerated interleavings, but true distributed concurrency is not yet model-checked.
- No authority cells.
- No backend/kernel migration model.
- ONLINE_HIGH_ASSURANCE / BOUNDED_OFFLINE / LOCAL_CELL revocation profiles are implemented in the reference verifier, but distributed finality/race semantics remain incomplete.
- No principal-level authority balance sheet.
- No separate proof classes in code. Authority, capacity and finality are checked inside one `verify()` path.
- No completed TLC run, Lean proof or production-grade fuzzing harness.

## 5. What Is Missing

- Model-checked formal authority state machine.
- Complete machine-readable trace export beyond reference `attempt_sequence` / `sequence` ordering.
- Authority algebra by resource class.
- Disjoint authority cells.
- Concurrency model.
- Kernel migration policy and root-approved migration protocol.
- Upgrade/migration model.
- Capacity ledger across many certificates.
- V remove/substitute tests.
- WRAM replacement test.
- VaultRAM lineage model.
- Privacy model.
- Effect Manifest.
- Semantic drift / adapter version checks.
- Confused deputy model.
- Chain halt/fork/partition behavior.
- Completed formal methods.
- Property/fuzz hostile agent harness beyond seeded reference runs.

## 6. Highest-Severity Security Issue

Current highest-severity issue:

```text
No formal or model-checked proof exists for arbitrary transition sequences.
```

The reference state machine rejects the fixed `10,000 -> 10,001` hostile trace, but it cannot yet prove the property across arbitrary transition sequences, concurrent interleavings, migration paths, capacity-ledger states or authority cells.

## 7. Current Trust-Boundary Map

| Layer | Current Status |
|---|---|
| Real-world root binding | Reference root-binding model implemented; legal/HSM/MPC binding documented only |
| Vaulta Native Auth | Documented only |
| AEGIS Kernel | Reference state machine implemented; not formal/prod |
| Capacity Admission | Minimal certificate predicate |
| Finality | Mock checkpoint freshness only |
| Portable Proof | JSON object, not canonical binary envelope |
| External Verification | Implemented as local predicate |
| Execution | Not implemented |
| Consequence Evidence | Minimal `UNKNOWN` handling |
| Reconciliation | Not implemented |

## 8. Current TCB Map

Current security-critical code:

- `src/verifier.js`
- `src/authority-kernel.js`
- `src/capacity-kernel.js`
- `src/consequence-kernel.js`
- `src/root-binding.js`
- `src/canonical.js`

Current TCB weakness: fixtures and tests supply trusted `state` directly. There is no canonical transition history, no finality proof verification and no independent state derivation.

## 9. Current Invariant List

Documented:

- Authority cannot amplify.
- Authority cannot replay.
- Authority cannot exceed scope.
- Authority cannot resurrect after revocation.
- Capacity cannot be double-backed.
- No receipt does not mean no execution.
- Unknown consequence quarantines authority.
- Valid high-assurance proof requires a valid V-backed capacity certificate.
- Multi-principal approvals activate one conserved root; they do not copy authority.

Implementation-tested:

- Replay nullifier rejects if nullifier is already marked spent.
- Revoked mandate rejects if mandate is listed revoked.
- Missing capacity rejects.
- Over-encumbered certificate rejects.
- Missing receipt returns `UNKNOWN`.
- Delegation/reservation/quarantine conservation is implementation-tested.
- Fixed `10,000 -> 10,001` hostile amplification trace is rejected.
- Multi-principal root activation creates one institutional root, not one root per signer.

## 10. Missing Invariants

- Child authority never exceeds parent under arbitrary transition sequences.
- Exclusive reservation under true concurrent interleavings.
- Upgrade non-expansion.
- Backend epoch safety.
- Proof context integrity across all context fields.
- Semantic binding to intended economic effect.
- Complete mediation for concrete adapters.
- Capacity non-duplication across many certificates, not only one cert.
- Production root binding to legal authority, HSM/MPC controls and board/committee workflows.
- Key rotation / cryptographic agility safety.

## 11. Current Proof Model

Current proof model is a single JSON object checked by `verify()`.

It includes mock fields:

- network/profile/kernel/schema/proof version;
- root/mandate/delegation;
- effect;
- obligation/reservation/nullifier;
- checkpoint/expiry;
- capacity certificate;
- evidence class;
- consequence status.

This is useful for scaffolding, but not yet a portable proof format.

## 12. Missing Proof Bindings

Missing or not checked:

- `security_profile_id`.
- accepted migration policy.
- `capacity_certificate_id` separate from embedded cert.
- `counterparty`.
- `maximum contingent exposure`.
- `jurisdiction`.
- `reversibility/finality class`.
- execution endpoint `code_hash`.
- adapter version / semantic manifest.
- key epoch / crypto agility fields.
- privacy commitments/selective disclosure.

## 13. Kernel Identity / Upgrade Status

Kernel hash is pinned. That is good.

Missing:

- migration policy.
- root migration proof.
- old/new backend epoch lockout.
- full proof that old and new kernels cannot consume same authority across a root-approved migration.

Status:

```text
IMPLEMENTED_PARTIALLY
```

## 14. Revocation / Freshness Status

Freshness:

- implemented as checkpoint-age threshold.

Revocation:

- implemented as static list membership.

Missing:

- distributed T0/T1/T2 finality race model.
- fork/partition behavior.
- revocation race tests against adversarial scheduling.

Status:

```text
IMPLEMENTED_PARTIALLY
```

## 15. Complete-Mediation Status

Implemented only as a flag:

```text
agent_has_bypass_credential
```

This catches the concept but does not prove integration safety.

Missing:

- bank/HSM mock adapter.
- adapter credential model.
- confused deputy tests.
- classification by integration: `HIGH_ASSURANCE` vs `BYPASSABLE / ADVISORY`.

## 16. Consequence / UNKNOWN Status

Current verifier returns:

```text
UNKNOWN / CONSEQUENCE_UNKNOWN
```

Missing:

- richer later resolution by evidence.
- `FAILED_PROVEN`.
- full receipt reconciliation.
- no false release on timeout under distributed scheduling.

## 17. V Capacity Model Status

Minimal fields:

- `v_locked`
- `v_encumbered`
- `ram_committed_bytes`
- `acu_limit`
- `active_acu`
- `capacity_epoch`
- `status`

Missing:

- capacity provider account.
- lock reference.
- lease assignment.
- production/on-chain capacity ledger.
- unbonding/race/migration/partial expiration.
- production/on-chain enforcement of capacity epoch non-dilution.

## 18. V Remove Test Status

Current remove test:

- missing capacity cert -> `INVALID`.

This is necessary but insufficient. It could still be token gating if arbitrary token X could satisfy the same certificate semantics.

Status:

```text
IMPLEMENTED_PARTIALLY
```

## 19. V Substitute Test Status

Implemented partially in the reference profile. A, WRAM, USDC, BTC and TOKEN_X
substitutions are rejected under `AEGIS_V_HIGH_ASSURANCE_V0` without changing
verifier policy.

Still missing:

- ETH-specific fixture.
- production/on-chain proof that the accepted profile cannot be bypassed or
  socially replaced by arbitrary collateral.

Status:

```text
IMPLEMENTED_PARTIALLY
```

## 20. WRAM Replacement Test Status

Not implemented.

Need explicit model:

- WRAM provides physical storage.
- Can WRAM alone provide canonical admitted authority capacity?
- If yes, V thesis weakens.

Status:

```text
MISSING
```

## 21. VaultRAM Lineage Status

Existing separate audits found current V/VaultRAM on-chain state, but this repository has not imported that evidence.

Status:

```text
MISSING_IN_REPO
```

Required: source/on-chain references to `token.rms`, `stake.rms`, `bank.rms`, `rambank.eos`, capacity rows, permissions and BTC reward routing.

## 22. Vaulta Structural Advantage Status

Documented only as a candidate. Not measured.

Need substrate TCB comparison. Do not claim Vaulta wins yet.

Status:

```text
UNPROVEN
```

## 23. Ethereum Comparison

Current repo has no Ethereum comparison.

Likely questions:

- smart-account/module complexity;
- finality assumptions;
- proof/verifier cost;
- native hierarchical authority absence/presence;
- upgrade governance.

Status:

```text
MISSING
```

## 24. Solana Comparison

Current repo has no Solana comparison.

Likely questions:

- account/program authority;
- finality behavior;
- program upgrade authority;
- proof portability;
- runtime constraints.

Status:

```text
MISSING
```

## 25. Sui Comparison

Current repo has no Sui comparison.

Likely questions:

- object-centric authority model;
- ownership/permissions;
- finality/proof surfaces;
- shared object concurrency.

Status:

```text
MISSING
```

## 26. Canton Comparison

Current repo has no Canton comparison.

This is a serious gap because Canton may already have strong institutional privacy and authorization semantics.

Status:

```text
MISSING_CRITICAL
```

## 27. Traditional Bank / HSM Comparison

Current repo has no comparison against:

- IAM;
- HSM/MPC;
- bank ledger database;
- payment gateway controls;
- audit systems.

Status:

```text
MISSING_CRITICAL
```

## 28. Quant Threat / Lessons

Separate project output exists, but not imported into this repo.

Status:

```text
MISSING_IN_REPO
```

Needed: short `docs/QUANT_LESSONS.md` focused on abstraction, institutional adoption and QNT value-capture ambiguity.

## 29. NVIDIA / OpenShell Threat / Complementarity

Current repo has no OpenShell model.

Correct framing:

```text
OpenShell = local runtime containment.
AEGIS = global authority conservation.
```

Status:

```text
MISSING
```

## 30. Formal-Methods Status

TLA+ draft exists.

No Lean.

Seeded property tests exist.

Basic fuzz-style transition generation exists.

Status:

```text
PARTIAL
```

## 31. Test Coverage Status

Current tests:

- 87 Node tests.
- exact effect mismatch.
- nullifier spent.
- revoked mandate.
- capacity missing.
- double-backed single certificate.
- insufficient physical resource.
- stale checkpoint.
- unknown consequence.
- bypass credential.
- delegate/reserve/quarantine accounting.
- reservation binding completeness.
- stale base-sequence rejection.
- sequenced-mode base-sequence enforcement.
- return-binding mismatch rejection.
- failed-proposal sequence no-op hardening.
- unique audit-attempt ordering.
- same obligation across five rails.
- fixed `10,000 -> 10,001` hostile trace.
- global V capacity double-backing.
- zero-V and RAM-only substitution.
- V-only substitution without physical RAM backing.
- seeded random transition conservation.
- enumerated same-obligation race orderings.
- enumerated same-funds race orderings.
- ONLINE_HIGH_ASSURANCE revocation freshness.
- BOUNDED_OFFLINE revocation freshness.
- LOCAL_CELL expiry and required binding.
- governance-published H2 kernel rejection.
- kernel account redirect rejection.
- kernel ABI mutation rejection.
- verifier profile hash mutation rejection.
- finality rule mutation rejection.
- finalized malicious H2 state rejection.
- C4 capacity epoch rejection by C1-pinned verifier.
- cross-epoch V double-backing rejection.
- admin override rejection.
- missing canonical authority state returns UNKNOWN.
- V removal is rejected under the accepted high-assurance profile.
- A/WRAM/USDC/BTC/TOKEN_X substitution is rejected under the accepted high-assurance profile.
- missing unique V encumbrance is rejected.
- generic token-gate profile is rejected.
- tier-1 bank high-value policy gate.
- central-bank systemic stricter policy gate.
- advisory AI policy cannot pass as high-assurance.
- multi-principal root activation creates one conserved root.
- threshold signers cannot each become independent roots.
- separation-of-duties violation rejected.
- hidden emergency master key activation rejected.
- authorization above the institutional root rejected.
- recovery re-binding under a new root id rejected for the same principal.
- principal aliasing rejected for the same legal attestation.
- reservation without nullifier rejected.
- reservation with blank binding fields rejected.
- stale base-sequence reservation rejected.
- non-integer base-sequence reservation rejected.
- sequenced-mode delegation without base_sequence rejected.
- sequenced-mode reservation without base_sequence rejected.
- rejected attempts have unique monotonic audit order.

Good for verifier, first state-machine scaffold and early property testing. Insufficient for high-assurance architecture.

## 32. Top 20 Adversarial Tests Still Missing

1. distributed concurrent `10,000 -> 10,001` interleaving model.
2. property/fuzz version of 1,000 child-agent amplification beyond seeded reference scale.
3. parallel reservation race with arbitrary distributed scheduler.
4. delegation copies instead of transfers.
5. hierarchy double-counting.
6. same obligation across five rails under network partition / delayed finality.
7. same reservation under two domains.
8. distributed stale proof plus revocation/finality race.
9. ONLINE_HIGH_ASSURANCE under chain fork/partition.
10. BOUNDED_OFFLINE under delayed finality.
11. LOCAL_CELL handoff / merge after expiry.
12. later evidence resolves unknown consequence quarantine.
13. later evidence resolves quarantine.
14. kernel H1/H2 migration.
15. old/new backend double execution.
16. production/on-chain capacity epoch dilution.
17. V unbonding/reuse race.
18. confused deputy adapter.
19. semantic drift / adapter version change.
20. chain halt/fork/partition fail-closed.

## 33. Top 10 Thesis Killers Still Unresolved

1. Complete mediation cannot be enforced in meaningful domains.
2. V can be replaced by arbitrary collateral in production.
3. Canton or bank/HSM stack offers lower-risk institutional alternative.
4. Privacy cannot coexist with canonical coordination.
5. Authority state machine amplifies under true concurrency or migration.
6. Revocation semantics are unsafe.
7. Unknown consequence causes unsafe release.
8. Kernel migration duplicates authority.
9. Scaling requires every action to globally serialize.
10. Vaulta/V cannot prove resource-native necessity.

## 34. Exact Next Commits In Dependency Order

1. `docs: add repo gap analysis and evidence ledger`
2. `spec: define typed effect manifest`
3. `kernel: introduce executable authority state machine` DONE IN v0.0.2
4. `test: add 10000-to-10001 hostile trace baseline` DONE IN v0.0.2
5. `kernel: implement reserve/consume/quarantine transitions` DONE IN v0.0.2
6. `test: add parallel reservation and nullifier race cases`
7. `capacity: introduce global capacity ledger` DONE IN v0.0.3
8. `test: add V remove/substitute/WRAM replacement tests` PARTIAL IN v0.0.3
9. `spec: define revocation freshness profiles` DONE IN v0.0.5
10. `formal: add initial TLA+ model for reserve/consume/quarantine` DONE IN v0.0.4
11. `security: harden verifier against governance capture` DONE IN v0.0.6
12. `security: add mandatory dependency redline tests` DONE IN v0.0.7
13. `institutional: add regulated assurance profiles` DONE IN v0.0.8
14. `security: add multi-principal root-binding conservation` DONE IN v0.0.9
15. `security: add recovery re-binding non-expansion` DONE IN v0.0.10
16. `kernel: require complete reservation bindings` DONE IN v0.0.11
17. `kernel: reject stale base-sequence transitions` DONE IN v0.0.12
18. `kernel: require base sequence in sequenced mode` DONE IN v0.0.13
19. `kernel: bind return evidence to reservations` DONE IN v0.0.14
20. `kernel: keep failed proposals sequence-neutral` DONE IN v0.0.15
21. `kernel: add monotonic audit attempt ordering` DONE IN v0.0.16

## 35. Files That Should Be Modified

- `specs/02-authority-state-machine.md`
- `specs/03-proof-envelope-v0.md`
- `specs/04-capacity-epoch-v0.md`
- `specs/05-verifier-profile-v0.md`
- `specs/07-proof-obligations.md`
- `src/authority-kernel.js`
- `src/capacity-kernel.js`
- `src/consequence-kernel.js`
- `src/root-binding.js`
- `src/scenarios.js`
- `src/verifier.js`
- `tests/*.test.js`
- new `models/` directory
- new `docs/` comparison files

## 36. Files That Should Not Be Touched

Unless necessary:

- `LICENSE`
- `.gitignore`
- `docs/GITHUB_UPLOAD.md`
- `package.json` scripts that currently pass
- existing test vectors except when versioning them forward

Do not rewrite working code merely for style.

## 37. What Must Be Proven Before v0.4 Whitepaper

- Non-amplification under transition sequences.
- Delegation conservation.
- Exclusive reservation under concurrency.
- Unknown safety.
- Revocation profile safety.
- Kernel upgrade non-expansion.
- Capacity non-duplication across a global ledger.
- Governance non-expansion under captured governance.
- V remove/substitute test result.
- Mandatory canonical state dependency.
- WRAM replacement test result.
- At least one concrete complete-mediation adapter model.
- Privacy architecture sketch.
- Substrate comparison against Ethereum/Solana/Sui/Canton/bank-HSM.

## 38. GO / MODIFY / PIVOT / KILL Verdict

```text
MODIFY
```

Do not kill. The repo has a valid first reference-verifier scaffold and a clear category demo.

Do not claim high assurance yet. The current implementation rejects one concrete `10,000 -> 10,001` hostile trace, but it is not yet a formal model and not yet a proof over all schedules, migrations, capacity states or authority cells.

Immediate priority:

```text
Run TLC on the first TLA+ model, expand it to holders/delegation, and model distributed revocation/finality races.
```

## Requirement Mapping Table

| Requirement | Existing File / Code | Status | Problem | Security Impact | Required Change | Priority |
|---|---|---|---|---|---|---|
| Trust-boundary separation | `docs/ARCHITECTURE_BASELINE.md` | IMPLEMENTED_PARTIALLY | docs only | prevents conceptual confusion but not code bugs | keep and expand | P1 |
| Canonical kernel identity | `src/verifier.js`, `fixtures.js`, `tests/governance-capture.test.js` | IMPLEMENTED_PARTIALLY | no migration policy | old/new kernel trust risk | add `SecurityProfile` object and migration manifest | P1 |
| Authority state machine | `src/authority-kernel.js`, `tests/authority-properties.test.js`, `models/AuthorityKernel.tla` | IMPLEMENTED_PARTIALLY | reference + draft formal model only | not TLC/model-checked | run TLC and expand model | P0 |
| Full-context proof binding | `src/verifier.js`, `specs/03` | IMPLEMENTED_PARTIALLY | many fields absent/not checked | substitution risk | add Effect Manifest | P1 |
| Three proof classes | no separate modules | MISSING | single verifier path | unclear proof responsibilities | split authority/capacity/finality checks | P2 |
| Revocation profiles | `src/revocation-policy.js`, `tests/revocation-policy.test.js` | IMPLEMENTED_PARTIALLY | local verifier semantics only | distributed revocation/finality race risk | model chain/finality race | P1 |
| One-time consumption | nullifier list + reservation model | IMPLEMENTED_PARTIALLY | complete binding, sequenced-mode base-sequence requirement and enumerated local interleavings only | distributed scheduler is not model-checked | model distributed scheduler | P0 |
| Complete mediation | bypass flag | IMPLEMENTED_PARTIALLY | no adapter model | false high-assurance claim | mock bank gateway | P1 |
| Consequence evidence | `consequence-kernel.js`, `src/authority-kernel.js` | IMPLEMENTED_PARTIALLY | quarantine exists; resolve path thin | unsafe release unresolved | model receipt resolution | P1 |
| Capacity conservation | `capacity-kernel.js` | IMPLEMENTED_PARTIALLY | reference ledger only | no production/on-chain enforcement | add contract/kernel binding | P0 |
| Governance non-expansion | `src/verifier.js`, `tests/governance-capture.test.js`, `docs/GOVERNANCE_CAPTURE_GAP_ANALYSIS.md` | IMPLEMENTED_PARTIALLY | reference-only; real permissions unknown | captured governance may affect liveness and social upgrade pressure | import Vaulta account permissions and model migration | P0 |
| Mandatory dependency | `src/verifier.js`, `tests/mandatory-dependency.test.js`, `docs/MANDATORY_DEPENDENCY_ANALYSIS.md` | IMPLEMENTED_PARTIALLY | reference-only; no production contracts | bypassed domains lose canonical global authority view | model equivalent-system counterexamples | P0 |
| Institutional readiness | `src/institutional-profiles.js`, `tests/institutional-profiles.test.js`, `docs/INSTITUTIONAL_READINESS.md` | IMPLEMENTED_PARTIALLY | policy gate only; no real institution approval | separates high-assurance profile from advisory AI claims | add bank/HSM adapter model | P0 |
| Multi-principal root binding | `src/root-binding.js`, `tests/root-binding.test.js`, `specs/10-root-binding-v0.md`, `models/RootBinding.tla` | IMPLEMENTED_PARTIALLY | legal/HSM/MPC root binding not implemented | board/committee workflows could accidentally mint authority if modeled as separate roots | add bank/HSM adapter and recovery ceremony model | P0 |
| V necessity | `capacity-kernel.js`, `tests/capacity-ledger.test.js`, `tests/mandatory-dependency.test.js` | IMPLEMENTED_PARTIALLY | profile rule only | production bypass still possible | prove non-bypass path | P1 |
| VaultRAM lineage | external audits only | MISSING | not in repo | V-specific case unsupported | import evidence ledger | P2 |
| Formal methods | `models/AuthorityKernel.tla` | IMPLEMENTED_PARTIALLY | not TLC-checked or complete | high-assurance unsupported | run TLC and expand TLA+ | P1 |
| Substrate comparison | none | MISSING | Vaulta advantage unproven | strategic overclaim | docs matrix | P2 |
