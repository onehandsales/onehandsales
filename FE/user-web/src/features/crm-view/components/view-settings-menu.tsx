import { ArrowLeft, ChevronRight, Columns3, Table2, CalendarDays, GanttChart, ChartNoAxesCombined, LayoutDashboard, LayoutGrid, List, MapPin, TableProperties, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import type { ViewAttributeCandidate, ViewAttributeSetting, ViewDisplayRole, ViewGroup, ViewJson, ViewReference, ViewSettingsResponse } from "../types/view-menu";
import type { WorkspaceViewType } from "../types/workspace-view";
import { ViewReferenceSelect } from "./view-menu-shared";
import { MENU_INPUT, readViewConfig, referenceLabel, updateViewConfig, VIEW_TYPE_LABELS } from "../utils/view-menu";

type RoleField = readonly [ViewDisplayRole, AppI18nKey];
type GroupField = readonly [ViewGroup["groupRole"], AppI18nKey];
type ConfigField = readonly [string, AppI18nKey, "boolean" | "value"];
type SettingsFields = { readonly roles: readonly RoleField[]; readonly groups: readonly GroupField[]; readonly configs: readonly ConfigField[]; readonly display: boolean };
const FIELDS: Record<WorkspaceViewType, SettingsFields> = {
  TABLE: { roles: [], groups: [], configs: [], display: true },
  KANBAN: { roles: [], groups: [["GROUP", "viewMenu.stage"]], configs: [["showEmptyGroups", "viewMenu.showEmptyGroups", "boolean"]], display: true },
  LIST: { roles: [["TITLE", "viewMenu.titleAttribute"]], groups: [["GROUP", "viewMenu.group"]], configs: [], display: true },
  GALLERY: { roles: [["TITLE", "viewMenu.titleAttribute"], ["BODY", "viewMenu.bodyAttribute"], ["IMAGE", "viewMenu.imageAttribute"]], groups: [], configs: [["cardSize", "viewMenu.cardSize", "value"]], display: true },
  CALENDAR: { roles: [["START_DATE", "viewMenu.startDate"], ["END_DATE", "viewMenu.endDate"]], groups: [], configs: [], display: true },
  TIMELINE: { roles: [["START_DATE", "viewMenu.startDate"], ["END_DATE", "viewMenu.endDate"], ["TITLE", "viewMenu.barTitle"]], groups: [["GROUP", "viewMenu.group"]], configs: [], display: true },
  GANTT: { roles: [["START_DATE", "viewMenu.startDate"], ["END_DATE", "viewMenu.endDate"], ["PROGRESS", "viewMenu.progress"]], groups: [], configs: [["showDependencies", "viewMenu.showDependencies", "boolean"]], display: true },
  CHART: { roles: [["MEASURE", "viewMenu.measure"]], groups: [["GROUP", "viewMenu.chartGroup"], ["SERIES", "viewMenu.series"]], configs: [["chartType", "viewMenu.chartType", "value"], ["aggregation", "viewMenu.aggregation", "value"], ["showLegend", "viewMenu.showLegend", "boolean"]], display: false },
  PIVOT: { roles: [["MEASURE", "viewMenu.measure"]], groups: [["PIVOT_ROW", "viewMenu.pivotRow"], ["PIVOT_COLUMN", "viewMenu.pivotColumn"]], configs: [["aggregation", "viewMenu.aggregation", "value"], ["showRowTotals", "viewMenu.showRowTotals", "boolean"], ["showColumnTotals", "viewMenu.showColumnTotals", "boolean"]], display: false },
  MAP: { roles: [["LOCATION", "viewMenu.location"], ["TITLE", "viewMenu.titleAttribute"]], groups: [], configs: [["showLabels", "viewMenu.showLabels", "boolean"], ["fitToData", "viewMenu.fitToData", "boolean"]], display: true },
  DASHBOARD: { roles: [], groups: [], configs: [], display: false },
};
const VALUE_LABELS = new Map<string, AppI18nKey>([
  ["MEDIUM", "viewMenu.medium"], ["SMALL", "viewMenu.small"], ["LARGE", "viewMenu.large"], ["BAR", "viewMenu.bar"],
  ["LINE", "viewMenu.line"], ["PIE", "viewMenu.pie"], ["SUM", "viewMenu.sum"], ["COUNT", "viewMenu.count"],
  ["AVG", "viewMenu.average"], ["COMFORTABLE", "viewMenu.comfortable"], ["COMPACT", "viewMenu.compact"],
]);
const LAYOUT_ICONS: Record<WorkspaceViewType, LucideIcon> = {
  TABLE: Table2, KANBAN: Columns3, LIST: List, GALLERY: LayoutGrid, CALENDAR: CalendarDays,
  TIMELINE: GanttChart, GANTT: GanttChart, CHART: ChartNoAxesCombined, PIVOT: TableProperties, MAP: MapPin, DASHBOARD: LayoutDashboard,
};

// 기능 : 개별 키 변경으로 원래 JSON 구조를 잃지 않는 경우만 편집을 허용합니다.
function canEditConfig(value: ViewJson) {
  return value === null || typeof value === "object" && !Array.isArray(value);
}

// 기능 : 원래 보기 설정의 크기와 체크박스 구조 안에서 타입별 항목을 제공합니다.
export function ViewSettingsMenu({ data, candidates, onChange }: { readonly data: ViewSettingsResponse; readonly candidates: readonly ViewAttributeCandidate[]; readonly onChange: (value: ViewSettingsResponse) => void }) {
  const { t } = useAppI18n();
  const [detail, setDetail] = useState<"stages" | "format" | "widgets" | "layout" | "sources" | null>(null);
  const fields = FIELDS[data.viewType];
  const settings = data.viewAttributeSettingDefinitions;
  const attributeLabels = [...candidates, ...data.attributeDefinitions];
  const LayoutIcon = LAYOUT_ICONS[data.viewType];

  // 기능 : 설정 행의 ID를 기준으로 변경하여 같은 속성의 다른 역할을 보존합니다.
  function changeSetting(id: string, change: Partial<ViewAttributeSetting>) {
    onChange({ ...data, viewAttributeSettingDefinitions: settings.map(item => item.id === id ? { ...item, ...change } : item) });
  }
  // 기능 : 명시적으로 선택한 역할의 직접 속성을 화면 임시 설정에 추가합니다.
  function addSetting(role: ViewDisplayRole, reference: ViewReference) {
    onChange({ ...data, viewAttributeSettingDefinitions: [...settings, { ...reference, id: crypto.randomUUID(), attributeDisplayRole: role,
      sortOrder: Math.max(-1, ...settings.map(item => item.sortOrder)) + 1, labelOverride: null, width: null, isHidden: false, formatJson: null }] });
  }
  // 기능 : 값이 없는 설정을 기본값으로 채우지 않고 저장된 값만 표시합니다.
  function valueText(value: ViewJson | undefined) {
    if (value === undefined || value === null) return t("viewMenu.unset");
    if (typeof value === "boolean") return t(value ? "viewMenu.on" : "viewMenu.off");
    if (typeof value === "object") return t("viewMenu.savedValue");
    const key = typeof value === "string" ? VALUE_LABELS.get(value) : undefined;
    return key ? t(key) : String(value);
  }
  // 기능 : 현재 역할의 모든 저장 행과 미설정 입력을 표시합니다.
  function renderRole([role, labelKey]: RoleField) {
    const rows = settings.filter(item => item.attributeDisplayRole === role);
    return <div key={role}>{(rows.length ? rows : [null]).map((row, index) => <div className="px-2 py-1" key={row?.id ?? role}>
      <label className="flex min-h-8 items-center gap-2"><span className="w-[86px] shrink-0">{t(labelKey)}{rows.length > 1 ? ` ${index + 1}` : ""}</span>
        {role === "IMAGE" ? <span className="min-w-0 flex-1 truncate text-right text-[#9B9A97]" title={row ? referenceLabel(row, data.attributeDefinitions) : undefined}>{row ? referenceLabel(row, data.attributeDefinitions) : t("viewMenu.unset")}</span>
          : <ViewReferenceSelect value={row} candidates={candidates} attributes={data.attributeDefinitions} label={t(labelKey)} onChange={reference => row ? changeSetting(row.id, reference) : addSetting(role, reference)} />}
      </label>
      {row && <label className="flex h-7 items-center gap-2 text-[#9B9A97]"><input aria-label={`${t(labelKey)} · ${t("viewMenu.showAttribute")}`} className="accent-[#4880EE]" type="checkbox" checked={!row.isHidden} onChange={event => changeSetting(row.id, { isHidden: !event.target.checked })} />{t("viewMenu.showAttribute")}</label>}
    </div>)}</div>;
  }
  // 기능 : 기준 속성을 변경하되 원래 단계 설정과 다른 그룹을 보존합니다.
  function changeGroup(group: ViewGroup | null, role: ViewGroup["groupRole"], reference: ViewReference) {
    // 1. 명시적으로 변경한 그룹만 갱신하고 단계의 표시 여부는 현재 기준으로 판정한다.
    const id = group?.id ?? crypto.randomUUID();
    onChange({ ...data, viewGroupDefinitions: group ? data.viewGroupDefinitions.map(item => item.id === id ? { ...item, ...reference } : item)
      : [...data.viewGroupDefinitions, { ...reference, id, groupRole: role, sortDirection: "ASC", sortOrder: Math.max(-1, ...data.viewGroupDefinitions.map(item => item.sortOrder)) + 1, configJson: null }] });
  }
  // 기능 : 그룹 역할을 유지하면서 기준 속성을 선택합니다.
  function renderGroup([role, labelKey]: GroupField) {
    const groups = data.viewGroupDefinitions.filter(item => item.groupRole === role);
    return <div key={role}>{(groups.length ? groups : [null]).map((group, index) => <label className="flex min-h-9 items-center gap-2 px-2 py-1" key={group?.id ?? role}>
      <span className="w-[86px] shrink-0">{t(labelKey)}{groups.length > 1 ? ` ${index + 1}` : ""}</span>
      <ViewReferenceSelect value={group} candidates={candidates} attributes={data.attributeDefinitions} label={t(labelKey)} onChange={reference => changeGroup(group, role, reference)} />
    </label>)}</div>;
  }
  // 기능 : 확정된 토글은 편집하고 선택 규격이 없는 값은 현재 설정으로 표시합니다.
  function renderConfig([key, label, kind]: ConfigField) {
    const value = readViewConfig(data.configJson, key);
    return kind === "boolean" ? <BooleanSetting key={key} editable={canEditConfig(data.configJson)} label={t(label)} value={value} onChange={next => onChange({ ...data, configJson: updateViewConfig(data.configJson, key, next) })} />
      : <SettingValue key={key} label={t(label)} value={valueText(value)} />;
  }
  // 기능 : 세부 설정을 같은 팝업 안에서 열어 원래 메뉴 폭을 유지합니다.
  function detailButton(next: NonNullable<typeof detail>, label: string) {
    return <button className="flex min-h-8 w-full items-center justify-between gap-2 rounded px-2 py-1 text-left hover:bg-[#F3F2EF]" type="button" onClick={() => setDetail(next)}>{label}<ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9B9A97]" /></button>;
  }

  let body: ReactNode;
  if (detail === "stages") {
    body = <>
      {data.viewGroupSettingDefinitions.filter(stage => data.viewGroupDefinitions.some(group => group.id === stage.viewGroupDefinitionId && group.attributeDefinitionId === stage.attributeDefinitionId)).map(stage => {
        const option = [...data.statusOptions, ...data.selectOptions].find(item => item.id === (stage.statusOptionId ?? stage.selectOptionId));
        const label = stage.labelOverride ?? option?.title ?? valueText(stage.groupKeyJson);
        return <div className="flex min-h-9 items-center gap-2 px-2" key={stage.id}>
          <label className="flex min-w-0 flex-1 items-center gap-2"><input type="checkbox" className="accent-[#4880EE]" checked={!stage.isHidden} onChange={event => onChange({ ...data, viewGroupSettingDefinitions: data.viewGroupSettingDefinitions.map(item => item.id === stage.id ? { ...item, isHidden: !event.target.checked } : item) })} /><span className="truncate" title={label}>{label}</span></label>
          <select className={`${MENU_INPUT} px-1`} aria-label={`${label} ${t("viewMenu.fold")}`} value={stage.isFold ? "folded" : "open"} onChange={event => onChange({ ...data, viewGroupSettingDefinitions: data.viewGroupSettingDefinitions.map(item => item.id === stage.id ? { ...item, isFold: event.target.value === "folded" } : item) })}>
            <option value="open">{t("viewMenu.unfolded")}</option><option value="folded">{t("viewMenu.folded")}</option>
          </select>
        </div>;
      })}
      {!data.viewGroupSettingDefinitions.length && <EmptySettings />}
    </>;
  } else if (detail === "widgets" || detail === "sources" || detail === "layout") {
    body = <>
      {detail === "layout" && <SettingValue label={t("viewMenu.gridColumns")} value={valueText(readViewConfig(data.configJson, "gridColumns"))} />}
      {data.viewWidgetDefinitions.map(widget => {
        const source = data.contentViewDefinitions.find(item => item.id === widget.contentViewDefinitionId);
        const title = widget.titleOverride ?? source?.name ?? t("viewMenu.unnamedWidget");
        return <div key={widget.id} className="mb-2 border-b border-[#EEEDE9] px-2 pb-2">
          <p className="truncate py-2 font-medium" title={title}>{title}</p>
          {detail === "widgets" && <>
            <input aria-label={`${title} ${t("viewMenu.widgetTitle")}`} className={`${MENU_INPUT} w-full`} value={widget.titleOverride ?? ""} placeholder={source?.name} onChange={event => onChange({ ...data, viewWidgetDefinitions: data.viewWidgetDefinitions.map(item => item.id === widget.id ? { ...item, titleOverride: event.target.value || null } : item) })} />
            <BooleanSetting editable={canEditConfig(widget.configJson)} label={t("viewMenu.showTitle")} value={readViewConfig(widget.configJson, "showTitle")} onChange={value => onChange({ ...data, viewWidgetDefinitions: data.viewWidgetDefinitions.map(item => item.id === widget.id ? { ...item, configJson: updateViewConfig(item.configJson, "showTitle", value) } : item) })} />
          </>}
          {detail === "sources" && <SettingValue label={t("viewMenu.sourceView")} value={source ? `${source.name} · ${t(VIEW_TYPE_LABELS[source.type])}` : t("viewMenu.unset")} />}
          {detail === "layout" && ([['x', 'viewMenu.positionX'], ['y', 'viewMenu.positionY'], ['width', 'viewMenu.width'], ['height', 'viewMenu.height']] as const).map(([key, label]) => <SettingValue key={key} label={t(label)} value={valueText(readViewConfig(widget.layoutJson, key))} />)}
        </div>;
      })}
      {!data.viewWidgetDefinitions.length && <EmptySettings />}
    </>;
  } else if (detail === "format") {
    body = <>{settings.map(row => <div key={row.id} className="mb-2 border-b border-[#EEEDE9] px-2 pb-2">
      <p className="truncate py-2 font-medium">{row.labelOverride ?? referenceLabel(row, data.attributeDefinitions)}</p>
      <SettingValue label={t("viewMenu.dateFormat")} value={valueText(readViewConfig(row.formatJson, "dateFormat"))} />
      <SettingValue label={t("viewMenu.numberFormat")} value={valueText(readViewConfig(row.formatJson, "numberFormat"))} />
    </div>)}{!settings.length && <EmptySettings />}</>;
  } else {
    const displayRows = settings.filter(item => item.attributeDisplayRole === "DISPLAY" || data.viewType === "TABLE" && item.attributeDisplayRole === "TITLE");
    const extraCandidates = candidates.filter(candidate => !displayRows.some(row => row.sourceScope === "RECORD" && !row.referenceAttributeIdPathJson.length && row.attributeDefinitionId === candidate.id));
    body = <>
      <div className="flex items-center gap-2 rounded px-2 py-2"><LayoutIcon className="h-3.5 w-3.5 text-[#9B9A97]" /><span className="flex-1">{t("viewHeader.layout")}</span><span className="text-[#9B9A97]">{t(VIEW_TYPE_LABELS[data.viewType])}</span></div>
      <div className="my-1 border-t border-[#EEEDE9]" />
      {fields.roles.map(renderRole)}
      {fields.groups.map(renderGroup)}
      {data.viewType === "KANBAN" && detailButton("stages", t("viewMenu.stages"))}
      {fields.configs.map(renderConfig)}
      {["CALENDAR", "TIMELINE", "CHART", "PIVOT"].includes(data.viewType) && detailButton("format", t("viewMenu.format"))}
      {fields.display && <>
        <p className="flex items-center gap-2 px-2 py-2 text-[#9B9A97]"><Columns3 className="h-3.5 w-3.5" />{t("viewHeader.visibleAttributes")}</p>
        {displayRows.map(row => <label className="flex h-8 cursor-pointer items-center gap-2 rounded px-2 hover:bg-[#F3F2EF]" key={row.id}>
          <input checked={!row.isHidden} className="h-3.5 w-3.5 accent-[#4880EE]" type="checkbox" onChange={event => changeSetting(row.id, { isHidden: !event.target.checked })} />
          <span className="truncate" title={referenceLabel(row, attributeLabels)}>{row.labelOverride ?? referenceLabel(row, attributeLabels)}{row.sourceScope === "LIST_ENTRY" ? ` · ${t("viewMenu.listValue")}` : ""}</span>
        </label>)}
        {extraCandidates.map(candidate => <label className="flex h-8 cursor-pointer items-center gap-2 rounded px-2 hover:bg-[#F3F2EF]" key={candidate.id}>
          <input checked={false} className="h-3.5 w-3.5 accent-[#4880EE]" type="checkbox" onChange={() => addSetting("DISPLAY", { sourceScope: "RECORD", attributeDefinitionId: candidate.id, referenceAttributeIdPathJson: [] })} /><span className="truncate">{candidate.title}</span>
        </label>)}
        {!displayRows.length && !extraCandidates.length && <p className="px-2 py-2 text-[#9B9A97]">{t("viewHeader.noAttributes")}</p>}
      </>}
      {data.viewType === "DASHBOARD" && <>
        <p className="px-2 py-2 text-[#9B9A97]">{t("viewMenu.widgets")}</p>
        {data.viewWidgetDefinitions.map(widget => <label key={widget.id} className="flex h-8 items-center gap-2 rounded px-2 hover:bg-[#F3F2EF]">
          <input type="checkbox" className="h-3.5 w-3.5 accent-[#4880EE]" checked={!widget.isHidden} onChange={event => onChange({ ...data, viewWidgetDefinitions: data.viewWidgetDefinitions.map(item => item.id === widget.id ? { ...item, isHidden: !event.target.checked } : item) })} />
          <span className="truncate">{widget.titleOverride ?? data.contentViewDefinitions.find(item => item.id === widget.contentViewDefinitionId)?.name ?? t("viewMenu.unnamedWidget")}</span>
        </label>)}
        {!data.viewWidgetDefinitions.length && <EmptySettings />}
        <div className="my-1 border-t border-[#EEEDE9]" />
        {detailButton("widgets", t("viewMenu.widgetOptions"))}{detailButton("layout", t("viewMenu.widgetLayout"))}{detailButton("sources", t("viewMenu.widgetSources"))}
      </>}
    </>;
  }
  return <>{detail && <button className="mb-2 flex h-8 w-full items-center gap-2 rounded px-2 text-left hover:bg-[#F3F2EF]" onClick={() => setDetail(null)} type="button"><ArrowLeft className="h-3.5 w-3.5" />{t("viewMenu.back")}</button>}{body}</>;
}

