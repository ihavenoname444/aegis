import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createCapacityLedger,
  issueCapacityCertificate,
  registerCapacityProvider
} from "../src/capacity-kernel.js";
import { baseEffect, basePolicy, baseProof } from "../src/fixtures.js";
import { verify } from "../src/verifier.js";

const cleanState = Object.freeze({
  spent_nullifiers: [],
  revoked_mandates: []
});

test("high-assurance verification requires canonical authority state", () => {
  const result = verify(baseEffect, baseProof, basePolicy);

  assert.equal(result.status, "UNKNOWN");
  assert.equal(result.reason, "CANONICAL_STATE_REQUIRED");
});

test("removing V from a high-assurance capacity certificate is rejected", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    capacity_certificate: {
      ...baseProof.capacity_certificate,
      v_locked: 0,
      v_encumbered: 0
    }
  }, basePolicy, cleanState);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "V_REQUIRED");
});

test("A, WRAM, USDC, BTC and TOKEN_X cannot substitute for V under the accepted profile", () => {
  for (const capacityAsset of ["A", "WRAM", "USDC", "BTC", "TOKEN_X"]) {
    const result = verify(baseEffect, {
      ...baseProof,
      capacity_certificate: {
        ...baseProof.capacity_certificate,
        capacity_asset: capacityAsset
      }
    }, basePolicy, cleanState);

    assert.equal(result.status, "INVALID", capacityAsset);
    assert.equal(result.reason, "CAPACITY_ASSET_REJECTED", capacityAsset);
  }
});

test("a capacity certificate without unique V encumbrance is rejected", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    capacity_certificate: {
      ...baseProof.capacity_certificate,
      unique_v_encumbrance: false
    }
  }, basePolicy, cleanState);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "UNIQUE_V_ENCUMBRANCE_REQUIRED");
});

test("a non-AEGIS high-assurance capacity profile is rejected", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    capacity_certificate: {
      ...baseProof.capacity_certificate,
      capacity_profile: "GENERIC_TOKEN_GATE"
    }
  }, basePolicy, cleanState);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "CAPACITY_PROFILE_REJECTED");
});

test("capacity providers cannot register substitute assets in the reference ledger", () => {
  for (const capacityAsset of ["A", "WRAM", "USDC", "BTC", "TOKEN_X"]) {
    const result = registerCapacityProvider(createCapacityLedger(), {
      provider_id: `provider:${capacityAsset}`,
      capacity_asset: capacityAsset,
      v_locked: 1_000,
      ram_committed_bytes: 1_000,
      acu_limit: 1_000
    });

    assert.equal(result.ok, false, capacityAsset);
    assert.equal(result.reason, "CAPACITY_ASSET_REJECTED", capacityAsset);
  }
});

test("the ledger rejects non-V certificates even from a V capacity provider", () => {
  const registered = registerCapacityProvider(createCapacityLedger(), {
    provider_id: "provider:v",
    capacity_asset: "V",
    v_locked: 1_000,
    ram_committed_bytes: 1_000,
    acu_limit: 1_000
  });

  const result = issueCapacityCertificate(registered.ledger, {
    certificate_id: "cert:usdc-substitute",
    provider_id: "provider:v",
    capacity_profile: "AEGIS_V_HIGH_ASSURANCE_V0",
    capacity_asset: "USDC",
    capacity_epoch: "C1",
    unique_v_encumbrance: true,
    v_encumbered: 1,
    ram_committed_bytes: 1,
    active_acu: 1
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "CAPACITY_ASSET_REJECTED");
});
