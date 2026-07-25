import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaContactRepository } from "./prisma-contact.repository";

type MockContactModel = {
  readonly findMany: jest.Mock;
  readonly count: jest.Mock;
};

type MockDealContactModel = {
  readonly groupBy: jest.Mock;
};

type MockPrismaClient = {
  readonly contact: MockContactModel;
  readonly dealContact: MockDealContactModel;
};

const USER_ID = "00000000-0000-4000-8000-000000000101";
const CONTACT_ID = "00000000-0000-4000-8000-000000000201";
const CREATED_AT = new Date("2026-07-26T01:00:00.000Z");

describe("PrismaContactRepository", () => {
  it("aggregates current page active deal counts with ownership and soft delete guards", async () => {
    const client = createMockClient();
    client.contact.findMany.mockResolvedValue([createContactRow()]);
    client.contact.count.mockResolvedValue(1);
    client.dealContact.groupBy.mockResolvedValue([
      {
        contactId: CONTACT_ID,
        _count: {
          _all: 2,
        },
      },
    ]);
    const repository = new PrismaContactRepository(
      client as unknown as PrismaService
    );

    const result = await repository.listContacts({
      userId: USER_ID,
      page: 1,
      pageSize: 15,
    });

    expect(client.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 15,
      })
    );
    expect(client.dealContact.groupBy).toHaveBeenCalledWith({
      by: ["contactId"],
      where: {
        userId: USER_ID,
        contactId: {
          in: [CONTACT_ID],
        },
        contact: {
          userId: USER_ID,
          deletedAt: null,
        },
        deal: {
          userId: USER_ID,
          deletedAt: null,
        },
      },
      _count: {
        _all: true,
      },
    });
    expect(result.items[0]?.dealCount).toBe(2);
  });
});

function createMockClient(): MockPrismaClient {
  return {
    contact: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    dealContact: {
      groupBy: jest.fn(),
    },
  };
}

function createContactRow() {
  return {
    id: CONTACT_ID,
    username: "김민수",
    mobile: "010-1111-2222",
    email: "minsu@example.com",
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    company: {
      id: "00000000-0000-4000-8000-000000000301",
      companyName: "A회사",
    },
    contactDepartment: {
      id: "00000000-0000-4000-8000-000000000302",
      departmentName: "영업",
    },
    contactJobGrade: {
      id: "00000000-0000-4000-8000-000000000303",
      jobGradeName: "팀장",
    },
  };
}
