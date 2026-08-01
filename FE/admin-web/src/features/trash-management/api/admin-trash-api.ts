import { adminApiClient } from "@/lib/admin-api-client";
import type {
  AdminTrashRecordsParams,
  AdminTrashRecordsResponse,
  AdminTrashRecoveryRequestsParams,
  AdminTrashRecoveryRequestsResponse,
  AdminTrashSummaryResponse,
} from "../types/admin-trash";

// 기능 : Admin 사용자 Trash summary API를 호출합니다.
export function getAdminUserTrashSummary(
  userId: string
): Promise<AdminTrashSummaryResponse> {
  return adminApiClient<AdminTrashSummaryResponse>(
    `/users/${userId}/trash-summary`
  );
}

// 기능 : Admin 사용자 Trash row 목록 API를 호출합니다.
export function listAdminUserTrashRecords(
  userId: string,
  params: AdminTrashRecordsParams
): Promise<AdminTrashRecordsResponse> {
  const queryString = toQueryString(params);

  return adminApiClient<AdminTrashRecordsResponse>(
    `/users/${userId}/trash-records${queryString ? `?${queryString}` : ""}`
  );
}

// 기능 : Admin Trash 복구 요청 queue API를 호출합니다.
export function listAdminTrashRecoveryRequests(
  params: AdminTrashRecoveryRequestsParams
): Promise<AdminTrashRecoveryRequestsResponse> {
  const queryString = toQueryString(params);

  return adminApiClient<AdminTrashRecoveryRequestsResponse>(
    `/trash/recovery-requests${queryString ? `?${queryString}` : ""}`
  );
}

// 기능 : 비어 있지 않은 params를 query string으로 변환합니다.
function toQueryString(
  params: AdminTrashRecordsParams | AdminTrashRecoveryRequestsParams
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "ALL") {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}
