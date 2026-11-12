import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppI18n } from "@/features/app-i18n";
import type { ViewConfigurationScope } from "../types/view-configuration";
import type { ViewFilterCondition, ViewJson } from "../types/view-menu";
import { getViewConfigurationOptions } from "../api/view-configuration-api";
import { viewConfigurationQueryKeys } from "../api/view-configuration-query-keys";
import { MENU_INPUT } from "../utils/view-menu";
// 기능 : 담당자·연결 기록을 서버에서 검색하며 조건값으로 선택합니다.
export function ViewFilterReferenceValue({ scope, condition, value, multiple, onChange }: { readonly scope: ViewConfigurationScope; readonly condition: ViewFilterCondition; readonly value: ViewJson; readonly multiple: boolean; readonly onChange: (value: ViewJson) => void }) {
  const { t } = useAppI18n();
  const [search, setSearch] = useState("");
  const query = useInfiniteQuery({ queryKey: viewConfigurationQueryKeys.options(scope, condition, search),
    queryFn: ({ signal, pageParam }) => getViewConfigurationOptions(scope, condition, search, pageParam, signal), initialPageParam: null as string | null,
    getNextPageParam: page => page.pageInfo.hasNextPage ? page.pageInfo.nextCursor : undefined, retry: false });
  const selected = (Array.isArray(value) ? value : value === null ? [] : [value]).map(String);
  // 기능 : 단일 선택과 다중 선택의 추가·해제를 같은 입력 계약으로 전달합니다.
  function selectOption(id: string, checked: boolean) {
    if (!multiple) { onChange(id); return; }
    onChange(checked ? [...selected, id] : selected.filter(item => item !== id));
  }
  return <div className="space-y-1"><input aria-label={t("viewConfiguration.optionsSearch")} className={`${MENU_INPUT} w-full`} placeholder={t("common.search")} value={search} onChange={event => setSearch(event.target.value)} />
    <div className="max-h-36 overflow-y-auto">{query.data?.pages.flatMap(page => page.items).map(option => <label key={option.id} className="flex min-h-7 items-center gap-2">
      <input type={multiple ? "checkbox" : "radio"} name={`condition-${condition.id}`} checked={selected.includes(option.id)} onChange={event => selectOption(option.id, event.target.checked)} />
      <span>{option.label ?? t("viewMenu.savedValue")}</span></label>)}</div>
    {query.isPending && <p role="status">{t("common.loading")}</p>}
    {query.isError && <p role="alert">{t("viewConfiguration.loadOptions")} <button type="button" onClick={() => { void query.refetch(); }}>{t("common.retry")}</button></p>}
    {query.hasNextPage && <button type="button" disabled={query.isFetchingNextPage} onClick={() => { void query.fetchNextPage(); }}>{t("common.loadMore")}</button>}
  </div>;
}
