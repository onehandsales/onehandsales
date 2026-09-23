export const WORKSPACE_ACCESS_QUERY = Symbol("WORKSPACE_ACCESS_QUERY");

// 역할 : WorkspaceMemberAccess가 Workspace 멤버십과 감사 Actor 조회 결과를 정의합니다.
export interface WorkspaceMemberAccess {
  readonly workspaceMemberId: string;
  readonly actorId: string | null;
}

// 역할 : WorkspaceAccessQuery가 다른 모듈이 Workspace membership 접근 가능 여부를 확인하는 계약을 정의합니다.
export interface WorkspaceAccessQuery {
  // 기능 : 현재 사용자가 특정 Workspace의 멤버인지 확인합니다.
  hasWorkspaceMembership(userId: string, workspaceId: string): Promise<boolean>;

  // 기능 : 현재 사용자가 특정 Workspace의 멤버인지 확인하고 생성 감사 Actor를 조회합니다.
  getWorkspaceMemberAccess(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceMemberAccess | null>;
}
