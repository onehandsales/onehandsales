import type { NotificationReminderWriteRepository } from "@/modules/notification/application/ports/notification-reminder-writer.port";

export const SCHEDULE_REPOSITORY = Symbol("SCHEDULE_REPOSITORY");

export enum ScheduleViewMode {
  MONTH = "month",
  WEEK = "week",
}

// 역할 : ScheduleDealRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ScheduleDealRecord {
  readonly id: string;
  readonly dealName: string;
}

// 역할 : ScheduleDealOptionRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ScheduleDealOptionRecord extends ScheduleDealRecord {
  readonly createdAt: Date;
}

// 역할 : ScheduleRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ScheduleRecord {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly memo: string | null;
  readonly deals: ScheduleDealRecord[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : ListSchedulesInput 일정 목록 조회 조건을 정의합니다.
export interface ListSchedulesInput {
  readonly userId: string;
  readonly rangeStart: Date;
  readonly rangeEnd: Date;
}

// 역할 : CreateScheduleInput 일정 생성 저장 값을 정의합니다.
export interface CreateScheduleInput {
  readonly userId: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly memo: string | null;
}

// 역할 : UpdateScheduleInput 일정 수정 저장 값을 정의합니다.
export interface UpdateScheduleInput {
  readonly scheduleTitle?: string;
  readonly startAt?: Date;
  readonly endAt?: Date;
  readonly timeZone?: string;
  readonly location?: string | null;
  readonly memo?: string | null;
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
  // 기능 : 현재 사용자의 일정과 연결 정보를 실제 삭제합니다.
  deleteScheduleHard(userId: string, scheduleId: string): Promise<boolean>;
}
