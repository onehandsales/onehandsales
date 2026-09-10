import { SearchTargetType } from "@/modules/search/domain/search-target-type";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaSearchRepository } from "./prisma-search.repository";

const USER_ID = "00000000-0000-4000-8000-000000000101";

type FindManyMock<Row> = jest.Mock<Promise<Row[]>, [unknown]>;

type CompanyRow = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: { readonly field: string };
  readonly companyRegion: { readonly region: string };
};

type SearchPrismaMock = {
  readonly company: { readonly findMany: FindManyMock<CompanyRow> };
};

function createPrismaMock(): SearchPrismaMock {
  return {
    company: {
      findMany: jest.fn<Promise<CompanyRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "company-1",
          companyName: "OneHand Industries",
          companyField: { field: "Manufacturing" },
          companyRegion: { region: "Seoul" },
        },
      ]),
    },
  };
}

function createRepository(prisma: SearchPrismaMock): PrismaSearchRepository {
  return new PrismaSearchRepository(prisma as unknown as PrismaService);
}

describe("PrismaSearchRepository", () => {
  it("returns app route target paths for companies", async () => {
    const prisma = createPrismaMock();
    const repository = createRepository(prisma);

    const groups = await repository.search({
      userId: USER_ID,
      query: "OneHand",
      types: [SearchTargetType.COMPANY],
      limit: 5,
    });

    expect(
      groups.map((group) => [group.type, group.items[0]?.targetPath])
    ).toEqual([[SearchTargetType.COMPANY, "/app/companies/company-1"]]);
  });

  it("scopes company search by user", async () => {
    const prisma = createPrismaMock();
    const repository = createRepository(prisma);

    await repository.search({
      userId: USER_ID,
      query: "OneHand",
      types: [SearchTargetType.COMPANY],
      limit: 5,
    });

    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: USER_ID,
        }),
      })
    );
  });
});
