export const WORKSPACE_COMMAND_REPOSITORY = Symbol(
  "WORKSPACE_COMMAND_REPOSITORY"
);

export type WorkspaceCommandWorkspaceKind = "PERSONAL" | "ORGANIZATION";
export type WorkspaceCommandMemberRole = "OWNER" | "ADMIN" | "MEMBER";

// 역할 : WorkspaceCommandWorkspaceRecord가 생성된 Workspace snapshot을 정의합니다.
export interface WorkspaceCommandWorkspaceRecord {
  readonly id: string;
  readonly name: string;
  readonly kind: WorkspaceCommandWorkspaceKind;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : WorkspaceCommandMemberRecord가 생성된 WorkspaceMember snapshot을 정의합니다.
export interface WorkspaceCommandMemberRecord {
  readonly id: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly role: WorkspaceCommandMemberRole;
  readonly joinedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : CreateWorkspaceWithOwnerInput이 Workspace 생성과 OWNER 연결에 필요한 값을 정의합니다.
export interface CreateWorkspaceWithOwnerInput {
  readonly name: string;
  readonly ownerUserId: string;
  readonly now: Date;
}

// 역할 : CreateWorkspaceWithOwnerResult가 Workspace 생성 결과를 정의합니다.
export interface CreateWorkspaceWithOwnerResult {
  readonly workspace: WorkspaceCommandWorkspaceRecord;
  readonly workspaceMember: WorkspaceCommandMemberRecord;
}

// 역할 : WorkspaceCommandRepository가 Workspace 쓰기 저장소 계약을 정의합니다.
export interface WorkspaceCommandRepository {
  // 기능 : Workspace와 현재 사용자의 OWNER 멤버십을 생성합니다.
  createWorkspaceWithOwner(
    input: CreateWorkspaceWithOwnerInput
  ): Promise<CreateWorkspaceWithOwnerResult>;
}
