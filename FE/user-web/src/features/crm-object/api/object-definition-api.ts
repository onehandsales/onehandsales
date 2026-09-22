import { apiClient } from "@/lib/api-client";

export type CreateObjectDefinitionInput = {
  readonly attributeNames: readonly string[];
  readonly objectDefinitionName: string;
  readonly workspaceId: string;
};

export type CreateObjectDefinitionResponse = {
  readonly ok: boolean;
};

// 기능 : 현재 Workspace에 새 관리 항목 생성 API를 호출합니다.
export function createObjectDefinition(input: CreateObjectDefinitionInput) {
  // 1. 현재 Workspace의 ObjectDefinition 생성 API에 입력한 이름과 정보 목록을 전달한다.
  return apiClient<CreateObjectDefinitionResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions`,
    {
      method: "POST",
      body: {
        attributeNames: input.attributeNames,
        objectDefinitionName: input.objectDefinitionName,
      },
    },
  );
}
