import { Inject, Injectable } from "@nestjs/common";
import { WORKSPACE_ACCESS_QUERY, type WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { OBJECT_DEFINITION_SUMMARY_QUERY, type ObjectDefinitionSummaryQuery } from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import { LIST_DEFINITION_SUMMARY_QUERY, type ListDefinitionSummaryQuery } from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ViewHeaderWorkspaceNotFoundError, ViewHeaderViewDefinitionNotFoundError } from "../../domain/view-definition.errors";
import { VIEW_DEFINITION_HEADER_QUERY, type ViewDefinitionHeaderQuery } from "../ports/view-definition-header-query.port";
import { readViewHeaderTarget } from "../view-header-target-reader";
import { toWorkspaceViewHeaderResponse, type WorkspaceViewHeaderResponse } from "../view-header-response";

// 역할 : 즐겨찾기나 직접 URL의 특정 View를 기존 공통 헤더 모델로 엽니다.
@Injectable()
export class GetWorkspaceViewHeaderByViewIdUseCase {
  // 기능 : 기존 헤더와 같은 Workspace·대상·View 소유 Port를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY) private readonly workspace: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_SUMMARY_QUERY) private readonly objects: ObjectDefinitionSummaryQuery,
    @Inject(LIST_DEFINITION_SUMMARY_QUERY) private readonly lists: ListDefinitionSummaryQuery,
    @Inject(VIEW_DEFINITION_HEADER_QUERY) private readonly views: ViewDefinitionHeaderQuery,
  ) {}

  // 기능 : 멤버십을 확인하고 요청한 View와 연결된 두 소속을 정확히 반환합니다.
  async execute(user: CurrentUserContext, workspaceId: string, viewDefinitionId: string): Promise<WorkspaceViewHeaderResponse> {
    // 1. 클라이언트가 보낸 멤버 ID를 사용하지 않고 Actor 없는 읽기도 허용한다.
    const member = await this.workspace.getWorkspaceMemberAccess(user.id, workspaceId);
    if (!member) throw new ViewHeaderWorkspaceNotFoundError();
    // 2. 첫 View 선택으로 돌아가지 않고 요청 Workspace와 View ID를 함께 제한한다.
    const view = await this.views.findWorkspaceViewHeaderById({ workspaceId, viewDefinitionId, workspaceMemberId: member.workspaceMemberId });
    if (!view) throw new ViewHeaderViewDefinitionNotFoundError();
    // 3. 연결된 원본을 각각 소유 Port로 검증하고 이중/무소속을 임의 보정하지 않는다.
    const [object, list] = await Promise.all([
      view.objectDefinitionId ? readViewHeaderTarget(workspaceId, { targetType: "OBJECT", targetId: view.objectDefinitionId }, this.objects, this.lists) : null,
      view.listDefinitionId ? readViewHeaderTarget(workspaceId, { targetType: "LIST", targetId: view.listDefinitionId }, this.objects, this.lists) : null,
    ]);
    return toWorkspaceViewHeaderResponse(view, object, list);
  }
}
