import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { NotificationModule } from "@/modules/notification/infrastructure/notification.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { XlsxInfrastructureModule } from "@/shared/infrastructure/xlsx/xlsx-infrastructure.module";
import { DEAL_REPOSITORY } from "../application/ports/deal.repository";
import { DealApplicationService } from "../application/services/deal-application.service";
import { DealController } from "../presentation/http/deal.controller";
import { PrismaDealRepository } from "./persistence/prisma-deal.repository";

// 역할 : DealModule 모듈의 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [
    AuthModule,
    PrismaInfrastructureModule,
    XlsxInfrastructureModule,
    NotificationModule,
  ],
  controllers: [DealController],
  providers: [
    DealApplicationService,
    AppLogger,
    {
      provide: DEAL_REPOSITORY,
      // 기능 : Prisma 서비스로 딜 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaDealRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
  ],
})
export class DealModule {}
