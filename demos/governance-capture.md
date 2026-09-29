# Governance Capture Demo

This demo model asks one question:

```text
If governance, BPs, treasury/admins and capacity providers are captured, can they
make Bank X accept more authority than Bank X explicitly accepted?
```

Reference answer:

```text
No, not in the reference verifier.
```

Bank X pins:

```text
network_id
kernel_account
kernel_code_hash
kernel_abi_hash
authority_schema_hash
verifier_profile_hash
proof_version
capacity_epoch
finality_rule
maximum proof age
minimum evidence class
```

The reference verifier rejects:

```text
H2 kernel without explicit acceptance
H2 finalized state under an H1 policy
kernel account redirect
kernel ABI mutation
verifier profile mutation
finality rule mutation
C4 capacity epoch under a C1 policy
same V backing old and new live capacity epochs
admin override of nullifier checks
admin release of quarantined authority without resolution proof
```

Security statement:

```text
Governance capture does not automatically imply expansion of an institution's
accepted authority.
```

Limit:

```text
This is reference-model evidence only. Production claims require importing the
actual Vaulta permission graph, deployment accounts, multisigs, upgrade paths,
capacity contracts and a root-approved migration protocol.
```
