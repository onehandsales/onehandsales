import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  TrashRecoveryRequestStatus,
} from "./admin-operation.types";
import type {
  AdminTrashDomain,
  AdminTrashRecordsPageRecord,
  AdminTrashRecoveryRequestsPageRecord,
  AdminTrashRestoreWindowFilter,
  AdminTrashSummaryRecord,
} from "./admin-trash-read-model.types";

export const ADMIN_TRASH_REPOSITORY = Symbol("ADMIN_TRASH_REPOSITORY");

// 역할 : ListAdminTrashRecordsInput Admin 사용자 Trash 목록 조회 조건을 정의합니다.
export interface ListAdminTrashRecordsInput {
  readonly userId: string;
  readonly domain?: AdminTrashDomain;
  readonly restoreWindow: AdminTrashRestoreWindowFilter;
  readonly cursor?: string;
  readonly limit: number;
  readonly now: Date;
}

// 역할 : ListAdminTrashRecoveryRequestsInput Admin 복구 요청 queue 조회 조건을 정의합니다.
export interface ListAdminTrashRecoveryRequestsInput {
  readonly status?: TrashRecoveryRequestStatus;
  readonly targetType?: AdminTrashDomain;
  readonly cursor?: string;
  readonly limit: number;
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
