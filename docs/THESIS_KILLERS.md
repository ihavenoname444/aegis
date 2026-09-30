# Thesis Killers

Each killer must be tracked as an attack, not as a slogan.

| Killer | Attack | Minimal Counterexample | Status | Fix / Next Step |
|---|---|---|---|---|
| K1 Existing system solves this better | Canton/bank-HSM/other stack provides lower-risk global authority clearing. | Same guarantee with smaller TCB. | UNPROVEN | Build `TCB_COMPARISON.md`. |
| K2 Complete mediation infeasible | Agent keeps direct root/API credential. | Valid proof not required for execution. | UNPROVEN | Bank/HSM adapter model. |
| K3 Authority amplification possible | 10,000 becomes 10,001. | Hostile trace succeeds. | IMPLEMENTATION_TESTED against fixed trace | Expand formal model. |
| K4 V removable | High-assurance proof works with no V. | V removed, proof still valid. | IMPLEMENTATION_TESTED in reference profile | Production on-chain proof required. |
| K5 V substitutable | A/WRAM/USDC/BTC/TOKEN_X preserves guarantee. | Substitute asset validates unchanged. | IMPLEMENTATION_TESTED in reference profile | Production economics unresolved. |
| K15 Governance capture expands accepted authority | H2/C4 silently accepted. | Pinned verifier accepts untrusted upgrade. | IMPLEMENTATION_TESTED | Real permission graph needed. |
| K17 Migration duplicates authority | H1 and H2 both spend same root. | Old/new kernels consume same cell. | PARTIAL | Root-approved migration model. |
| K19 Recovery introduces hidden master key | Emergency admin recreates root authority. | Master key activates root without policy approvals or re-binds the same institution as a second root. | IMPLEMENTATION_TESTED for root binding | Full recovery ceremony still needed. |
| K20 Multi-principal composition creates authority | Officers each become independent roots. | 10,000 root becomes 30,000. | IMPLEMENTATION_TESTED | Broader legal/HSM integration needed. |
| K21 Module composition violates conservation | Safe module A + safe module B share aliases unsafely. | Cross-module reservation spends twice. | UNPROVEN | Composition model and tests. |
| K22 Reservation DoS unusable | Cheap reservations freeze authority indefinitely. | Attacker quarantines/holds all authority. | UNPROVEN | Reservation cost/expiry/priority model. |
| K23 Verifier monoculture | One verifier bug becomes protocol truth. | Independent implementation disagrees. | UNPROVEN | Second verifier and conformance vectors. |
| K24 Cold-start insufficient | One-domain deployment adds no value. | Local policy already enough. | UNPROVEN | Two-domain killer application. |
| K25 Responsibility unacceptable | Proof valid but bank executes wrong action. | Liability boundary unclear. | UNPROVEN | Responsibility model. |
| K26 Authority universe forks | Two domains accept conflicting histories for the same root authority. | Same checkpoint/sequence maps to two accepted authority roots. | IMPLEMENTATION_TESTED for known local conflicts | Model partitions, finality races and migration. |
| K27 V not structurally necessary | WRAM, arbitrary collateral or bank/HSM capacity provides the same accepted service with a smaller TCB. | Equivalent non-equivocation and capacity non-double-backing without V. | UNPROVEN | Build substitute architecture and compare honestly. |
