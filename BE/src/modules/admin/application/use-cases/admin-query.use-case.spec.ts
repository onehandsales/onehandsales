import {
  maskEmail,
  maskMoney,
  maskPhone,
} from "@/modules/admin/application/admin-masking";
import type {
  AdminCompanyDetailResponse,
  AdminCompanyListItem,
  AdminContactDetailResponse,
  AdminContactListItem,
  AdminDashboardResponse,
  AdminDealDetailResponse,
  AdminDealListInput,
  AdminDealListItem,
  AdminListInput,
  AdminPaginatedResult,
  AdminProductDetailResponse,
  AdminProductListItem,
  AdminQueryRepository,
  AdminUserDetailResponse,
  AdminUserListInput,
  AdminUserResponse,
} from "@/modules/admin/application/ports/admin-query.repository";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AdminQueryUseCase } from "./admin-query.use-case";

class FakeAdminQueryRepository implements AdminQueryRepository {
  listUsersInput: AdminUserListInput | null = null;
  listCompaniesInput: AdminListInput | null = null;
  listDealsInput: AdminDealListInput | null = null;
  ensuredUserIds: string[] = [];

  async getDashboard(): Promise<AdminDashboardResponse> {
    return {
      userCount: 1,
      activeUserCount: 1,
      companyCount: 0,
      contactCount: 0,
      productCount: 0,
      dealCount: 0,
      recentAuditLogs: [],
    };
  }

  async listUsers(
    input: AdminUserListInput
  ): Promise<AdminPaginatedResult<AdminUserResponse>> {
    this.listUsersInput = input;

    return emptyPage(input);
  }

  async getUser(): Promise<AdminUserDetailResponse> {
    return {
      user: createAdminUser(),
      settings: null,
      usageSummary: {
        companyCount: 0,
        contactCount: 0,
        productCount: 0,
        dealCount: 0,
      },
      recentAuditLogs: [],
    };
  }

  async ensureUserExists(userId: string): Promise<void> {
    this.ensuredUserIds.push(userId);
  }

  async listCompanies(
    input: AdminListInput
  ): Promise<AdminPaginatedResult<AdminCompanyListItem>> {
    this.listCompaniesInput = input;

    return emptyPage(input);
  }

  async getCompany(): Promise<AdminCompanyDetailResponse> {
    throw new Error("Not used");
  }

  async listContacts(): Promise<AdminPaginatedResult<AdminContactListItem>> {
    return emptyPage({ page: 1, pageSize: 20 });
  }

  async getContact(): Promise<AdminContactDetailResponse> {
    throw new Error("Not used");
  }

  async listProducts(): Promise<AdminPaginatedResult<AdminProductListItem>> {
    return emptyPage({ page: 1, pageSize: 20 });
  }

  async getProduct(): Promise<AdminProductDetailResponse> {
    throw new Error("Not used");
  }

  async listDeals(
    input: AdminDealListInput
  ): Promise<AdminPaginatedResult<AdminDealListItem>> {
    this.listDealsInput = input;

    return emptyPage(input);
  }

  async getDeal(): Promise<AdminDealDetailResponse> {
    throw new Error("Not used");
  }
}

describe("AdminQueryUseCase", () => {
  it("normalizes user list query", async () => {
    const repository = new FakeAdminQueryRepository();
    const useCase = new AdminQueryUseCase(repository);

    await useCase.listUsers({
      page: 2,
      pageSize: 10,
      search: "  admin@example.com  ",
      role: "admin",
      status: "active",
    });

    expect(repository.listUsersInput).toEqual({
      page: 2,
      pageSize: 10,
      search: "admin@example.com",
      role: "ADMIN",
      status: "ACTIVE",
    });
  });

  it("requires target user existence for user-scoped domain lists", async () => {
    const repository = new FakeAdminQueryRepository();
    const useCase = new AdminQueryUseCase(repository);

    await useCase.listCompanies({ includeDeleted: true }, "user-1");

    expect(repository.ensuredUserIds).toEqual(["user-1"]);
    expect(repository.listCompaniesInput).toEqual({
      page: 1,
      pageSize: 20,
      search: null,
      includeDeleted: true,
      userId: "user-1",
    });
  });

  it("normalizes deal stage filters", async () => {
    const repository = new FakeAdminQueryRepository();
    const useCase = new AdminQueryUseCase(repository);

    await useCase.listDeals({ search: " 딜 ", stage: "won" });

    expect(repository.listDealsInput).toEqual({
      page: 1,
      pageSize: 20,
      search: "딜",
      includeDeleted: false,
      stage: "WON",
    });
  });

  it("rejects invalid enum filters", async () => {
    const repository = new FakeAdminQueryRepository();
    const useCase = new AdminQueryUseCase(repository);

    expect(() => useCase.listUsers({ role: "OWNER" })).toThrow(
      ValidationDomainError
    );
  });
});

describe("admin masking", () => {
  it("masks PII and money fields", () => {
    expect(maskEmail("sales@example.com")).toBe("s***s@example.com");
    expect(maskPhone("010-1234-5678")).toBe("***-****-5678");
    expect(maskMoney("1000000")).toBe("MASKED");
  });
});

function emptyPage<TItem>(input: {
  readonly page: number;
  readonly pageSize: number;
}): AdminPaginatedResult<TItem> {
  return {
    items: [],
    page: input.page,
    pageSize: input.pageSize,
    totalCount: 0,
    hasNext: false,
  };
}

function createAdminUser(): AdminUserResponse {
  return {
    id: "user-1",
    name: "관리자",
    emailMasked: "a***n@example.com",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-06-07T00:00:00.000Z",
    lastLoginAt: null,
    deletedAt: null,
    permanentDeleteAt: null,
  };
}
