import {
  AiJobStatus,
  AiJobType,
  DealLikelihoodStatus,
  DealStage,
  FileStorageProvider,
  ImportJobStatus as PrismaImportJobStatus,
  ImportRowStatus as PrismaImportRowStatus,
  NextActionStatus,
  Prisma,
  type ImportJob,
  type ImportJobRow,
} from "@prisma/client";
import type { ImportTargetType } from "@/modules/import-export/application/import-target-fields";
import {
  type CompleteImportAiMappingInput,
  type ConfirmImportJobInput,
  type CreateImportAiJobInput,
  type CreateImportJobInput,
  type FailImportAiMappingInput,
  type ImportErrorRecord,
  type ImportExportRepository,
  type ImportFieldValue,
  type ImportJobDetailRecord,
  type ImportJobRecord,
  type ImportJobResultRecord,
  type ImportJobRowRecord,
  type ImportMappedRowData,
  type ImportRawRowData,
  type ImportResultSummary,
  type UpdateImportMappingInput,
} from "@/modules/import-export/application/ports/import-export.repository";
import type {
  ImportMapping,
  ImportMappingSuggestion,
} from "@/modules/import-export/application/ports/import-mapping.port";
import {
  ImportExecutionFailedError,
  ImportJobNotFoundError,
  ImportMappingRequiredError,
  ImportValidationFailedError,
} from "@/modules/import-export/domain/import-export.errors";
import type { StoredObject } from "@/shared/application/ports/storage.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type ImportPrismaClient = PrismaService | Prisma.TransactionClient;

const DEFAULT_CURRENCY = "KRW";

export class PrismaImportExportRepository implements ImportExportRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createJob(input: CreateImportJobInput): Promise<ImportJobDetailRecord> {
    const job = await this.prismaService.$transaction(async (transaction) => {
      const created = await transaction.importJob.create({
        data: {
          userId: input.userId,
          targetType: input.targetType,
          fileName: input.fileName,
          fileStorageProvider: FileStorageProvider.SUPABASE_STORAGE,
          fileBucket: input.file.bucket,
          fileObjectKey: input.file.objectKey,
          fileContentType: input.file.contentType,
          fileSizeBytes: input.file.sizeBytes,
          status: PrismaImportJobStatus.PREVIEW_READY,
          resultSummary: toJsonObject({
            sourceColumns: input.sourceColumns,
            successCount: 0,
            failedCount: 0,
            errors: [],
          }),
        },
      });

      await transaction.importJobRow.createMany({
        data: input.rows.map((row) => ({
          importJobId: created.id,
          rowNumber: row.rowNumber,
          rawData: toJsonObject(row.rawData),
          status: PrismaImportRowStatus.PENDING,
        })),
      });

      return this.findJobDetailOrThrow(transaction, input.userId, created.id);
    });

