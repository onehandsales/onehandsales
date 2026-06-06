import { useQuery } from "@tanstack/react-query";
import { listCompanies } from "@/features/company/api/company-api";
import { companyQueryKeys } from "@/features/company/api/company-query-keys";
import type { CompanyListParams } from "@/features/company/types/company";

export function useCompanyList(params: CompanyListParams) {
  return useQuery({
    queryKey: companyQueryKeys.list(params),
    queryFn: () => listCompanies(params),
  });
}
