import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminOperationCheckRunStatus,
  AdminTargetType,
} from "./admin-operation.types";
import type {
  AdminOperationCheckEnvironment,
  AdminOperationCheckItemsRecord,
  AdminOperationCheckRunRecord,
} from "./admin-system-operation-read-model.types";

export const ADMIN_SYSTEM_OPERATION_REPOSITORY = Symbol(
  "ADMIN_SYSTEM_OPERATION_REPOSITORY"
);

// 역할 : CreateAdminOperationCheckRunInput 운영 gate 점검 기록 생성 값을 정의합니다.
export interface CreateAdminOperationCheckRunInput {
  readonly adminUserId: string;
  readonly environment: AdminOperationCheckEnvironment;
  readonly status: AdminOperationCheckRunStatus;
  readonly items: AdminOperationCheckItemsRecord;
  readonly notes: string | null;
  readonly checkedAt: Date;
}

// 역할 : CreateAdminSystemOperationAuditLogInput 운영 gate 감사 로그 입력을 정의합니다.
export interface CreateAdminSystemOperationAuditLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly requestId: string;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : AdminSystemOperationRepository 운영 gate 점검 기록 영속성 계약을 정의합니다.
export interface AdminSystemOperationRepository {
  // 기능 : 최신 운영 gate 점검 기록을 조회합니다.
  findLatestOperationCheckRun(): Promise<AdminOperationCheckRunRecord | null>;

  // 기능 : 운영 gate 점검 기록 row를 생성합니다.
  createOperationCheckRun(
    input: CreateAdminOperationCheckRunInput
  ): Promise<AdminOperationCheckRunRecord>;

  // 기능 : Admin 운영 gate 감사 로그를 append-only로 생성합니다.
  createAuditLog(input: CreateAdminSystemOperationAuditLogInput): Promise<void>;

  // 기능 : Admin 운영 gate 저장소 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: AdminSystemOperationRepository) => Promise<T>
  ): Promise<T>;
}
