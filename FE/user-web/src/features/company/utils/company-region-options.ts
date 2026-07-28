import type { AppLocale } from "@/features/app-i18n";
import type { CompanyRegion } from "@/features/company/types/company";

export const COMPANY_REGION_COUNTRY_OPTIONS = [
  { countryCode: "KR", labelKo: "대한민국", labelEn: "South Korea" },
  { countryCode: "US", labelKo: "미국", labelEn: "United States" },
] as const;

export type CompanyRegionCountryCode =
  (typeof COMPANY_REGION_COUNTRY_OPTIONS)[number]["countryCode"];

export type CompanyRegionOption = {
  readonly countryCode: CompanyRegionCountryCode;
  readonly regionCode: string;
  readonly labelKo: string;
  readonly labelEn: string;
};

export type CompanyRegionSelectOption = {
  readonly value: string;
  readonly label: string;
  readonly region: string;
  readonly countryCode: CompanyRegionCountryCode | null;
  readonly regionCode: string | null;
  readonly companyRegionId: string | null;
  readonly isLegacy: boolean;
};

export const COMPANY_STANDARD_REGION_OPTIONS = [
  { countryCode: "KR", regionCode: "KR-11", labelKo: "서울", labelEn: "Seoul" },
  { countryCode: "KR", regionCode: "KR-26", labelKo: "부산", labelEn: "Busan" },
  { countryCode: "KR", regionCode: "KR-27", labelKo: "대구", labelEn: "Daegu" },
  { countryCode: "KR", regionCode: "KR-28", labelKo: "인천", labelEn: "Incheon" },
  { countryCode: "KR", regionCode: "KR-29", labelKo: "광주", labelEn: "Gwangju" },
  { countryCode: "KR", regionCode: "KR-30", labelKo: "대전", labelEn: "Daejeon" },
  { countryCode: "KR", regionCode: "KR-31", labelKo: "울산", labelEn: "Ulsan" },
  { countryCode: "KR", regionCode: "KR-50", labelKo: "세종", labelEn: "Sejong" },
  { countryCode: "KR", regionCode: "KR-41", labelKo: "경기", labelEn: "Gyeonggi" },
  { countryCode: "KR", regionCode: "KR-42", labelKo: "강원", labelEn: "Gangwon" },
  { countryCode: "KR", regionCode: "KR-43", labelKo: "충북", labelEn: "Chungbuk" },
  { countryCode: "KR", regionCode: "KR-44", labelKo: "충남", labelEn: "Chungnam" },
  { countryCode: "KR", regionCode: "KR-45", labelKo: "전북", labelEn: "Jeonbuk" },
  { countryCode: "KR", regionCode: "KR-46", labelKo: "전남", labelEn: "Jeonnam" },
  { countryCode: "KR", regionCode: "KR-47", labelKo: "경북", labelEn: "Gyeongbuk" },
  { countryCode: "KR", regionCode: "KR-48", labelKo: "경남", labelEn: "Gyeongnam" },
  { countryCode: "KR", regionCode: "KR-49", labelKo: "제주", labelEn: "Jeju" },
  { countryCode: "US", regionCode: "US-AL", labelKo: "앨라배마", labelEn: "Alabama" },
  { countryCode: "US", regionCode: "US-AK", labelKo: "알래스카", labelEn: "Alaska" },
  { countryCode: "US", regionCode: "US-AZ", labelKo: "애리조나", labelEn: "Arizona" },
  { countryCode: "US", regionCode: "US-AR", labelKo: "아칸소", labelEn: "Arkansas" },
  { countryCode: "US", regionCode: "US-CA", labelKo: "캘리포니아", labelEn: "California" },
  { countryCode: "US", regionCode: "US-CO", labelKo: "콜로라도", labelEn: "Colorado" },
  { countryCode: "US", regionCode: "US-CT", labelKo: "코네티컷", labelEn: "Connecticut" },
  { countryCode: "US", regionCode: "US-DE", labelKo: "델라웨어", labelEn: "Delaware" },
  { countryCode: "US", regionCode: "US-FL", labelKo: "플로리다", labelEn: "Florida" },
  { countryCode: "US", regionCode: "US-GA", labelKo: "조지아", labelEn: "Georgia" },
  { countryCode: "US", regionCode: "US-HI", labelKo: "하와이", labelEn: "Hawaii" },
  { countryCode: "US", regionCode: "US-ID", labelKo: "아이다호", labelEn: "Idaho" },
  { countryCode: "US", regionCode: "US-IL", labelKo: "일리노이", labelEn: "Illinois" },
  { countryCode: "US", regionCode: "US-IN", labelKo: "인디애나", labelEn: "Indiana" },
  { countryCode: "US", regionCode: "US-IA", labelKo: "아이오와", labelEn: "Iowa" },
  { countryCode: "US", regionCode: "US-KS", labelKo: "캔자스", labelEn: "Kansas" },
  { countryCode: "US", regionCode: "US-KY", labelKo: "켄터키", labelEn: "Kentucky" },
  { countryCode: "US", regionCode: "US-LA", labelKo: "루이지애나", labelEn: "Louisiana" },
  { countryCode: "US", regionCode: "US-ME", labelKo: "메인", labelEn: "Maine" },
  { countryCode: "US", regionCode: "US-MD", labelKo: "메릴랜드", labelEn: "Maryland" },
  { countryCode: "US", regionCode: "US-MA", labelKo: "매사추세츠", labelEn: "Massachusetts" },
  { countryCode: "US", regionCode: "US-MI", labelKo: "미시간", labelEn: "Michigan" },
  { countryCode: "US", regionCode: "US-MN", labelKo: "미네소타", labelEn: "Minnesota" },
  { countryCode: "US", regionCode: "US-MS", labelKo: "미시시피", labelEn: "Mississippi" },
  { countryCode: "US", regionCode: "US-MO", labelKo: "미주리", labelEn: "Missouri" },
  { countryCode: "US", regionCode: "US-MT", labelKo: "몬태나", labelEn: "Montana" },
  { countryCode: "US", regionCode: "US-NE", labelKo: "네브래스카", labelEn: "Nebraska" },
  { countryCode: "US", regionCode: "US-NV", labelKo: "네바다", labelEn: "Nevada" },
  { countryCode: "US", regionCode: "US-NH", labelKo: "뉴햄프셔", labelEn: "New Hampshire" },
  { countryCode: "US", regionCode: "US-NJ", labelKo: "뉴저지", labelEn: "New Jersey" },
  { countryCode: "US", regionCode: "US-NM", labelKo: "뉴멕시코", labelEn: "New Mexico" },
  { countryCode: "US", regionCode: "US-NY", labelKo: "뉴욕", labelEn: "New York" },
  { countryCode: "US", regionCode: "US-NC", labelKo: "노스캐롤라이나", labelEn: "North Carolina" },
  { countryCode: "US", regionCode: "US-ND", labelKo: "노스다코타", labelEn: "North Dakota" },
  { countryCode: "US", regionCode: "US-OH", labelKo: "오하이오", labelEn: "Ohio" },
  { countryCode: "US", regionCode: "US-OK", labelKo: "오클라호마", labelEn: "Oklahoma" },
  { countryCode: "US", regionCode: "US-OR", labelKo: "오리건", labelEn: "Oregon" },
  { countryCode: "US", regionCode: "US-PA", labelKo: "펜실베이니아", labelEn: "Pennsylvania" },
  { countryCode: "US", regionCode: "US-RI", labelKo: "로드아일랜드", labelEn: "Rhode Island" },
  { countryCode: "US", regionCode: "US-SC", labelKo: "사우스캐롤라이나", labelEn: "South Carolina" },
  { countryCode: "US", regionCode: "US-SD", labelKo: "사우스다코타", labelEn: "South Dakota" },
  { countryCode: "US", regionCode: "US-TN", labelKo: "테네시", labelEn: "Tennessee" },
  { countryCode: "US", regionCode: "US-TX", labelKo: "텍사스", labelEn: "Texas" },
  { countryCode: "US", regionCode: "US-UT", labelKo: "유타", labelEn: "Utah" },
  { countryCode: "US", regionCode: "US-VT", labelKo: "버몬트", labelEn: "Vermont" },
  { countryCode: "US", regionCode: "US-VA", labelKo: "버지니아", labelEn: "Virginia" },
  { countryCode: "US", regionCode: "US-WA", labelKo: "워싱턴", labelEn: "Washington" },
  { countryCode: "US", regionCode: "US-WV", labelKo: "웨스트버지니아", labelEn: "West Virginia" },
  { countryCode: "US", regionCode: "US-WI", labelKo: "위스콘신", labelEn: "Wisconsin" },
  { countryCode: "US", regionCode: "US-WY", labelKo: "와이오밍", labelEn: "Wyoming" },
] as const satisfies readonly CompanyRegionOption[];

