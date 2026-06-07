import type {
  AdminCompany,
  AdminContact,
  AdminDashboardResponse,
  AdminDeal,
  AdminDetailResponse,
  AdminDomainListParams,
  AdminDomainType,
  AdminPaginatedResponse,
  AdminProduct,
  AdminUser,
  AdminUserDetail,
  AdminUserListParams,
} from "@/features/admin-query/types/admin-query";
import { adminApiClient } from "@/lib/admin-api-client";

type DomainListMap = {
  companies: AdminCompany;
  contacts: AdminContact;
  products: AdminProduct;
  deals: AdminDeal;
};

export function getAdminDashboard() {
  return adminApiClient<AdminDashboardResponse>("/dashboard");
}

export function listAdminUsers(params: AdminUserListParams) {
  return adminApiClient<AdminPaginatedResponse<AdminUser>>(`/users${toQueryString(params)}`);
}

export function getAdminUser(userId: string) {
  return adminApiClient<AdminUserDetail>(`/users/${userId}`);
}

export function listAdminDomain<TDomain extends AdminDomainType>(
  domain: TDomain,
  params: AdminDomainListParams
) {
  return adminApiClient<AdminPaginatedResponse<DomainListMap[TDomain]>>(
    `/${domain}${toQueryString(params)}`
  );
}

export function listAdminUserDomain<TDomain extends AdminDomainType>(
  userId: string,
  domain: TDomain,
  params: AdminDomainListParams
) {
  return adminApiClient<AdminPaginatedResponse<DomainListMap[TDomain]>>(
    `/users/${userId}/${domain}${toQueryString(params)}`
  );
}

export function getAdminDomainDetail(
  domain: AdminDomainType,
  targetId: string
) {
  return adminApiClient<AdminDetailResponse>(`/${domain}/${targetId}`);
}

function toQueryString(params: AdminUserListParams | AdminDomainListParams) {
  const searchParams = new URLSearchParams();

  const entries = Object.entries(params) as Array<
    [string, string | number | boolean | undefined]
  >;

  for (const [key, value] of entries) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}
