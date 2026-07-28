import { FieldValidationDomainError } from "@/shared/domain/errors/common.errors";

export const SUPPORTED_CONTACT_PHONE_COUNTRY_CODES = ["KR", "US"] as const;

export type ContactPhoneCountryCode =
  (typeof SUPPORTED_CONTACT_PHONE_COUNTRY_CODES)[number];

export type ContactPhoneInput = {
  readonly mobile?: string | null | undefined;
  readonly phoneCountryCode?: string | null | undefined;
  readonly phoneNationalNumber?: string | null | undefined;
  readonly phoneE164?: string | null | undefined;
};

export type NormalizedContactPhone = {
  readonly mobile: string;
  readonly phoneCountryCode: ContactPhoneCountryCode;
  readonly phoneNationalNumber: string;
  readonly phoneE164: string;
};

const KR_NATIONAL_DIGIT_PATTERN = /^010\d{8}$/;
const KR_E164_DIGIT_PATTERN = /^8210\d{8}$/;
const US_NATIONAL_DIGIT_PATTERN = /^[2-9]\d{2}[2-9]\d{6}$/;
const US_E164_DIGIT_PATTERN = /^1[2-9]\d{2}[2-9]\d{6}$/;

// 기능 : 담당자 생성 입력에서 글로벌 전화번호를 필수로 정규화합니다.
export function normalizeContactPhoneForCreate(
  input: ContactPhoneInput
): NormalizedContactPhone {
  const phone = normalizeContactPhoneInput(input);

  if (!phone) {
    throwPhoneInvalid("phoneNationalNumber", "contact phone is required");
  }

  return phone;
}

// 기능 : 담당자 수정 입력에 전화번호 변경이 있는 경우에만 정규화합니다.
export function normalizeContactPhoneForUpdate(
  input: ContactPhoneInput
): NormalizedContactPhone | null {
  return normalizeContactPhoneInput(input);
}

// 기능 : legacy mobile 문자열을 가능한 경우 글로벌 전화번호 구조로 변환합니다.
export function normalizeLegacyContactPhone(
  mobile: string | null | undefined
): NormalizedContactPhone | null {
  const normalized = normalizeOptionalText(mobile);

  if (!normalized) {
    return null;
  }

  return normalizeLoosePhoneValue(normalized);
}

// 기능 : 저장된 글로벌 전화번호 또는 legacy mobile로 표시용 전화번호를 만듭니다.
export function formatContactPhoneDisplay(input: {
  readonly mobile: string | null;
  readonly phoneCountryCode: string | null;
  readonly phoneNationalNumber: string | null;
  readonly phoneE164: string | null;
}): string {
  const phone = normalizeStoredContactPhone(input);

  return phone?.mobile ?? input.mobile ?? "";
}

// 기능 : 저장된 글로벌 필드를 우선하고 불완전하면 legacy mobile을 fallback합니다.
function normalizeStoredContactPhone(input: {
  readonly mobile: string | null;
  readonly phoneCountryCode: string | null;
  readonly phoneNationalNumber: string | null;
  readonly phoneE164: string | null;
}): NormalizedContactPhone | null {
  if (
    input.phoneCountryCode &&
    (input.phoneNationalNumber || input.phoneE164)
  ) {
    try {
      return normalizeGlobalPhone(
        input.phoneCountryCode,
        input.phoneNationalNumber,
        input.phoneE164
      );
    } catch {
      return normalizeLegacyContactPhone(input.mobile);
    }
  }

  return normalizeLegacyContactPhone(input.mobile);
}

// 기능 : 여러 입력 형태 중 우선순위에 따라 담당자 전화번호를 표준 구조로 변환합니다.
function normalizeContactPhoneInput(
  input: ContactPhoneInput
): NormalizedContactPhone | null {
  const countryCode = normalizeOptionalText(input.phoneCountryCode);
  const nationalNumber = normalizeOptionalText(input.phoneNationalNumber);
  const e164 = normalizeOptionalText(input.phoneE164);
  const mobile = normalizeOptionalText(input.mobile);

  if (countryCode || nationalNumber || e164) {
    return normalizeGlobalPhone(countryCode, nationalNumber, e164);
  }

  if (mobile) {
    const phone = normalizeLoosePhoneValue(mobile);

    if (!phone) {
      throwPhoneInvalid("phoneNationalNumber", "contact phone is invalid");
    }

    return phone;
  }

  return null;
}

