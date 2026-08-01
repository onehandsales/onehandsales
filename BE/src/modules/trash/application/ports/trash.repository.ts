export type TrashTargetType =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE"
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
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE";
export type TrashLogTypeFilter =
  | "ALL"
  | "MEMO"
  | "PRIVATE_MEMO"
  | "FOLLOWING_ACTION";
export type TrashSort = "RECENT" | "EXPIRES_SOON";
export type TrashRestoreWindow = "ACTIVE" | "EXPIRED";
export type TrashRecoveryRequestStatusValue =
  | "REQUESTED"
  | "REVIEWING"
  | "WAITING_RECOVERY_POLICY"
  | "RECOVERY_AVAILABLE"
  | "REJECTED"
  | "CLOSED";

// 역할 : TrashRecoveryRequestSummary 휴지통 row에 연결된 복구 요청 요약을 정의합니다.
export interface TrashRecoveryRequestSummary {
  readonly id: string;
  readonly status: TrashRecoveryRequestStatusValue;
  readonly createdAt: Date;
}

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
  readonly restoreWindow: TrashRestoreWindow;
  readonly canRestore: boolean;
  readonly canRequestRecovery: boolean;
  readonly hasPrivateMemo: boolean;
  readonly privateMemoIncluded: false;
  readonly recoveryRequest: TrashRecoveryRequestSummary | null;
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
  readonly restoreWindow: TrashRestoreWindow;
  readonly canRestore: boolean;
  readonly canRequestRecovery: boolean;
  readonly hasPrivateMemo: boolean;
  readonly privateMemoIncluded: false;
  readonly recoveryRequest: TrashRecoveryRequestSummary | null;
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
  readonly scheduleReminder?: RestoredScheduleReminder | null;
}

export interface RestoredScheduleReminder {
  readonly scheduleId: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
}

export type TrashRestoreBlockedReason = "PARENT_DELETED";

// 역할 : TrashRestoreBlockedResult 휴지통 복구가 정책상 차단된 이유를 정의합니다.
export interface TrashRestoreBlockedResult {
  readonly blockedReason: TrashRestoreBlockedReason;
}

export type TrashRestoreRepositoryResult =
  | TrashRestoreResult
  | TrashRestoreBlockedResult;

// 역할 : TrashRecoveryTargetRecord 복구 문의 생성 전에 검증할 Trash 대상 snapshot을 정의합니다.
export interface TrashRecoveryTargetRecord {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly titleSnapshot: string;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
  readonly restoreWindow: TrashRestoreWindow;
}

// 역할 : FindTrashRecoveryTargetInput 복구 문의 대상 Trash row 조회 조건을 정의합니다.
export interface FindTrashRecoveryTargetInput {
  readonly userId: string;
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly now: Date;
}

// 역할 : FindOpenTrashRecoveryRequestInput 열린 복구 요청 중복 조회 조건을 정의합니다.
export interface FindOpenTrashRecoveryRequestInput {
  readonly userId: string;
  readonly targetType: TrashTargetType;
  readonly targetId: string;
}

// 역할 : CreateTrashRecoveryRequestInput 복구 문의 row 생성 값을 정의합니다.
export interface CreateTrashRecoveryRequestInput {
  readonly userId: string;
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly titleSnapshot: string;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
  readonly message: string;
}

// 역할 : TrashRecoveryRequestRecord 복구 문의 생성/중복 반환 record를 정의합니다.
export interface TrashRecoveryRequestRecord {
  readonly id: string;
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly status: TrashRecoveryRequestStatusValue;
  readonly createdAt: Date;
}

export const TRASH_REPOSITORY = Symbol("TRASH_REPOSITORY");

// 역할 : TrashRepository 휴지통 목록, 상세, 복구 저장소 계약을 정의합니다.
export interface TrashRepository {
  listTrash(input: ListTrashInput): Promise<TrashListResult>;
  getTrashDetail(input: GetTrashDetailInput): Promise<TrashDetail | null>;
  restoreTrashItem(
    input: RestoreTrashItemInput
  ): Promise<TrashRestoreRepositoryResult | null>;

  // 기능 : 복구 문의 대상 Trash row snapshot을 조회합니다.
  findRecoveryTarget(
    input: FindTrashRecoveryTargetInput
  ): Promise<TrashRecoveryTargetRecord | null>;

  // 기능 : 같은 대상에 열린 복구 문의가 있는지 조회합니다.
  findOpenRecoveryRequest(
    input: FindOpenTrashRecoveryRequestInput
  ): Promise<TrashRecoveryRequestRecord | null>;

  // 기능 : 만료된 Trash row에 대한 복구 문의를 생성합니다.
  createRecoveryRequest(
    input: CreateTrashRecoveryRequestInput
  ): Promise<TrashRecoveryRequestRecord>;

  // 기능 : 휴지통 저장소 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: TrashRepository) => Promise<T>
  ): Promise<T>;
}
