import type { DealStage, UserRole, UserStatus } from "@prisma/client";

export const ADMIN_QUERY_REPOSITORY = Symbol("ADMIN_QUERY_REPOSITORY");

export interface AdminPageInput {
  readonly page: number;
  readonly pageSize: number;
}

export interface AdminListInput extends AdminPageInput {
  readonly search: string | null;
  readonly userId?: string;
  readonly includeDeleted: boolean;
}

export interface AdminUserListInput extends AdminPageInput {
  readonly search: string | null;
  readonly status: UserStatus | null;
  readonly role: UserRole | null;
}

export interface AdminDealListInput extends AdminListInput {
  readonly stage: DealStage | null;
}

export interface AdminContactListInput extends AdminListInput {
  readonly companyId?: string;
}

export interface AdminPaginatedResult<TItem> {
  readonly items: readonly TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

export interface AdminAuditLogSummary {
  readonly id: string;
  readonly actorUserId: string | null;
  readonly actorUserName: string | null;
  readonly targetUserId: string | null;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string | null;
  readonly reasonSummary: string | null;
  readonly createdAt: string;
}

export interface AdminDashboardResponse {
  readonly userCount: number;
  readonly activeUserCount: number;
  readonly companyCount: number;
  readonly contactCount: number;
  readonly productCount: number;
  readonly dealCount: number;
  readonly recentAuditLogs: readonly AdminAuditLogSummary[];
}

export interface AdminUserResponse {
  readonly id: string;
  readonly name: string | null;
  readonly emailMasked: string | null;
  readonly role: string;
  readonly status: string;
  readonly createdAt: string;
  readonly lastLoginAt: string | null;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface AdminUserDetailResponse {
  readonly user: AdminUserResponse;
  readonly settings: AdminUserSettingResponse | null;
  readonly usageSummary: AdminUsageSummary;
  readonly recentAuditLogs: readonly AdminAuditLogSummary[];
}

export interface AdminUserSettingResponse {
  readonly defaultScheduleReminderMinutes: number;
  readonly defaultNextActionReminderMinutes: number;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
  readonly sensitiveSaveWarningEnabled: boolean;
}

export interface AdminUsageSummary {
  readonly companyCount: number;
  readonly contactCount: number;
  readonly productCount: number;
  readonly dealCount: number;
}

export interface AdminOwnerResponse {
  readonly id: string;
  readonly name: string | null;
  readonly emailMasked: string | null;
  readonly status: string;
}

export interface AdminMemoSummary {
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: string | null;
}

export interface AdminLogSummary {
  readonly id: string;
  readonly title: string;
  readonly logDate: string;
  readonly deletedAt: string | null;
}

export interface AdminActivitySummary {
  readonly id: string;
  readonly title: string;
  readonly activityDate: string;
  readonly deletedAt: string | null;
}

export interface AdminCompanyListItem {
  readonly id: string;
  readonly userId: string;
  readonly userName: string | null;
  readonly name: string;
  readonly industry: string | null;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface AdminCompanyDetailResponse {
  readonly company: AdminCompanyListItem & {
    readonly location: string | null;
    readonly description: string | null;
  };
  readonly owner: AdminOwnerResponse;
  readonly usageSummary: {
    readonly contactCount: number;
    readonly dealCount: number;
    readonly productConnectionCount: number;
  };
  readonly memoSummary: AdminMemoSummary;
  readonly recentLogs: readonly AdminLogSummary[];
}

export interface AdminContactListItem {
  readonly id: string;
  readonly userId: string;
  readonly userName: string | null;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly name: string;
  readonly department: string | null;
  readonly position: string | null;
  readonly phoneMasked: string | null;
  readonly emailMasked: string | null;
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: string | null;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface AdminContactDetailResponse {
  readonly contact: AdminContactListItem & {
    readonly location: string | null;
  };
  readonly owner: AdminOwnerResponse;
  readonly company: { readonly id: string; readonly name: string } | null;
  readonly usageSummary: { readonly dealCount: number };
  readonly memoSummary: AdminMemoSummary;
  readonly recentLogs: readonly AdminLogSummary[];
}

export interface AdminProductListItem {
  readonly id: string;
  readonly userId: string;
  readonly userName: string | null;
  readonly name: string;
  readonly category: string | null;
  readonly unitPriceMasked: string | null;
  readonly currency: string | null;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface AdminProductDetailResponse {
  readonly product: AdminProductListItem & {
    readonly description: string | null;
  };
  readonly owner: AdminOwnerResponse;
  readonly connectionSummary: {
    readonly totalCount: number;
    readonly companyCount: number;
    readonly contactCount: number;
    readonly dealCount: number;
  };
  readonly memoSummary: AdminMemoSummary;
  readonly recentLogs: readonly AdminLogSummary[];
}

export interface AdminDealListItem {
  readonly id: string;
  readonly userId: string;
  readonly userName: string | null;
  readonly title: string;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly contactId: string | null;
  readonly contactName: string | null;
  readonly amountMasked: string | null;
  readonly currency: string;
  readonly stage: string;
  readonly likelihoodStatus: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface AdminDealDetailResponse {
  readonly deal: AdminDealListItem & {
    readonly likelihoodPercent: number | null;
    readonly nextActionTitle: string | null;
    readonly nextActionDueAt: string | null;
    readonly nextActionStatus: string;
    readonly expectedCloseDate: string | null;
  };
  readonly owner: AdminOwnerResponse;
  readonly company: { readonly id: string; readonly name: string } | null;
  readonly contact: { readonly id: string; readonly name: string } | null;
  readonly productSummary: { readonly connectionCount: number };
  readonly activitySummary: {
    readonly totalCount: number;
    readonly recentActivities: readonly AdminActivitySummary[];
  };
  readonly memoSummary: AdminMemoSummary;
  readonly schedulesSummary: { readonly totalCount: number };
  readonly meetingNotesSummary: { readonly totalCount: number };
}

export interface AdminQueryRepository {
  getDashboard(): Promise<AdminDashboardResponse>;
  listUsers(
    input: AdminUserListInput
  ): Promise<AdminPaginatedResult<AdminUserResponse>>;
  getUser(userId: string): Promise<AdminUserDetailResponse>;
  ensureUserExists(userId: string): Promise<void>;
  listCompanies(
    input: AdminListInput
  ): Promise<AdminPaginatedResult<AdminCompanyListItem>>;
  getCompany(companyId: string): Promise<AdminCompanyDetailResponse>;
  listContacts(
    input: AdminContactListInput
  ): Promise<AdminPaginatedResult<AdminContactListItem>>;
  getContact(contactId: string): Promise<AdminContactDetailResponse>;
  listProducts(
    input: AdminListInput
  ): Promise<AdminPaginatedResult<AdminProductListItem>>;
  getProduct(productId: string): Promise<AdminProductDetailResponse>;
  listDeals(
    input: AdminDealListInput
  ): Promise<AdminPaginatedResult<AdminDealListItem>>;
  getDeal(dealId: string): Promise<AdminDealDetailResponse>;
}
