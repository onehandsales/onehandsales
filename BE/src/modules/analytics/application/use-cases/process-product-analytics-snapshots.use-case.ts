import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_ANALYTICS_REPOSITORY,
  type ActivationCandidate,
  type ProductAnalyticsRepository,
  type UpsertUserActivationSnapshotInput,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import {
  addDaysToProductAnalyticsDate,
  formatProductAnalyticsDateOnlyDate,
} from "@/modules/analytics/application/services/product-analytics-date";
import { PRODUCT_ANALYTICS_ACTIVE_RETENTION_EVENT_NAMES } from "@/modules/analytics/domain/product-analytics-event-taxonomy";

const DEFAULT_SNAPSHOT_WINDOW_DAYS = 30;
const DEFAULT_SNAPSHOT_LIMIT = 100;
const MAX_SNAPSHOT_LIMIT = 1_000;
const RETENTION_DAY_OFFSETS = [1, 7, 30] as const;

// 역할 : ProcessProductAnalyticsSnapshotsCommand 제품 분석 snapshot 계산 범위와 batch 크기를 정의합니다.
export interface ProcessProductAnalyticsSnapshotsCommand {
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly limit?: number;
}

// 역할 : ProcessProductAnalyticsSnapshotsResult snapshot 계산 결과 요약을 정의합니다.
export interface ProcessProductAnalyticsSnapshotsResult {
  readonly activationSnapshotsUpdated: number;
  readonly retentionSnapshotsUpdated: number;
  readonly fromDate: string;
  readonly toDate: string;
}

// 역할 : NormalizedSnapshotCommand 검증을 마친 snapshot 계산 입력을 정의합니다.
interface NormalizedSnapshotCommand {
  readonly fromDate: string;
  readonly toDate: string;
  readonly limit: number;
}

// 역할 : ActivationPoint activation이 성립한 이벤트 row 기준 정보를 정의합니다.
interface ActivationPoint {
  readonly activatedAt: Date;
  readonly activatedEventDate: string;
  readonly timeZone: string;
}

@Injectable()
// 역할 : 제품 분석 raw event를 activation과 retention snapshot으로 계산합니다.
export class ProcessProductAnalyticsSnapshotsUseCase {
  constructor(
    @Inject(PRODUCT_ANALYTICS_REPOSITORY)
    private readonly productAnalyticsRepository: ProductAnalyticsRepository
  ) {}

  // 기능 : activation snapshot을 먼저 upsert한 뒤 cohort별 D1/D7/D30 retention snapshot을 갱신합니다.
  async execute(
    command: ProcessProductAnalyticsSnapshotsCommand = {}
  ): Promise<ProcessProductAnalyticsSnapshotsResult> {
    const normalized = this.normalizeCommand(command);
    const calculatedAt = new Date();
    const candidates =
      await this.productAnalyticsRepository.findFirstActivationCandidates(
        normalized.fromDate,
        normalized.toDate,
        normalized.limit
      );

    return this.productAnalyticsRepository.runInTransaction(
      async (repository) => {
        let activationSnapshotsUpdated = 0;
        let retentionSnapshotsUpdated = 0;

        // 1. 범위 안에서 바뀐 사용자 후보의 activation 상태를 사용자별 snapshot으로 고정합니다.
        for (const candidate of candidates) {
          await repository.upsertUserActivationSnapshot(
            this.toActivationSnapshotInput(candidate, calculatedAt)
          );
          activationSnapshotsUpdated += 1;
        }

        // 2. 활성화 cohort date를 date-only 기준으로 가져와 aggregate retention만 계산합니다.
        const cohortDates = await repository.listActivatedCohortDates(
          normalized.fromDate,
          normalized.toDate,
          normalized.limit
        );

        for (const cohortDate of cohortDates) {
          const cohortUserCount =
            await repository.countActivatedUsersByDate(cohortDate);

          // 3. 사용자 timezone 기준 eventDate에 active event가 있으면 D1/D7/D30 retained로 집계합니다.
          for (const dayOffset of RETENTION_DAY_OFFSETS) {
            const targetDate = addDaysToProductAnalyticsDate(
              cohortDate,
              dayOffset
            );
            const retainedUserCount =
              await repository.countRetainedUsersByDate(
                cohortDate,
                targetDate,
                PRODUCT_ANALYTICS_ACTIVE_RETENTION_EVENT_NAMES
              );

            await repository.upsertRetentionCohortSnapshot({
              calculatedAt,
              cohortDate,
              cohortUserCount,
              dayOffset,
              retainedUserCount,
            });
            retentionSnapshotsUpdated += 1;
          }
        }

        return {
          activationSnapshotsUpdated,
          retentionSnapshotsUpdated,
          fromDate: normalized.fromDate,
          toDate: normalized.toDate,
        };
      }
    );
  }

