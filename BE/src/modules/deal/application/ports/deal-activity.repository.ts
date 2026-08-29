import type {
  DealActivitySourceTypeCode,
  DealActivityTypeCode,
} from "./deal-activity.types";

export const DEAL_ACTIVITY_REPOSITORY = Symbol("DEAL_ACTIVITY_REPOSITORY");

// 역할 : DealActivityRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealActivityRecord {
  readonly id: string;
  readonly userId: string;
  readonly dealId: string;
  readonly activityType: DealActivityTypeCode;
  readonly sourceType: DealActivitySourceTypeCode;
  readonly sourceId: string | null;
  readonly title: string;
  readonly summary: string | null;
  readonly body: string | null;
  readonly occurredAt: Date;
  readonly linkedRecordsJson: unknown | null;
  readonly metadataJson: unknown | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : DealActivityCursor 데이터가 계층 사이에서 전달되는 커서 조회 기준을 정의합니다.
export interface DealActivityCursor {
  readonly occurredAt: Date;
  readonly id: string;
}

// 역할 : CreateDealActivityInput 데이터가 계층 사이에서 전달되는 생성 값을 정의합니다.
export interface CreateDealActivityInput {
  readonly userId: string;
  readonly dealId: string;
  readonly activityType: DealActivityTypeCode;
  readonly sourceType: DealActivitySourceTypeCode;
  readonly sourceId?: string | null;
  readonly title: string;
  readonly summary?: string | null;
  readonly body?: string | null;
  readonly occurredAt: Date;
  readonly linkedRecordsJson?: unknown | null;
  readonly metadataJson?: unknown | null;
}

// 역할 : FindDealActivityBySourceInput 데이터가 계층 사이에서 전달되는 원본 조회 기준을 정의합니다.
export interface FindDealActivityBySourceInput {
  readonly userId: string;
  readonly dealId: string;
  readonly activityType: DealActivityTypeCode;
  readonly sourceType: DealActivitySourceTypeCode;
  readonly sourceId: string;
}

// 역할 : FindDealActivityByIdInput 데이터가 계층 사이에서 전달되는 단건 조회 기준을 정의합니다.
export interface FindDealActivityByIdInput {
  readonly userId: string;
  readonly dealId: string;
  readonly activityId: string;
}

// 역할 : ListDealActivitiesForDealInput 데이터가 계층 사이에서 전달되는 목록 조회 기준을 정의합니다.
export interface ListDealActivitiesForDealInput {
  readonly userId: string;
  readonly dealId: string;
  readonly cursor: DealActivityCursor | null;
  readonly take: number;
  readonly type?: DealActivityTypeCode;
}

// 역할 : UpdateUserDealActivityInput 데이터가 계층 사이에서 전달되는 수동 활동 수정 값을 정의합니다.
export interface UpdateUserDealActivityInput {
  readonly userId: string;
  readonly dealId: string;
  readonly activityId: string;
  readonly activityType?: DealActivityTypeCode;
  readonly title?: string;
  readonly summary?: string | null;
  readonly body?: string | null;
  readonly occurredAt?: Date;
  readonly linkedRecordsJson?: unknown | null;
  readonly metadataJson?: unknown | null;
}

// 역할 : DealActivityRepository 저장소가 제공해야 하는 딜 활동 영속성 계약을 정의합니다.
export interface DealActivityRepository {
  // 기능 : 딜 활동 저장소 작업을 트랜잭션 경계 안에서 실행합니다.
  runInTransaction<T>(
    work: (repository: DealActivityRepository) => Promise<T>
  ): Promise<T>;
  // 기능 : 딜 활동 행을 생성합니다.
  createActivity(input: CreateDealActivityInput): Promise<DealActivityRecord>;
  // 기능 : 자동 활동 원본 기준으로 기존 딜 활동을 조회합니다.
  findActivityBySource(
    input: FindDealActivityBySourceInput
  ): Promise<DealActivityRecord | null>;
  // 기능 : 현재 사용자의 딜 활동 단건을 조회합니다.
  findActivityByIdForDeal(
    input: FindDealActivityByIdInput
  ): Promise<DealActivityRecord | null>;
  // 기능 : 현재 사용자의 딜 활동 목록을 최신순 커서 기준으로 조회합니다.
  listActivitiesForDeal(
    input: ListDealActivitiesForDealInput
  ): Promise<DealActivityRecord[]>;
  // 기능 : 현재 사용자가 직접 작성한 딜 활동만 수정합니다.
  updateUserActivity(
    input: UpdateUserDealActivityInput
  ): Promise<DealActivityRecord | null>;
}
