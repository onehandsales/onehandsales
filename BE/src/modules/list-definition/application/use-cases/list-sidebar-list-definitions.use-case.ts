import { Inject, Injectable } from "@nestjs/common";
import {
  LIST_DEFINITION_SIDEBAR_QUERY,
  type ListDefinitionSidebarQuery,
  type SidebarListDefinitionListItem,
} from "@/modules/list-definition/application/ports/list-definition-sidebar-query.port";
import { ListDefinitionSidebarWorkspaceNotFoundError } from "@/modules/list-definition/domain/list-definition.errors";
import {
  WORKSPACE_ACCESS_QUERY,
  type WorkspaceAccessQuery,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : 현재 사용자가 접근할 수 있는 Workspace의 사이드바 업무 목록을 조회합니다.
@Injectable()
export class ListSidebarListDefinitionsUseCase {
  // 기능 : Workspace 접근 확인과 업무 목록 조회 계약을 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(LIST_DEFINITION_SIDEBAR_QUERY)
    private readonly listDefinitionSidebarQuery: ListDefinitionSidebarQuery
  ) {}

  // 기능 : 멤버십을 확인한 Workspace의 List 요약 목록을 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string
  ): Promise<SidebarListDefinitionListItem[]> {
    // 1. 현재 사용자와 요청 Workspace의 멤버십을 공개 Query Port로 확인한다.
    const hasWorkspaceMembership =
      await this.workspaceAccessQuery.hasWorkspaceMembership(
        currentUser.id,
        workspaceId
      );

    // 2. 접근할 수 없는 Workspace의 존재 여부를 노출하지 않고 조회를 차단한다.
    if (!hasWorkspaceMembership) {
      throw new ListDefinitionSidebarWorkspaceNotFoundError();
    }

    // 3. 접근 가능한 Workspace에 속한 업무 목록 조회를 위임한다.
    return this.listDefinitionSidebarQuery.listSidebarListDefinitions(
      workspaceId
    );
  }
}