  // 기능 : optional 입력값을 batch 실행에 사용할 안전한 date range와 limit으로 정규화합니다.
  private normalizeCommand(
    command: ProcessProductAnalyticsSnapshotsCommand
  ): NormalizedSnapshotCommand {
    const today = formatProductAnalyticsDateOnlyDate(new Date());
    const toDate = command.toDate ?? today;
    const fromDate =
      command.fromDate ??
      addDaysToProductAnalyticsDate(toDate, -DEFAULT_SNAPSHOT_WINDOW_DAYS);

    if (fromDate > toDate) {
      throw new Error("fromDate must be earlier than or equal to toDate");
    }

    return {
      fromDate,
      limit: this.normalizeLimit(command.limit),
      toDate,
    };
  }

  // 기능 : batch limit을 양의 정수 범위로 제한합니다.
  private normalizeLimit(limit: number | undefined): number {
    if (!Number.isInteger(limit) || !limit || limit <= 0) {
      return DEFAULT_SNAPSHOT_LIMIT;
    }

    return Math.min(limit, MAX_SNAPSHOT_LIMIT);
  }

  // 기능 : 후보 row에서 activation 성립 여부와 activated event date/timezone을 계산합니다.
  private toActivationSnapshotInput(
    candidate: ActivationCandidate,
    calculatedAt: Date
  ): UpsertUserActivationSnapshotInput {
    const activationPoint = this.resolveActivationPoint(candidate);

    return {
      activatedAt: activationPoint?.activatedAt ?? null,
      activatedEventDate: activationPoint?.activatedEventDate ?? null,
      calculatedAt,
      firstDealCreatedAt: candidate.firstDealCreatedAt,
      firstMeaningfulActionAt: candidate.firstMeaningfulActionAt,
      status: activationPoint ? "ACTIVATED" : "NOT_ACTIVATED",
      timeZone: activationPoint?.timeZone ?? null,
      userId: candidate.userId,
    };
  }

  // 기능 : 첫 deal 생성과 첫 의미 행동 중 더 늦은 row를 activation 성립 row로 선택합니다.
  private resolveActivationPoint(
    candidate: ActivationCandidate
  ): ActivationPoint | null {
    if (!candidate.firstDealCreatedAt || !candidate.firstMeaningfulActionAt) {
      return null;
    }

    if (
      candidate.firstDealCreatedAt.getTime() >=
      candidate.firstMeaningfulActionAt.getTime()
    ) {
      return {
        activatedAt: candidate.firstDealCreatedAt,
        activatedEventDate: this.requireSnapshotField(
          candidate.firstDealCreatedEventDate,
          "firstDealCreatedEventDate"
        ),
        timeZone: this.requireSnapshotField(
          candidate.firstDealCreatedTimeZone,
          "firstDealCreatedTimeZone"
        ),
      };
    }

    return {
      activatedAt: candidate.firstMeaningfulActionAt,
      activatedEventDate: this.requireSnapshotField(
        candidate.firstMeaningfulActionEventDate,
        "firstMeaningfulActionEventDate"
      ),
      timeZone: this.requireSnapshotField(
        candidate.firstMeaningfulActionTimeZone,
        "firstMeaningfulActionTimeZone"
      ),
    };
  }

  // 기능 : repository가 반환한 activation row 필수 필드 누락을 계산 오류로 중단합니다.
  private requireSnapshotField(value: string | null, fieldName: string): string {
    if (!value) {
      throw new Error(`${fieldName} is required for activated user snapshot`);
    }

    return value;
  }
}
