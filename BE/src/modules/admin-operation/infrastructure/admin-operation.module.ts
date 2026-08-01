import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { ADMIN_AUDIT_REPOSITORY } from "../application/ports/admin-audit.repository";
import { AdminAuditApplicationService } from "../application/services/admin-audit-application.service";
import { AdminAuditController } from "../presentation/http/admin-audit.controller";
import { PrismaAdminAuditRepository } from "./persistence/prisma-admin-audit.repository";

// 역할 : AdminOperationModule Admin 운영 감사 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [AdminAuditController],
  providers: [
    AdminAuditApplicationService,
    AppLogger,
    {
      provide: ADMIN_AUDIT_REPOSITORY,
      // 기능 : Prisma 서비스로 Admin 감사 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaAdminAuditRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
  ],
})
export class AdminOperationModule {}
