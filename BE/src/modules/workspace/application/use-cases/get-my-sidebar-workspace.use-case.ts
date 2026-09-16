import { Inject, Injectable } from "@nestjs/common";
import {
  WORKSPACE_SIDEBAR_QUERY,
  type WorkspaceSidebarQuery,
  type WorkspaceSidebarWorkspaceSummary,
} from "@/modules/workspace/application/ports/workspace-sidebar-query.port";
import { WorkspaceSidebarWorkspaceNotFoundError } from "@/modules/workspace/domain/workspace.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : GetMySidebarWorkspaceUseCase가 현재 사용자의 사이드바 Workspace 단건 조회를 담당합니다.
@Injectable()
export class GetMySidebarWorkspaceUseCase {
  // 기능 : 사이드바 Workspace 조회 포트를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_SIDEBAR_QUERY)
    private readonly workspaceSidebarQuery: WorkspaceSidebarQuery
  ) {}

  // 기능 : 현재 사용자가 멤버로 속한 특정 Workspace 요약을 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string
  ): Promise<WorkspaceSidebarWorkspaceSummary> {
    // 1. 현재 사용자 ID와 요청 Workspace ID 기준으로 접근 가능한 Workspace를 조회한다.
    const workspace = await this.workspaceSidebarQuery.getMySidebarWorkspace(
      currentUser.id,
      workspaceId
    );

    // 2. 멤버십이 없거나 Workspace가 없으면 정보 노출 없이 not found로 차단한다.
    if (!workspace) {
      throw new WorkspaceSidebarWorkspaceNotFoundError();
    }

    // 3. 사이드바 표시용 Workspace 요약을 반환한다.
    return workspace;
  }
}
