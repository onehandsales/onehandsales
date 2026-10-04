// 기능 : Workspace ObjectDefinition AttributeDefinition 목록 query key를 생성합니다.
function createWorkspaceObjectAttributeDefinitionListQueryKey(
  userId: string | null,
  workspaceId: string | null,
  objectDefinitionId: string | null,
) {
  // 1. 사용자와 Workspace/Object 경계를 query cache key에 함께 담는다.
  return [
    ...workspaceObjectAttributeDefinitionQueryKeys.all,
    "list",
    userId,
    workspaceId,
    objectDefinitionId,
  ] as const;
}

// 기능 : Workspace ObjectDefinition AttributeDefinition 단건 query key를 생성합니다.
function createWorkspaceObjectAttributeDefinitionDetailQueryKey(
  userId: string | null,
  workspaceId: string | null,
  objectDefinitionId: string | null,
  attributeDefinitionId: string | null,
) {
  // 1. 사용자와 Workspace/Object/Attribute 경계를 query cache key에 함께 담는다.
  return [
    ...workspaceObjectAttributeDefinitionQueryKeys.all,
    "detail",
    userId,
    workspaceId,
    objectDefinitionId,
    attributeDefinitionId,
  ] as const;
}

// 기능 : crm-object feature의 AttributeDefinition query key factory를 제공합니다.
export const workspaceObjectAttributeDefinitionQueryKeys = {
  all: ["workspaceObjectAttributeDefinition"] as const,
  detail: createWorkspaceObjectAttributeDefinitionDetailQueryKey,
  list: createWorkspaceObjectAttributeDefinitionListQueryKey,
};
