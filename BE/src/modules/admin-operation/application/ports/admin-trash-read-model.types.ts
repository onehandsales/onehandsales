import type { TrashRecoveryRequestStatus } from "./admin-operation.types";

// 역할 : AdminTrashDomain Admin Trash 운영 조회 대상 도메인을 정의합니다.
export enum AdminTrashDomain {
  COMPANY = "COMPANY",
  CONTACT = "CONTACT",
  PRODUCT = "PRODUCT",
  DEAL = "DEAL",
  SCHEDULE = "SCHEDULE",
  MEETING_NOTE = "MEETING_NOTE",
}

// 역할 : AdminTrashRestoreWindow Admin Trash 복구 가능 창 상태 값을 정의합니다.
export type AdminTrashRestoreWindow = "ACTIVE" | "EXPIRED";

// 역할 : AdminTrashRestoreWindowFilter Admin Trash 복구 가능 창 filter 값을 정의합니다.
export type AdminTrashRestoreWindowFilter = AdminTrashRestoreWindow | "ALL";

// 역할 : AdminTrashDomainSummaryRecord Admin Trash 도메인별 count application read model을 정의합니다.
export interface AdminTrashDomainSummaryRecord {
  readonly total: number;
  readonly active: number;
  readonly expired: number;
}

// 역할 : AdminTrashRecoveryRequestSummaryRecord Admin Trash 복구 요청 count application read model을 정의합니다.
export interface AdminTrashRecoveryRequestSummaryRecord {
  readonly requested: number;
  readonly reviewing: number;
  readonly closed: number;
}

// 역할 : AdminTrashSummaryRecord Admin 사용자 Trash summary application read model을 정의합니다.
export interface AdminTrashSummaryRecord {
  readonly userId: string;
  readonly total: number;
  readonly activeRestoreWindow: number;
  readonly expiredRestoreWindow: number;
  readonly byDomain: Record<AdminTrashDomain, AdminTrashDomainSummaryRecord>;
  readonly recoveryRequests: AdminTrashRecoveryRequestSummaryRecord;
}

// 역할 : AdminTrashSensitiveFlagsRecord Admin Trash row 민감 flag application read model을 정의합니다.
export interface AdminTrashSensitiveFlagsRecord {
  readonly hasMemo: boolean;
  readonly hasPrivateMemo: boolean;
  readonly privateMemoIncluded: false;
}

// 역할 : AdminTrashLinkedRecoveryRequestRecord Admin Trash row에 연결된 복구 요청 application summary를 정의합니다.
export interface AdminTrashLinkedRecoveryRequestRecord {
  readonly id: string;
  readonly status: TrashRecoveryRequestStatus;
  readonly createdAt: Date;
}

// 역할 : AdminTrashRecordItemRecord Admin 사용자 Trash row application read model을 정의합니다.
export interface AdminTrashRecordItemRecord {
  readonly targetType: AdminTrashDomain;
  readonly targetId: string;
  readonly titleSnapshot: string;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
  readonly restoreWindow: AdminTrashRestoreWindow;
  readonly userCanSelfRestore: boolean;
  readonly sensitiveFlags: AdminTrashSensitiveFlagsRecord;
  readonly recoveryRequest: AdminTrashLinkedRecoveryRequestRecord | null;
}

// 역할 : AdminTrashRecordsPageRecord Admin 사용자 Trash cursor 목록 application page를 정의합니다.
export interface AdminTrashRecordsPageRecord {
  readonly items: AdminTrashRecordItemRecord[];
  readonly nextCursor: string | null;
}

// 역할 : AdminTrashRecoveryRequestQueueItemRecord Admin 복구 요청 queue item application read model을 정의합니다.
export interface AdminTrashRecoveryRequestQueueItemRecord {
  readonly id: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly targetType: string;
  readonly targetId: string;
  readonly titleSnapshot: string;
  readonly status: TrashRecoveryRequestStatus;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
  readonly createdAt: Date;
}

// 역할 : AdminTrashRecoveryRequestsPageRecord Admin 복구 요청 queue cursor application page를 정의합니다.
export interface AdminTrashRecoveryRequestsPageRecord {
  readonly items: AdminTrashRecoveryRequestQueueItemRecord[];
  readonly nextCursor: string | null;
}
