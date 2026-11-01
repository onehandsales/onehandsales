import type { ViewDataQueryContext } from "../view-data-query-context";
import type { ViewMainDataByType, ViewPartialResponse } from "../view-data.types";
import { ViewDataNeedsConfiguration } from "../view-data.errors";
import { groupBuckets } from "../view-data-groups";

// 기능 : 단계별 전체 건수와 독립 페이지를 반환하고 숨김·접힘 metadata를 보존합니다.
export function readKanbanData(context: ViewDataQueryContext): ViewMainDataByType["KANBAN"] | ViewPartialResponse["data"] {
  const presentation = context.presentation(
    { cardDensity: null, showEmptyGroups: null },
    { cardDensity: ["COMFORTABLE", "COMPACT"], showEmptyGroups: [true, false] },
  );
  const definitions = context.snapshot.configuration.viewGroupDefinitions.filter(row => row.groupRole === "GROUP");
  if (definitions.length !== 1) throw new ViewDataNeedsConfiguration("KANBAN_GROUP_REQUIRED", "groups");
  const definition = definitions[0]!;
  const type = context.snapshot.attributes.get(definition.attributeDefinitionId)!.type;
  if (type !== "Select" && type !== "Status")
    throw new ViewDataNeedsConfiguration("KANBAN_GROUP_TYPE_UNSUPPORTED", "groups");
  // 1. 전체 필터 결과를 그룹에 분류하여 count와 단계 설정을 적용한다.
  const buckets = groupBuckets(context, definition, context.items, presentation.showEmptyGroups === true);
  const visible = buckets.filter(bucket => !bucket.group.isHidden);
  context.eligibleCount = new Set(visible.flatMap(bucket => bucket.items.map(item => item.key))).size;
  if (context.part === "GROUP_ITEMS") {
    const key = context.selectedGroup();
    const bucket = visible.find(candidate => candidate.group.key === key);
    if (!bucket) throw new ViewDataNeedsConfiguration("GROUP_UNAVAILABLE", "groupToken");
    context.eligibleCount = bucket.items.length;
    const page = context.page(bucket.items, "GROUP_ITEMS", key);
    return { groupKey: key, groupToken: context.request.groupToken!,
      items: page.items.map(item => context.values.item(item, [key])), pageInfo: page.pageInfo };
  }
  // 2. 접힘·숨김 열은 내용 없이 metadata를 전달하고 펼칠 때 독립 조회한다.
  return { presentation, groupDefinitionId: definition.id,
    columns: buckets.map(bucket => {
      const page = bucket.group.isHidden || bucket.group.isFold
        ? { items: [], pageInfo: { hasNextPage: false, nextCursor: null } }
        : context.page(bucket.items, "GROUP_ITEMS", bucket.group.key);
      return { ...bucket.group, groupToken: context.groupToken(bucket.group.key),
        items: page.items.map(item => context.values.item(item, [bucket.group.key])),
        pageInfo: page.pageInfo, calculations: [] };
    }),
    unassignedCount: buckets.find(bucket => !bucket.dimension.reference)?.items.length ?? 0,
  };
}
