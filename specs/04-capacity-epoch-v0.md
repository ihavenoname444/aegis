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

## Governance Non-Retroactivity

A capacity epoch is not accepted because governance, treasury, a capacity registry or
protocol leadership marks it current. It is accepted only when an external verifier
profile explicitly includes its epoch identifier/rules hash.

```text
proof.capacity_certificate.capacity_epoch
IN
verifier.accepted_capacity_epochs
```

An old verifier that accepts `C1` must not silently accept `C2`, `C3` or `C4`.
If a new epoch changes the amount of authority capacity provisioned per V, that
change is a new acceptance decision by the verifier or principal. It is not a
retroactive change to existing accepted capacity semantics.

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
capacity_asset
v_locked
ram_committed_bytes
acu_limit
status
```

Each live certificate encumbers:

```text
certificate_id
provider_id
capacity_profile
capacity_asset
capacity_epoch
unique_v_encumbrance
v_encumbered
ram_committed_bytes
active_acu
```

The ledger rejects:

```text
V double-backing across live certificates
non-V capacity asset substitution
missing unique V encumbrance
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

If governance can dilute a live epoch or make the same V back two live epochs for
the same accepted authority surface, the capacity economics fail.

If a generic token-gate profile can preserve the same guarantee without unique
V encumbrance and physical backing, the accepted high-assurance profile fails.
