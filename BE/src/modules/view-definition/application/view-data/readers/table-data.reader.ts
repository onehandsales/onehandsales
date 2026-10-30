import type { ViewDataQueryContext } from "../view-data-query-context";
import type { ViewMainDataByType } from "../view-data.types";
import { groupedRows } from "../view-data-groups";
// 기능 : 표시 열 순서·너비와 그룹별 행을 페이지로 반환합니다.
export function readTableData(
  context: ViewDataQueryContext,
): ViewMainDataByType["TABLE"] {
  const presentation = context.presentation(
    { rowDensity: "COMFORTABLE" },
    { rowDensity: ["COMFORTABLE", "COMPACT"] },
  );
  const { groups, rows } = groupedRows(context);
  const page = context.page(rows);
  return {
    presentation,
    columnBindingIds: context.values.bindings
      .filter((binding) => !binding.isHidden)
      .map((binding) => binding.id),
    groups,
    items: page.items.map((row) => context.values.item(row.item, row.path)),
    pageInfo: page.pageInfo,
  };
}
