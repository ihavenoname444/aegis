# Proof Envelope v0

An AEGIS proof must bind full context.

Minimum fields:

```text
network_id
profile_version
kernel_account
kernel_code_hash
kernel_abi_hash
authority_schema_hash
verifier_profile_hash
root_identity
mandate_id
mandate_version
delegation_lineage
delegated_permission
effect_type
action
parameters_commitment
recipient
execution_domain
asset
amount
obligation_id
reservation_id
nonce
nullifier
issue_checkpoint
expiry
revocation_checkpoint
capacity_certificate_id
capacity_epoch
finalized_state_reference
finality_rule
finalized_kernel_hash
evidence_class
consequence_policy
proof_version
crypto_suite
```

If any exact-effect field differs from the requested effect, verifier returns `INVALID`.

## Verifier Sovereignty Bindings

A verifier must explicitly accept:

```text
network_id
kernel_account
kernel_code_hash
kernel_abi_hash
verifier_profile_hash
authority_schema_hash
proof_version
capacity_epoch
finality_rule
```

Finality proves that a state was finalized under some rule. It does not prove that the verifier accepts the authority semantics of that state.

Required check:

```text
Finality Validity
AND
Profile Acceptance
AND
Authority Validity
AND
Capacity Validity
```
