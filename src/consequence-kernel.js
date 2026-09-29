export function consequencePolicy(proof, policy) {
  if (proof.consequence?.status === "UNKNOWN" && policy.unknown_consequence === "QUARANTINE") {
    return { ok: false, status: "UNKNOWN", reason: "CONSEQUENCE_UNKNOWN" };
  }

  return { ok: true, status: "VALID", reason: "VALID" };
}

