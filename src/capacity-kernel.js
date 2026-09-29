export function validateCapacityCertificate(proof, policy) {
  const cert = proof.capacity_certificate;
  if (!cert) return { ok: false, reason: "CAPACITY_MISSING" };

  if (!policy.accepted_capacity_epochs.includes(cert.capacity_epoch)) {
    return { ok: false, reason: "CAPACITY_EPOCH_REJECTED" };
  }

  if (cert.v_encumbered > cert.v_locked) {
    return { ok: false, reason: "CAPACITY_DOUBLE_BACKED" };
  }

  if (cert.active_acu > cert.acu_limit) {
    return { ok: false, reason: "CAPACITY_INSUFFICIENT" };
  }

  if (cert.ram_committed_bytes < policy.minimum_ram_committed_bytes) {
    return { ok: false, reason: "PHYSICAL_RESOURCE_INSUFFICIENT" };
  }

  if (cert.status !== "ACTIVE") {
    return { ok: false, reason: "CAPACITY_MISSING" };
  }

  return { ok: true, reason: "VALID" };
}

export function createCapacityLedger() {
  return {
    providers: {},
    certificates: {},
    sequence: 0,
    trace: []
  };
}

export function registerCapacityProvider(ledger, provider) {
  const next = clone(ledger);
  const result = validateProvider(provider);
  const entry = capacityTrace(next, "REGISTER_PROVIDER", provider.provider_id, result);
  if (!result.ok) return { ok: false, reason: result.reason, ledger: next, entry };

  next.providers[provider.provider_id] = {
    provider_id: provider.provider_id,
    v_locked: provider.v_locked,
    ram_committed_bytes: provider.ram_committed_bytes,
    acu_limit: provider.acu_limit,
    status: provider.status ?? "ACTIVE"
  };
  return { ok: true, reason: "VALID", ledger: next, entry };
}

export function issueCapacityCertificate(ledger, certificate) {
  const next = clone(ledger);
  const result = validateLedgerCertificate(next, certificate);
  const entry = capacityTrace(next, "ISSUE_CERTIFICATE", certificate.certificate_id, result);
  if (!result.ok) return { ok: false, reason: result.reason, ledger: next, entry };

  next.certificates[certificate.certificate_id] = {
    certificate_id: certificate.certificate_id,
    provider_id: certificate.provider_id,
    capacity_epoch: certificate.capacity_epoch,
    v_encumbered: certificate.v_encumbered,
    ram_committed_bytes: certificate.ram_committed_bytes,
    active_acu: certificate.active_acu,
    status: "ACTIVE"
  };
  return { ok: true, reason: "VALID", ledger: next, entry };
}

export function retireCapacityCertificate(ledger, certificateId) {
  const next = clone(ledger);
  const certificate = next.certificates[certificateId];
  const result = certificate
    ? { ok: true, reason: "VALID" }
    : { ok: false, reason: "CAPACITY_MISSING" };
  const entry = capacityTrace(next, "RETIRE_CERTIFICATE", certificateId, result);
  if (!result.ok) return { ok: false, reason: result.reason, ledger: next, entry };

  certificate.status = "RETIRED";
  return { ok: true, reason: "VALID", ledger: next, entry };
}

export function capacityLedgerReport(ledger) {
  const providers = Object.values(ledger.providers);
  const activeCertificates = Object.values(ledger.certificates)
    .filter((certificate) => certificate.status === "ACTIVE");
  const providerReports = providers.map((provider) => {
    const certs = activeCertificates.filter((certificate) => (
      certificate.provider_id === provider.provider_id
    ));
    const v_encumbered = sum(certs.map((certificate) => certificate.v_encumbered));
    const ram_encumbered_bytes = sum(certs.map((certificate) => certificate.ram_committed_bytes));
    const active_acu = sum(certs.map((certificate) => certificate.active_acu));

    return {
      provider_id: provider.provider_id,
      v_locked: provider.v_locked,
      v_encumbered,
      v_available: provider.v_locked - v_encumbered,
      ram_committed_bytes: provider.ram_committed_bytes,
      ram_encumbered_bytes,
      ram_available_bytes: provider.ram_committed_bytes - ram_encumbered_bytes,
      acu_limit: provider.acu_limit,
      active_acu,
      acu_available: provider.acu_limit - active_acu,
      conserved: v_encumbered <= provider.v_locked
        && ram_encumbered_bytes <= provider.ram_committed_bytes
        && active_acu <= provider.acu_limit
    };
  });

  return {
    providers: providerReports,
    active_certificates: activeCertificates.length,
    conserved: providerReports.every((provider) => provider.conserved)
  };
}

function validateLedgerCertificate(ledger, certificate) {
  if (!certificate) return { ok: false, reason: "CAPACITY_MISSING" };
  if (ledger.certificates[certificate.certificate_id]) {
    return { ok: false, reason: "CAPACITY_CERTIFICATE_EXISTS" };
  }

  const provider = ledger.providers[certificate.provider_id];
  if (!provider || provider.status !== "ACTIVE") {
    return { ok: false, reason: "CAPACITY_PROVIDER_MISSING" };
  }

  if (!isPositive(certificate.v_encumbered)) {
    return { ok: false, reason: "V_REQUIRED" };
  }

  if (!isPositive(certificate.ram_committed_bytes)) {
    return { ok: false, reason: "PHYSICAL_RESOURCE_INSUFFICIENT" };
  }

  if (!isPositive(certificate.active_acu)) {
    return { ok: false, reason: "CAPACITY_INSUFFICIENT" };
  }

  const report = capacityLedgerReport(ledger).providers
    .find((item) => item.provider_id === provider.provider_id);

  if (report.v_encumbered + certificate.v_encumbered > provider.v_locked) {
    return { ok: false, reason: "CAPACITY_DOUBLE_BACKED" };
  }

  if (report.ram_encumbered_bytes + certificate.ram_committed_bytes > provider.ram_committed_bytes) {
    return { ok: false, reason: "PHYSICAL_RESOURCE_INSUFFICIENT" };
  }

  if (report.active_acu + certificate.active_acu > provider.acu_limit) {
    return { ok: false, reason: "CAPACITY_INSUFFICIENT" };
  }

  return { ok: true, reason: "VALID" };
}

function validateProvider(provider) {
  if (!provider?.provider_id) return { ok: false, reason: "CAPACITY_PROVIDER_MISSING" };
  if (!isNonNegative(provider.v_locked)) return { ok: false, reason: "INVALID_V_LOCK" };
  if (!isNonNegative(provider.ram_committed_bytes)) {
    return { ok: false, reason: "INVALID_RAM_COMMITMENT" };
  }
  if (!isNonNegative(provider.acu_limit)) return { ok: false, reason: "INVALID_ACU_LIMIT" };
  return { ok: true, reason: "VALID" };
}

function capacityTrace(ledger, transition, id, result) {
  ledger.sequence += 1;
  const entry = {
    sequence: ledger.sequence,
    transition,
    id,
    ok: result.ok,
    reason: result.reason
  };
  ledger.trace.push(entry);
  return entry;
}

function isPositive(value) {
  return Number.isInteger(value) && value > 0;
}

function isNonNegative(value) {
  return Number.isInteger(value) && value >= 0;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
