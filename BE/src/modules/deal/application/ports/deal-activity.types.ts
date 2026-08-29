// 역할 : DEAL_ACTIVITY_TYPES 딜 활동 유형 전체 허용 값을 정의합니다.
export const DEAL_ACTIVITY_TYPES = [
  "DEAL_CREATED",
  "STAGE_CHANGED",
  "NEXT_ACTION_CREATED",
  "NEXT_ACTION_COMPLETION_CHANGED",
  "SCHEDULE_LINKED",
  "SCHEDULE_UNLINKED",
  "MEETING_NOTE_LINKED",
  "MEETING_NOTE_UNLINKED",
  "FOLLOW_UP_SENT",
  "FOLLOW_UP_FAILED",
  "CALL",
  "MEETING",
  "EMAIL",
  "VISIT",
  "NOTE",
] as const;

// 역할 : MANUAL_DEAL_ACTIVITY_TYPES 사용자가 직접 작성할 수 있는 딜 활동 유형 값을 정의합니다.
export const MANUAL_DEAL_ACTIVITY_TYPES = [
  "CALL",
  "MEETING",
  "EMAIL",
  "VISIT",
  "NOTE",
] as const;

// 역할 : DealActivityTypeCode 딜 활동 유형 코드 타입을 정의합니다.
export type DealActivityTypeCode = (typeof DEAL_ACTIVITY_TYPES)[number];

// 역할 : ManualDealActivityTypeCode 수동 딜 활동 유형 코드 타입을 정의합니다.
export type ManualDealActivityTypeCode =
  (typeof MANUAL_DEAL_ACTIVITY_TYPES)[number];

// 역할 : DealActivitySourceTypeCode 딜 활동 생성 출처 코드 타입을 정의합니다.
export type DealActivitySourceTypeCode =
  | "SYSTEM"
  | "USER"
  | "NEXT_ACTION"
  | "SCHEDULE"
  | "MEETING_NOTE"
  | "FOLLOW_UP";
