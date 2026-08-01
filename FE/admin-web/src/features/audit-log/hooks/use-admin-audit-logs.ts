import { useMutation, useQuery } from "@tanstack/react-query";
import {
  accessAdminSensitiveRawData,
  listAdminAuditLogs,
} from "../api/admin-audit-log-api";
import { adminAuditLogKeys } from "../api/admin-audit-log-keys";
import type {
  AdminAuditLogListParams,
  AdminSensitiveRawAccessRequest,
} from "../types/admin-audit-log";

// 기능 : Admin 감사 로그 목록 query를 실행합니다.
export function useAdminAuditLogs(params: AdminAuditLogListParams) {
  return useQuery({
    queryKey: adminAuditLogKeys.list(params),
    queryFn: () => listAdminAuditLogs(params),
  });
}

// 기능 : Admin 민감 원문 조회 mutation을 실행합니다.
export function useAdminSensitiveRawAccessMutation() {
  return useMutation({
    mutationKey: adminAuditLogKeys.rawAccess(),
    mutationFn: (request: AdminSensitiveRawAccessRequest) =>
      accessAdminSensitiveRawData(request),
  });
}
