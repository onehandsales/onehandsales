import type { ViewDataQueryContext } from "../view-data-query-context";
import type { ViewMainDataByType } from "../view-data.types";
import { groupedRows } from "../view-data-groups";
// 기능 : 제목 중심 행과 표시 속성을 Entry 기준으로 반환합니다.
export function readListData(
  context: ViewDataQueryContext,
): ViewMainDataByType["LIST"] {
  const presentation = context.presentation(
    { rowDensity: "COMFORTABLE" },
    { rowDensity: ["COMFORTABLE", "COMPACT"] },
  );
  const { groups, rows } = groupedRows(context),
    page = context.page(rows);
  return {
    presentation,
    groups,
    items: page.items.map((row) => context.values.item(row.item, row.path)),
    pageInfo: page.pageInfo,
  };
}
