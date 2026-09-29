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

The model also tracks obligation and nullifier uniqueness at the set level.

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
