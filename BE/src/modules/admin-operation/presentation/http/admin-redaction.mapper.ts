// 기능 : email 로컬 파트를 일부만 남긴 masking 문자열을 생성합니다.
export function maskEmail(email: string | null): string | null {
  if (!email) {
    return null;
  }

  const [localPart, domainPart] = email.split("@");

  if (!localPart || !domainPart) {
    return "****";
  }

  const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));

  return `${visiblePrefix}***@${domainPart}`;
}

// 기능 : 사용자 표시 이름의 일부만 남긴 masking 문자열을 생성합니다.
export function maskDisplayName(displayName: string | null): string | null {
  const normalized = displayName?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length === 1) {
    return "*";
  }

  const visibleLength = Math.min(3, Math.max(1, normalized.length - 2));
  const visiblePrefix = normalized.slice(0, visibleLength);
  const maskLength = Math.max(2, normalized.length - visibleLength);

  return `${visiblePrefix}${"*".repeat(maskLength)}`;
}

// 기능 : 전화번호 숫자 일부만 남긴 masking 문자열을 생성합니다.
export function maskPhone(phone: string | null): string | null {
  const normalized = phone?.trim();

  if (!normalized) {
    return null;
  }

  const digits = normalized.replace(/\D/g, "");

  if (digits.length <= 4) {
    return "****";
  }

  const visibleSuffix = digits.slice(-4);

  return `****-${visibleSuffix}`;
}
