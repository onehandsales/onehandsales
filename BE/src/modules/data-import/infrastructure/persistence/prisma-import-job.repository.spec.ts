import { PrismaImportJobRepository } from "./prisma-import-job.repository";
import { ImportJobNotFoundError } from "@/modules/data-import/domain/import-template.errors";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type MockModel<TRecord> = {
  readonly create: jest.Mock<Promise<TRecord>, [unknown]>;
  readonly createMany: jest.Mock<Promise<{ readonly count: number }>, [unknown]>;
  readonly findFirst: jest.Mock<Promise<TRecord | null>, [unknown]>;
  readonly findMany: jest.Mock<Promise<TRecord[]>, [unknown]>;
  readonly updateMany: jest.Mock<Promise<{ readonly count: number }>, [unknown]>;
};

type MockPrismaClient = {
  readonly importJob: MockModel<ImportJobFixture>;
  readonly importJobRow: MockModel<ImportJobRowFixture>;
  readonly importJobError: MockModel<ImportJobErrorFixture>;
  readonly importUploadedFile: MockModel<ImportUploadedFileFixture>;
};

type ImportJobFixture = {
  readonly id: string;
  readonly userId: string;
  readonly templateId: string;
  readonly targetType: "COMPANY";
  readonly templateVersion: string;
  readonly templateColumnsJson: readonly unknown[];
  readonly sourceColumnsJson: readonly string[];
  readonly status: "UPLOADED";
  readonly mappingJson: Record<string, string | null>;
  readonly mappingSource: "NONE";
  readonly contextLabel: string | null;
  readonly contextJson: unknown;
  readonly originalFileName: string;
  readonly fileSizeBytes: number;
  readonly totalRowCount: number;
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly importedRowCount: number;
  readonly failedRowCount: number;
  readonly importUserLogId: string | null;
  readonly confirmIdempotencyKey: string | null;
  readonly expiresAt: Date;
  readonly confirmedAt: Date | null;
  readonly canceledAt: Date | null;
  readonly failedAt: Date | null;
  readonly lastErrorCode: string | null;
  readonly lastErrorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type ImportJobRowFixture = {
  readonly id: string;
  readonly importJobId: string;
  readonly userId: string;
  readonly rowNumber: number;
  readonly rawDataJson: Record<string, string>;
  readonly mappedDataJson: Record<string, string>;
  readonly normalizedDataJson: Record<string, string> | null;
  readonly status: "PENDING";
  readonly validationErrorsJson: readonly unknown[];
  readonly targetLabel: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type ImportJobErrorFixture = {
  readonly id: string;
  readonly importJobId: string;
  readonly importJobRowId: string | null;
  readonly userId: string;
  readonly errorType: "VALIDATION";
  readonly errorCode: string;
  readonly severity: "ERROR";
  readonly rowNumber: number | null;
  readonly fieldKey: string | null;
  readonly safeMessage: string;
  readonly detailJson: unknown;
  readonly retryable: boolean;
  readonly createdAt: Date;
};

type ImportUploadedFileFixture = {
  readonly id: string;
  readonly importJobId: string;
  readonly userId: string;
  readonly originalFileName: string;
  readonly mimeType: string;
  readonly fileSizeBytes: number;
  readonly checksum: string;
  readonly storageProvider: string;
  readonly storageBucket: string | null;
  readonly storageKey: string;
  readonly status: "STORED";
  readonly uploadedAt: Date;
  readonly deletedAt: Date | null;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

const NOW = new Date("2026-07-21T00:00:00.000Z");
const EXPIRES_AT = new Date("2026-07-28T00:00:00.000Z");

describe("PrismaImportJobRepository", () => {
  it("finds a job by importJobId and userId ownership", async () => {
    const client = createMockClient();
    client.importJob.findFirst.mockResolvedValue(createJobDetailFixture());
    const repository = createRepository(client);

    const job = await repository.findJobByIdForUser({
      userId: "user-1",
      importJobId: "job-1",
    });

    expect(client.importJob.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "job-1",
          userId: "user-1",
        },
        include: expect.objectContaining({
          errors: expect.objectContaining({
            take: 0,
          }),
        }),
      })
    );
    expect(job?.sourceColumnsJson).toEqual(["companyName"]);
    expect(job?.rows[0]?.rowNumber).toBe(2);
    expect(job?.uploadedFile?.storageKey).toBe("imports/job-1/source.xlsx");
  });

  it("limits detail errors when explicitly requested", async () => {
    const client = createMockClient();
    client.importJob.findFirst.mockResolvedValue(createJobDetailFixture());
    const repository = createRepository(client);

    await repository.findJobByIdForUser({
      userId: "user-1",
      importJobId: "job-1",
      includeErrors: true,
      errorLimit: 50,
    });

    expect(client.importJob.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          errors: expect.objectContaining({
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: 50,
          }),
        }),
      })
    );
  });

  it("lists only active non-expired jobs for the current user", async () => {
    const client = createMockClient();
    client.importJob.findMany.mockResolvedValue([createJobFixture()]);
    const repository = createRepository(client);

    await repository.listActiveJobsForUser({
      userId: "user-1",
      targetType: "COMPANY",
      now: NOW,
      limit: 3,
    });

    expect(client.importJob.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        status: {
          in: [
            "UPLOADED",
            "MAPPED",
            "NEEDS_REVIEW",
            "READY_TO_CONFIRM",
            "CONFIRMING",
          ],
        },
        expiresAt: { gt: NOW },
        targetType: "COMPANY",
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 3,
    });
  });

  it("creates a job with source column snapshot, rows, and uploaded file", async () => {
    const client = createMockClient();
    client.importJob.create.mockResolvedValue(createJobDetailFixture());
    const repository = createRepository(client);

    const created = await repository.createJob({
      userId: "user-1",
      templateId: "template-1",
      targetType: "COMPANY",
      templateVersion: "v1",
      templateColumnsJson: [{ key: "companyName" }],
      sourceColumnsJson: ["companyName"],
      originalFileName: "source.xlsx",
      fileSizeBytes: 100,
      totalRowCount: 1,
      expiresAt: EXPIRES_AT,
      rows: [
        {
          rowNumber: 2,
          rawDataJson: { companyName: "Acme" },
        },
      ],
      uploadedFile: {
        originalFileName: "source.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSizeBytes: 100,
        checksum: "checksum-1",
        storageProvider: "LOCAL",
        storageKey: "imports/job-1/source.xlsx",
        expiresAt: EXPIRES_AT,
      },
    });

    expect(client.importJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sourceColumnsJson: ["companyName"],
          rows: {
            create: [
              expect.objectContaining({
                rowNumber: 2,
                rawDataJson: { companyName: "Acme" },
              }),
            ],
          },
          uploadedFile: {
            create: expect.objectContaining({
              storageProvider: "LOCAL",
              storageKey: "imports/job-1/source.xlsx",
            }),
          },
        }),
      })
    );
    expect(created.sourceColumnsJson).toEqual(["companyName"]);
  });

  it("updates job status with importJobId and userId ownership", async () => {
    const client = createMockClient();
    client.importJob.updateMany.mockResolvedValue({ count: 1 });
    const repository = createRepository(client);

    const updated = await repository.updateJobStatusForUser({
      userId: "user-1",
      importJobId: "job-1",
      expectedStatus: "READY_TO_CONFIRM",
      status: "CONFIRMED",
      importedRowCount: 1,
      importUserLogId: "log-1",
      confirmedAt: NOW,
    });

    expect(updated).toBe(true);
    expect(client.importJob.updateMany).toHaveBeenCalledWith({
      where: {
        id: "job-1",
        userId: "user-1",
        status: "READY_TO_CONFIRM",
      },
      data: {
        status: "CONFIRMED",
        importedRowCount: 1,
        importUserLogId: "log-1",
        confirmedAt: NOW,
      },
    });
  });

  it("rejects row creation when the job is missing or not owned by the user", async () => {
    const client = createMockClient();
    client.importJob.findFirst.mockResolvedValue(null);
    const repository = createRepository(client);

    await expect(
      repository.createRows({
        userId: "user-1",
        importJobId: "job-1",
        rows: [
          {
            rowNumber: 2,
            rawDataJson: { companyName: "Acme" },
          },
        ],
      })
    ).rejects.toBeInstanceOf(ImportJobNotFoundError);
    expect(client.importJobRow.createMany).not.toHaveBeenCalled();
  });

  it("verifies row ownership before creating a row-scoped error", async () => {
    const client = createMockClient();
    client.importJob.findFirst.mockResolvedValue(createJobFixture());
    client.importJobRow.findFirst.mockResolvedValue(createRowFixture());
    client.importJobError.create.mockResolvedValue(createErrorFixture());
    const repository = createRepository(client);

    const error = await repository.createError({
      userId: "user-1",
      importJobId: "job-1",
      importJobRowId: "row-1",
      errorType: "VALIDATION",
      errorCode: "RequiredFieldMissing",
      safeMessage: "companyName is required",
      rowNumber: 2,
      fieldKey: "companyName",
    });

    expect(client.importJobRow.findFirst).toHaveBeenCalledWith({
      where: {
        id: "row-1",
        importJobId: "job-1",
        userId: "user-1",
      },
      select: {
        id: true,
      },
    });
    expect(client.importJobError.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          importJob: { connect: { id: "job-1" } },
          importJobRow: { connect: { id: "row-1" } },
          user: { connect: { id: "user-1" } },
        }),
      })
    );
    expect(error.id).toBe("error-1");
  });

  it("rejects row-scoped errors when the row is outside the current job or user", async () => {
    const client = createMockClient();
    client.importJob.findFirst.mockResolvedValue(createJobFixture());
    client.importJobRow.findFirst.mockResolvedValue(null);
    const repository = createRepository(client);

    await expect(
      repository.createError({
        userId: "user-1",
        importJobId: "job-1",
        importJobRowId: "row-other",
        errorType: "VALIDATION",
        errorCode: "RequiredFieldMissing",
        safeMessage: "companyName is required",
        rowNumber: 2,
        fieldKey: "companyName",
      })
    ).rejects.toBeInstanceOf(ImportJobNotFoundError);
    expect(client.importJobError.create).not.toHaveBeenCalled();
  });

  it("rejects uploaded file creation when the job is missing or not owned by the user", async () => {
    const client = createMockClient();
    client.importJob.findFirst.mockResolvedValue(null);
    const repository = createRepository(client);

    await expect(
      repository.createUploadedFile({
        userId: "user-1",
        importJobId: "job-1",
        originalFileName: "source.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSizeBytes: 100,
        checksum: "checksum-1",
        storageProvider: "LOCAL",
        storageKey: "imports/job-1/source.xlsx",
        expiresAt: EXPIRES_AT,
      })
    ).rejects.toBeInstanceOf(ImportJobNotFoundError);
    expect(client.importUploadedFile.create).not.toHaveBeenCalled();
  });
});

