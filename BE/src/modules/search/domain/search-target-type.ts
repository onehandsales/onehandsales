// 역할 : SearchTargetType 통합검색 대상 도메인 타입을 정의합니다.
export enum SearchTargetType {
  COMPANY = "COMPANY",
  CONTACT = "CONTACT",
  PRODUCT = "PRODUCT",
  DEAL = "DEAL",
  SCHEDULE = "SCHEDULE",
  MEETING_NOTE = "MEETING_NOTE",
}

export const SEARCH_TARGET_TYPES: readonly SearchTargetType[] = [
  SearchTargetType.COMPANY,
  SearchTargetType.CONTACT,
  SearchTargetType.PRODUCT,
  SearchTargetType.DEAL,
  SearchTargetType.SCHEDULE,
  SearchTargetType.MEETING_NOTE,
];

// 기능 : 문자열 값이 통합검색 대상 타입인지 확인합니다.
export function isSearchTargetType(value: string): value is SearchTargetType {
  return SEARCH_TARGET_TYPES.some((type) => type === value);
}
