# Five Rails / 100 Dollar Demo

Scenario:

```text
Root authority = 100 USD
Agent attempts to use the same authority across:
1. bank rail
2. Ethereum
3. Solana
4. x402
5. MCP tool
```

Expected output:

```text
01 bank payment exact proof: VALID
02 ethereum replay after bank consume: INVALID
03 solana wrong execution domain: INVALID
04 wrong recipient: INVALID
05 stale checkpoint: STALE
06 no V-backed capacity certificate: INVALID
07 double-backed V capacity: INVALID
08 insufficient physical state resource: INVALID
09 agent holds bypass credential: INVALID
10 revoked mandate: INVALID
11 missing consequence receipt: UNKNOWN
```

The point is not payment execution. The point is authority conservation.
