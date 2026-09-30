import assert from "node:assert/strict";
import { test } from "node:test";
import { baseEffect, basePolicy, baseProof } from "../src/fixtures.js";
import { verify } from "../src/verifier.js";

const cleanState = Object.freeze({
  spent_nullifiers: [],
  revoked_mandates: []
});

test("valid proof is bound to the accepted authority universe", () => {
  const result = verify(baseEffect, baseProof, basePolicy, cleanState);

  assert.equal(result.status, "VALID");
});

test("proof from another authority universe is rejected", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    authority_universe_id: "authority-universe:forked",
    finalized_checkpoint: {
      ...baseProof.finalized_checkpoint,
      authority_universe_id: "authority-universe:forked"
    }
  }, basePolicy, cleanState);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "AUTHORITY_UNIVERSE_REJECTED");
});

test("proof from another global authority root is rejected", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    global_authority_root_id: "gar:shadow-root",
    finalized_checkpoint: {
      ...baseProof.finalized_checkpoint,
      global_authority_root_id: "gar:shadow-root"
    }
  }, basePolicy, cleanState);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "GLOBAL_AUTHORITY_ROOT_REJECTED");
});

test("checkpoint without authority state root cannot satisfy non-equivocation", () => {
  const { authority_state_root, ...checkpointWithoutRoot } = baseProof.finalized_checkpoint;
  const result = verify(baseEffect, {
    ...baseProof,
    finalized_checkpoint: checkpointWithoutRoot
  }, basePolicy, cleanState);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "AUTHORITY_CHECKPOINT_REQUIRED");
});

test("unaccepted authority state root is rejected", () => {
  const result = verify(baseEffect, {
    ...baseProof,
    finalized_checkpoint: {
      ...baseProof.finalized_checkpoint,
      authority_state_root: "authority-root:fork"
    }
  }, basePolicy, cleanState);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "AUTHORITY_CHECKPOINT_REJECTED");
});

test("non-equivocation policy must pin at least one accepted checkpoint root", () => {
  const result = verify(baseEffect, baseProof, {
    ...basePolicy,
    accepted_authority_state_roots: [],
    accepted_authority_checkpoints: {}
  }, cleanState);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "AUTHORITY_CHECKPOINT_REJECTED");
});

test("same checkpoint id cannot be accepted with two authority roots", () => {
  const policy = {
    ...basePolicy,
    accepted_authority_state_roots: ["authority-root:F1", "authority-root:fork"],
    accepted_authority_checkpoints: {}
  };
  const state = {
    spent_nullifiers: [],
    revoked_mandates: [],
    accepted_authority_checkpoints: {
      "checkpoint:F1": {
        sequence: 7,
        authority_universe_id: baseProof.authority_universe_id,
        global_authority_root_id: baseProof.global_authority_root_id,
        authority_state_root: "authority-root:F1"
      }
    }
  };
  const result = verify(baseEffect, {
    ...baseProof,
    finalized_checkpoint: {
      ...baseProof.finalized_checkpoint,
      authority_state_root: "authority-root:fork"
    }
  }, policy, state);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "AUTHORITY_HISTORY_EQUIVOCATED");
});

test("same authority sequence cannot be accepted with two roots", () => {
  const policy = {
    ...basePolicy,
    accepted_authority_state_roots: ["authority-root:F1", "authority-root:fork"],
    accepted_authority_checkpoints: {}
  };
  const state = {
    spent_nullifiers: [],
    revoked_mandates: [],
    accepted_authority_checkpoints: [
      {
        id: "checkpoint:other-id",
        sequence: 7,
        authority_universe_id: baseProof.authority_universe_id,
        global_authority_root_id: baseProof.global_authority_root_id,
        authority_state_root: "authority-root:F1"
      }
    ]
  };
  const result = verify(baseEffect, {
    ...baseProof,
    finalized_checkpoint: {
      ...baseProof.finalized_checkpoint,
      id: "checkpoint:fork-by-sequence",
      authority_state_root: "authority-root:fork"
    }
  }, policy, state);

  assert.equal(result.status, "INVALID");
  assert.equal(result.reason, "AUTHORITY_HISTORY_EQUIVOCATED");
});
