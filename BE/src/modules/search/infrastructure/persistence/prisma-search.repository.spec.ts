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

type ContactRow = {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly mobile: string;
  readonly phoneCountryCode: string | null;
  readonly phoneNationalNumber: string | null;
  readonly phoneE164: string | null;
  readonly company: { readonly companyName: string };
  readonly contactDepartment: { readonly departmentName: string };
  readonly contactJobGrade: { readonly jobGradeName: string };
};

type ProductRow = {
  readonly id: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategory: { readonly categoryName: string };
  readonly productStatus: { readonly statusName: string };
};

type DealRow = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: string;
  readonly dealCompanies: ReadonlyArray<{
    readonly company: { readonly companyName: string };
  }>;
  readonly dealContacts: ReadonlyArray<{
    readonly contact: { readonly username: string };
  }>;
};

type SearchPrismaMock = {
  readonly company: { readonly findMany: FindManyMock<CompanyRow> };
  readonly contact: { readonly findMany: FindManyMock<ContactRow> };
  readonly product: { readonly findMany: FindManyMock<ProductRow> };
  readonly deal: { readonly findMany: FindManyMock<DealRow> };
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
    contact: {
      findMany: jest.fn<Promise<ContactRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "contact-1",
          username: "Sales Lead",
          email: "sales@example.com",
          mobile: "010-0000-0000",
          phoneCountryCode: "82",
          phoneNationalNumber: "01000000000",
          phoneE164: "+821000000000",
          company: { companyName: "OneHand Industries" },
          contactDepartment: { departmentName: "Sales" },
          contactJobGrade: { jobGradeName: "Manager" },
        },
      ]),
    },
    product: {
      findMany: jest.fn<Promise<ProductRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "product-1",
          productName: "Sales Workspace",
          productPrice: 1000000,
          productCategory: { categoryName: "SaaS" },
          productStatus: { statusName: "Active" },
        },
      ]),
    },
    deal: {
      findMany: jest.fn<Promise<DealRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "deal-1",
          dealName: "August Proposal",
          dealCost: 5000000,
          dealStatus: "NEGOTIATION",
          dealCompanies: [{ company: { companyName: "OneHand Industries" } }],
          dealContacts: [{ contact: { username: "Sales Lead" } }],
        },
      ]),
    },
  };
}

function createRepository(prisma: SearchPrismaMock): PrismaSearchRepository {
  return new PrismaSearchRepository(prisma as unknown as PrismaService);
}

describe("PrismaSearchRepository", () => {
  it("returns app route target paths for searchable CRM domains", async () => {
    const prisma = createPrismaMock();
    const repository = createRepository(prisma);

    const groups = await repository.search({
      userId: USER_ID,
      query: "OneHand",
      types: [
        SearchTargetType.COMPANY,
        SearchTargetType.CONTACT,
        SearchTargetType.PRODUCT,
        SearchTargetType.DEAL,
      ],
      limit: 5,
    });

    expect(
      groups.map((group) => [group.type, group.items[0]?.targetPath])
    ).toEqual([
      [SearchTargetType.COMPANY, "/app/companies/company-1"],
      [SearchTargetType.CONTACT, "/app/contacts/contact-1"],
      [SearchTargetType.PRODUCT, "/app/products/product-1"],
      [SearchTargetType.DEAL, "/app/deals/deal-1"],
    ]);
  });

  it("scopes deal search by user and excludes deleted rows", async () => {
    const prisma = createPrismaMock();
    const repository = createRepository(prisma);

    await repository.search({
      userId: USER_ID,
      query: "proposal",
      types: [SearchTargetType.DEAL],
      limit: 5,
    });

    expect(prisma.deal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: USER_ID,
          deletedAt: null,
        }),
      })
    );
  });
});
