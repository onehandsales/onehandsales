import { Inject, Injectable } from "@nestjs/common";
import { getImportTargetFields } from "@/modules/import-export/application/import-target-fields";
import {
  IMPORT_EXPORT_REPOSITORY,
  type ImportExportRepository,
} from "@/modules/import-export/application/ports/import-export.repository";
import {
  IMPORT_MAPPING_PORT,
  type ImportMappingPort,
} from "@/modules/import-export/application/ports/import-mapping.port";
import {
  AiProviderUnavailableError,
  ImportJobNotFoundError,
} from "@/modules/import-export/domain/import-export.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class GenerateImportMappingUseCase {
  constructor(
    @Inject(IMPORT_EXPORT_REPOSITORY)
    private readonly importExportRepository: ImportExportRepository,
    @Inject(IMPORT_MAPPING_PORT)
    private readonly importMappingPort: ImportMappingPort
  ) {}

  async execute(currentUser: CurrentUserContext, importJobId: string) {
    const detail = await this.importExportRepository.getJobDetail(
      currentUser.id,
      importJobId
    );

    if (!detail) {
      throw new ImportJobNotFoundError();
    }

    const sourceColumns = detail.job.resultSummary?.sourceColumns ?? [];
    const aiJob = await this.importExportRepository.createAiJob({
      userId: currentUser.id,
      importJobId: detail.job.id,
      targetType: detail.job.targetType,
      sourceColumns,
      rowCount: detail.rows.length,
    });

    try {
      const suggestion = await this.importMappingPort.generateMapping({
        targetType: detail.job.targetType,
        sourceColumns,
        targetFields: getImportTargetFields(detail.job.targetType),
        sampleRows: detail.rows.slice(0, 5).map((row) => row.rawData),
      });

      await this.importExportRepository.completeAiMapping({
        userId: currentUser.id,
        importJobId: detail.job.id,
        aiJobId: aiJob.id,
        suggestion,
      });

      return suggestion;
    } catch (error) {
      await this.importExportRepository.failAiMapping({
        userId: currentUser.id,
        importJobId: detail.job.id,
        aiJobId: aiJob.id,
        errorMessage: error instanceof Error ? error.message : "AI mapping failed",
      });

      if (error instanceof AiProviderUnavailableError) {
        throw error;
      }

      throw new AiProviderUnavailableError(
        error instanceof Error ? error.message : "AI mapping failed"
      );
    }
  }
}