function createRepository(client: MockPrismaClient): PrismaImportJobRepository {
  return new PrismaImportJobRepository(client as unknown as PrismaService, null);
}

function createMockClient(): MockPrismaClient {
  return {
    importJob: createMockModel<ImportJobFixture>(),
    importJobRow: createMockModel<ImportJobRowFixture>(),
    importJobError: createMockModel<ImportJobErrorFixture>(),
    importUploadedFile: createMockModel<ImportUploadedFileFixture>(),
  };
}

function createMockModel<TRecord>(): MockModel<TRecord> {
  return {
    create: jest.fn<Promise<TRecord>, [unknown]>(),
    createMany: jest.fn<Promise<{ readonly count: number }>, [unknown]>(),
    findFirst: jest.fn<Promise<TRecord | null>, [unknown]>(),
    findMany: jest.fn<Promise<TRecord[]>, [unknown]>(),
    updateMany: jest.fn<Promise<{ readonly count: number }>, [unknown]>(),
  };
}

function createJobDetailFixture(): ImportJobFixture & {
  readonly rows: readonly ImportJobRowFixture[];
  readonly errors: readonly ImportJobErrorFixture[];
  readonly uploadedFile: ImportUploadedFileFixture;
} {
  return {
    ...createJobFixture(),
    rows: [createRowFixture()],
    errors: [createErrorFixture()],
    uploadedFile: createUploadedFileFixture(),
  };
}

