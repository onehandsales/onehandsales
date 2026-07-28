import { FieldValidationDomainError } from "@/shared/domain/errors/common.errors";

export const COMPANY_REGION_COUNTRY_CODES = ["KR", "US"] as const;

export type CompanyRegionCountryCode =
  (typeof COMPANY_REGION_COUNTRY_CODES)[number];

export type CompanyRegionCodeDefinition = {
  readonly countryCode: CompanyRegionCountryCode;
  readonly regionCode: string;
  readonly region: string;
};

export type CompanyRegionCodeInput = {
  readonly region: string;
  readonly countryCode?: string | null;
  readonly regionCode?: string | null;
};

export type NormalizedCompanyRegionCode = {
  readonly region: string;
  readonly countryCode: CompanyRegionCountryCode | null;
  readonly regionCode: string | null;
};

export const COMPANY_REGION_CODE_DEFINITIONS = [
  { countryCode: "KR", regionCode: "KR-11", region: "서울" },
  { countryCode: "KR", regionCode: "KR-26", region: "부산" },
  { countryCode: "KR", regionCode: "KR-27", region: "대구" },
  { countryCode: "KR", regionCode: "KR-28", region: "인천" },
  { countryCode: "KR", regionCode: "KR-29", region: "광주" },
  { countryCode: "KR", regionCode: "KR-30", region: "대전" },
  { countryCode: "KR", regionCode: "KR-31", region: "울산" },
  { countryCode: "KR", regionCode: "KR-50", region: "세종" },
  { countryCode: "KR", regionCode: "KR-41", region: "경기" },
  { countryCode: "KR", regionCode: "KR-42", region: "강원" },
  { countryCode: "KR", regionCode: "KR-43", region: "충북" },
  { countryCode: "KR", regionCode: "KR-44", region: "충남" },
  { countryCode: "KR", regionCode: "KR-45", region: "전북" },
  { countryCode: "KR", regionCode: "KR-46", region: "전남" },
  { countryCode: "KR", regionCode: "KR-47", region: "경북" },
  { countryCode: "KR", regionCode: "KR-48", region: "경남" },
  { countryCode: "KR", regionCode: "KR-49", region: "제주" },
  { countryCode: "US", regionCode: "US-AL", region: "Alabama" },
  { countryCode: "US", regionCode: "US-AK", region: "Alaska" },
  { countryCode: "US", regionCode: "US-AZ", region: "Arizona" },
  { countryCode: "US", regionCode: "US-AR", region: "Arkansas" },
  { countryCode: "US", regionCode: "US-CA", region: "California" },
  { countryCode: "US", regionCode: "US-CO", region: "Colorado" },
  { countryCode: "US", regionCode: "US-CT", region: "Connecticut" },
  { countryCode: "US", regionCode: "US-DE", region: "Delaware" },
  { countryCode: "US", regionCode: "US-FL", region: "Florida" },
  { countryCode: "US", regionCode: "US-GA", region: "Georgia" },
  { countryCode: "US", regionCode: "US-HI", region: "Hawaii" },
  { countryCode: "US", regionCode: "US-ID", region: "Idaho" },
  { countryCode: "US", regionCode: "US-IL", region: "Illinois" },
  { countryCode: "US", regionCode: "US-IN", region: "Indiana" },
  { countryCode: "US", regionCode: "US-IA", region: "Iowa" },
  { countryCode: "US", regionCode: "US-KS", region: "Kansas" },
  { countryCode: "US", regionCode: "US-KY", region: "Kentucky" },
  { countryCode: "US", regionCode: "US-LA", region: "Louisiana" },
  { countryCode: "US", regionCode: "US-ME", region: "Maine" },
  { countryCode: "US", regionCode: "US-MD", region: "Maryland" },
  { countryCode: "US", regionCode: "US-MA", region: "Massachusetts" },
  { countryCode: "US", regionCode: "US-MI", region: "Michigan" },
  { countryCode: "US", regionCode: "US-MN", region: "Minnesota" },
  { countryCode: "US", regionCode: "US-MS", region: "Mississippi" },
  { countryCode: "US", regionCode: "US-MO", region: "Missouri" },
  { countryCode: "US", regionCode: "US-MT", region: "Montana" },
  { countryCode: "US", regionCode: "US-NE", region: "Nebraska" },
  { countryCode: "US", regionCode: "US-NV", region: "Nevada" },
  { countryCode: "US", regionCode: "US-NH", region: "New Hampshire" },
  { countryCode: "US", regionCode: "US-NJ", region: "New Jersey" },
  { countryCode: "US", regionCode: "US-NM", region: "New Mexico" },
  { countryCode: "US", regionCode: "US-NY", region: "New York" },
  { countryCode: "US", regionCode: "US-NC", region: "North Carolina" },
  { countryCode: "US", regionCode: "US-ND", region: "North Dakota" },
  { countryCode: "US", regionCode: "US-OH", region: "Ohio" },
  { countryCode: "US", regionCode: "US-OK", region: "Oklahoma" },
  { countryCode: "US", regionCode: "US-OR", region: "Oregon" },
  { countryCode: "US", regionCode: "US-PA", region: "Pennsylvania" },
  { countryCode: "US", regionCode: "US-RI", region: "Rhode Island" },
  { countryCode: "US", regionCode: "US-SC", region: "South Carolina" },
  { countryCode: "US", regionCode: "US-SD", region: "South Dakota" },
  { countryCode: "US", regionCode: "US-TN", region: "Tennessee" },
  { countryCode: "US", regionCode: "US-TX", region: "Texas" },
  { countryCode: "US", regionCode: "US-UT", region: "Utah" },
  { countryCode: "US", regionCode: "US-VT", region: "Vermont" },
  { countryCode: "US", regionCode: "US-VA", region: "Virginia" },
  { countryCode: "US", regionCode: "US-WA", region: "Washington" },
  { countryCode: "US", regionCode: "US-WV", region: "West Virginia" },
  { countryCode: "US", regionCode: "US-WI", region: "Wisconsin" },
  { countryCode: "US", regionCode: "US-WY", region: "Wyoming" },
] as const satisfies readonly CompanyRegionCodeDefinition[];

