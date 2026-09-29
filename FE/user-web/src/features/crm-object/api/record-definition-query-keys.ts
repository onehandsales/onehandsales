// 기능 : Workspace ObjectDefinition RecordDefinition 목록 query key를 생성합니다.
function createWorkspaceObjectRecordDefinitionListQueryKey(
  userId: string | null,
  workspaceId: string | null,
  objectDefinitionId: string | null,
) {
  // 1. 사용자와 Workspace/Object 경계를 query cache key에 함께 담는다.
  return [
    ...workspaceObjectRecordDefinitionQueryKeys.all,
    "list",
    userId,
    workspaceId,
    objectDefinitionId,
  ] as const;
}

// 기능 : crm-object feature의 RecordDefinition query key factory를 제공합니다.
export const workspaceObjectRecordDefinitionQueryKeys = {
  all: ["workspaceObjectRecordDefinition"] as const,
  list: createWorkspaceObjectRecordDefinitionListQueryKey,
};
