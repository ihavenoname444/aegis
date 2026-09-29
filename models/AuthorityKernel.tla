----------------------------- MODULE AuthorityKernel -----------------------------
EXTENDS Naturals, FiniteSets, TLC

CONSTANTS RootAuthority, MaxAmount, Obligations, Nullifiers

VARIABLES available, reserved, quarantined, consumed, obligations, nullifiers

vars == <<available, reserved, quarantined, consumed, obligations, nullifiers>>

Amount == 1..MaxAmount

Init ==
  /\ available = RootAuthority
  /\ reserved = 0
  /\ quarantined = 0
  /\ consumed = 0
  /\ obligations = {}
  /\ nullifiers = {}

Conserved ==
  available + reserved + quarantined + consumed = RootAuthority

NoNegative ==
  /\ available >= 0
  /\ reserved >= 0
  /\ quarantined >= 0
  /\ consumed >= 0

Reserve(amount, obligation, nullifier) ==
  /\ amount \in Amount
  /\ available >= amount
  /\ obligation \in Obligations
  /\ nullifier \in Nullifiers
  /\ obligation \notin obligations
  /\ nullifier \notin nullifiers
  /\ available' = available - amount
  /\ reserved' = reserved + amount
  /\ quarantined' = quarantined
  /\ consumed' = consumed
  /\ obligations' = obligations \cup {obligation}
  /\ nullifiers' = nullifiers \cup {nullifier}

Consume(amount) ==
  /\ amount \in Amount
  /\ reserved >= amount
  /\ available' = available
  /\ reserved' = reserved - amount
  /\ quarantined' = quarantined
  /\ consumed' = consumed + amount
  /\ UNCHANGED <<obligations, nullifiers>>

Quarantine(amount) ==
  /\ amount \in Amount
  /\ reserved >= amount
  /\ available' = available
  /\ reserved' = reserved - amount
  /\ quarantined' = quarantined + amount
  /\ consumed' = consumed
  /\ UNCHANGED <<obligations, nullifiers>>

ReturnFromReserved(amount) ==
  /\ amount \in Amount
  /\ reserved >= amount
  /\ available' = available + amount
  /\ reserved' = reserved - amount
  /\ quarantined' = quarantined
  /\ consumed' = consumed
  /\ UNCHANGED <<obligations, nullifiers>>

ReturnFromQuarantine(amount) ==
  /\ amount \in Amount
  /\ quarantined >= amount
  /\ available' = available + amount
  /\ reserved' = reserved
  /\ quarantined' = quarantined - amount
  /\ consumed' = consumed
  /\ UNCHANGED <<obligations, nullifiers>>

Next ==
  \/ \E amount \in Amount, obligation \in Obligations, nullifier \in Nullifiers:
      Reserve(amount, obligation, nullifier)
  \/ \E amount \in Amount:
      Consume(amount)
  \/ \E amount \in Amount:
      Quarantine(amount)
  \/ \E amount \in Amount:
      ReturnFromReserved(amount)
  \/ \E amount \in Amount:
      ReturnFromQuarantine(amount)

Spec == Init /\ [][Next]_vars

Safety == Conserved /\ NoNegative

THEOREM Spec => []Conserved

================================================================================
