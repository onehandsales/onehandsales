import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminSensitiveFieldSet,
  AdminTargetType,
} from "@prisma/client";
import type {
  AdminAuditLogPageRecord,
  AdminAuditLogRecord,
  AdminSensitiveAccessRecord,
  AdminSensitiveRawDataRecord,
} from "@/modules/admin-operation/application/ports/admin-audit.repository";
import { maskEmail } from "./admin-redaction.mapper";

const REASON_PREVIEW_MAX_LENGTH = 80;

// 역할 : AdminAuditLogListResponse Admin 감사 로그 목록 API 응답을 정의합니다.
export interface AdminAuditLogListResponse {
  readonly items: AdminAuditLogListItemResponse[];
  readonly nextCursor: string | null;
}

// 역할 : AdminAuditLogListItemResponse Admin 감사 로그 목록 항목 응답을 정의합니다.
export interface AdminAuditLogListItemResponse {
  readonly id: string;
  readonly adminUserId: string;
  readonly adminEmailMasked: string | null;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly reasonPreview: string | null;
  readonly requestId: string | null;
  readonly createdAt: string;
}

// 역할 : AdminSensitiveRawAccessResponse 민감 원문 조회 API 응답을 정의합니다.
export interface AdminSensitiveRawAccessResponse {
  readonly accessId: string;
  readonly targetUserId: string;
  readonly targetType: AdminTargetType;
  readonly targetId: string;
  readonly fieldSet: AdminSensitiveFieldSet;
  readonly data: Record<string, string | null>;
  readonly createdAt: string;
}

// 기능 : Admin 감사 로그 페이지 record를 API 응답으로 변환합니다.
export function toAdminAuditLogListResponse(
  page: AdminAuditLogPageRecord
): AdminAuditLogListResponse {
  return {
    items: page.items.map((item) => toAdminAuditLogListItemResponse(item)),
    nextCursor: page.nextCursor,
  };
}

// 기능 : Admin 민감 원문 조회 record를 API 응답으로 변환합니다.
export function toAdminSensitiveRawAccessResponse(
  accessLog: AdminSensitiveAccessRecord,
  rawData: AdminSensitiveRawDataRecord
): AdminSensitiveRawAccessResponse {
  return {
    accessId: accessLog.id,
    targetUserId: accessLog.targetUserId,
    targetType: accessLog.targetType,
    targetId: accessLog.targetId,
    fieldSet: accessLog.fieldSet,
    data: rawData.data,
    createdAt: accessLog.createdAt.toISOString(),
  };
}

// 기능 : Admin 감사 로그 단건 record에서 원문 email과 긴 사유를 안전하게 줄입니다.
function toAdminAuditLogListItemResponse(
  item: AdminAuditLogRecord
): AdminAuditLogListItemResponse {
  return {
    id: item.id,
    adminUserId: item.adminUserId,
    adminEmailMasked: maskEmail(item.adminEmail),
    targetUserId: item.targetUserId,
    targetType: item.targetType,
    targetId: item.targetId,
    action: item.action,
    result: item.result,
    reasonPreview: createReasonPreview(item.reason),
    requestId: item.requestId,
    createdAt: item.createdAt.toISOString(),
  };
}

// 기능 : 감사 로그 목록에서 사용할 짧은 사유 preview를 생성합니다.
function createReasonPreview(reason: string | null): string | null {
  const normalized = reason?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length <= REASON_PREVIEW_MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, REASON_PREVIEW_MAX_LENGTH - 3)}...`;
}
