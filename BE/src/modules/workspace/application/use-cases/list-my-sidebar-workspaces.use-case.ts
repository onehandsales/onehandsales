import { Inject, Injectable } from "@nestjs/common";
import {
  WORKSPACE_SIDEBAR_QUERY,
  type WorkspaceSidebarQuery,
  type WorkspaceSidebarWorkspaceListItem,
} from "@/modules/workspace/application/ports/workspace-sidebar-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : ListMySidebarWorkspacesUseCase가 현재 사용자의 사이드바 Workspace 목록 조회를 담당합니다.
@Injectable()
export class ListMySidebarWorkspacesUseCase {
  // 기능 : 사이드바 Workspace 조회 포트를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_SIDEBAR_QUERY)
    private readonly workspaceSidebarQuery: WorkspaceSidebarQuery
  ) {}

  // 기능 : 현재 사용자가 멤버로 속한 Workspace 요약 목록을 반환합니다.
  async execute(
    currentUser: CurrentUserContext
  ): Promise<WorkspaceSidebarWorkspaceListItem[]> {
    // 1. 현재 사용자 ID 기준으로 접근 가능한 Workspace 목록 조회를 위임한다.
    return this.workspaceSidebarQuery.listMySidebarWorkspaces(currentUser.id);
  }
}
