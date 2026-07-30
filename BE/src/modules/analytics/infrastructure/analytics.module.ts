import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { CollectClientAnalyticsEventUseCase } from "@/modules/analytics/application/use-cases/collect-client-analytics-event.use-case";
import { AnalyticsController } from "@/modules/analytics/presentation/http/analytics.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { AnalyticsRecorderModule } from "./analytics-recorder.module";

// 역할 : AnalyticsModule 제품 분석 API와 기반 저장소 의존성을 조립합니다.
@Module({
  imports: [AuthModule, AnalyticsRecorderModule],
  controllers: [AnalyticsController],
  providers: [CollectClientAnalyticsEventUseCase, AppLogger],
  exports: [AnalyticsRecorderModule],
})
export class AnalyticsModule {}
