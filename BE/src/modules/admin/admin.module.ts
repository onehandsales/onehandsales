import { Module } from "@nestjs/common";
import { AdminQueryUseCase } from "@/modules/admin/application/use-cases/admin-query.use-case";
import { ADMIN_QUERY_REPOSITORY } from "@/modules/admin/application/ports/admin-query.repository";
import { PrismaAdminQueryRepository } from "@/modules/admin/infrastructure/persistence/prisma-admin-query.repository";
import { AuthModule } from "@/modules/auth/auth.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { AdminQueryController } from "./presentation/http/admin-query.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [AdminQueryController],
  providers: [
    AdminQueryUseCase,
    {
      provide: ADMIN_QUERY_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaAdminQueryRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class AdminModule {}
