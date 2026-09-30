--------------------------- MODULE AuthorityUniverse ---------------------------
EXTENDS FiniteSets

CONSTANTS Checkpoints, Roots

VARIABLE accepted

Init ==
  accepted = {}

Accept(checkpoint, root) ==
  /\ checkpoint \in Checkpoints
  /\ root \in Roots
  /\ \A item \in accepted:
        item[1] # checkpoint \/ item[2] = root
  /\ accepted' = accepted \cup {<<checkpoint, root>>}

RejectFork(checkpoint, root) ==
  /\ checkpoint \in Checkpoints
  /\ root \in Roots
  /\ \E item \in accepted:
        item[1] = checkpoint /\ item[2] # root
  /\ UNCHANGED accepted

Next ==
  \E checkpoint \in Checkpoints, root \in Roots:
    Accept(checkpoint, root) \/ RejectFork(checkpoint, root)

NoAuthorityFork ==
  \A checkpoint \in Checkpoints:
    Cardinality({root \in Roots: <<checkpoint, root>> \in accepted}) <= 1

Spec ==
  Init /\ [][Next]_accepted

THEOREM Spec => []NoAuthorityFork

=============================================================================
