import type { WorkspaceViewMainContentResponse } from "./view-data.types";
import type { ViewDataQueryContext } from "./view-data-query-context";
import { readTableData } from "./readers/table-data.reader";
import { readListData } from "./readers/list-data.reader";
import { readKanbanData } from "./readers/kanban-data.reader";
import { readGalleryData } from "./readers/gallery-data.reader";
import { readCalendarData } from "./readers/calendar-data.reader";
import { readTimelineData } from "./readers/timeline-data.reader";
import { readGanttData } from "./readers/gantt-data.reader";
import { readChartData } from "./readers/chart-data.reader";
import { readPivotData } from "./readers/pivot-data.reader";
import { readMapData } from "./readers/map-data.reader";
import { readDashboardData } from "./readers/dashboard-data.reader";

const readers = {
  TABLE: readTableData,
  LIST: readListData,
  KANBAN: readKanbanData,
  GALLERY: readGalleryData,
  CALENDAR: readCalendarData,
  TIMELINE: readTimelineData,
  GANTT: readGanttData,
  CHART: readChartData,
  PIVOT: readPivotData,
  MAP: readMapData,
  DASHBOARD: readDashboardData,
};
// 기능 : HTTP endpoint 하나에서 검증된 View Type의 전용 조회기로 분기합니다.
export function readViewData(
  context: ViewDataQueryContext,
): WorkspaceViewMainContentResponse {
  const viewType = context.snapshot.configuration.view.type;
  const data = readers[viewType](context);
  return {
    ...context.base(),
    state: "READY",
    viewType,
    part: context.part,
    data,
  } as WorkspaceViewMainContentResponse;
}
