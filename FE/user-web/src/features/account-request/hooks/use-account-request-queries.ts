import { useQuery } from "@tanstack/react-query";
import { getMyDataExportRequest } from "@/features/account-request/api/account-request-api";
import { accountRequestQueryKeys } from "@/features/account-request/api/account-request-query-keys";

// 기능 : 사용자 데이터 export 요청 상태 query를 실행합니다.
export function useMyDataExportRequest(requestId: string | null) {
  return useQuery({
    enabled: Boolean(requestId),
    queryKey: accountRequestQueryKeys.dataExport(requestId ?? ""),
    queryFn: () => getMyDataExportRequest(requestId ?? ""),
  });
}
