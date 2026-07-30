import { PrismaProductAnalyticsRepository } from "@/modules/analytics/infrastructure/persistence/prisma-product-analytics.repository";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const USER_ID = "00000000-0000-4000-8000-000000000101";

// 기능 : Decimal field 테스트 대역을 생성합니다.
function createDecimalFake(value: string): { toString: () => string } {
  return {
    toString: () => value,
  };
}

// 기능 : AiProviderCallLog Prisma delegate 테스트 대역을 생성합니다.
function createPrismaClientFake() {
  const findManyMock = jest.fn().mockResolvedValue([
    {
      costCurrency: "USD",
      estimatedCostAmount: createDecimalFake("0.010000"),
      operation: "MEETING_NOTE_TEXT_DRAFT",
      startedAt: new Date("2026-07-29T15:30:00.000Z"),
      status: "SUCCEEDED",
      totalTokenCount: 100,
      user: {
        id: USER_ID,
        timeZone: "Asia/Seoul",
      },
      userId: USER_ID,
    },
  ]);

  return {
    findManyMock,
    prismaClient: {
      aiProviderCallLog: {
        findMany: findManyMock,
      },
    } as unknown as PrismaService,
  };
}

describe("PrismaProductAnalyticsRepository", () => {
  it("selects only redacted AI usage summary fields", async () => {
    const { findManyMock, prismaClient } = createPrismaClientFake();
    const repository = new PrismaProductAnalyticsRepository(prismaClient);
    const from = new Date("2026-07-01T00:00:00.000Z");
    const to = new Date("2026-07-31T23:59:59.999Z");

    const rows = await repository.listAiUsageProviderCallLogsForSummary({
      from,
      to,
      userId: USER_ID,
    });

    expect(rows).toEqual([
      {
        costCurrency: "USD",
        estimatedCostAmount: "0.010000",
        operation: "MEETING_NOTE_TEXT_DRAFT",
        startedAt: new Date("2026-07-29T15:30:00.000Z"),
        status: "SUCCEEDED",
        totalTokenCount: 100,
        userId: USER_ID,
        userTimeZone: "Asia/Seoul",
      },
    ]);
    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: [{ userId: "asc" }, { startedAt: "asc" }, { id: "asc" }],
      select: {
        costCurrency: true,
        estimatedCostAmount: true,
        operation: true,
        startedAt: true,
        status: true,
        totalTokenCount: true,
        user: {
          select: {
            id: true,
            timeZone: true,
          },
        },
        userId: true,
      },
      where: {
        startedAt: {
          gte: from,
          lte: to,
        },
        userId: USER_ID,
      },
    });
    const query = JSON.stringify(findManyMock.mock.calls[0]?.[0]);
    expect(query).not.toContain("metadataJson");
    expect(query).not.toContain("safeErrorMessage");
    expect(query).not.toContain("email");
    expect(query).not.toContain("displayName");
  });
});
