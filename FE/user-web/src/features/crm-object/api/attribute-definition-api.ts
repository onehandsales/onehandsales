import { apiClient } from "@/lib/api-client";

// 역할 : AttributeDefinitionValueType이 Object 목록과 cell에서 지원하는 Attribute 타입 범위를 정의합니다.
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

// 역할 : AttributeDefinitionCurrencyDisplayType이 Currency 설정의 표시 방식 범위를 정의합니다.
export type AttributeDefinitionCurrencyDisplayType = "symbol";

// 역할 : AttributeDefinitionCurrencyConfig가 Currency AttributeDefinition 표시 설정을 정의합니다.
export type AttributeDefinitionCurrencyConfig = {
  readonly defaultCurrencyCode: string;
  readonly displayType: AttributeDefinitionCurrencyDisplayType;
};

// 역할 : AttributeDefinitionConfig가 AttributeType별 설정 객체를 정의합니다.
export type AttributeDefinitionConfig = {
  readonly currency: AttributeDefinitionCurrencyConfig;
};

// 역할 : WorkspaceObjectAttributeDefinitionListItem이 Object 목록 header row의 AttributeDefinition 응답 값을 정의합니다.
export type WorkspaceObjectAttributeDefinitionListItem = {
  readonly id: string;
  readonly icon: string | null;
  readonly title: string;
  readonly type: AttributeDefinitionValueType;
  readonly isMultiselect: boolean;
  readonly config: AttributeDefinitionConfig | null;
};

// 역할 : ListWorkspaceObjectAttributeDefinitionsInput이 AttributeDefinition 목록 조회 경계 값을 정의합니다.
export type ListWorkspaceObjectAttributeDefinitionsInput = {
  readonly objectDefinitionId: string;
  readonly workspaceId: string;
};

// 역할 : CreateWorkspaceObjectAttributeDefinitionInput이 AttributeDefinition 생성 요청 값을 정의합니다.
export type CreateWorkspaceObjectAttributeDefinitionInput = {
  readonly attributeDefinitionName: string;
  readonly attributeType: AttributeDefinitionValueType;
  readonly description?: string;
  readonly icon?: string;
  readonly objectDefinitionId: string;
  readonly workspaceId: string;
};

// 역할 : CreateWorkspaceObjectAttributeDefinitionResponse가 AttributeDefinition 생성 응답 값을 정의합니다.
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
