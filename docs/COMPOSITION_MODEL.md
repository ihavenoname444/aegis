# Composition Model

Current focus:

```text
T21 MULTI-PRINCIPAL CONSERVATION
```

Property:

```text
Threshold/root composition must not create aggregate authority above the
institutional root.
```

## Minimal Counterexample

Unsafe design:

```text
RootAuthorizedAuthority = 10,000
alice treasury approval -> root 10,000
bob treasury approval -> root 10,000
carol risk approval -> root 10,000
```

Aggregate accepted authority becomes:

```text
30,000 > 10,000
```

That kills the protocol.

## Reference Defense

The reference model treats officer approvals as activation evidence for one
institutional root binding:

```text
2 treasury officers + risk approval -> one active root
```

The root registry rejects activating the same root twice. It also rejects hidden
master-key activation and separation-of-duties violations.

## Remaining Composition Risks

Still open:

```text
module A + module B sharing nullifier aliases
old/new kernels spending same migrated authority
recovery authority plus live root authority
authority cells merging after partition
capacity-provider migration during active reservations
```

Current verdict:

```text
PARTIAL. Multi-principal root composition is implementation-tested.
General module composition remains UNPROVEN.
```
