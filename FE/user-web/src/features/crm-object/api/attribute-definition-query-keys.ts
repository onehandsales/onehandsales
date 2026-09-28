export const workspaceObjectAttributeDefinitionQueryKeys = {
  all: ["workspaceObjectAttributeDefinition"] as const,
  list: (
    userId: string | null,
    workspaceId: string | null,
    objectDefinitionId: string | null,
  ) =>
    [
      ...workspaceObjectAttributeDefinitionQueryKeys.all,
      "list",
      userId,
      workspaceId,
      objectDefinitionId,
    ] as const,
};
