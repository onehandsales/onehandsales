import type { ImportTargetType } from "@/modules/import-export/application/import-target-fields";
import type {
  CompleteImportAiMappingInput,
  ConfirmImportJobInput,
  CreateImportAiJobInput,
  CreateImportJobInput,
  FailImportAiMappingInput,
  ImportExportRepository,
  ImportJobDetailRecord,
  ImportJobRecord,
  ImportJobResultRecord,
  ImportJobRowRecord,
  UpdateImportMappingInput,
} from "@/modules/import-export/application/ports/import-export.repository";
import type {
  GenerateImportMappingInput,
  ImportMappingPort,
  ImportMappingSuggestion,
} from "@/modules/import-export/application/ports/import-mapping.port";
import type {
  ImportFileParserInput,
  ImportFileParserPort,
  ParsedImportFile,
} from "@/modules/import-export/application/ports/import-file-parser.port";
import { ValidationError } from "@/modules/import-export/domain/import-export.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type {
  CreateSignedDownloadUrlInput,
  SignedDownloadUrl,
  StoragePort,
  StoredObject,
  UploadObjectInput,
} from "@/shared/application/ports/storage.port";
import { ConfirmImportJobUseCase } from "./confirm-import-job.use-case";
import { CreateImportJobUseCase } from "./create-import-job.use-case";
import { GenerateImportMappingUseCase } from "./generate-import-mapping.use-case";
import { UpdateImportMappingUseCase } from "./update-import-mapping.use-case";

class FakeImportExportRepository implements ImportExportRepository {
  detail: ImportJobDetailRecord | null = null;
  createJobInput: CreateImportJobInput | null = null;
  createAiJobInput: CreateImportAiJobInput | null = null;
  completeAiMappingInput: CompleteImportAiMappingInput | null = null;
  failAiMappingInput: FailImportAiMappingInput | null = null;
  updateMappingInput: UpdateImportMappingInput | null = null;
  confirmJobInput: ConfirmImportJobInput | null = null;

  async createJob(input: CreateImportJobInput): Promise<ImportJobDetailRecord> {
    this.createJobInput = input;
    this.detail = {
      job: createJobRecord({
        userId: input.userId,
        targetType: input.targetType,
        fileName: input.fileName,
        file: input.file,
        resultSummary: { sourceColumns: input.sourceColumns },
      }),
      rows: input.rows.map((row, index) =>
        createRowRecord({
          id: `row-${index + 1}`,
          rowNumber: row.rowNumber,
          rawData: row.rawData,
        })
      ),
    };

    return this.detail;
  }

  async getJobDetail(): Promise<ImportJobDetailRecord | null> {
    return this.detail;
  }

  async createAiJob(
    input: CreateImportAiJobInput
  ): Promise<{ readonly id: string }> {
    this.createAiJobInput = input;

    return { id: "ai-job-1" };
  }

  async completeAiMapping(input: CompleteImportAiMappingInput): Promise<void> {
    this.completeAiMappingInput = input;
    this.detail = this.detail
      ? {
          ...this.detail,
          job: {
            ...this.detail.job,
            aiMapping: input.suggestion,
            status: "MAPPING_READY",
          },
        }
      : null;
  }

  async failAiMapping(input: FailImportAiMappingInput): Promise<void> {
    this.failAiMappingInput = input;
  }

  async updateMapping(
    input: UpdateImportMappingInput
  ): Promise<ImportJobDetailRecord> {
    this.updateMappingInput = input;
    const detail = requireDetail(this.detail);
    this.detail = {
      job: {
        ...detail.job,
        userMapping: input.mapping,
        status: input.status,
      },
      rows: detail.rows.map((row) => {
        const update = input.rows.find((item) => item.rowId === row.id);

        return update
          ? {
              ...row,
              mappedData: update.mappedData,
              status: update.status,
              errorMessage: update.errorMessage,
            }
          : row;
      }),
    };

    return this.detail;
  }

  async confirmJob(input: ConfirmImportJobInput): Promise<ImportJobResultRecord> {
    this.confirmJobInput = input;

    return {
      id: input.importJobId,
      status: "COMPLETED",
      successCount: 1,
      failedCount: 0,
      errors: [],
    };
  }
}

