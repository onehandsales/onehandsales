import { DataImportApplicationService } from "./data-import-application.service";
import type { ImportFileParser } from "@/modules/data-import/application/ports/import-file-parser.port";
import type {
  ImportJobDetailRecord,
  ImportJobErrorRecord,
  ImportJobRepositoryContext,
  ImportJobRowRecord,
} from "@/modules/data-import/application/ports/import-job.repository";
import type { ImportMappingProvider } from "@/modules/data-import/application/ports/import-mapping.provider";
import type { ImportTemplateRepository } from "@/modules/data-import/application/ports/import-template.repository";
import type { ImportUploadedFileStorage } from "@/modules/data-import/application/ports/import-uploaded-file-storage.port";
import {
  ImportJobAlreadyClosedError,
  ImportJobExpiredError,
  ImportJobNotFoundError,
  ImportJobNotReadyError,
  ImportConfirmValidationFailedError,
} from "@/modules/data-import/domain/import-template.errors";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { XlsxWorkbookWriter } from "@/shared/application/ports/xlsx-workbook.writer";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const IMPORT_JOB_ID = "00000000-0000-4000-8000-000000000301";
const IMPORT_USER_LOG_ID = "00000000-0000-4000-8000-000000000401";
const NOW = new Date("2026-07-21T00:00:00.000Z");
const EXPIRES_AT = new Date("2026-07-28T00:00:00.000Z");

