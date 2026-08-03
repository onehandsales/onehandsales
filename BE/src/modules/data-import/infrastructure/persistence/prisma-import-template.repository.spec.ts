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

type MockCleanupPrismaService = {
  readonly importUserLogRow: {
    readonly findMany: jest.Mock;
    readonly deleteMany: jest.Mock;
  };
  readonly importUserLog: {
    readonly deleteMany: jest.Mock;
  };
  readonly company: {
    readonly deleteMany: jest.Mock;
  };
  readonly contact: {
    readonly deleteMany: jest.Mock;
  };
  readonly product: {
    readonly deleteMany: jest.Mock;
  };
  readonly deal: {
    readonly deleteMany: jest.Mock;
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

  it("deletes 31-day-old import success row snapshots and retains 29-day rows", async () => {
    const prismaService = createCleanupPrismaService();
    const repository = new PrismaImportTemplateRepository(
      prismaService as unknown as PrismaService
    );
    const cleanupCutoffAt = new Date("2026-06-21T00:00:00.000Z");
    const thirtyOneDayRowAt = new Date("2026-06-20T00:00:00.000Z");
    const retainedTwentyNineDayRowAt = new Date("2026-06-22T00:00:00.000Z");
    prismaService.importUserLogRow.findMany.mockResolvedValue([
      { id: "row-old-1" },
      { id: "row-old-2" },
    ]);
    prismaService.importUserLogRow.deleteMany.mockResolvedValue({ count: 2 });

    const deletedCount = await repository.deleteImportUserLogRowsBefore(
      cleanupCutoffAt,
      500
    );

    expect(thirtyOneDayRowAt.getTime()).toBeLessThanOrEqual(
      cleanupCutoffAt.getTime()
    );
    expect(cleanupCutoffAt.getTime()).toBeLessThan(
      retainedTwentyNineDayRowAt.getTime()
    );
    expect(prismaService.importUserLogRow.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: { lte: cleanupCutoffAt },
      },
      select: {
        id: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: 500,
    });
    expect(prismaService.importUserLogRow.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["row-old-1", "row-old-2"] },
      },
    });
    expect(prismaService.importUserLog.deleteMany).not.toHaveBeenCalled();
    expect(prismaService.company.deleteMany).not.toHaveBeenCalled();
    expect(prismaService.contact.deleteMany).not.toHaveBeenCalled();
    expect(prismaService.product.deleteMany).not.toHaveBeenCalled();
    expect(prismaService.deal.deleteMany).not.toHaveBeenCalled();
    expect(deletedCount).toBe(2);
  });

  it("does not issue deleteMany when import success row cleanup has no candidates", async () => {
    const prismaService = createCleanupPrismaService();
    const repository = new PrismaImportTemplateRepository(
      prismaService as unknown as PrismaService
    );
    prismaService.importUserLogRow.findMany.mockResolvedValue([]);

    const deletedCount = await repository.deleteImportUserLogRowsBefore(
      new Date("2026-06-21T00:00:00.000Z"),
      500
    );

    expect(prismaService.importUserLogRow.deleteMany).not.toHaveBeenCalled();
    expect(deletedCount).toBe(0);
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

function createCleanupPrismaService(): MockCleanupPrismaService {
  return {
    importUserLogRow: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    importUserLog: {
      deleteMany: jest.fn(),
    },
    company: {
      deleteMany: jest.fn(),
    },
    contact: {
      deleteMany: jest.fn(),
    },
    product: {
      deleteMany: jest.fn(),
    },
    deal: {
      deleteMany: jest.fn(),
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
