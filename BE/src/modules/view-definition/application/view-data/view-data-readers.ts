import type { WorkspaceViewMainContentResponse, SupportedViewDataType, ViewMainDataByType } from "./view-data.types";
import type { ViewDataQueryContext } from "./view-data-query-context";
import { readTableData } from "./readers/table-data.reader";
import { readListData } from "./readers/list-data.reader";
import { readKanbanData } from "./readers/kanban-data.reader";

const readers = { TABLE: readTableData, LIST: readListData, KANBAN: readKanbanData } satisfies Record<SupportedViewDataType, (context: ViewDataQueryContext) => unknown>;
// 기능 : 확인된 세 타입만 전용 조회기로 분기하며 다른 타입으로 fallback하지 않습니다.
export function readViewData(context: ViewDataQueryContext): WorkspaceViewMainContentResponse {
  const viewType = context.viewType;
  const data = readers[viewType](context);
  // 1. GROUP_ITEMS는 KANBAN reader의 별도 응답으로 구분한다.
  if (context.part === "GROUP_ITEMS") return {
    ...context.base(), state: "READY", viewType: "KANBAN", part: "GROUP_ITEMS",
    data: data as import("./view-data.types").ViewPartialResponse["data"],
  };
  return {
    ...context.base(), state: "READY", viewType, part: "MAIN", data: data as ViewMainDataByType[typeof viewType],
  } as WorkspaceViewMainContentResponse;
}
