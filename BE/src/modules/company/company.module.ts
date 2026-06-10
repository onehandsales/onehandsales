import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/auth.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { COMPANY_REPOSITORY } from "./application/ports/company.repository";
import { PRIVATE_MEMO_ENCRYPTION_PORT } from "./application/ports/private-memo-encryption.port";
import { CompanyApplicationService } from "./application/services/company-application.service";
import { PrismaCompanyRepository } from "./infrastructure/persistence/prisma-company.repository";
import { NodePrivateMemoEncryptionService } from "./infrastructure/security/node-private-memo-encryption.service";
import {
  CompanyController,
  CompanyFieldController,
  CompanyRegionController,
} from "./presentation/http/company.controller";

@Module({
  imports: [AuthModule, ConfigModule, PrismaInfrastructureModule],
  controllers: [
    CompanyController,
    CompanyFieldController,
    CompanyRegionController,
  ],
  providers: [
    CompanyApplicationService,
    NodePrivateMemoEncryptionService,
    {
      provide: COMPANY_REPOSITORY,
      // 기능 : Prisma 서비스로 회사 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaCompanyRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: PRIVATE_MEMO_ENCRYPTION_PORT,
      useExisting: NodePrivateMemoEncryptionService,
    },
  ],
})
export class CompanyModule {}
