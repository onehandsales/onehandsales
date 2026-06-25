import { useQuery } from "@tanstack/react-query";
import { getTrashDetail, listTrash } from "@/features/trash/api/trash-api";
import { trashQueryKeys } from "@/features/trash/api/trash-query-keys";
import type {
  ListTrashInput,
  TrashTargetInput,
} from "@/features/trash/types/trash";

export function useTrashList(input: ListTrashInput) {
  return useQuery({
    queryKey: trashQueryKeys.list(input),
    queryFn: () => listTrash(input),
  });
}

export function useTrashDetail(
  input: TrashTargetInput | null,
  enabled: boolean,
) {
  return useQuery({
    enabled: enabled && input !== null,
    queryKey: input
      ? trashQueryKeys.detail(input)
      : [...trashQueryKeys.details(), "empty"],
    queryFn: () => {
      if (!input) {
        throw new Error("Trash detail target is required");
      }

      return getTrashDetail(input);
    },
  });
}
