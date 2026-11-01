import { useAppI18n } from "@/features/app-i18n";
import type { ViewDataItem, ViewListResponse } from "../types/view-data";
import { ViewDataCell, type ViewCellEditing } from "./view-data-cell";
import { ViewDataGroups } from "./view-data-groups";

// 기능 : 같은 원본의 제목과 핵심 속성을 조밀한 목록 행으로 표시합니다.
export function ViewDataList({ response, items, editing }: {
  readonly response: ViewListResponse; readonly items: readonly ViewDataItem[]; readonly editing: ViewCellEditing;
}) {
  const { t } = useAppI18n();
  const bindings = response.bindings.filter(binding => !binding.isHidden);
  const title = bindings.find(binding => binding.role === "TITLE");
  const display = bindings.filter(binding => binding.role === "DISPLAY");
  const body = bindings.filter(binding => binding.role === "BODY");
  // 기능 : Record와 Entry의 값 출처를 보존하며 각 그룹 occurrence를 렌더링합니다.
  function renderItem(item: ViewDataItem) {
    return <div key={item.occurrenceKey} role="listitem" className="border-b border-[#F1F0EC] text-[14px] text-[#374151] hover:bg-[#FAFAF8]">
      <div className="flex min-h-[40px] min-w-[440px] items-center gap-2">
        <div className="flex h-10 w-[min(35%,280px)] min-w-[150px] shrink-0 items-center font-medium">
          {title ? <ViewDataCell binding={title} item={item} editing={editing} primary /> : <span className="truncate px-3">{item.title}</span>}
        </div>
        {display.map(binding => <div className="flex h-10 min-w-[100px] max-w-[240px] flex-1 items-center" key={binding.id} title={binding.label}>
          <ViewDataCell binding={binding} item={item} editing={editing} />
        </div>)}
      </div>
      {body.map(binding => <div className="flex min-h-8 items-center pb-1 text-[12px] text-[#787774]" key={binding.id}><ViewDataCell binding={binding} item={item} /></div>)}
    </div>;
  }
  return <div role="list" aria-label={response.viewName} data-testid="view-list">
    <ViewDataGroups items={items} groups={response.data.groups} renderItem={renderItem} />
    {!items.length && <p className="px-4 py-8 text-[13px] text-[#9B9A97]">{t("objectList.emptyRecords")}</p>}
  </div>;
}