class FakeImportFileParserPort implements ImportFileParserPort {
  input: ImportFileParserInput | null = null;
  parsed: ParsedImportFile = {
    sourceColumns: ["회사명", "업종"],
    rows: [
      {
        rowNumber: 2,
        rawData: { 회사명: "한빛리빙", 업종: "생활가전" },
      },
    ],
  };

  async parse(input: ImportFileParserInput): Promise<ParsedImportFile> {
    this.input = input;

    return this.parsed;
  }
}

class FakeImportMappingPort implements ImportMappingPort {
  input: GenerateImportMappingInput | null = null;
  suggestion: ImportMappingSuggestion = {
    suggestedMapping: { name: "회사명", industry: "업종" },
    confidence: 0.9,
    unmappedColumns: [],
  };

  async generateMapping(
    input: GenerateImportMappingInput
  ): Promise<ImportMappingSuggestion> {
    this.input = input;

    return this.suggestion;
  }
}

class FakeStoragePort implements StoragePort {
  uploadInput: UploadObjectInput | null = null;

  async uploadObject(input: UploadObjectInput): Promise<StoredObject> {
    this.uploadInput = input;

    return {
      storageProvider: "supabase",
      bucket: input.bucket,
      objectKey: input.objectKey,
      contentType: input.contentType ?? null,
      sizeBytes:
        input.body instanceof ArrayBuffer ? input.body.byteLength : input.body.length,
      fileName: input.fileName ?? null,
    };
  }

  async createSignedDownloadUrl(
    input: CreateSignedDownloadUrlInput
  ): Promise<SignedDownloadUrl> {
    return {
      url: `https://storage.example/${input.bucket}/${input.objectKey}`,
      expiresInSeconds: input.expiresInSeconds,
    };
  }

  async removeObject(): Promise<void> {
    return undefined;
  }
}

describe("ImportExport use cases", () => {
  it("parses and uploads an import file before creating preview rows", async () => {
    const repository = new FakeImportExportRepository();
    const parser = new FakeImportFileParserPort();
    const storage = new FakeStoragePort();
    const useCase = new CreateImportJobUseCase(
      repository,
      parser,
      storage,
      "imports"
    );

    const response = await useCase.execute(currentUser(), {
      targetType: "COMPANY",
      file: importFile(),
    });

    expect(parser.input).toMatchObject({
      targetType: "COMPANY",
      fileName: "companies.csv",
    });
    expect(storage.uploadInput).toMatchObject({
      bucket: "imports",
      contentType: "text/csv",
      fileName: "companies.csv",
    });
    expect(repository.createJobInput).toMatchObject({
      userId: "user-1",
      targetType: "COMPANY",
      sourceColumns: ["회사명", "업종"],
    });
    expect(response.rowCount).toBe(1);
    expect(response.previewRows[0]?.rawData.회사명).toBe("한빛리빙");
  });

  it("generates AI column mapping and stores the AiJob result", async () => {
    const repository = new FakeImportExportRepository();
    repository.detail = createDetail();
    const mappingPort = new FakeImportMappingPort();
    const useCase = new GenerateImportMappingUseCase(repository, mappingPort);

    const response = await useCase.execute(currentUser(), "import-job-1");

    expect(repository.createAiJobInput).toMatchObject({
      userId: "user-1",
      importJobId: "import-job-1",
      targetType: "COMPANY",
      rowCount: 1,
    });
    expect(mappingPort.input).toMatchObject({
      targetType: "COMPANY",
      sourceColumns: ["회사명", "업종"],
    });
    expect(repository.completeAiMappingInput).toMatchObject({
      aiJobId: "ai-job-1",
      suggestion: mappingPort.suggestion,
    });
    expect(response.suggestedMapping.name).toBe("회사명");
  });

  it("validates mapped rows and marks invalid preview rows", async () => {
    const repository = new FakeImportExportRepository();
    repository.detail = createDetail({
      rows: [
        createRowRecord({
          id: "row-1",
          rowNumber: 2,
          rawData: { 회사명: "한빛리빙", 업종: "생활가전" },
        }),
        createRowRecord({
          id: "row-2",
          rowNumber: 3,
          rawData: { 회사명: "", 업종: "가구" },
        }),
      ],
    });
    const useCase = new UpdateImportMappingUseCase(repository);

    const response = await useCase.execute(currentUser(), "import-job-1", {
      mapping: { name: "회사명", industry: "업종" },
    });

    expect(repository.updateMappingInput).toMatchObject({
      status: "VALIDATION_FAILED",
      mapping: { name: "회사명", industry: "업종" },
    });
    expect(response.validRowCount).toBe(1);
    expect(response.invalidRowCount).toBe(1);
    expect(response.errors[0]?.rowNumber).toBe(3);
  });

  it("requires explicit confirmation before delegating execution", async () => {
    const repository = new FakeImportExportRepository();
    const useCase = new ConfirmImportJobUseCase(repository);

    await expect(
      useCase.execute(currentUser(), "import-job-1", { confirm: false })
    ).rejects.toBeInstanceOf(ValidationError);

    const response = await useCase.execute(currentUser(), "import-job-1", {
      confirm: true,
    });

    expect(repository.confirmJobInput).toMatchObject({
      userId: "user-1",
      importJobId: "import-job-1",
    });
    expect(response.status).toBe("COMPLETED");
  });
});

