import { useInfiniteQuery } from "@tanstack/react-query";
import {
  listWorkspaceObjectRecordDefinitions,
  type WorkspaceObjectRecordDefinitionListResponse,
} from "@/features/crm-object/api/record-definition-api";
import { workspaceObjectRecordDefinitionQueryKeys } from "@/features/crm-object/api/record-definition-query-keys";

type UseWorkspaceObjectRecordDefinitionsQueryOptions = {
  readonly enabled?: boolean;
  readonly objectDefinitionId?: string | null;
  readonly userId?: string | null;
  readonly workspaceId?: string | null;
};

type FetchWorkspaceObjectRecordDefinitionsPageInput = {
  readonly objectDefinitionId: string | null;
  readonly pageParam: unknown;
  readonly workspaceId: string | null;
};

type WorkspaceObjectRecordDefinitionsQueryContext = {
  readonly pageParam: unknown;
};

// 기능 : RecordDefinition 목록 page 조회에 필요한 입력을 검증하고 API를 호출합니다.
function fetchWorkspaceObjectRecordDefinitionsPage(
  input: FetchWorkspaceObjectRecordDefinitionsPageInput,
) {
  // 1. Workspace가 선택되지 않은 상태의 API 호출을 개발 단계에서 차단한다.
  if (!input.workspaceId) {
    throw new Error("workspaceId is required");
  }

  // 2. 관리 항목이 선택되지 않은 상태의 API 호출을 개발 단계에서 차단한다.
  if (!input.objectDefinitionId) {
    throw new Error("objectDefinitionId is required");
  }

  // 3. TanStack Query의 pageParam을 Backend cursor 입력으로 정규화한다.
  const cursor = typeof input.pageParam === "string" ? input.pageParam : null;

  // 4. 현재 Workspace 관리 항목의 RecordDefinition page를 Backend에서 조회한다.
  return listWorkspaceObjectRecordDefinitions({
    workspaceId: input.workspaceId,
    objectDefinitionId: input.objectDefinitionId,
    cursor,
  });
}

// 기능 : RecordDefinition 목록 응답에서 다음 page cursor를 가져옵니다.
function getNextWorkspaceObjectRecordDefinitionsPageParam(
  lastPage: WorkspaceObjectRecordDefinitionListResponse,
) {
  // 1. Backend가 내려준 cursor를 TanStack Query의 다음 pageParam으로 전달한다.
  return lastPage.pageInfo.nextCursor;
}

// 기능 : 현재 Workspace ObjectDefinition의 body row RecordDefinition 목록 query를 제공합니다.
export function useWorkspaceObjectRecordDefinitionsQuery(
  options: UseWorkspaceObjectRecordDefinitionsQueryOptions = {},
) {
  // 1. 이후 단계에서 사용할 query key 입력값을 준비한다.
  const userId = options.userId ?? null;
  const workspaceId = options.workspaceId ?? null;
  const objectDefinitionId = options.objectDefinitionId ?? null;

  // 기능 : TanStack Query가 요청한 cursor page의 RecordDefinition 목록을 불러옵니다.
  function queryRecordDefinitionsPage({
    pageParam,
  }: WorkspaceObjectRecordDefinitionsQueryContext) {
    // 1. 현재 hook 입력값과 page cursor를 API 조회 입력으로 전달한다.
    return fetchWorkspaceObjectRecordDefinitionsPage({
      workspaceId,
      objectDefinitionId,
      pageParam,
    });
  }

  // 2. 계산된 query 설정을 호출자에게 반환한다.
  return useInfiniteQuery({
    queryKey: workspaceObjectRecordDefinitionQueryKeys.list(
      userId,
      workspaceId,
      objectDefinitionId,
    ),
    queryFn: queryRecordDefinitionsPage,
    enabled:
      (options.enabled ?? true) &&
      Boolean(userId && workspaceId && objectDefinitionId),
    getNextPageParam: getNextWorkspaceObjectRecordDefinitionsPageParam,
    initialPageParam: null as string | null,
    refetchOnMount: "always",
    staleTime: 0,
  });
}
