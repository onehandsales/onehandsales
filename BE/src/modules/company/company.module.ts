import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { COMPANY_REPOSITORY } from "@/modules/company/application/ports/company.repository";
import { CreateCompanyUseCase } from "@/modules/company/application/use-cases/create-company.use-case";
import { CreateCompanyLogUseCase } from "@/modules/company/application/use-cases/create-company-log.use-case";
import { DeleteCompanyUseCase } from "@/modules/company/application/use-cases/delete-company.use-case";
import { DeleteCompanyLogUseCase } from "@/modules/company/application/use-cases/delete-company-log.use-case";
import { GetCompanyUseCase } from "@/modules/company/application/use-cases/get-company.use-case";
import { ListCompaniesUseCase } from "@/modules/company/application/use-cases/list-companies.use-case";
import { ListCompanyLogsUseCase } from "@/modules/company/application/use-cases/list-company-logs.use-case";
import { RestoreCompanyUseCase } from "@/modules/company/application/use-cases/restore-company.use-case";
import { UpdateCompanyUseCase } from "@/modules/company/application/use-cases/update-company.use-case";
import { UpdateCompanyLogUseCase } from "@/modules/company/application/use-cases/update-company-log.use-case";
import { PrismaCompanyRepository } from "@/modules/company/infrastructure/persistence/prisma-company.repository";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SecurityInfrastructureModule } from "@/shared/infrastructure/security/security-infrastructure.module";
import { ENCRYPTION_PORT, type EncryptionPort } from "@/shared/application/ports/encryption.port";
import { CompanyController } from "./presentation/http/company.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule, SecurityInfrastructureModule],
  controllers: [CompanyController],
  providers: [
    ListCompaniesUseCase,
    CreateCompanyUseCase,
    GetCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    RestoreCompanyUseCase,
    ListCompanyLogsUseCase,
    CreateCompanyLogUseCase,
    UpdateCompanyLogUseCase,
    DeleteCompanyLogUseCase,
    {
      provide: COMPANY_REPOSITORY,
      useFactory: (
        prismaService: PrismaService,
        encryptionPort: EncryptionPort
      ) => new PrismaCompanyRepository(prismaService, encryptionPort),
      inject: [PrismaService, ENCRYPTION_PORT],
    },
  ],
})
export class CompanyModule {}

