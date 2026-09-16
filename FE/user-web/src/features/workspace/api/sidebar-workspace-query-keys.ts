export const sidebarWorkspaceQueryKeys = {
  all: ["sidebarWorkspace"] as const,
  default: () => [...sidebarWorkspaceQueryKeys.all, "default"] as const,
};
