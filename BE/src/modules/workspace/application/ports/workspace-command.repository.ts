import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const WORKSPACE_COMMAND_REPOSITORY = Symbol(
  "WORKSPACE_COMMAND_REPOSITORY"
);

// 역할 : CreateWorkspaceWithOwnerInput이 Workspace 생성과 OWNER/Actor 연결에 필요한 값을 정의합니다.
export interface CreateWorkspaceWithOwnerInput {
  readonly name: string;
  readonly ownerUserId: string;
  readonly ownerDisplayName: string | null;
  readonly ownerEmail: string | null;
  readonly now: Date;
  readonly transactionContext?: TransactionContext | null;
}

// 역할 : CreateWorkspaceWithOwnerResult가 Workspace 생성 결과를 정의합니다.
export interface CreateWorkspaceWithOwnerResult {
  readonly workspaceId: string;
}

// 역할 : WorkspaceCommandRepository가 Workspace 쓰기 저장소 계약을 정의합니다.
export interface WorkspaceCommandRepository {
  // 기능 : Workspace, OWNER 멤버십, WORKSPACE_MEMBER Actor를 생성합니다.
  createWorkspaceWithOwner(
    input: CreateWorkspaceWithOwnerInput
  ): Promise<CreateWorkspaceWithOwnerResult>;
}
