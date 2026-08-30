import type {
  AccountDeletionRequestStatus,
  UserDataExportRequestStatus,
} from "./admin-operation.types";

// 역할 : AdminAccountDeletionRequestQueueItemRecord Admin 계정 삭제 요청 queue item application read model을 정의합니다.
export interface AdminAccountDeletionRequestQueueItemRecord {
  readonly id: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly status: AccountDeletionRequestStatus;
  readonly requestedAt: Date;
  readonly scheduledDeletionAt: Date;
  readonly reasonCode: string | null;
}

// 역할 : AdminAccountDeletionRequestsPageRecord Admin 계정 삭제 요청 cursor page application read model을 정의합니다.
export interface AdminAccountDeletionRequestsPageRecord {
  readonly items: AdminAccountDeletionRequestQueueItemRecord[];
  readonly nextCursor: string | null;
}

// 역할 : AdminDataExportRequestQueueItemRecord Admin 데이터 export 요청 queue item application read model을 정의합니다.
export interface AdminDataExportRequestQueueItemRecord {
  readonly id: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly status: UserDataExportRequestStatus;
  readonly includeSensitive: boolean;
  readonly format: string;
  readonly requestedAt: Date;
  readonly expiresAt: Date | null;
}

// 역할 : AdminDataExportRequestsPageRecord Admin 데이터 export 요청 cursor page application read model을 정의합니다.
export interface AdminDataExportRequestsPageRecord {
  readonly items: AdminDataExportRequestQueueItemRecord[];
  readonly nextCursor: string | null;
}
