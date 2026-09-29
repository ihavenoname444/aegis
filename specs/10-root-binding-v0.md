# Root Binding v0

Real authority starts outside the protocol:

```text
real-world principal
-> legal / institutional authorization
-> HSM / MPC / signing process
-> canonical Vaulta root
-> narrower AEGIS authority
```

Vaulta account names do not prove legal identity by themselves.

## Multi-Principal Roots

Institutions are not one private key. They use boards, officers, risk teams,
dual control, role separation and legal authorization.

AEGIS must treat these approvals as a way to activate one institutional root,
not as multiple independent roots.

Example:

```text
2-of-3 treasury officers
+ 1 risk officer above threshold
= one root_authorized budget
```

The approving officers do not each receive a copy of the root authority.

## Red Lines

```text
threshold composition must not multiply authority
same actor must not satisfy separated roles
hidden emergency master keys are rejected
recovery must not create a second active root
principal aliases must not reuse the same legal attestation to create a second root
requested authority must not exceed institutional root authority
```

Current status:

```text
IMPLEMENTATION_TESTED in src/root-binding.js and tests/root-binding.test.js
NOT A LEGAL IDENTITY SYSTEM
NOT A PRODUCTION HSM INTEGRATION
```
