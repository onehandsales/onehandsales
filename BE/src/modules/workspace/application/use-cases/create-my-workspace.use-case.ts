import { Inject, Injectable } from "@nestjs/common";
import {
  WORKSPACE_COMMAND_REPOSITORY,
  type CreateWorkspaceWithOwnerResult,
  type WorkspaceCommandRepository,
} from "@/modules/workspace/application/ports/workspace-command.repository";
import { WorkspaceValidationError } from "@/modules/workspace/domain/workspace.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  TRANSACTION_MANAGER,
  type TransactionContext,
  type TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";

const MAX_WORKSPACE_NAME_LENGTH = 80;

// 역할 : CreateMyWorkspaceCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateMyWorkspaceCommand {
  readonly workspaceName: string;
}

// 역할 : CreateMyWorkspaceUseCase가 현재 사용자의 새 Workspace 생성을 담당합니다.
@Injectable()
export class CreateMyWorkspaceUseCase {
  // 기능 : Workspace 쓰기 저장소와 transaction manager를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_COMMAND_REPOSITORY)
    private readonly workspaceCommandRepository: WorkspaceCommandRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager
  ) {}

  // 기능 : 입력 이름을 검증하고 현재 사용자를 OWNER로 연결한 Workspace를 생성합니다.
  async execute(
    currentUser: CurrentUserContext,
    command: CreateMyWorkspaceCommand
  ): Promise<CreateWorkspaceWithOwnerResult> {
    // 1. 사용자가 입력한 Workspace 이름을 저장 가능한 기준 이름으로 정규화한다.
    const workspaceName = this.normalizeWorkspaceName(command.workspaceName);

    // 2. 화면 표시용 Workspace 이름을 생성한다.
    const displayName = this.buildWorkspaceDisplayName(workspaceName);

    // 3. Workspace, OWNER 멤버십, Actor 생성을 하나의 transaction 안에서 처리한다.
    const now = new Date();
    return this.transactionManager.runInTransaction((context) =>
      this.createWorkspaceInTransaction(currentUser, displayName, now, context)
    );
  }

  // 기능 : Workspace 생성에 필요한 row들을 같은 transaction context로 저장합니다.
  private createWorkspaceInTransaction(
    currentUser: CurrentUserContext,
    displayName: string,
    now: Date,
    context: TransactionContext
  ): Promise<CreateWorkspaceWithOwnerResult> {
    // 1. Workspace 저장소에 현재 사용자 snapshot과 transaction context를 함께 전달한다.
    return this.workspaceCommandRepository.createWorkspaceWithOwner({
      name: displayName,
      ownerUserId: currentUser.id,
      ownerDisplayName: currentUser.displayName,
      ownerEmail: currentUser.email,
      now,
      transactionContext: context,
    });
  }

  // 기능 : Workspace 이름 입력값을 trim하고 비어 있거나 너무 긴 값을 차단합니다.
  private normalizeWorkspaceName(workspaceName: string): string {
    // 1. 앞뒤 공백을 제거해 실제 저장 기준 입력값을 만든다.
    const normalized = workspaceName.trim();

    // 2. 공백만 입력한 이름은 생성할 수 없도록 차단한다.
    if (normalized.length === 0) {
      throw new WorkspaceValidationError(
        "WORKSPACE_NAME_REQUIRED",
        "workspaceName",
        "Workspace name is required"
      );
    }

    // 3. 사용자 입력 기준 최대 길이를 초과하면 저장하지 않는다.
    if (Array.from(normalized).length > MAX_WORKSPACE_NAME_LENGTH) {
      throw new WorkspaceValidationError(
        "WORKSPACE_NAME_TOO_LONG",
        "workspaceName",
        "Workspace name must be 80 characters or fewer"
      );
    }

    // 4. 정규화된 이름을 호출자에게 반환한다.
    return normalized;
  }

  // 기능 : 사용자 입력 이름을 Workspace 표시 이름으로 변환합니다.
  private buildWorkspaceDisplayName(workspaceName: string): string {
    return `${workspaceName}'s Workspace`;
  }
}
