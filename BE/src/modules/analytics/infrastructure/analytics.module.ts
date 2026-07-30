import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { CollectClientAnalyticsEventUseCase } from "@/modules/analytics/application/use-cases/collect-client-analytics-event.use-case";
import { ProcessProductAnalyticsSnapshotsUseCase } from "@/modules/analytics/application/use-cases/process-product-analytics-snapshots.use-case";
import { PurgeProductAnalyticsRawEventsUseCase } from "@/modules/analytics/application/use-cases/purge-product-analytics-raw-events.use-case";
import { SummarizeAiUsageUseCase } from "@/modules/analytics/application/use-cases/summarize-ai-usage.use-case";
import { AnalyticsController } from "@/modules/analytics/presentation/http/analytics.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { AnalyticsRecorderModule } from "./analytics-recorder.module";
import { ProductAnalyticsSnapshotProcessorRunner } from "./processor/product-analytics-snapshot-processor.runner";

// 역할 : AnalyticsModule 제품 분석 API와 기반 저장소 의존성을 조립합니다.
@Module({
  imports: [AuthModule, AnalyticsRecorderModule, ConfigModule],
  controllers: [AnalyticsController],
  providers: [
    CollectClientAnalyticsEventUseCase,
    ProcessProductAnalyticsSnapshotsUseCase,
    PurgeProductAnalyticsRawEventsUseCase,
    SummarizeAiUsageUseCase,
    ProductAnalyticsSnapshotProcessorRunner,
    AppLogger,
  ],
  exports: [
    AnalyticsRecorderModule,
    ProcessProductAnalyticsSnapshotsUseCase,
    PurgeProductAnalyticsRawEventsUseCase,
    SummarizeAiUsageUseCase,
  ],
})
export class AnalyticsModule {}
