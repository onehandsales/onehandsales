import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmBusinessCardScan,
  scanBusinessCard,
} from "@/features/business-card/api/business-card-api";
import { businessCardQueryKeys } from "@/features/business-card/api/business-card-query-keys";
import type {
  ConfirmBusinessCardScanInput,
  ScanBusinessCardInput,
} from "@/features/business-card/types/business-card";

export function useScanBusinessCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ScanBusinessCardInput) => scanBusinessCard(input),
    onSuccess: (scanLog) => {
      void queryClient.invalidateQueries({
        queryKey: businessCardQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: businessCardQueryKeys.detail(scanLog.id),
      });
    },
  });
}

export function useConfirmBusinessCardScanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmBusinessCardScanInput) =>
      confirmBusinessCardScan(input),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: businessCardQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: businessCardQueryKeys.detail(response.scanLog.id),
      });
      void queryClient.invalidateQueries({ queryKey: ["contact"] });
      void queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}
