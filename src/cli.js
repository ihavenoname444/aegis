import { readFileSync } from "node:fs";
import { verify, defaultState } from "./verifier.js";

const args = parseArgs(process.argv.slice(2));

if (!args.effect || !args.proof || !args.policy) {
  console.error("Usage: npm run verify -- --effect effect.json --proof proof.json --policy policy.json");
  process.exit(2);
}

const effect = JSON.parse(readFileSync(args.effect, "utf8"));
const proof = JSON.parse(readFileSync(args.proof, "utf8"));
const policy = JSON.parse(readFileSync(args.policy, "utf8"));

console.log(JSON.stringify(verify(effect, proof, policy, defaultState()), null, 2));

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    out[argv[i].replace(/^--/, "")] = argv[i + 1];
  }
  return out;
}

