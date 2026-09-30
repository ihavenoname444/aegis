# Formal Models

This directory contains first-pass formal specifications for the reference model.

## AuthorityKernel.tla

Models the smallest conservation core:

```text
available + reserved + quarantined + consumed = RootAuthority
```

Transitions:

```text
Reserve
Consume
Quarantine
ReturnFromReserved
ReturnFromQuarantine
```

The model also tracks reservation id, obligation and nullifier uniqueness at
the set level, an explicit `sequence` precondition for all modeled
authority-moving transitions, and active/quarantined binding tuples for
consume/quarantine/return transitions. Rejected proposals are modeled as
canonical authority no-ops: they do not advance `sequence`, but they do advance
`attemptSequence` so audit order remains monotonic. The draft invariant includes
`attemptSequence >= sequence`.

Run with TLC when the TLA+ tools are available:

```bash
tlc2 AuthorityKernel.tla -config AuthorityKernel.cfg
```

Current status:

```text
SPEC WRITTEN
NOT YET TLC-CHECKED IN THIS REPOSITORY RUN
NOT A PRODUCTION PROOF
```

## Protected Authority State

The protocol-level proposal is documented in `specs/12-protected-authority-state-v0.md`. There is not yet a model of consensus-protected state, generic privileged bypasses, authenticated-history loss, or H1/H2 migration. Add that model only after the Vaulta permission audit and protocol primitive are reviewed.

Next formal targets:

- reservation records instead of aggregate counters;
- explicit holders and delegation;
- effect/domain/holder binding fields beyond the current reservation tuple;
- arbitrary interleavings;
- capacity ledger conservation;
- kernel migration safety;
- revocation freshness profiles.

## RootBinding.tla

Models the smallest recovery/re-binding non-expansion rule:

```text
one institutional principal cannot have more than one active root binding
```

The model is intentionally narrow. It does not prove legal authority, HSM
ceremony safety, recovery liveness, or root-approved migration.

Run with TLC when the TLA+ tools are available:

```bash
tlc2 RootBinding.tla -config RootBinding.cfg
```

Current status:

```text
SPEC WRITTEN
NOT YET TLC-CHECKED IN THIS REPOSITORY RUN
NOT A PRODUCTION PROOF
```

## AuthorityUniverse.tla

Models the smallest canonical-history rule:

```text
one checkpoint id cannot be accepted with two different authority roots
```

The model deliberately separates the distributed-systems requirement from any
specific substrate claim. It does not prove Vaulta is the only possible
coordination network, and it does not prove V is necessary for authority
non-equivocation.

Run with TLC when the TLA+ tools are available:

```bash
tlc2 AuthorityUniverse.tla -config AuthorityUniverse.cfg
```

Current status:

```text
SPEC WRITTEN
NOT YET TLC-CHECKED IN THIS REPOSITORY RUN
NOT A PRODUCTION PROOF
```
