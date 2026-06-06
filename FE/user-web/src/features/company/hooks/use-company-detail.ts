import { useQuery } from "@tanstack/react-query";
import { getCompany } from "@/features/company/api/company-api";
import { companyQueryKeys } from "@/features/company/api/company-query-keys";

export function useCompanyDetail(companyId: string) {
  return useQuery({
    enabled: companyId.length > 0,
    queryKey: companyQueryKeys.detail(companyId),
    queryFn: () => getCompany(companyId),
  });
}
