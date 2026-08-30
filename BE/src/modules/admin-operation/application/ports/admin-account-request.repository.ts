import type {
  AccountDeletionRequestStatus,
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  UserDataExportRequestStatus,
} from "./admin-operation.types";
import type {
  AdminAccountDeletionRequestsPageRecord,
  AdminDataExportRequestsPageRecord,
} from "./admin-account-request-read-model.types";

export const ADMIN_ACCOUNT_REQUEST_REPOSITORY = Symbol(
  "ADMIN_ACCOUNT_REQUEST_REPOSITORY"
);

// 역할 : ListAdminAccountDeletionRequestsInput Admin 계정 삭제 요청 queue 조회 조건을 정의합니다.
export interface ListAdminAccountDeletionRequestsInput {
  readonly status?: AccountDeletionRequestStatus;
  readonly cursor?: string;
  readonly limit: number;
}

// 역할 : ListAdminDataExportRequestsInput Admin 데이터 export 요청 queue 조회 조건을 정의합니다.
export interface ListAdminDataExportRequestsInput {
  readonly status?: UserDataExportRequestStatus;
  readonly cursor?: string;
  readonly limit: number;
}

// 역할 : CreateAdminAccountRequestAuditLogInput 계정 데이터 요청 queue 조회 감사 로그 입력을 정의합니다.
export interface CreateAdminAccountRequestAuditLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly requestId: string;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : AdminAccountRequestRepository 계정 데이터 요청 운영 queue 영속성 계약을 정의합니다.
export interface AdminAccountRequestRepository {
  // 기능 : Admin 계정 삭제 요청 queue를 cursor 기반으로 조회합니다.
  listAccountDeletionRequests(
    input: ListAdminAccountDeletionRequestsInput
  ): Promise<AdminAccountDeletionRequestsPageRecord>;

  // 기능 : Admin 데이터 export 요청 queue를 cursor 기반으로 조회합니다.
  listDataExportRequests(
    input: ListAdminDataExportRequestsInput
  ): Promise<AdminDataExportRequestsPageRecord>;

  // 기능 : Admin 계정 데이터 요청 queue 조회 감사 로그를 append-only로 생성합니다.
  createAuditLog(input: CreateAdminAccountRequestAuditLogInput): Promise<void>;

  // 기능 : Admin 계정 데이터 요청 저장소 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: AdminAccountRequestRepository) => Promise<T>
  ): Promise<T>;
}
