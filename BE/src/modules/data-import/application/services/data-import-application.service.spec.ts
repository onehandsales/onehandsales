import { DataImportApplicationService } from "./data-import-application.service";
import type {
  ImportFileParser,
  ImportUploadedFile,
} from "@/modules/data-import/application/ports/import-file-parser.port";
import type {
  ImportJobDetailRecord,
  ImportJobErrorRecord,
  ImportJobRepositoryContext,
  ImportJobRowRecord,
  TerminalImportJobCleanupCandidate,
} from "@/modules/data-import/application/ports/import-job.repository";
import type { ImportMappingProvider } from "@/modules/data-import/application/ports/import-mapping.provider";
import type {
  ImportTemplateRecord,
  ImportTemplateRepository,
} from "@/modules/data-import/application/ports/import-template.repository";
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
import type {
  XlsxWorkbookWriter,
  XlsxWorksheetInput,
} from "@/shared/application/ports/xlsx-workbook.writer";
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
  it("downloads template columns with requested locale before user preference", async () => {
    const fixture = createServiceFixture();
    fixture.importTemplateRepository.findActiveTemplateById.mockResolvedValue(
      createImportTemplateRecord({
        templateType: "CONTACT",
        templateName: "contact-template.xlsx",
        columnsJson: [
          {
            key: "contactName",
            label: "담당자명",
            required: true,
            type: "text",
          },
          {
            key: "contactPhone",
            label: "전화번호",
            required: true,
            type: "phone",
          },
          {
            key: "contactDepartmentName",
            label: "부서",
            required: false,
            type: "text",
            options: ["Sales", "Support"],
          },
        ],
        sampleRowsJson: [
          {
            contactName: "Alice",
            contactPhone: "+821011112222",
            contactDepartmentName: "Sales",
          },
        ],
      })
    );

    const response = await fixture.service.downloadImportTemplate({
      currentUser: { preferredLocale: "ko-KR" },
      templateId: "template-contact",
      locale: "en",
    });

    const worksheetInput = fixture.xlsxWriter.writeWorksheet.mock.calls[0]?.[0] as
      | XlsxWorksheetInput
      | undefined;

    // 기능 : query locale이 사용자 기본 locale보다 우선해 템플릿 sheet/header에 적용되는지 검증합니다.
    expect(response.content).toEqual(Buffer.from("xlsx"));
    expect(worksheetInput?.sheetName).toBe("Contacts");
    expect(worksheetInput?.columns.map((column) => column.header)).toEqual([
      "Contact Name",
      "Contact Phone",
      "Contact Department",
    ]);
    expect(worksheetInput?.columns[2]?.listValidation).toEqual(
      expect.objectContaining({
        promptTitle: "Choose Contact Department",
        errorTitle: "Check Contact Department",
      })
    );
  });

  it("deletes original uploaded binary after creating an import job snapshot", async () => {
    const fixture = createServiceFixture();
    fixture.importTemplateRepository.findActiveTemplateByType.mockResolvedValue(
      createImportTemplateRecord({
        columnsJson: [
          {
            key: "companyName",
            label: "회사명",
            required: true,
            type: "text",
          },
        ],
      })
    );
    fixture.importFileParser.parse.mockResolvedValue({
      sourceColumns: ["companyName"],
      rows: [
        {
          rowNumber: 2,
          rawData: { companyName: "Acme" },
        },
      ],
    });
    fixture.importUploadedFileStorage.store.mockResolvedValue({
      checksum: "checksum-1",
      storageProvider: "LOCAL",
      storageBucket: null,
      storageKey: "user/job/source.xlsx",
    });
    fixture.importJobRepository.createJob.mockResolvedValue(
      createImportJobDetail({ status: "UPLOADED", mappingJson: {}, mappingSource: "NONE" })
    );

    const response = await fixture.service.createImportJob(CURRENT_USER, {
      targetType: "COMPANY",
      file: createUploadedImportFile(),
    });

    expect(fixture.importUploadedFileStorage.delete).toHaveBeenCalledWith({
      storageKey: "user/job/source.xlsx",
    });
    const createJobCallOrder =
      fixture.importJobRepository.createJob.mock.invocationCallOrder[0] ?? 0;
    const deleteCallOrder =
      fixture.importUploadedFileStorage.delete.mock.invocationCallOrder[0] ?? 0;
    expect(createJobCallOrder).toBeGreaterThan(0);
    expect(createJobCallOrder).toBeLessThan(deleteCallOrder);
    expect(
      fixture.importJobRepository.updateUploadedFileStatusForUser
    ).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      importJobId: IMPORT_JOB_ID,
      status: "DELETED",
      deletedAt: expect.any(Date),
    });
    expect(response.job.id).toBe(IMPORT_JOB_ID);
    expect(JSON.stringify(response)).not.toContain("user/job/source.xlsx");
  });

  it("keeps create import job success when immediate uploaded binary deletion fails", async () => {
    const fixture = createServiceFixture();
    fixture.importTemplateRepository.findActiveTemplateByType.mockResolvedValue(
      createImportTemplateRecord()
    );
    fixture.importFileParser.parse.mockResolvedValue({
      sourceColumns: ["companyName"],
      rows: [{ rowNumber: 2, rawData: { companyName: "Acme" } }],
    });
    fixture.importUploadedFileStorage.store.mockResolvedValue({
      checksum: "checksum-1",
      storageProvider: "LOCAL",
      storageBucket: null,
      storageKey: "raw/storage-key/source.xlsx",
    });
    fixture.importUploadedFileStorage.delete.mockRejectedValue(
      new Error("raw/storage-key/source.xlsx provider detail")
    );
    fixture.importJobRepository.createJob.mockResolvedValue(
      createImportJobDetail({ status: "UPLOADED", mappingJson: {}, mappingSource: "NONE" })
    );

    const response = await fixture.service.createImportJob(CURRENT_USER, {
      targetType: "COMPANY",
      file: createUploadedImportFile(),
    });

    expect(response.job.id).toBe(IMPORT_JOB_ID);
    expect(
      fixture.importJobRepository.updateUploadedFileStatusForUser
    ).not.toHaveBeenCalledWith(expect.objectContaining({ status: "DELETED" }));
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
    expect(JSON.stringify(response)).not.toContain("raw/storage-key/source.xlsx");
    expect(JSON.stringify(response)).not.toContain("provider detail");

    const failedLog = fixture.logger.log.mock.calls.find((call) =>
      String(call[0]).includes("importJob.fileDeleteFailed")
    )?.[0];
    expect(failedLog).toEqual(expect.any(String));
    expect(String(failedLog)).toContain("STORAGE_DELETE_FAILED");
    expect(String(failedLog)).not.toContain("raw/storage-key/source.xlsx");
    expect(String(failedLog)).not.toContain("provider detail");
  });

  it("keeps orphan file best-effort delete when import job DB creation fails", async () => {
    const fixture = createServiceFixture();
    fixture.importTemplateRepository.findActiveTemplateByType.mockResolvedValue(
      createImportTemplateRecord()
    );
    fixture.importFileParser.parse.mockResolvedValue({
      sourceColumns: ["companyName"],
      rows: [{ rowNumber: 2, rawData: { companyName: "Acme" } }],
    });
    fixture.importUploadedFileStorage.store.mockResolvedValue({
      checksum: "checksum-1",
      storageProvider: "LOCAL",
      storageBucket: null,
      storageKey: "user/job/source.xlsx",
    });
    fixture.importJobRepository.createJob.mockRejectedValue(
      new Error("database unavailable")
    );

    await expect(
      fixture.service.createImportJob(CURRENT_USER, {
        targetType: "COMPANY",
        file: createUploadedImportFile(),
      })
    ).rejects.toThrow("database unavailable");

    expect(fixture.importUploadedFileStorage.delete).toHaveBeenCalledWith({
      storageKey: "user/job/source.xlsx",
    });
    expect(
      fixture.importJobRepository.updateUploadedFileStatusForUser
    ).not.toHaveBeenCalled();
  });

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

  it("deletes confirmed terminal jobs after 7 cleanup retention days", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.listTerminalJobsForCleanup.mockResolvedValue([
      createCleanupCandidate({
        status: "CONFIRMED",
        confirmedAt: new Date("2026-07-14T00:00:00.000Z"),
        uploadedFile: {
          storageKey: "user/job/source.xlsx",
          deletedAt: new Date("2026-07-14T00:00:00.000Z"),
        },
      }),
    ]);
    fixture.importJobRepository.deleteJobs.mockResolvedValue(1);

    const result = await fixture.service.cleanupTerminalImportJobs({
      now: NOW,
      retentionDays: 7,
      batchSize: 500,
    });

    expect(fixture.importJobRepository.listTerminalJobsForCleanup).toHaveBeenCalledWith({
      now: NOW,
      retentionDays: 7,
      limit: 500,
    });
    expect(fixture.importUploadedFileStorage.delete).not.toHaveBeenCalled();
    expect(fixture.importJobRepository.deleteJobs).toHaveBeenCalledWith({
      importJobIds: [IMPORT_JOB_ID],
    });
    expect(result).toEqual({
      deletedJobCount: 1,
      fileDeleteRetriedCount: 0,
      fileDeleteFailedCount: 0,
      skippedJobCount: 0,
      cleanupCutoffAt: "2026-07-14T00:00:00.000Z",
    });
  });

  it("retries undeleted uploaded file before terminal job deletion and logs only safe summary", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.listTerminalJobsForCleanup.mockResolvedValue([
      createCleanupCandidate({
        id: "job-raw-sensitive-id",
        uploadedFile: {
          storageKey: "raw/storage-key/source.xlsx",
          deletedAt: null,
        },
      }),
    ]);
    fixture.importJobRepository.deleteJobs.mockResolvedValue(1);

    await fixture.service.cleanupTerminalImportJobs({
      now: NOW,
      retentionDays: 7,
      batchSize: 500,
    });

    expect(fixture.importUploadedFileStorage.delete).toHaveBeenCalledWith({
      storageKey: "raw/storage-key/source.xlsx",
    });
    expect(fixture.importJobRepository.deleteJobs).toHaveBeenCalledWith({
      importJobIds: ["job-raw-sensitive-id"],
    });

    const cleanupLog = fixture.logger.log.mock.calls.find((call) =>
      String(call[0]).includes("importJob.cleanup.completed")
    )?.[0];
    expect(cleanupLog).toEqual(expect.any(String));
    expect(String(cleanupLog)).toContain("fileDeleteRetriedCount");
    expect(String(cleanupLog)).not.toContain("raw/storage-key/source.xlsx");
    expect(String(cleanupLog)).not.toContain("source.xlsx");
    expect(String(cleanupLog)).not.toContain("job-raw-sensitive-id");
  });

  it("skips DB deletion when terminal cleanup cannot delete stored uploaded file", async () => {
    const fixture = createServiceFixture();
    fixture.importJobRepository.listTerminalJobsForCleanup.mockResolvedValue([
      createCleanupCandidate({
        uploadedFile: {
          storageKey: "user/job/source.xlsx",
          deletedAt: null,
        },
      }),
    ]);
    fixture.importUploadedFileStorage.delete.mockRejectedValue(
      new Error("storage unavailable")
    );

    const result = await fixture.service.cleanupTerminalImportJobs({
      now: NOW,
      retentionDays: 7,
      batchSize: 500,
    });

    expect(fixture.importJobRepository.deleteJobs).not.toHaveBeenCalled();
    expect(result).toEqual({
      deletedJobCount: 0,
      fileDeleteRetriedCount: 1,
      fileDeleteFailedCount: 1,
      skippedJobCount: 1,
      cleanupCutoffAt: "2026-07-14T00:00:00.000Z",
    });
  });

  it("fails terminal cleanup when retention days are not the fixed 7-day policy", async () => {
    const fixture = createServiceFixture();

    await expect(
      fixture.service.cleanupTerminalImportJobs({
        now: NOW,
        retentionDays: 6 as 7,
        batchSize: 500,
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);

    expect(fixture.importJobRepository.listTerminalJobsForCleanup).not.toHaveBeenCalled();
    expect(JSON.stringify(fixture.logger.log.mock.calls)).toContain(
      "importJob.cleanup.failed"
    );
  });

  it("cleans import success row snapshots after 30 retention days with safe summary log", async () => {
    const fixture = createServiceFixture();
    fixture.importTemplateRepository.deleteImportUserLogRowsBefore.mockResolvedValue(2);

    const result = await fixture.service.cleanupImportUserLogRows({
      now: NOW,
      retentionDays: 30,
      batchSize: 500,
    });

    expect(
      fixture.importTemplateRepository.deleteImportUserLogRowsBefore
    ).toHaveBeenCalledWith(new Date("2026-06-21T00:00:00.000Z"), 500);
    expect(result).toEqual({
      deletedRowCount: 2,
      cleanupCutoffAt: "2026-06-21T00:00:00.000Z",
    });

    const cleanupLog = fixture.logger.log.mock.calls.find((call) =>
      String(call[0]).includes("importUserLogRows.cleanup.completed")
    )?.[0];
    expect(cleanupLog).toEqual(expect.any(String));
    expect(String(cleanupLog)).toContain("deletedRowCount");
    expect(String(cleanupLog)).not.toContain("submittedDataJson");
    expect(String(cleanupLog)).not.toContain("Acme raw-secret-value");
    expect(String(cleanupLog)).not.toContain(IMPORT_USER_LOG_ID);
  });

  it("fails import success row cleanup when retention days are not the fixed 30-day policy", async () => {
    const fixture = createServiceFixture();

    await expect(
      fixture.service.cleanupImportUserLogRows({
        now: NOW,
        retentionDays: 29 as 30,
        batchSize: 500,
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);

    expect(
      fixture.importTemplateRepository.deleteImportUserLogRowsBefore
    ).not.toHaveBeenCalled();
    expect(JSON.stringify(fixture.logger.log.mock.calls)).toContain(
      "importUserLogRows.cleanup.failed"
    );
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
    deleteImportUserLogRowsBefore: jest.fn().mockResolvedValue(0),
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
    listTerminalJobsForCleanup: jest.fn().mockResolvedValue([]),
    deleteJobs: jest.fn().mockResolvedValue(0),
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
    writeWorksheet: jest.fn().mockResolvedValue(Buffer.from("xlsx")),
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
    importFileParser,
    importUploadedFileStorage,
    xlsxWriter,
    logger,
  };
}

function createImportTemplateRecord(
  overrides: Partial<ImportTemplateRecord> = {}
): ImportTemplateRecord {
  return {
    id: "template-1",
    templateType: "COMPANY",
    templateVersion: "v1",
    templateName: "template.xlsx",
    columnsJson: [],
    sampleRowsJson: [],
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function createUploadedImportFile(
  overrides: Partial<ImportUploadedFile> = {}
): ImportUploadedFile {
  return {
    buffer: Buffer.from("companyName\nAcme"),
    originalname: "source.xlsx",
    mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 100,
    ...overrides,
  };
}

function createCleanupCandidate(
  overrides: Partial<TerminalImportJobCleanupCandidate> = {}
): TerminalImportJobCleanupCandidate {
  return {
    id: IMPORT_JOB_ID,
    userId: CURRENT_USER.id,
    status: "CONFIRMED",
    confirmedAt: new Date("2026-07-14T00:00:00.000Z"),
    canceledAt: null,
    failedAt: null,
    expiresAt: EXPIRES_AT,
    updatedAt: new Date("2026-07-14T00:00:00.000Z"),
    uploadedFile: {
      storageKey: "user/job/source.xlsx",
      deletedAt: new Date("2026-07-14T00:00:00.000Z"),
    },
    ...overrides,
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
