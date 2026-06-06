import { Inject, Injectable } from "@nestjs/common";
import {
  IMPORT_EXPORT_REPOSITORY,
  type ImportExportRepository,
} from "@/modules/import-export/application/ports/import-export.repository";
import { ImportJobNotFoundError } from "@/modules/import-export/domain/import-export.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toImportJobDetailResponse } from "../import-export-response";

@Injectable()
export class GetImportJobUseCase {
  constructor(
    @Inject(IMPORT_EXPORT_REPOSITORY)
    private readonly importExportRepository: ImportExportRepository
  ) {}

  async execute(currentUser: CurrentUserContext, importJobId: string) {
    const detail = await this.importExportRepository.getJobDetail(
      currentUser.id,
      importJobId
    );

    if (!detail) {
      throw new ImportJobNotFoundError();
    }

    return toImportJobDetailResponse(detail);
  }
}
