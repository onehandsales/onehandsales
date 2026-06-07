import type {
  PurgeExpiredTrashResult,
  TrashItemRecord,
  TrashListResult,
  TrashRestoreRecord,
} from "@/modules/trash/application/ports/trash.repository";

export interface TrashItemResponse {
  readonly targetType: string;
  readonly targetId: string;
  readonly title: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
}

export interface TrashListResponse {
  readonly items: TrashItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

export interface TrashRestoreResponse {
  readonly targetType: string;
  readonly targetId: string;
  readonly restoredAt: string;
  readonly resource: unknown;
}

export interface PurgeExpiredTrashResponse {
  readonly deletedCountByTargetType: Record<string, number>;
}

export function toTrashItemResponse(item: TrashItemRecord): TrashItemResponse {
  return {
    targetType: item.targetType,
    targetId: item.targetId,
    title: item.title,
    deletedAt: item.deletedAt.toISOString(),
    permanentDeleteAt: item.permanentDeleteAt.toISOString(),
  };
}

export function toTrashListResponse(
  result: TrashListResult
): TrashListResponse {
  return {
    items: result.items.map(toTrashItemResponse),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    hasNext: result.hasNext,
  };
}

export function toTrashRestoreResponse(
  result: TrashRestoreRecord
): TrashRestoreResponse {
  return {
    targetType: result.targetType,
    targetId: result.targetId,
    restoredAt: result.restoredAt.toISOString(),
    resource: result.resource,
  };
}

export function toPurgeExpiredTrashResponse(
  result: PurgeExpiredTrashResult
): PurgeExpiredTrashResponse {
  return {
    deletedCountByTargetType: result.deletedCountByTargetType,
  };
}
