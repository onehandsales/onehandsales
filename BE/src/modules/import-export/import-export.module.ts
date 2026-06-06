import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/auth.module";
import { IMPORT_EXPORT_REPOSITORY } from "@/modules/import-export/application/ports/import-export.repository";
import { IMPORT_FILE_PARSER_PORT } from "@/modules/import-export/application/ports/import-file-parser.port";
import { IMPORT_MAPPING_PORT } from "@/modules/import-export/application/ports/import-mapping.port";
import { ConfirmImportJobUseCase } from "@/modules/import-export/application/use-cases/confirm-import-job.use-case";
import { CreateImportJobUseCase } from "@/modules/import-export/application/use-cases/create-import-job.use-case";
import { GenerateImportMappingUseCase } from "@/modules/import-export/application/use-cases/generate-import-mapping.use-case";
import { GetImportJobUseCase } from "@/modules/import-export/application/use-cases/get-import-job.use-case";
import { UpdateImportMappingUseCase } from "@/modules/import-export/application/use-cases/update-import-mapping.use-case";
import { OpenAiImportMappingAdapter } from "@/modules/import-export/infrastructure/ai/openai-import-mapping.adapter";
import { XlsxImportFileParserAdapter } from "@/modules/import-export/infrastructure/parser/xlsx-import-file-parser.adapter";
import { PrismaImportExportRepository } from "@/modules/import-export/infrastructure/persistence/prisma-import-export.repository";
import {
  STORAGE_PORT,
  type StoragePort,
} from "@/shared/application/ports/storage.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SupabaseInfrastructureModule } from "@/shared/infrastructure/supabase/supabase-infrastructure.module";
import { ImportController } from "./presentation/http/import.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule, SupabaseInfrastructureModule],
  controllers: [ImportController],
  providers: [
    GenerateImportMappingUseCase,
    UpdateImportMappingUseCase,
    ConfirmImportJobUseCase,
    GetImportJobUseCase,
    {
      provide: CreateImportJobUseCase,
      useFactory: (
        repository: PrismaImportExportRepository,
        parserPort: XlsxImportFileParserAdapter,
        storagePort: StoragePort,
        configService: ConfigService
      ) =>
        new CreateImportJobUseCase(
          repository,
          parserPort,
          storagePort,
          configService.get<string>("SUPABASE_STORAGE_BUCKET_IMPORTS") ?? "imports"
        ),
      inject: [
        IMPORT_EXPORT_REPOSITORY,
        IMPORT_FILE_PARSER_PORT,
        STORAGE_PORT,
        ConfigService,
      ],
    },
    {
      provide: IMPORT_EXPORT_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaImportExportRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: IMPORT_FILE_PARSER_PORT,
      useClass: XlsxImportFileParserAdapter,
    },
    {
      provide: IMPORT_MAPPING_PORT,
      useFactory: (configService: ConfigService) =>
        new OpenAiImportMappingAdapter(configService),
      inject: [ConfigService],
    },
  ],
})
export class ImportExportModule {}
