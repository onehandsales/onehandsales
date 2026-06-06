import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { Inject, Injectable } from "@nestjs/common";
import {
  IMPORT_EXPORT_REPOSITORY,
  type ImportExportRepository,
} from "@/modules/import-export/application/ports/import-export.repository";
import {
  IMPORT_FILE_PARSER_PORT,
  type ImportFileParserPort,
} from "@/modules/import-export/application/ports/import-file-parser.port";
import { FileStorageUnavailableError } from "@/modules/import-export/domain/import-export.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  STORAGE_PORT,
  type StoragePort,
} from "@/shared/application/ports/storage.port";
import { toImportJobResponse } from "../import-export-response";
import {
  assertImportRowCount,
  normalizeImportTargetType,
  validateImportFile,
  type UploadedImportFile,
} from "./import-input";

export interface CreateImportJobCommand {
  readonly targetType: string;
  readonly file: UploadedImportFile | undefined;
}

@Injectable()
export class CreateImportJobUseCase {
  constructor(
    @Inject(IMPORT_EXPORT_REPOSITORY)
    private readonly importExportRepository: ImportExportRepository,
    @Inject(IMPORT_FILE_PARSER_PORT)
    private readonly importFileParserPort: ImportFileParserPort,
    @Inject(STORAGE_PORT)
    private readonly storagePort: StoragePort,
    private readonly bucketName: string
  ) {}

  async execute(currentUser: CurrentUserContext, command: CreateImportJobCommand) {
    const targetType = normalizeImportTargetType(command.targetType);
    const importFile = validateImportFile(command.file);
    const parsed = await this.importFileParserPort.parse({
      targetType,
      fileName: importFile.originalname,
      contentType: importFile.mimetype,
      buffer: importFile.buffer,
    });

    assertImportRowCount(parsed.rows.length);

    const uploaded = await this.uploadFile(
      importFile,
      createImportObjectKey(currentUser.id, importFile.originalname)
    );
    const job = await this.importExportRepository.createJob({
      userId: currentUser.id,
      targetType,
      fileName: importFile.originalname,
      file: uploaded,
      sourceColumns: parsed.sourceColumns,
      rows: parsed.rows.map((row) => ({
        rowNumber: row.rowNumber,
        rawData: row.rawData,
      })),
    });

    return toImportJobResponse(job);
  }

  private async uploadFile(file: UploadedImportFile, objectKey: string) {
    try {
      return await this.storagePort.uploadObject({
        bucket: this.bucketName,
        objectKey,
        body: file.buffer,
        contentType: file.mimetype,
        fileName: file.originalname,
      });
    } catch (error) {
      throw new FileStorageUnavailableError(
        error instanceof Error ? error.message : "Import file upload failed"
      );
    }
  }
}

function createImportObjectKey(userId: string, fileName: string): string {
  const extension = extname(fileName).toLowerCase().replace(".", "") || "csv";

  return `imports/${userId}/${randomUUID()}.${extension}`;
}
