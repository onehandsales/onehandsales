import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  TrashRecoveryRequestStatus,
} from "./admin-operation.types";

export const ADMIN_TRASH_REPOSITORY = Symbol("ADMIN_TRASH_REPOSITORY");

// 역할 : AdminTrashDomain Admin Trash 운영 조회 대상 도메인을 정의합니다.
export enum AdminTrashDomain {
  COMPANY = "COMPANY",
  CONTACT = "CONTACT",
  PRODUCT = "PRODUCT",
  DEAL = "DEAL",
  SCHEDULE = "SCHEDULE",
  MEETING_NOTE = "MEETING_NOTE",
}

export type AdminTrashRestoreWindow = "ACTIVE" | "EXPIRED";
export type AdminTrashRestoreWindowFilter = AdminTrashRestoreWindow | "ALL";

// 역할 : AdminTrashDomainSummaryRecord Admin Trash 도메인별 count를 정의합니다.
export interface AdminTrashDomainSummaryRecord {
  readonly total: number;
  readonly active: number;
  readonly expired: number;
}

// 역할 : AdminTrashRecoveryRequestSummaryRecord Admin Trash 복구 요청 count를 정의합니다.
export interface AdminTrashRecoveryRequestSummaryRecord {
  readonly requested: number;
  readonly reviewing: number;
  readonly closed: number;
}

// 역할 : AdminTrashSummaryRecord Admin 사용자 Trash summary record를 정의합니다.
export interface AdminTrashSummaryRecord {
  readonly userId: string;
  readonly total: number;
  readonly activeRestoreWindow: number;
  readonly expiredRestoreWindow: number;
  readonly byDomain: Record<AdminTrashDomain, AdminTrashDomainSummaryRecord>;
  readonly recoveryRequests: AdminTrashRecoveryRequestSummaryRecord;
}

// 역할 : AdminTrashSensitiveFlagsRecord Admin Trash row 민감 flag를 정의합니다.
export interface AdminTrashSensitiveFlagsRecord {
  readonly hasMemo: boolean;
  readonly hasPrivateMemo: boolean;
  readonly privateMemoIncluded: false;
}

// 역할 : AdminTrashLinkedRecoveryRequestRecord Admin Trash row에 연결된 복구 요청 summary를 정의합니다.
export interface AdminTrashLinkedRecoveryRequestRecord {
  readonly id: string;
  readonly status: TrashRecoveryRequestStatus;
  readonly createdAt: Date;
}

// 역할 : AdminTrashRecordItemRecord Admin 사용자 Trash row record를 정의합니다.
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

// 역할 : ListAdminTrashRecordsInput Admin 사용자 Trash 목록 조회 조건을 정의합니다.
export interface ListAdminTrashRecordsInput {
  readonly userId: string;
  readonly domain?: AdminTrashDomain;
  readonly restoreWindow: AdminTrashRestoreWindowFilter;
  readonly cursor?: string;
  readonly limit: number;
  readonly now: Date;
}

// 역할 : AdminTrashRecordsPageRecord Admin 사용자 Trash cursor 목록 결과를 정의합니다.
export interface AdminTrashRecordsPageRecord {
  readonly items: AdminTrashRecordItemRecord[];
  readonly nextCursor: string | null;
}

// 역할 : ListAdminTrashRecoveryRequestsInput Admin 복구 요청 queue 조회 조건을 정의합니다.
export interface ListAdminTrashRecoveryRequestsInput {
  readonly status?: TrashRecoveryRequestStatus;
  readonly targetType?: AdminTrashDomain;
  readonly cursor?: string;
  readonly limit: number;
}

// 역할 : AdminTrashRecoveryRequestQueueItemRecord Admin 복구 요청 queue item record를 정의합니다.
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

// 역할 : AdminTrashRecoveryRequestsPageRecord Admin 복구 요청 queue cursor 결과를 정의합니다.
export interface AdminTrashRecoveryRequestsPageRecord {
  readonly items: AdminTrashRecoveryRequestQueueItemRecord[];
  readonly nextCursor: string | null;
}

// 역할 : CreateAdminTrashAuditLogInput Admin Trash 조회 감사 로그 생성 값을 정의합니다.
export interface CreateAdminTrashAuditLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly requestId: string;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : AdminTrashRepository Admin Trash 운영 조회 영속성 계약을 정의합니다.
export interface AdminTrashRepository {
  // 기능 : Admin Trash 대상 사용자가 존재하는지 확인합니다.
  targetUserExists(userId: string): Promise<boolean>;

  // 기능 : Admin 사용자 Trash summary count를 조회합니다.
  getUserTrashSummary(userId: string, now: Date): Promise<AdminTrashSummaryRecord>;

  // 기능 : Admin 사용자 Trash row 목록을 cursor 기반으로 조회합니다.
  listUserTrashRecords(
    input: ListAdminTrashRecordsInput
  ): Promise<AdminTrashRecordsPageRecord>;

  // 기능 : Admin 복구 요청 queue를 cursor 기반으로 조회합니다.
  listRecoveryRequests(
    input: ListAdminTrashRecoveryRequestsInput
  ): Promise<AdminTrashRecoveryRequestsPageRecord>;

  // 기능 : Admin Trash 운영 조회 감사 로그를 append-only로 생성합니다.
  createAuditLog(input: CreateAdminTrashAuditLogInput): Promise<void>;

  // 기능 : Admin Trash 저장소 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: AdminTrashRepository) => Promise<T>
  ): Promise<T>;
}