    return this.mapJobDetail(job);
  }

  async getJobDetail(
    userId: string,
    importJobId: string
  ): Promise<ImportJobDetailRecord | null> {
    const job = await this.prismaService.importJob.findFirst({
      where: { id: importJobId, userId },
      include: { rows: { orderBy: { rowNumber: "asc" } } },
    });

    return job ? this.mapJobDetail(job) : null;
  }

  async createAiJob(
    input: CreateImportAiJobInput
  ): Promise<{ readonly id: string }> {
    const aiJob = await this.prismaService.$transaction(async (transaction) => {
      await transaction.importJob.updateMany({
        where: { id: input.importJobId, userId: input.userId },
        data: { status: PrismaImportJobStatus.MAPPING_PENDING },
      });

      return transaction.aiJob.create({
        data: {
          userId: input.userId,
          type: AiJobType.IMPORT_COLUMN_MAPPING,
          status: AiJobStatus.PROCESSING,
          targetType: "ImportJob",
          targetId: input.importJobId,
          startedAt: new Date(),
          inputSummary: toJsonObject({
            targetType: input.targetType,
            sourceColumns: input.sourceColumns,
            rowCount: input.rowCount,
          }),
        },
      });
    });

    return { id: aiJob.id };
  }

  async completeAiMapping(input: CompleteImportAiMappingInput): Promise<void> {
    await this.prismaService.$transaction(async (transaction) => {
      await transaction.aiJob.updateMany({
        where: { id: input.aiJobId, userId: input.userId },
        data: {
          status: AiJobStatus.COMPLETED,
          output: toJsonObject(input.suggestion),
          completedAt: new Date(),
        },
      });
      await transaction.importJob.updateMany({
        where: { id: input.importJobId, userId: input.userId },
        data: {
          aiMapping: toJsonObject(input.suggestion),
          status: PrismaImportJobStatus.MAPPING_READY,
        },
      });
    });
  }

  async failAiMapping(input: FailImportAiMappingInput): Promise<void> {
    await this.prismaService.$transaction(async (transaction) => {
      await transaction.aiJob.updateMany({
        where: { id: input.aiJobId, userId: input.userId },
        data: {
          status: AiJobStatus.FAILED,
          errorMessage: input.errorMessage,
          completedAt: new Date(),
        },
      });
      await transaction.importJob.updateMany({
        where: { id: input.importJobId, userId: input.userId },
        data: { status: PrismaImportJobStatus.PREVIEW_READY },
      });
    });
  }

  async updateMapping(
    input: UpdateImportMappingInput
  ): Promise<ImportJobDetailRecord> {
    const job = await this.prismaService.$transaction(async (transaction) => {
      const existing = await transaction.importJob.findFirst({
        where: { id: input.importJobId, userId: input.userId },
      });

      if (!existing) {
        throw new ImportJobNotFoundError();
      }

      await transaction.importJob.update({
        where: { id: existing.id },
        data: {
          userMapping: toJsonObject(input.mapping),
          status: input.status,
        },
      });

      for (const row of input.rows) {
        await transaction.importJobRow.update({
          where: { id: row.rowId },
          data: {
            mappedData: toJsonObject(row.mappedData),
            status: row.status,
            errorMessage: row.errorMessage,
            targetId: null,
          },
        });
      }

      return this.findJobDetailOrThrow(transaction, input.userId, input.importJobId);
    });

    return this.mapJobDetail(job);
  }

  async confirmJob(input: ConfirmImportJobInput): Promise<ImportJobResultRecord> {
    const detail = await this.getJobDetail(input.userId, input.importJobId);

    if (!detail) {
      throw new ImportJobNotFoundError();
    }

    this.assertConfirmable(detail);

    await this.prismaService.importJob.update({
      where: { id: input.importJobId },
      data: { status: PrismaImportJobStatus.PROCESSING },
    });

    try {
      return await this.executeImportTransaction(input, detail.job.targetType);
    } catch (error) {
      const errors =
        error instanceof ImportExecutionRollbackMarker
          ? error.errors
          : [
              {
                rowNumber: null,
                message: error instanceof Error ? error.message : "Import failed",
              },
            ];

      await this.markExecutionFailed(input, errors);
      throw new ImportExecutionFailedError(formatExecutionErrors(errors));
    }
  }

  private assertConfirmable(detail: ImportJobDetailRecord): void {
    if (!detail.job.userMapping) {
      throw new ImportMappingRequiredError();
    }

    const invalidRow = detail.rows.find((row) =>
      ["PENDING", "VALIDATION_FAILED", "FAILED"].includes(row.status)
    );

    if (invalidRow) {
      throw new ImportValidationFailedError(
        invalidRow.errorMessage ??
          `Import row ${invalidRow.rowNumber} is not ready to import`
      );
    }

    if (detail.rows.length === 0) {
      throw new ImportValidationFailedError("Import has no rows");
    }
  }

  private async executeImportTransaction(
    input: ConfirmImportJobInput,
    targetType: ImportTargetType
  ): Promise<ImportJobResultRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const rows = await transaction.importJobRow.findMany({
        where: {
          importJobId: input.importJobId,
          status: PrismaImportRowStatus.VALID,
        },
        orderBy: { rowNumber: "asc" },
      });
      const importedRows: { readonly rowId: string; readonly targetId: string }[] =
        [];

      for (const row of rows) {
        try {
          const targetId = await this.createTargetRecord(
            transaction,
            targetType,
            input.userId,
            readMappedRowData(row.mappedData) ?? {}
          );

          importedRows.push({ rowId: row.id, targetId });
        } catch (error) {
          throw new ImportExecutionRollbackMarker([
            {
              rowNumber: row.rowNumber,
              message:
                error instanceof Error ? error.message : "Row import failed",
            },
          ]);
        }
      }

      for (const importedRow of importedRows) {
        await transaction.importJobRow.update({
          where: { id: importedRow.rowId },
          data: {
            status: PrismaImportRowStatus.IMPORTED,
            targetId: importedRow.targetId,
            errorMessage: null,
          },
        });
      }

      const result: ImportJobResultRecord = {
        id: input.importJobId,
        status: "COMPLETED",
        successCount: importedRows.length,
        failedCount: 0,
        errors: [],
      };

      await transaction.importJob.update({
        where: { id: input.importJobId },
        data: {
          status: PrismaImportJobStatus.COMPLETED,
          completedAt: new Date(),
          resultSummary: toJsonObject({
            successCount: result.successCount,
            failedCount: result.failedCount,
            errors: result.errors,
          }),
        },
      });

      return result;
    });
  }

  private async markExecutionFailed(
    input: ConfirmImportJobInput,
    errors: readonly ImportErrorRecord[]
  ): Promise<void> {
    await this.prismaService.$transaction(async (transaction) => {
      await transaction.importJob.update({
        where: { id: input.importJobId },
        data: {
          status: PrismaImportJobStatus.FAILED,
          completedAt: new Date(),
          resultSummary: toJsonObject({
            successCount: 0,
            failedCount: errors.length,
            errors,
          }),
        },
      });

      for (const error of errors) {
        if (error.rowNumber === null) {
          continue;
        }

        await transaction.importJobRow.updateMany({
          where: {
            importJobId: input.importJobId,
            rowNumber: error.rowNumber,
          },
          data: {
            status: PrismaImportRowStatus.FAILED,
            errorMessage: error.message,
          },
        });
      }
    });
  }

  private async createTargetRecord(
    client: ImportPrismaClient,
    targetType: ImportTargetType,
    userId: string,
    data: ImportMappedRowData
  ): Promise<string> {
    if (targetType === "COMPANY") {
      return this.createCompany(client, userId, data);
    }

    if (targetType === "CONTACT") {
      return this.createContact(client, userId, data);
    }

    if (targetType === "PRODUCT") {
      return this.createProduct(client, userId, data);
    }

    return this.createDeal(client, userId, data);
  }

  private async createCompany(
    client: ImportPrismaClient,
    userId: string,
    data: ImportMappedRowData
  ): Promise<string> {
    const company = await client.company.create({
      data: {
        userId,
        name: readRequiredText(data, "name"),
        industry: readText(data, "industry"),
        location: readText(data, "region"),
        description: readText(data, "description"),
        metadata: toJsonObject({
          address: readText(data, "address"),
          website: readText(data, "website"),
        }),
      },
    });

    return company.id;
  }

  private async createContact(
    client: ImportPrismaClient,
    userId: string,
    data: ImportMappedRowData
  ): Promise<string> {
    const companyId = await this.findOrCreateCompany(
      client,
      userId,
      readText(data, "companyName")
    );
    const contact = await client.contact.create({
      data: {
        userId,
        companyId,
        name: readRequiredText(data, "name"),
        department: readText(data, "department"),
        position: readText(data, "position"),
        phone: readText(data, "phone"),
        email: readText(data, "email"),
        location: readText(data, "address"),
      },
    });

    return contact.id;
  }

  private async createProduct(
    client: ImportPrismaClient,
    userId: string,
    data: ImportMappedRowData
  ): Promise<string> {
    const unitPrice = readNumber(data, "unitPrice");
    const product = await client.product.create({
      data: {
        userId,
        name: readRequiredText(data, "name"),
        category: readText(data, "category"),
        description: readText(data, "description"),
        unitPrice: unitPrice === null ? null : new Prisma.Decimal(unitPrice),
        metadata: toJsonObject({
          currency: readText(data, "currency") ?? DEFAULT_CURRENCY,
        }),
      },
    });

    return product.id;
  }

  private async createDeal(
    client: ImportPrismaClient,
    userId: string,
    data: ImportMappedRowData
  ): Promise<string> {
    const companyId = await this.findOrCreateCompany(
      client,
      userId,
      readText(data, "companyName")
    );
    const contactId = await this.findOrCreateContact(
      client,
      userId,
      readText(data, "contactName"),
      companyId
    );
    const amount = readNumber(data, "amount") ?? 0;
    const nextActionText = readText(data, "nextActionText");
    const nextActionDueAt = readDate(data, "nextActionDueAt");
    const deal = await client.deal.create({
      data: {
        userId,
        companyId,
        contactId,
        title: readRequiredText(data, "title"),
        amount: new Prisma.Decimal(amount),
        currency: readText(data, "currency") ?? DEFAULT_CURRENCY,
        stage: readDealStage(data) ?? DealStage.INITIAL_CONTACT,
        likelihoodStatus:
          readDealLikelihoodStatus(data) ?? DealLikelihoodStatus.NEUTRAL,
        likelihoodPercent: readInteger(data, "likelihoodPercent"),
        expectedCloseDate: readDate(data, "expectedCloseDate"),
        nextActionTitle: nextActionText,
        nextActionDueAt,
        nextActionStatus:
          nextActionText || nextActionDueAt
            ? NextActionStatus.SCHEDULED
            : NextActionStatus.NONE,
      },
    });

    return deal.id;
  }

  private async findOrCreateCompany(
    client: ImportPrismaClient,
    userId: string,
    companyName: string | null
  ): Promise<string | null> {
    if (!companyName) {
      return null;
    }

    const existing = await client.company.findFirst({
      where: {
        userId,
        deletedAt: null,
        name: { equals: companyName, mode: "insensitive" },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      return existing.id;
    }

    const company = await client.company.create({
      data: {
        userId,
        name: companyName,
      },
    });

    return company.id;
  }

  private async findOrCreateContact(
    client: ImportPrismaClient,
    userId: string,
    contactName: string | null,
    companyId: string | null
  ): Promise<string | null> {
    if (!contactName) {
      return null;
    }

    const existing = await client.contact.findFirst({
      where: {
        userId,
        companyId,
        deletedAt: null,
        name: { equals: contactName, mode: "insensitive" },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      return existing.id;
    }

    const contact = await client.contact.create({
      data: {
        userId,
        companyId,
        name: contactName,
      },
    });

    return contact.id;
  }

  private async findJobDetailOrThrow(
    client: ImportPrismaClient,
    userId: string,
    importJobId: string
  ) {
    const job = await client.importJob.findFirst({
      where: { id: importJobId, userId },
      include: { rows: { orderBy: { rowNumber: "asc" } } },
    });

    if (!job) {
      throw new ImportJobNotFoundError();
    }

    return job;
  }

  private mapJobDetail(
    job: ImportJob & { readonly rows: readonly ImportJobRow[] }
  ): ImportJobDetailRecord {
    return {
      job: this.mapJobRecord(job),
      rows: job.rows.map((row) => this.mapRowRecord(row)),
    };
  }

  private mapJobRecord(job: ImportJob): ImportJobRecord {
    return {
      id: job.id,
      userId: job.userId,
      targetType: job.targetType,
      fileName: job.fileName,
      file: toStoredObject(job),
      status: job.status,
      aiMapping: readMappingSuggestion(job.aiMapping),
      userMapping: readMapping(job.userMapping),
      resultSummary: readResultSummary(job.resultSummary),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
    };
  }

  private mapRowRecord(row: ImportJobRow): ImportJobRowRecord {
    return {
      id: row.id,
      importJobId: row.importJobId,
      rowNumber: row.rowNumber,
      rawData: readRawRowData(row.rawData),
      mappedData: readMappedRowData(row.mappedData),
      status: row.status,
      errorMessage: row.errorMessage,
      targetId: row.targetId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

class ImportExecutionRollbackMarker extends Error {
  constructor(readonly errors: readonly ImportErrorRecord[]) {
    super("Import transaction was rolled back");
  }
}

function readRequiredText(data: ImportMappedRowData, field: string): string {
  const value = readText(data, field);

  if (!value) {
    throw new Error(`${field} is required`);
  }

  return value;
}

function readText(data: ImportMappedRowData, field: string): string | null {
  const value = data[field];

  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function readNumber(data: ImportMappedRowData, field: string): number | null {
  const value = data[field];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readInteger(data: ImportMappedRowData, field: string): number | null {
  const value = readNumber(data, field);

  return value === null ? null : Math.trunc(value);
}

function readDate(data: ImportMappedRowData, field: string): Date | null {
  const value = readText(data, field);

  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function readDealStage(data: ImportMappedRowData): DealStage | null {
  const value = readText(data, "stage");

  if (!value) {
    return null;
  }

  return Object.values(DealStage).includes(value as DealStage)
    ? (value as DealStage)
    : null;
}

function readDealLikelihoodStatus(
  data: ImportMappedRowData
): DealLikelihoodStatus | null {
  const value = readText(data, "likelihoodStatus");

  if (!value) {
    return null;
  }

  return Object.values(DealLikelihoodStatus).includes(
    value as DealLikelihoodStatus
  )
    ? (value as DealLikelihoodStatus)
    : null;
}

function toStoredObject(job: ImportJob): StoredObject | null {
  if (!job.fileBucket || !job.fileObjectKey) {
    return null;
  }

  return {
    storageProvider: "supabase",
    bucket: job.fileBucket,
    objectKey: job.fileObjectKey,
    contentType: job.fileContentType,
    sizeBytes: job.fileSizeBytes,
    fileName: job.fileName,
  };
}

function readRawRowData(value: Prisma.JsonValue): ImportRawRowData {
  const object = readJsonObject(value) ?? {};

  return Object.fromEntries(
    Object.entries(object).map(([key, item]) => [key, jsonValueToText(item)])
  );
}

function readMappedRowData(
  value: Prisma.JsonValue | null
): ImportMappedRowData | null {
  const object = readJsonObject(value);

  if (!object) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(object).map(([key, item]) => [
      key,
      jsonValueToImportFieldValue(item),
    ])
  );
}

function readMapping(value: Prisma.JsonValue | null): ImportMapping | null {
  const object = readJsonObject(value);

  if (!object) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(object).map(([key, item]) => [
      key,
      typeof item === "string" ? item : null,
    ])
  );
}

function readMappingSuggestion(
  value: Prisma.JsonValue | null
): ImportMappingSuggestion | null {
  const object = readJsonObject(value);

  if (!object) {
    return null;
  }

  const confidence =
    typeof object.confidence === "number" ? object.confidence : 0;

  return {
    suggestedMapping: readMapping(object.suggestedMapping) ?? {},
    confidence,
    unmappedColumns: readStringArray(object.unmappedColumns),
  };
}

function readResultSummary(
  value: Prisma.JsonValue | null
): ImportResultSummary | null {
  const object = readJsonObject(value);

  if (!object) {
    return null;
  }

  return {
    sourceColumns: readStringArray(object.sourceColumns),
    successCount:
      typeof object.successCount === "number" ? object.successCount : undefined,
    failedCount:
      typeof object.failedCount === "number" ? object.failedCount : undefined,
    errors: readImportErrors(object.errors),
  };
}

function readImportErrors(value: unknown): ImportErrorRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const object = readUnknownObject(item);

      if (!object) {
        return null;
      }

      return {
        rowNumber:
          typeof object.rowNumber === "number" ? object.rowNumber : null,
        message:
          typeof object.message === "string" ? object.message : "Import failed",
      };
    })
    .filter((item): item is ImportErrorRecord => item !== null);
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item : ""))
    .filter(Boolean);
}

function readJsonObject(
  value: Prisma.JsonValue | null
): Record<string, Prisma.JsonValue> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, Prisma.JsonValue>;
}

function readUnknownObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function jsonValueToText(value: Prisma.JsonValue): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function jsonValueToImportFieldValue(value: Prisma.JsonValue): ImportFieldValue {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return null;
}

function toJsonObject(value: unknown): Prisma.InputJsonObject {
  return value as Prisma.InputJsonObject;
}

function formatExecutionErrors(errors: readonly ImportErrorRecord[]): string {
  return errors
    .map((error) =>
      error.rowNumber === null
        ? error.message
        : `row ${error.rowNumber}: ${error.message}`
    )
    .join("; ");
}
