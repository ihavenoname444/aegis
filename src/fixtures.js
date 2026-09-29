import { commitment } from "./canonical.js";

export const baseEffect = Object.freeze({
  effect_type: "PAYMENT",
  action: "TRANSFER",
  recipient: "merchant.bank.example",
  execution_domain: "BANK_RAIL",
  asset: "USD",
  amount: 100,
  parameters_commitment: commitment({ memo: "invoice-100" })
});

export const basePolicy = Object.freeze({
  accepted_network_id: "vaulta-test-model",
  accepted_profile_versions: ["AEGIS-V-0"],
  accepted_kernel_hashes: ["kernel:H1"],
  accepted_authority_schema_hashes: ["schema:S1"],
  accepted_capacity_epochs: ["C1"],
  accepted_proof_versions: ["proof-v0"],
  accepted_evidence_classes: ["A", "B"],
  complete_mediation_required: true,
  minimum_ram_committed_bytes: 1024,
  maximum_checkpoint_age_ms: 3_000,
  now_ms: 10_000,
  unknown_consequence: "QUARANTINE"
});

export const baseProof = Object.freeze({
  network_id: "vaulta-test-model",
  profile_version: "AEGIS-V-0",
  kernel_account: "aegis.auth",
  kernel_code_hash: "kernel:H1",
  authority_schema_hash: "schema:S1",
  verifier_profile_hash: "profile:P1",
  root_identity: "bank-root:example",
  mandate_id: "mandate:M1",
  mandate_version: 1,
  delegation_lineage: ["bank-root:example", "agent:treasury-bot"],
  delegated_permission: "pay.invoice",
  effect: baseEffect,
  obligation_id: "obligation:O1",
  reservation_id: "reservation:R1",
  nonce: "nonce:N1",
  nullifier: "nullifier:N1",
  issue_checkpoint: 9_000,
  expiry: 20_000,
  revocation_checkpoint: 8_000,
  finalized_checkpoint: {
    id: "checkpoint:F1",
    time_ms: 9_500
  },
  capacity_certificate: {
    certificate_id: "cert:CERT1",
    capacity_epoch: "C1",
    v_locked: 100,
    v_encumbered: 100,
    ram_committed_bytes: 1024,
    acu_limit: 100,
    active_acu: 100,
    status: "ACTIVE"
  },
  evidence_class: "B",
  consequence: {
    status: "PENDING"
  },
  proof_version: "proof-v0",
  crypto_suite: "model-sha256-v0",
  agent_has_bypass_credential: false
});
