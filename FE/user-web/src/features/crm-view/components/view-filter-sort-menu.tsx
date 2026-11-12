import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import type { ViewAttributeCandidate, ViewFilterCondition, ViewFilterGroup, ViewFiltersResponse, ViewJson, ViewOption, ViewSortsResponse } from "../types/view-menu";
import { ViewReferenceSelect } from "./view-menu-shared";
import { MENU_INPUT, readViewConfig } from "../utils/view-menu";
import type { ViewConfigurationScope } from "../types/view-configuration";
import { ViewFilterReferenceValue } from "./view-filter-reference-value";

const OPERATOR_LABELS = new Map<string, AppI18nKey>([
  ["eq", "viewMenu.equal"], ["neq", "viewMenu.notEqual"], ["contains", "viewMenu.contains"],
  ["gte", "viewMenu.gte"], ["gt", "viewMenu.gt"], ["lte", "viewMenu.lte"], ["lt", "viewMenu.lt"],
  ["starts_with", "viewConfiguration.startsWith"], ["ends_with", "viewConfiguration.endsWith"], ["in", "viewConfiguration.in"], ["not_in", "viewConfiguration.notIn"],
  ["is_empty", "viewConfiguration.empty"], ["is_not_empty", "viewConfiguration.notEmpty"],
]);

// 기능 : 서버 실행기가 지원하는 타입별 비교 방법만 선택하게 합니다.
function viewFilterOperators(type?: string) {
  if (["Location", "Interaction"].includes(type ?? "")) return ["is_empty", "is_not_empty"];
  return ["eq", "neq", "in", "not_in", ...(["Text", "Domain", "EmailAddress", "PhoneNumber", "PersonalName"].includes(type ?? "") ? ["contains", "starts_with", "ends_with"] : []),
    ...(["Number", "Currency", "Rating", "Date", "Timestamp"].includes(type ?? "") ? ["gt", "gte", "lt", "lte"] : []), "is_empty", "is_not_empty"];
}
// 기능 : 저장된 단일/다중 비교값 wrapper를 입력으로 복원합니다.
function comparisonInput(value: ViewJson): ViewJson {
  if (value && typeof value === "object" && !Array.isArray(value)) { const input = value as Record<string, ViewJson>; return input.value ?? input.values ?? null; }
  return value;
}

// 기능 : 저장값의 JSON 타입을 유지하며 단순 조건값과 선택 옵션을 편집합니다.
function FilterValue({ value, options, attributeType, onChange, multiple = false }: { readonly value: ViewJson; readonly options: readonly ViewOption[]; readonly attributeType?: string; readonly onChange: (value: ViewJson) => void; readonly multiple?: boolean }) {
  const { t } = useAppI18n();
  if (multiple && attributeType === "Checkbox") return <div>{[true, false].map(option => <label className="flex min-h-8 items-center gap-2" key={String(option)}>
    <input type="checkbox" checked={Array.isArray(value) && value.includes(option)} onChange={event => { const selected = Array.isArray(value) ? value : []; onChange(event.target.checked ? [...selected, option] : selected.filter(item => item !== option)); }} />{t(option ? "viewMenu.yes" : "viewMenu.no")}
  </label>)}</div>;
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
  if (multiple) return <input aria-label={t("viewHeader.filterValue")} className={`${MENU_INPUT} w-full`} placeholder="A, B" value={Array.isArray(value) ? value.join(", ") : ""} onChange={event => onChange(event.target.value.split(",").map(item => item.trim()).filter(Boolean))} />;
  if (value !== null && typeof value === "object") return <p className="break-words py-1 text-[#787774]">{t("viewMenu.complexValue")}</p>;
  const numeric = typeof value === "number" || ["Number", "Currency", "Rating"].includes(attributeType ?? "");
  return <input aria-label={t("viewHeader.filterValue")} className={`${MENU_INPUT} w-full`} type={attributeType === "Date" ? "date" : "text"} inputMode={numeric ? "decimal" : undefined} placeholder={attributeType === "Timestamp" ? "2026-11-12T00:00:00Z" : t("viewHeader.filterValue")} value={value === null ? "" : String(value)}
    onChange={event => onChange(event.target.value === "" ? null : event.target.value)} />;
}

