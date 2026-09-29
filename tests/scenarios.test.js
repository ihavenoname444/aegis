import assert from "node:assert/strict";
import { test } from "node:test";
import { verify } from "../src/verifier.js";
import { fiveRailScenarios } from "../src/scenarios.js";

for (const scenario of fiveRailScenarios()) {
  test(`scenario: ${scenario.name}`, () => {
    const result = verify(scenario.effect, scenario.proof, scenario.policy, scenario.state);
    assert.equal(result.status, scenario.expected);
  });
}

