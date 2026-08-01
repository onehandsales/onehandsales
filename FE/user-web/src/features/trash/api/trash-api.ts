import type {
  CreateTrashRecoveryRequestInput,
  TrashDetail,
  ListTrashInput,
  RestoreTrashItemInput,
  TrashListResponse,
  TrashRecoveryRequestResponse,
  TrashRestoreResponse,
  TrashTargetInput,
} from "@/features/trash/types/trash";
import { apiClient } from "@/lib/api-client";

export function listTrash(input: ListTrashInput = {}) {
  const searchParams = new URLSearchParams();

  if (input.targetType && input.targetType !== "ALL") {
    searchParams.set("targetType", input.targetType);
  }

  if (input.itemKind && input.itemKind !== "ALL") {
    searchParams.set("itemKind", input.itemKind);
  }

  if (input.domain && input.domain !== "ALL") {
    searchParams.set("domain", input.domain);
  }

  if (input.logType && input.logType !== "ALL") {
    searchParams.set("logType", input.logType);
  }

  if (input.query?.trim()) {
    searchParams.set("query", input.query.trim());
  }

  if (input.sort) {
    searchParams.set("sort", input.sort);
  }

  if (input.page !== undefined) {
    searchParams.set("page", String(input.page));
  }

  if (input.pageSize !== undefined) {
    searchParams.set("pageSize", String(input.pageSize));
  }

  const query = searchParams.toString();

  return apiClient<TrashListResponse>(
    `/api/trash${query ? `?${query}` : ""}`
  );
}

export function getTrashDetail(input: TrashTargetInput) {
  return apiClient<TrashDetail>(
    `/api/trash/${input.targetType}/${input.targetId}`,
  );
}

export function restoreTrashItem(input: RestoreTrashItemInput) {
  return apiClient<TrashRestoreResponse>(
    `/api/trash/${input.targetType}/${input.targetId}/restore`,
    {
      method: "POST",
      body: {},
    }
  );
}

// 기능 : 만료된 휴지통 row의 복구 문의 생성 API를 호출합니다.
export function createTrashRecoveryRequest(
  input: CreateTrashRecoveryRequestInput,
) {
  return apiClient<TrashRecoveryRequestResponse>(
    "/api/trash/recovery-requests",
    {
      method: "POST",
      body: {
        targetType: input.targetType,
        targetId: input.targetId,
        message: input.message,
      },
    },
  );
}
