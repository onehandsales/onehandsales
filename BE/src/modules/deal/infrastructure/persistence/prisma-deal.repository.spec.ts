import { DealListSort } from "@/modules/deal/application/ports/deal-query.types";
import { DealStatusCode } from "@/modules/deal/domain/deal-status";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaDealRepository } from "./prisma-deal.repository";

type MockModel = {
  readonly findMany: jest.Mock;
  readonly count: jest.Mock;
};

type MockPrismaClient = {
  readonly deal: MockModel;
  readonly dealFollowingActionLog: Pick<MockModel, "findMany">;
  readonly dealProduct: Pick<MockModel, "findMany">;
  readonly dealActivity: Pick<MockModel, "findMany">;
};

const USER_ID = "00000000-0000-4000-8000-000000000101";
const DEAL_ID = "00000000-0000-4000-8000-000000000201";
const CREATED_AT = new Date("2026-07-26T01:00:00.000Z");
const LATEST_ACTIVITY_AT = new Date("2026-07-26T02:00:00.000Z");

describe("PrismaDealRepository", () => {
  it("aggregates current page deal products and latest activities with ownership and active deal guards", async () => {
    const client = createMockClient();
    client.deal.findMany.mockResolvedValue([createDealRow()]);
    client.deal.count.mockResolvedValue(1);
    client.dealFollowingActionLog.findMany.mockResolvedValue([]);
    client.dealProduct.findMany.mockResolvedValue([
      {
        dealId: DEAL_ID,
        product: createProductSummaryRow(),
      },
    ]);
    client.dealActivity.findMany.mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000401",
        dealId: DEAL_ID,
        activityType: "FOLLOW_UP_SENT",
        title: "이메일 follow-up을 보냈어요.",
        summary: "담당자에게 발송됨",
        occurredAt: LATEST_ACTIVITY_AT,
      },
      {
        id: "00000000-0000-4000-8000-000000000402",
        dealId: DEAL_ID,
        activityType: "DEAL_CREATED",
        title: "딜을 만들었어요.",
        summary: "7월 신규 도입 상담",
        occurredAt: CREATED_AT,
      },
    ]);
    const repository = new PrismaDealRepository(
      client as unknown as PrismaService
    );

    const result = await repository.listDeals({
      userId: USER_ID,
      page: 1,
      pageSize: 15,
      sort: DealListSort.CREATED_AT_DESC,
    });

    expect(client.deal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 15,
      })
    );
    expect(client.dealProduct.findMany).toHaveBeenCalledWith({
      where: {
        userId: USER_ID,
        dealId: {
          in: [DEAL_ID],
        },
        deal: {
          userId: USER_ID,
          deletedAt: null,
        },
        product: {
          userId: USER_ID,
        },
      },
      select: {
        dealId: true,
        product: {
          select: {
            id: true,
            productName: true,
            deletedAt: true,
            productCategory: {
              select: {
                id: true,
                categoryName: true,
              },
            },
            productStatus: {
              select: {
                id: true,
                statusName: true,
              },
            },
          },
        },
      },
      orderBy: [{ dealId: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });
    expect(client.dealActivity.findMany).toHaveBeenCalledWith({
      where: {
        userId: USER_ID,
        dealId: {
          in: [DEAL_ID],
        },
        deal: {
          userId: USER_ID,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        dealId: true,
        activityType: true,
        title: true,
        summary: true,
        occurredAt: true,
      },
      orderBy: [{ dealId: "asc" }, { occurredAt: "desc" }, { id: "desc" }],
    });
    expect(result.items[0]?.products).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000301",
        productName: "Sales Starter",
        isDeleted: false,
        productCategory: {
          id: "00000000-0000-4000-8000-000000000302",
          categoryName: "SaaS",
        },
        productStatus: {
          id: "00000000-0000-4000-8000-000000000303",
          statusName: "판매중",
        },
      },
    ]);
    expect(result.items[0]?.latestActivity).toEqual({
      id: "00000000-0000-4000-8000-000000000401",
      activityType: "FOLLOW_UP_SENT",
      title: "이메일 follow-up을 보냈어요.",
      summary: "담당자에게 발송됨",
      occurredAt: LATEST_ACTIVITY_AT,
    });
  });
});

function createMockClient(): MockPrismaClient {
  return {
    deal: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    dealFollowingActionLog: {
      findMany: jest.fn(),
    },
    dealProduct: {
      findMany: jest.fn(),
    },
    dealActivity: {
      findMany: jest.fn(),
    },
  };
}

function createDealRow() {
  return {
    id: DEAL_ID,
    dealName: "7월 신규 도입 상담",
    dealCost: 3000000,
    dealStatus: DealStatusCode.INITIAL_CONTACT,
    expectedEndDate: new Date("2026-08-31T00:00:00.000Z"),
    dealCompanies: [
      {
        company: {
          id: "00000000-0000-4000-8000-000000000501",
          companyName: "A회사",
          deletedAt: null,
          companyField: {
            id: "00000000-0000-4000-8000-000000000502",
            field: "SaaS",
          },
          companyRegion: {
            id: "00000000-0000-4000-8000-000000000503",
            region: "Seoul",
          },
        },
      },
    ],
    dealContacts: [
      {
        contact: {
          id: "00000000-0000-4000-8000-000000000601",
          username: "김민수",
          deletedAt: null,
          companyId: "00000000-0000-4000-8000-000000000501",
          company: {
            id: "00000000-0000-4000-8000-000000000501",
            companyName: "A회사",
            deletedAt: null,
          },
          mobile: "010-1111-2222",
          email: "minsu@example.com",
          contactJobGrade: {
            id: "00000000-0000-4000-8000-000000000602",
            jobGradeName: "팀장",
          },
          contactDepartment: {
            id: "00000000-0000-4000-8000-000000000603",
            departmentName: "영업",
          },
        },
      },
    ],
    followingActionLogs: [],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
}

function createProductSummaryRow() {
  return {
    id: "00000000-0000-4000-8000-000000000301",
    productName: "Sales Starter",
    deletedAt: null,
    productCategory: {
      id: "00000000-0000-4000-8000-000000000302",
      categoryName: "SaaS",
    },
    productStatus: {
      id: "00000000-0000-4000-8000-000000000303",
      statusName: "판매중",
    },
  };
}
