import { Inject, Injectable } from "@nestjs/common";
import {
  ADMIN_QUERY_REPOSITORY,
  type AdminQueryRepository,
} from "@/modules/admin/application/ports/admin-query.repository";
import {
  normalizeDealStage,
  normalizeOptionalText,
  normalizePage,
  normalizePageSize,
  normalizeUserRole,
  normalizeUserStatus,
} from "./admin-query-input";

export interface AdminListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly userId?: string;
  readonly includeDeleted?: boolean;
}

export interface AdminContactListQuery extends AdminListQuery {
  readonly companyId?: string;
}

export interface AdminDealListQuery extends AdminListQuery {
  readonly stage?: string;
}

export interface AdminUserListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly status?: string;
  readonly role?: string;
}

@Injectable()
export class AdminQueryUseCase {
  constructor(
    @Inject(ADMIN_QUERY_REPOSITORY)
    private readonly adminQueryRepository: AdminQueryRepository
  ) {}

  getDashboard() {
    return this.adminQueryRepository.getDashboard();
  }

  listUsers(query: AdminUserListQuery) {
    return this.adminQueryRepository.listUsers({
      page: normalizePage(query.page),
      pageSize: normalizePageSize(query.pageSize),
      search: normalizeOptionalText(query.search),
      status: normalizeUserStatus(query.status),
      role: normalizeUserRole(query.role),
    });
  }

  getUser(userId: string) {
    return this.adminQueryRepository.getUser(userId);
  }

  async listCompanies(query: AdminListQuery, userId?: string) {
    const targetUserId = userId ?? normalizeOptionalText(query.userId) ?? undefined;

    if (targetUserId) {
      await this.adminQueryRepository.ensureUserExists(targetUserId);
    }

    return this.adminQueryRepository.listCompanies({
      ...this.normalizeListQuery(query),
      ...(targetUserId ? { userId: targetUserId } : {}),
    });
  }

  getCompany(companyId: string) {
    return this.adminQueryRepository.getCompany(companyId);
  }

  async listContacts(query: AdminContactListQuery, userId?: string) {
    const targetUserId = userId ?? normalizeOptionalText(query.userId) ?? undefined;

    if (targetUserId) {
      await this.adminQueryRepository.ensureUserExists(targetUserId);
    }

    return this.adminQueryRepository.listContacts({
      ...this.normalizeListQuery(query),
      ...(targetUserId ? { userId: targetUserId } : {}),
      ...this.normalizeOptionalCompanyId(query.companyId),
    });
  }

  getContact(contactId: string) {
    return this.adminQueryRepository.getContact(contactId);
  }

  async listProducts(query: AdminListQuery, userId?: string) {
    const targetUserId = userId ?? normalizeOptionalText(query.userId) ?? undefined;

    if (targetUserId) {
      await this.adminQueryRepository.ensureUserExists(targetUserId);
    }

    return this.adminQueryRepository.listProducts({
      ...this.normalizeListQuery(query),
      ...(targetUserId ? { userId: targetUserId } : {}),
    });
  }

  getProduct(productId: string) {
    return this.adminQueryRepository.getProduct(productId);
  }

  async listDeals(query: AdminDealListQuery, userId?: string) {
    const targetUserId = userId ?? normalizeOptionalText(query.userId) ?? undefined;

    if (targetUserId) {
      await this.adminQueryRepository.ensureUserExists(targetUserId);
    }

    return this.adminQueryRepository.listDeals({
      ...this.normalizeListQuery(query),
      ...(targetUserId ? { userId: targetUserId } : {}),
      stage: normalizeDealStage(query.stage),
    });
  }

  getDeal(dealId: string) {
    return this.adminQueryRepository.getDeal(dealId);
  }

  private normalizeListQuery(query: AdminListQuery) {
    return {
      page: normalizePage(query.page),
      pageSize: normalizePageSize(query.pageSize),
      search: normalizeOptionalText(query.search),
      includeDeleted: query.includeDeleted ?? false,
    };
  }

  private normalizeOptionalCompanyId(companyId: string | undefined) {
    const normalized = normalizeOptionalText(companyId);

    return normalized ? { companyId: normalized } : {};
  }
}