describe("DataImportApplicationService persistent import job flow", () => {
  it("rejects invalid rows before delegating confirm", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail({
        rows: [createImportJobRow({ status: "INVALID" })],
        status: "READY_TO_CONFIRM",
      })
    );

    await expect(
      fixture.service.confirmImportJob(CURRENT_USER, IMPORT_JOB_ID, {})
    ).rejects.toBeInstanceOf(ImportJobNotReadyError);

    expect(fixture.importJobRepository.updateJobStatusForUser).not.toHaveBeenCalled();
    expect(fixture.importTemplateRepository.confirmCompanyImport).not.toHaveBeenCalled();
  });

  it("rejects pending rows before delegating confirm", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail({
        rows: [
          createImportJobRow(),
          createImportJobRow({
            id: "row-2",
            rowNumber: 3,
            mappedDataJson: {},
            normalizedDataJson: null,
            status: "PENDING",
            targetLabel: null,
          }),
        ],
        status: "READY_TO_CONFIRM",
      })
    );

    await expect(
      fixture.service.confirmImportJob(CURRENT_USER, IMPORT_JOB_ID, {})
    ).rejects.toBeInstanceOf(ImportJobNotReadyError);

    expect(fixture.importJobRepository.updateJobStatusForUser).not.toHaveBeenCalled();
    expect(fixture.importTemplateRepository.confirmCompanyImport).not.toHaveBeenCalled();
  });

  it("keeps a partially edited job in review while untouched rows are pending", async () => {
    const fixture = createServiceFixture();
    const pendingJob = createImportJobDetail({
      status: "UPLOADED",
      validRowCount: 0,
      invalidRowCount: 0,
      rows: [
        createImportJobRow({
          status: "PENDING",
          mappedDataJson: {},
          normalizedDataJson: null,
          targetLabel: null,
        }),
        createImportJobRow({
          id: "row-2",
          rowNumber: 3,
          rawDataJson: { companyName: "Beta" },
          mappedDataJson: {},
          normalizedDataJson: null,
          status: "PENDING",
          targetLabel: null,
        }),
      ],
    });
    fixture.importJobRepository.findJobByIdForUser
      .mockResolvedValueOnce(pendingJob)
      .mockResolvedValueOnce(
        createImportJobDetail({
          status: "NEEDS_REVIEW",
          validRowCount: 1,
          invalidRowCount: 0,
          rows: pendingJob.rows,
        })
      );

    await fixture.service.updateImportJobRows(CURRENT_USER, IMPORT_JOB_ID, {
      rows: [
        {
          rowId: "row-1",
          data: { companyName: "Acme" },
        },
      ],
    });

    expect(fixture.importJobRepository.updateJobStatusForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: CURRENT_USER.id,
        importJobId: IMPORT_JOB_ID,
        status: "NEEDS_REVIEW",
        validRowCount: 1,
        invalidRowCount: 0,
      })
    );
  });

  it("delegates confirm status locking to the domain repository transaction", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail()
    );
    fixture.importTemplateRepository.confirmCompanyImport.mockResolvedValue({
      importUserLogId: IMPORT_USER_LOG_ID,
      importedRowCount: 1,
    });

    const response = await fixture.service.confirmImportJob(
      CURRENT_USER,
      IMPORT_JOB_ID,
      { idempotencyKey: "confirm-1" }
    );

    expect(fixture.importJobRepository.updateJobStatusForUser).not.toHaveBeenCalled();
    expect(fixture.importTemplateRepository.confirmCompanyImport).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: CURRENT_USER.id,
        importJobId: IMPORT_JOB_ID,
        idempotencyKey: "confirm-1",
        rows: [
          expect.objectContaining({
            rowNumber: 2,
            submittedData: { companyName: "Acme" },
          }),
        ],
      })
    );
    expect(response).toEqual({
      importJobId: IMPORT_JOB_ID,
      importUserLogId: IMPORT_USER_LOG_ID,
      status: "CONFIRMED",
      importedRowCount: 1,
    });
  });

  it("returns the previous success response for the same confirm idempotency key", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail({
        status: "CONFIRMED",
        importedRowCount: 1,
        importUserLogId: IMPORT_USER_LOG_ID,
        confirmIdempotencyKey: "confirm-1",
      })
    );

    await expect(
      fixture.service.confirmImportJob(CURRENT_USER, IMPORT_JOB_ID, {
        idempotencyKey: "confirm-1",
      })
    ).resolves.toEqual({
      importJobId: IMPORT_JOB_ID,
      importUserLogId: IMPORT_USER_LOG_ID,
      status: "CONFIRMED",
      importedRowCount: 1,
    });

    expect(fixture.importTemplateRepository.confirmCompanyImport).not.toHaveBeenCalled();
    expect(fixture.importUploadedFileStorage.delete).toHaveBeenCalledWith({
      storageKey: "user/job/source.xlsx",
    });
    expect(
      fixture.importJobRepository.updateUploadedFileStatusForUser
    ).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      importJobId: IMPORT_JOB_ID,
      status: "DELETED",
      deletedAt: expect.any(Date),
    });
  });

  it("treats jobs outside the current user ownership as not found", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(null);

    await expect(
      fixture.service.getImportJob(CURRENT_USER, IMPORT_JOB_ID, {})
    ).rejects.toBeInstanceOf(ImportJobNotFoundError);

    expect(fixture.importJobRepository.findJobByIdForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: CURRENT_USER.id,
        importJobId: IMPORT_JOB_ID,
      })
    );
  });

  it("does not mark the job failed when the transactional confirm lock fails", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail()
    );
    fixture.importTemplateRepository.confirmCompanyImport.mockRejectedValue(
      new ImportJobNotReadyError()
    );

    await expect(
      fixture.service.confirmImportJob(CURRENT_USER, IMPORT_JOB_ID, {})
    ).rejects.toBeInstanceOf(ImportJobNotReadyError);

    expect(fixture.importJobRepository.updateJobStatusForUser).not.toHaveBeenCalled();
    expect(fixture.importJobRepository.createError).not.toHaveBeenCalled();
  });

  it("keeps confirm success when uploaded file deletion fails and records a storage warning", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail()
    );
    fixture.importTemplateRepository.confirmCompanyImport.mockResolvedValue({
      importUserLogId: IMPORT_USER_LOG_ID,
      importedRowCount: 1,
    });
    fixture.importUploadedFileStorage.delete.mockRejectedValue(
      new Error("storage delete failed")
    );

    await expect(
      fixture.service.confirmImportJob(CURRENT_USER, IMPORT_JOB_ID, {})
    ).resolves.toEqual({
      importJobId: IMPORT_JOB_ID,
      importUserLogId: IMPORT_USER_LOG_ID,
      status: "CONFIRMED",
      importedRowCount: 1,
    });

    expect(fixture.importTemplateRepository.confirmCompanyImport).toHaveBeenCalled();
    expect(
      fixture.importJobRepository.updateUploadedFileStatusForUser
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({
        status: "DELETED",
      })
    );
    expect(fixture.importJobRepository.createError).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: CURRENT_USER.id,
        importJobId: IMPORT_JOB_ID,
        errorType: "STORAGE",
        errorCode: "STORAGE_DELETE_FAILED",
        severity: "WARNING",
        retryable: true,
      })
    );
  });

  it("does not write raw row values to import logs during confirm", async () => {
    const fixture = createServiceFixture();
    const rawEmail = "raw-secret@example.com";
    const rawPhone = "010-1111-2222";
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail({
        rows: [
          createImportJobRow({
            rawDataJson: {
              companyName: "Acme",
              contactEmail: rawEmail,
              contactPhone: rawPhone,
            },
          }),
        ],
      })
    );
    fixture.importTemplateRepository.confirmCompanyImport.mockResolvedValue({
      importUserLogId: IMPORT_USER_LOG_ID,
      importedRowCount: 1,
    });

    await fixture.service.confirmImportJob(CURRENT_USER, IMPORT_JOB_ID, {});

    const logs = JSON.stringify(fixture.logger.log.mock.calls);
    expect(logs).not.toContain(rawEmail);
    expect(logs).not.toContain(rawPhone);
  });

  it("records a redacted ImportJobError when confirm validation fails", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail()
    );
    fixture.importTemplateRepository.confirmCompanyImport.mockRejectedValue(
      new ValidationDomainError("Acme raw-secret-value is invalid.")
    );

    await expect(
      fixture.service.confirmImportJob(CURRENT_USER, IMPORT_JOB_ID, {})
    ).rejects.toBeInstanceOf(ImportConfirmValidationFailedError);

    expect(fixture.importJobRepository.updateJobStatusForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: CURRENT_USER.id,
        importJobId: IMPORT_JOB_ID,
        status: "FAILED",
        lastErrorCode: "ImportConfirmValidationFailed",
      })
    );
    expect(fixture.importJobRepository.createError).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: CURRENT_USER.id,
        importJobId: IMPORT_JOB_ID,
        errorType: "CONFIRM",
        errorCode: "ImportConfirmValidationFailed",
        severity: "ERROR",
        retryable: false,
      })
    );
    expect(JSON.stringify(fixture.importJobRepository.createError.mock.calls)).not.toContain(
      "raw-secret-value"
    );
  });

  it.each([
    ["CONFIRMING", ImportJobAlreadyClosedError],
    ["CANCELED", ImportJobAlreadyClosedError],
    ["EXPIRED", ImportJobExpiredError],
  ] as const)("rejects %s jobs before confirm", async (status, errorType) => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail({ status })
    );

    await expect(
      fixture.service.confirmImportJob(CURRENT_USER, IMPORT_JOB_ID, {})
    ).rejects.toBeInstanceOf(errorType);

    expect(fixture.importJobRepository.updateJobStatusForUser).not.toHaveBeenCalled();
    expect(fixture.importTemplateRepository.confirmCompanyImport).not.toHaveBeenCalled();
  });

  it("does not expose ImportJobError detailJson in error responses", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.findJobByIdForUser.mockResolvedValue(
      createImportJobDetail()
    );
    fixture.importJobRepository.listErrorsForJob.mockResolvedValue([
      createImportJobError(),
    ]);

    const response = await fixture.service.listImportJobErrors(
      CURRENT_USER,
      IMPORT_JOB_ID,
      { limit: 50 }
    );

    expect(response.items).toEqual([
      {
        id: "error-1",
        rowId: "row-1",
        rowNumber: 2,
        fieldKey: "companyName",
        errorType: "VALIDATION",
        errorCode: "RequiredFieldMissing",
        severity: "ERROR",
        safeMessage: "Company name is required.",
        retryable: false,
        createdAt: NOW.toISOString(),
      },
    ]);
    expect(JSON.stringify(response)).not.toContain("raw-secret-value");
  });

  it("expires active jobs with uploaded file metadata cleanup before listing", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.listExpiredActiveJobsForUser.mockResolvedValue([
      createImportJobDetail({
        status: "UPLOADED",
        expiresAt: new Date("2026-07-20T00:00:00.000Z"),
      }),
    ]);
    fixture.importJobRepository.listActiveJobsForUser.mockResolvedValue([]);

    await fixture.service.listActiveImportJobs(CURRENT_USER, {});

    expect(fixture.importUploadedFileStorage.delete).toHaveBeenCalledWith({
      storageKey: "user/job/source.xlsx",
    });
    expect(fixture.importJobRepository.updateJobStatusForUser).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      importJobId: IMPORT_JOB_ID,
      status: "EXPIRED",
    });
    expect(
      fixture.importJobRepository.updateUploadedFileStatusForUser
    ).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      importJobId: IMPORT_JOB_ID,
      status: "EXPIRED",
      deletedAt: expect.any(Date),
    });
  });
});

