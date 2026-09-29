# Mandatory Dependency Demo

The demo question:

```text
What exact guarantee disappears when AEGIS-V is bypassed?
```

Reference answer:

```text
The execution domain loses a canonical proof that the principal's global
authority has not already been delegated, reserved, consumed, replayed, revoked
or quarantined elsewhere across participating domains.
```

Implemented redlines:

```text
No canonical state -> UNKNOWN / CANONICAL_STATE_REQUIRED
No V -> INVALID / V_REQUIRED
No unique V encumbrance -> INVALID / UNIQUE_V_ENCUMBRANCE_REQUIRED
A substitute -> INVALID / CAPACITY_ASSET_REJECTED
WRAM substitute -> INVALID / CAPACITY_ASSET_REJECTED
USDC substitute -> INVALID / CAPACITY_ASSET_REJECTED
BTC substitute -> INVALID / CAPACITY_ASSET_REJECTED
TOKEN_X substitute -> INVALID / CAPACITY_ASSET_REJECTED
generic token-gate profile -> INVALID / CAPACITY_PROFILE_REJECTED
```

Honest limitation:

```text
This proves dependency inside the accepted reference profile. It does not yet
prove production non-bypassability of V or Vaulta.
```
