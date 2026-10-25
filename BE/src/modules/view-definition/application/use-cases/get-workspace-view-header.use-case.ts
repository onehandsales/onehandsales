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
import type { ViewDefinitionType } from "@/modules/view-definition/application/view-definition-type";
import type { ViewHeaderTargetInput } from "@/modules/view-definition/application/view-header-target";
import {
  ViewHeaderListDefinitionNotFoundError,
  ViewHeaderObjectDefinitionNotFoundError,
  ViewHeaderWorkspaceNotFoundError,
} from "@/modules/view-definition/domain/view-definition.errors";
import {
  WORKSPACE_ACCESS_QUERY,
  type WorkspaceAccessQuery,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : 헤더에 표시할 클릭 대상의 이름과 아이콘을 정의합니다.
export interface ViewHeaderTargetSummary {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
}

// 역할 : 첫 View가 없는 경우도 표현할 수 있는 헤더 단건 응답을 정의합니다.
export interface WorkspaceViewHeaderResponse {
  readonly viewId: string | null;
  readonly viewName: string | null;
  readonly viewIcon: string | null;
  readonly viewType: ViewDefinitionType | null;
  readonly isFavorite: boolean;
  readonly objectDefinition: ViewHeaderTargetSummary | null;
  readonly listDefinition: ViewHeaderTargetSummary | null;
}

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
    const summary = await this.getTargetSummary(workspaceId, target);

    // 3. 전체 View 목록 API를 호출하지 않고 초기 표시할 View 요약만 조회한다.
    const view = await this.viewHeaderQuery.findFirstWorkspaceViewHeader({
      workspaceId,
      workspaceMemberId: member.workspaceMemberId,
      ...target,
    });

    // 4. View가 없어도 실제 대상 요약을 보존하고 생성 없이 빈 보기 상태를 반환한다.
    return {
      viewId: view?.id ?? null,
      viewName: view?.name ?? null,
      viewIcon: view?.icon ?? null,
      viewType: view?.type ?? null,
      isFavorite: view?.isFavorite ?? false,
      objectDefinition: target.targetType === "OBJECT" ? summary : null,
      listDefinition: target.targetType === "LIST" ? summary : null,
    };
  }

  // 기능 : 클릭한 종류의 대상만 해당 Workspace에서 조회해 공통 요약으로 매핑합니다.
  private async getTargetSummary(
    workspaceId: string,
    target: ViewHeaderTargetInput
  ): Promise<ViewHeaderTargetSummary> {
    // 1. Object는 기존 Access Port를 변경하지 않고 새 요약 Port로 조회한다.
    if (target.targetType === "OBJECT") {
      const object = await this.objectSummaryQuery.findObjectDefinitionSummary({
        workspaceId,
        objectDefinitionId: target.targetId,
      });
      if (!object) {
        throw new ViewHeaderObjectDefinitionNotFoundError();
      }
      return { id: object.id, name: object.singularName, icon: object.icon };
    }

    // 2. List는 Object 조회와 섞지 않고 List 소유 모듈의 요약을 사용한다.
    const list = await this.listSummaryQuery.findListDefinitionSummary({
      workspaceId,
      listDefinitionId: target.targetId,
    });
    if (!list) {
      throw new ViewHeaderListDefinitionNotFoundError();
    }
    return list;
  }
}
