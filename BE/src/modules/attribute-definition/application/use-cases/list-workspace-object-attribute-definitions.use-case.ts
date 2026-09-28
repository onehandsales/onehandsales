import { Inject, Injectable } from "@nestjs/common";
import {
  ATTRIBUTE_DEFINITION_LIST_QUERY,
  type AttributeDefinitionListQuery,
  type WorkspaceObjectAttributeDefinitionListItem,
} from "@/modules/attribute-definition/application/ports/attribute-definition-list-query.port";
import {
  AttributeDefinitionObjectDefinitionNotFoundError,
  AttributeDefinitionWorkspaceNotFoundError,
} from "@/modules/attribute-definition/domain/attribute-definition.errors";
import {
  OBJECT_DEFINITION_ACCESS_QUERY,
  type ObjectDefinitionAccessQuery,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import {
  type WorkspaceAccessQuery,
  WORKSPACE_ACCESS_QUERY,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : ListWorkspaceObjectAttributeDefinitionsUseCase가 Object 목록 header row용 AttributeDefinition 목록 조회를 담당합니다.
@Injectable()
export class ListWorkspaceObjectAttributeDefinitionsUseCase {
  // 기능 : Workspace 접근 포트, ObjectDefinition 접근 포트, AttributeDefinition 조회 포트를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY)
    private readonly objectDefinitionAccessQuery: ObjectDefinitionAccessQuery,
    @Inject(ATTRIBUTE_DEFINITION_LIST_QUERY)
    private readonly attributeDefinitionListQuery: AttributeDefinitionListQuery
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition의 AttributeDefinition 목록을 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    objectDefinitionId: string
  ): Promise<WorkspaceObjectAttributeDefinitionListItem[]> {
    // 1. 현재 사용자 ID와 요청 Workspace ID 기준으로 Workspace membership을 확인한다.
    const hasWorkspaceMembership =
      await this.workspaceAccessQuery.hasWorkspaceMembership(
        currentUser.id,
        workspaceId
      );

    // 2. 멤버십이 없거나 Workspace가 없으면 정보 노출 없이 not found로 차단한다.
    if (!hasWorkspaceMembership) {
      throw new AttributeDefinitionWorkspaceNotFoundError();
    }

    // 3. 요청 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
    const hasObjectDefinition =
      await this.objectDefinitionAccessQuery.hasObjectDefinitionInWorkspace({
        workspaceId,
        objectDefinitionId,
      });

    // 4. ObjectDefinition이 없거나 다른 Workspace에 속하면 not found로 차단한다.
    if (!hasObjectDefinition) {
      throw new AttributeDefinitionObjectDefinitionNotFoundError();
    }

    // 5. 접근 가능한 Workspace ObjectDefinition의 AttributeDefinition 목록 조회를 위임한다.
    return this.attributeDefinitionListQuery.listWorkspaceObjectAttributeDefinitions(
      {
        workspaceId,
        objectDefinitionId,
      }
    );
  }
}
