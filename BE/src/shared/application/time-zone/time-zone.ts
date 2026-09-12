import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

export const DEFAULT_USER_TIME_ZONE = "Asia/Seoul";

type IntlWithSupportedValues = typeof Intl & {
  readonly supportedValuesOf?: (key: "timeZone") => string[];
};

// 기능 : IANA timezone ID인지 표준 Intl API로 검증합니다.
export function isValidIanaTimeZone(timeZone: string): boolean {
  const supportedValuesOf = (Intl as IntlWithSupportedValues).supportedValuesOf;

  if (supportedValuesOf) {
    return supportedValuesOf("timeZone").includes(timeZone) || timeZone === "UTC";
  }

  try {
    const resolvedTimeZone = new Intl.DateTimeFormat("en-US", {
      timeZone,
    }).resolvedOptions().timeZone;

    return resolvedTimeZone === timeZone;
  } catch {
    return false;
  }
}

// 기능 : 선택 입력 timezone을 trim하고 저장 가능한 IANA timezone ID로 검증합니다.
export function normalizeOptionalIanaTimeZone(
  timeZone: string | undefined
): string | undefined {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (timeZone === undefined) {
    return undefined;
  }

  // 2. 이후 단계에서 사용할 trimmed 값을 준비한다.
  const trimmed = timeZone.trim();

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!trimmed || !isValidIanaTimeZone(trimmed)) {
    throw new ValidationDomainError("timeZone must be a valid IANA timezone ID");
  }

  // 4. 계산된 결과를 호출자에게 반환한다.
  return trimmed;
}
