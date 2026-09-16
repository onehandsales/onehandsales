export const WORKSPACE_SIDEBAR_QUERY = Symbol("WORKSPACE_SIDEBAR_QUERY");

export type WorkspaceSidebarWorkspaceKind = "PERSONAL" | "ORGANIZATION";

// 역할 : WorkspaceSidebarWorkspaceSummary 사이드바에 표시할 Workspace 요약을 정의합니다.
export interface WorkspaceSidebarWorkspaceSummary {
  readonly id: string;
  readonly name: string;
  readonly kind: WorkspaceSidebarWorkspaceKind;
}

// 역할 : WorkspaceSidebarQuery가 사이드바용 Workspace 조회 계약을 정의합니다.
export interface WorkspaceSidebarQuery {
  // 기능 : 현재 사용자가 멤버로 속한 Workspace 요약 목록을 조회합니다.
  listMySidebarWorkspaces(
    userId: string
  ): Promise<WorkspaceSidebarWorkspaceSummary[]>;

  // 기능 : 현재 사용자가 멤버로 속한 기본 표시 Workspace 요약을 조회합니다.
  getMyDefaultSidebarWorkspace(
    userId: string
  ): Promise<WorkspaceSidebarWorkspaceSummary | null>;

  // 기능 : 현재 사용자가 멤버로 속한 특정 Workspace 요약을 조회합니다.
  getMySidebarWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceSidebarWorkspaceSummary | null>;
}
