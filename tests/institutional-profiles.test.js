import assert from "node:assert/strict";
import { test } from "node:test";
import { basePolicy } from "../src/fixtures.js";
import {
  evaluateInstitutionalPolicy,
  InstitutionalProfile
} from "../src/institutional-profiles.js";

test("base policy satisfies tier-1 bank high-value profile", () => {
  const result = evaluateInstitutionalPolicy(
    basePolicy,
    InstitutionalProfile.TIER1_BANK_HIGH_VALUE
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.failed, []);
});

test("central-bank systemic profile requires stricter freshness, evidence and revocation", () => {
  const result = evaluateInstitutionalPolicy(
    basePolicy,
    InstitutionalProfile.CENTRAL_BANK_SYSTEMIC
  );

  assert.equal(result.ok, false);
  assert.ok(result.failed.includes("fresh_finality_bound"));
  assert.ok(result.failed.includes("online_revocation_profile"));
});

test("central-bank systemic policy passes when strict controls are present", () => {
  const result = evaluateInstitutionalPolicy({
    ...basePolicy,
    accepted_evidence_classes: ["A"],
    maximum_checkpoint_age_ms: 1_000,
    revocation_profile: "ONLINE_HIGH_ASSURANCE"
  }, InstitutionalProfile.CENTRAL_BANK_SYSTEMIC);

  assert.equal(result.ok, true);
});

test("advisory AI policy is not high-assurance", () => {
  const result = evaluateInstitutionalPolicy({
    ...basePolicy,
    canonical_authority_state_required: false,
    complete_mediation_required: false,
    accepted_capacity_asset: "USDC",
    unknown_consequence: "ALLOW"
  }, InstitutionalProfile.TIER1_BANK_HIGH_VALUE);

  assert.equal(result.ok, false);
  assert.ok(result.failed.includes("canonical_authority_state"));
  assert.ok(result.failed.includes("complete_mediation"));
  assert.ok(result.failed.includes("v_capacity_asset"));
  assert.ok(result.failed.includes("fails_closed_unknown"));
});

test("market infrastructure profile accepts bounded or online revocation", () => {
  const result = evaluateInstitutionalPolicy({
    ...basePolicy,
    maximum_checkpoint_age_ms: 2_000,
    revocation_profile: "BOUNDED_OFFLINE"
  }, InstitutionalProfile.MARKET_INFRASTRUCTURE_INTEROP);

  assert.equal(result.ok, true);
});
