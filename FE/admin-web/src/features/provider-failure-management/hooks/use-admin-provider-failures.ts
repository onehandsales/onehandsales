import { useQuery } from "@tanstack/react-query";
import {
  getAdminProviderFailureDetail,
  listAdminProviderFailures,
} from "../api/admin-provider-failure-api";
import { adminProviderFailureKeys } from "../api/admin-provider-failure-keys";
import type { AdminProviderFailureListParams } from "../types/admin-provider-failure";

// 기능 : Admin provider 실패 목록 query를 실행합니다.
export function useAdminProviderFailures(
  params: AdminProviderFailureListParams
) {
  return useQuery({
    queryKey: adminProviderFailureKeys.list(params),
    queryFn: () => listAdminProviderFailures(params),
  });
}

// 기능 : Admin provider 실패 safe 상세 query를 실행합니다.
export function useAdminProviderFailureDetail(failureId: string) {
  return useQuery({
    enabled: failureId.length > 0,
    queryKey: adminProviderFailureKeys.detail(failureId),
    queryFn: () => getAdminProviderFailureDetail(failureId),
  });
}
