# Authority Non-Equivocation Review

## A. What Changed

- AEGIS-V is now framed as preventing double-spending/equivocation of delegated autonomous authority.
- Proofs are explicitly bound to an `authority_universe_id`, a `global_authority_root_id` and a checkpoint `authority_state_root`.
- The verifier rejects known checkpoint/root equivocation before capacity admission.
- A new model draft, spec and adversarial tests cover the first authority-fork surface.

## B. What Survived

- Existing conservation, nullifier, obligation, revocation, governance-capture, root-binding and V-backed capacity checks still stand.
- V remains mandatory inside the current accepted high-assurance capacity profile.
- Complete mediation remains a hard assumption for high-assurance domains.

## C. What Was Disproven

- Local spending limits alone are not enough.
- A valid-looking proof without a shared authority universe is not high assurance.
- V is not what prevents authority history from forking. Canonical authority history does that.
- WRAM-only is not disproven as a storage substrate; it is only rejected under the current V-backed capacity profile.

## D. What Remains Unproven

- Production Vaulta finality under adversarial forks/partitions.
- Production on-chain enforcement of unique V encumbrance.
- Whether V-backed capacity has a non-bypassable institutional moat against substitute collateral or WRAM-only designs.
- Adapter complete mediation for banks, HSMs, payment rails, MCP tools and AI runtimes.
- A TLC-checked proof over the full authority/capacity/composition model.

## E. Strongest Current Theorem

If every participating high-assurance domain verifies the same authority universe,
same global authority root, accepted checkpoint root, complete mediation, nullifier
set, revocation view and capacity profile, then the reference verifier rejects
known attempts to make one authority history appear as two accepted histories.

This is verifier-level evidence only. It does not mean current Vaulta consensus enforces the AEGIS transition rules, and it does not mean every finalized state is accepted by H1. An H1-pinned institution must independently authenticate and validate the transition history. The future consensus-protected state target, current Antelope privilege distinctions, and Vaulta-specific evidence gap are recorded in [`specs/12-protected-authority-state-v0.md`](../specs/12-protected-authority-state-v0.md).

## F. Strongest Current Counterexample

Two independent domains that never coordinate can each accept stale local authority
and reserve 8,000 out of a 10,000 root. Without a shared root commitment, escrow
partition, common coordinator or serialization layer, the aggregate can become 16,000.

## G. Single Weakest Link

The weakest link is production complete mediation plus canonical-state availability.
If real adapters execute protected effects without consulting the accepted authority
universe, the protocol becomes advisory.

## H. Next 10 Commits

1. `model: check authority universe with TLC`
2. `kernel: add checkpoint acceptance ledger`
3. `test: add stale fork and partition schedules`
4. `spec: define authority cells and escrow partitions`
5. `kernel: implement authority cell split/merge invariants`
6. `test: prove cell migration cannot duplicate authority`
7. `capacity: bind certificate ids to authority universe`
8. `docs: compare Vaulta against bank-HSM and Canton TCB`
9. `adapter: prototype complete mediation gateway`
10. `conformance: add cross-domain proof vectors`

## I. Experiment Most Likely To Kill The Thesis

Build a two-domain bank/HSM or Canton-style prototype that provides the same
global authority non-equivocation, revocation freshness, complete mediation,
auditability and capacity non-double-backing with a smaller trust base and no
Vaulta/V dependency.

## J. Experiment Most Likely To Validate It

Run three independent execution adapters against the same authority universe:
bank payment, EVM settlement and MCP tool execution. Force concurrent conflicting
reservations, stale proofs, forked checkpoints, unknown receipts and capacity
reuse. The thesis is strongly validated if all three adapters accept only one
canonical authority history while preserving liveness for non-conflicting effects.
