export const ACCOUNT_REQUEST_REPOSITORY = Symbol(
  "ACCOUNT_REQUEST_REPOSITORY"
);

export type UserDataExportRequestStatusValue =
  | "REQUESTED"
  | "PROCESSING"
  | "READY"
  | "EXPIRED"
  | "FAILED";
export type AccountDeletionRequestStatusValue =
  | "REQUESTED"
  | "CANCELLED"
  | "PROCESSING"
  | "COMPLETED";
export type UserDataExportFormat = "ZIP_JSON_XLSX";

// 역할 : UserDataExportRequestRecord 사용자 데이터 export 요청 record를 정의합니다.
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

// 역할 : CreateUserDataExportRequestInput 사용자 데이터 export 요청 생성 값을 정의합니다.
export interface CreateUserDataExportRequestInput {
  readonly userId: string;
  readonly includeSensitive: boolean;
  readonly format: UserDataExportFormat;
  readonly requestedAt: Date;
}

// 역할 : AccountDeletionRequestRecord 계정 삭제 요청 record를 정의합니다.
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

// 역할 : CreateAccountDeletionRequestInput 계정 삭제 요청 생성 값을 정의합니다.
export interface CreateAccountDeletionRequestInput {
  readonly userId: string;
  readonly reasonCode: string | null;
  readonly reasonMessage: string | null;
  readonly requestedAt: Date;
  readonly scheduledDeletionAt: Date;
  readonly canCancelUntil: Date;
}

// 역할 : CancelAccountDeletionRequestInput 계정 삭제 요청 취소 값을 정의합니다.
export interface CancelAccountDeletionRequestInput {
  readonly userId: string;
  readonly requestId: string;
  readonly cancelledAt: Date;
}

// 역할 : AccountRequestRepository 사용자 계정 데이터 요청 영속성 계약을 정의합니다.
export interface AccountRequestRepository {
  // 기능 : 만료된 READY export 요청을 EXPIRED로 전환합니다.
  expireReadyDataExportRequests(userId: string, now: Date): Promise<void>;

  // 기능 : 현재 사용자에게 열린 데이터 export 요청이 있는지 조회합니다.
  findOpenDataExportRequest(
    userId: string,
    now: Date
  ): Promise<UserDataExportRequestRecord | null>;

  // 기능 : 사용자 데이터 export 요청 row를 생성합니다.
  createDataExportRequest(
    input: CreateUserDataExportRequestInput
  ): Promise<UserDataExportRequestRecord>;

  // 기능 : 현재 사용자 소유 데이터 export 요청을 조회합니다.
  findDataExportRequestById(
    userId: string,
    requestId: string
  ): Promise<UserDataExportRequestRecord | null>;

  // 기능 : 현재 사용자에게 열린 계정 삭제 요청이 있는지 조회합니다.
  findOpenAccountDeletionRequest(
    userId: string
  ): Promise<AccountDeletionRequestRecord | null>;

  // 기능 : 계정 삭제 요청 row를 생성합니다.
  createAccountDeletionRequest(
    input: CreateAccountDeletionRequestInput
  ): Promise<AccountDeletionRequestRecord>;

  // 기능 : 현재 사용자 소유 계정 삭제 요청을 조회합니다.
  findAccountDeletionRequestById(
    userId: string,
    requestId: string
  ): Promise<AccountDeletionRequestRecord | null>;

  // 기능 : 취소 가능한 계정 삭제 요청을 CANCELLED로 변경합니다.
  cancelAccountDeletionRequest(
    input: CancelAccountDeletionRequestInput
  ): Promise<AccountDeletionRequestRecord | null>;

  // 기능 : 사용자 계정 데이터 요청 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: AccountRequestRepository) => Promise<T>
  ): Promise<T>;
}
