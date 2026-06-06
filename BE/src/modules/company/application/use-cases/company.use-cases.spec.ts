import type {
  CompanyDetailRecord,
  CompanyLogRecord,
  CompanyRecord,
  CompanyRepository,
  CreateCompanyInput,
  DeleteResultRecord,
  ListCompaniesInput,
  PaginatedResult,
} from "@/modules/company/application/ports/company.repository";
import {
  DeletedResourceError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CreateCompanyUseCase } from "./create-company.use-case";
import { DeleteCompanyUseCase } from "./delete-company.use-case";
import { GetCompanyUseCase } from "./get-company.use-case";
import { ListCompaniesUseCase } from "./list-companies.use-case";

class FakeCompanyRepository implements CompanyRepository {
  createInput: CreateCompanyInput | null = null;
  listInput: ListCompaniesInput | null = null;
  deleteInput: {
    readonly userId: string;
    readonly companyId: string;
  } | null = null;
  detail: CompanyDetailRecord | null = null;

  async listCompanies(
    input: ListCompaniesInput
  ): Promise<PaginatedResult<CompanyRecord>> {
    this.listInput = input;

    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 0,
      hasNext: false,
    };
  }

  async createCompany(input: CreateCompanyInput): Promise<CompanyRecord> {
    this.createInput = input;

    return createCompanyRecord({
      id: "company-1",
      userId: input.userId,
      name: input.name,
      deletedAt: null,
    });
  }

  async getCompanyDetail(): Promise<CompanyDetailRecord | null> {
    return this.detail;
  }

  async updateCompany(): Promise<CompanyRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async deleteCompany(
    userId: string,
    companyId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    this.deleteInput = { userId, companyId };

    return {
      id: companyId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async restoreCompany(): Promise<CompanyRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async listCompanyLogs(): Promise<PaginatedResult<CompanyLogRecord>> {
    throw new Error("Not implemented in fake repository");
  }

  async createCompanyLog(): Promise<CompanyLogRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async updateCompanyLog(): Promise<CompanyLogRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async deleteCompanyLog(): Promise<DeleteResultRecord> {
    throw new Error("Not implemented in fake repository");
  }
}

describe("Company use cases", () => {
  it("normalizes create input and passes current user ownership", async () => {
    const repository = new FakeCompanyRepository();
    const useCase = new CreateCompanyUseCase(repository);

    await useCase.execute(currentUser(), {
      name: "  에이컴 코리아  ",
      industry: "  IT  ",
      region: "  서울  ",
      address: "  강남구  ",
      website: "  https://example.com  ",
      description: "  테스트 회사  ",
      initialMemo: "  첫 메모  ",
      tags: [" 핵심 ", "핵심", "  "],
    });

    expect(repository.createInput).toMatchObject({
      userId: "user-1",
      name: "에이컴 코리아",
      industry: "IT",
      region: "서울",
      address: "강남구",
      website: "https://example.com",
      description: "테스트 회사",
      initialMemo: "첫 메모",
      tags: ["핵심"],
    });
  });

  it("rejects whitespace-only required company names", async () => {
    const repository = new FakeCompanyRepository();
    const useCase = new CreateCompanyUseCase(repository);

    await expect(
      useCase.execute(currentUser(), {
        name: "   ",
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
  });

  it("normalizes list pagination and search", async () => {
    const repository = new FakeCompanyRepository();
    const useCase = new ListCompaniesUseCase(repository);

    await useCase.execute(currentUser(), {
      page: -1,
      pageSize: 500,
      search: "  에이컴  ",
      includeDeleted: true,
    });

    expect(repository.listInput).toEqual({
      userId: "user-1",
      page: 1,
      pageSize: 100,
      search: "에이컴",
      includeDeleted: true,
    });
  });

  it("returns DeletedResource for deleted company detail reads", async () => {
    const repository = new FakeCompanyRepository();
    repository.detail = {
      company: createCompanyRecord({
        id: "company-1",
        userId: "user-1",
        name: "삭제된 회사",
        deletedAt: new Date("2026-06-06T00:00:00.000Z"),
      }),
      logs: [],
      memos: [],
      contactCount: 0,
      dealCount: 0,
      productCount: 0,
    };
    const useCase = new GetCompanyUseCase(repository);

    await expect(
      useCase.execute(currentUser(), "company-1")
    ).rejects.toBeInstanceOf(DeletedResourceError);
  });

  it("passes current user ownership to delete", async () => {
    const repository = new FakeCompanyRepository();
    const useCase = new DeleteCompanyUseCase(repository);

    const response = await useCase.execute(currentUser(), "company-1");

    expect(repository.deleteInput).toEqual({
      userId: "user-1",
      companyId: "company-1",
    });
    expect(response.id).toBe("company-1");
  });
});

function currentUser(): CurrentUserContext {
  return {
    id: "user-1",
    sessionId: "session-1",
    email: "user@example.com",
    displayName: "User",
    role: "USER",
    status: "ACTIVE",
  };
}

function createCompanyRecord(input: {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly deletedAt: Date | null;
}): CompanyRecord {
  const now = new Date("2026-06-06T00:00:00.000Z");

  return {
    id: input.id,
    userId: input.userId,
    name: input.name,
    industry: null,
    region: null,
    description: null,
    metadata: {
      address: null,
      website: null,
    },
    tags: [],
    memoSummary: {
      hasMemo: false,
      memoCount: 0,
      latestMemoAt: null,
    },
    createdAt: now,
    updatedAt: now,
    deletedAt: input.deletedAt,
    permanentDeleteAt: null,
  };
}