// 기능 : 회사 지역 생성 입력의 국가/지역 code 조합을 검증하고 정규화합니다.
export function normalizeCompanyRegionCodeInput(
  input: CompanyRegionCodeInput
): NormalizedCompanyRegionCode {
  const region = normalizeRequiredRegion(input.region);
  const countryCode = normalizeOptionalText(input.countryCode)?.toUpperCase();
  const regionCode = normalizeOptionalText(input.regionCode)?.toUpperCase();

  if (!countryCode && !regionCode) {
    return {
      region,
      countryCode: null,
      regionCode: null,
    };
  }

  if (!isCompanyRegionCountryCode(countryCode)) {
    throwRegionUnsupported("countryCode", "company region country is unsupported");
  }

  const definition = findCompanyRegionDefinition(countryCode, regionCode);

  if (!definition) {
    throwRegionUnsupported("regionCode", "company region code is unsupported");
  }

  return {
    region: definition.region,
    countryCode: definition.countryCode,
    regionCode: definition.regionCode,
  };
}

// 기능 : 국가와 region code로 표준 회사 지역 정의를 찾습니다.
export function findCompanyRegionDefinition(
  countryCode: string | null | undefined,
  regionCode: string | null | undefined
): CompanyRegionCodeDefinition | null {
  const normalizedCountryCode = countryCode?.trim().toUpperCase();
  const normalizedRegionCode = regionCode?.trim().toUpperCase();

  if (!normalizedCountryCode || !normalizedRegionCode) {
    return null;
  }

  return (
    COMPANY_REGION_CODE_DEFINITIONS.find(
      (definition) =>
        definition.countryCode === normalizedCountryCode &&
        definition.regionCode === normalizedRegionCode
    ) ?? null
  );
}

// 기능 : 입력 국가 코드가 회사 지역에서 지원하는 국가인지 확인합니다.
function isCompanyRegionCountryCode(
  value: string | null | undefined
): value is CompanyRegionCountryCode {
  return COMPANY_REGION_COUNTRY_CODES.includes(value as CompanyRegionCountryCode);
}

// 기능 : 빈 지역명을 저장하지 않도록 필수 텍스트를 정규화합니다.
function normalizeRequiredRegion(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throwRegionUnsupported("region", "company region is required");
  }

  return normalized;
}

// 기능 : 선택 텍스트를 trim하고 빈 값이면 null로 변환합니다.
function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

// 기능 : 회사 지역 code field validation 오류를 생성합니다.
function throwRegionUnsupported(field: string, message: string): never {
  throw new FieldValidationDomainError(
    "COMPANY_REGION_UNSUPPORTED",
    field,
    message
  );
}
