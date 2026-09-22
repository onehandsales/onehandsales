export const sidebarCrmObjectQueryKeys = {
  all: ["sidebarCrmObject"] as const,
  list: (userId: string | null, workspaceId: string | null) =>
    [...sidebarCrmObjectQueryKeys.all, "list", userId, workspaceId] as const,
};
