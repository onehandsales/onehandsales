import type { ViewDataQueryContext } from "../view-data-query-context";
import type {
  ViewMainDataByType,
  ViewItemPage,
  ViewDependencyEndpoint,
  ViewDependency,
} from "../view-data.types";
import { dateEvents } from "../view-data-dates";
import { groupedRows } from "../view-data-groups";
import { jsonObject } from "../view-data-json";
import { decimalRatio, decimalUnits } from "../view-data-decimal";
import { ViewDataNeedsConfiguration } from "../view-data.errors";
// 기능 : 기간·진행률과 현재 페이지에서 해석 가능한 업무 관계를 반환합니다.
export function readGanttData(
  context: ViewDataQueryContext,
): ViewMainDataByType["GANTT"] | ViewItemPage {
  const presentation = context.presentation(
    { timeScale: "WEEK", showDependencies: true },
    { timeScale: ["DAY", "WEEK", "MONTH"] },
  );
  const dates = dateEvents(context);
  if (
    context.part === "UNSCHEDULED_ITEMS" ||
    context.part === "INVALID_DATE_ITEMS"
  ) {
    const items =
      context.part === "UNSCHEDULED_ITEMS" ? dates.unscheduled : dates.invalid;
    context.eligibleCount = items.length;
    return context.page(items);
  }
  const progress = context.binding("PROGRESS", ["Number"], false);
  const scale = jsonObject(progress?.format).valueScale;
  if (progress && (typeof scale !== "number" || ![1, 100].includes(scale)))
    throw new ViewDataNeedsConfiguration(
      "PROGRESS_SCALE_REQUIRED",
      "PROGRESS",
      progress.id,
    );
  const { groups, rows } = groupedRows(context),
    byId = new Map(dates.events.map((event) => [event.item.itemKey, event]));
  const tasks = rows.flatMap((row) => {
    const event = byId.get(row.item.key);
    if (!event) return [];
    const value = event.item.cells.find(
      (cell) => cell.bindingId === progress?.id,
    )?.values[0]?.value;
    const valid =
      typeof value === "string" &&
      decimalUnits(value) >= 0n &&
      decimalUnits(value) <= decimalUnits(String(scale));
    return [
      {
        ...event,
        item: context.values.item(row.item, row.path),
        progress: valid
          ? {
              rawValue: value as string,
              valueScale: String(scale),
              ratio: decimalRatio(value as string, String(scale)),
            }
          : null,
      },
    ];
  });
  context.eligibleCount = new Set(tasks.map((task) => task.item.itemKey)).size;
  const page = context.page(tasks),
    pageIds = new Set(page.items.map((task) => task.item.itemKey));
  // 기능 : 필터 밖 endpoint는 제거하고 중복 Entry로 모호한 Record 연결은 그리지 않습니다.
  const endpoint = (
    recordId: string | null,
    entryId: string | null,
  ): ViewDependencyEndpoint | null => {
    if (!!recordId === !!entryId) return null;
    const matches = context.items.filter((item) =>
      recordId ? item.record.id === recordId : item.entry?.id === entryId,
    );
    if (!matches.length) return null;
    return {
      kind: recordId ? "RECORD" : "LIST_ENTRY",
      id: (recordId ?? entryId)!,
      itemKeys:
        matches.length === 1 && pageIds.has(matches[0]!.key)
          ? [matches[0]!.key]
          : [],
    };
  };
  const dependencies: ViewDependency[] = presentation.showDependencies
    ? context.snapshot.dependencies.flatMap((row) => {
        const source = endpoint(
            row.sourceRecordDefinitionId,
            row.sourceListEntryDefinitionId,
          ),
          target = endpoint(
            row.targetRecordDefinitionId,
            row.targetListEntryDefinitionId,
          );
        if (!source || !target) return [];
        return [
          {
            id: row.id,
            type: row.type,
            source,
            target,
            offset: {
              value: row.dependencyTimeOffsetValue,
              unit: row.dependencyTimeOffsetUnit,
            },
            renderable:
              source.itemKeys.length === 1 && target.itemKeys.length === 1,
          },
        ];
      })
    : [];
  return {
    presentation,
    range: context.range,
    tasks: page.items,
    dependencies,
    groups,
    unscheduledCount: dates.unscheduled.length,
    invalidDateCount: dates.invalid.length,
    pageInfo: page.pageInfo,
  };
}
