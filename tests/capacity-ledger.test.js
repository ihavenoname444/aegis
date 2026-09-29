import assert from "node:assert/strict";
import { test } from "node:test";
import {
  capacityLedgerReport,
  createCapacityLedger,
  issueCapacityCertificate,
  registerCapacityProvider,
  retireCapacityCertificate
} from "../src/capacity-kernel.js";

test("global capacity ledger prevents V double-backing across live certificates", () => {
  let ledger = createCapacityLedger();
  ledger = registerCapacityProvider(ledger, {
    provider_id: "provider:1",
    capacity_asset: "V",
    v_locked: 100,
    ram_committed_bytes: 1_000,
    acu_limit: 100
  }).ledger;

  let result = issueCapacityCertificate(ledger, {
    certificate_id: "cert:1",
    provider_id: "provider:1",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 60,
    ram_committed_bytes: 600,
    active_acu: 60
  });
  assert.equal(result.ok, true);
  ledger = result.ledger;

  result = issueCapacityCertificate(ledger, {
    certificate_id: "cert:2",
    provider_id: "provider:1",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 40,
    ram_committed_bytes: 400,
    active_acu: 40
  });
  assert.equal(result.ok, true);
  ledger = result.ledger;

  result = issueCapacityCertificate(ledger, {
    certificate_id: "cert:3",
    provider_id: "provider:1",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 1,
    ram_committed_bytes: 1,
    active_acu: 1
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "CAPACITY_DOUBLE_BACKED");

  const report = capacityLedgerReport(result.ledger);
  assert.equal(report.conserved, true);
  assert.equal(report.providers[0].v_encumbered, 100);
  assert.equal(report.providers[0].v_available, 0);
});

test("RAM cannot substitute for missing V", () => {
  let ledger = createCapacityLedger();
  ledger = registerCapacityProvider(ledger, {
    provider_id: "provider:ram-only",
    capacity_asset: "V",
    v_locked: 0,
    ram_committed_bytes: 1_000_000,
    acu_limit: 100
  }).ledger;

  const result = issueCapacityCertificate(ledger, {
    certificate_id: "cert:no-v",
    provider_id: "provider:ram-only",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 1,
    ram_committed_bytes: 1024,
    active_acu: 1
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "CAPACITY_DOUBLE_BACKED");
});

test("capacity certificate with zero V is rejected even when RAM exists", () => {
  let ledger = createCapacityLedger();
  ledger = registerCapacityProvider(ledger, {
    provider_id: "provider:zero-v-cert",
    capacity_asset: "V",
    v_locked: 100,
    ram_committed_bytes: 1_000_000,
    acu_limit: 100
  }).ledger;

  const result = issueCapacityCertificate(ledger, {
    certificate_id: "cert:zero-v",
    provider_id: "provider:zero-v-cert",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 0,
    ram_committed_bytes: 1024,
    active_acu: 1
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "V_REQUIRED");
});

test("V cannot substitute for missing physical RAM backing", () => {
  let ledger = createCapacityLedger();
  ledger = registerCapacityProvider(ledger, {
    provider_id: "provider:v-only",
    capacity_asset: "V",
    v_locked: 1_000_000,
    ram_committed_bytes: 0,
    acu_limit: 100
  }).ledger;

  const result = issueCapacityCertificate(ledger, {
    certificate_id: "cert:no-ram",
    provider_id: "provider:v-only",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 1,
    ram_committed_bytes: 1024,
    active_acu: 1
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "PHYSICAL_RESOURCE_INSUFFICIENT");
});

test("retired certificate releases provider capacity", () => {
  let ledger = createCapacityLedger();
  ledger = registerCapacityProvider(ledger, {
    provider_id: "provider:retire",
    capacity_asset: "V",
    v_locked: 10,
    ram_committed_bytes: 10,
    acu_limit: 10
  }).ledger;

  ledger = issueCapacityCertificate(ledger, {
    certificate_id: "cert:old",
    provider_id: "provider:retire",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 10,
    ram_committed_bytes: 10,
    active_acu: 10
  }).ledger;

  ledger = retireCapacityCertificate(ledger, "cert:old").ledger;

  const result = issueCapacityCertificate(ledger, {
    certificate_id: "cert:new",
    provider_id: "provider:retire",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "V",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 10,
    ram_committed_bytes: 10,
    active_acu: 10
  });

  assert.equal(result.ok, true);
  assert.equal(capacityLedgerReport(result.ledger).conserved, true);
});
