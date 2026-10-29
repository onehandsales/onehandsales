import type { AppI18nKey } from "@/features/app-i18n";
import type { ViewAttributeCandidate, ViewJson, ViewReference } from "../types/view-menu";
import type { WorkspaceViewType } from "../types/workspace-view";

export const VIEW_TYPE_LABELS: Record<WorkspaceViewType, AppI18nKey> = {
  TABLE: "viewHeader.table", KANBAN: "viewHeader.kanban", LIST: "viewHeader.list", GALLERY: "viewHeader.gallery",
  CALENDAR: "viewHeader.calendar", TIMELINE: "viewHeader.timeline", GANTT: "viewHeader.gantt", CHART: "viewHeader.chart",
  PIVOT: "viewHeader.pivot", MAP: "viewHeader.map", DASHBOARD: "viewHeader.dashboard",
};
export const MENU_INPUT = "h-8 min-w-0 rounded border border-[#E7E6E2] bg-white px-2 outline-none focus:border-[#A9C5FA]";

// 기능 : 각 보기에서 의미 있는 검색·필터·정렬·생성 도구를 결정합니다.
export function getViewTools(type: WorkspaceViewType | undefined) {
  return { search: type !== "CHART" && type !== "PIVOT" && type !== "DASHBOARD",
    filters: type !== "DASHBOARD", sorts: !["CALENDAR", "CHART", "PIVOT", "DASHBOARD"].includes(type ?? ""),
    create: type !== "CHART" && type !== "PIVOT" && type !== "DASHBOARD" };
}

// 기능 : JSON 설정의 직접 필드만 읽고 상속된 예약 이름을 설정으로 해석하지 않습니다.
export function readViewConfig(value: ViewJson, key: string): ViewJson | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Object.hasOwn(value, key)
    ? (value as { readonly [key: string]: ViewJson })[key] : undefined;
}

// 기능 : 알려진 설정 하나만 임시 변경하고 나머지 저장 필드는 보존합니다.
export function updateViewConfig(value: ViewJson, key: string, next: ViewJson): ViewJson {
  return { ...(value !== null && typeof value === "object" && !Array.isArray(value) ? value : {}), [key]: next };
}

// 기능 : 참조 경로와 시작점을 포함해 같은 이름의 정보도 구분합니다.
export function referenceLabel(reference: ViewReference, attributes: readonly ViewAttributeCandidate[]): string {
  const names = new Map(attributes.map(item => [item.id, item.title]));
  return [...reference.referenceAttributeIdPathJson, reference.attributeDefinitionId].map(id => names.get(id) ?? id).join(" → ");
}