function createServiceFixture() {
  const importTemplateRepository = {
    listActiveTemplates: jest.fn(),
    findActiveTemplateById: jest.fn(),
    findActiveTemplateByType: jest.fn(),
    listUserLogs: jest.fn(),
    findUserLog: jest.fn(),
    confirmCompanyImport: jest.fn(),
    confirmContactImport: jest.fn(),
    confirmProductImport: jest.fn(),
    confirmDealImport: jest.fn(),
  } satisfies jest.Mocked<ImportTemplateRepository>;

  const importJobRepository = {
    runInTransaction: jest.fn(),
    createJob: jest.fn(),
    findJobByIdForUser: jest.fn(),
    listActiveJobsForUser: jest.fn(),
    listExpiredActiveJobsForUser: jest.fn().mockResolvedValue([]),
    expireJobsForUser: jest.fn().mockResolvedValue(0),
    updateJobStatusForUser: jest.fn(),
    createRows: jest.fn(),
    listRowsForJob: jest.fn(),
    updateRowsForJob: jest.fn(),
    createError: jest.fn(),
    listErrorsForJob: jest.fn(),
    createUploadedFile: jest.fn(),
    findUploadedFileForJob: jest.fn(),
    updateUploadedFileStatusForUser: jest.fn().mockResolvedValue(true),
  } satisfies jest.Mocked<ImportJobRepositoryContext>;
  importJobRepository.runInTransaction.mockImplementation(async (work) =>
    work(importJobRepository)
  );

  const importFileParser = {
    parse: jest.fn(),
  } satisfies jest.Mocked<ImportFileParser>;

  const importUploadedFileStorage = {
    store: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  } satisfies jest.Mocked<ImportUploadedFileStorage>;

  const importMappingProvider = {
    generate: jest.fn(),
  } satisfies jest.Mocked<ImportMappingProvider>;

  const xlsxWriter = {
    writeWorksheet: jest.fn(),
  } satisfies jest.Mocked<XlsxWorkbookWriter>;

  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  return {
    service: new DataImportApplicationService(
      importTemplateRepository,
      importJobRepository,
      importFileParser,
      importUploadedFileStorage,
      importMappingProvider,
      xlsxWriter,
      logger
    ),
    importTemplateRepository,
    importJobRepository,
    importUploadedFileStorage,
    logger,
  };
}

