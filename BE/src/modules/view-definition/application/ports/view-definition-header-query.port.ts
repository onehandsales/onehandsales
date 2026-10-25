import type { ViewDefinitionType } from "@/modules/view-definition/application/view-definition-type";
import type { ViewHeaderTargetInput } from "@/modules/view-definition/application/view-header-target";

export const VIEW_DEFINITION_HEADER_QUERY = Symbol(
  "VIEW_DEFINITION_HEADER_QUERY"
);

// 역할 : 인증으로 확인된 멤버와 클릭 대상의 헤더 조회 범위를 정의합니다.
export interface WorkspaceViewHeaderQueryInput extends ViewHeaderTargetInput {
  readonly workspaceId: string;
  readonly workspaceMemberId: string;
}

// 역할 : 선택한 View의 최소 표시 정보와 개인 즐겨찾기 상태를 정의합니다.
export interface WorkspaceViewHeaderRecord {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
  readonly type: ViewDefinitionType;
  readonly isFavorite: boolean;
}

// 역할 : 클릭 대상에 속한 초기 View와 개인 상태를 조회하는 계약을 정의합니다.
export interface ViewDefinitionHeaderQuery {
  // 기능 : 저장 순서의 첫 View를 조회하며 해당 대상에 View가 없으면 null을 반환합니다.
  findFirstWorkspaceViewHeader(
    input: WorkspaceViewHeaderQueryInput
  ): Promise<WorkspaceViewHeaderRecord | null>;
}
