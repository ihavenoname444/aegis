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
the set level, plus an explicit `sequence` precondition for all modeled
authority-moving transitions.

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

Next formal targets:

- reservation records instead of aggregate counters;
- explicit holders and delegation;
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
