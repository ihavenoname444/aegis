----------------------------- MODULE AuthorityKernel -----------------------------
EXTENDS Naturals, FiniteSets, TLC

CONSTANTS RootAuthority, MaxAmount, MaxSequence, ReservationIds, Obligations, Nullifiers

VARIABLES available, reserved, quarantined, consumed, sequence, reservationIds, obligations, nullifiers

vars == <<available, reserved, quarantined, consumed, sequence, reservationIds, obligations, nullifiers>>

Amount == 1..MaxAmount
Sequence == 0..MaxSequence

Init ==
  /\ available = RootAuthority
  /\ reserved = 0
  /\ quarantined = 0
  /\ consumed = 0
  /\ sequence = 0
  /\ reservationIds = {}
  /\ obligations = {}
  /\ nullifiers = {}

Conserved ==
  available + reserved + quarantined + consumed = RootAuthority

NoNegative ==
  /\ available >= 0
  /\ reserved >= 0
  /\ quarantined >= 0
  /\ consumed >= 0

Reserve(amount, reservation, obligation, nullifier, base) ==
  /\ amount \in Amount
  /\ sequence < MaxSequence
  /\ base \in Sequence
  /\ base = sequence
  /\ available >= amount
  /\ reservation \in ReservationIds
  /\ obligation \in Obligations
  /\ nullifier \in Nullifiers
  /\ reservation \notin reservationIds
  /\ obligation \notin obligations
  /\ nullifier \notin nullifiers
  /\ available' = available - amount
  /\ reserved' = reserved + amount
  /\ quarantined' = quarantined
  /\ consumed' = consumed
  /\ sequence' = sequence + 1
  /\ reservationIds' = reservationIds \cup {reservation}
  /\ obligations' = obligations \cup {obligation}
  /\ nullifiers' = nullifiers \cup {nullifier}

Consume(amount, base) ==
  /\ amount \in Amount
  /\ sequence < MaxSequence
  /\ base \in Sequence
  /\ base = sequence
  /\ reserved >= amount
  /\ available' = available
  /\ reserved' = reserved - amount
  /\ quarantined' = quarantined
  /\ consumed' = consumed + amount
  /\ sequence' = sequence + 1
  /\ UNCHANGED <<reservationIds, obligations, nullifiers>>

Quarantine(amount, base) ==
  /\ amount \in Amount
  /\ sequence < MaxSequence
  /\ base \in Sequence
  /\ base = sequence
  /\ reserved >= amount
  /\ available' = available
  /\ reserved' = reserved - amount
  /\ quarantined' = quarantined + amount
  /\ consumed' = consumed
  /\ sequence' = sequence + 1
  /\ UNCHANGED <<reservationIds, obligations, nullifiers>>

ReturnFromReserved(amount, base) ==
  /\ amount \in Amount
  /\ sequence < MaxSequence
  /\ base \in Sequence
  /\ base = sequence
  /\ reserved >= amount
  /\ available' = available + amount
  /\ reserved' = reserved - amount
  /\ quarantined' = quarantined
  /\ consumed' = consumed
  /\ sequence' = sequence + 1
  /\ UNCHANGED <<reservationIds, obligations, nullifiers>>

ReturnFromQuarantine(amount, base) ==
  /\ amount \in Amount
  /\ sequence < MaxSequence
  /\ base \in Sequence
  /\ base = sequence
  /\ quarantined >= amount
  /\ available' = available + amount
  /\ reserved' = reserved
  /\ quarantined' = quarantined - amount
  /\ consumed' = consumed
  /\ sequence' = sequence + 1
  /\ UNCHANGED <<reservationIds, obligations, nullifiers>>

Next ==
  \/ \E amount \in Amount,
        reservation \in ReservationIds,
        obligation \in Obligations,
        nullifier \in Nullifiers,
        base \in Sequence:
      Reserve(amount, reservation, obligation, nullifier, base)
  \/ \E amount \in Amount, base \in Sequence:
      Consume(amount, base)
  \/ \E amount \in Amount, base \in Sequence:
      Quarantine(amount, base)
  \/ \E amount \in Amount, base \in Sequence:
      ReturnFromReserved(amount, base)
  \/ \E amount \in Amount, base \in Sequence:
      ReturnFromQuarantine(amount, base)

Spec == Init /\ [][Next]_vars

Safety == Conserved /\ NoNegative

THEOREM Spec => []Conserved

================================================================================
