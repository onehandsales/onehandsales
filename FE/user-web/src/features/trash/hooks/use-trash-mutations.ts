import { useMutation, useQueryClient } from "@tanstack/react-query";
import { companyQueryKeys } from "@/features/company/query-keys";
import { restoreTrashItem } from "@/features/trash/api/trash-api";
import { trashQueryKeys } from "@/features/trash/api/trash-query-keys";
import type { RestoreTrashItemInput } from "@/features/trash/types/trash";

// 기능 : 휴지통 복원 mutation 훅을 제공합니다.
export function useRestoreTrashItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RestoreTrashItemInput) => restoreTrashItem(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trashQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.all });
    },
  });
}
