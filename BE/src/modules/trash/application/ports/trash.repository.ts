export const TRASH_REPOSITORY = Symbol("TRASH_REPOSITORY");

export type TrashTargetType =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE"
  | "COMPANY_LOG"
  | "CONTACT_LOG"
  | "PRODUCT_LOG"
  | "PRODUCT_CONNECTION"
  | "DEAL_ACTIVITY"
  | "PERSONAL_MEMO";

export interface TrashItemRecord {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly deletedAt: Date;
  readonly permanentDeleteAt: Date;
}

export interface TrashListResult {
  readonly items: TrashItemRecord[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

export interface ListTrashInput {
  readonly userId: string;
  readonly targetType: TrashTargetType | null;
  readonly page: number;
  readonly pageSize: number;
}

export interface TrashRestoreRecord {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly restoredAt: Date;
  readonly resource: unknown;
}

export interface PurgeExpiredTrashResult {
  readonly deletedCountByTargetType: Partial<Record<TrashTargetType, number>>;
}

export interface TrashRepository {
  listTrash(input: ListTrashInput): Promise<TrashListResult>;
  restoreTrashItem(input: {
    readonly userId: string;
    readonly targetType: TrashTargetType;
    readonly targetId: string;
    readonly now: Date;
  }): Promise<TrashRestoreRecord>;
  purgeExpiredTrash(input: {
    readonly now: Date;
    readonly limit: number;
  }): Promise<PurgeExpiredTrashResult>;
}
