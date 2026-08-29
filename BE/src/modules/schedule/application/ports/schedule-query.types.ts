// 역할 : ScheduleViewMode 일정 목록 조회 화면 단위를 정의합니다.
export enum ScheduleViewMode {
  MONTH = "month",
  WEEK = "week",
}

// 역할 : ScheduleSourceType 일정 생성 출처 값을 정의합니다.
export type ScheduleSourceType = "INTERNAL" | "GOOGLE";

// 역할 : ScheduleSourceTypeFilter 일정 목록에서 조회할 출처 필터 값을 정의합니다.
export type ScheduleSourceTypeFilter = "ALL" | ScheduleSourceType;

// 역할 : ScheduleVisibility 일정 목록에서 노출할 일정 범위를 정의합니다.
export type ScheduleVisibility = "ACTIVE" | "HIDDEN_GOOGLE" | "ALL";
