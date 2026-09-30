# Protected Authority State v0

Status: architecture proposal; no protected-state protocol implementation exists in this repository. A partial live Vaulta permission/code/feature snapshot was captured on 2026-09-30 and is documented in [`docs/VAULTA_PRIVILEGE_SNAPSHOT_2026-09-30.md`](../docs/VAULTA_PRIVILEGE_SNAPSHOT_2026-09-30.md). It is not an atomic state-history proof at one LIB; validator software, exact deployed-source identity, action-level authorization, and migration paths remain unverified.

## Executive Summary

AEGIS has two separate security boundaries:

1. **Verifier-level sovereignty:** an institution follows a chain for ordering and finality, then independently checks whether each authority transition is valid under its pinned profile. This can be built as an overlay. This repository demonstrates parts of the verifier logic, but does not yet contain a production Vaulta reader, complete authenticated history, adapter, or deployment.
2. **Consensus-protected authority state:** validators reject blocks that change AEGIS protected state except through the accepted transition rules. An ordinary contract deployment cannot establish this guarantee against every sufficiently privileged code, permission, or protocol change. It requires support in the consensus software and a coordinated network upgrade.

The target is both layers. A network can publish a new regime, H2; an institution pinned to H1 continues to reject H2 until it explicitly opts in. Network finality proves what a network finalized. It does not by itself prove that the resulting state is valid authority for an institution.

`H1`, `C3`, `F1`, and `P1` below are illustrative profile labels. They are not yet canonical profile objects in this repository.

## Terms and Claims

```text
NETWORK FINALITY != AUTHORITY VALIDITY
CANONICAL CHAIN != AUTOMATIC INSTITUTION ACCEPTANCE
```

The network determines transaction ordering, inclusion, finality, availability, liveness, and protocol regime. The institution's verifier determines accepted kernel semantics, transition rules, capacity rules, schemas, finality policy, checkpoints, migrations, and authority state.

This proposal does not claim that block producers cannot change network software, coordinate a new protocol regime, censor transactions, or halt progress. It requires that such a change cannot silently inherit an H1 verifier's trust.

## Current Antelope Privilege Audit

The following separates documented Antelope mechanisms from the still-incomplete Vaulta mainnet audit. Standard transaction permissions and protocol software changes are different mechanisms; neither should be summarized as an unspecified “god mode.”

| Mechanism | What the available primary documentation establishes | What remains unverified for Vaulta mainnet |
|---|---|---|
| `setcode` / `setabi` | Contract code and ABI change through authorized chain actions; a target account's permission graph determines the applicable authority. | The live `eosio` ABI exposes these actions. Its owner and active permissions point to `eosio.prods@active` (15 of the 21 active producers). Exact authorization level and behavior for every target/action still need a source/replay trace. |
| `updateauth` | Permission authorities change through an authorized system-contract action; the current authority graph governs that action. | The live `eosio` ABI exposes `updateauth`; `eosio@active` is reachable through `eosio.prods@active` at 15/21. All relevant target-account authorities and any special restrictions still need enumeration. |
| `eosio.msig` | Multisig coordinates approval of transactions. Its threshold is the authority required by the proposed transaction; it is not a separate universal privilege threshold. | Live account is `privileged=true`, owner/active point to `eosio@active`, and the current ABI has the standard proposal/approval actions. Code/ABI hashes are in the snapshot; active proposals and bytecode/source identity remain unverified. |
| `eosio.wrap::exec` | The reference wrapper can execute wrapped actions through a privileged transaction path; exact behavior depends on deployed code and authority. | Live account is `privileged=true`; ABI exposes `exec`; owner/active point to `eosio@active`, which resolves to 15/21. Code and ABI hashes are recorded. The deployed code hash has not been matched to a reproducible source build, so do not claim every upstream source behavior is proven for this deployment. |
| Privileged host APIs / protocol features | Antelope exposes privileged interfaces to privileged execution contexts; protocol features are software-supported rules that can be preactivated/activated. | Snapshot observed `eosio`, `eosio.msig`, and `eosio.wrap` as privileged and Savanna as activated. The API provider reported Spring `v1.0.5`; that does not establish software versions used by all validators or exhaust the privileged-intrinsic surface. |
| Generic arbitrary table write | The documentation reviewed does not establish a standard transaction action that directly overwrites arbitrary contract tables without executing authorized code. This is not a proof that every native or chain-specific path has been excluded. | Full source audit of the deployed Leap/Vaulta build, native actions, privileged contracts, and any migration hooks. |
| Validator software / consensus change | Antelope's consensus and protocol behavior are implemented across node software and on-chain contracts. Operators can coordinate a new software regime; an old H1 verifier must therefore pin the regime it accepts. | Vaulta-specific upgrade procedure, activation rules, release currently used by validators, and operational thresholds. |

