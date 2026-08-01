import { adminApiClient } from "@/lib/admin-api-client";
import type {
  AdminProviderFailureDetail,
  AdminProviderFailureListParams,
  AdminProviderFailureListResponse,
} from "../types/admin-provider-failure";

// 기능 : Admin provider 실패 목록 API를 호출합니다.
export function listAdminProviderFailures(
  params: AdminProviderFailureListParams
): Promise<AdminProviderFailureListResponse> {
  const queryString = toQueryString(params);

  return adminApiClient<AdminProviderFailureListResponse>(
    `/provider-failures${queryString ? `?${queryString}` : ""}`
  );
}

// 기능 : Admin provider 실패 safe 상세 API를 호출합니다.
export function getAdminProviderFailureDetail(
  failureId: string
): Promise<AdminProviderFailureDetail> {
  return adminApiClient<AdminProviderFailureDetail>(
    `/provider-failures/${failureId}`
  );
}

// 기능 : 비어 있지 않은 provider failure params를 query string으로 변환합니다.
function toQueryString(params: AdminProviderFailureListParams): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== "" &&
      value !== "ALL" &&
      value !== null
    ) {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}
