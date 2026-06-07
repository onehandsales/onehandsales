import type { AuditAction, AuditTargetType } from "@prisma/client";
import type { AdminPaginatedResult } from "./admin-query.repository";

export const ADMIN_SENSITIVE_REPOSITORY = Symbol(
  "ADMIN_SENSITIVE_REPOSITORY"
);

export type AdminSensitiveTargetType =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "MEETING_NOTE"
  | "PERSONAL_MEMO";

export interface ViewSensitiveRawDataInput {
  readonly actorUserId: string;
  readonly targetType: AdminSensitiveTargetType;
  readonly targetId: string;
  readonly fields: readonly string[];
  readonly reason: string;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
}

export interface SensitiveRawFieldResponse {
  readonly name: string;
  readonly value: string | null;
}

export interface SensitiveRawDataResponse {
  readonly targetType: AdminSensitiveTargetType;
  readonly targetId: string;
  readonly fields: readonly SensitiveRawFieldResponse[];
  readonly auditLogId: string;
  readonly viewedAt: string;
}

export interface AdminAuditLogListInput {
  readonly page: number;
  readonly pageSize: number;
  readonly actorUserId: string | null;
  readonly targetUserId: string | null;
  readonly action: AuditAction | null;
  readonly targetType: AuditTargetType | null;
  readonly from: Date | null;
  readonly to: Date | null;
}

export interface AdminAuditLogResponse {
  readonly id: string;
  readonly actorUserId: string | null;
  readonly actorUserName: string | null;
  readonly targetUserId: string | null;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string | null;
  readonly reasonSummary: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: string;
}

export interface AdminSensitiveRepository {
  viewRawData(
    input: ViewSensitiveRawDataInput
  ): Promise<SensitiveRawDataResponse>;
  listAuditLogs(
    input: AdminAuditLogListInput
  ): Promise<AdminPaginatedResult<AdminAuditLogResponse>>;
  getAuditLog(auditLogId: string): Promise<AdminAuditLogResponse>;
}
