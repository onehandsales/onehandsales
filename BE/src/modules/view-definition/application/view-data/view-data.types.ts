import type { ViewSourceScope } from "../view-header-configuration";
import type { AttributeDefinitionType } from "@/modules/attribute-definition/application/attribute-definition-type";
import type { JsonValue } from "@/shared/application/types/json-value";

export type SupportedViewDataType = "TABLE" | "KANBAN" | "LIST";
export type ViewDataPart = "MAIN" | "GROUP_ITEMS";
// 역할 : 저장 설정 본문 조회에 허용하는 입력만 정의합니다.
export interface ViewDataRequest {
  sourceType?: "OBJECT" | "LIST";
  part?: ViewDataPart;
  q?: string;
  limit?: number;
  cursor?: string;
  groupToken?: string;
}
export type ViewDataSource = {
  kind: "OBJECT" | "LIST" | "NONE";
  objectDefinitionId: string | null;
  listDefinitionId: string | null;
  itemKind: "RECORD" | "LIST_ENTRY" | null;
};
export type ViewDataIssue = { code: string; field: string | null; bindingId: string | null };
export type ViewDataBinding = {
  id: string; attributeDefinitionId: string; sourceScope: ViewSourceScope;
  referenceAttributeIdPath: string[]; role: string; label: string;
  attributeType: AttributeDefinitionType; isMultiselect: boolean; isHidden: boolean;
  width: number | null; format: JsonValue; currencyCode: string | null;
};
export type ViewCellValue = {
  valueDefinitionId: string;
  sourceEntity: { kind: ViewSourceScope; id: string };
  value: JsonValue;
};
export type ViewCell = { bindingId: string; state: "VALUE" | "EMPTY" | "INVALID" | "UNAVAILABLE"; values: ViewCellValue[] };
export type ViewDataItem = {
  itemKey: string; occurrenceKey: string; recordDefinitionId: string;
  objectDefinitionId: string; listEntryDefinitionId: string | null;
  title: string; cells: ViewCell[]; groupPath: string[];
};
export type ViewPageInfo = { hasNextPage: boolean; nextCursor: string | null };
export type ViewItemPage = { items: ViewDataItem[]; pageInfo: ViewPageInfo };
export type ViewDataGroup = {
  key: string; parentKey: string | null; label: string; color: string | null;
  count: number; isHidden: boolean; isFold: boolean;
};
export type ViewDimension = {
  key: string; label: string;
  reference: { kind: "STATUS_OPTION" | "SELECT_OPTION" | "RECORD" | "ACTOR"; id: string } | null;
};
export type ViewPresentation = Record<string, string | number | boolean | null>;
export type ViewMainDataByType = {
  TABLE: ViewItemPage & { presentation: ViewPresentation; columnBindingIds: string[]; groups: ViewDataGroup[] };
  LIST: ViewItemPage & { presentation: ViewPresentation; groups: ViewDataGroup[] };
  KANBAN: {
    presentation: ViewPresentation; groupDefinitionId: string;
    columns: (ViewDataGroup & ViewItemPage & { groupToken: string; calculations: never[] })[];
    unassignedCount: number;
  };
};
export type ViewDataBase = {
  viewDefinitionId: string; viewName: string; source: ViewDataSource;
  configurationFingerprint: string; issues: ViewDataIssue[]; bindings: ViewDataBinding[];
  summary: { sourceItemCount: number; matchedItemCount: number; eligibleItemCount: number } | null;
};
export type ViewMainResponse = {
  [T in SupportedViewDataType]: ViewDataBase & { state: "READY"; part: "MAIN"; viewType: T; data: ViewMainDataByType[T] }
}[SupportedViewDataType];
export type ViewPartialResponse = ViewDataBase & {
  state: "READY"; viewType: "KANBAN"; part: "GROUP_ITEMS";
  data: ViewItemPage & { groupKey: string; groupToken: string };
};
export type WorkspaceViewMainContentResponse = ViewMainResponse | ViewPartialResponse | (
  ViewDataBase & { state: "NEEDS_CONFIGURATION"; viewType: SupportedViewDataType; part: ViewDataPart; data: null }
);
