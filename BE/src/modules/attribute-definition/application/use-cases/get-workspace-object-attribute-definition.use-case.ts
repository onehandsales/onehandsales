import { Inject, Injectable } from "@nestjs/common";
import {
  ATTRIBUTE_DEFINITION_DETAIL_QUERY,
  type AttributeDefinitionDetailQuery,
  type WorkspaceObjectAttributeDefinitionDetail,
} from "@/modules/attribute-definition/application/ports/attribute-definition-detail-query.port";
import {
  AttributeDefinitionNotFoundError,
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

// 역할 : GetWorkspaceObjectAttributeDefinitionUseCase가 Object 목록 header popover용 AttributeDefinition 단건 조회를 담당합니다.
@Injectable()
export class GetWorkspaceObjectAttributeDefinitionUseCase {
  // 기능 : Workspace 접근 포트, ObjectDefinition 접근 포트, AttributeDefinition 단건 조회 포트를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY)
    private readonly objectDefinitionAccessQuery: ObjectDefinitionAccessQuery,
    @Inject(ATTRIBUTE_DEFINITION_DETAIL_QUERY)
    private readonly attributeDefinitionDetailQuery: AttributeDefinitionDetailQuery
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition의 AttributeDefinition 단건 정보를 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    objectDefinitionId: string,
    attributeDefinitionId: string
  ): Promise<WorkspaceObjectAttributeDefinitionDetail> {
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

    // 5. 요청 AttributeDefinition이 Workspace/ObjectDefinition 경계 안에 있는지 조회한다.
    const attributeDefinition =
      await this.attributeDefinitionDetailQuery.findWorkspaceObjectAttributeDefinition(
        {
          workspaceId,
          objectDefinitionId,
          attributeDefinitionId,
        }
      );

    // 6. AttributeDefinition이 없거나 다른 ObjectDefinition에 속하면 not found로 차단한다.
    if (!attributeDefinition) {
      throw new AttributeDefinitionNotFoundError();
    }

    // 7. 단건 조회 결과를 호출자에게 반환한다.
    return attributeDefinition;
  }
}
