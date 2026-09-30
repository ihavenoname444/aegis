# Authority State Machine

The authority kernel tracks:

```text
roots
mandates
delegations
authority cells
obligations
reservations
nullifiers
revocations
consequence states
```

## Conservation Invariant

```text
RootAuthorizedAuthority
=
Available
+ Reserved
+ Quarantined
+ Consumed
```

No execution domain may create additional root authority.

## States

```text
AVAILABLE
RESERVED
EXECUTING
CONSUMED
FAILED_PROVEN
QUARANTINED
REVOKED
EXPIRED
RELEASED
```

## Implemented Reference Transitions

The dependency-free JavaScript reference kernel currently implements:

```text
DELEGATE
RESERVE
CONSUME
QUARANTINE
RETURN
REVOKE_MANDATE
```

Each attempted transition produces a trace entry. Failed attempts do not move authority, but they remain in the trace so an auditor can see attempted replay, exhaustion or race behavior.

Each trace entry carries:

```text
attempt_sequence
sequence
```

`attempt_sequence` is the audit-log order and increments for every attempted
transition. `sequence` is the canonical authority-state version and increments
only for accepted authority-moving transitions.

## Reservation Binding

`RESERVE` binds:

```text
base_sequence, when supplied
reservation_id
obligation_id
nullifier
holder_id
amount
effect_id
execution_domain
```

The reference kernel rejects:

```text
duplicate reservation_id
duplicate obligation_id
duplicate nullifier
missing or blank reservation binding fields
stale base_sequence
missing base_sequence when sequenced mode requires it
return binding mismatch
holder not found
insufficient available authority
invalid amount
```

This is the minimal mechanism used by the hostile demo to prevent the same economic obligation from being reserved across bank, Ethereum, Solana, x402 and MCP rails.

## Canonical Sequence

`sequence` is the canonical state version, not the audit-log length.

Failed, malformed, stale or rejected proposals do not advance canonical sequence.
Only accepted transitions that change authority state advance it. This prevents
an invalid proposal from making a pending valid `base_sequence` proposal stale
without moving authority.

Rejected proposals still advance `attempt_sequence`. This preserves forensic
ordering without letting failed proposals mutate canonical authority state.

## Return Binding

`RETURN` must refer to the same reservation binding it releases:

```text
reservation_id
obligation_id
nullifier
holder_id
amount
effect_id
execution_domain
```

The reference kernel rejects release attempts with missing return binding fields
or with a holder, obligation, nullifier, amount, effect or execution-domain
mismatch against the original reservation.

## Consequence Rule

```text
NO_RECEIPT != NO_EXECUTION
TIMEOUT != FAILURE
UNKNOWN -> QUARANTINE
```

The first hostile trace models timeout/lost receipt by moving the affected reservation into `QUARANTINED`. Quarantined authority remains accounted and cannot be reused for a new effect until a later transition explicitly resolves it.

## Current Proof Status

Implementation-tested:

```text
10,000 authorized
1,000 child agents
five execution domains
same-obligation replay
lost receipt quarantine
full exhaustion
explicit +1 attack
final accounting remains 10,000
```

Not yet formally proven:

```text
all arbitrary transition sequences
all concurrent interleavings
kernel migration
authority cells
revocation freshness profiles
global capacity-ledger conservation
```
