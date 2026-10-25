import { Inject, Injectable } from "@nestjs/common";
import {
  OBJECT_DEFINITION_SUMMARY_QUERY,
  type ObjectDefinitionSummaryQuery,
} from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import {
  OBJECT_DEFINITION_VIEWS_QUERY,
  type ObjectDefinitionViewsQuery,
} from "@/modules/view-definition/application/ports/object-definition-views-query.port";
import type { ViewDefinitionType } from "@/modules/view-definition/application/view-definition-type";
import {
  ObjectViewsObjectDefinitionNotFoundError,
  ObjectViewsWorkspaceNotFoundError,
} from "@/modules/view-definition/domain/view-definition.errors";
import {
  WORKSPACE_ACCESS_QUERY,
  type WorkspaceAccessQuery,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : Object 보기 선택 메뉴의 표시 정보와 현재 선택 여부를 정의합니다.
export interface WorkspaceObjectViewListItem {
  readonly viewId: string;
  readonly viewName: string;
  readonly viewIcon: string | null;
  readonly viewType: ViewDefinitionType;
  readonly isSelected: boolean;
}

// 역할 : Object 보기 선택 메뉴의 정상 빈 목록을 포함한 응답을 정의합니다.
export interface WorkspaceObjectViewsResponse {
  readonly items: readonly WorkspaceObjectViewListItem[];
}

// 역할 : Object 소속 View 목록의 접근을 확인하고 선택 표시를 조합합니다.
@Injectable()
export class ListWorkspaceObjectViewsUseCase {
  // 기능 : Workspace와 대상의 공개 조회 Port 및 View 목록 계약을 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_SUMMARY_QUERY)
    private readonly objectSummaryQuery: ObjectDefinitionSummaryQuery,
    @Inject(OBJECT_DEFINITION_VIEWS_QUERY)
    private readonly objectViewsQuery: ObjectDefinitionViewsQuery
  ) {}

  // 기능 : 접근 가능한 Object의 전체 View와 요청한 현재 선택 표시를 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    objectDefinitionId: string,
    viewId?: string
  ): Promise<WorkspaceObjectViewsResponse> {
    // 1. 헤더 조회 여부와 관계없이 현재 사용자의 멤버십을 한 번 확인한다.
    const isMember = await this.workspaceAccessQuery.hasWorkspaceMembership(
      currentUser.id,
      workspaceId
    );
    if (!isMember) {
      throw new ObjectViewsWorkspaceNotFoundError();
    }

    // 2. 소유 모듈의 공개 Port로 대상이 요청 Workspace에 있는지 확인한다.
    const object = await this.objectSummaryQuery.findObjectDefinitionSummary({
      workspaceId,
      objectDefinitionId,
    });
    if (!object) {
      throw new ObjectViewsObjectDefinitionNotFoundError();
    }

    // 3. View ID를 목록 필터로 사용하지 않고 대상의 정렬된 전체 요약을 얻는다.
    const views = await this.objectViewsQuery.findWorkspaceObjectViews({
      workspaceId,
      objectDefinitionId,
    });

    // 4. UUID 대소문자를 정규화해 선택만 표시하고 순서와 빈 목록을 보존한다.
    const selectedViewId = viewId?.toLowerCase();
    return {
      items: views.map((view) => ({
        viewId: view.id,
        viewName: view.name,
        viewIcon: view.icon,
        viewType: view.type,
        isSelected: view.id.toLowerCase() === selectedViewId,
      })),
    };
  }
}
