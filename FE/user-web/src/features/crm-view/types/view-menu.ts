import type { WorkspaceViewType } from "./workspace-view";

export type ViewJson = null | string | number | boolean | readonly ViewJson[] | { readonly [key: string]: ViewJson };
export type ViewMenu = "filters" | "sorts" | "settings";
export type ViewSource = "RECORD" | "LIST_ENTRY";
export type ViewAttributeCandidate = { readonly id: string; readonly title: string; readonly type?: string };
export type ViewAttribute = ViewAttributeCandidate & {
  readonly type: string; readonly objectDefinitionId: string | null; readonly listDefinitionId: string | null;
  readonly icon: string | null; readonly isMultiselect: boolean; readonly configJson: ViewJson;
};
export type ViewOption = { readonly id: string; readonly attributeDefinitionId: string; readonly title: string; readonly color: string | null; readonly sortOrder: number };
export type ViewReference = {
  readonly sourceScope: ViewSource; readonly attributeDefinitionId: string; readonly referenceAttributeIdPathJson: readonly string[];
};
export type ViewFilterGroup = {
  readonly id: string; readonly parentViewFilterGroupDefinitionId: string | null;
  readonly conditionGroupOperator: "AND" | "OR"; readonly sortOrder: number;
};
export type ViewFilterCondition = ViewReference & {
  readonly id: string; readonly viewFilterGroupDefinitionId: string; readonly comparisonOperator: string;
  readonly comparisonValueJson: ViewJson; readonly multiValueMatchMode: "ANY" | "ALL"; readonly sortOrder: number;
};
export type ViewSort = ViewReference & {
  readonly id: string; readonly sortDirection: "ASC" | "DESC"; readonly sortOrder: number; readonly configJson: ViewJson;
};
export type ViewDisplayRole = "DISPLAY" | "TITLE" | "BODY" | "IMAGE" | "START_DATE" | "END_DATE" | "LOCATION" | "PROGRESS" | "MEASURE";
export type ViewAttributeSetting = ViewReference & {
  readonly id: string; readonly attributeDisplayRole: ViewDisplayRole; readonly sortOrder: number;
  readonly labelOverride: string | null; readonly width: number | null; readonly isHidden: boolean; readonly formatJson: ViewJson;
};
export type ViewGroup = ViewReference & {
  readonly id: string; readonly groupRole: "GROUP" | "SERIES" | "PIVOT_ROW" | "PIVOT_COLUMN";
  readonly sortDirection: "ASC" | "DESC"; readonly sortOrder: number; readonly configJson: ViewJson;
};
export type ViewGroupSetting = {
  readonly id: string; readonly viewGroupDefinitionId: string; readonly attributeDefinitionId: string;
  readonly statusOptionId: string | null; readonly selectOptionId: string | null; readonly groupKeyJson: ViewJson;
  readonly sortOrder: number; readonly labelOverride: string | null; readonly isHidden: boolean; readonly isFold: boolean; readonly configJson: ViewJson;
};
export type ViewWidget = {
  readonly id: string; readonly contentViewDefinitionId: string; readonly titleOverride: string | null;
  readonly sortOrder: number; readonly isHidden: boolean; readonly layoutJson: ViewJson; readonly configJson: ViewJson;
};
type ViewMenuBase = {
  readonly viewDefinitionId: string; readonly viewType: WorkspaceViewType; readonly attributeDefinitions: readonly ViewAttribute[];
};
export type ViewFiltersResponse = ViewMenuBase & {
  readonly viewFilterGroupDefinitions: readonly ViewFilterGroup[]; readonly viewFilterConditionDefinitions: readonly ViewFilterCondition[];
  readonly selectOptions: readonly ViewOption[]; readonly statusOptions: readonly ViewOption[];
};
export type ViewSortsResponse = ViewMenuBase & { readonly viewSortDefinitions: readonly ViewSort[] };
export type ViewSettingsResponse = ViewMenuBase & {
  readonly viewName: string; readonly objectDefinitionId: string | null; readonly listDefinitionId: string | null; readonly configJson: ViewJson;
  readonly viewAttributeSettingDefinitions: readonly ViewAttributeSetting[];
  readonly viewGroupDefinitions: readonly ViewGroup[]; readonly viewGroupSettingDefinitions: readonly ViewGroupSetting[];
  readonly viewWidgetDefinitions: readonly ViewWidget[];
  readonly contentViewDefinitions: readonly { readonly id: string; readonly name: string; readonly type: WorkspaceViewType; readonly icon: string | null }[];
  readonly selectOptions: readonly ViewOption[]; readonly statusOptions: readonly ViewOption[];
};
export type ViewMenuResponses = { readonly filters: ViewFiltersResponse; readonly sorts: ViewSortsResponse; readonly settings: ViewSettingsResponse };
