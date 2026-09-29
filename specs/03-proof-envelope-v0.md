# Proof Envelope v0

An AEGIS proof must bind full context.

Minimum fields:

```text
network_id
profile_version
kernel_account
kernel_code_hash
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
evidence_class
consequence_policy
proof_version
crypto_suite
```

If any exact-effect field differs from the requested effect, verifier returns `INVALID`.

