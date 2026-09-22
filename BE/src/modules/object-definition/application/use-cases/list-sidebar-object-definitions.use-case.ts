import { Inject, Injectable } from "@nestjs/common";
import {
  type ObjectDefinitionSidebarQuery,
  OBJECT_DEFINITION_SIDEBAR_QUERY,
  type SidebarObjectDefinitionListItem,
} from "@/modules/object-definition/application/ports/object-definition-sidebar-query.port";
import { ObjectDefinitionSidebarWorkspaceNotFoundError } from "@/modules/object-definition/domain/object-definition.errors";
import {
  type WorkspaceAccessQuery,
  WORKSPACE_ACCESS_QUERY,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : ListSidebarObjectDefinitionsUseCase가 사이드바 Items 섹션의 ObjectDefinition 목록 조회를 담당합니다.
@Injectable()
export class ListSidebarObjectDefinitionsUseCase {
  // 기능 : Workspace 접근 확인 포트와 ObjectDefinition 조회 포트를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_SIDEBAR_QUERY)
    private readonly objectDefinitionSidebarQuery: ObjectDefinitionSidebarQuery
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace의 ObjectDefinition 요약 목록을 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string
  ): Promise<SidebarObjectDefinitionListItem[]> {
    // 1. 현재 사용자 ID와 요청 Workspace ID 기준으로 Workspace membership을 확인한다.
    const hasWorkspaceMembership =
      await this.workspaceAccessQuery.hasWorkspaceMembership(
        currentUser.id,
        workspaceId
      );

    // 2. 멤버십이 없거나 Workspace가 없으면 정보 노출 없이 not found로 차단한다.
    if (!hasWorkspaceMembership) {
      throw new ObjectDefinitionSidebarWorkspaceNotFoundError();
    }

    // 3. 접근 가능한 Workspace의 사이드바 ObjectDefinition 목록 조회를 위임한다.
    return this.objectDefinitionSidebarQuery.listSidebarObjectDefinitions(
      workspaceId
    );
  }
}
