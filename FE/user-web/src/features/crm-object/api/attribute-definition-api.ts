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

export type CreateWorkspaceObjectAttributeDefinitionInput = {
  readonly attributeDefinitionName: string;
  readonly attributeType: AttributeDefinitionValueType;
  readonly description?: string;
  readonly icon?: string;
  readonly objectDefinitionId: string;
  readonly workspaceId: string;
};

export type CreateWorkspaceObjectAttributeDefinitionResponse = {
  readonly attributeDefinitionId: string;
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

// 기능 : 현재 Workspace ObjectDefinition에 AttributeDefinition 생성 API를 호출합니다.
export function createWorkspaceObjectAttributeDefinition(
  input: CreateWorkspaceObjectAttributeDefinitionInput,
) {
  // 1. 선택 입력값이 비어 있으면 request body에서 제외한다.
  const body: {
    attributeDefinitionName: string;
    attributeType: AttributeDefinitionValueType;
    icon?: string;
    description?: string;
  } = {
    attributeDefinitionName: input.attributeDefinitionName,
    attributeType: input.attributeType,
  };

  if (input.icon !== undefined && input.icon.length > 0) {
    body.icon = input.icon;
  }

  if (input.description !== undefined && input.description.length > 0) {
    body.description = input.description;
  }

  // 2. 현재 Workspace ObjectDefinition에 새 AttributeDefinition 생성 요청을 전달한다.
  return apiClient<CreateWorkspaceObjectAttributeDefinitionResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions/${encodeURIComponent(input.objectDefinitionId)}/attribute-definitions`,
    {
      method: "POST",
      body,
    },
  );
}
