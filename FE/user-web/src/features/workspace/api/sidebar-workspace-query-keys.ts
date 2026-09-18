export const sidebarWorkspaceQueryKeys = {
  all: ["sidebarWorkspace"] as const,
  default: (userId: string | null) =>
    [...sidebarWorkspaceQueryKeys.all, "default", userId] as const,
  detail: (userId: string | null, workspaceId: string | null) =>
    [...sidebarWorkspaceQueryKeys.all, "detail", userId, workspaceId] as const,
  list: (userId: string | null) =>
    [...sidebarWorkspaceQueryKeys.all, "list", userId] as const,
};
