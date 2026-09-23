import { apiClient } from "@/lib/api-client";

export type CreateObjectDefinitionInput = {
  readonly description?: string;
  readonly icon?: string;
  readonly objectDefinitionName: string;
  readonly workspaceId: string;
};

export type CreateObjectDefinitionResponse = {
  readonly id: string;
};

// 기능 : 현재 Workspace에 새 관리 항목 생성 API를 호출합니다.
export function createObjectDefinition(input: CreateObjectDefinitionInput) {
  // 1. 선택 입력값이 비어 있으면 request body에서 제외한다.
  const body: {
    objectDefinitionName: string;
    icon?: string;
    description?: string;
  } = {
    objectDefinitionName: input.objectDefinitionName,
  };

  if (input.icon !== undefined && input.icon.length > 0) {
    body.icon = input.icon;
  }

  if (input.description !== undefined && input.description.length > 0) {
    body.description = input.description;
  }

  // 2. 현재 Workspace의 ObjectDefinition 생성 API에 입력한 이름과 세부 정보를 전달한다.
  return apiClient<CreateObjectDefinitionResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions`,
    {
      method: "POST",
      body,
    },
  );
}
