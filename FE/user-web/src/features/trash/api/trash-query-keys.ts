import type { ListTrashInput } from "@/features/trash/types/trash";

export const trashQueryKeys = {
  all: ["trash"] as const,
  lists: () => [...trashQueryKeys.all, "list"] as const,
  list: (input: ListTrashInput) =>
    [
      ...trashQueryKeys.lists(),
      {
        targetType: input.targetType ?? "ALL",
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 20,
      },
    ] as const,
};
