export type UserDataExportRequestStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "READY"
  | "EXPIRED"
  | "FAILED";

export type AccountDeletionRequestStatus =
  | "REQUESTED"
  | "CANCELLED"
  | "PROCESSING"
  | "COMPLETED";

export type UserDataExportFormat = "ZIP_JSON_XLSX";

// 역할 : CreateDataExportRequestInput 사용자 데이터 export 생성 입력을 정의합니다.
export type CreateDataExportRequestInput = {
  readonly includeSensitive: boolean;
  readonly format: UserDataExportFormat;
};

// 역할 : UserDataExportRequestResponse 사용자 데이터 export 요청 응답을 정의합니다.
export type UserDataExportRequestResponse = {
  readonly id: string;
  readonly status: UserDataExportRequestStatus;
  readonly includeSensitive: boolean;
  readonly format: UserDataExportFormat;
  readonly requestedAt: string;
  readonly expiresAt: string | null;
  readonly downloadUrl: string | null;
};

// 역할 : CreateAccountDeletionRequestInput 계정 삭제 요청 생성 입력을 정의합니다.
export type CreateAccountDeletionRequestInput = {
  readonly confirmText: string;
  readonly reasonCode?: string;
  readonly reasonMessage?: string;
};

// 역할 : AccountDeletionRequestResponse 계정 삭제 요청 응답을 정의합니다.
export type AccountDeletionRequestResponse = {
  readonly id: string;
  readonly status: AccountDeletionRequestStatus;
  readonly requestedAt: string;
  readonly scheduledDeletionAt: string;
  readonly canCancelUntil: string;
};

// 역할 : CancelAccountDeletionRequestResponse 계정 삭제 취소 응답을 정의합니다.
export type CancelAccountDeletionRequestResponse = {
  readonly id: string;
  readonly status: AccountDeletionRequestStatus;
  readonly cancelledAt: string | null;
};