The reference `eosio.wrap` guide's 15-of-21 example is not evidence of Vaulta configuration. Independently, the 2026-09-30 read-only chain snapshot observed the same 15-of-21 threshold on Vaulta, with an exact 21-account match to the active schedule. This is partial on-chain evidence, not an atomic single-LIB state proof. See the snapshot for block numbers, hashes, source limits, and remaining audit work.

### Threat Model by Actor Set

| Adversary | Conditional capability | H1-pinned verifier | Current contract-only overlay | Future protected-state domain |
|---|---|---|---|---|
| 15/21 BPs | Can satisfy the observed `eosio.prods@active` authority, which controls `eosio@active` and the observed `eosio.wrap@active`/`eosio.msig@active` permissions. The exact effects of each action still depend on its required permission, deployed code, and node behavior. | Rejects non-H1 transitions only when it receives complete, authenticated transition evidence and the execution adapter requires the check. | Cannot force an institution to accept a changed profile, but cannot prevent a chain-level state change or an adapter bypass. | Consensus rejects a transition that violates the active H1 state rules. |
| 21/21 BPs | Can coordinate a new validator software/network regime, subject to the actual chain and operator behavior. This may halt the old regime or create H2. | Continues to reject H2 unless the institution opts in. | Provides no guarantee that the chain itself remains H1. | Old H1 nodes reject invalid H1 transitions; H2 remains a distinct regime and cannot silently inherit verifier trust. |

The live account-level threshold is observed as 15/21, not merely a scenario. This does not establish a generic raw table-write primitive or mean that 15 producers can perform every action. Concrete effects require tracing the required permission level, deployed code, native privilege semantics, and validator software.

## Deployable Overlay Boundary

The minimum overlay verifier for an institution pinned to profile H1 and checkpoint `S0` must:

1. Pin the chain identifier, verifier implementation, H1 profile digest, kernel/code identity, schema, finality policy, and trusted checkpoint.
2. Obtain every required transition input and witness from `S0` to the proposed checkpoint.
3. Recompute `S_(n+1) = Valid_H1_Transition(S_n, input_n)` for every step, including reservations, nullifiers, revocations, quarantine, obligations, capacity, and migrations.
4. Independently verify block inclusion and accepted finality evidence. Finality does not replace transition validation.
5. Reject a rollback, conflicting branch, stale checkpoint, unapproved profile, missing transition, unknown schema, invalid migration, or incomplete evidence. Missing history returns `UNKNOWN`/fail closed; it never means “use the latest state.”
6. Require every high-assurance execution adapter to check the same accepted authority state before an effect. Otherwise verification is advisory and a bypass path can execute anyway.

This verifier can identify an invalid transition in evidence it can authenticate and replay. It cannot force the chain to reject the transition, make unavailable history appear, or stop an execution system that bypasses the verifier.

### Minimum Authenticated History

For every transition, retain or authenticate:

- prior GAR and prior state roots;
- transition input and canonical serialization/schema version;
- kernel, profile, and capacity-epoch identities;
- transition witness or sufficient data for deterministic replay;
- resulting state roots and sequence/checkpoint;
- block identifier, inclusion evidence, and accepted finality evidence;
- explicit migration manifest and approvals, where applicable.

An API response or unauthenticated table snapshot is not a transition proof. The production design must establish how these records are tied to accepted blocks. If an archival node, state-history service, or API is malicious or unavailable, the verifier must detect inconsistency where possible and fail closed when completeness cannot be established.

## Global Authority Root

Define a versioned, domain-separated commitment over canonical serialization:

