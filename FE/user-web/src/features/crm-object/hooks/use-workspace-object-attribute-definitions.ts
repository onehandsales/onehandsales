import { useQuery } from "@tanstack/react-query";
import { listWorkspaceObjectAttributeDefinitions } from "@/features/crm-object/api/attribute-definition-api";
import { workspaceObjectAttributeDefinitionQueryKeys } from "@/features/crm-object/api/attribute-definition-query-keys";

type UseWorkspaceObjectAttributeDefinitionsQueryOptions = {
  readonly enabled?: boolean;
  readonly objectDefinitionId?: string | null;
  readonly userId?: string | null;
  readonly workspaceId?: string | null;
};

// 기능 : 현재 Workspace ObjectDefinition의 header row AttributeDefinition 목록 query를 제공합니다.
export function useWorkspaceObjectAttributeDefinitionsQuery(
  options: UseWorkspaceObjectAttributeDefinitionsQueryOptions = {},
) {
  // 1. 이후 단계에서 사용할 query key 입력값을 준비한다.
  const userId = options.userId ?? null;
  const workspaceId = options.workspaceId ?? null;
  const objectDefinitionId = options.objectDefinitionId ?? null;

  // 2. 계산된 query 설정을 호출자에게 반환한다.
  return useQuery({
    queryKey: workspaceObjectAttributeDefinitionQueryKeys.list(
      userId,
      workspaceId,
      objectDefinitionId,
    ),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error("workspaceId is required");
      }

      if (!objectDefinitionId) {
        throw new Error("objectDefinitionId is required");
      }

      return listWorkspaceObjectAttributeDefinitions({
        workspaceId,
        objectDefinitionId,
      });
    },
    enabled:
      (options.enabled ?? true) &&
      Boolean(userId && workspaceId && objectDefinitionId),
    refetchOnMount: "always",
    staleTime: 0,
  });
}
