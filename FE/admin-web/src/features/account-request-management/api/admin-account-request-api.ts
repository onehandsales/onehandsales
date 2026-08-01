import { adminApiClient } from "@/lib/admin-api-client";
import type {
  AdminAccountDeletionRequestsParams,
  AdminAccountDeletionRequestsResponse,
  AdminDataExportRequestsParams,
  AdminDataExportRequestsResponse,
} from "../types/admin-account-request";

// 기능 : Admin 계정 삭제 요청 queue API를 호출합니다.
export function listAdminAccountDeletionRequests(
  params: AdminAccountDeletionRequestsParams
): Promise<AdminAccountDeletionRequestsResponse> {
  const queryString = toQueryString(params);

  return adminApiClient<AdminAccountDeletionRequestsResponse>(
    `/account-deletion-requests${queryString ? `?${queryString}` : ""}`
  );
}

// 기능 : Admin 데이터 export 요청 queue API를 호출합니다.
export function listAdminDataExportRequests(
  params: AdminDataExportRequestsParams
): Promise<AdminDataExportRequestsResponse> {
  const queryString = toQueryString(params);

  return adminApiClient<AdminDataExportRequestsResponse>(
    `/data-export-requests${queryString ? `?${queryString}` : ""}`
  );
}

// 기능 : 비어 있지 않은 Admin queue params를 query string으로 변환합니다.
function toQueryString(
  params: AdminAccountDeletionRequestsParams | AdminDataExportRequestsParams
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "ALL") {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}
