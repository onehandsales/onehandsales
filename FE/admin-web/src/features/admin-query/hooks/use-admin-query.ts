import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAdminAuditLog,
  getAdminDashboard,
  getAdminDomainDetail,
  getAdminUser,
  listAdminAuditLogs,
  listAdminDomain,
  listAdminUserDomain,
  listAdminUsers,
  viewAdminSensitiveRawData,
} from "@/features/admin-query/api/admin-query-api";
import { adminQueryKeys } from "@/features/admin-query/api/admin-query-keys";
import type {
  AdminAuditLogListParams,
  AdminDomainListParams,
  AdminDomainType,
  AdminSensitiveRawRequest,
  AdminUserListParams,
} from "@/features/admin-query/types/admin-query";

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard(),
    queryFn: getAdminDashboard,
  });
}

export function useAdminUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: adminQueryKeys.userList(params),
    queryFn: () => listAdminUsers(params),
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    enabled: userId.length > 0,
    queryKey: adminQueryKeys.userDetail(userId),
    queryFn: () => getAdminUser(userId),
  });
}

export function useAdminDomainList(
  domain: AdminDomainType,
  params: AdminDomainListParams
) {
  return useQuery({
    queryKey: adminQueryKeys.domainList(domain, params),
    queryFn: () => listAdminDomain(domain, params),
  });
}

export function useAdminUserDomainList(
  userId: string,
  domain: AdminDomainType,
  params: AdminDomainListParams
) {
  return useQuery({
    enabled: userId.length > 0,
    queryKey: adminQueryKeys.userDomainList(userId, domain, params),
    queryFn: () => listAdminUserDomain(userId, domain, params),
  });
}

export function useAdminDomainDetail(
  domain: AdminDomainType,
  targetId: string
) {
  return useQuery({
    enabled: targetId.length > 0,
    queryKey: adminQueryKeys.domainDetail(domain, targetId),
    queryFn: () => getAdminDomainDetail(domain, targetId),
  });
}

export function useAdminSensitiveRawMutation() {
  return useMutation({
    mutationFn: (request: AdminSensitiveRawRequest) =>
      viewAdminSensitiveRawData(request),
  });
}

export function useAdminAuditLogs(params: AdminAuditLogListParams) {
  return useQuery({
    queryKey: adminQueryKeys.auditLogList(params),
    queryFn: () => listAdminAuditLogs(params),
  });
}

export function useAdminAuditLog(auditLogId: string) {
  return useQuery({
    enabled: auditLogId.length > 0,
    queryKey: adminQueryKeys.auditLogDetail(auditLogId),
    queryFn: () => getAdminAuditLog(auditLogId),
  });
}
