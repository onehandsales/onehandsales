import { Prisma } from "@prisma/client";
import type {
  CreateImportJobErrorInput,
  CreateImportJobErrorForUserInput,
  CreateImportJobInput,
  CreateImportJobRowsInput,
  CreateImportUploadedFileInput,
  CreateImportUploadedFileForUserInput,
  ExpireImportJobsForUserInput,
  FindImportJobForUserInput,
  ImportJobDetailRecord,
  ImportJobErrorRecord,
  ImportJobErrorRepository,
  ImportJobRecord,
  ImportJobRepository,
  ImportJobRepositoryContext,
  ImportJobRowRecord,
  ImportJobRowRepository,
  ImportUploadedFileRecord,
  ImportUploadedFileRepository,
  ListActiveImportJobsForUserInput,
  ListExpiredImportJobsForUserInput,
  ListImportJobErrorsPageForUserInput,
  ListImportJobRowsForUserInput,
  PersistentImportJobStatus,
  UpdateImportJobStatusForUserInput,
  UpdateImportJobRowsForUserInput,
  UpdateImportUploadedFileStatusForUserInput,
} from "@/modules/data-import/application/ports/import-job.repository";
import { ImportJobNotFoundError } from "@/modules/data-import/domain/import-template.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type ImportJobPrismaClient = PrismaService | Prisma.TransactionClient;

type ImportJobScalarRow = Omit<ImportJobRecord, "contextJson"> & {
  readonly contextJson: unknown;
};

type ImportJobRowScalarRow = Omit<
  ImportJobRowRecord,
  "normalizedDataJson"
> & {
  readonly normalizedDataJson: unknown;
};

type ImportJobErrorScalarRow = Omit<ImportJobErrorRecord, "detailJson"> & {
  readonly detailJson: unknown;
};

type ImportUploadedFileScalarRow = ImportUploadedFileRecord;

type ImportJobDetailRow = ImportJobScalarRow & {
  readonly rows: readonly ImportJobRowScalarRow[];
  readonly errors: readonly ImportJobErrorScalarRow[];
  readonly uploadedFile: ImportUploadedFileScalarRow | null;
};

const ACTIVE_IMPORT_JOB_STATUSES: readonly PersistentImportJobStatus[] = [
  "UPLOADED",
  "MAPPED",
  "NEEDS_REVIEW",
  "READY_TO_CONFIRM",
  "CONFIRMING",
];