// 기능 : 미설정과 꺼짐을 구분하면서 화면의 토글을 변경합니다.
function BooleanSetting({ label, value, editable = true, onChange }: { readonly label: string; readonly value: ViewJson | undefined; readonly editable?: boolean; readonly onChange: (value: boolean) => void }) {
  const { t } = useAppI18n();
  if (!editable || value !== undefined && value !== null && typeof value !== "boolean") return <SettingValue label={label} value={typeof value === "string" || typeof value === "number" ? String(value) : t("viewMenu.savedValue")} />;
  if (typeof value !== "boolean") return <label className="flex min-h-8 items-center gap-2 px-2 py-1"><span className="flex-1">{label}</span><select aria-label={label} className={`${MENU_INPUT} max-w-24 px-1`} value="" onChange={event => onChange(event.target.value === "true")}><option value="">{t("viewMenu.unset")}</option><option value="true">{t("viewMenu.on")}</option><option value="false">{t("viewMenu.off")}</option></select></label>;
  return <label className="flex min-h-8 cursor-pointer items-center gap-2 rounded px-2 hover:bg-[#F3F2EF]"><input type="checkbox" className="h-3.5 w-3.5 accent-[#4880EE]" checked={value} onChange={event => onChange(event.target.checked)} />{label}</label>;
}

// 기능 : 선택 규격이 확정되지 않은 설정은 저장된 표시값으로 제공합니다.
function SettingValue({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="flex min-h-8 items-start justify-between gap-2 px-2 py-2"><span className="shrink-0">{label}</span><span className="min-w-0 break-words text-right text-[#9B9A97]">{value}</span></div>;
}

// 기능 : 설정이 없는 정상 응답을 조회 오류와 구분해 안내합니다.
function EmptySettings() {
  const { t } = useAppI18n();
  return <p className="px-2 py-2 text-[#9B9A97]">{t("viewMenu.emptySettings")}</p>;
}
