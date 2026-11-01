import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { useAppI18n } from "@/features/app-i18n";
import type { ViewDataGroup, ViewDataItem } from "../types/view-data";

// 기능 : 서버의 occurrence 순서를 유지하면서 최대 세 단계 그룹과 화면 접힘을 표시합니다.
export function ViewDataGroups({ items, groups, renderItem, table = false }: {
  readonly items: readonly ViewDataItem[]; readonly groups: readonly ViewDataGroup[];
  readonly renderItem: (item: ViewDataItem) => ReactNode; readonly table?: boolean;
}) {
  const { t } = useAppI18n();
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const groupMap = new Map(groups.map(group => [group.key, group]));
  const seen = new Set<string>();
  // 기능 : 상위 접힘을 먼저 확인해 해당 occurrence의 그룹 제목과 행을 구성합니다.
  function renderOccurrence(item: ViewDataItem) {
    const headings: ReactNode[] = [];
    let hidden = false;
    for (const [depth, key] of item.groupPath.entries()) {
      const group = groupMap.get(key);
      if (!group || group.isHidden) { hidden = true; break; }
      const isFold = folded[key] ?? group.isFold;
      if (!seen.has(key)) {
        seen.add(key);
        headings.push(<div key={key} role={table ? "row" : undefined}>
          <div role={table ? "cell" : undefined}>
            <button aria-expanded={!isFold} className="flex h-9 w-full items-center gap-2 border-b border-[#EEEDEA] bg-[#FAFAF8] pr-3 text-left text-[12px] font-medium text-[#65645F] hover:bg-[#F0EFEC]"
              style={{ paddingLeft: 12 + depth * 16 }} type="button"
              onClick={() => setFolded(current => ({ ...current, [key]: !isFold }))}>
              {isFold ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span className="truncate">{group.label}</span><span className="text-[#9B9A97]">{t("viewData.count", { values: { count: group.count } })}</span>
            </button>
          </div>
        </div>);
      }
      if (isFold) { hidden = true; break; }
    }
    return <Fragment key={item.occurrenceKey}>{headings}{!hidden && renderItem(item)}</Fragment>;
  }
  return <>{items.map(renderOccurrence)}</>;
}
