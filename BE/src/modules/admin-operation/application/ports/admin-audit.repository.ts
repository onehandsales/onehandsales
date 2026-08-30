import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminSensitiveFieldSet,
  AdminTargetType,
} from "./admin-operation.types";
import type {
  AdminAuditLogPageRecord,
  AdminSensitiveAccessRecord,
  AdminSensitiveRawDataRecord,
} from "./admin-audit-read-model.types";

export const ADMIN_AUDIT_REPOSITORY = Symbol("ADMIN_AUDIT_REPOSITORY");

// 역할 : ListAdminAuditLogsInput Admin 감사 로그 목록 조회 조건을 정의합니다.
export interface ListAdminAuditLogsInput {
  readonly cursor?: string;
  readonly limit: number;
  readonly adminUserId?: string;
  readonly targetUserId?: string;
  readonly action?: AdminAuditAction;
  readonly result?: AdminAuditResult;
  readonly from?: Date;
  readonly to?: Date;
}

// 역할 : FindAdminSensitiveRawDataInput 민감 원문 조회 대상 조건을 정의합니다.
export interface FindAdminSensitiveRawDataInput {
  readonly targetUserId: string;
  readonly targetId: string;
}

// 역할 : CreateSensitiveAccessLogInput 민감 원문 조회 감사 로그 생성 값을 정의합니다.
export interface CreateSensitiveAccessLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string;
  readonly targetType: AdminTargetType;
  readonly targetId: string;
  readonly fieldSet: AdminSensitiveFieldSet;
  readonly reason: string;
  readonly requestId: string;
  readonly ipHash: string | null;
  readonly userAgentHash: string | null;
  readonly returnedFieldNames: readonly string[];
}

// 역할 : AdminAuditRepository Admin 감사 로그와 민감 원문 조회 영속성 계약을 정의합니다.
export interface AdminAuditRepository {
  // 기능 : Admin 감사 로그를 cursor 기반으로 조회합니다.
  listAuditLogs(input: ListAdminAuditLogsInput): Promise<AdminAuditLogPageRecord>;

  // 기능 : 사용자 연락처 계열 민감 원문 허용 필드를 조회합니다.
  findUserContact(
    input: FindAdminSensitiveRawDataInput
  ): Promise<AdminSensitiveRawDataRecord | null>;

  // 기능 : 회의록 본문 계열 민감 원문 허용 필드를 조회합니다.
  findMeetingNoteBody(
    input: FindAdminSensitiveRawDataInput
  ): Promise<AdminSensitiveRawDataRecord | null>;

  // 기능 : 민감 원문 조회 감사 로그와 상세 로그를 append-only로 생성합니다.
  createSensitiveAccessLog(
    input: CreateSensitiveAccessLogInput
  ): Promise<AdminSensitiveAccessRecord>;

  // 기능 : Admin 감사 저장소 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: AdminAuditRepository) => Promise<T>
  ): Promise<T>;
}
