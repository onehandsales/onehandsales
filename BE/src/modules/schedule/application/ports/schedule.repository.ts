import type { NotificationReminderWriteRepository } from "@/shared/application/notification/notification-reminder-writer.port";
import type {
  ListScheduleWeeklyReportSchedulesInput,
  ScheduleWeeklyReportCompanyRecord,
  ScheduleWeeklyReportContactRecord,
  ScheduleWeeklyReportDealRecord,
  ScheduleWeeklyReportNextFollowingActionRecord,
  ScheduleWeeklyReportScheduleRecord,
} from "./schedule-weekly-report-query.port";

// 역할 : 일정 repository 구현체를 주입하기 위한 토큰입니다.
export const SCHEDULE_REPOSITORY = Symbol("SCHEDULE_REPOSITORY");

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

// 역할 : ScheduleExternalSyncStatus 외부 Calendar와 로컬 일정의 동기화 상태를 정의합니다.
export type ScheduleExternalSyncStatus =
  | "SYNCED"
  | "LOCAL_MODIFIED"
  | "GOOGLE_DELETED"
  | "LOCAL_DELETED";

// 역할 : ScheduleDealRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ScheduleDealRecord {
  readonly id: string;
  readonly dealName: string;
}

// 역할 : ScheduleDealOptionRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ScheduleDealOptionRecord extends ScheduleDealRecord {
  readonly createdAt: Date;
}

// 역할 : Google Calendar에서 동기화된 일정 metadata 구조를 정의합니다.
export interface ScheduleGoogleCalendarRecord {
  readonly sourceId: string;
  readonly calendarId: string;
  readonly calendarName: string;
  readonly syncStatus: ScheduleExternalSyncStatus | null;
  readonly badgeLabel: string;
  readonly externalHtmlLink: string | null;
  readonly lastExternalSyncedAt: Date | null;
  readonly externalDeletedAt: Date | null;
  readonly isHidden: boolean;
  readonly canEditLocalFields: boolean;
}

