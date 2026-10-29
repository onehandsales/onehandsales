import { Plus, X } from "lucide-react";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import type { ViewAttributeCandidate, ViewFilterCondition, ViewFilterGroup, ViewFiltersResponse, ViewJson, ViewOption, ViewSortsResponse } from "../types/view-menu";
import { ViewReferenceSelect } from "./view-menu-shared";
import { MENU_INPUT } from "../utils/view-menu";

const OPERATOR_LABELS = new Map<string, AppI18nKey>([
  ["eq", "viewMenu.equal"], ["neq", "viewMenu.notEqual"], ["contains", "viewMenu.contains"],
  ["gte", "viewMenu.gte"], ["gt", "viewMenu.gt"], ["lte", "viewMenu.lte"], ["lt", "viewMenu.lt"],
]);

// 기능 : 저장값의 JSON 타입을 유지하며 단순 조건값과 선택 옵션을 편집합니다.
function FilterValue({ value, options, attributeType, onChange }: { readonly value: ViewJson; readonly options: readonly ViewOption[]; readonly attributeType?: string; readonly onChange: (value: ViewJson) => void }) {
  const { t } = useAppI18n();
  if (Array.isArray(value) && value.every(item => typeof item === "string") && options.length) {
    const ids = value as readonly string[];
    const all = [...options, ...ids.filter(id => !options.some(option => option.id === id)).map(id => ({ id, title: id }))];
    return <div className="max-h-40 overflow-y-auto">{all.map(option => <label className="flex min-h-8 items-center gap-2" key={option.id}>
      <input type="checkbox" className="accent-[#4880EE]" checked={ids.includes(option.id)} onChange={event => onChange(event.target.checked ? [...ids, option.id] : ids.filter(id => id !== option.id))} />{option.title}
    </label>)}</div>;
  }
  if (options.length && (typeof value === "string" || value === null)) return <select aria-label={t("viewHeader.filterValue")} className={`${MENU_INPUT} w-full`} value={value ?? ""} onChange={event => onChange(event.target.value || null)}>
    <option value="">{t("viewMenu.unset")}</option>
    {value && !options.some(option => option.id === value) && <option value={value}>{value}</option>}
    {options.map(option => <option key={option.id} value={option.id}>{option.title}</option>)}
  </select>;
  if (typeof value === "boolean" || value === null && attributeType === "Checkbox") return <select aria-label={t("viewHeader.filterValue")} className={`${MENU_INPUT} w-full`} value={value === null ? "" : String(value)} onChange={event => onChange(event.target.value === "" ? null : event.target.value === "true")}>
    {value === null && <option value="">{t("viewMenu.unset")}</option>}
    <option value="true">{t("viewMenu.yes")}</option><option value="false">{t("viewMenu.no")}</option>
  </select>;
  if (value !== null && typeof value === "object") return <p className="break-words py-1 text-[#787774]">{t("viewMenu.complexValue")}</p>;
  const numeric = typeof value === "number" || ["Number", "Currency", "Rating"].includes(attributeType ?? "");
  return <input aria-label={t("viewHeader.filterValue")} className={`${MENU_INPUT} w-full`} type={numeric ? "number" : "text"} placeholder={t("viewHeader.filterValue")} value={value === null ? "" : String(value)}
    onChange={event => onChange(event.target.value === "" ? null : numeric ? Number(event.target.value) : event.target.value)} />;
}

