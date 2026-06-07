import type {
  ListTrashInput,
  RestoreTrashItemInput,
  TrashListResponse,
  TrashRestoreResponse,
} from "@/features/trash/types/trash";
import { apiClient } from "@/lib/api-client";

export function listTrash(input: ListTrashInput = {}) {
  const searchParams = new URLSearchParams();

  if (input.targetType && input.targetType !== "ALL") {
    searchParams.set("targetType", input.targetType);
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

export function restoreTrashItem(input: RestoreTrashItemInput) {
  return apiClient<TrashRestoreResponse>(
    `/api/trash/${input.targetType}/${input.targetId}/restore`,
    {
      method: "POST",
      body: {},
    }
  );
}