```text
GAR_n = H(
  "AEGIS-GAR-v0" || chain_id || profile_digest || kernel_digest ||
  sequence || checkpoint_id || authority_state_root || reservation_root ||
  nullifier_root || revocation_root || quarantine_root || obligation_root ||
  capacity_root || migration_state_root
)
```

The exact encoding, hash function, sparse/dense tree formats, and proof envelope are open design work. The important invariant is that `GAR_(n+1)` must be obtained by validating an accepted transition from `GAR_n`; a network-supplied root alone is not evidence that the transition obeyed H1.

## Transition Validation Options

| Method | Trust / proof size | Cost and verifier complexity | Privacy and main failure mode | Role in this design |
|---|---|---|---|---|
| Full deterministic replay | Larger history; small per-step proof overhead; trusts the pinned replay implementation. | Highest data and replay cost; simplest invariant reasoning. | Low privacy by default; missing history prevents validation. | Baseline H1 verifier and reference implementation. |
| Append-only transition log | Log alone proves neither completeness nor validity. | Cheap to append; verifier still needs authentication and replay. | Logs can be truncated, forked, or selectively served. | Audit transport, not a standalone proof. |
| Merkle transition witnesses | Compact membership proofs relative to a trusted root. | Moderate implementation cost; does not prove the transition rule. | Leaks accessed keys/paths unless padded; bad root defeats it. | Efficient access to authenticated state/log entries. |
| Authenticated state roots | Small commitment. | Cheap to store; root equality alone does not prove valid state evolution. | No privacy by itself; arbitrary root substitution remains possible. | Bind state components in GAR. |
| Light-client verified receipts | Compact inclusion/finality evidence, depending on consensus proof. | Requires correct light-client and finality verifier. | Does not prove AEGIS semantics by itself. | Authenticate block inclusion, then pair with replay or validity proof. |
| Succinct validity proof | Small proof; trusts the verifier/circuit and any setup assumptions. | High prover and circuit engineering cost; verification may be cheap. | Can add privacy; circuit bugs or setup assumptions can invalidate the result. | Optional optimization after measured need. |
| ZK proof of H1 transition | Small proof with optional private inputs. | Highest engineering and audit burden; recursion and data access add complexity. | Privacy benefit only when inputs are intentionally hidden; circuit soundness is critical. | Not required for v0; use only for a defined privacy/scale requirement. |
| Hybrid | Light-client finality plus authenticated witnesses and replay or validity proofs. | More components, but can tune proof/data tradeoffs. | Cross-component version and availability failures. | Recommended evolution: replay first, optimize only against measured constraints. |

No method removes the data-availability requirement. A validity proof may establish that some transition was valid while still failing to provide institutions the data needed for audit, policy checks, or recovery.

## Consensus-Protected State Target

### Minimum Primitive

The target is an Antelope **Protected Authority State Domain** with:

1. A consensus-recognized protected state commitment included in block validity.
2. A restricted transition path: validators accept a protected-state update only when its input, previous GAR, profile/kernel commitment, sequence, and resulting roots satisfy the active transition rules.
3. No generic privileged transaction path that can directly replace protected state while remaining valid under that same H1 rule set.
4. Explicit commitments to kernel, profile, schema, capacity epoch, finality policy, and migration version.
5. Explicit profile upgrade: H2 is a new accepted profile, not silent reinterpretation of H1.
6. Explicit migration transition binding the old and new roots, accounting for every live reservation, nullifier, obligation, quarantine item, and capacity encumbrance.
7. Fail-closed handling: malformed, unknown, duplicate, or missing transition data cannot restore or expand authority.
8. Consensus checks for authority non-amplification/non-equivocation, obligation non-equivocation, reservation uniqueness, nullifier uniqueness, quarantine safety, and capacity non-double-backing.

The state object could store a canonical GAR and authenticated component roots rather than every large record in a new native table. Validators still need enough data and deterministic logic to validate each transition. A commitment without validation is not protected state.

### Upgrade and Hard-Fork Requirement

An ordinary contract can enforce its own code path only while the current permission and protocol rules continue to bind it. To make invalid AEGIS transitions invalid blocks, all validating nodes need software that recognizes the protected-state rule. A pre-existing Antelope protocol-feature activation mechanism can activate behavior already implemented by node software; it cannot make old binaries understand a new AEGIS state domain.

