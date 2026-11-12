import type { ViewAttribute, ViewFiltersResponse, ViewMenuResponses, ViewSettingsResponse, ViewSortsResponse } from "./view-menu";
export type ViewConfigurationScope = { readonly userId: string; readonly workspaceId: string; readonly viewDefinitionId: string; readonly sourceType: "OBJECT" | "LIST" };
export type ViewConfigurationResponse = ViewMenuResponses & { readonly configurationVersion: string; readonly candidates: readonly ViewAttribute[] };
export type ViewConfigurationChanges = {
  readonly filters?: Pick<ViewFiltersResponse, "viewFilterGroupDefinitions" | "viewFilterConditionDefinitions">;
  readonly sorts?: Pick<ViewSortsResponse, "viewSortDefinitions">;
  readonly settings?: Pick<ViewSettingsResponse, "configJson" | "viewAttributeSettingDefinitions" | "viewGroupDefinitions" | "viewGroupSettingDefinitions">;
};
export type ViewConfigurationCommand = { readonly baseConfigurationVersion: string; readonly changes: ViewConfigurationChanges };
export type ViewConfigurationOptionsResponse = { readonly items: readonly { readonly id: string; readonly label: string | null; readonly color: string | null }[]; readonly pageInfo: { readonly hasNextPage: boolean; readonly nextCursor: string | null } };
