# Verifier Profile v0

External systems choose what they accept.

```text
accepted_network_id
accepted_profile_versions
accepted_verifier_profile_hashes
accepted_kernel_account
accepted_kernel_hashes
accepted_kernel_abi_hashes
accepted_authority_schema_hashes
accepted_capacity_epochs
accepted_finality_rules
accepted_crypto_suites
maximum_proof_age_ms
minimum_evidence_class
stale_checkpoint_policy
complete_mediation_required
revocation_profile
```

Governance can publish a new profile.

External verifiers are not forced to accept it.

## Verifier Sovereignty

An external verifier pins its own acceptance surface. Chain governance, treasury,
foundation operators, block producers, capacity providers or an admin registry can
publish new material, but cannot make an existing verifier accept it silently.

Pinned acceptance fields include:

```text
network_id
kernel_account
kernel_code_hash
kernel_abi_hash
authority_schema_hash
proof_version
capacity_epoch
finality_rule
maximum proof age
minimum evidence class
migration_policy
```

Finality proves that some chain state finalized. It does not prove that the
verifier accepts the kernel, ABI, profile or capacity epoch represented by that
state.

## Revocation Freshness Profiles

High-assurance verification must distinguish a mandate that is not revoked from a verifier that merely has an old revocation view.

Implemented reference profiles:

| Profile | Meaning | Failure mode |
|---|---|---|
| `ONLINE_HIGH_ASSURANCE` | Verifier requires a revocation view newer than `maximum_revocation_view_age_ms`. | `STALE / REVOCATION_VIEW_STALE` |
| `BOUNDED_OFFLINE` | Verifier accepts an offline view only inside `maximum_offline_age_ms`. | `STALE / REVOCATION_VIEW_STALE` |
| `LOCAL_CELL` | Verifier accepts a proof only if it carries an unexpired local authority cell. | `INVALID / LOCAL_CELL_REQUIRED` or `STALE / LOCAL_CELL_EXPIRED` |

Known revocation always fails closed:

```text
state.revoked_mandates includes mandate_id
OR
state.revocation_view.revoked_mandates includes mandate_id
=>
INVALID / MANDATE_REVOKED
```

The reference verifier intentionally returns `STALE`, not `VALID`, when the revocation view is too old. A stale verifier can ask for a fresher finalized view; it must not guess.
