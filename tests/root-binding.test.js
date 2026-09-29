import assert from "node:assert/strict";
import { test } from "node:test";
import { conservationReport } from "../src/authority-kernel.js";
import {
  activateRootBinding,
  createRootRegistry,
  evaluateRootAuthorization,
  rootRegistryReport
} from "../src/root-binding.js";

const institutionalBinding = Object.freeze({
  root_id: "institution:root",
  principal_id: "bank:example",
  legal_attestation_id: "lei:EXAMPLEBANK",
  vaulta_root_account: "bankroot.vlt",
  root_authorized: 10_000,
  approval_policy: {
    separation_of_duties: true,
    threshold_rules: [
      { role: "treasury_officer", threshold: 2 },
      { role: "risk_officer", threshold: 1, minimum_amount: 5_001 }
    ]
  }
});

test("multi-principal root activation creates one conserved institutional root", () => {
  const authorization = {
    authorization_id: "auth:board-approved-1",
    requested_authority: 10_000,
    approvals: [
      { actor_id: "alice", role: "treasury_officer" },
      { actor_id: "bob", role: "treasury_officer" },
      { actor_id: "carol", role: "risk_officer" }
    ]
  };

  const result = activateRootBinding(createRootRegistry(), institutionalBinding, authorization);

  assert.equal(result.ok, true);
  assert.equal(result.state.root_authorized, 10_000);
  assert.equal(conservationReport(result.state).accounted, 10_000);
  assert.equal(conservationReport(result.state).conserved, true);
  assert.equal(rootRegistryReport(result.registry).total_active_authority, 10_000);
});

test("threshold signers do not each become independent authority roots", () => {
  let registry = createRootRegistry();
  const authorization = {
    authorization_id: "auth:single-root",
    requested_authority: 10_000,
    approvals: [
      { actor_id: "alice", role: "treasury_officer" },
      { actor_id: "bob", role: "treasury_officer" },
      { actor_id: "carol", role: "risk_officer" }
    ]
  };

  const first = activateRootBinding(registry, institutionalBinding, authorization);
  registry = first.registry;
  const second = activateRootBinding(registry, institutionalBinding, {
    ...authorization,
    authorization_id: "auth:replay-root"
  });

  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
  assert.equal(second.reason, "ROOT_ALREADY_ACTIVE");
  assert.equal(rootRegistryReport(second.registry).total_active_authority, 10_000);
});

test("recovery re-binding cannot create a second active root for the same principal", () => {
  const authorization = {
    authorization_id: "auth:primary-root",
    requested_authority: 10_000,
    approvals: [
      { actor_id: "alice", role: "treasury_officer" },
      { actor_id: "bob", role: "treasury_officer" },
      { actor_id: "carol", role: "risk_officer" }
    ]
  };
  const first = activateRootBinding(createRootRegistry(), institutionalBinding, authorization);
  const recoveryBinding = {
    ...institutionalBinding,
    root_id: "institution:root-recovered",
    vaulta_root_account: "bankrecover.vlt"
  };

  const second = activateRootBinding(first.registry, recoveryBinding, {
    ...authorization,
    authorization_id: "auth:recovery-root"
  });

  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
  assert.equal(second.reason, "PRINCIPAL_ALREADY_ACTIVE");
  assert.equal(rootRegistryReport(second.registry).total_active_authority, 10_000);
});

test("principal alias cannot rebind the same legal attestation into a second root", () => {
  const authorization = {
    authorization_id: "auth:primary-legal-root",
    requested_authority: 10_000,
    approvals: [
      { actor_id: "alice", role: "treasury_officer" },
      { actor_id: "bob", role: "treasury_officer" },
      { actor_id: "carol", role: "risk_officer" }
    ]
  };
  const first = activateRootBinding(createRootRegistry(), institutionalBinding, authorization);
  const aliasBinding = {
    ...institutionalBinding,
    root_id: "institution:root-alias",
    principal_id: "bank:example-alias",
    vaulta_root_account: "bankalias.vlt"
  };

  const second = activateRootBinding(first.registry, aliasBinding, {
    ...authorization,
    authorization_id: "auth:alias-root"
  });

  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
  assert.equal(second.reason, "LEGAL_ATTESTATION_ALREADY_ACTIVE");
  assert.equal(rootRegistryReport(second.registry).total_active_authority, 10_000);
});

test("2-of-3 treasury without risk cannot authorize above risk threshold", () => {
  const result = evaluateRootAuthorization(institutionalBinding, {
    authorization_id: "auth:no-risk",
    requested_authority: 10_000,
    approvals: [
      { actor_id: "alice", role: "treasury_officer" },
      { actor_id: "bob", role: "treasury_officer" }
    ]
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "APPROVAL_THRESHOLD_UNMET");
});

test("same actor cannot satisfy treasury and risk when separation of duties is required", () => {
  const result = evaluateRootAuthorization(institutionalBinding, {
    authorization_id: "auth:same-actor",
    requested_authority: 10_000,
    approvals: [
      { actor_id: "alice", role: "treasury_officer" },
      { actor_id: "bob", role: "treasury_officer" },
      { actor_id: "alice", role: "risk_officer" }
    ]
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "ROLE_SEPARATION_VIOLATED");
});

test("recovery or emergency master key cannot activate root authority", () => {
  const result = evaluateRootAuthorization(institutionalBinding, {
    authorization_id: "auth:emergency-master-key",
    requested_authority: 10_000,
    hidden_master_key: true,
    approvals: []
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "HIDDEN_MASTER_KEY_REJECTED");
});

test("authorization cannot exceed institutional root authority", () => {
  const result = evaluateRootAuthorization(institutionalBinding, {
    authorization_id: "auth:too-large",
    requested_authority: 10_001,
    approvals: [
      { actor_id: "alice", role: "treasury_officer" },
      { actor_id: "bob", role: "treasury_officer" },
      { actor_id: "carol", role: "risk_officer" }
    ]
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "AUTHORITY_EXCEEDS_ROOT");
});
