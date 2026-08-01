export type AdminTrashDomain =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE";

export type AdminTrashRestoreWindow = "ACTIVE" | "EXPIRED";
export type AdminTrashRestoreWindowFilter = AdminTrashRestoreWindow | "ALL";

export type AdminTrashRecoveryRequestStatus =
  | "REQUESTED"
  | "REVIEWING"
  | "WAITING_RECOVERY_POLICY"
  | "RECOVERY_AVAILABLE"
  | "REJECTED"
  | "CLOSED";

export type AdminTrashDomainSummary = {
  readonly total: number;
  readonly active: number;
  readonly expired: number;
};

export type AdminTrashSummaryResponse = {
  readonly userId: string;
  readonly total: number;
  readonly activeRestoreWindow: number;
  readonly expiredRestoreWindow: number;
  readonly byDomain: Record<AdminTrashDomain, AdminTrashDomainSummary>;
  readonly recoveryRequests: {
    readonly requested: number;
    readonly reviewing: number;
    readonly closed: number;
  };
};

export type AdminTrashRecordItem = {
  readonly targetType: AdminTrashDomain;
  readonly targetId: string;
  readonly titleSnapshot: string;
  readonly deletedAt: string;
  readonly trashExpiresAt: string;
  readonly restoreWindow: AdminTrashRestoreWindow;
  readonly userCanSelfRestore: boolean;
  readonly sensitiveFlags: {
    readonly hasMemo: boolean;
    readonly hasPrivateMemo: boolean;
    readonly privateMemoIncluded: false;
  };
  readonly recoveryRequest: {
    readonly id: string;
    readonly status: AdminTrashRecoveryRequestStatus;
    readonly createdAt: string;
  } | null;
};

export type AdminTrashRecordsParams = {
  readonly domain?: AdminTrashDomain;
  readonly restoreWindow?: AdminTrashRestoreWindowFilter;
  readonly cursor?: string;
  readonly limit?: number;
};

export type AdminTrashRecordsResponse = {
  readonly items: AdminTrashRecordItem[];
  readonly nextCursor: string | null;
};

export type AdminTrashRecoveryRequestsParams = {
  readonly status?: AdminTrashRecoveryRequestStatus;
  readonly targetType?: AdminTrashDomain;
  readonly cursor?: string;
  readonly limit?: number;
};

export type AdminTrashRecoveryRequestQueueItem = {
  readonly id: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly targetType: string;
  readonly targetId: string;
  readonly titleSnapshot: string;
  readonly status: AdminTrashRecoveryRequestStatus;
  readonly deletedAt: string;
  readonly trashExpiresAt: string;
  readonly createdAt: string;
};

export type AdminTrashRecoveryRequestsResponse = {
  readonly items: AdminTrashRecoveryRequestQueueItem[];
  readonly nextCursor: string | null;
};
