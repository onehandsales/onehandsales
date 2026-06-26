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

export type TrashItemKindFilter = "ALL" | "ENTITY" | "LOG";
export type TrashDomainFilter =
  | "ALL"
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL";
export type TrashLogTypeFilter =
  | "ALL"
  | "MEMO"
  | "PRIVATE_MEMO"
  | "FOLLOWING_ACTION";
export type TrashSort = "RECENT" | "EXPIRES_SOON";

// 역할 : TrashItem 휴지통 목록에서 표시할 삭제 항목 요약 레코드를 정의합니다.
export interface TrashItem {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly parentType?: TrashDomainFilter;
  readonly parentId?: string | null;
  readonly parentTitle?: string | null;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
}

// 역할 : ListTrashInput 현재 사용자의 휴지통 목록 조회 조건을 정의합니다.
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

// 역할 : TrashListResult 휴지통 목록 페이지 응답 구조를 정의합니다.
export interface TrashListResult {
  readonly items: TrashItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

// 역할 : TrashDetailField 휴지통 상세 모달에 표시할 라벨과 값을 정의합니다.
export interface TrashDetailField {
  readonly label: string;
  readonly value: string | null;
}

// 역할 : TrashDetail 휴지통 항목의 복구 전 확인용 상세 정보를 정의합니다.
export interface TrashDetail {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly parentType?: TrashDomainFilter;
  readonly parentId?: string | null;
  readonly parentTitle?: string | null;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
  readonly summary: string;
  readonly fields: TrashDetailField[];
  readonly content?: string | null;
}

// 역할 : GetTrashDetailInput 휴지통 단건 상세 조회에 필요한 값을 정의합니다.
export interface GetTrashDetailInput {
  readonly userId: string;
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly now: Date;
}

// 역할 : RestoreTrashItemInput 휴지통 항목 복구에 필요한 값을 정의합니다.
export interface RestoreTrashItemInput {
  readonly userId: string;
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly now: Date;
}

// 역할 : TrashRestoreResult 복구가 완료된 휴지통 항목의 결과를 정의합니다.
export interface TrashRestoreResult {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly restoredAt: Date;
}

export type TrashRestoreBlockedReason = "PARENT_DELETED";

// 역할 : TrashRestoreBlockedResult 휴지통 복구가 정책상 차단된 이유를 정의합니다.
export interface TrashRestoreBlockedResult {
  readonly blockedReason: TrashRestoreBlockedReason;
}

export type TrashRestoreRepositoryResult =
  | TrashRestoreResult
  | TrashRestoreBlockedResult;

export const TRASH_REPOSITORY = Symbol("TRASH_REPOSITORY");

// 역할 : TrashRepository 휴지통 목록, 상세, 복구 저장소 계약을 정의합니다.
export interface TrashRepository {
  listTrash(input: ListTrashInput): Promise<TrashListResult>;
  getTrashDetail(input: GetTrashDetailInput): Promise<TrashDetail | null>;
  restoreTrashItem(
    input: RestoreTrashItemInput
  ): Promise<TrashRestoreRepositoryResult | null>;
}
