import { useQuery } from "@tanstack/react-query";
import { listDeals } from "@/features/deal/api/deal-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import type { DealListParams } from "@/features/deal/types/deal";

export function useDealList(params: DealListParams) {
  return useQuery({
    queryKey: dealQueryKeys.list(params),
    queryFn: () => listDeals(params),
  });
}
