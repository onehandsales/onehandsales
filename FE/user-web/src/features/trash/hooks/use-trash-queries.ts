import { useQuery } from "@tanstack/react-query";
import { listTrash } from "@/features/trash/api/trash-api";
import { trashQueryKeys } from "@/features/trash/api/trash-query-keys";
import type { ListTrashInput } from "@/features/trash/types/trash";

export function useTrashList(input: Required<ListTrashInput>) {
  return useQuery({
    queryKey: trashQueryKeys.list(input),
    queryFn: () => listTrash(input),
  });
}
