----------------------------- MODULE RootBinding -----------------------------
EXTENDS Naturals, FiniteSets, TLC

CONSTANTS Principals, Roots, RootAuthority

VARIABLES activeRoots, activePrincipals, activeAuthority

vars == <<activeRoots, activePrincipals, activeAuthority>>

Amount == 1..RootAuthority

Init ==
  /\ activeRoots = {}
  /\ activePrincipals = {}
  /\ activeAuthority = 0

Activate(root, principal, amount) ==
  /\ root \in Roots
  /\ principal \in Principals
  /\ amount \in Amount
  /\ root \notin activeRoots
  /\ principal \notin activePrincipals
  /\ activeRoots' = activeRoots \cup {root}
  /\ activePrincipals' = activePrincipals \cup {principal}
  /\ activeAuthority' = activeAuthority + amount

Next ==
  \E root \in Roots, principal \in Principals, amount \in Amount:
    Activate(root, principal, amount)

PrincipalUnique ==
  Cardinality(activeRoots) = Cardinality(activePrincipals)

AuthorityBoundedByActivePrincipals ==
  activeAuthority <= Cardinality(activePrincipals) * RootAuthority

Spec == Init /\ [][Next]_vars

Safety == PrincipalUnique /\ AuthorityBoundedByActivePrincipals

THEOREM Spec => []Safety

=============================================================================
