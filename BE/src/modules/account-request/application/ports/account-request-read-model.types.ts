// 역할 : UserDataExportRequestStatusValue 사용자 데이터 export 요청 상태 값을 정의합니다.
export type UserDataExportRequestStatusValue =
  | "REQUESTED"
  | "PROCESSING"
  | "READY"
  | "EXPIRED"
  | "FAILED";

// 역할 : AccountDeletionRequestStatusValue 계정 삭제 요청 상태 값을 정의합니다.
export type AccountDeletionRequestStatusValue =
  | "REQUESTED"
  | "CANCELLED"
  | "PROCESSING"
  | "COMPLETED";

// 역할 : UserDataExportFormat 사용자 데이터 export 파일 형식 값을 정의합니다.
export type UserDataExportFormat = "ZIP_JSON_XLSX";

// 역할 : UserDataExportRequestRecord 사용자 데이터 export 요청 application read model을 정의합니다.
export interface UserDataExportRequestRecord {
  readonly id: string;
  readonly userId: string;
  readonly status: UserDataExportRequestStatusValue;
  readonly includeSensitive: boolean;
  readonly format: UserDataExportFormat;
  readonly artifactPath: string | null;
  readonly requestedAt: Date;
  readonly expiresAt: Date | null;
}

// 역할 : AccountDeletionRequestRecord 계정 삭제 요청 application read model을 정의합니다.
export interface AccountDeletionRequestRecord {
  readonly id: string;
  readonly userId: string;
  readonly status: AccountDeletionRequestStatusValue;
  readonly reasonCode: string | null;
  readonly requestedAt: Date;
  readonly scheduledDeletionAt: Date;
  readonly canCancelUntil: Date;
  readonly cancelledAt: Date | null;
}
