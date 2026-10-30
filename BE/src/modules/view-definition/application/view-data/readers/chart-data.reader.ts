import type { ViewDataQueryContext } from "../view-data-query-context";
import type { ViewMainDataByType } from "../view-data.types";
import {
  ViewDataNeedsConfiguration,
  assertViewDataLimit,
} from "../view-data.errors";
import { groupBuckets } from "../view-data-groups";
import { metricReader } from "../view-data-aggregation";
// 기능 : 필터 후 전체 원본에서 범주·계열별 집계와 전체 합계를 계산합니다.
export function readChartData(
  context: ViewDataQueryContext,
): ViewMainDataByType["CHART"] {
  const presentation = context.presentation(
    { chartType: "BAR", showLegend: true, aggregation: "COUNT_ITEMS" },
    {
      chartType: ["BAR", "LINE", "PIE", "DONUT"],
      aggregation: ["COUNT_ITEMS", "COUNT_VALUES", "SUM", "AVG", "MIN", "MAX"],
    },
  );
  const groups = context.snapshot.configuration.viewGroupDefinitions.filter(
      (row) => row.groupRole === "GROUP",
    ),
    series = context.snapshot.configuration.viewGroupDefinitions.filter(
      (row) => row.groupRole === "SERIES",
    );
  if (groups.length !== 1 || series.length > 1)
    throw new ViewDataNeedsConfiguration("CHART_DIMENSIONS_REQUIRED", "groups");
  if (
    series.length &&
    ["PIE", "DONUT"].includes(String(presentation.chartType))
  )
    throw new ViewDataNeedsConfiguration("CHART_SERIES_UNSUPPORTED", "groups");
  const categories = groupBuckets(context, groups[0]!).filter(
    (bucket) => !bucket.group.isHidden,
  );
  const seriesBuckets = series[0]
    ? groupBuckets(context, series[0]).filter(
        (bucket) => !bucket.group.isHidden,
      )
    : [];
  const metric = metricReader(context);
  const points: ViewMainDataByType["CHART"]["points"] = [];
  const eligible = new Set<string>();
  for (const category of categories) {
    if (!series.length) {
      category.items.forEach((item) => eligible.add(item.key));
      points.push({
        categoryKey: category.group.key,
        seriesKey: null,
        result: metric.aggregate(category.items),
      });
    } else
      for (const part of seriesBuckets) {
        const ids = new Set(part.items.map((item) => item.key));
        const items = category.items.filter((item) => ids.has(item.key));
        if (!items.length) continue;
        items.forEach((item) => eligible.add(item.key));
        points.push({
          categoryKey: category.group.key,
          seriesKey: part.group.key,
          result: metric.aggregate(items),
        });
        assertViewDataLimit(points.length, 10000);
      }
  }
  context.eligibleCount = eligible.size;
  return {
    presentation,
    metric: metric.metric,
    categories: categories.map((bucket) => bucket.dimension),
    series: seriesBuckets.map((bucket) => bucket.dimension),
    points,
    total: metric.aggregate(context.items),
  };
}
