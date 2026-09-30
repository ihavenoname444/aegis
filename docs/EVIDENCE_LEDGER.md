# AEGIS-V Evidence Ledger

Evidence labels:

- MATHEMATICALLY_PROVEN
- MODEL_CHECKED
- PROPERTY_TESTED
- IMPLEMENTATION_TESTED
- SOURCE_VERIFIED
- ON_CHAIN_VERIFIED
- OFFICIALLY_DOCUMENTED
- STRONGLY_INFERRED
- ASSUMED
- UNPROVEN
- CONTRADICTED

Do not silently upgrade a claim. A claim can only move to a stronger label when new evidence is added.

| Claim | Current Status | Evidence | Notes |
|---|---|---|---|
| `aegis.verify(effect, proof, policy)` returns `VALID`, `INVALID`, `STALE`, or `UNKNOWN`. | IMPLEMENTATION_TESTED | `src/verifier.js`, `tests/*.test.js` | Covered by the verifier tests. |
| Wrong recipient is rejected. | IMPLEMENTATION_TESTED | `tests/verifier.test.js` | Covered by exact-effect binding check. |
| Wrong execution domain is rejected. | IMPLEMENTATION_TESTED | `tests/scenarios.test.js` | Covered through effect mismatch. |
| Replayed nullifier is rejected if already present in state. | IMPLEMENTATION_TESTED | `tests/verifier.test.js` | State is supplied externally; no transition model yet. |
| Missing capacity certificate is rejected. | IMPLEMENTATION_TESTED | `tests/verifier.test.js` | Demonstrates V-removal redline in reference verifier only. |
| Double-backed V within one certificate is rejected when `v_encumbered > v_locked`. | IMPLEMENTATION_TESTED | `tests/verifier.test.js` | Verifier-level single certificate check. |
| Double-backed V across live capacity certificates is rejected by the reference ledger. | IMPLEMENTATION_TESTED | `src/capacity-kernel.js`, `tests/capacity-ledger.test.js` | Global provider-level sum cannot exceed `v_locked`. |
| Insufficient RAM/resource backing is rejected. | IMPLEMENTATION_TESTED | `tests/verifier.test.js` | Simple threshold check only. |
| RAM cannot substitute for missing V in the capacity ledger. | IMPLEMENTATION_TESTED | `tests/capacity-ledger.test.js` | RAM-only provider and zero-V certificate paths are rejected. |
| V cannot substitute for missing physical RAM backing in the capacity ledger. | IMPLEMENTATION_TESTED | `tests/capacity-ledger.test.js` | V-only provider cannot issue a certificate requiring RAM backing. |
| Agent bypass credential is rejected in high-assurance mode. | IMPLEMENTATION_TESTED | `tests/verifier.test.js` | Real adapter complete mediation is not modeled. |
| Unknown consequence returns `UNKNOWN`. | IMPLEMENTATION_TESTED | `tests/verifier.test.js` | Verifier-level result; state-machine quarantine is tested separately. |
| Conservation report can show accounting equals root authority after transitions. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js` | Covers delegate, reserve, quarantine and hostile trace accounting. |
| Delegation conserves authority in the reference state machine. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js` | Parent available decreases and child available increases by the same amount. |
| Reservation consumes available authority without increasing total authority. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js` | Reservation moves authority from available to reserved. |
| Reservations require complete non-blank authority-binding fields. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js` | Missing `nullifier` and blank `execution_domain` reservations return `INVALID_RESERVATION_BINDING`. |
| Return/release evidence must match the original reservation binding. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js`, `models/AuthorityKernel.tla` | Mismatched holder, obligation, nullifier, amount, effect or execution domain returns `RESERVATION_BINDING_MISMATCH`; TLA draft now models active binding tuples. |
| Transitions with explicit stale or non-integer `base_sequence` fail closed. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js`, `models/AuthorityKernel.tla` | Stale and string-typed reserve proposals return `STALE_STATE`; base sequence is modeled in the AuthorityKernel draft. |
| Sequenced authority states require `base_sequence` on authority-moving transitions. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js`, `models/AuthorityKernel.tla` | `DELEGATE` and `RESERVE` without `base_sequence` return `BASE_SEQUENCE_REQUIRED` when `require_base_sequence` is enabled. |
| Failed proposals do not advance canonical authority sequence. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js`, `models/AuthorityKernel.tla` | Insufficient and missing-base proposals leave `sequence` unchanged, so the next valid proposal with the same base sequence can still execute; TLA draft models rejected proposals as canonical authority no-ops. |
| Accepted and rejected authority attempts have unique monotonic audit order. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `src/hostile-harness.js`, `tests/authority-kernel.test.js`, `models/AuthorityKernel.tla` | `attempt_sequence` advances on every attempted transition while canonical `sequence` advances only on accepted transitions; hostile trace asserts monotonic attempt order. |
| Same obligation cannot reserve across five rails in the hostile demo. | IMPLEMENTATION_TESTED | `src/hostile-harness.js`, `tests/authority-kernel.test.js` | One reservation succeeds; four rail replays fail with `OBLIGATION_ALREADY_BOUND`. |
| `10,000 -> 10,001` hostile amplification is rejected in the reference harness. | IMPLEMENTATION_TESTED | `src/hostile-harness.js`, `src/hostile-demo.js`, `tests/authority-kernel.test.js` | 1,000 child agents, five domains, replay, lost receipt quarantine, stale proof, old capacity epoch and explicit +1 attempts. |
| Unknown/lost receipt can quarantine reserved authority in the state machine. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js` | Quarantined authority remains accounted and unavailable. |
| `ONLINE_HIGH_ASSURANCE` revocation profile requires fresh revocation view. | IMPLEMENTATION_TESTED | `src/revocation-policy.js`, `tests/revocation-policy.test.js` | Fresh view validates; old view returns `STALE / REVOCATION_VIEW_STALE`; known revocation invalidates. |
| `BOUNDED_OFFLINE` revocation profile limits offline revocation staleness. | IMPLEMENTATION_TESTED | `src/revocation-policy.js`, `tests/revocation-policy.test.js` | Within bound validates; outside bound returns `STALE / REVOCATION_VIEW_STALE`. |
| `LOCAL_CELL` revocation profile requires unexpired local cell. | IMPLEMENTATION_TESTED | `src/revocation-policy.js`, `tests/revocation-policy.test.js` | Missing cell invalidates; expired cell returns `STALE / LOCAL_CELL_EXPIRED`. |
| Verifier rejects unaccepted governance-published kernel H2. | IMPLEMENTATION_TESTED | `src/verifier.js`, `tests/governance-capture.test.js` | `accepted_kernel_hashes` and `accepted_kernel_abi_hashes` are verifier-local. |
| Verifier rejects unaccepted verifier profile hash changes. | IMPLEMENTATION_TESTED | `src/verifier.js`, `tests/governance-capture.test.js` | Governance cannot make a weaker profile accepted solely by labeling it current. |
| Finalized malicious H2 state is rejected if outside accepted profile. | IMPLEMENTATION_TESTED | `src/verifier.js`, `tests/governance-capture.test.js` | Finality does not override verifier sovereignty. |
| Governance-published capacity epoch C4 is rejected by verifier pinned to C1. | IMPLEMENTATION_TESTED | `src/capacity-kernel.js`, `src/verifier.js`, `tests/governance-capture.test.js` | Capacity epoch changes are explicit and non-retroactive in the reference verifier. |
| Same V cannot back old and new capacity epochs simultaneously in the reference ledger. | IMPLEMENTATION_TESTED | `src/capacity-kernel.js`, `tests/governance-capture.test.js` | Active certificates are summed globally across epochs. |
| Admin override cannot bypass nullifier or authority-state checks. | IMPLEMENTATION_TESTED | `src/verifier.js`, `tests/governance-capture.test.js` | `admin_override_authority_state` is rejected. |
| Quarantined authority cannot be released without resolution proof. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/governance-capture.test.js` | `RETURN` from `QUARANTINED` requires `resolution_proof_id`. |
| High-assurance verification requires canonical authority state. | IMPLEMENTATION_TESTED | `src/verifier.js`, `tests/mandatory-dependency.test.js` | Missing state returns `UNKNOWN / CANONICAL_STATE_REQUIRED`. |
| High-assurance verification requires an accepted authority universe. | IMPLEMENTATION_TESTED | `src/authority-universe.js`, `tests/authority-universe.test.js` | Proofs from another `authority_universe_id` return `INVALID / AUTHORITY_UNIVERSE_REJECTED`. |
| High-assurance verification requires an accepted global authority root. | IMPLEMENTATION_TESTED | `src/authority-universe.js`, `tests/authority-universe.test.js` | Proofs from another `global_authority_root_id` return `INVALID / GLOBAL_AUTHORITY_ROOT_REJECTED`. |
| High-assurance verification requires an authority-state checkpoint root. | IMPLEMENTATION_TESTED | `src/authority-universe.js`, `tests/authority-universe.test.js` | Missing checkpoint `authority_state_root` returns `INVALID / AUTHORITY_CHECKPOINT_REQUIRED`. |
| Known conflicting authority checkpoint histories are rejected. | IMPLEMENTATION_TESTED | `src/authority-universe.js`, `tests/authority-universe.test.js` | Same checkpoint id or sequence under the same authority universe/root with a different `authority_state_root` returns `INVALID / AUTHORITY_HISTORY_EQUIVOCATED`. |
| Accepted high-assurance capacity profile requires explicit V capacity asset. | IMPLEMENTATION_TESTED | `src/capacity-kernel.js`, `tests/mandatory-dependency.test.js` | A, WRAM, USDC, BTC and TOKEN_X substitutions are rejected under `AEGIS_V_HIGH_ASSURANCE_V0`. |
| Accepted high-assurance capacity profile requires unique V encumbrance. | IMPLEMENTATION_TESTED | `src/capacity-kernel.js`, `tests/mandatory-dependency.test.js` | Certificate with `unique_v_encumbrance: false` is rejected. |
| Generic token-gating profile is rejected by the accepted verifier policy. | IMPLEMENTATION_TESTED | `tests/mandatory-dependency.test.js` | `GENERIC_TOKEN_GATE` capacity profile is rejected. |
| Tier-1 bank high-value policy gates are machine-checkable. | IMPLEMENTATION_TESTED | `src/institutional-profiles.js`, `tests/institutional-profiles.test.js` | Base high-assurance policy satisfies canonical state, mediation, pinning, capacity and fail-closed controls. |
| Tier-1 bank high-value policy requires authority non-equivocation controls. | IMPLEMENTATION_TESTED | `src/institutional-profiles.js`, `tests/institutional-profiles.test.js` | Profile gates require authority non-equivocation, accepted authority universe, accepted global authority root and accepted authority-state roots. |
| Central-bank systemic profile is stricter than bank high-value profile. | IMPLEMENTATION_TESTED | `tests/institutional-profiles.test.js` | Requires evidence class A, tighter finality freshness, single capacity epoch and online revocation. |
| Advisory AI policy cannot pass as institutional high-assurance. | IMPLEMENTATION_TESTED | `tests/institutional-profiles.test.js`, `src/institutional-demo.js` | Missing canonical state, complete mediation, V capacity and fail-closed UNKNOWN behavior fails. |
| Multi-principal root approval activates one conserved institutional root. | IMPLEMENTATION_TESTED | `src/root-binding.js`, `tests/root-binding.test.js` | 2-of-3 treasury plus risk approval creates one 10,000 root, not per-officer roots. |
| Threshold signers cannot each become independent roots for the same authority. | IMPLEMENTATION_TESTED | `tests/root-binding.test.js` | Re-activating the same root returns `ROOT_ALREADY_ACTIVE`. |
| Separation-of-duties is enforced in the reference root-binding model. | IMPLEMENTATION_TESTED | `tests/root-binding.test.js` | Same actor cannot satisfy treasury and risk when separation is required. |
| Hidden emergency master key cannot activate root authority in the reference model. | IMPLEMENTATION_TESTED | `tests/root-binding.test.js` | Returns `HIDDEN_MASTER_KEY_REJECTED`; broader recovery remains unmodeled. |
| Recovery/re-binding cannot activate a second root for the same principal. | IMPLEMENTATION_TESTED | `src/root-binding.js`, `tests/root-binding.test.js` | Same `principal_id` under a new `root_id` returns `PRINCIPAL_ALREADY_ACTIVE`. |
| Principal aliasing cannot reuse the same legal attestation to activate a second root. | IMPLEMENTATION_TESTED | `src/root-binding.js`, `tests/root-binding.test.js` | Same `legal_attestation_id` under a new `principal_id` returns `LEGAL_ATTESTATION_ALREADY_ACTIVE`. |
| Seeded random authority transition sequences preserve conservation. | PROPERTY_TESTED | `tests/authority-properties.test.js` | 60 deterministic seeds x 120 transitions; covers mixed valid/invalid delegate/reserve/consume/quarantine/return attempts. |
| Same-obligation race accepts at most one rail across enumerated orderings. | PROPERTY_TESTED | `tests/authority-properties.test.js` | Enumerates all orderings of five rail attempts sharing one obligation/nullifier. |
| Distinct obligations racing for the same funds cannot overspend holder balance across enumerated orderings. | PROPERTY_TESTED | `tests/authority-properties.test.js` | Enumerates all orderings of four reserve attempts against one 10-unit holder. |
| Authority cannot amplify under arbitrary transition sequences. | UNPROVEN | `models/AuthorityKernel.tla` draft | Requires TLC/model checking and broader formal model beyond seeded property tests. |
| Authority cannot fork across arbitrary distributed schedules. | UNPROVEN | `models/AuthorityUniverse.tla`, `specs/11-authority-non-equivocation-v0.md` | First implementation rejects known forked checkpoint histories, but no full partition/finality/migration proof exists yet. |
| Independent non-coordinating domains can guarantee global authority conservation under arbitrary concurrency. | CONTRADICTED | `specs/11-authority-non-equivocation-v0.md`, `docs/AUTHORITY_NON_EQUIVOCATION.md` | Minimal stale-local-state counterexample reserves 8,000 + 8,000 from a 10,000 root without common coordination, escrow partitioning or serialization. |
| Authority cells scale without global action per micro-action. | UNPROVEN | none | No cells implementation. |
| General module composition is safe. | UNPROVEN | `docs/COMPOSITION_MODEL.md` | Multi-principal root composition is tested; arbitrary module composition is not. |
| Reference revocation profile behavior is implemented for ONLINE/BOUNDED_OFFLINE/LOCAL_CELL modes. | IMPLEMENTATION_TESTED | `tests/revocation-policy.test.js` | Local verifier behavior is covered. |
| Distributed revocation race/finality semantics are safe. | UNPROVEN | none | Requires chain fork/partition/finality model and adversarial scheduling. |
| Capacity epochs cannot be silently diluted inside an existing verifier profile. | IMPLEMENTATION_TESTED | `tests/governance-capture.test.js` | Old verifier rejects C4; production still needs on-chain epoch governance review. |
| Kernel migration cannot duplicate authority. | UNPROVEN | `tests/governance-capture.test.js` partial | H2 is rejected unless accepted, but full root-approved migration conservation is not implemented. |
| V is necessary in the accepted reference high-assurance profile. | IMPLEMENTATION_TESTED | `src/capacity-kernel.js`, `tests/capacity-ledger.test.js`, `tests/mandatory-dependency.test.js` | This proves the model/profile rule, not real-world non-bypassability. |
| V is necessary for authority non-equivocation itself. | CONTRADICTED | `specs/11-authority-non-equivocation-v0.md`, `docs/AUTHORITY_NON_EQUIVOCATION.md` | The non-equivocation primitive comes from canonical authority history and complete mediation; V is capacity/economic backing in the accepted profile. |
| V is necessary rather than arbitrary collateral in production. | UNPROVEN | `docs/MANDATORY_DEPENDENCY_ANALYSIS.md` | Requires on-chain mechanism, substitute-asset analysis, VaultRAM lineage and institutional acceptance. |
| Vaulta has smaller end-to-end TCB than alternatives. | UNPROVEN | none | Requires substrate comparison. |
| Named banks, central banks or conglomerates have reviewed/adopted AEGIS-V. | UNPROVEN | none | This repo uses institutional archetypes only; it makes no endorsement or adoption claim. |
| Complete mediation can be achieved for meaningful adapters. | UNPROVEN | `docs/ARCHITECTURE_BASELINE.md` assumption | Needs adapter architecture/prototype. |
| First-pass TLA+ conservation models exist. | UNPROVEN | `models/AuthorityKernel.tla`, `models/RootBinding.tla` | Written but not TLC-checked in this run. |
| Formal methods support the invariants. | UNPROVEN | `models/*.tla` drafts | Needs TLC run, counterexample review and expanded holder/delegation/capacity/root-binding model. |