// 기능 : 기존 입력 카드에 저장된 AND/OR 그룹과 조건을 복원합니다.
export function ViewFilterMenu({ data, candidates, onChange }: { readonly data: ViewFiltersResponse; readonly candidates: readonly ViewAttributeCandidate[]; readonly onChange: (value: ViewFiltersResponse) => void }) {
  const { t } = useAppI18n();
  const groups = data.viewFilterGroupDefinitions;
  const conditions = data.viewFilterConditionDefinitions;

  // 기능 : 조건의 나머지 메타데이터를 유지하면서 선택한 입력만 변경합니다.
  function changeCondition(id: string, change: Partial<ViewFilterCondition>) {
    onChange({ ...data, viewFilterConditionDefinitions: conditions.map(item => item.id === id ? { ...item, ...change } : item) });
  }
  // 기능 : 명시적으로 누른 그룹에 화면용 새 조건을 추가합니다.
  function addCondition(groupId: string | null) {
    // 1. 전체 후보가 확인된 Object 직접 속성에서만 새 조건을 만든다.
    const candidate = candidates[0];
    if (!candidate) return;
    const id = groupId ?? crypto.randomUUID();
    const nextGroups: readonly ViewFilterGroup[] = groupId ? groups : [...groups, { id, parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND", sortOrder: groups.length }];
    // 2. 연산자 계약이 없는 새 조건에는 임의 연산자 코드를 저장하지 않는다.
    onChange({ ...data, viewFilterGroupDefinitions: nextGroups, viewFilterConditionDefinitions: [...conditions, {
      id: crypto.randomUUID(), viewFilterGroupDefinitionId: id, sourceScope: "RECORD", attributeDefinitionId: candidate.id,
      referenceAttributeIdPathJson: [], comparisonOperator: "", comparisonValueJson: null, multiValueMatchMode: "ANY", sortOrder: conditions.filter(item => item.viewFilterGroupDefinitionId === id).length,
    }] });
  }
  // 기능 : 그룹의 부모 관계를 유지하고 각 그룹 안의 조건을 표시합니다.
  function renderGroup(group: ViewFilterGroup, ancestors: readonly string[] = []) {
    if (ancestors.includes(group.id)) return null;
    return <div className="mb-2 min-w-0 rounded border border-[#EEEDE9] p-1" key={group.id}>
      <select aria-label={t("viewMenu.groupOperator")} className={`${MENU_INPUT} mb-2 w-full border-0 bg-[#F8F7F5]`} value={group.conditionGroupOperator}
        onChange={event => onChange({ ...data, viewFilterGroupDefinitions: groups.map(item => item.id === group.id ? { ...item, conditionGroupOperator: event.target.value === "OR" ? "OR" : "AND" } : item) })}>
        <option value="AND">{t("viewMenu.allConditions")}</option><option value="OR">{t("viewMenu.anyCondition")}</option>
      </select>
      {conditions.filter(item => item.viewFilterGroupDefinitionId === group.id).map(condition => {
        const operatorLabel = OPERATOR_LABELS.get(condition.comparisonOperator);
        const attribute = data.attributeDefinitions.find(item => item.id === condition.attributeDefinitionId);
        const options = [...data.selectOptions, ...data.statusOptions].filter(item => item.attributeDefinitionId === condition.attributeDefinitionId);
        return <div className="mb-2 space-y-1 rounded bg-[#F8F7F5] p-2" key={condition.id}>
          <div className="flex items-center gap-1">
            <ViewReferenceSelect attributes={data.attributeDefinitions} candidates={candidates} value={condition} label={t("viewHeader.attribute")} onChange={reference => changeCondition(condition.id, reference)} />
            <button aria-label={t("viewHeader.removeFilter")} className="shrink-0 rounded p-1 text-[#9B9A97] hover:bg-[#EAE9E5]" type="button" onClick={() => onChange({ ...data, viewFilterConditionDefinitions: conditions.filter(item => item.id !== condition.id) })}><X className="h-3.5 w-3.5" /></button>
          </div>
          <p className="px-1 py-1 text-[#787774]">{operatorLabel ? t(operatorLabel) : condition.comparisonOperator || t("viewMenu.operatorUnset")}</p>
          <FilterValue value={condition.comparisonValueJson} options={options} attributeType={attribute?.type ?? candidates.find(item => item.id === condition.attributeDefinitionId)?.type} onChange={value => changeCondition(condition.id, { comparisonValueJson: value })} />
          {(attribute?.isMultiselect || condition.multiValueMatchMode === "ALL") && <select aria-label={t("viewMenu.multiMatch")} className={`${MENU_INPUT} w-full`} value={condition.multiValueMatchMode} onChange={event => changeCondition(condition.id, { multiValueMatchMode: event.target.value === "ALL" ? "ALL" : "ANY" })}>
            <option value="ANY">{t("viewMenu.anyValue")}</option><option value="ALL">{t("viewMenu.allValues")}</option>
          </select>}
        </div>;
      })}
      {groups.filter(item => item.parentViewFilterGroupDefinitionId === group.id).map(child => renderGroup(child, [...ancestors, group.id]))}
      <AddRule label={t("viewHeader.addFilter")} disabled={!candidates.length} onClick={() => addCondition(group.id)} />
    </div>;
  }
  return <>
    {groups.filter(group => group.parentViewFilterGroupDefinitionId === null).map(group => renderGroup(group))}
    {!groups.length && <><p className="px-2 pb-3 text-[#9B9A97]">{t("viewHeader.noFilters")}</p><AddRule label={t("viewHeader.addFilter")} disabled={!candidates.length} onClick={() => addCondition(null)} /></>}
    {!candidates.length && <p className="px-2 py-1 text-[11px] text-[#9B9A97]">{t("viewMenu.candidatesUnavailable")}</p>}
  </>;
}

// 기능 : 저장된 정렬 우선순위를 기존 방향 선택 입력에 연결합니다.
export function ViewSortMenu({ data, candidates, onChange }: { readonly data: ViewSortsResponse; readonly candidates: readonly ViewAttributeCandidate[]; readonly onChange: (value: ViewSortsResponse) => void }) {
  const { t } = useAppI18n();
  // 기능 : 사용자가 요청한 새 정렬을 마지막 우선순위로 추가합니다.
  function addSort() {
    const candidate = candidates[0];
    if (!candidate) return;
    onChange({ ...data, viewSortDefinitions: [...data.viewSortDefinitions, { id: crypto.randomUUID(), sourceScope: "RECORD", attributeDefinitionId: candidate.id, referenceAttributeIdPathJson: [], sortDirection: "ASC", sortOrder: Math.max(-1, ...data.viewSortDefinitions.map(item => item.sortOrder)) + 1, configJson: null }] });
  }
  return <>
    {data.viewSortDefinitions.map(sort => <div className="mb-2 flex items-center gap-1 px-1" key={sort.id}>
      <ViewReferenceSelect attributes={data.attributeDefinitions} candidates={candidates} label={t("viewHeader.attribute")} value={sort} onChange={reference => onChange({ ...data, viewSortDefinitions: data.viewSortDefinitions.map(item => item.id === sort.id ? { ...item, ...reference } : item) })} />
      <select aria-label={t("viewHeader.sortDirection")} className={`${MENU_INPUT} px-1`} value={sort.sortDirection} onChange={event => onChange({ ...data, viewSortDefinitions: data.viewSortDefinitions.map(item => item.id === sort.id ? { ...item, sortDirection: event.target.value === "DESC" ? "DESC" : "ASC" } : item) })}>
        <option value="ASC">{t("viewHeader.ascending")}</option><option value="DESC">{t("viewHeader.descending")}</option>
      </select>
      <button aria-label={t("viewHeader.removeSort")} className="rounded p-1 text-[#9B9A97]" type="button" onClick={() => onChange({ ...data, viewSortDefinitions: data.viewSortDefinitions.filter(item => item.id !== sort.id) })}><X className="h-3.5 w-3.5" /></button>
    </div>)}
    {!data.viewSortDefinitions.length && <p className="px-2 pb-3 text-[#9B9A97]">{t("viewHeader.noSorts")}</p>}
    <AddRule label={t("viewHeader.addSort")} disabled={!candidates.length} onClick={addSort} />
    {!candidates.length && <p className="px-2 py-1 text-[11px] text-[#9B9A97]">{t("viewMenu.candidatesUnavailable")}</p>}
  </>;
}

// 기능 : 기존 필터·정렬의 추가 버튼 모양을 공유합니다.
function AddRule({ label, disabled, onClick }: { readonly label: string; readonly disabled: boolean; readonly onClick: () => void }) {
  return <button className="flex h-8 w-full items-center gap-2 rounded px-2 hover:bg-[#F3F2EF] disabled:opacity-40" disabled={disabled} type="button" onClick={onClick}><Plus className="h-3.5 w-3.5" />{label}</button>;
}