Therefore a new consensus validation rule requires a coordinated protocol/software upgrade. Whether the deployment is called a “hard fork” depends on backward compatibility and activation mechanics. If old nodes would accept a block that new nodes reject, activation is consensus-breaking and must be coordinated as a hard-fork-style upgrade. This repository does not propose bypassing or weakening normal protocol upgrade governance.

### H1 / H2 Migration

- H1 state remains bound to its H1 profile digest and GAR chain.
- H2 has a distinct profile digest and cannot claim H1 identity.
- Migration is an explicit transition with a unique migration identifier, old GAR, new GAR, deterministic mapping, conservation checks, and institution approval policy.
- Old and new kernels may not both consume the same live authority. The migration must freeze/retire the old spend path before enabling the new one, or prove an equivalent non-overlap invariant.
- An H1-pinned institution rejects H2 even if H2 is canonical and finalized. It changes policy only through its own accepted upgrade procedure.
- Network operators may publish H2. They cannot make an H1 client silently adopt it.

## Architecture Comparison

| Property | Current Vaulta / generic Antelope evidence | AEGIS overlay today | Target protected-state Vaulta |
|---|---|---|---|
| BP privileged path | Live partial snapshot: `eosio@active`, `eosio.wrap@active`, and `eosio.msig@active` resolve to a 15-of-21 producer authority; wrapper is privileged and exposes `exec`. Exact source identity, per-action trace, and validator release remain open. | Verifier trust is local; chain permissions still govern contract mutation. | H1 consensus validation rejects forbidden protected-state mutation. New software regimes remain possible. |
| External verifier sovereignty | Not provided automatically by canonicality/finality. | Architecture is possible; this repo is a reference model, not a live production verifier. | Preserved alongside consensus checks. |
| State-transition verification | Generic chain validity does not imply AEGIS H1 validity. | Must replay/authenticate all transitions from a pinned checkpoint. | Consensus validates every protected transition; institutions independently verify accepted profile/finality. |
| Protected state | No AEGIS-specific consensus domain has been established by this audit. | No protocol protection; code/permission governance remains relevant. | GAR and transition rules are part of block validity. |
| Kernel mutability | Depends on deployed account authority and validator software. | Changed kernel/profile is rejected when hashes are pinned and evidence is complete. | H1 kernel/profile changes require explicit H2 or migration semantics. |
| Migration control | Chain-specific paths unknown. | Reference verifier rejects unaccepted H2, but full migration conservation is unimplemented. | Migration is a consensus-checked, explicit old-root/new-root transition plus local institution acceptance. |
| Capacity protection | No AEGIS V-capacity enforcement established on chain. | Reference ledger only. | Capacity root and unique encumbrance are protected transition invariants; actual V mechanism remains a separate requirement. |
| Quarantine protection | No AEGIS-specific protocol invariant established. | Reference state machine only. | Quarantine release requires an accepted, validated resolution transition. |
| Checkpoint continuity | Chain consensus has its own block/finality state. | Institution tracks a pinned authority checkpoint; production tracking is not implemented here. | Both protocol state and verifier enforce continuity; verifier still rejects unapproved regime changes. |
| Governance dependence | The sampled permission path has a 15/21 threshold; active-producer software/upgrade thresholds and all chain-level effects are not established by this snapshot. | Institution need not auto-follow governance for acceptance; availability and mediation remain dependencies. | Governance may halt or publish H2; it cannot mutate H1 protected state while validators enforce H1. |
| Liveness risk | Censorship, outage, or loss of finality can stop progress. | Same network risk plus history/API availability risk. | Same operator/availability risks; protection does not guarantee liveness. |
| Safety risk | No AEGIS-specific invariant claim follows from chain finality alone. | Invalid state can exist on chain; verifier must reject it and adapters must obey. | Invalid H1 transition is invalid to upgraded H1 validators; H2 remains a separate trust regime. |

**Current Vaulta verdict:** NOT ESTABLISHED FOR PROTOCOL-LEVEL AEGIS HIGH ASSURANCE. A partial live permission graph is now observed, including a 15/21 path to privileged wrapper and multisig account permissions. No AEGIS-specific state domain is deployed or demonstrated, and the source/action/validator audit is incomplete. This does not rule out an independently verified overlay.

