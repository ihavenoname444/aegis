# Authority Non-Equivocation v0

Scope boundary: this specification defines verifier-accepted authority history. It does not claim that current Vaulta consensus enforces these AEGIS rules. A finalized chain state may still be invalid under a pinned H1 profile; an independent verifier must reject it when it can authenticate and replay the full transition history. The current-vs-target distinction and consensus-protected proposal are in [`12-protected-authority-state-v0.md`](12-protected-authority-state-v0.md).

## Property

AEGIS-V attempts to prevent double-spending of delegated autonomous authority.

For a principal, security profile, global authority root and overlapping conserved authority,
two conflicting histories must not both be accepted by participating high-assurance domains.

Operationally:

```text
For domains in D* that claim AEGIS high-assurance verification:

accepted consumed/reserved/quarantined authority across D*
<= root-authorized authority

and the accepted history for each authority checkpoint has one authority_state_root.
```

This is stronger than a local spending limit. The protected object is the canonical
history of authority, obligations, reservations, nullifiers, revocations, profile
history and capacity backing.

## Definitions

`authority_universe_id`
: The verifier-accepted universe in which authority histories are compared.

`global_authority_root_id`
: The root identity/authority scope whose delegated authority is conserved.

`authority_state_root`
: Commitment to the accepted authority state at a finalized checkpoint.

`D*`
: Execution domains that opt into the accepted AEGIS high-assurance profile and
verify the same authority universe. Domains outside D* are advisory or bypassing.

## Theorem Candidate

Under these assumptions:

- all domains in D* perform complete mediation before executing protected effects;
- all domains in D* verify proofs against the same `authority_universe_id`;
- all domains in D* verify proofs against the same `global_authority_root_id`;
- accepted checkpoints map a checkpoint id/sequence to at most one `authority_state_root`;
- stale or unknown authority histories fail closed;
- obligations, reservations and nullifiers are globally bound to the canonical history;
- unknown execution consequence remains conserved through quarantine or reconciliation;

then no two domains in D* can both accept conflicting histories that spend the same
authority beyond the root-authorized amount.

## Coordination Requirement

If domains never coordinate directly or indirectly, and each can accept stale local
state concurrently, global conservation is impossible in the general case.

Minimal counterexample:

```text
Root authority R = 10,000

Bank domain local view:       available = 8,000
Ethereum domain local view:   available = 8,000

No shared serialization, escrow partition, root commitment, nullifier set or common coordinator.
Both reserve 8,000 concurrently.

Global reserved = 16,000 > R
```

The required mechanism does not have to be "one blockchain" by definition. It must
be logically equivalent for the safety property: shared consensus, a common
coordinator, a cryptographically synchronized state, pre-partitioned escrows, or a
serialization layer accepted by D*.

Necessity label:

```text
DISTRIBUTED-SYSTEM NECESSITY: some logically common consistency mechanism.
NOT MATHEMATICAL NECESSITY: Vaulta specifically.
NOT SECURITY NECESSITY: V specifically for non-equivocation.
ECONOMIC / NETWORK-EFFECT HYPOTHESIS: Vaulta/V may become the strongest accepted substrate.
```

## V / WRAM Substitution

Authority non-equivocation is not created by V. It is created by canonical authority
history plus complete mediation.

V currently contributes a different measured property in the reference model:

```text
accepted high-assurance capacity admission requires unique V encumbrance
and physical state backing.
```

WRAM-only can provide physical storage, but in this repository it does not preserve
the accepted V-backed capacity economics or non-double-backed provider capacity profile.

Production V necessity remains unproven until the on-chain capacity path shows that
high-assurance providers cannot offer equivalent accepted authority capacity with a
smaller or cheaper trust base.

## Implementation Hook

The verifier now requires:

- `proof.authority_universe_id == policy.accepted_authority_universe_id`;
- `proof.global_authority_root_id == policy.accepted_global_authority_root_id`;
- a finalized checkpoint with `authority_state_root`;
- accepted authority-state roots under policy;
- no locally known checkpoint/sequence equivocation in verifier state.

The property is implementation-tested in `tests/authority-universe.test.js`.

This test coverage rejects selected known conflicts in the reference model. It does not prove arbitrary distributed-schedule safety, authenticate a live Vaulta history, or prevent privileged chain-level changes. Those claims remain open under the audit and proposal in `specs/12-protected-authority-state-v0.md`.
