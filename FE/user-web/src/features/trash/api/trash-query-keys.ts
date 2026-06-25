import type {
  ListTrashInput,
  TrashTargetInput,
} from "@/features/trash/types/trash";

export const trashQueryKeys = {
  all: ["trash"] as const,
  details: () => [...trashQueryKeys.all, "detail"] as const,
  detail: (input: TrashTargetInput) =>
    [...trashQueryKeys.details(), input.targetType, input.targetId] as const,
  lists: () => [...trashQueryKeys.all, "list"] as const,
  list: (input: ListTrashInput) =>
    [
      ...trashQueryKeys.lists(),
      {
        domain: input.domain ?? "ALL",
        itemKind: input.itemKind ?? "ALL",
        logType: input.logType ?? "ALL",
        targetType: input.targetType ?? "ALL",
        query: input.query?.trim() ?? "",
        sort: input.sort ?? "RECENT",
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 12,
      },
    ] as const,
};
