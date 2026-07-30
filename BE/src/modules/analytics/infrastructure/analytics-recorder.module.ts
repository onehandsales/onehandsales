import { Module } from "@nestjs/common";
import { PRODUCT_ANALYTICS_REPOSITORY } from "@/modules/analytics/application/ports/product-analytics.repository";
import {
  PRODUCT_ANALYTICS_EVENT_RECORDER,
  ProductAnalyticsEventRecorder,
} from "@/modules/analytics/application/services/product-analytics-event-recorder";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaProductAnalyticsRepository } from "./persistence/prisma-product-analytics.repository";

// 역할 : AnalyticsRecorderModule 도메인 모듈이 사용할 server 분석 이벤트 recorder 의존성을 제공합니다.
@Module({
  imports: [PrismaInfrastructureModule],
  providers: [
    ProductAnalyticsEventRecorder,
    AppLogger,
    {
      provide: PRODUCT_ANALYTICS_EVENT_RECORDER,
      useExisting: ProductAnalyticsEventRecorder,
    },
    {
      provide: PRODUCT_ANALYTICS_REPOSITORY,
      // 기능 : Prisma 서비스로 제품 분석 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaProductAnalyticsRepository(prismaService),
      inject: [PrismaService],
    },
  ],
  exports: [PRODUCT_ANALYTICS_EVENT_RECORDER, PRODUCT_ANALYTICS_REPOSITORY],
})
export class AnalyticsRecorderModule {}
