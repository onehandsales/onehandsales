import type { AdminAuditLogListParams } from "../types/admin-audit-log";

// 기능 : Admin 감사 로그 React Query key를 생성합니다.
export const adminAuditLogKeys = {
  all: ["admin", "audit-log"] as const,
  lists: () => [...adminAuditLogKeys.all, "list"] as const,
  list: (params: AdminAuditLogListParams) =>
    [...adminAuditLogKeys.lists(), params] as const,
  rawAccess: () => ["admin", "sensitive-raw-access"] as const,
};
