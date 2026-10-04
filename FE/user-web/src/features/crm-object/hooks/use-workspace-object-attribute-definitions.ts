import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspaceObjectAttributeDefinition,
  listWorkspaceObjectAttributeDefinitions,
  updateWorkspaceObjectAttributeDefinition,
} from "@/features/crm-object/api/attribute-definition-api";
import { workspaceObjectAttributeDefinitionQueryKeys } from "@/features/crm-object/api/attribute-definition-query-keys";

type UseWorkspaceObjectAttributeDefinitionsQueryOptions = {
  readonly enabled?: boolean;
  readonly objectDefinitionId?: string | null;
  readonly userId?: string | null;
  readonly workspaceId?: string | null;
};

type UseWorkspaceObjectAttributeDefinitionQueryOptions =
  UseWorkspaceObjectAttributeDefinitionsQueryOptions & {
    readonly attributeDefinitionId?: string | null;
  };

// 역할 : UseUpdateWorkspaceObjectAttributeDefinitionMutationOptions가 AttributeDefinition 수정 mutation 설정을 정의합니다.
type UseUpdateWorkspaceObjectAttributeDefinitionMutationOptions = {
  readonly userId?: string | null;
};

type FetchWorkspaceObjectAttributeDefinitionDetailInput = {
  readonly attributeDefinitionId: string | null;
  readonly objectDefinitionId: string | null;
  readonly workspaceId: string | null;
};

// 기능 : AttributeDefinition 단건 조회에 필요한 입력을 검증하고 API를 호출합니다.
function fetchWorkspaceObjectAttributeDefinitionDetail(
  input: FetchWorkspaceObjectAttributeDefinitionDetailInput,
) {
  // 1. Workspace가 선택되지 않은 상태의 API 호출을 개발 단계에서 차단한다.
  if (!input.workspaceId) {
    throw new Error("workspaceId is required");
  }

  // 2. 관리 항목이 선택되지 않은 상태의 API 호출을 개발 단계에서 차단한다.
  if (!input.objectDefinitionId) {
    throw new Error("objectDefinitionId is required");
  }

  // 3. AttributeDefinition이 선택되지 않은 상태의 API 호출을 개발 단계에서 차단한다.
  if (!input.attributeDefinitionId) {
    throw new Error("attributeDefinitionId is required");
  }

  // 4. 현재 Workspace 관리 항목의 AttributeDefinition 상세 정보를 Backend에서 조회한다.
  return getWorkspaceObjectAttributeDefinition({
    workspaceId: input.workspaceId,
    objectDefinitionId: input.objectDefinitionId,
    attributeDefinitionId: input.attributeDefinitionId,
  });
}

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

// 기능 : 현재 Workspace ObjectDefinition의 AttributeDefinition 단건 query를 제공합니다.
export function useWorkspaceObjectAttributeDefinitionQuery(
  options: UseWorkspaceObjectAttributeDefinitionQueryOptions = {},
) {
  // 1. 이후 단계에서 사용할 query key 입력값을 준비한다.
  const userId = options.userId ?? null;
  const workspaceId = options.workspaceId ?? null;
  const objectDefinitionId = options.objectDefinitionId ?? null;
  const attributeDefinitionId = options.attributeDefinitionId ?? null;

  // 기능 : 선택된 AttributeDefinition 상세 정보를 불러옵니다.
  function queryAttributeDefinitionDetail() {
    // 1. 현재 hook 입력값을 API 조회 입력으로 전달한다.
    return fetchWorkspaceObjectAttributeDefinitionDetail({
      workspaceId,
      objectDefinitionId,
      attributeDefinitionId,
    });
  }

  // 2. 계산된 query 설정을 호출자에게 반환한다.
  return useQuery({
    queryKey: workspaceObjectAttributeDefinitionQueryKeys.detail(
      userId,
      workspaceId,
      objectDefinitionId,
      attributeDefinitionId,
    ),
    queryFn: queryAttributeDefinitionDetail,
    enabled:
      (options.enabled ?? true) &&
      Boolean(userId && workspaceId && objectDefinitionId && attributeDefinitionId),
    refetchOnMount: "always",
    staleTime: 0,
  });
}

// 기능 : 현재 Workspace ObjectDefinition의 AttributeDefinition 수정 mutation을 제공합니다.
export function useUpdateWorkspaceObjectAttributeDefinitionMutation(
  options: UseUpdateWorkspaceObjectAttributeDefinitionMutationOptions = {},
) {
  // 1. mutation 성공 후 AttributeDefinition list/detail query를 갱신할 준비를 한다.
  const queryClient = useQueryClient();
  const userId = options.userId ?? null;

  // 2. PATCH API 호출과 관련 query invalidation 규칙을 호출자에게 제공한다.
  return useMutation({
    mutationFn: updateWorkspaceObjectAttributeDefinition,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: workspaceObjectAttributeDefinitionQueryKeys.list(
          userId,
          variables.workspaceId,
          variables.objectDefinitionId,
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: workspaceObjectAttributeDefinitionQueryKeys.detail(
          userId,
          variables.workspaceId,
          variables.objectDefinitionId,
          variables.attributeDefinitionId,
        ),
      });
    },
  });
}