// 기능 : 회사 지역 국가 code가 G06에서 지원하는 값인지 확인합니다.
export function isCompanyRegionCountryCode(
  value: string | null | undefined
): value is CompanyRegionCountryCode {
  return COMPANY_REGION_COUNTRY_OPTIONS.some(
    (option) => option.countryCode === value
  );
}

// 기능 : 현재 locale에 맞는 회사 지역 국가명을 반환합니다.
export function formatCompanyRegionCountryLabel(
  countryCode: CompanyRegionCountryCode,
  locale: AppLocale
) {
  const option = COMPANY_REGION_COUNTRY_OPTIONS.find(
    (country) => country.countryCode === countryCode
  );

  return locale === "en"
    ? (option?.labelEn ?? countryCode)
    : (option?.labelKo ?? countryCode);
}

// 기능 : 표준 지역 code가 있으면 locale label로, 없으면 legacy region 문자열로 표시합니다.
export function formatCompanyRegionLabel(
  region: Pick<CompanyRegion, "region" | "countryCode" | "regionCode">,
  locale: AppLocale
) {
  const option = findCompanyRegionOption(region.countryCode, region.regionCode);

  return option ? formatCompanyStandardRegionLabel(option, locale) : region.region;
}

// 기능 : 국가별 표준 지역과 legacy/custom 지역을 select option으로 합칩니다.
export function createCompanyRegionSelectOptions(
  regions: readonly CompanyRegion[],
  countryCode: CompanyRegionCountryCode,
  locale: AppLocale
): CompanyRegionSelectOption[] {
  const standardOptions = COMPANY_STANDARD_REGION_OPTIONS.filter(
    (option) => option.countryCode === countryCode
  ).map((option) => {
    const existingRegion = findCompanyRegionByCode(
      regions,
      option.countryCode,
      option.regionCode
    );

    return {
      value: `standard:${option.regionCode}`,
      label: formatCompanyStandardRegionLabel(option, locale),
      region: getCompanyRegionStorageLabel(option),
      countryCode: option.countryCode,
      regionCode: option.regionCode,
      companyRegionId: existingRegion?.id ?? null,
      isLegacy: false,
    };
  });
  const legacyOptions = regions
    .filter(
      (region) =>
        !region.regionCode &&
        (!region.countryCode || region.countryCode === countryCode)
    )
    .map((region) => ({
      value: `legacy:${region.id}`,
      label: region.region,
      region: region.region,
      countryCode: null,
      regionCode: null,
      companyRegionId: region.id,
      isLegacy: true,
    }));

  return [...standardOptions, ...legacyOptions];
}

