import type { WorkspaceViewHeaderRecord } from "./ports/view-definition-header-query.port";
import type { ViewDefinitionType } from "./view-definition-type";

// 역할 : 공통 헤더에 표시할 관리항목 또는 업무목록의 요약입니다.
export interface ViewHeaderTargetSummary {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
}

// 역할 : 대상 기준 첫 보기와 View ID 기준 단건 보기가 공유하는 헤더 응답입니다.
export interface WorkspaceViewHeaderResponse {
  readonly viewId: string | null;
  readonly viewName: string | null;
  readonly viewIcon: string | null;
  readonly viewType: ViewDefinitionType | null;
  readonly isFavorite: boolean;
  readonly objectDefinition: ViewHeaderTargetSummary | null;
  readonly listDefinition: ViewHeaderTargetSummary | null;
}

// 기능 : 내부 조회 필드를 기존 일곱 개의 공통 헤더 응답으로 변환합니다.
export function toWorkspaceViewHeaderResponse(view: WorkspaceViewHeaderRecord | null, objectDefinition: ViewHeaderTargetSummary | null, listDefinition: ViewHeaderTargetSummary | null): WorkspaceViewHeaderResponse {
  return { viewId: view?.id ?? null, viewName: view?.name ?? null, viewIcon: view?.icon ?? null,
    viewType: view?.type ?? null, isFavorite: view?.isFavorite ?? false, objectDefinition, listDefinition };
}
