import { useQuery } from "@tanstack/react-query";
import { listContactCompanyOptions } from "@/features/contact/api/contact-api";
import { contactQueryKeys } from "@/features/contact/api/contact-query-keys";

// 기능 : 담당자 회사 옵션 목록을 조회합니다.
export function useCompanyOptions(options?: { readonly enabled?: boolean }) {
  return useQuery({
    queryKey: contactQueryKeys.companyOptions(),
    queryFn: () => listContactCompanyOptions(),
    enabled: options?.enabled ?? true,
  });
}
