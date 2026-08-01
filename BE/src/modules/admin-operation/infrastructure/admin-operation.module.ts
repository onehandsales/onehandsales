import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { ADMIN_AUDIT_REPOSITORY } from "../application/ports/admin-audit.repository";
import { ADMIN_USER_REPOSITORY } from "../application/ports/admin-user.repository";
import { AdminAuditApplicationService } from "../application/services/admin-audit-application.service";
import { AdminUserApplicationService } from "../application/services/admin-user-application.service";
import { AdminAuditController } from "../presentation/http/admin-audit.controller";
import { AdminUserController } from "../presentation/http/admin-user.controller";
import { PrismaAdminAuditRepository } from "./persistence/prisma-admin-audit.repository";
import { PrismaAdminUserRepository } from "./persistence/prisma-admin-user.repository";

// 역할 : AdminOperationModule Admin 운영 감사 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [AdminAuditController, AdminUserController],
  providers: [
    AdminAuditApplicationService,
    AdminUserApplicationService,
    AppLogger,
    {
      provide: ADMIN_AUDIT_REPOSITORY,
      // 기능 : Prisma 서비스로 Admin 감사 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaAdminAuditRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: ADMIN_USER_REPOSITORY,
      // 기능 : Prisma 서비스로 Admin 사용자 overview 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaAdminUserRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
  ],
})
export class AdminOperationModule {}
