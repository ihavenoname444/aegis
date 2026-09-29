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
| Same obligation cannot reserve across five rails in the hostile demo. | IMPLEMENTATION_TESTED | `src/hostile-harness.js`, `tests/authority-kernel.test.js` | One reservation succeeds; four rail replays fail with `OBLIGATION_ALREADY_BOUND`. |
| `10,000 -> 10,001` hostile amplification is rejected in the reference harness. | IMPLEMENTATION_TESTED | `src/hostile-harness.js`, `src/hostile-demo.js`, `tests/authority-kernel.test.js` | 1,000 child agents, five domains, replay, lost receipt quarantine, stale proof, old capacity epoch and explicit +1 attempts. |
| Unknown/lost receipt can quarantine reserved authority in the state machine. | IMPLEMENTATION_TESTED | `src/authority-kernel.js`, `tests/authority-kernel.test.js` | Quarantined authority remains accounted and unavailable. |
| `ONLINE_HIGH_ASSURANCE` revocation profile requires fresh revocation view. | IMPLEMENTATION_TESTED | `src/revocation-policy.js`, `tests/revocation-policy.test.js` | Fresh view validates; old view returns `STALE / REVOCATION_VIEW_STALE`; known revocation invalidates. |
| `BOUNDED_OFFLINE` revocation profile limits offline revocation staleness. | IMPLEMENTATION_TESTED | `src/revocation-policy.js`, `tests/revocation-policy.test.js` | Within bound validates; outside bound returns `STALE / REVOCATION_VIEW_STALE`. |
| `LOCAL_CELL` revocation profile requires unexpired local cell. | IMPLEMENTATION_TESTED | `src/revocation-policy.js`, `tests/revocation-policy.test.js` | Missing cell invalidates; expired cell returns `STALE / LOCAL_CELL_EXPIRED`. |
| Seeded random authority transition sequences preserve conservation. | PROPERTY_TESTED | `tests/authority-properties.test.js` | 60 deterministic seeds x 120 transitions; covers mixed valid/invalid delegate/reserve/consume/quarantine/return attempts. |
| Same-obligation race accepts at most one rail across enumerated orderings. | PROPERTY_TESTED | `tests/authority-properties.test.js` | Enumerates all orderings of five rail attempts sharing one obligation/nullifier. |
| Distinct obligations racing for the same funds cannot overspend holder balance across enumerated orderings. | PROPERTY_TESTED | `tests/authority-properties.test.js` | Enumerates all orderings of four reserve attempts against one 10-unit holder. |
| Authority cannot amplify under arbitrary transition sequences. | UNPROVEN | `models/AuthorityKernel.tla` draft | Requires TLC/model checking and broader formal model beyond seeded property tests. |
| Authority cells scale without global action per micro-action. | UNPROVEN | none | No cells implementation. |
| Reference revocation profile behavior is implemented for ONLINE/BOUNDED_OFFLINE/LOCAL_CELL modes. | IMPLEMENTATION_TESTED | `tests/revocation-policy.test.js` | Local verifier behavior is covered. |
| Distributed revocation race/finality semantics are safe. | UNPROVEN | none | Requires chain fork/partition/finality model and adversarial scheduling. |
| Kernel migration cannot duplicate authority. | UNPROVEN | none | No migration model. |
| Capacity epochs cannot be silently diluted. | ASSUMED | `specs/04-capacity-epoch-v0.md`, `specs/05-verifier-profile-v0.md` | Verifier pins accepted epochs and ledger tracks live certificate sums, but no migration/epoch transition model. |
| V is necessary in the reference capacity-ledger model. | IMPLEMENTATION_TESTED | `src/capacity-kernel.js`, `tests/capacity-ledger.test.js` | This proves the model rule, not real-world non-bypassability. |
| V is necessary rather than arbitrary collateral in production. | UNPROVEN | none | Requires on-chain mechanism, remove/substitute analysis, VaultRAM lineage and institutional acceptance. |
| Vaulta has smaller end-to-end TCB than alternatives. | UNPROVEN | none | Requires substrate comparison. |
| Complete mediation can be achieved for meaningful adapters. | UNPROVEN | `docs/ARCHITECTURE_BASELINE.md` assumption | Needs adapter architecture/prototype. |
| First-pass TLA+ conservation model exists. | UNPROVEN | `models/AuthorityKernel.tla`, `models/AuthorityKernel.cfg` | Written but not TLC-checked in this run. |
| Formal methods support the invariants. | UNPROVEN | `models/AuthorityKernel.tla` draft | Needs TLC run, counterexample review and expanded holder/delegation/capacity model. |
