import type { DealStatusCode } from "@/modules/deal/domain/deal-status";

// 역할 : ScheduleWeeklyReportSourceType 주간 리포트 snapshot 일정 출처 값을 정의합니다.
export type ScheduleWeeklyReportSourceType = "INTERNAL" | "GOOGLE";

// 역할 : ScheduleWeeklyReportExternalSyncStatus 주간 리포트 snapshot의 Google 동기화 상태 값을 정의합니다.
export type ScheduleWeeklyReportExternalSyncStatus =
  | "SYNCED"
  | "LOCAL_MODIFIED"
  | "GOOGLE_DELETED"
  | "LOCAL_DELETED";

// 역할 : ScheduleWeeklyReportGoogleCalendarRecord 주간 리포트 snapshot의 Google Calendar 요약 구조를 정의합니다.
export interface ScheduleWeeklyReportGoogleCalendarRecord {
  readonly sourceId: string;
  readonly calendarId: string;
  readonly calendarName: string;
  readonly syncStatus: ScheduleWeeklyReportExternalSyncStatus | null;
  readonly badgeLabel: string;
  readonly externalHtmlLink: string | null;
  readonly lastExternalSyncedAt: Date | null;
  readonly externalDeletedAt: Date | null;
  readonly isHidden: boolean;
  readonly canEditLocalFields: boolean;
}

// 역할 : ScheduleWeeklyReportCompanyRecord 주간 리포트 snapshot의 연결 회사 요약 구조를 정의합니다.
export interface ScheduleWeeklyReportCompanyRecord {
  readonly id: string;
  readonly companyName: string;
}

// 역할 : ScheduleWeeklyReportContactRecord 주간 리포트 snapshot의 연결 담당자 요약 구조를 정의합니다.
export interface ScheduleWeeklyReportContactRecord {
  readonly id: string;
  readonly username: string;
  readonly companyId: string;
  readonly companyName: string;
}

// 역할 : ScheduleWeeklyReportNextFollowingActionRecord 주간 리포트 snapshot의 다음 후속 액션 구조를 정의합니다.
export interface ScheduleWeeklyReportNextFollowingActionRecord {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: Date;
  readonly remainingCount: number;
}

// 역할 : ScheduleWeeklyReportDealRecord 주간 리포트 snapshot의 연결 딜 요약 구조를 정의합니다.
export interface ScheduleWeeklyReportDealRecord {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly currencyCode: string;
  readonly dealStatus: DealStatusCode;
  readonly expectedEndDate: Date;
  readonly companies: ScheduleWeeklyReportCompanyRecord[];
  readonly contacts: ScheduleWeeklyReportContactRecord[];
  readonly nextFollowingAction: ScheduleWeeklyReportNextFollowingActionRecord | null;
}

// 역할 : ScheduleWeeklyReportScheduleRecord 주간 리포트 snapshot의 일정 projection 구조를 정의합니다.
export interface ScheduleWeeklyReportScheduleRecord {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly meetingUrl: string | null;
  readonly memo: string | null;
  readonly isAllDay: boolean;
  readonly sourceType: ScheduleWeeklyReportSourceType;
  readonly googleCalendar: ScheduleWeeklyReportGoogleCalendarRecord | null;
  readonly deals: ScheduleWeeklyReportDealRecord[];
}

// 역할 : ListScheduleWeeklyReportSchedulesInput 주간 리포트 snapshot 일정 조회 조건을 정의합니다.
export interface ListScheduleWeeklyReportSchedulesInput {
  readonly userId: string;
  readonly rangeStartAt: Date;
  readonly rangeEndAt: Date;
}
