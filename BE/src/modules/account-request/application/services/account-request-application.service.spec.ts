import type {
  AccountRequestRepository,
} from "@/modules/account-request/application/ports/account-request.repository";
import type {
  AccountDeletionRequestRecord,
  UserDataExportRequestRecord,
} from "@/modules/account-request/application/ports/account-request-read-model.types";
import {
  AccountDeletionConfirmTextInvalidError,
  AccountDeletionRequestNotCancelableError,
  DataExportIncludeSensitiveUnsupportedError,
} from "@/modules/account-request/domain/account-request.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AccountRequestApplicationService } from "./account-request-application.service";

const currentUser = {
  id: "00000000-0000-4000-8000-000000000001",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "사용자",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
} satisfies CurrentUserContext;

const exportRequestedAt = new Date("2026-08-01T00:00:00.000Z");
const deletionRequestedAt = new Date("2026-08-01T03:00:00.000Z");

// 기능 : AccountRequestApplicationService의 사용자 계정 데이터 요청 정책을 테스트합니다.
describe("AccountRequestApplicationService", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(exportRequestedAt);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates a data export request without provider raw or duplicate open request", async () => {
    const repository = createRepositoryMock();
    const createdRequest = createDataExportRecord();
    repository.findOpenDataExportRequest.mockResolvedValue(null);
    repository.createDataExportRequest.mockResolvedValue(createdRequest);
    const service = new AccountRequestApplicationService(repository);

    const result = await service.createMyDataExportRequest(currentUser, {
      includeSensitive: false,
      format: "ZIP_JSON_XLSX",
    });

    expect(repository.expireReadyDataExportRequests).toHaveBeenCalledWith(
      currentUser.id,
      exportRequestedAt
    );
    expect(repository.createDataExportRequest).toHaveBeenCalledWith({
      userId: currentUser.id,
      includeSensitive: false,
      format: "ZIP_JSON_XLSX",
      requestedAt: exportRequestedAt,
    });
    expect(result).toEqual({
      request: createdRequest,
      now: exportRequestedAt,
    });
  });

  it("returns the existing open data export request instead of creating another row", async () => {
    const repository = createRepositoryMock();
    const existingRequest = createDataExportRecord({
      id: "00000000-0000-4000-8000-000000000011",
    });
    repository.findOpenDataExportRequest.mockResolvedValue(existingRequest);
    const service = new AccountRequestApplicationService(repository);

    const result = await service.createMyDataExportRequest(currentUser, {});

    expect(repository.createDataExportRequest).not.toHaveBeenCalled();
    expect(result.request.id).toBe(existingRequest.id);
  });

  it("rejects includeSensitive export until the separate confirmation flow exists", async () => {
    const repository = createRepositoryMock();
    const service = new AccountRequestApplicationService(repository);

    await expect(
      service.createMyDataExportRequest(currentUser, {
        includeSensitive: true,
        format: "ZIP_JSON_XLSX",
      })
    ).rejects.toBeInstanceOf(DataExportIncludeSensitiveUnsupportedError);
    expect(repository.findOpenDataExportRequest).not.toHaveBeenCalled();
  });

  it("creates an account deletion request with a 30 day grace window", async () => {
    jest.setSystemTime(deletionRequestedAt);
    const repository = createRepositoryMock();
    const createdRequest = createDeletionRecord({
      requestedAt: deletionRequestedAt,
      scheduledDeletionAt: new Date("2026-08-31T03:00:00.000Z"),
      canCancelUntil: new Date("2026-08-31T03:00:00.000Z"),
    });
    repository.findOpenAccountDeletionRequest.mockResolvedValue(null);
    repository.createAccountDeletionRequest.mockResolvedValue(createdRequest);
    const service = new AccountRequestApplicationService(repository);

    const request = await service.createMyAccountDeletionRequest(currentUser, {
      confirmText: "DELETE MY ACCOUNT",
      reasonCode: "NO_LONGER_NEEDED",
      reasonMessage: " 더 이상 사용하지 않아요 ",
    });

    expect(repository.createAccountDeletionRequest).toHaveBeenCalledWith({
      userId: currentUser.id,
      reasonCode: "NO_LONGER_NEEDED",
      reasonMessage: "더 이상 사용하지 않아요",
      requestedAt: deletionRequestedAt,
      scheduledDeletionAt: new Date("2026-08-31T03:00:00.000Z"),
      canCancelUntil: new Date("2026-08-31T03:00:00.000Z"),
    });
    expect(request).toEqual(createdRequest);
  });

  it("rejects account deletion unless the dangerous confirm text matches exactly", async () => {
    const repository = createRepositoryMock();
    const service = new AccountRequestApplicationService(repository);

    await expect(
      service.createMyAccountDeletionRequest(currentUser, {
        confirmText: "delete my account",
      })
    ).rejects.toBeInstanceOf(AccountDeletionConfirmTextInvalidError);
    expect(repository.findOpenAccountDeletionRequest).not.toHaveBeenCalled();
  });

  it("cancels only an owned requested account deletion request inside grace period", async () => {
    const repository = createRepositoryMock();
    const existingRequest = createDeletionRecord();
    const cancelledRequest = createDeletionRecord({
      status: "CANCELLED",
      cancelledAt: exportRequestedAt,
    });
    repository.findAccountDeletionRequestById.mockResolvedValue(existingRequest);
    repository.cancelAccountDeletionRequest.mockResolvedValue(cancelledRequest);
    const service = new AccountRequestApplicationService(repository);

    const request = await service.cancelMyAccountDeletionRequest(
      currentUser,
      existingRequest.id
    );

    expect(repository.cancelAccountDeletionRequest).toHaveBeenCalledWith({
      userId: currentUser.id,
      requestId: existingRequest.id,
      cancelledAt: exportRequestedAt,
    });
    expect(request).toEqual(cancelledRequest);
  });

  it("maps repository cancel miss to a not cancelable account deletion error", async () => {
    const repository = createRepositoryMock();
    const existingRequest = createDeletionRecord();
    repository.findAccountDeletionRequestById.mockResolvedValue(existingRequest);
    repository.cancelAccountDeletionRequest.mockResolvedValue(null);
    const service = new AccountRequestApplicationService(repository);

    await expect(
      service.cancelMyAccountDeletionRequest(currentUser, existingRequest.id)
    ).rejects.toBeInstanceOf(AccountDeletionRequestNotCancelableError);
  });
});