**Overlay verdict:** architecturally deployable today, but not production-ready from this repository alone. Live history authentication, finality verification, adapter complete mediation, key governance, and chain-specific account audit remain open.

**Target verdict:** a combined protected-state and independent-verifier design is the strongest architecture in this proposal. It is not implemented, audited, or proven here.

## A-Only, B-Only, and Combined Design

| Design | Protects | Does not protect | Verdict |
|---|---|---|---|
| A. Protocol protection only | H1 consensus validity while nodes enforce H1 transition rules. | Institution acceptance of a later H2 regime; a new coordinated software regime; external systems that accept the wrong chain/profile. | Necessary for protocol-level protected state, insufficient alone. |
| B. External verifier only | A correctly implemented, H1-pinned institution can reject a non-H1 history it can authenticate and replay. | Chain mutation, censorship, unavailable history, or effects executed through bypass adapters. | Deployable overlay boundary; insufficient alone for protocol protection. |
| A + B | Consensus rejects invalid H1 state transitions; institutions decide which protocol/profile to trust and explicitly accept migrations. | Operators can still halt, censor, or publish a new H2 network regime. | Target architecture. |

## Conditional Theorem

Let `Accept_H1(GAR_n, input_n, witness_n)` be true only when a verifier can authenticate the evidence, apply the pinned H1 transition function, and obtain exactly `GAR_(n+1)`.

Assume:

1. `S0` is a trusted initial checkpoint and its GAR is pinned.
2. H1, kernel, schema, capacity epoch, finality policy, and verifier code are pinned by digest.
3. Every state component relevant to authority is included in the transition state or authenticated roots.
4. Every transition from the checkpoint is available and authenticated; incomplete history fails closed.
5. The transition validator correctly enforces authority conservation, nullifier/reservation uniqueness, revocation, quarantine, obligations, migration, and unique capacity encumbrance.
6. Every consequential execution is mediated by a verifier using that same accepted state and profile.
7. The consensus-protected implementation, when claimed, is correctly implemented and all H1-validating nodes enforce it.
8. Migrations are explicit, conserve live authority, and cannot overlap old and new spend paths.
9. No stronger credential or alternate adapter bypasses the verifier/protected-state rules.
10. Freshness and finality policies are valid for the institution's threat model.

Then a malicious governance coalition may censor, delay, halt finality, or publish H2, but it cannot make a correctly implemented H1-pinned verifier accept an H1-invalid authority expansion, replay, quarantine release, nullifier reuse, duplicate obligation, unapproved migration, or capacity double-backing. Under assumption 7 it also cannot make an invalid protected-state transition valid to H1-upgraded consensus nodes.

This is a conditional design theorem, **not** a proof of Vaulta, the current reference code, or the proposed protocol primitive. Assumptions 3-9 remain unproven for a production deployment.

## Strongest Counterexample and Weakest Link

**Strongest counterexample:** an institution trusts only canonical finalized state or a “latest” registry; a permission path replaces the AEGIS contract/profile or migrates state; the transition history is incomplete or unauthenticated; and an execution adapter acts without a pinned H1 replay. The network can show a finalized state while the institution executes authority it never accepted. The current reference tests do not close this end-to-end path.

**Single weakest link:** complete mediation backed by a complete, authenticated transition history. A perfect verifier is irrelevant if an execution adapter skips it or if the verifier cannot establish that it has the full history from its checkpoint.

## Public Crash Test

```text
Initial H1 root authority = 10,000
Adversary attempts = 10,001
```

Attack through code replacement, permission changes, wrapper execution, system actions, profile replacement, migration, capacity redefinition, and any privileged/native path found in the live audit.

- **Current reference overlay:** an H1 verifier should reject a transition not reachable from its accepted checkpoint, provided it has complete authenticated evidence and the adapter cannot bypass verification. Existing tests cover selected model-level attacks, not the full live-chain trace.
- **Target protocol:** upgraded H1 validators reject the transition as invalid under H1 consensus rules.
- **H2 launch:** operators may publish a new regime. A client pinned to H1 rejects H2 unless its institution explicitly approves a profile migration.

## Required Audit Artifacts Before Implementation

