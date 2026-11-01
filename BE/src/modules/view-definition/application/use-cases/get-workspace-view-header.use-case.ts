import { Inject, Injectable } from "@nestjs/common";
import {
  LIST_DEFINITION_SUMMARY_QUERY,
  type ListDefinitionSummaryQuery,
} from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import {
  OBJECT_DEFINITION_SUMMARY_QUERY,
  type ObjectDefinitionSummaryQuery,
} from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import {
  VIEW_DEFINITION_HEADER_QUERY,
  type ViewDefinitionHeaderQuery,
} from "@/modules/view-definition/application/ports/view-definition-header-query.port";
import type { ViewHeaderTargetInput } from "@/modules/view-definition/application/view-header-target";
import {
  ViewHeaderWorkspaceNotFoundError,
} from "@/modules/view-definition/domain/view-definition.errors";
import {
  WORKSPACE_ACCESS_QUERY,
  type WorkspaceAccessQuery,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { readViewHeaderTarget } from "../view-header-target-reader";
import { toWorkspaceViewHeaderResponse, type WorkspaceViewHeaderResponse } from "../view-header-response";
export type { WorkspaceViewHeaderResponse, ViewHeaderTargetSummary } from "../view-header-response";

// 역할 : 사이드바 대상 클릭에 필요한 초기 View와 대상 요약을 조합합니다.
@Injectable()
export class GetWorkspaceViewHeaderUseCase {
  // 기능 : 멤버십과 각 소유 모듈의 공개 조회 계약을 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_SUMMARY_QUERY)
    private readonly objectSummaryQuery: ObjectDefinitionSummaryQuery,
    @Inject(LIST_DEFINITION_SUMMARY_QUERY)
    private readonly listSummaryQuery: ListDefinitionSummaryQuery,
    @Inject(VIEW_DEFINITION_HEADER_QUERY)
    private readonly viewHeaderQuery: ViewDefinitionHeaderQuery
  ) {}

  // 기능 : 접근 가능한 대상의 첫 View와 현재 멤버의 별표 상태를 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    target: ViewHeaderTargetInput
  ): Promise<WorkspaceViewHeaderResponse> {
    // 1. 인증 사용자의 멤버 ID를 한 번 조회하고 Actor 없는 읽기도 허용한다.
    const member = await this.workspaceAccessQuery.getWorkspaceMemberAccess(
      currentUser.id,
      workspaceId
    );
    if (!member) {
      throw new ViewHeaderWorkspaceNotFoundError();
    }

    // 2. 소유 모듈을 통해 대상 소속을 확인하면서 표시 정보도 함께 얻는다.
    const summary = await readViewHeaderTarget(workspaceId, target, this.objectSummaryQuery, this.listSummaryQuery);

    // 3. 전체 View 목록 API를 호출하지 않고 초기 표시할 View 요약만 조회한다.
    const view = await this.viewHeaderQuery.findFirstWorkspaceViewHeader({
      workspaceId,
      workspaceMemberId: member.workspaceMemberId,
      ...target,
    });

    // 4. View가 없어도 실제 대상 요약을 보존하고 생성 없이 빈 보기 상태를 반환한다.
    return toWorkspaceViewHeaderResponse(view, target.targetType === "OBJECT" ? summary : null, target.targetType === "LIST" ? summary : null);
  }
}
