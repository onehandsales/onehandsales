import { adminApiClient } from "@/lib/admin-api-client";
import type {
  AdminDomainRecordsParams,
  AdminDomainRecordsResponse,
  AdminUserActivityTimelineParams,
  AdminUserActivityTimelineResponse,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserOverviewResponse,
} from "../types/admin-user";

// 기능 : Admin 사용자 목록 API를 호출합니다.
export function listAdminUsers(
  params: AdminUserListParams
): Promise<AdminUserListResponse> {
  const queryString = toQueryString(params);

  return adminApiClient<AdminUserListResponse>(
    `/users${queryString ? `?${queryString}` : ""}`
  );
}

// 기능 : Admin 사용자 상세 overview API를 호출합니다.
export function getAdminUserOverview(
  userId: string
): Promise<AdminUserOverviewResponse> {
  return adminApiClient<AdminUserOverviewResponse>(`/users/${userId}`);
}

// 기능 : Admin 사용자 활동 timeline API를 호출합니다.
export function listAdminUserActivityTimeline(
  userId: string,
  params: AdminUserActivityTimelineParams
): Promise<AdminUserActivityTimelineResponse> {
  const queryString = toQueryString(params);

  return adminApiClient<AdminUserActivityTimelineResponse>(
    `/users/${userId}/activity-timeline${queryString ? `?${queryString}` : ""}`
  );
}

// 기능 : Admin 사용자 도메인 read-only 목록 API를 호출합니다.
export function listAdminUserDomainRecords(
  userId: string,
  params: AdminDomainRecordsParams
): Promise<AdminDomainRecordsResponse> {
  const queryString = toQueryString(params);

  return adminApiClient<AdminDomainRecordsResponse>(
    `/users/${userId}/domain-records${queryString ? `?${queryString}` : ""}`
  );
}

// 기능 : 비어 있지 않은 params를 query string으로 변환합니다.
function toQueryString(
  params:
    | AdminUserListParams
    | AdminUserActivityTimelineParams
    | AdminDomainRecordsParams
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}
