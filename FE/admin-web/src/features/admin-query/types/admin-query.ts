export type AdminDomainType = "companies" | "contacts" | "products" | "deals";

export type AdminSensitiveTargetType =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "MEETING_NOTE"
  | "PERSONAL_MEMO";

export interface AdminPaginationParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface AdminDomainListParams extends AdminPaginationParams {
  readonly search?: string;
  readonly userId?: string;
  readonly includeDeleted?: boolean;
  readonly companyId?: string;
  readonly stage?: string;
}

export interface AdminUserListParams extends AdminPaginationParams {
  readonly search?: string;
  readonly status?: string;
  readonly role?: string;
}

export interface AdminAuditLogListParams extends AdminPaginationParams {
  readonly actorUserId?: string;
  readonly targetUserId?: string;
  readonly action?: string;
  readonly targetType?: string;
  readonly from?: string;
  readonly to?: string;
}

export interface AdminPaginatedResponse<TItem> {
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
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
  readonly createdAt: string;
}

export interface AdminSensitiveRawRequest {
  readonly targetType: AdminSensitiveTargetType;
  readonly targetId: string;
  readonly fields: readonly string[];
  readonly reason: string;
}

export interface AdminSensitiveRawResponse {
  readonly targetType: AdminSensitiveTargetType;
  readonly targetId: string;
  readonly fields: readonly {
    readonly name: string;
    readonly value: string | null;
  }[];
  readonly auditLogId: string;
  readonly viewedAt: string;
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

export interface AdminUser {
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

export interface AdminUserDetail {
  readonly user: AdminUser;
  readonly settings: {
    readonly defaultScheduleReminderMinutes: number;
    readonly defaultNextActionReminderMinutes: number;
    readonly emailNotificationEnabled: boolean;
    readonly browserPushEnabled: boolean;
    readonly sensitiveSaveWarningEnabled: boolean;
  } | null;
  readonly usageSummary: {
    readonly companyCount: number;
    readonly contactCount: number;
    readonly productCount: number;
    readonly dealCount: number;
  };
  readonly recentAuditLogs: readonly AdminAuditLogSummary[];
}

export interface AdminCompany {
  readonly id: string;
  readonly userId: string;
  readonly userName: string | null;
  readonly name: string;
  readonly industry: string | null;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
  readonly location?: string | null;
  readonly description?: string | null;
}

export interface AdminContact {
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
  readonly location?: string | null;
}

export interface AdminProduct {
  readonly id: string;
  readonly userId: string;
  readonly userName: string | null;
  readonly name: string;
  readonly category: string | null;
  readonly unitPriceMasked: string | null;
  readonly currency: string | null;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
  readonly description?: string | null;
}

export interface AdminDeal {
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
  readonly nextActionTitle?: string | null;
  readonly nextActionDueAt?: string | null;
  readonly nextActionStatus?: string;
  readonly expectedCloseDate?: string | null;
}

export type AdminDomainItem =
  | AdminCompany
  | AdminContact
  | AdminProduct
  | AdminDeal;

export interface AdminMemoSummary {
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: string | null;
}

export interface AdminDetailResponse {
  readonly owner: {
    readonly id: string;
    readonly name: string | null;
    readonly emailMasked: string | null;
    readonly status: string;
  };
  readonly memoSummary?: AdminMemoSummary;
  readonly usageSummary?: Record<string, number>;
  readonly connectionSummary?: Record<string, number>;
  readonly activitySummary?: {
    readonly totalCount: number;
    readonly recentActivities: readonly {
      readonly id: string;
      readonly title: string;
      readonly activityDate: string;
      readonly deletedAt: string | null;
    }[];
  };
  readonly schedulesSummary?: Record<string, number>;
  readonly meetingNotesSummary?: Record<string, number>;
  readonly recentLogs?: readonly {
    readonly id: string;
    readonly title: string;
    readonly logDate: string;
    readonly deletedAt: string | null;
  }[];
  readonly company?: AdminCompany | { readonly id: string; readonly name: string } | null;
  readonly contact?: AdminContact | { readonly id: string; readonly name: string } | null;
  readonly product?: AdminProduct;
  readonly deal?: AdminDeal;
}