function createImportJobDetail(
  overrides: Partial<ImportJobDetailRecord> = {}
): ImportJobDetailRecord {
  return {
    ...createImportJobDetailBase(),
    ...overrides,
  };
}

function createImportJobDetailBase(): ImportJobDetailRecord {
  return {
    id: IMPORT_JOB_ID,
    userId: CURRENT_USER.id,
    templateId: "00000000-0000-4000-8000-000000000501",
    targetType: "COMPANY" as const,
    templateVersion: "v1",
    templateColumnsJson: [
      {
        key: "companyName",
        label: "Company name",
        required: true,
        type: "text",
      },
    ],
    sourceColumnsJson: ["companyName"],
    status: "READY_TO_CONFIRM" as const,
    mappingJson: { companyName: "companyName" },
    mappingSource: "USER" as const,
    contextLabel: null,
    contextJson: null,
    originalFileName: "source.xlsx",
    fileSizeBytes: 100,
    totalRowCount: 1,
    validRowCount: 1,
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
    rows: [createImportJobRow()],
    errors: [],
    uploadedFile: {
      id: "uploaded-file-1",
      importJobId: IMPORT_JOB_ID,
      userId: CURRENT_USER.id,
      originalFileName: "source.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileSizeBytes: 100,
      checksum: "checksum-1",
      storageProvider: "LOCAL",
      storageBucket: null,
      storageKey: "user/job/source.xlsx",
      status: "PARSED" as const,
      uploadedAt: NOW,
      deletedAt: null,
      expiresAt: EXPIRES_AT,
      createdAt: NOW,
      updatedAt: NOW,
    },
  };
}

function createImportJobRow(
  overrides: Partial<ImportJobRowRecord> = {}
): ImportJobRowRecord {
  return {
    ...createImportJobRowBase(),
    ...overrides,
  };
}

function createImportJobRowBase(): ImportJobRowRecord {
  return {
    id: "row-1",
    importJobId: IMPORT_JOB_ID,
    userId: CURRENT_USER.id,
    rowNumber: 2,
    rawDataJson: { companyName: "Acme" },
    mappedDataJson: { companyName: "Acme" },
    normalizedDataJson: { companyName: "Acme" },
    status: "VALID" as const,
    validationErrorsJson: [],
    targetLabel: "Acme",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function createImportJobError(): ImportJobErrorRecord {
  return {
    id: "error-1",
    importJobId: IMPORT_JOB_ID,
    importJobRowId: "row-1",
    userId: CURRENT_USER.id,
    errorType: "VALIDATION" as const,
    errorCode: "RequiredFieldMissing",
    severity: "ERROR" as const,
    rowNumber: 2,
    fieldKey: "companyName",
    safeMessage: "Company name is required.",
    detailJson: { rawValue: "raw-secret-value" },
    retryable: false,
    createdAt: NOW,
  };
}
