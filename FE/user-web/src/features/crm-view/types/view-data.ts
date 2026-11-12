import type { ViewJson, ViewSource } from "./view-menu";
import type { ViewConfigurationCommand } from "./view-configuration";
import type { WorkspaceViewTargetType, WorkspaceViewType } from "./workspace-view";

export type SupportedViewDataType = "TABLE" | "KANBAN" | "LIST";
export type ViewDataBinding = {
  readonly id: string; readonly attributeDefinitionId: string; readonly sourceScope: ViewSource;
  readonly referenceAttributeIdPath: readonly string[]; readonly role: string; readonly label: string;
  readonly attributeType: string; readonly isMultiselect: boolean; readonly isHidden: boolean;
  readonly width: number | null; readonly format: ViewJson; readonly currencyCode: string | null;
};
export type ViewCellValue = {
  readonly valueDefinitionId: string;
  readonly sourceEntity: { readonly kind: ViewSource; readonly id: string };
  readonly value: ViewJson;
};
export type ViewCell = {
  readonly bindingId: string; readonly state: "VALUE" | "EMPTY" | "INVALID" | "UNAVAILABLE";
  readonly values: readonly ViewCellValue[];
};
export type ViewDataItem = {
  readonly itemKey: string; readonly occurrenceKey: string;
  readonly recordDefinitionId: string; readonly objectDefinitionId: string;
  readonly listEntryDefinitionId: string | null; readonly title: string;
  readonly cells: readonly ViewCell[]; readonly groupPath: readonly string[];
};
export type ViewPageInfo = { readonly hasNextPage: boolean; readonly nextCursor: string | null };
export type ViewItemPage = { readonly items: readonly ViewDataItem[]; readonly pageInfo: ViewPageInfo };
export type ViewDataGroup = {
  readonly key: string; readonly parentKey: string | null; readonly label: string;
  readonly color: string | null; readonly count: number; readonly isHidden: boolean; readonly isFold: boolean;
};
export type ViewKanbanColumn = ViewDataGroup & ViewItemPage & { readonly groupToken: string; readonly calculations: readonly unknown[] };
export type ViewPresentation = Readonly<Record<string, string | number | boolean | null>>;
type ViewDataBase = {
  readonly viewDefinitionId: string; readonly viewName: string;
  readonly source: {
    readonly kind: WorkspaceViewTargetType | "NONE"; readonly objectDefinitionId: string | null;
    readonly listDefinitionId: string | null; readonly itemKind: "RECORD" | "LIST_ENTRY" | null;
  };
  readonly configurationFingerprint: string;
  readonly issues: readonly { readonly code: string; readonly field: string | null; readonly bindingId: string | null }[];
  readonly bindings: readonly ViewDataBinding[];
  readonly summary: { readonly sourceItemCount: number; readonly matchedItemCount: number; readonly eligibleItemCount: number } | null;
};
type NeedsConfiguration<Part extends "MAIN" | "GROUP_ITEMS"> = ViewDataBase & {
  readonly state: "NEEDS_CONFIGURATION"; readonly viewType: SupportedViewDataType; readonly part: Part; readonly data: null;
};
export type ViewTableResponse = ViewDataBase & { readonly state: "READY"; readonly part: "MAIN"; readonly viewType: "TABLE";
  readonly data: ViewItemPage & { readonly presentation: ViewPresentation; readonly columnBindingIds: readonly string[]; readonly groups: readonly ViewDataGroup[] } };
export type ViewListResponse = ViewDataBase & { readonly state: "READY"; readonly part: "MAIN"; readonly viewType: "LIST";
  readonly data: ViewItemPage & { readonly presentation: ViewPresentation; readonly groups: readonly ViewDataGroup[] } };
export type ViewKanbanResponse = ViewDataBase & { readonly state: "READY"; readonly part: "MAIN"; readonly viewType: "KANBAN";
  readonly data: { readonly presentation: ViewPresentation; readonly groupDefinitionId: string; readonly columns: readonly ViewKanbanColumn[]; readonly unassignedCount: number } };
export type ViewReadyResponse = ViewTableResponse | ViewListResponse | ViewKanbanResponse;
export type ViewMainResponse = ViewReadyResponse | NeedsConfiguration<"MAIN">;
export type ViewGroupResponse = (ViewDataBase & { readonly state: "READY"; readonly part: "GROUP_ITEMS"; readonly viewType: "KANBAN";
  readonly data: ViewItemPage & { readonly groupKey: string; readonly groupToken: string } }) | NeedsConfiguration<"GROUP_ITEMS">;
export type ViewDataResponse = ViewMainResponse | ViewGroupResponse;
export type ViewDataScope = {
  readonly userId: string; readonly workspaceId: string; readonly sourceType: WorkspaceViewTargetType;
  readonly targetId: string; readonly viewDefinitionId: string; readonly viewType: WorkspaceViewType; readonly timeZone: string;
};
export type ViewDataRequest = ViewDataScope & { readonly q: string; readonly limit: number; readonly cursor?: string | null; readonly preview?: ViewConfigurationCommand | undefined };
