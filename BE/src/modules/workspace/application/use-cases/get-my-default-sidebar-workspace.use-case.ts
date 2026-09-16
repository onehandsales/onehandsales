import { Inject, Injectable } from "@nestjs/common";
import {
  WORKSPACE_SIDEBAR_QUERY,
  type WorkspaceSidebarQuery,
  type WorkspaceSidebarWorkspaceSummary,
} from "@/modules/workspace/application/ports/workspace-sidebar-query.port";
import { WorkspaceSidebarWorkspaceNotFoundError } from "@/modules/workspace/domain/workspace.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : GetMyDefaultSidebarWorkspaceUseCase가 현재 사용자의 기본 사이드바 Workspace 조회를 담당합니다.
@Injectable()
export class GetMyDefaultSidebarWorkspaceUseCase {
  // 기능 : 사이드바 Workspace 조회 포트를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_SIDEBAR_QUERY)
    private readonly workspaceSidebarQuery: WorkspaceSidebarQuery
  ) {}

  // 기능 : 현재 사용자가 멤버로 속한 최신 Workspace 요약을 기본값으로 반환합니다.
  async execute(
    currentUser: CurrentUserContext
  ): Promise<WorkspaceSidebarWorkspaceSummary> {
    // 1. 현재 사용자 ID 기준으로 기본 표시 Workspace를 조회한다.
    const workspace =
      await this.workspaceSidebarQuery.getMyDefaultSidebarWorkspace(
        currentUser.id
      );

    // 2. 사용자가 속한 Workspace가 없으면 not found로 차단한다.
    if (!workspace) {
      throw new WorkspaceSidebarWorkspaceNotFoundError();
    }

    // 3. 사이드바 표시용 Workspace 요약을 반환한다.
    return workspace;
  }
}