// 기능 : 선택된 회사 지역 ID를 표준/legacy select 값으로 변환합니다.
export function getCompanyRegionSelectValue(
  regions: readonly CompanyRegion[],
  selectedRegionId: string
) {
  const region = regions.find((item) => item.id === selectedRegionId);

  if (!region) {
    return "";
  }

  return region.regionCode
    ? `standard:${region.regionCode}`
    : `legacy:${region.id}`;
}

// 기능 : 표준 국가/지역 code에 해당하는 기존 사용자 회사 지역을 찾습니다.
export function findCompanyRegionByCode(
  regions: readonly CompanyRegion[],
  countryCode: string | null | undefined,
  regionCode: string | null | undefined
) {
  return regions.find(
    (region) =>
      region.countryCode === countryCode && region.regionCode === regionCode
  );
}

// 기능 : 표준 국가/지역 code에 해당하는 사전 옵션을 찾습니다.
export function findCompanyRegionOption(
  countryCode: string | null | undefined,
  regionCode: string | null | undefined
) {
  return COMPANY_STANDARD_REGION_OPTIONS.find(
    (option) =>
      option.countryCode === countryCode && option.regionCode === regionCode
  );
}

// 기능 : 지역 선택 value에서 표준 region code를 추출합니다.
export function parseStandardCompanyRegionValue(value: string) {
  return value.startsWith("standard:") ? value.slice("standard:".length) : null;
}

// 기능 : 표준 지역 옵션을 locale에 맞는 label로 변환합니다.
function formatCompanyStandardRegionLabel(
  option: CompanyRegionOption,
  locale: AppLocale
) {
  return locale === "en" ? option.labelEn : option.labelKo;
}

// 기능 : CompanyRegion.region legacy 문자열은 국가별 기본 표기로 저장합니다.
function getCompanyRegionStorageLabel(option: CompanyRegionOption) {
  return option.countryCode === "US" ? option.labelEn : option.labelKo;
}
