import { Module } from "@nestjs/common";
import { AdminQueryUseCase } from "@/modules/admin/application/use-cases/admin-query.use-case";
import { ADMIN_QUERY_REPOSITORY } from "@/modules/admin/application/ports/admin-query.repository";
import { AdminSensitiveUseCase } from "@/modules/admin/application/use-cases/admin-sensitive.use-case";
import { ADMIN_SENSITIVE_REPOSITORY } from "@/modules/admin/application/ports/admin-sensitive.repository";
import { PrismaAdminQueryRepository } from "@/modules/admin/infrastructure/persistence/prisma-admin-query.repository";
import { PrismaAdminSensitiveRepository } from "@/modules/admin/infrastructure/persistence/prisma-admin-sensitive.repository";
import { AuthModule } from "@/modules/auth/auth.module";
import {
  ENCRYPTION_PORT,
  type EncryptionPort,
} from "@/shared/application/ports/encryption.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SecurityInfrastructureModule } from "@/shared/infrastructure/security/security-infrastructure.module";
import { AdminQueryController } from "./presentation/http/admin-query.controller";
import { AdminSensitiveController } from "./presentation/http/admin-sensitive.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule, SecurityInfrastructureModule],
  controllers: [AdminQueryController, AdminSensitiveController],
  providers: [
    AdminQueryUseCase,
    AdminSensitiveUseCase,
    {
      provide: ADMIN_QUERY_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaAdminQueryRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: ADMIN_SENSITIVE_REPOSITORY,
      useFactory: (
        prismaService: PrismaService,
        encryptionPort: EncryptionPort
      ) => new PrismaAdminSensitiveRepository(prismaService, encryptionPort),
      inject: [PrismaService, ENCRYPTION_PORT],
    },
  ],
})
export class AdminModule {}