The chain-specific current-system audit is partially complete. The dated RPC evidence is in [`docs/VAULTA_PRIVILEGE_SNAPSHOT_2026-09-30.md`](../docs/VAULTA_PRIVILEGE_SNAPSHOT_2026-09-30.md). Before protocol or adapter implementation, close these gaps:

- repeat all account JSON/permissions, hashes, feature and producer-schedule queries as one reproducible snapshot at a single named LIB, including every proposed AEGIS account;
- match current code/ABI hashes to verified source and reproducible builds where available;
- map each relevant action to the exact required permission, including wrapper, system actions, native actions and migration paths;
- enumerate active multisig proposals and capture active protocol features at the same checkpoint;
- establish software releases operated by active validators; the API-node version is not evidence of validator versions;
- a source trace for `setcode`, `setabi`, `updateauth`, `setpriv`, wrapper execution, privileged intrinsics, table mutation, and any state migration route;
- a reproducible replay showing which state changes 15/21 and 21/21 can cause under current permissions.

Until those gaps close, distinguish **observed account fields** from **atomic-LIB, source-verified action effects, and validator-software claims**. Do not infer live Vaulta configuration from generic Antelope examples.

## Next 10 Commits

These are a proposed sequence, not authorization to start them automatically:

1. `audit: pin Vaulta privilege snapshot to one LIB` — replace the partial near-LIB capture with reproducible same-checkpoint state proofs.
2. `audit: match deployed code and trace mutation paths` — source/build identity plus action-to-authority call graph for permissions, wrapper, native privilege, and migration paths.
3. `spec: define authenticated Vaulta transition history` — identify block, action, witness, and completeness proofs.
4. `spec: define canonical GAR encoding and profile digest` — publish test vectors and versioning rules.
5. `model: specify H1 verifier checkpoint continuity` — partitions, rollback, missing history, conflicting branches, and H2.
6. `model: specify H1/H2 migration non-overlap` — prove no authority is spendable in both regimes.
7. `spec: freeze Protected Authority State Domain protocol proposal` — finalize state object, validation hook, bypass exclusions, and activation plan.
8. `prototype: implement the proposal on an isolated Antelope test chain` — no mainnet deployment.
9. `test: run 15/21 and 21/21 protected-state crash suite` — include code, permissions, wrap, migration, quarantine, nullifier, obligation, and capacity attacks.
10. `review: independent protocol and institution audit` — formally model-check, benchmark, review data availability, and decide whether a consensus upgrade is justified.

## Primary References

- [Antelope transaction protocol](https://docs.antelope.io/docs/latest/protocol/transactions_protocol/) — transaction actions, declared authorizations, validation, and irreversible inclusion.
- [Antelope system-contract upgrade guide](https://docs.antelope.io/reference-contracts/latest/guides/upgrading-the-eosio.system-contract/) — an example of authorized `setcode`/`setabi` deployment and system-contract replacement.
- [Antelope BIOS boot sequence](https://docs.antelope.io/docs/latest/tutorials/bios-boot-sequence/) — example permission setup and activation of protocol features supported by the node software.
- [Antelope consensus protocol](https://docs.antelope.io/docs/latest/protocol/consensus_protocol/) — producer schedules and consensus finality. Confirm network-specific thresholds from the live chain before relying on a generic description.
- [Antelope reference guide: `eosio.wrap`](https://docs.antelope.io/reference-contracts/latest/guides/how-to-use-eosio.wrap/) — optional privileged wrapper and its example BP approval path.
- [Antelope producer API: protocol feature activation](https://docs.antelope.io/leap-plugins/latest/producer.api/) — activation of features supported by producer software.
- [Antelope protocol overview](https://docs.antelope.io/docs/latest/protocol/) — separation between node protocol primitives and reference smart contracts.
- [Vaulta: token swap and network continuity](https://www.vaulta.com/resources/vaulta-token-swap-a-begins-may-14) — Vaulta's statement that it continued the EOS mainnet using Antelope technology; this does not establish present account permissions or active protocol features.
- [Vaulta Chain API](https://docs.eosnetwork.com/apis/spring/latest/chain.api/) — public chain endpoints used for the dated snapshot.
- [Vaulta system-contract source](https://github.com/VaultaFoundation/system-contracts) — upstream source reference only; not yet matched to the deployed code hashes.
