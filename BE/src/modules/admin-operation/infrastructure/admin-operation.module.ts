import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { ADMIN_AUDIT_REPOSITORY } from "../application/ports/admin-audit.repository";
import { ADMIN_DOMAIN_RECORD_REPOSITORY } from "../application/ports/admin-domain-record.repository";
import { ADMIN_PROVIDER_FAILURE_REPOSITORY } from "../application/ports/admin-provider-failure.repository";
import { ADMIN_TRASH_REPOSITORY } from "../application/ports/admin-trash.repository";
import { ADMIN_USER_REPOSITORY } from "../application/ports/admin-user.repository";
import { AdminAuditApplicationService } from "../application/services/admin-audit-application.service";
import { AdminDomainRecordApplicationService } from "../application/services/admin-domain-record-application.service";
import { AdminProviderFailureApplicationService } from "../application/services/admin-provider-failure-application.service";
import { AdminTrashApplicationService } from "../application/services/admin-trash-application.service";
import { AdminUserApplicationService } from "../application/services/admin-user-application.service";
import { AdminAuditController } from "../presentation/http/admin-audit.controller";
import { AdminDomainRecordController } from "../presentation/http/admin-domain-record.controller";
import { AdminProviderFailureController } from "../presentation/http/admin-provider-failure.controller";
import { AdminTrashController } from "../presentation/http/admin-trash.controller";
import { AdminUserController } from "../presentation/http/admin-user.controller";
import { PrismaAdminAuditRepository } from "./persistence/prisma-admin-audit.repository";
import { PrismaAdminDomainRecordRepository } from "./persistence/prisma-admin-domain-record.repository";
import { PrismaAdminProviderFailureRepository } from "./persistence/prisma-admin-provider-failure.repository";
import { PrismaAdminTrashRepository } from "./persistence/prisma-admin-trash.repository";
import { PrismaAdminUserRepository } from "./persistence/prisma-admin-user.repository";

// 역할 : AdminOperationModule Admin 운영 API controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [
    AdminAuditController,
    AdminUserController,
    AdminDomainRecordController,
    AdminTrashController,
    AdminProviderFailureController,
  ],
  providers: [
    AdminAuditApplicationService,
    AdminUserApplicationService,
    AdminDomainRecordApplicationService,
    AdminTrashApplicationService,
    AdminProviderFailureApplicationService,
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
    {
      provide: ADMIN_DOMAIN_RECORD_REPOSITORY,
      // 기능 : Prisma 서비스로 Admin 도메인 read-only 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaAdminDomainRecordRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: ADMIN_TRASH_REPOSITORY,
      // 기능 : Prisma 서비스로 Admin Trash 운영 조회 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaAdminTrashRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: ADMIN_PROVIDER_FAILURE_REPOSITORY,
      // 기능 : Prisma 서비스로 Admin provider 실패 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaAdminProviderFailureRepository(
          prismaService,
          prismaService
        ),
      inject: [PrismaService],
    },
  ],
})
export class AdminOperationModule {}
