# Revocation Freshness Profiles

Run:

```bash
npm test
```

The reference verifier supports three revocation freshness modes:

```text
ONLINE_HIGH_ASSURANCE
BOUNDED_OFFLINE
LOCAL_CELL
```

## ONLINE_HIGH_ASSURANCE

Used when the verifier must have a near-current revocation view.

Expected behavior:

```text
fresh unrevoked view -> VALID
known revoked mandate -> INVALID / MANDATE_REVOKED
old revocation view -> STALE / REVOCATION_VIEW_STALE
```

## BOUNDED_OFFLINE

Used when an institution deliberately allows offline operation inside a bounded window.

Expected behavior:

```text
inside offline bound -> VALID
outside offline bound -> STALE / REVOCATION_VIEW_STALE
```

## LOCAL_CELL

Used when a pre-authorized cell can operate locally until it expires.

Expected behavior:

```text
unexpired local cell -> VALID
missing local cell -> INVALID / LOCAL_CELL_REQUIRED
expired local cell -> STALE / LOCAL_CELL_EXPIRED
known revoked mandate -> INVALID / MANDATE_REVOKED
```

Design rule:

```text
Stale revocation knowledge is not equivalent to permission.
```

This lets an external system distinguish "the agent is allowed" from "the verifier needs a fresher authority view."
