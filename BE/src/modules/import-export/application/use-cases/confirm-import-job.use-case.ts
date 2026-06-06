import { Inject, Injectable } from "@nestjs/common";
import {
  IMPORT_EXPORT_REPOSITORY,
  type ImportExportRepository,
} from "@/modules/import-export/application/ports/import-export.repository";
import { ValidationError } from "@/modules/import-export/domain/import-export.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toImportJobResultResponse } from "../import-export-response";

export interface ConfirmImportJobCommand {
  readonly confirm: boolean;
}

@Injectable()
export class ConfirmImportJobUseCase {
  constructor(
    @Inject(IMPORT_EXPORT_REPOSITORY)
    private readonly importExportRepository: ImportExportRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    importJobId: string,
    command: ConfirmImportJobCommand
  ) {
    if (command.confirm !== true) {
      throw new ValidationError("confirm must be true");
    }

    const result = await this.importExportRepository.confirmJob({
      userId: currentUser.id,
      importJobId,
    });

    return toImportJobResultResponse(result);
  }
}
