import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { IMPORT_FILE_PARSER } from "@/modules/data-import/application/ports/import-file-parser.port";
import {
  IMPORT_JOB_ERROR_REPOSITORY,
  IMPORT_JOB_REPOSITORY,
  IMPORT_JOB_ROW_REPOSITORY,
  IMPORT_UPLOADED_FILE_REPOSITORY,
} from "@/modules/data-import/application/ports/import-job.repository";
import { IMPORT_JOB_STORE } from "@/modules/data-import/application/ports/import-job.store";
import { IMPORT_MAPPING_PROVIDER } from "@/modules/data-import/application/ports/import-mapping.provider";
import { IMPORT_TEMPLATE_REPOSITORY } from "@/modules/data-import/application/ports/import-template.repository";
import { DataImportApplicationService } from "@/modules/data-import/application/services/data-import-application.service";
import { ImportJobController } from "@/modules/data-import/presentation/http/import-job.controller";
import {
  ImportTemplateController,
  ImportUserLogController,
} from "@/modules/data-import/presentation/http/import-template.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { XlsxInfrastructureModule } from "@/shared/infrastructure/xlsx/xlsx-infrastructure.module";
import { ExceljsImportFileParser } from "./parsing/exceljs-import-file.parser";
import { PrismaImportJobRepository } from "./persistence/prisma-import-job.repository";
import { PrismaImportTemplateRepository } from "./persistence/prisma-import-template.repository";
import { InMemoryImportJobStore } from "./persistence/in-memory-import-job.store";
import { OpenAiImportMappingProvider } from "./providers/openai-import-mapping.provider";

// 역할 : DataImportModule 데이터 불러오기 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule, XlsxInfrastructureModule],
  controllers: [ImportTemplateController, ImportUserLogController, ImportJobController],
  providers: [
    DataImportApplicationService,
    AppLogger,
    {
      provide: IMPORT_JOB_STORE,
      useClass: InMemoryImportJobStore,
    },
    {
      provide: IMPORT_FILE_PARSER,
      useClass: ExceljsImportFileParser,
    },
    {
      provide: IMPORT_MAPPING_PROVIDER,
      useFactory: (configService: ConfigService, logger: AppLogger) =>
        new OpenAiImportMappingProvider(configService, logger),
      inject: [ConfigService, AppLogger],
    },
    {
      provide: IMPORT_TEMPLATE_REPOSITORY,
      // 기능 : Prisma 서비스로 불러오기 양식 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaImportTemplateRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: IMPORT_JOB_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaImportJobRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: IMPORT_JOB_ROW_REPOSITORY,
      useExisting: IMPORT_JOB_REPOSITORY,
    },
    {
      provide: IMPORT_JOB_ERROR_REPOSITORY,
      useExisting: IMPORT_JOB_REPOSITORY,
    },
    {
      provide: IMPORT_UPLOADED_FILE_REPOSITORY,
      useExisting: IMPORT_JOB_REPOSITORY,
    },
  ],
})
export class DataImportModule {}
