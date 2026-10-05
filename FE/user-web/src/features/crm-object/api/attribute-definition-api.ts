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

// 역할 : WorkspaceObjectAttributeDefinitionDetail이 Object 목록 header popover의 AttributeDefinition 상세 응답 값을 정의합니다.
export type WorkspaceObjectAttributeDefinitionDetail =
  WorkspaceObjectAttributeDefinitionListItem & {
    readonly description: string | null;
    readonly sortOrder: number;
  };

// 역할 : ListWorkspaceObjectAttributeDefinitionsInput이 AttributeDefinition 목록 조회 경계 값을 정의합니다.
export type ListWorkspaceObjectAttributeDefinitionsInput = {
  readonly objectDefinitionId: string;
  readonly workspaceId: string;
};

// 역할 : GetWorkspaceObjectAttributeDefinitionInput이 AttributeDefinition 단건 조회 경계 값을 정의합니다.
export type GetWorkspaceObjectAttributeDefinitionInput = {
  readonly attributeDefinitionId: string;
  readonly objectDefinitionId: string;
  readonly workspaceId: string;
};

// 역할 : AttributeDefinition 위치 기준 방향 값을 정의합니다.
export type AttributeDefinitionPlacementSide = "before" | "after";

// 역할 : AttributeDefinition 위치 변경 요청의 기준 위치 값을 정의합니다.
export type AttributeDefinitionTargetPlacementPosition = {
  readonly referenceAttributeDefinitionId: string;
  readonly side: AttributeDefinitionPlacementSide;
};

// 역할 : CreateWorkspaceObjectAttributeDefinitionInsertPosition이 AttributeDefinition 생성 위치 요청 값을 정의합니다.
export type CreateWorkspaceObjectAttributeDefinitionInsertPosition =
  AttributeDefinitionTargetPlacementPosition;

// 역할 : CreateWorkspaceObjectAttributeDefinitionInput이 AttributeDefinition 생성 요청 값을 정의합니다.
export type CreateWorkspaceObjectAttributeDefinitionInput = {
  readonly attributeDefinitionName: string;
  readonly attributeType: AttributeDefinitionValueType;
  readonly description?: string;
  readonly icon?: string;
  readonly insertPosition?: CreateWorkspaceObjectAttributeDefinitionInsertPosition;
  readonly objectDefinitionId: string;
  readonly workspaceId: string;
};

// 역할 : CreateWorkspaceObjectAttributeDefinitionResponse가 AttributeDefinition 생성 응답 값을 정의합니다.
export type CreateWorkspaceObjectAttributeDefinitionResponse = {
  readonly attributeDefinitionId: string;
};

// 역할 : UpdateWorkspaceObjectAttributeDefinitionInput이 AttributeDefinition 수정 요청 값을 정의합니다.
export type UpdateWorkspaceObjectAttributeDefinitionInput = {
  readonly attributeDefinitionId: string;
  readonly description?: string | null;
  readonly icon?: string | null;
  readonly isMultiselect?: boolean;
  readonly objectDefinitionId: string;
  readonly title?: string;
  readonly workspaceId: string;
};

// 역할 : UpdateWorkspaceObjectAttributeDefinitionResponse가 AttributeDefinition 수정 응답 값을 정의합니다.
export type UpdateWorkspaceObjectAttributeDefinitionResponse = {
  readonly attributeDefinitionId: string;
};

// 역할 : MoveWorkspaceObjectAttributeDefinitionPositionInput이 AttributeDefinition 위치 변경 요청 값을 정의합니다.
export type MoveWorkspaceObjectAttributeDefinitionPositionInput = {
  readonly attributeDefinitionId: string;
  readonly objectDefinitionId: string;
  readonly targetPlacementPosition: AttributeDefinitionTargetPlacementPosition;
  readonly workspaceId: string;
};

// 역할 : MoveWorkspaceObjectAttributeDefinitionPositionResponse가 AttributeDefinition 위치 변경 응답 값을 정의합니다.
export type MoveWorkspaceObjectAttributeDefinitionPositionResponse = {
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

// 기능 : 현재 Workspace ObjectDefinition의 AttributeDefinition 단건 조회 API를 호출합니다.
export function getWorkspaceObjectAttributeDefinition(
  input: GetWorkspaceObjectAttributeDefinitionInput,
) {
  // 1. 인증된 현재 사용자와 Workspace ObjectDefinition 기준 AttributeDefinition 단건 API를 호출한다.
  return apiClient<WorkspaceObjectAttributeDefinitionDetail>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions/${encodeURIComponent(input.objectDefinitionId)}/attribute-definitions/${encodeURIComponent(input.attributeDefinitionId)}`,
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
    insertPosition?: CreateWorkspaceObjectAttributeDefinitionInsertPosition;
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

  if (input.insertPosition !== undefined) {
    body.insertPosition = input.insertPosition;
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

// 기능 : 현재 Workspace ObjectDefinition의 AttributeDefinition 일부 값을 수정합니다.
export function updateWorkspaceObjectAttributeDefinition(
  input: UpdateWorkspaceObjectAttributeDefinitionInput,
) {
  // 1. request에 포함된 수정 필드만 sparse PATCH body에 담는다.
  const body: {
    description?: string | null;
    icon?: string | null;
    isMultiselect?: boolean;
    title?: string;
  } = {};

  if (input.title !== undefined) {
    body.title = input.title;
  }

  if (input.description !== undefined) {
    body.description = input.description;
  }

  if (input.icon !== undefined) {
    body.icon = input.icon;
  }

  if (input.isMultiselect !== undefined) {
    body.isMultiselect = input.isMultiselect;
  }

  // 2. 현재 Workspace ObjectDefinition 기준 AttributeDefinition 수정 요청을 전달한다.
  return apiClient<UpdateWorkspaceObjectAttributeDefinitionResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions/${encodeURIComponent(input.objectDefinitionId)}/attribute-definitions/${encodeURIComponent(input.attributeDefinitionId)}`,
    {
      method: "PATCH",
      body,
    },
  );
}

// 기능 : 현재 Workspace ObjectDefinition의 AttributeDefinition 위치를 변경합니다.
export function moveWorkspaceObjectAttributeDefinitionPosition(
  input: MoveWorkspaceObjectAttributeDefinitionPositionInput,
) {
  // 1. Backend 위치 변경 계약에 맞춰 기준 AttributeDefinition과 배치 방향을 전달한다.
  return apiClient<MoveWorkspaceObjectAttributeDefinitionPositionResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions/${encodeURIComponent(input.objectDefinitionId)}/attribute-definitions/${encodeURIComponent(input.attributeDefinitionId)}/position`,
    {
      method: "PATCH",
      body: {
        targetPlacementPosition: input.targetPlacementPosition,
      },
    },
  );
}
