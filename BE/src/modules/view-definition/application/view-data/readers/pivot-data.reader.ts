import type { ViewDataQueryContext } from "../view-data-query-context";
import type { ViewMainDataByType } from "../view-data.types";
import {
  ViewDataNeedsConfiguration,
  assertViewDataLimit,
} from "../view-data.errors";
import { groupBuckets } from "../view-data-groups";
import { metricReader } from "../view-data-aggregation";
// 기능 : 실제 존재하는 교차 셀과 원본 기반 행·열·전체 합계를 반환합니다.
export function readPivotData(
  context: ViewDataQueryContext,
): ViewMainDataByType["PIVOT"] {
  const presentation = context.presentation(
    { aggregation: "COUNT_ITEMS", showRowTotals: true, showColumnTotals: true },
    {
      aggregation: ["COUNT_ITEMS", "COUNT_VALUES", "SUM", "AVG", "MIN", "MAX"],
    },
  );
  const rows = context.snapshot.configuration.viewGroupDefinitions.filter(
      (row) => row.groupRole === "PIVOT_ROW",
    ),
    columns = context.snapshot.configuration.viewGroupDefinitions.filter(
      (row) => row.groupRole === "PIVOT_COLUMN",
    );
  if (rows.length !== 1 || columns.length !== 1)
    throw new ViewDataNeedsConfiguration(
      "PIVOT_SINGLE_DIMENSIONS_REQUIRED",
      "groups",
    );
  const rowBuckets = groupBuckets(context, rows[0]!).filter(
      (bucket) => !bucket.group.isHidden,
    ),
    columnBuckets = groupBuckets(context, columns[0]!).filter(
      (bucket) => !bucket.group.isHidden,
    );
  assertViewDataLimit(rowBuckets.length * columnBuckets.length, 10000);
  const metric = metricReader(context),
    cells: ViewMainDataByType["PIVOT"]["cells"] = [],
    eligible = new Set<string>();
  for (const row of rowBuckets)
    for (const column of columnBuckets) {
      const columnIds = new Set(column.items.map((item) => item.key)),
        items = row.items.filter((item) => columnIds.has(item.key));
      if (!items.length) continue;
      items.forEach((item) => eligible.add(item.key));
      cells.push({
        rowKey: row.group.key,
        columnKey: column.group.key,
        result: metric.aggregate(items),
      });
    }
  context.eligibleCount = eligible.size;
  return {
    presentation,
    metric: metric.metric,
    rowDimensions: rowBuckets.map((bucket) => bucket.dimension),
    columnDimensions: columnBuckets.map((bucket) => bucket.dimension),
    cells,
    rowTotals: presentation.showRowTotals
      ? rowBuckets.map((bucket) => ({
          key: bucket.group.key,
          result: metric.aggregate(bucket.items),
        }))
      : [],
    columnTotals: presentation.showColumnTotals
      ? columnBuckets.map((bucket) => ({
          key: bucket.group.key,
          result: metric.aggregate(bucket.items),
        }))
      : [],
    grandTotal: metric.aggregate(context.items),
  };
}