function createJobFixture(): ImportJobFixture {
  return {
    id: "job-1",
    userId: "user-1",
    templateId: "template-1",
    targetType: "COMPANY",
    templateVersion: "v1",
    templateColumnsJson: [{ key: "companyName" }],
    sourceColumnsJson: ["companyName"],
    status: "UPLOADED",
    mappingJson: {},
    mappingSource: "NONE",
    contextLabel: null,
    contextJson: null,
    originalFileName: "source.xlsx",
    fileSizeBytes: 100,
    totalRowCount: 1,
    validRowCount: 0,
    invalidRowCount: 0,
    importedRowCount: 0,
    failedRowCount: 0,
    importUserLogId: null,
    confirmIdempotencyKey: null,
    expiresAt: EXPIRES_AT,
    confirmedAt: null,
    canceledAt: null,
    failedAt: null,
    lastErrorCode: null,
    lastErrorMessage: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function createRowFixture(): ImportJobRowFixture {
  return {
    id: "row-1",
    importJobId: "job-1",
    userId: "user-1",
    rowNumber: 2,
    rawDataJson: { companyName: "Acme" },
    mappedDataJson: {},
    normalizedDataJson: null,
    status: "PENDING",
    validationErrorsJson: [],
    targetLabel: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function createErrorFixture(): ImportJobErrorFixture {
  return {
    id: "error-1",
    importJobId: "job-1",
    importJobRowId: "row-1",
    userId: "user-1",
    errorType: "VALIDATION",
    errorCode: "RequiredFieldMissing",
    severity: "ERROR",
    rowNumber: 2,
    fieldKey: "companyName",
    safeMessage: "회사명을 입력해 주세요.",
    detailJson: null,
    retryable: false,
    createdAt: NOW,
  };
}

function createUploadedFileFixture(): ImportUploadedFileFixture {
  return {
    id: "file-1",
    importJobId: "job-1",
    userId: "user-1",
    originalFileName: "source.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSizeBytes: 100,
    checksum: "checksum-1",
    storageProvider: "LOCAL",
    storageBucket: null,
    storageKey: "imports/job-1/source.xlsx",
    status: "STORED",
    uploadedAt: NOW,
    deletedAt: null,
    expiresAt: EXPIRES_AT,
    createdAt: NOW,
    updatedAt: NOW,
  };
}
