import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getCompany,
  listCompanyMemoLogs,
  listCompanyPrivateMemoLogs,
} from "@/features/company/api/company-api";
import { companyQueryKeys } from "@/features/company/api/company-query-keys";

// 기능 : 회사 상세 기본 정보를 조회합니다.
export function useCompanyDetail(companyId: string) {
  return useQuery({
    enabled: companyId.length > 0,
    queryKey: companyQueryKeys.detail(companyId),
    queryFn: () => getCompany(companyId),
  });
}

export function useCompanyMemoLogs(companyId: string) {
  return useInfiniteQuery({
    enabled: companyId.length > 0,
    queryKey: companyQueryKeys.memoLogs(companyId),
    queryFn: ({ pageParam }) =>
      listCompanyMemoLogs(companyId, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });
}

// 기능 : 회사 개인 메모 로그를 커서 기반으로 조회합니다.
export function useCompanyPrivateMemoLogs(companyId: string) {
  return useInfiniteQuery({
    enabled: companyId.length > 0,
    queryKey: companyQueryKeys.privateMemoLogs(companyId),
    queryFn: ({ pageParam }) =>
      listCompanyPrivateMemoLogs(companyId, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });
}
