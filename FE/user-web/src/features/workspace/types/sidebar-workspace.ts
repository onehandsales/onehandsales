// 역할 : SidebarWorkspaceListItem 사이드바 Workspace 목록에서 사용할 최소 Workspace 요약입니다.
export type SidebarWorkspaceListItem = {
  readonly id: string;
  readonly name: string;
};

// 역할 : SidebarWorkspaceSummary 사이드바 현재 Workspace 표시에 사용할 Workspace 요약입니다.
export type SidebarWorkspaceSummary = SidebarWorkspaceListItem & {
  readonly kind: "PERSONAL" | "ORGANIZATION";
};
