import { Inject, Injectable } from "@nestjs/common";
import {
  LIST_DEFINITION_SUMMARY_QUERY,
  type ListDefinitionSummaryQuery,
} from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import {
  LIST_DEFINITION_VIEWS_QUERY,
  type ListDefinitionViewsQuery,
} from "@/modules/view-definition/application/ports/list-definition-views-query.port";
import type { ViewDefinitionType } from "@/modules/view-definition/application/view-definition-type";
import {
  ListViewsListDefinitionNotFoundError,
  ListViewsWorkspaceNotFoundError,
} from "@/modules/view-definition/domain/view-definition.errors";
import {
  WORKSPACE_ACCESS_QUERY,
  type WorkspaceAccessQuery,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : List 보기 선택 메뉴의 표시 정보와 현재 선택 여부를 정의합니다.
export interface WorkspaceListViewListItem {
  readonly viewDefinitionId: string;
  readonly viewName: string;
  readonly viewIcon: string | null;
  readonly viewType: ViewDefinitionType;
  readonly isSelected: boolean;
}

// 역할 : List 보기 선택 메뉴의 정상 빈 목록을 포함한 응답을 정의합니다.
export interface WorkspaceListViewsResponse {
  readonly items: readonly WorkspaceListViewListItem[];
}

// 역할 : List 소속 View 목록의 접근을 확인하고 선택 표시를 조합합니다.
@Injectable()
export class ListWorkspaceListViewsUseCase {
  // 기능 : Workspace와 대상의 공개 조회 Port 및 View 목록 계약을 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(LIST_DEFINITION_SUMMARY_QUERY)
    private readonly listSummaryQuery: ListDefinitionSummaryQuery,
    @Inject(LIST_DEFINITION_VIEWS_QUERY)
    private readonly listViewsQuery: ListDefinitionViewsQuery
  ) {}

  // 기능 : 접근 가능한 List의 전체 View와 요청한 현재 선택 표시를 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    listDefinitionId: string,
    viewDefinitionId?: string
  ): Promise<WorkspaceListViewsResponse> {
    // 1. 헤더 조회 여부와 관계없이 현재 사용자의 멤버십을 한 번 확인한다.
    const isMember = await this.workspaceAccessQuery.hasWorkspaceMembership(
      currentUser.id,
      workspaceId
    );
    if (!isMember) {
      throw new ListViewsWorkspaceNotFoundError();
    }

    // 2. 소유 모듈의 공개 Port로 대상이 요청 Workspace에 있는지 확인한다.
    const list = await this.listSummaryQuery.findListDefinitionSummary({
      workspaceId,
      listDefinitionId,
    });
    if (!list) {
      throw new ListViewsListDefinitionNotFoundError();
    }

    // 3. View ID를 목록 필터로 사용하지 않고 대상의 정렬된 전체 요약을 얻는다.
    const views = await this.listViewsQuery.findWorkspaceListViews({
      workspaceId,
      listDefinitionId,
    });

    // 4. UUID 대소문자를 정규화해 선택만 표시하고 순서와 빈 목록을 보존한다.
    const selectedViewDefinitionId = viewDefinitionId?.toLowerCase();
    return {
      items: views.map((view) => ({
        viewDefinitionId: view.id,
        viewName: view.name,
        viewIcon: view.icon,
        viewType: view.type,
        isSelected: view.id.toLowerCase() === selectedViewDefinitionId,
      })),
    };
  }
}
