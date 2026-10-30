import type { ViewDataQueryContext } from "../view-data-query-context";
import type {
  ViewMainDataByType,
  ViewPartialResponse,
} from "../view-data.types";
import { ViewDataNeedsConfiguration } from "../view-data.errors";
import { groupBuckets } from "../view-data-groups";
import { metricReader } from "../view-data-aggregation";
// 기능 : 단계별 전체 개수와 독립 페이지를 계산하고 숨김·접힘을 보존합니다.
export function readKanbanData(
  context: ViewDataQueryContext,
):
  | ViewMainDataByType["KANBAN"]
  | Extract<ViewPartialResponse, { part: "GROUP_ITEMS" }>["data"] {
  const presentation = context.presentation(
    {
      cardDensity: "COMFORTABLE",
      showEmptyGroups: true,
      aggregation: "COUNT_ITEMS",
    },
    {
      cardDensity: ["COMFORTABLE", "COMPACT"],
      aggregation: ["COUNT_ITEMS", "COUNT_VALUES", "SUM", "AVG", "MIN", "MAX"],
    },
  );
  const definitions =
    context.snapshot.configuration.viewGroupDefinitions.filter(
      (row) => row.groupRole === "GROUP",
    );
  if (definitions.length !== 1)
    throw new ViewDataNeedsConfiguration("KANBAN_GROUP_REQUIRED", "groups");
  const definition = definitions[0]!;
  const type = context.snapshot.attributes.get(
    definition.attributeDefinitionId,
  )!.type;
  if (type !== "Select" && type !== "Status")
    throw new ViewDataNeedsConfiguration(
      "KANBAN_GROUP_TYPE_UNSUPPORTED",
      "groups",
    );
  const buckets = groupBuckets(
    context,
    definition,
    context.items,
    presentation.showEmptyGroups === true,
  );
  const visible = buckets.filter((bucket) => !bucket.group.isHidden);
  const calculations = context.values.bindings
    .filter((binding) => binding.role === "MEASURE")
    .map((binding) => metricReader(context, binding));
  context.eligibleCount = new Set(
    visible.flatMap((bucket) => bucket.items.map((item) => item.key)),
  ).size;
  if (context.part === "GROUP_ITEMS") {
    const key = context.selectedGroup(),
      bucket = visible.find((bucket) => bucket.group.key === key);
    if (!bucket)
      throw new ViewDataNeedsConfiguration("GROUP_UNAVAILABLE", "groupToken");
    const page = context.page(bucket.items, "GROUP_ITEMS", key);
    return {
      groupKey: key,
      groupToken: context.request.groupToken!,
      items: page.items.map((item) => context.values.item(item, [key])),
      pageInfo: page.pageInfo,
    };
  }
  return {
    presentation,
    groupDefinitionId: definition.id,
    columns: visible.map((bucket) => {
      const page = context.page(bucket.items, "GROUP_ITEMS", bucket.group.key);
      return {
        ...bucket.group,
        groupToken: context.groupToken(bucket.group.key),
        items: page.items.map((item) =>
          context.values.item(item, [bucket.group.key]),
        ),
        pageInfo: page.pageInfo,
        calculations: calculations.map((calculation) => ({
          metric: calculation.metric,
          result: calculation.aggregate(bucket.items),
        })),
      };
    }),
    unassignedCount:
      buckets.find((bucket) => !bucket.dimension.reference)?.items.length ?? 0,
  };
}