// 역할 : ImportJob DB persistence repository 계약을 Prisma 기반으로 구현합니다.
export class PrismaImportJobRepository
  implements
    ImportJobRepository,
    ImportJobRowRepository,
    ImportJobErrorRepository,
    ImportUploadedFileRepository
{
  constructor(
    private readonly client: ImportJobPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  async runInTransaction<T>(
    work: (repositories: ImportJobRepositoryContext) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaImportJobRepository(transaction, null));
    });
  }

  async createJob(input: CreateImportJobInput): Promise<ImportJobDetailRecord> {
    const job = await this.client.importJob.create({
      data: {
        ...(input.id ? { id: input.id } : {}),
        user: { connect: { id: input.userId } },
        template: { connect: { id: input.templateId } },
        targetType: input.targetType,
        templateVersion: input.templateVersion,
        templateColumnsJson: this.toInputJson(input.templateColumnsJson),
        sourceColumnsJson: this.toInputJson(input.sourceColumnsJson),
        status: input.status ?? "UPLOADED",
        mappingJson: this.toInputJson(input.mappingJson ?? {}),
        mappingSource: input.mappingSource ?? "NONE",
        contextLabel: input.contextLabel ?? null,
        contextJson: this.toNullableInputJson(input.contextJson),
        originalFileName: input.originalFileName,
        fileSizeBytes: input.fileSizeBytes,
        totalRowCount: input.totalRowCount,
        validRowCount: input.validRowCount ?? 0,
        invalidRowCount: input.invalidRowCount ?? 0,
        importedRowCount: input.importedRowCount ?? 0,
        failedRowCount: input.failedRowCount ?? 0,
        expiresAt: input.expiresAt,
        ...(input.rows && input.rows.length > 0
          ? {
              rows: {
                create: input.rows.map((row) =>
                  this.createNestedRowData(input.userId, row)
                ),
              },
            }
          : {}),
        ...(input.uploadedFile
          ? {
              uploadedFile: {
                create: this.createNestedUploadedFileData(
                  input.userId,
                  input.uploadedFile
                ),
              },
            }
          : {}),
        ...(input.errors && input.errors.length > 0
          ? {
              errors: {
                create: input.errors.map((error) =>
                  this.createNestedErrorData(input.userId, error)
                ),
              },
            }
          : {}),
      },
      include: this.createDetailInclude(),
    });

    return this.mapJobDetail(job);
  }

  async findJobByIdForUser(
    input: FindImportJobForUserInput
  ): Promise<ImportJobDetailRecord | null> {
    const job = await this.client.importJob.findFirst({
      where: {
        id: input.importJobId,
        userId: input.userId,
      },
      include: this.createDetailInclude(),
    });

    return job ? this.mapJobDetail(job) : null;
  }

  async listActiveJobsForUser(
    input: ListActiveImportJobsForUserInput
  ): Promise<ImportJobRecord[]> {
    const jobs = await this.client.importJob.findMany({
      where: {
        userId: input.userId,
        status: { in: [...ACTIVE_IMPORT_JOB_STATUSES] },
        expiresAt: { gt: input.now },
        ...(input.targetType ? { targetType: input.targetType } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit ?? 5,
    });

    return jobs.map((job) => this.mapJob(job));
  }

  async listExpiredActiveJobsForUser(
    input: ListExpiredImportJobsForUserInput
  ): Promise<ImportJobDetailRecord[]> {
    const jobs = await this.client.importJob.findMany({
      where: {
        userId: input.userId,
        ...(input.importJobId ? { id: input.importJobId } : {}),
        status: { in: [...ACTIVE_IMPORT_JOB_STATUSES] },
        expiresAt: { lte: input.now },
      },
      include: this.createDetailInclude(),
      orderBy: [{ expiresAt: "asc" }, { id: "asc" }],
      take: input.limit ?? 100,
    });

    return jobs.map((job) => this.mapJobDetail(job));
  }

  async updateJobStatusForUser(
    input: UpdateImportJobStatusForUserInput
  ): Promise<boolean> {
    const updated = await this.client.importJob.updateMany({
      where: {
        id: input.importJobId,
        userId: input.userId,
        ...(input.expectedStatus ? { status: input.expectedStatus } : {}),
      },
      data: this.createJobStatusUpdateData(input),
    });

    return updated.count > 0;
  }

  async expireJobsForUser(input: ExpireImportJobsForUserInput): Promise<number> {
    const updated = await this.client.importJob.updateMany({
      where: {
        userId: input.userId,
        ...(input.importJobId ? { id: input.importJobId } : {}),
        status: { in: [...ACTIVE_IMPORT_JOB_STATUSES] },
        expiresAt: { lte: input.now },
      },
      data: {
        status: "EXPIRED",
      },
    });

    return updated.count;
  }

  async createRows(input: CreateImportJobRowsInput): Promise<void> {
    if (input.rows.length === 0) {
      return;
    }

    await this.ensureOwnedJob(input);

    await this.client.importJobRow.createMany({
      data: input.rows.map((row) => ({
        importJobId: input.importJobId,
        userId: input.userId,
        rowNumber: row.rowNumber,
        rawDataJson: this.toInputJson(row.rawDataJson),
        mappedDataJson: this.toInputJson(row.mappedDataJson ?? {}),
        normalizedDataJson: this.toNullableInputJson(row.normalizedDataJson),
        status: row.status ?? "PENDING",
        validationErrorsJson: this.toInputJson(row.validationErrorsJson ?? []),
        targetLabel: row.targetLabel ?? null,
      })),
    });
  }

  async listRowsForJob(
    input: ListImportJobRowsForUserInput
  ): Promise<ImportJobRowRecord[]> {
    const rows = await this.client.importJobRow.findMany({
      where: {
        importJobId: input.importJobId,
        userId: input.userId,
      },
      orderBy: [{ rowNumber: "asc" }, { id: "asc" }],
    });

    return rows.map((row) => this.mapRow(row));
  }

  async updateRowsForJob(
    input: UpdateImportJobRowsForUserInput
  ): Promise<boolean> {
    if (input.rows.length === 0) {
      return true;
    }

    await this.ensureOwnedJob(input);

    let updatedCount = 0;

    for (const row of input.rows) {
      const updated = await this.client.importJobRow.updateMany({
        where: {
          id: row.rowId,
          importJobId: input.importJobId,
          userId: input.userId,
        },
        data: this.createRowUpdateData(row),
      });
      updatedCount += updated.count;
    }

    return updatedCount === input.rows.length;
  }

  async createError(
    input: CreateImportJobErrorForUserInput
  ): Promise<ImportJobErrorRecord> {
    await this.ensureOwnedJob(input);
    await this.ensureOwnedRowReference(input);

    const error = await this.client.importJobError.create({
      data: {
        importJob: { connect: { id: input.importJobId } },
        ...(input.importJobRowId
          ? { importJobRow: { connect: { id: input.importJobRowId } } }
          : {}),
        user: { connect: { id: input.userId } },
        errorType: input.errorType,
        errorCode: input.errorCode,
        severity: input.severity ?? "ERROR",
        rowNumber: input.rowNumber ?? null,
        fieldKey: input.fieldKey ?? null,
        safeMessage: input.safeMessage,
        detailJson: this.toNullableInputJson(input.detailJson),
        retryable: input.retryable ?? false,
      },
    });

    return this.mapError(error);
  }

  async listErrorsForJob(
    input: ListImportJobErrorsPageForUserInput
  ): Promise<ImportJobErrorRecord[]> {
    const errors = await this.client.importJobError.findMany({
      where: {
        importJobId: input.importJobId,
        userId: input.userId,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit ?? 50,
    });

    return errors.map((error) => this.mapError(error));
  }

  async createUploadedFile(
    input: CreateImportUploadedFileForUserInput
  ): Promise<ImportUploadedFileRecord> {
    await this.ensureOwnedJob(input);

    const uploadedFile = await this.client.importUploadedFile.create({
      data: {
        importJob: { connect: { id: input.importJobId } },
        user: { connect: { id: input.userId } },
        originalFileName: input.originalFileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        checksum: input.checksum,
        storageProvider: input.storageProvider,
        storageBucket: input.storageBucket ?? null,
        storageKey: input.storageKey,
        status: input.status ?? "STORED",
        uploadedAt: input.uploadedAt ?? new Date(),
        deletedAt: input.deletedAt ?? null,
        expiresAt: input.expiresAt,
      },
    });

    return this.mapUploadedFile(uploadedFile);
  }

  async findUploadedFileForJob(
    input: FindImportJobForUserInput
  ): Promise<ImportUploadedFileRecord | null> {
    const uploadedFile = await this.client.importUploadedFile.findFirst({
      where: {
        importJobId: input.importJobId,
        userId: input.userId,
      },
    });

    return uploadedFile ? this.mapUploadedFile(uploadedFile) : null;
  }

  async updateUploadedFileStatusForUser(
    input: UpdateImportUploadedFileStatusForUserInput
  ): Promise<boolean> {
    const updated = await this.client.importUploadedFile.updateMany({
      where: {
        importJobId: input.importJobId,
        userId: input.userId,
      },
      data: {
        status: input.status,
        ...(input.deletedAt !== undefined ? { deletedAt: input.deletedAt } : {}),
      },
    });

    return updated.count > 0;
  }

  private createDetailInclude(): Prisma.ImportJobInclude {
    return {
      rows: {
        orderBy: [{ rowNumber: "asc" }, { id: "asc" }],
      },
      errors: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      },
      uploadedFile: true,
    };
  }

  private createNestedRowData(
    userId: string,
    row: CreateImportJobRowsInput["rows"][number]
  ): Prisma.ImportJobRowCreateWithoutImportJobInput {
    return {
      user: { connect: { id: userId } },
      rowNumber: row.rowNumber,
      rawDataJson: this.toInputJson(row.rawDataJson),
      mappedDataJson: this.toInputJson(row.mappedDataJson ?? {}),
      normalizedDataJson: this.toNullableInputJson(row.normalizedDataJson),
      status: row.status ?? "PENDING",
      validationErrorsJson: this.toInputJson(row.validationErrorsJson ?? []),
      targetLabel: row.targetLabel ?? null,
    };
  }

  private createNestedUploadedFileData(
    userId: string,
    uploadedFile: CreateImportUploadedFileInput
  ): Prisma.ImportUploadedFileCreateWithoutImportJobInput {
    return {
      user: { connect: { id: userId } },
      originalFileName: uploadedFile.originalFileName,
      mimeType: uploadedFile.mimeType,
      fileSizeBytes: uploadedFile.fileSizeBytes,
      checksum: uploadedFile.checksum,
      storageProvider: uploadedFile.storageProvider,
      storageBucket: uploadedFile.storageBucket ?? null,
      storageKey: uploadedFile.storageKey,
      status: uploadedFile.status ?? "STORED",
      uploadedAt: uploadedFile.uploadedAt ?? new Date(),
      deletedAt: uploadedFile.deletedAt ?? null,
      expiresAt: uploadedFile.expiresAt,
    };
  }

  private createNestedErrorData(
    userId: string,
    error: CreateImportJobErrorInput
  ): Prisma.ImportJobErrorCreateWithoutImportJobInput {
    return {
      ...(error.importJobRowId
        ? { importJobRow: { connect: { id: error.importJobRowId } } }
        : {}),
      user: { connect: { id: userId } },
      errorType: error.errorType,
      errorCode: error.errorCode,
      severity: error.severity ?? "ERROR",
      rowNumber: error.rowNumber ?? null,
      fieldKey: error.fieldKey ?? null,
      safeMessage: error.safeMessage,
      detailJson: this.toNullableInputJson(error.detailJson),
      retryable: error.retryable ?? false,
    };
  }

  private createJobStatusUpdateData(
    input: UpdateImportJobStatusForUserInput
  ): Prisma.ImportJobUpdateManyMutationInput {
    return {
      status: input.status,
      ...(input.mappingJson !== undefined
        ? { mappingJson: this.toInputJson(input.mappingJson) }
        : {}),
      ...(input.mappingSource !== undefined
        ? { mappingSource: input.mappingSource }
        : {}),
      ...(input.validRowCount !== undefined
        ? { validRowCount: input.validRowCount }
        : {}),
      ...(input.invalidRowCount !== undefined
        ? { invalidRowCount: input.invalidRowCount }
        : {}),
      ...(input.importedRowCount !== undefined
        ? { importedRowCount: input.importedRowCount }
        : {}),
      ...(input.failedRowCount !== undefined
        ? { failedRowCount: input.failedRowCount }
        : {}),
      ...(input.importUserLogId !== undefined
        ? { importUserLogId: input.importUserLogId }
        : {}),
      ...(input.confirmedAt !== undefined
        ? { confirmedAt: input.confirmedAt }
        : {}),
      ...(input.canceledAt !== undefined
        ? { canceledAt: input.canceledAt }
        : {}),
      ...(input.failedAt !== undefined ? { failedAt: input.failedAt } : {}),
      ...(input.lastErrorCode !== undefined
        ? { lastErrorCode: input.lastErrorCode }
        : {}),
      ...(input.lastErrorMessage !== undefined
        ? { lastErrorMessage: input.lastErrorMessage }
        : {}),
    };
  }

  private createRowUpdateData(
    row: UpdateImportJobRowsForUserInput["rows"][number]
  ): Prisma.ImportJobRowUpdateManyMutationInput {
    return {
      ...(row.mappedDataJson !== undefined
        ? { mappedDataJson: this.toInputJson(row.mappedDataJson) }
        : {}),
      ...(row.normalizedDataJson !== undefined
        ? { normalizedDataJson: this.toNullableInputJson(row.normalizedDataJson) }
        : {}),
      ...(row.status !== undefined ? { status: row.status } : {}),
      ...(row.validationErrorsJson !== undefined
        ? { validationErrorsJson: this.toInputJson(row.validationErrorsJson) }
        : {}),
      ...(row.targetLabel !== undefined ? { targetLabel: row.targetLabel } : {}),
    };
  }

  private async findOwnedJobId(
    input: FindImportJobForUserInput
  ): Promise<{ readonly id: string } | null> {
    return this.client.importJob.findFirst({
      where: {
        id: input.importJobId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    });
  }

  private async ensureOwnedJob(input: FindImportJobForUserInput): Promise<void> {
    const job = await this.findOwnedJobId(input);

    if (!job) {
      throw new ImportJobNotFoundError();
    }
  }

  private async ensureOwnedRowReference(
    input: CreateImportJobErrorForUserInput
  ): Promise<void> {
    if (!input.importJobRowId) {
      return;
    }

    const row = await this.client.importJobRow.findFirst({
      where: {
        id: input.importJobRowId,
        importJobId: input.importJobId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    });

    if (!row) {
      throw new ImportJobNotFoundError();
    }
  }

  private mapJobDetail(row: ImportJobDetailRow): ImportJobDetailRecord {
    return {
      ...this.mapJob(row),
      rows: row.rows.map((item) => this.mapRow(item)),
      errors: row.errors.map((item) => this.mapError(item)),
      uploadedFile: row.uploadedFile
        ? this.mapUploadedFile(row.uploadedFile)
        : null,
    };
  }

  private mapJob(row: ImportJobScalarRow): ImportJobRecord {
    return {
      id: row.id,
      userId: row.userId,
      templateId: row.templateId,
      targetType: row.targetType,
      templateVersion: row.templateVersion,
      templateColumnsJson: row.templateColumnsJson,
      sourceColumnsJson: row.sourceColumnsJson,
      status: row.status,
      mappingJson: row.mappingJson,
      mappingSource: row.mappingSource,
      contextLabel: row.contextLabel,
      contextJson: row.contextJson,
      originalFileName: row.originalFileName,
      fileSizeBytes: row.fileSizeBytes,
      totalRowCount: row.totalRowCount,
      validRowCount: row.validRowCount,
      invalidRowCount: row.invalidRowCount,
      importedRowCount: row.importedRowCount,
      failedRowCount: row.failedRowCount,
      importUserLogId: row.importUserLogId,
      expiresAt: row.expiresAt,
      confirmedAt: row.confirmedAt,
      canceledAt: row.canceledAt,
      failedAt: row.failedAt,
      lastErrorCode: row.lastErrorCode,
      lastErrorMessage: row.lastErrorMessage,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapRow(row: ImportJobRowScalarRow): ImportJobRowRecord {
    return {
      id: row.id,
      importJobId: row.importJobId,
      userId: row.userId,
      rowNumber: row.rowNumber,
      rawDataJson: row.rawDataJson,
      mappedDataJson: row.mappedDataJson,
      normalizedDataJson: row.normalizedDataJson,
      status: row.status,
      validationErrorsJson: row.validationErrorsJson,
      targetLabel: row.targetLabel,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapError(row: ImportJobErrorScalarRow): ImportJobErrorRecord {
    return {
      id: row.id,
      importJobId: row.importJobId,
      importJobRowId: row.importJobRowId,
      userId: row.userId,
      errorType: row.errorType,
      errorCode: row.errorCode,
      severity: row.severity,
      rowNumber: row.rowNumber,
      fieldKey: row.fieldKey,
      safeMessage: row.safeMessage,
      detailJson: row.detailJson,
      retryable: row.retryable,
      createdAt: row.createdAt,
    };
  }

  private mapUploadedFile(
    row: ImportUploadedFileScalarRow
  ): ImportUploadedFileRecord {
    return {
      id: row.id,
      importJobId: row.importJobId,
      userId: row.userId,
      originalFileName: row.originalFileName,
      mimeType: row.mimeType,
      fileSizeBytes: row.fileSizeBytes,
      checksum: row.checksum,
      storageProvider: row.storageProvider,
      storageBucket: row.storageBucket,
      storageKey: row.storageKey,
      status: row.status,
      uploadedAt: row.uploadedAt,
      deletedAt: row.deletedAt,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toInputJson(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }

  private toNullableInputJson(
    value: unknown | null | undefined
  ): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
    return value === null || value === undefined
      ? Prisma.DbNull
      : this.toInputJson(value);
  }
}
