export type TrashTargetType =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "COMPANY_MEMO_LOG"
  | "COMPANY_PRIVATE_MEMO_LOG"
  | "CONTACT_MEMO_LOG"
  | "CONTACT_PRIVATE_MEMO_LOG"
  | "PRODUCT_MEMO_LOG"
  | "PRODUCT_PRIVATE_MEMO_LOG"
  | "DEAL_MEMO_LOG"
  | "DEAL_FOLLOWING_ACTION_LOG";

export type TrashTargetFilter = "ALL" | TrashTargetType;
export type TrashItemKindFilter = "ALL" | "ENTITY" | "LOG";
export type TrashDomainFilter = "ALL" | "COMPANY" | "CONTACT" | "PRODUCT" | "DEAL";
export type TrashLogTypeFilter =
  | "ALL"
  | "MEMO"
  | "PRIVATE_MEMO"
  | "FOLLOWING_ACTION";
export type TrashSort = "RECENT" | "EXPIRES_SOON";

export interface TrashItem {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly parentType?: TrashDomainFilter;
  readonly parentId?: string | null;
  readonly parentTitle?: string | null;
  readonly deletedAt: string;
  readonly trashExpiresAt?: string | null;
  readonly permanentDeleteAt?: string | null;
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
  readonly deletedAt: string;
  readonly trashExpiresAt: string;
  readonly summary: string;
  readonly fields: TrashDetailField[];
  readonly content?: string | null;
}

export interface TrashListResponse {
  readonly items: TrashItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

export interface ListTrashInput {
  readonly targetType?: TrashTargetFilter;
  readonly itemKind?: TrashItemKindFilter;
  readonly domain?: TrashDomainFilter;
  readonly logType?: TrashLogTypeFilter;
  readonly query?: string;
  readonly sort?: TrashSort;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface TrashTargetInput {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
}

export type RestoreTrashItemInput = TrashTargetInput;

export interface TrashRestoreResponse {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly restoredAt: string;
}