// 역할 : ScheduleRecord 일정 목록과 상세 화면에 전달되는 일정 projection 구조를 정의합니다.
export interface ScheduleRecord {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly meetingUrl: string | null;
  readonly memo: string | null;
  readonly isAllDay: boolean;
  readonly sourceType: ScheduleSourceType;
  readonly googleCalendar: ScheduleGoogleCalendarRecord | null;
  readonly deletedAt: Date | null;
  readonly trashExpiresAt: Date | null;
  readonly deals: ScheduleDealRecord[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : WeeklyReportCompanyRecord repository 내부 호환용 주간 리포트 회사 projection 타입을 재노출합니다.
export type WeeklyReportCompanyRecord = ScheduleWeeklyReportCompanyRecord;

// 역할 : WeeklyReportContactRecord repository 내부 호환용 주간 리포트 담당자 projection 타입을 재노출합니다.
export type WeeklyReportContactRecord = ScheduleWeeklyReportContactRecord;

// 역할 : WeeklyReportNextFollowingActionRecord repository 내부 호환용 주간 리포트 다음 후속 액션 타입을 재노출합니다.
export type WeeklyReportNextFollowingActionRecord =
  ScheduleWeeklyReportNextFollowingActionRecord;

// 역할 : WeeklyReportDealRecord repository 내부 호환용 주간 리포트 딜 projection 타입을 재노출합니다.
export type WeeklyReportDealRecord = ScheduleWeeklyReportDealRecord;

// 역할 : WeeklyReportScheduleRecord repository 내부 호환용 주간 리포트 일정 projection 타입을 재노출합니다.
export type WeeklyReportScheduleRecord = ScheduleWeeklyReportScheduleRecord;

// 역할 : ListSchedulesInput 일정 목록 조회 조건을 정의합니다.
export interface ListSchedulesInput {
  readonly userId: string;
  readonly rangeStart: Date;
  readonly rangeEnd: Date;
  readonly visibility?: ScheduleVisibility;
  readonly sourceType?: ScheduleSourceTypeFilter;
}

// 역할 : ListSchedulesForWeeklyReportInput repository 내부 호환용 주간 리포트 일정 조회 조건을 재노출합니다.
export type ListSchedulesForWeeklyReportInput =
  ListScheduleWeeklyReportSchedulesInput;

// 역할 : CreateScheduleInput 일정 생성 저장 값을 정의합니다.
export interface CreateScheduleInput {
  readonly userId: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly meetingUrl: string | null;
  readonly memo: string | null;
}

// 역할 : UpdateScheduleInput 일정 수정 저장 값을 정의합니다.
export interface UpdateScheduleInput {
  readonly scheduleTitle?: string;
  readonly startAt?: Date;
  readonly endAt?: Date;
  readonly timeZone?: string;
  readonly location?: string | null;
  readonly meetingUrl?: string | null;
  readonly memo?: string | null;
  readonly isAllDay?: boolean;
  readonly externalSyncStatus?: ScheduleExternalSyncStatus;
}

// 역할 : SoftDeleteScheduleInput 현재 사용자 일정 휴지통 이동 값을 정의합니다.
export interface SoftDeleteScheduleInput {
  readonly userId: string;
  readonly scheduleId: string;
  readonly deletedAt: Date;
  readonly deletedByUserId: string;
  readonly trashExpiresAt: Date;
  readonly externalSyncStatus?: ScheduleExternalSyncStatus;
}

// 역할 : CreateScheduleDealsInput 일정-딜 연결 생성 값을 정의합니다.
export interface CreateScheduleDealsInput {
  readonly userId: string;
  readonly scheduleId: string;
  readonly dealIds: readonly string[];
}

// 역할 : DeleteScheduleDealsInput 일정-딜 연결 삭제 값을 정의합니다.
export interface DeleteScheduleDealsInput {
  readonly userId: string;
  readonly scheduleId: string;
  readonly dealIds: readonly string[];
}

// 역할 : ScheduleRepository 저장소가 제공해야 하는 영속성 계약을 정의합니다.
export interface ScheduleRepository extends NotificationReminderWriteRepository {
  // 기능 : 일정 저장소 작업을 트랜잭션 경계 안에서 실행합니다.
  runInTransaction<T>(
    work: (repository: ScheduleRepository) => Promise<T>
  ): Promise<T>;
  // 기능 : 일정 생성/수정 화면에서 연결할 현재 사용자 소유 딜 전체 목록을 조회합니다.
  listDealOptions(userId: string): Promise<ScheduleDealOptionRecord[]>;
  // 기능 : 현재 사용자의 딜 ID 목록을 조회합니다.
  findDealsByIds(userId: string, dealIds: readonly string[]): Promise<ScheduleDealRecord[]>;
  // 기능 : 현재 사용자의 일정 목록을 조회합니다.
  listSchedules(input: ListSchedulesInput): Promise<ScheduleRecord[]>;
  // 기능 : 현재 사용자의 주간 리포트용 일정과 활성 연결 딜 projection을 조회합니다.
  listSchedulesForWeeklyReport(
    input: ListSchedulesForWeeklyReportInput
  ): Promise<WeeklyReportScheduleRecord[]>;
  // 기능 : 현재 사용자의 일정 단건 상세를 조회합니다.
  findSchedule(userId: string, scheduleId: string): Promise<ScheduleRecord | null>;
  // 기능 : 현재 사용자의 일정을 생성합니다.
  createSchedule(input: CreateScheduleInput): Promise<{ readonly id: string }>;
  // 기능 : 현재 사용자의 일정 기본 정보를 수정합니다.
  updateSchedule(
    userId: string,
    scheduleId: string,
    input: UpdateScheduleInput
  ): Promise<boolean>;
  // 기능 : 현재 사용자의 일정에 연결된 딜 ID 목록을 조회합니다.
  listScheduleDealIds(userId: string, scheduleId: string): Promise<string[]>;
  // 기능 : 일정에 딜 목록을 연결합니다.
  createScheduleDeals(input: CreateScheduleDealsInput): Promise<void>;
  // 기능 : 일정에서 딜 연결 목록을 삭제합니다.
  deleteScheduleDeals(input: DeleteScheduleDealsInput): Promise<void>;
  // 기능 : 현재 사용자의 일정을 휴지통 상태로 변경합니다.
  softDeleteSchedule(input: SoftDeleteScheduleInput): Promise<boolean>;
}
