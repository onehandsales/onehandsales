import type {
  TrashDomainFilter,
  TrashItemKindFilter,
  TrashLogTypeFilter,
  TrashSort,
  TrashTargetType,
} from "./trash.types";

export type TrashRestoreWindow = "ACTIVE" | "EXPIRED";

export interface TrashItem {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly parentType?: TrashDomainFilter;
  readonly parentId?: string | null;
  readonly parentTitle?: string | null;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
  readonly restoreWindow: TrashRestoreWindow;
  readonly canRestore: boolean;
  readonly hasPrivateMemo: boolean;
  readonly privateMemoIncluded: false;
}

export interface ListTrashInput {
  readonly userId: string;
  readonly targetType?: TrashTargetType | "ALL";
  readonly itemKind?: TrashItemKindFilter;
  readonly domain?: TrashDomainFilter;
  readonly logType?: TrashLogTypeFilter;
  readonly query?: string;
  readonly sort?: TrashSort;
  readonly page?: number;
  readonly pageSize?: number;
  readonly now: Date;
}

export interface TrashListResult {
  readonly items: TrashItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

export interface TrashDetailField {
  readonly label: string;
  readonly value: string | null;
}

export interface TrashDetail {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly parentType?: TrashDomainFilter;
  readonly parentId?: string | null;
  readonly parentTitle?: string | null;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
  readonly restoreWindow: TrashRestoreWindow;
  readonly canRestore: boolean;
  readonly hasPrivateMemo: boolean;
  readonly privateMemoIncluded: false;
  readonly summary: string;
  readonly fields: TrashDetailField[];
  readonly content?: string | null;
}

export interface GetTrashDetailInput {
  readonly userId: string;
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly now: Date;
}

export interface RestoreTrashItemInput {
  readonly userId: string;
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly now: Date;
}

export interface TrashRestoreResult {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly restoredAt: Date;
}

export type TrashRestoreBlockedReason = "PARENT_DELETED";

export interface TrashRestoreBlockedResult {
  readonly blockedReason: TrashRestoreBlockedReason;
}

export type TrashRestoreRepositoryResult =
  | TrashRestoreResult
  | TrashRestoreBlockedResult;

export const TRASH_REPOSITORY = Symbol("TRASH_REPOSITORY");

export interface TrashRepository {
  listTrash(input: ListTrashInput): Promise<TrashListResult>;
  getTrashDetail(input: GetTrashDetailInput): Promise<TrashDetail | null>;
  restoreTrashItem(
    input: RestoreTrashItemInput
  ): Promise<TrashRestoreRepositoryResult | null>;
  runInTransaction<T>(
    work: (repository: TrashRepository) => Promise<T>
  ): Promise<T>;
}
