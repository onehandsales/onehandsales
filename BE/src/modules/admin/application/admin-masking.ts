export function maskEmail(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [localPart, domain] = value.split("@");

  if (!localPart || !domain) {
    return maskText(value);
  }

  return `${maskText(localPart)}@${domain}`;
}

export function maskPhone(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length <= 4) {
    return "****";
  }

  return `***-****-${digits.slice(-4)}`;
}

export function maskMoney(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return "MASKED";
}

export function summarizeReason(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= 40) {
    return normalized;
  }

  return `${normalized.slice(0, 40)}...`;
}

function maskText(value: string) {
  if (value.length <= 2) {
    return `${value[0] ?? "*"}***`;
  }

  return `${value[0]}***${value[value.length - 1]}`;
}
