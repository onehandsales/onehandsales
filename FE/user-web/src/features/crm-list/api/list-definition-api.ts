import { apiClient } from "@/lib/api-client";

export type ListInitialViewType = "TABLE" | "LIST" | "KANBAN";
export type CreateListDefinitionInput = {
  readonly workspaceId: string;
  readonly listDefinitionName: string;
  readonly objectDefinitionId: string;
  readonly titleAttributeDefinitionId: string;
  readonly viewType: ListInitialViewType;
  readonly icon?: string;
  readonly description?: string;
  readonly kanban?: { readonly attributeDefinitionId: string }
    | { readonly newStatus: { readonly title: string; readonly options: readonly string[] } };
};
export type CreateListDefinitionResponse = {
  readonly listDefinitionId: string;
  readonly viewDefinitionId: string;
};

// 기능 : 현재 업무 공간에 목록과 첫 보기를 함께 생성합니다.
export function createListDefinition({ workspaceId, ...body }: CreateListDefinitionInput) {
  // 1. 목록 생성의 입력만 보내고 인증·오류 처리는 공통 client를 사용한다.
  return apiClient<CreateListDefinitionResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(workspaceId)}/list-definitions`,
    { method: "POST", body },
  );
}
