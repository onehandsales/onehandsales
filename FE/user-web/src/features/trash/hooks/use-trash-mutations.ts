import { useMutation, useQueryClient } from "@tanstack/react-query";
import { companyQueryKeys } from "@/features/company/api/company-query-keys";
import { contactQueryKeys } from "@/features/contact/api/contact-query-keys";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import { meetingNoteQueryKeys } from "@/features/meeting-note/api/meeting-note-query-keys";
import { productQueryKeys } from "@/features/product/api/product-query-keys";
import { scheduleQueryKeys } from "@/features/schedule/api/schedule-query-keys";
import {
  createTrashRecoveryRequest,
  restoreTrashItem,
} from "@/features/trash/api/trash-api";
import { trashQueryKeys } from "@/features/trash/api/trash-query-keys";
import type {
  CreateTrashRecoveryRequestInput,
  RestoreTrashItemInput,
} from "@/features/trash/types/trash";

export function useRestoreTrashItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RestoreTrashItemInput) => restoreTrashItem(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trashQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: contactQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: dealQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: meetingNoteQueryKeys.all,
      });
    },
  });
}

// 기능 : 만료 Trash row 복구 문의 mutation과 cache 갱신을 구성합니다.
export function useCreateTrashRecoveryRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTrashRecoveryRequestInput) =>
      createTrashRecoveryRequest(input),
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({ queryKey: trashQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: trashQueryKeys.detail({
          targetType: variables.targetType,
          targetId: variables.targetId,
        }),
      });
    },
  });
}
