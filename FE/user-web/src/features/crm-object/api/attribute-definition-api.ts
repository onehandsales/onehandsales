import { apiClient } from "@/lib/api-client";

export type AttributeDefinitionValueType =
  | "ActorReference"
  | "Checkbox"
  | "Currency"
  | "Date"
  | "Domain"
  | "EmailAddress"
  | "Interaction"
  | "Location"
  | "PersonalName"
  | "Number"
  | "PhoneNumber"
  | "Rating"
  | "RecordReference"
  | "Select"
  | "Status"
  | "Text"
  | "Timestamp";

export type WorkspaceObjectAttributeDefinitionListItem = {
  readonly id: string;
  readonly icon: string | null;
  readonly title: string;
  readonly type: AttributeDefinitionValueType;
  readonly isMultiselect: boolean;
};

export type ListWorkspaceObjectAttributeDefinitionsInput = {
  readonly objectDefinitionId: string;
  readonly workspaceId: string;
};

// 기능 : 현재 Workspace ObjectDefinition의 header row AttributeDefinition 목록 API를 호출합니다.
export function listWorkspaceObjectAttributeDefinitions(
  input: ListWorkspaceObjectAttributeDefinitionsInput,
) {
  // 1. 인증된 현재 사용자와 Workspace ObjectDefinition 기준 AttributeDefinition 목록 API를 호출한다.
  return apiClient<WorkspaceObjectAttributeDefinitionListItem[]>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions/${encodeURIComponent(input.objectDefinitionId)}/attribute-definitions`,
  );
}
