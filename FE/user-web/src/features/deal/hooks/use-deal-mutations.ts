import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDeal } from "@/features/deal/api/deal-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import type { CreateDealInput } from "@/features/deal/types/deal";

export function useCreateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDealInput) => createDeal(input),
    onSuccess: (deal) => {
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: dealQueryKeys.detail(deal.id),
      });
    },
  });
}
