// 역할 : TrashTargetType 휴지통 대상 도메인과 로그 유형 값을 정의합니다.
export type TrashTargetType =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE"
  | "COMPANY_MEMO_LOG"
  | "COMPANY_PRIVATE_MEMO_LOG"
  | "CONTACT_MEMO_LOG"
  | "CONTACT_PRIVATE_MEMO_LOG"
  | "PRODUCT_MEMO_LOG"
  | "PRODUCT_PRIVATE_MEMO_LOG"
  | "DEAL_MEMO_LOG"
  | "DEAL_FOLLOWING_ACTION_LOG";

// 역할 : TrashItemKindFilter 휴지통 항목 종류 필터 값을 정의합니다.
export type TrashItemKindFilter = "ALL" | "ENTITY" | "LOG";

// 역할 : TrashDomainFilter 휴지통 도메인 필터 값을 정의합니다.
export type TrashDomainFilter =
  | "ALL"
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE";

// 역할 : TrashLogTypeFilter 휴지통 로그 유형 필터 값을 정의합니다.
export type TrashLogTypeFilter =
  | "ALL"
  | "MEMO"
  | "PRIVATE_MEMO"
  | "FOLLOWING_ACTION";

// 역할 : TrashSort 휴지통 목록 정렬 값을 정의합니다.
export type TrashSort = "RECENT" | "EXPIRES_SOON";