// 기능 : 테스트용 AccountRequestRepository mock을 생성합니다.
function createRepositoryMock(): jest.Mocked<AccountRequestRepository> {
  const repository = {
    expireReadyDataExportRequests: jest.fn(),
    findOpenDataExportRequest: jest.fn(),
    createDataExportRequest: jest.fn(),
    findDataExportRequestById: jest.fn(),
    findOpenAccountDeletionRequest: jest.fn(),
    createAccountDeletionRequest: jest.fn(),
    findAccountDeletionRequestById: jest.fn(),
    cancelAccountDeletionRequest: jest.fn(),
    runInTransaction: jest.fn(),
  } as unknown as jest.Mocked<AccountRequestRepository>;

  repository.runInTransaction.mockImplementation(
    async (work: (repository: AccountRequestRepository) => Promise<unknown>) =>
      work(repository)
  );

  return repository;
}

// 기능 : 사용자 데이터 export 요청 테스트 record를 생성합니다.
function createDataExportRecord(
  overrides: Partial<UserDataExportRequestRecord> = {}
): UserDataExportRequestRecord {
  return {
    id: "00000000-0000-4000-8000-000000000010",
    userId: currentUser.id,
    status: "REQUESTED",
    includeSensitive: false,
    format: "ZIP_JSON_XLSX",
    artifactPath: null,
    requestedAt: exportRequestedAt,
    expiresAt: null,
    ...overrides,
  };
}

// 기능 : 계정 삭제 요청 테스트 record를 생성합니다.
function createDeletionRecord(
  overrides: Partial<AccountDeletionRequestRecord> = {}
): AccountDeletionRequestRecord {
  return {
    id: "00000000-0000-4000-8000-000000000020",
    userId: currentUser.id,
    status: "REQUESTED",
    reasonCode: "NO_LONGER_NEEDED",
    requestedAt: exportRequestedAt,
    scheduledDeletionAt: new Date("2026-08-31T00:00:00.000Z"),
    canCancelUntil: new Date("2026-08-31T00:00:00.000Z"),
    cancelledAt: null,
    ...overrides,
  };
}