// 기능 : 국가 코드가 있는 입력을 국가별 national/E.164 규칙으로 검증합니다.
function normalizeGlobalPhone(
  countryCodeValue: string | null,
  nationalNumberValue: string | null,
  e164Value: string | null
): NormalizedContactPhone {
  const countryCode = normalizeCountryCode(countryCodeValue);
  const nationalPhone = nationalNumberValue
    ? normalizeNationalPhone(countryCode, nationalNumberValue)
    : null;
  const e164Phone = e164Value ? normalizeE164Phone(countryCode, e164Value) : null;

  if (nationalPhone && e164Phone && nationalPhone.phoneE164 !== e164Phone.phoneE164) {
    throwPhoneInvalid("phoneE164", "contact phone fields do not match");
  }

  const phone = nationalPhone ?? e164Phone;

  if (!phone) {
    throwPhoneInvalid("phoneNationalNumber", "contact phone is required");
  }

  return phone;
}

// 기능 : 국가 코드 입력을 KR/US 중 하나로 정규화합니다.
function normalizeCountryCode(
  value: string | null
): ContactPhoneCountryCode {
  const normalized = value?.trim().toUpperCase();

  if (
    normalized &&
    SUPPORTED_CONTACT_PHONE_COUNTRY_CODES.includes(
      normalized as ContactPhoneCountryCode
    )
  ) {
    return normalized as ContactPhoneCountryCode;
  }

  throw new FieldValidationDomainError(
    "CONTACT_PHONE_COUNTRY_UNSUPPORTED",
    "phoneCountryCode",
    "contact phone country is unsupported"
  );
}

// 기능 : 국가별 national number 입력을 표준 전화번호 구조로 변환합니다.
function normalizeNationalPhone(
  countryCode: ContactPhoneCountryCode,
  value: string
): NormalizedContactPhone {
  const digits = toDigits(value);

  if (countryCode === "KR" && KR_NATIONAL_DIGIT_PATTERN.test(digits)) {
    return createKrPhone(digits);
  }

  if (countryCode === "US" && US_NATIONAL_DIGIT_PATTERN.test(digits)) {
    return createUsPhone(digits);
  }

  throwPhoneInvalid("phoneNationalNumber", "contact phone number is invalid");
}

// 기능 : 국가별 E.164 입력을 표준 전화번호 구조로 변환합니다.
function normalizeE164Phone(
  countryCode: ContactPhoneCountryCode,
  value: string
): NormalizedContactPhone {
  const digits = toDigits(value);

  if (countryCode === "KR" && KR_E164_DIGIT_PATTERN.test(digits)) {
    return createKrPhone(`0${digits.slice(2)}`);
  }

  if (countryCode === "US" && US_E164_DIGIT_PATTERN.test(digits)) {
    return createUsPhone(digits.slice(1));
  }

  throwPhoneInvalid("phoneE164", "contact phone E.164 is invalid");
}

// 기능 : 국가 코드 없이 들어온 legacy 전화번호를 KR/US 후보로 판별합니다.
function normalizeLoosePhoneValue(value: string): NormalizedContactPhone | null {
  const digits = toDigits(value);

  if (KR_NATIONAL_DIGIT_PATTERN.test(digits)) {
    return createKrPhone(digits);
  }

  if (KR_E164_DIGIT_PATTERN.test(digits)) {
    return createKrPhone(`0${digits.slice(2)}`);
  }

  if (US_NATIONAL_DIGIT_PATTERN.test(digits)) {
    return createUsPhone(digits);
  }

  if (US_E164_DIGIT_PATTERN.test(digits)) {
    return createUsPhone(digits.slice(1));
  }

  return null;
}

// 기능 : 한국 휴대폰 national number로 저장/표시 값을 생성합니다.
function createKrPhone(nationalNumber: string): NormalizedContactPhone {
  return {
    mobile: `${nationalNumber.slice(0, 3)}-${nationalNumber.slice(
      3,
      7
    )}-${nationalNumber.slice(7)}`,
    phoneCountryCode: "KR",
    phoneNationalNumber: nationalNumber,
    phoneE164: `+82${nationalNumber.slice(1)}`,
  };
}

// 기능 : 미국 national number로 저장/표시 값을 생성합니다.
function createUsPhone(nationalNumber: string): NormalizedContactPhone {
  return {
    mobile: `${nationalNumber.slice(0, 3)}-${nationalNumber.slice(
      3,
      6
    )}-${nationalNumber.slice(6)}`,
    phoneCountryCode: "US",
    phoneNationalNumber: nationalNumber,
    phoneE164: `+1${nationalNumber}`,
  };
}

// 기능 : 전화번호 입력에서 숫자만 추출합니다.
function toDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// 기능 : 빈 문자열을 null로 정규화합니다.
function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

// 기능 : 담당자 전화번호 field validation 오류를 생성합니다.
function throwPhoneInvalid(field: string, message: string): never {
  throw new FieldValidationDomainError("CONTACT_PHONE_INVALID", field, message);
}
