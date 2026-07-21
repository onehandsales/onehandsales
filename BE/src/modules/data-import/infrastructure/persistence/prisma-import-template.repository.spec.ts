import { PrismaImportTemplateRepository } from "./prisma-import-template.repository";
import type { ConfirmImportInput } from "@/modules/data-import/application/ports/import-template.repository";
import { ImportJobNotReadyError } from "@/modules/data-import/domain/import-template.errors";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type MockTransactionClient = {
  readonly importJob: {
    readonly updateMany: jest.Mock;
  };
  readonly importJobRow: {
    readonly updateMany: jest.Mock;
  };
  readonly importUserLog: {
    readonly create: jest.Mock;
  };
  readonly importUserLogRow: {
    readonly create: jest.Mock;
  };
  readonly company: {
    readonly create: jest.Mock;
  };
  readonly companyField: {
    readonly upsert: jest.Mock;
  };
  readonly companyRegion: {
    readonly upsert: jest.Mock;
  };
};

const USER_ID = "00000000-0000-4000-8000-000000000101";
const IMPORT_JOB_ID = "00000000-0000-4000-8000-000000000301";
const IMPORT_USER_LOG_ID = "00000000-0000-4000-8000-000000000401";

describe("PrismaImportTemplateRepository persistent confirm", () => {
  it("moves the job to CONFIRMING inside the confirm transaction before creating data", async () => {
    const client = createTransactionClient();
    client.importJob.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });
    const repository = createRepository(client);

    const result = await repository.confirmCompanyImport(createConfirmInput());

    expect(result).toEqual({
      importUserLogId: IMPORT_USER_LOG_ID,
      importedRowCount: 1,
    });
    expect(client.importJob.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: IMPORT_JOB_ID,
        userId: USER_ID,
        status: "READY_TO_CONFIRM",
      },
      data: {
        status: "CONFIRMING",
        confirmIdempotencyKey: "confirm-1",
      },
    });
    expect(client.importJob.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: IMPORT_JOB_ID,
        userId: USER_ID,
        status: "CONFIRMING",
      },
      data: expect.objectContaining({
        status: "CONFIRMED",
        importedRowCount: 1,
        failedRowCount: 0,
        importUserLogId: IMPORT_USER_LOG_ID,
        confirmedAt: expect.any(Date),
      }),
    });
    expect(
      client.importJob.updateMany.mock.invocationCallOrder[0]!
    ).toBeLessThan(client.importUserLog.create.mock.invocationCallOrder[0]!);
  });

  it("stops the confirm transaction when the persistent status lock fails", async () => {
    const client = createTransactionClient();
    client.importJob.updateMany.mockResolvedValueOnce({ count: 0 });
    const repository = createRepository(client);

    await expect(
      repository.confirmCompanyImport(createConfirmInput())
    ).rejects.toBeInstanceOf(ImportJobNotReadyError);

    expect(client.importUserLog.create).not.toHaveBeenCalled();
    expect(client.company.create).not.toHaveBeenCalled();
    expect(client.importJobRow.updateMany).not.toHaveBeenCalled();
  });
});

function createRepository(
  client: MockTransactionClient
): PrismaImportTemplateRepository {
  const prismaService = {
    $transaction: jest.fn(
      async (work: (transaction: MockTransactionClient) => Promise<unknown>) =>
        work(client)
    ),
  };

  return new PrismaImportTemplateRepository(
    prismaService as unknown as PrismaService
  );
}

function createTransactionClient(): MockTransactionClient {
  return {
    importJob: {
      updateMany: jest.fn(),
    },
    importJobRow: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    importUserLog: {
      create: jest.fn().mockResolvedValue({ id: IMPORT_USER_LOG_ID }),
    },
    importUserLogRow: {
      create: jest.fn().mockResolvedValue({}),
    },
    company: {
      create: jest.fn().mockResolvedValue({ id: "company-1" }),
    },
    companyField: {
      upsert: jest.fn().mockResolvedValue({ id: "field-1", field: "SaaS" }),
    },
    companyRegion: {
      upsert: jest.fn().mockResolvedValue({ id: "region-1", region: "Seoul" }),
    },
  };
}

function createConfirmInput(): ConfirmImportInput {
  return {
    userId: USER_ID,
    importJobId: IMPORT_JOB_ID,
    idempotencyKey: "confirm-1",
    targetType: "COMPANY",
    templateVersion: "v1",
    templateColumnsJson: [],
    contextLabel: null,
    contextJson: null,
    originalFileName: "source.xlsx",
    fileSizeBytes: 100,
    rows: [
      {
        rowNumber: 2,
        submittedData: {
          companyName: "Acme",
          companyFieldName: "SaaS",
          companyRegionName: "Seoul",
        },
        targetLabel: "Acme",
      },
    ],
  };
}