function currentUser(): CurrentUserContext {
  return {
    id: "user-1",
    sessionId: "session-1",
    email: "user@example.com",
    displayName: "사용자",
    role: "USER",
    status: "ACTIVE",
  };
}

function importFile() {
  return {
    buffer: Buffer.from("회사명,업종\n한빛리빙,생활가전"),
    mimetype: "text/csv",
    originalname: "companies.csv",
    size: Buffer.byteLength("회사명,업종\n한빛리빙,생활가전"),
  };
}

function createDetail(
  overrides: Partial<ImportJobDetailRecord> = {}
): ImportJobDetailRecord {
  return {
    job: overrides.job ?? createJobRecord(),
    rows: overrides.rows ?? [createRowRecord()],
  };
}

function createJobRecord(
  overrides: Partial<ImportJobRecord> = {}
): ImportJobRecord {
  const createdAt =
    overrides.createdAt ?? new Date("2026-06-07T01:00:00.000Z");

  return {
    id: overrides.id ?? "import-job-1",
    userId: overrides.userId ?? "user-1",
    targetType: overrides.targetType ?? ("COMPANY" satisfies ImportTargetType),
    fileName: overrides.fileName ?? "companies.csv",
    file:
      overrides.file ??
      ({
        storageProvider: "supabase",
        bucket: "imports",
        objectKey: "imports/user-1/file.csv",
        contentType: "text/csv",
        sizeBytes: 10,
        fileName: "companies.csv",
      } satisfies StoredObject),
    status: overrides.status ?? "PREVIEW_READY",
    aiMapping: overrides.aiMapping ?? null,
    userMapping: overrides.userMapping ?? null,
    resultSummary: overrides.resultSummary ?? {
      sourceColumns: ["회사명", "업종"],
    },
    createdAt,
    updatedAt: overrides.updatedAt ?? createdAt,
    completedAt: overrides.completedAt ?? null,
  };
}

function createRowRecord(
  overrides: Partial<ImportJobRowRecord> = {}
): ImportJobRowRecord {
  const createdAt =
    overrides.createdAt ?? new Date("2026-06-07T01:00:00.000Z");

  return {
    id: overrides.id ?? "row-1",
    importJobId: overrides.importJobId ?? "import-job-1",
    rowNumber: overrides.rowNumber ?? 2,
    rawData: overrides.rawData ?? { 회사명: "한빛리빙", 업종: "생활가전" },
    mappedData: overrides.mappedData ?? null,
    status: overrides.status ?? "PENDING",
    errorMessage: overrides.errorMessage ?? null,
    targetId: overrides.targetId ?? null,
    createdAt,
    updatedAt: overrides.updatedAt ?? createdAt,
  };
}

function requireDetail(
  detail: ImportJobDetailRecord | null
): ImportJobDetailRecord {
  if (!detail) {
    throw new Error("detail is required");
  }

  return detail;
}
