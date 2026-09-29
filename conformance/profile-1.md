# AEGIS-V Conformance Profile 1

A conformant verifier must reject:

- wrong recipient;
- wrong execution domain;
- wrong action;
- wrong amount;
- expired proof;
- stale checkpoint;
- replayed nullifier;
- revoked mandate;
- missing capacity certificate;
- rejected capacity epoch;
- double-backed V capacity;
- insufficient ACU;
- bypass credential in high-assurance mode.

A conformant verifier must return `UNKNOWN` or equivalent quarantine behavior for unresolved consequence evidence.

