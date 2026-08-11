import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminSensitiveFieldSet,
  AdminTargetType,
} from "./admin-operation.types";

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

// 역할 : AdminAuditLogRecord 저장소가 반환하는 Admin 감사 로그 row 구조를 정의합니다.
export interface AdminAuditLogRecord {
  readonly id: string;
  readonly adminUserId: string;
  readonly adminEmail: string | null;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly reason: string | null;
  readonly requestId: string | null;
  readonly createdAt: Date;
}

// 역할 : AdminAuditLogPageRecord cursor 기반 Admin 감사 로그 페이지를 정의합니다.
export interface AdminAuditLogPageRecord {
  readonly items: AdminAuditLogRecord[];
  readonly nextCursor: string | null;
}

// 역할 : FindAdminSensitiveRawDataInput 민감 원문 조회 대상 조건을 정의합니다.
export interface FindAdminSensitiveRawDataInput {
  readonly targetUserId: string;
  readonly targetId: string;
}

// 역할 : AdminSensitiveRawDataRecord 허용 필드 원문과 반환 필드명 목록을 정의합니다.
export interface AdminSensitiveRawDataRecord {
  readonly data: Record<string, string | null>;
  readonly returnedFieldNames: string[];
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

// 역할 : AdminSensitiveAccessRecord 민감 원문 조회 로그 생성 결과를 정의합니다.
export interface AdminSensitiveAccessRecord {
  readonly id: string;
  readonly targetUserId: string;
  readonly targetType: AdminTargetType;
  readonly targetId: string;
  readonly fieldSet: AdminSensitiveFieldSet;
  readonly returnedFieldNames: string[];
  readonly createdAt: Date;
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
