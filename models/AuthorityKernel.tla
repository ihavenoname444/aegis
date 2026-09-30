----------------------------- MODULE AuthorityKernel -----------------------------
EXTENDS Naturals, FiniteSets, TLC

CONSTANTS RootAuthority, MaxAmount, MaxSequence, MaxAttempts, ReservationIds, Obligations, Nullifiers

VARIABLES
  available,
  reserved,
  quarantined,
  consumed,
  sequence,
  attemptSequence,
  usedReservationIds,
  usedObligations,
  usedNullifiers,
  activeBindings,
  quarantinedBindings

vars == <<available, reserved, quarantined, consumed, sequence, attemptSequence, usedReservationIds,
          usedObligations, usedNullifiers, activeBindings, quarantinedBindings>>

Amount == 1..MaxAmount
Sequence == 0..MaxSequence
Bindings == ReservationIds \X Obligations \X Nullifiers \X Amount

Binding(reservation, obligation, nullifier, amount) ==
  <<reservation, obligation, nullifier, amount>>

BindingAmount(binding) == binding[4]

Init ==
  /\ available = RootAuthority
  /\ reserved = 0
  /\ quarantined = 0
  /\ consumed = 0
  /\ sequence = 0
  /\ attemptSequence = 0
  /\ usedReservationIds = {}
  /\ usedObligations = {}
  /\ usedNullifiers = {}
  /\ activeBindings = {}
  /\ quarantinedBindings = {}

Conserved ==
  available + reserved + quarantined + consumed = RootAuthority

NoNegative ==
  /\ available >= 0
  /\ reserved >= 0
  /\ quarantined >= 0
  /\ consumed >= 0

BindingDisjoint ==
  activeBindings \cap quarantinedBindings = {}

AttemptSequenceDominatesCanonicalSequence ==
  attemptSequence >= sequence

Reserve(amount, reservation, obligation, nullifier, base) ==
  LET binding == Binding(reservation, obligation, nullifier, amount) IN
  /\ amount \in Amount
  /\ sequence < MaxSequence
  /\ attemptSequence < MaxAttempts
  /\ base \in Sequence
  /\ base = sequence
  /\ available >= amount
  /\ reservation \in ReservationIds
  /\ obligation \in Obligations
  /\ nullifier \in Nullifiers
  /\ binding \in Bindings
  /\ reservation \notin usedReservationIds
  /\ obligation \notin usedObligations
  /\ nullifier \notin usedNullifiers
  /\ available' = available - amount
  /\ reserved' = reserved + amount
  /\ quarantined' = quarantined
  /\ consumed' = consumed
  /\ sequence' = sequence + 1
  /\ attemptSequence' = attemptSequence + 1
  /\ usedReservationIds' = usedReservationIds \cup {reservation}
  /\ usedObligations' = usedObligations \cup {obligation}
  /\ usedNullifiers' = usedNullifiers \cup {nullifier}
  /\ activeBindings' = activeBindings \cup {binding}
  /\ quarantinedBindings' = quarantinedBindings

Consume(binding, base) ==
  /\ binding \in activeBindings
  /\ sequence < MaxSequence
  /\ attemptSequence < MaxAttempts
  /\ base \in Sequence
  /\ base = sequence
  /\ reserved >= BindingAmount(binding)
  /\ available' = available
  /\ reserved' = reserved - BindingAmount(binding)
  /\ quarantined' = quarantined
  /\ consumed' = consumed + BindingAmount(binding)
  /\ sequence' = sequence + 1
  /\ attemptSequence' = attemptSequence + 1
  /\ activeBindings' = activeBindings \ {binding}
  /\ quarantinedBindings' = quarantinedBindings
  /\ UNCHANGED <<usedReservationIds, usedObligations, usedNullifiers>>

Quarantine(binding, base) ==
  /\ binding \in activeBindings
  /\ sequence < MaxSequence
  /\ attemptSequence < MaxAttempts
  /\ base \in Sequence
  /\ base = sequence
  /\ reserved >= BindingAmount(binding)
  /\ available' = available
  /\ reserved' = reserved - BindingAmount(binding)
  /\ quarantined' = quarantined + BindingAmount(binding)
  /\ consumed' = consumed
  /\ sequence' = sequence + 1
  /\ attemptSequence' = attemptSequence + 1
  /\ activeBindings' = activeBindings \ {binding}
  /\ quarantinedBindings' = quarantinedBindings \cup {binding}
  /\ UNCHANGED <<usedReservationIds, usedObligations, usedNullifiers>>

ReturnFromReserved(binding, base) ==
  /\ binding \in activeBindings
  /\ sequence < MaxSequence
  /\ attemptSequence < MaxAttempts
  /\ base \in Sequence
  /\ base = sequence
  /\ reserved >= BindingAmount(binding)
  /\ available' = available + BindingAmount(binding)
  /\ reserved' = reserved - BindingAmount(binding)
  /\ quarantined' = quarantined
  /\ consumed' = consumed
  /\ sequence' = sequence + 1
  /\ attemptSequence' = attemptSequence + 1
  /\ activeBindings' = activeBindings \ {binding}
  /\ quarantinedBindings' = quarantinedBindings
  /\ UNCHANGED <<usedReservationIds, usedObligations, usedNullifiers>>

ReturnFromQuarantine(binding, base) ==
  /\ binding \in quarantinedBindings
  /\ sequence < MaxSequence
  /\ attemptSequence < MaxAttempts
  /\ base \in Sequence
  /\ base = sequence
  /\ quarantined >= BindingAmount(binding)
  /\ available' = available + BindingAmount(binding)
  /\ reserved' = reserved
  /\ quarantined' = quarantined - BindingAmount(binding)
  /\ consumed' = consumed
  /\ sequence' = sequence + 1
  /\ attemptSequence' = attemptSequence + 1
  /\ activeBindings' = activeBindings
  /\ quarantinedBindings' = quarantinedBindings \ {binding}
  /\ UNCHANGED <<usedReservationIds, usedObligations, usedNullifiers>>

RejectedProposal ==
  /\ attemptSequence < MaxAttempts
  /\ attemptSequence' = attemptSequence + 1
  /\ UNCHANGED <<available, reserved, quarantined, consumed, sequence,
                 usedReservationIds, usedObligations, usedNullifiers,
                 activeBindings, quarantinedBindings>>

Next ==
  \/ \E amount \in Amount,
        reservation \in ReservationIds,
        obligation \in Obligations,
        nullifier \in Nullifiers,
        base \in Sequence:
      Reserve(amount, reservation, obligation, nullifier, base)
  \/ \E binding \in Bindings, base \in Sequence:
      Consume(binding, base)
  \/ \E binding \in Bindings, base \in Sequence:
      Quarantine(binding, base)
  \/ \E binding \in Bindings, base \in Sequence:
      ReturnFromReserved(binding, base)
  \/ \E binding \in Bindings, base \in Sequence:
      ReturnFromQuarantine(binding, base)
  \/ RejectedProposal

Spec == Init /\ [][Next]_vars

Safety == Conserved /\ NoNegative /\ BindingDisjoint /\ AttemptSequenceDominatesCanonicalSequence

THEOREM Spec => []Conserved

================================================================================
