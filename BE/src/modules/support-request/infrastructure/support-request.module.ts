import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { SUPPORT_REQUEST_REPOSITORY } from "@/modules/support-request/application/ports/support-request.repository";
import { SupportRequestApplicationService } from "@/modules/support-request/application/services/support-request-application.service";
import { SupportRequestController } from "@/modules/support-request/presentation/http/support-request.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaSupportRequestRepository } from "./persistence/prisma-support-request.repository";

// 역할 : SupportRequestModule 지원 요청 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [SupportRequestController],
  providers: [
    SupportRequestApplicationService,
    AppLogger,
    {
      provide: SUPPORT_REQUEST_REPOSITORY,
      // 기능 : Prisma 서비스로 지원 요청 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaSupportRequestRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class SupportRequestModule {}
