import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_ANALYTICS_REPOSITORY,
  type ProductAnalyticsRepository,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

export const PRODUCT_ANALYTICS_RAW_EVENT_RETENTION_DAYS = 365;

// 역할 : PurgeProductAnalyticsRawEventsCommand 제품 분석 raw event retention purge 입력을 정의합니다.
export interface PurgeProductAnalyticsRawEventsCommand {
  readonly now: Date;
  readonly retentionDays: 365;
  readonly batchSize: number;
}

// 역할 : PurgeProductAnalyticsRawEventsResult 제품 분석 raw event 삭제 결과 요약을 정의합니다.
export interface PurgeProductAnalyticsRawEventsResult {
  readonly rawEventsPurged: number;
  readonly purgeCutoffOccurredAt: string;
}

@Injectable()
// 역할 : 제품 분석 raw event를 365일 retention 기준으로 삭제합니다.
export class PurgeProductAnalyticsRawEventsUseCase {
  constructor(
    @Inject(PRODUCT_ANALYTICS_REPOSITORY)
    private readonly productAnalyticsRepository: ProductAnalyticsRepository,
    private readonly logger: AppLogger
  ) {}

  // 기능 : cutoff보다 오래된 ProductAnalyticsEvent만 batch 단위로 반복 삭제합니다.
  async execute(
    command: PurgeProductAnalyticsRawEventsCommand
  ): Promise<PurgeProductAnalyticsRawEventsResult> {
    const batchSize = this.normalizeBatchSize(command.batchSize);
    const cutoff = this.resolveCutoff(command);
    let rawEventsPurged = 0;

    // 1. snapshot과 AI call log는 건드리지 않고 ProductAnalyticsEvent row만 삭제합니다.
    while (true) {
      const purgedCount =
        await this.productAnalyticsRepository.deleteRawEventsBefore(
          cutoff,
          batchSize
        );
      rawEventsPurged += purgedCount;

      // 2. batch보다 적게 지워졌으면 cutoff 이전 raw event가 더 없다고 보고 종료합니다.
      if (purgedCount < batchSize) {
        break;
      }
    }

    const result = {
      rawEventsPurged,
      purgeCutoffOccurredAt: cutoff.toISOString(),
    };

    this.logger.log(
      JSON.stringify({
        event: "analytics.retention.purgeCompleted",
        ...result,
      }),
      this.constructor.name
    );

    return result;
  }

  // 기능 : raw event retention 정책이 365일로 고정되어 있는지 확인하고 cutoff를 계산합니다.
  private resolveCutoff(command: PurgeProductAnalyticsRawEventsCommand): Date {
    if (command.retentionDays !== PRODUCT_ANALYTICS_RAW_EVENT_RETENTION_DAYS) {
      throw new Error("product analytics raw event retentionDays must be 365");
    }

    return new Date(
      command.now.getTime() -
        PRODUCT_ANALYTICS_RAW_EVENT_RETENTION_DAYS * 24 * 60 * 60 * 1_000
    );
  }

  // 기능 : purge batch size를 양의 정수로 정규화합니다.
  private normalizeBatchSize(batchSize: number): number {
    if (!Number.isInteger(batchSize) || batchSize <= 0) {
      return 500;
    }

    return batchSize;
  }
}
