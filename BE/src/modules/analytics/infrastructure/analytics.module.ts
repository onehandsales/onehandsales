import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { PRODUCT_ANALYTICS_REPOSITORY } from "@/modules/analytics/application/ports/product-analytics.repository";
import { CollectClientAnalyticsEventUseCase } from "@/modules/analytics/application/use-cases/collect-client-analytics-event.use-case";
import { AnalyticsController } from "@/modules/analytics/presentation/http/analytics.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaProductAnalyticsRepository } from "./persistence/prisma-product-analytics.repository";

// 역할 : AnalyticsModule 제품 분석 API와 기반 저장소 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [AnalyticsController],
  providers: [
    CollectClientAnalyticsEventUseCase,
    AppLogger,
    {
      provide: PRODUCT_ANALYTICS_REPOSITORY,
      // 기능 : Prisma 서비스로 제품 분석 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaProductAnalyticsRepository(prismaService),
      inject: [PrismaService],
    },
  ],
  exports: [PRODUCT_ANALYTICS_REPOSITORY],
})
export class AnalyticsModule {}
