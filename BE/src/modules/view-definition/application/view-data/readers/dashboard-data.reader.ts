import type { ViewDataQueryContext } from "../view-data-query-context";
import type { ViewMainDataByType, ViewWidget } from "../view-data.types";
import { jsonObject } from "../view-data-json";
import {
  assertViewDataLimit,
  ViewDataNeedsConfiguration,
} from "../view-data.errors";
// 기능 : 독립 원본 View의 안전한 구성과 배치를 반환하고 자식 오류를 격리합니다.
export function readDashboardData(
  context: ViewDataQueryContext,
): ViewMainDataByType["DASHBOARD"] {
  const presentation = context.presentation({ gridColumns: 12 });
  const gridColumns = presentation.gridColumns;
  if (
    typeof gridColumns !== "number" ||
    !Number.isInteger(gridColumns) ||
    gridColumns < 1 ||
    gridColumns > 24
  )
    throw new ViewDataNeedsConfiguration(
      "DASHBOARD_GRID_UNSUPPORTED",
      "gridColumns",
    );
  const rows = context.snapshot.configuration.viewWidgetDefinitions.filter(
    (row) => !row.isHidden,
  );
  assertViewDataLimit(rows.length, 50);
  const widgets: ViewWidget[] = rows.map((row) => {
    const child = context.snapshot.children.find(
      (child) =>
        child.id === row.contentViewDefinitionId &&
        child.workspaceId === context.snapshot.configuration.view.workspaceId,
    );
    const options = jsonObject(row.configJson),
      raw = jsonObject(row.layoutJson);
    const widget: ViewWidget = {
      id: row.id,
      title: child ? (row.titleOverride ?? child.name) : "사용할 수 없는 보기",
      showTitle: options.showTitle !== false,
      layout: null,
      content: null,
      state: "READY",
    };
    if (!child) {
      widget.state = "UNAVAILABLE";
      return widget;
    }
    if (child.id === context.snapshot.configuration.view.id) {
      widget.state = "CYCLE";
      return widget;
    }
    if (
      child.type === "DASHBOARD" ||
      (child.objectDefinitionId && child.listDefinitionId) ||
      (!child.objectDefinitionId && !child.listDefinitionId)
    ) {
      widget.state = "NEEDS_CONFIGURATION";
      return widget;
    }
    const { x, y, width, height } = raw;
    if (
      [x, y, width, height].some(
        (value) => typeof value !== "number" || !Number.isInteger(value),
      ) ||
      Number(x) < 0 ||
      Number(y) < 0 ||
      Number(width) < 1 ||
      Number(height) < 1 ||
      Number(x) + Number(width) > gridColumns ||
      Number(y) + Number(height) > 1000 ||
      Object.keys(options).some((key) => key !== "showTitle") ||
      (options.showTitle !== undefined &&
        typeof options.showTitle !== "boolean")
    ) {
      widget.state = "NEEDS_CONFIGURATION";
      return widget;
    }
    widget.layout = {
      x: Number(x),
      y: Number(y),
      width: Number(width),
      height: Number(height),
    };
    widget.content = {
      viewDefinitionId: child.id,
      viewType: child.type,
      sourceType: child.objectDefinitionId ? "OBJECT" : "LIST",
    };
    return widget;
  });
  // 1. 겹치는 배치는 한쪽을 덮어쓰지 않고 해당 두 위젯을 안내 상태로 전환한다.
  for (let i = 0; i < widgets.length; i++)
    for (let j = i + 1; j < widgets.length; j++) {
      const a = widgets[i]!,
        b = widgets[j]!,
        x = a.layout,
        y = b.layout;
      if (
        x &&
        y &&
        x.x < y.x + y.width &&
        y.x < x.x + x.width &&
        x.y < y.y + y.height &&
        y.y < x.y + x.height
      ) {
        a.state = "NEEDS_CONFIGURATION";
        b.state = "NEEDS_CONFIGURATION";
      }
    }
  return { presentation, widgets, visibleWidgetCount: widgets.length };
}
