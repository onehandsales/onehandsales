import type {
  AdminAuditLogListParams,
  AdminDomainListParams,
  AdminDomainType,
  AdminUserListParams,
} from "@/features/admin-query/types/admin-query";

export const adminQueryKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminQueryKeys.all, "dashboard"] as const,
  users: () => [...adminQueryKeys.all, "users"] as const,
  userList: (params: AdminUserListParams) =>
    [...adminQueryKeys.users(), "list", normalizeParams(params)] as const,
  userDetail: (userId: string) =>
    [...adminQueryKeys.users(), "detail", userId] as const,
  domain: (domain: AdminDomainType) =>
    [...adminQueryKeys.all, "domain", domain] as const,
  domainList: (domain: AdminDomainType, params: AdminDomainListParams) =>
    [...adminQueryKeys.domain(domain), "list", normalizeParams(params)] as const,
  userDomainList: (
    userId: string,
    domain: AdminDomainType,
    params: AdminDomainListParams
  ) =>
    [
      ...adminQueryKeys.userDetail(userId),
      "domain",
      domain,
      normalizeParams(params),
    ] as const,
  domainDetail: (domain: AdminDomainType, targetId: string) =>
    [...adminQueryKeys.domain(domain), "detail", targetId] as const,
  auditLogs: () => [...adminQueryKeys.all, "audit-logs"] as const,
  auditLogList: (params: AdminAuditLogListParams) =>
    [...adminQueryKeys.auditLogs(), "list", normalizeParams(params)] as const,
  auditLogDetail: (auditLogId: string) =>
    [...adminQueryKeys.auditLogs(), "detail", auditLogId] as const,
};

function normalizeParams(
  params: AdminUserListParams | AdminDomainListParams | AdminAuditLogListParams
) {
  return {
    ...params,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
  };
}
