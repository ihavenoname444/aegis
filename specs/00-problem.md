# Problem Statement

Autonomous systems can act across many independent domains:

- banks;
- blockchains;
- card/payment networks;
- MCP tools;
- x402 endpoints;
- AP2 payment flows;
- robots and machines;
- enterprise APIs.

The core problem:

```text
If a principal gives an agent 100 units of authority,
why can the agent not turn that into 500 units across five rails?
```

AEGIS-V attempts to model and verify conserved authority:

```text
Authority delegated by a root principal cannot amplify, replay, exceed scope, or resurrect after revocation.
```

## Category

Candidate category:

```text
Conserved Autonomous Authority
```

or:

```text
Autonomous Authority Clearing
```

## Thin Waist

```text
AEGIS Proof Envelope + AEGIS Verify result semantics
```

External systems should not need to run on Vaulta or own V to verify.

High-assurance issuance/provisioning requires accepted capacity backing.

