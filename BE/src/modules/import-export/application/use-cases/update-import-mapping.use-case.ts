import { Inject, Injectable } from "@nestjs/common";
import {
  IMPORT_EXPORT_REPOSITORY,
  type ImportExportRepository,
} from "@/modules/import-export/application/ports/import-export.repository";
import {
  ImportJobNotFoundError,
  ValidationError,
} from "@/modules/import-export/domain/import-export.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toImportJobResponse } from "../import-export-response";
import {
  mapAndValidateImportRows,
  normalizeImportMapping,
} from "./import-input";

export interface UpdateImportMappingCommand {
  readonly mapping: unknown;
}

@Injectable()
export class UpdateImportMappingUseCase {
  constructor(
    @Inject(IMPORT_EXPORT_REPOSITORY)
    private readonly importExportRepository: ImportExportRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    importJobId: string,
    command: UpdateImportMappingCommand
  ) {
    const detail = await this.importExportRepository.getJobDetail(
      currentUser.id,
      importJobId
    );

    if (!detail) {
      throw new ImportJobNotFoundError();
    }

    const sourceColumns = detail.job.resultSummary?.sourceColumns ?? [];

    if (sourceColumns.length === 0) {
      throw new ValidationError("Import source columns are missing");
    }

    const mapping = normalizeImportMapping(
      detail.job.targetType,
      sourceColumns,
      command.mapping
    );
    const rowUpdates = mapAndValidateImportRows(
      detail.job.targetType,
      mapping,
      detail.rows
    );
    const hasInvalidRows = rowUpdates.some(
      (row) => row.status === "VALIDATION_FAILED"
    );
    const updated = await this.importExportRepository.updateMapping({
      userId: currentUser.id,
      importJobId: detail.job.id,
      mapping,
      status: hasInvalidRows ? "VALIDATION_FAILED" : "MAPPING_READY",
      rows: rowUpdates,
    });

    return toImportJobResponse(updated);
  }
}
