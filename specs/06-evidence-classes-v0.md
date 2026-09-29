# Evidence Classes v0

Proof of Consequence requires explicit evidence class.

| Class | Example |
|---|---|
| A | Cryptographic/light-client proof |
| B | HSM-signed bank or institutional receipt |
| C | Registered adapter attestation |
| D | Manual/legal evidence |
| U | Unknown or unresolved |

Default safety rule:

```text
UNKNOWN -> QUARANTINE
```

