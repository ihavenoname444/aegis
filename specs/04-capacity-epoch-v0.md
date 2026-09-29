# Capacity Epoch v0

Capacity epochs are immutable verifier-accepted profiles.

```text
epoch_id
rules_hash
kernel_hash
capacity_formula_hash
v_weight
ram_requirement
security_requirement
activation_checkpoint
retirement_policy
```

## V Conservation

```text
sum(V encumbered across live capacity certificates)
<=
V actually locked for that function
```

## Physical State Conservation

```text
sum(RAM/WRAM bytes encumbered across live capacity certificates)
<=
physical persistent bytes committed by the provider
```

## Implemented Reference Ledger

The reference model now includes a dependency-free capacity ledger with:

```text
REGISTER_PROVIDER
ISSUE_CERTIFICATE
RETIRE_CERTIFICATE
```

Each provider has:

```text
provider_id
v_locked
ram_committed_bytes
acu_limit
status
```

Each live certificate encumbers:

```text
certificate_id
provider_id
capacity_epoch
v_encumbered
ram_committed_bytes
active_acu
```

The ledger rejects:

```text
V double-backing across live certificates
zero-V certificates
RAM-only substitution
V-only substitution without physical RAM backing
ACU over-allocation
duplicate certificate IDs
missing providers
```

## Red Line

If a high-assurance proof validates without a valid V-backed capacity certificate, this design fails.

If RAM/WRAM can fully substitute for V-backed capacity admission, the V-specific economic thesis fails.