// 기능 : 기존 입력 카드에 저장된 AND/OR 그룹과 조건을 복원합니다.
export function ViewFilterMenu({ data, candidates, onChange, optionsScope }: { readonly data: ViewFiltersResponse; readonly candidates: readonly ViewAttributeCandidate[]; readonly onChange: (value: ViewFiltersResponse) => void; readonly optionsScope?: ViewConfigurationScope | null }) {
  const { t } = useAppI18n();
  const groups = data.viewFilterGroupDefinitions;
  const conditions = data.viewFilterConditionDefinitions;

  // 기능 : 조건의 나머지 메타데이터를 유지하면서 선택한 입력만 변경합니다.
  function changeCondition(id: string, change: Partial<ViewFilterCondition>) {
    onChange({ ...data, viewFilterConditionDefinitions: conditions.map(item => item.id === id ? { ...item, ...change } : item) });
  }
  // 기능 : 명시적으로 누른 그룹에 화면용 새 조건을 추가합니다.
  function addCondition(groupId: string | null) {
    // 1. 서버가 확인한 원본 속성에서 새 조건을 만든다.
    const candidate = candidates[0];
    if (!candidate) return;
    const id = groupId ?? crypto.randomUUID();
    const nextGroups: readonly ViewFilterGroup[] = groupId ? groups : [...groups, { id, parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND", sortOrder: groups.length }];
    // 2. 유효한 비어 있지 않음 조건으로 시작하고 사용자가 비교 방법을 고르게 한다.
    onChange({ ...data, viewFilterGroupDefinitions: nextGroups, viewFilterConditionDefinitions: [...conditions, {
      id: crypto.randomUUID(), viewFilterGroupDefinitionId: id, sourceScope: candidate.listDefinitionId ? "LIST_ENTRY" : "RECORD", attributeDefinitionId: candidate.id,
      referenceAttributeIdPathJson: [], comparisonOperator: "is_not_empty", comparisonValueJson: null, multiValueMatchMode: "ANY", sortOrder: conditions.filter(item => item.viewFilterGroupDefinitionId === id).length,
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
        const multiple = ["in", "not_in"].includes(condition.comparisonOperator);
        const attribute = data.attributeDefinitions.find(item => item.id === condition.attributeDefinitionId);
        const options = [...data.selectOptions, ...data.statusOptions].filter(item => item.attributeDefinitionId === condition.attributeDefinitionId);
        return <div className="mb-2 space-y-1 rounded bg-[#F8F7F5] p-2" key={condition.id}>
          <div className="flex items-center gap-1">
            <ViewReferenceSelect attributes={data.attributeDefinitions} candidates={candidates} value={condition} label={t("viewHeader.attribute")} onChange={reference => changeCondition(condition.id, { ...reference, comparisonOperator: "is_not_empty", comparisonValueJson: null })} />
            <button aria-label={t("viewHeader.removeFilter")} className="shrink-0 rounded p-1 text-[#9B9A97] hover:bg-[#EAE9E5]" type="button" onClick={() => onChange({ ...data, viewFilterConditionDefinitions: conditions.filter(item => item.id !== condition.id) })}><X className="h-3.5 w-3.5" /></button>
          </div>
          <select aria-label={t("viewConfiguration.operator")} className={`${MENU_INPUT} w-full`} value={condition.comparisonOperator} onChange={event => changeCondition(condition.id, { comparisonOperator: event.target.value, comparisonValueJson: ["in", "not_in"].includes(event.target.value) ? { values: [] } : null })}>
            {viewFilterOperators(attribute?.type).map(operator => <option value={operator} key={operator}>{t(OPERATOR_LABELS.get(operator)!)}</option>)}
          </select>
          {!["is_empty", "is_not_empty"].includes(condition.comparisonOperator) && (optionsScope && ["ActorReference", "RecordReference"].includes(attribute?.type ?? "")
            ? <ViewFilterReferenceValue scope={optionsScope} condition={condition} multiple={multiple} value={comparisonInput(condition.comparisonValueJson)} onChange={value => changeCondition(condition.id, { comparisonValueJson: multiple ? { values: value } : { value } })} />
            : <FilterValue value={comparisonInput(condition.comparisonValueJson)} multiple={multiple} options={options} attributeType={attribute?.type ?? candidates.find(item => item.id === condition.attributeDefinitionId)?.type} onChange={value => changeCondition(condition.id, { comparisonValueJson: multiple ? { values: Array.isArray(value) ? value : [value] } : { value } })} />)}
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
  const eligible = candidates.filter(row => !["Location", "Interaction"].includes(row.type ?? ""));
  // 기능 : 정렬의 실행 우선순위를 이동하고 안정적인 순서를 저장합니다.
  function move(id: string, offset: number) {
    const rows = [...data.viewSortDefinitions].sort((a, b) => a.sortOrder - b.sortOrder), index = rows.findIndex(row => row.id === id), target = index + offset;
    if (target < 0 || target >= rows.length) return;
    const [row] = rows.splice(index, 1); if (row) rows.splice(target, 0, row);
    onChange({ ...data, viewSortDefinitions: rows.map((item, sortOrder) => ({ ...item, sortOrder })) });
  }
  // 기능 : 사용자가 요청한 새 정렬을 마지막 우선순위로 추가합니다.
  function addSort() {
    const candidate = eligible[0];
    if (!candidate) return;
    onChange({ ...data, viewSortDefinitions: [...data.viewSortDefinitions, { id: crypto.randomUUID(), sourceScope: candidate.listDefinitionId ? "LIST_ENTRY" : "RECORD", attributeDefinitionId: candidate.id, referenceAttributeIdPathJson: [], sortDirection: "ASC", sortOrder: Math.max(-1, ...data.viewSortDefinitions.map(item => item.sortOrder)) + 1, configJson: candidate.isMultiselect ? { reducer: "MIN" } : null }] });
  }
  return <>
    {[...data.viewSortDefinitions].sort((a, b) => a.sortOrder - b.sortOrder).map(sort => <div className="mb-2 flex flex-wrap items-center gap-1 px-1" key={sort.id}>
      <ViewReferenceSelect attributes={data.attributeDefinitions} candidates={eligible} label={t("viewHeader.attribute")} value={sort} onChange={reference => onChange({ ...data, viewSortDefinitions: data.viewSortDefinitions.map(item => item.id === sort.id ? { ...item, ...reference, configJson: candidates.find(row => row.id === reference.attributeDefinitionId)?.isMultiselect ? { reducer: "MIN" } : null } : item) })} />
      <select aria-label={t("viewHeader.sortDirection")} className={`${MENU_INPUT} px-1`} value={sort.sortDirection} onChange={event => onChange({ ...data, viewSortDefinitions: data.viewSortDefinitions.map(item => item.id === sort.id ? { ...item, sortDirection: event.target.value === "DESC" ? "DESC" : "ASC" } : item) })}>
        <option value="ASC">{t("viewHeader.ascending")}</option><option value="DESC">{t("viewHeader.descending")}</option>
      </select>
      <button aria-label={t("viewHeader.removeSort")} className="rounded p-1 text-[#9B9A97]" type="button" onClick={() => onChange({ ...data, viewSortDefinitions: data.viewSortDefinitions.filter(item => item.id !== sort.id) })}><X className="h-3.5 w-3.5" /></button>
      <button type="button" aria-label={t("viewConfiguration.moveUp")} onClick={() => move(sort.id, -1)}><ArrowUp className="h-3 w-3" /></button>
      <button type="button" aria-label={t("viewConfiguration.moveDown")} onClick={() => move(sort.id, 1)}><ArrowDown className="h-3 w-3" /></button>
      {data.attributeDefinitions.find(row => row.id === sort.attributeDefinitionId)?.isMultiselect && <select aria-label={t("viewConfiguration.reducer")} className={`${MENU_INPUT} w-full`} value={String(readViewConfig(sort.configJson, "reducer") ?? "MIN")} onChange={event => onChange({ ...data, viewSortDefinitions: data.viewSortDefinitions.map(row => row.id === sort.id ? { ...row, configJson: { nulls: String(readViewConfig(row.configJson, "nulls") ?? "LAST"), reducer: event.target.value } } : row) })}>
        <option value="MIN">{t("viewConfiguration.minimum")}</option><option value="MAX">{t("viewConfiguration.maximum")}</option></select>}
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
