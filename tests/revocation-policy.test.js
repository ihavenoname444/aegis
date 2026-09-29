import assert from "node:assert/strict";
import { test } from "node:test";
import { baseEffect, basePolicy, baseProof } from "../src/fixtures.js";
import { RevocationMode } from "../src/revocation-policy.js";
import { verify } from "../src/verifier.js";

test("ONLINE_HIGH_ASSURANCE accepts fresh unrevoked view", () => {
  const result = verify(baseEffect, baseProof, {
    ...basePolicy,
    revocation_profile: {
      mode: RevocationMode.ONLINE_HIGH_ASSURANCE,
      maximum_revocation_view_age_ms: 750
    }
  }, freshState());

  assert.equal(result.status, "VALID");
});

test("ONLINE_HIGH_ASSURANCE rejects known revoked mandate", () => {
  const result = verify(baseEffect, baseProof, {
    ...basePolicy,
    revocation_profile: {
      mode: RevocationMode.ONLINE_HIGH_ASSURANCE,
      maximum_revocation_view_age_ms: 750
    }
  }, {
    ...freshState(),
    revocation_view: {
      checked_at_ms: 9_900,
      revoked_mandates: ["mandate:M1"]
    }
  });

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "MANDATE_REVOKED");
});

test("ONLINE_HIGH_ASSURANCE returns STALE when revocation view is too old", () => {
  const result = verify(baseEffect, baseProof, {
    ...basePolicy,
    revocation_profile: {
      mode: RevocationMode.ONLINE_HIGH_ASSURANCE,
      maximum_revocation_view_age_ms: 500
    }
  }, {
    ...freshState(),
    revocation_view: {
      checked_at_ms: 9_000,
      revoked_mandates: []
    }
  });

  assert.equal(result.status, "STALE");
  assert.equal(result.reason, "REVOCATION_VIEW_STALE");
});

test("BOUNDED_OFFLINE accepts within offline revocation bound", () => {
  const result = verify(baseEffect, baseProof, {
    ...basePolicy,
    revocation_profile: {
      mode: RevocationMode.BOUNDED_OFFLINE,
      maximum_offline_age_ms: 2_000
    }
  }, {
    ...freshState(),
    revocation_view: {
      checked_at_ms: 8_500,
      revoked_mandates: []
    }
  });

  assert.equal(result.status, "VALID");
});

test("BOUNDED_OFFLINE returns STALE beyond offline revocation bound", () => {
  const result = verify(baseEffect, baseProof, {
    ...basePolicy,
    revocation_profile: {
      mode: RevocationMode.BOUNDED_OFFLINE,
      maximum_offline_age_ms: 500
    }
  }, {
    ...freshState(),
    revocation_view: {
      checked_at_ms: 8_500,
      revoked_mandates: []
    }
  });

  assert.equal(result.status, "STALE");
  assert.equal(result.reason, "REVOCATION_VIEW_STALE");
});

test("LOCAL_CELL accepts unexpired local authority cell", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    local_cell: {
      cell_id: "cell:1",
      issued_at_ms: 9_000,
      expires_at_ms: 10_500
    }
  }, {
    ...basePolicy,
    revocation_profile: {
      mode: RevocationMode.LOCAL_CELL
    }
  }, {
    ...freshState(),
    revocation_view: {
      checked_at_ms: 9_000,
      revoked_mandates: []
    }
  });

  assert.equal(result.status, "VALID");
});

test("LOCAL_CELL requires local cell proof binding", () => {
  const result = verify(baseEffect, baseProof, {
    ...basePolicy,
    revocation_profile: {
      mode: RevocationMode.LOCAL_CELL
    }
  }, freshState());

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "LOCAL_CELL_REQUIRED");
});

test("LOCAL_CELL returns STALE after cell expiry", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    local_cell: {
      cell_id: "cell:expired",
      issued_at_ms: 8_000,
      expires_at_ms: 9_999
    }
  }, {
    ...basePolicy,
    revocation_profile: {
      mode: RevocationMode.LOCAL_CELL
    }
  }, freshState());

  assert.equal(result.status, "STALE");
  assert.equal(result.reason, "LOCAL_CELL_EXPIRED");
});

function freshState() {
  return {
    spent_nullifiers: [],
    revoked_mandates: [],
    revocation_view: {
      checked_at_ms: 9_900,
      revoked_mandates: []
    }
  };
}
