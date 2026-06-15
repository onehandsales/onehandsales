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

export type TrashTargetFilter = "ALL" | TrashTargetType;

export interface TrashItem {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
}

export interface TrashListResponse {
  readonly items: TrashItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}

export interface ListTrashInput {
  readonly targetType?: TrashTargetFilter;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface RestoreTrashItemInput {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
}

export interface TrashRestoreResponse {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly restoredAt: string;
  readonly resource: unknown;
}
