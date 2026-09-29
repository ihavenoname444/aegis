# Capacity Ledger Demo Notes

The reference capacity ledger models the V-backed admission layer behind high-assurance authority capacity.

It is intentionally small:

```text
REGISTER_PROVIDER
ISSUE_CERTIFICATE
RETIRE_CERTIFICATE
```

Provider accounting:

```text
v_locked
ram_committed_bytes
acu_limit
```

Live certificate accounting:

```text
v_encumbered
ram_committed_bytes
active_acu
```

Core invariant:

```text
sum(live certificate V encumbered) <= provider V locked
sum(live certificate RAM encumbered) <= provider RAM committed
sum(live certificate ACU active) <= provider ACU limit
```

Current tests prove the reference model rejects:

- V double-backing across live certificates;
- zero-V capacity certificates;
- RAM-only substitution for V-backed admission;
- V-only substitution without physical RAM backing;
- reusing capacity only after a certificate is retired.

Run:

```bash
npm test
```

This is not yet an on-chain staking contract. It is a deterministic reference model for the admission accounting that such a contract or kernel would need to preserve.
