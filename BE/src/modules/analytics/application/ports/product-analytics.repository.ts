import type {
  ProductAnalyticsEventSourceCode,
  ProductAnalyticsRuntimeEventName,
  ProductAnalyticsTargetTypeCode,
} from "@/modules/analytics/domain/product-analytics-event-taxonomy";

// 기능 : 제품 분석 저장소 provider token을 정의합니다.
export const PRODUCT_ANALYTICS_REPOSITORY = Symbol(
  "PRODUCT_ANALYTICS_REPOSITORY"
);

// 역할 : CreateProductAnalyticsEventInput 제품 분석 원본 이벤트 저장 입력을 정의합니다.
export interface CreateProductAnalyticsEventInput {
  readonly userId: string;
  readonly authSessionId: string | null;
  readonly authDeviceId: string | null;
  readonly eventName: string;
  readonly eventVersion: number;
  readonly source: ProductAnalyticsEventSourceCode;
  readonly occurredAt: Date;
  readonly eventDate: string;
  readonly timeZone: string;
  readonly idempotencyKey?: string | null;
  readonly targetType?: ProductAnalyticsTargetTypeCode | null;
  readonly targetId?: string | null;
  readonly payloadJson: Record<string, unknown>;
}

// 역할 : ProductAnalyticsEventRecord 저장된 제품 분석 원본 이벤트의 최소 결과를 정의합니다.
export interface ProductAnalyticsEventRecord {
  readonly id: string;
}

// 역할 : UserActivationSnapshot 상태 코드를 Prisma enum에 직접 의존하지 않는 application 계약으로 정의합니다.
export type UserActivationSnapshotStatus = "NOT_ACTIVATED" | "ACTIVATED";

// 역할 : ProductAnalyticsRetentionDayOffset retention snapshot day offset allowlist를 정의합니다.
export type ProductAnalyticsRetentionDayOffset = 1 | 7 | 30;

// 역할 : ActivationCandidate activation 계산에 필요한 사용자별 최초 이벤트 후보를 정의합니다.
export interface ActivationCandidate {
  readonly userId: string;
  readonly firstDealCreatedAt: Date | null;
  readonly firstDealCreatedEventDate: string | null;
  readonly firstDealCreatedTimeZone: string | null;
  readonly firstMeaningfulActionAt: Date | null;
  readonly firstMeaningfulActionEventDate: string | null;
  readonly firstMeaningfulActionTimeZone: string | null;
}

// 역할 : UpsertUserActivationSnapshotInput 사용자별 activation snapshot upsert 입력을 정의합니다.
export interface UpsertUserActivationSnapshotInput {
  readonly userId: string;
  readonly status: UserActivationSnapshotStatus;
  readonly firstDealCreatedAt: Date | null;
  readonly firstMeaningfulActionAt: Date | null;
  readonly activatedAt: Date | null;
  readonly activatedEventDate: string | null;
  readonly timeZone: string | null;
  readonly calculatedAt: Date;
}

// 역할 : UpsertRetentionCohortSnapshotInput cohort 단위 retention snapshot upsert 입력을 정의합니다.
export interface UpsertRetentionCohortSnapshotInput {
  readonly cohortDate: string;
  readonly dayOffset: ProductAnalyticsRetentionDayOffset;
  readonly cohortUserCount: number;
  readonly retainedUserCount: number;
  readonly calculatedAt: Date;
}

// 역할 : ProductAnalyticsRepository 제품 분석 raw event, snapshot, purge 영속성 계약을 정의합니다.
export interface ProductAnalyticsRepository {
  // 기능 : 여러 snapshot upsert를 하나의 transaction 경계 안에서 실행합니다.
  runInTransaction<T>(
    work: (repository: ProductAnalyticsRepository) => Promise<T>
  ): Promise<T>;

  // 기능 : allowlist를 통과한 제품 분석 원본 이벤트를 저장합니다.
  createEvent(
    input: CreateProductAnalyticsEventInput
  ): Promise<ProductAnalyticsEventRecord>;

  // 기능 : app session ID로 연결된 authDeviceId를 조회합니다.
  findAuthDeviceIdBySessionId(sessionId: string): Promise<string | null>;

  // 기능 : 지정한 eventDate 범위에서 activation 재계산이 필요한 사용자 후보를 조회합니다.
  findFirstActivationCandidates(
    fromDate: string,
    toDate: string,
    limit: number
  ): Promise<ActivationCandidate[]>;

  // 기능 : 사용자별 activation snapshot을 최신 계산 결과로 upsert합니다.
  upsertUserActivationSnapshot(
    input: UpsertUserActivationSnapshotInput
  ): Promise<void>;

  // 기능 : 지정한 범위에서 retention 계산 대상 activation cohort date 목록을 조회합니다.
  listActivatedCohortDates(
    fromDate: string,
    toDate: string,
    limit: number
  ): Promise<string[]>;

  // 기능 : 특정 activation cohort date에 속한 활성화 사용자 수를 집계합니다.
  countActivatedUsersByDate(cohortDate: string): Promise<number>;

  // 기능 : 특정 cohort 사용자가 target date에 active event를 남겼는지 distinct user 기준으로 집계합니다.
  countRetainedUsersByDate(
    cohortDate: string,
    targetDate: string,
    activeEventNames: readonly ProductAnalyticsRuntimeEventName[]
  ): Promise<number>;

  // 기능 : cohort 단위 retention snapshot을 upsert합니다.
  upsertRetentionCohortSnapshot(
    input: UpsertRetentionCohortSnapshotInput
  ): Promise<void>;

  // 기능 : cutoff보다 오래된 제품 분석 raw event를 batch 단위로 삭제합니다.
  deleteRawEventsBefore(cutoff: Date, batchSize: number): Promise<number>;
}
