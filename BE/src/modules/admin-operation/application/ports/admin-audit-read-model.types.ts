import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminSensitiveFieldSet,
  AdminTargetType,
} from "./admin-operation.types";

// 역할 : AdminAuditLogRecord Admin 감사 로그 application read model을 정의합니다.
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

// 역할 : AdminAuditLogPageRecord cursor 기반 Admin 감사 로그 application page를 정의합니다.
export interface AdminAuditLogPageRecord {
  readonly items: AdminAuditLogRecord[];
  readonly nextCursor: string | null;
}

// 역할 : AdminSensitiveRawDataRecord 허용 필드 원문과 반환 필드명 application read model을 정의합니다.
export interface AdminSensitiveRawDataRecord {
  readonly data: Record<string, string | null>;
  readonly returnedFieldNames: string[];
}

// 역할 : AdminSensitiveAccessRecord 민감 원문 조회 로그 생성 application read model을 정의합니다.
export interface AdminSensitiveAccessRecord {
  readonly id: string;
  readonly targetUserId: string;
  readonly targetType: AdminTargetType;
  readonly targetId: string;
  readonly fieldSet: AdminSensitiveFieldSet;
  readonly returnedFieldNames: string[];
  readonly createdAt: Date;
}
