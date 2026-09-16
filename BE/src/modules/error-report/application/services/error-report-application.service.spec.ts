import { Buffer } from "node:buffer";
import type {
  ErrorReportRepository,
  ErrorReportUserSnapshot,
} from "@/modules/error-report/application/ports/error-report.repository";
import type { ErrorReportScreenshotStorage } from "@/modules/error-report/application/ports/error-report-screenshot-storage.port";
import { ErrorReportApplicationService } from "@/modules/error-report/application/services/error-report-application.service";
import {
  ErrorReportScreenshotStorageFailedError,
  ErrorReportValidationError,
} from "@/modules/error-report/domain/error-report.errors";
import type { UserQuery } from "@/modules/user/application/ports/user-query.port";
import type { ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  platformRole: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const USER_SNAPSHOT: ErrorReportUserSnapshot = {
  id: CURRENT_USER.id,
  email: "snapshot@example.com",
  displayName: "Snapshot User",
  platformRole: "USER",
};

// 기능 : ErrorReportApplicationService 테스트용 fixture를 생성합니다.
function createFixture() {
  // 1. 이후 단계에서 사용할 repository 값을 준비한다.
  const repository: jest.Mocked<ErrorReportRepository> = {
    createErrorReport: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000301",
    }),
  };
  // 2. 이후 단계에서 사용할 screenshotStorage 값을 준비한다.
  const screenshotStorage: jest.Mocked<ErrorReportScreenshotStorage> = {
    store: jest.fn().mockResolvedValue({
      checksum: "sha256-checksum",
      fileName: "20260823_120000_00000000-0000-4000-8000-000000000401.png",
      storageBucket: "error-reports",
      storageKey:
        "error-reports/00000000-0000-4000-8000-000000000101/2026/08/23/file.png",
      storageProvider: "SUPABASE",
    }),
  };
  // 3. 이후 단계에서 사용할 logger 값을 준비한다.
  const userQuery: jest.Mocked<UserQuery> = {
    findUserSnapshotById: jest.fn().mockResolvedValue(USER_SNAPSHOT),
    existsActiveUserByEmail: jest.fn().mockResolvedValue(true),
  };
  // 4. 이후 단계에서 사용할 logger 값을 준비한다.
  const logger: jest.Mocked<ApplicationLogger> = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  };

  // 4. 계산된 결과를 호출자에게 반환한다.
  return {
    repository,
    screenshotStorage,
    userQuery,
    service: new ErrorReportApplicationService(
      repository,
      screenshotStorage,
      userQuery,
      logger
    ),
  };
}

// 기능 : 에러 신고 접수 use case 검증을 수행합니다.
describe("ErrorReportApplicationService", () => {
  // 1. 필요한 비동기 작업을 실행한다.
  it("rejects blank descriptions after trimming whitespace", async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.createErrorReport({
        currentUser: CURRENT_USER,
        description: "   ",
        pageUrl: "http://localhost:5173/app",
        requestId: "request-1",
        screenshotFile: null,
        userAgent: "playwright",
      })
    ).rejects.toMatchObject({
      code: "ERROR_REPORT_DESCRIPTION_REQUIRED",
    } satisfies Partial<ErrorReportValidationError>);

    expect(fixture.repository.createErrorReport).not.toHaveBeenCalled();
  });

  // 2. 필요한 비동기 작업을 실행한다.
  it("accepts a one-character description", async () => {
    const fixture = createFixture();

    await fixture.service.createErrorReport({
      currentUser: CURRENT_USER,
      description: "앗",
      pageUrl: "http://localhost:5173/app",
      requestId: "request-short-1",
      screenshotFile: null,
      userAgent: "playwright",
    });

    expect(fixture.repository.createErrorReport).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "앗",
      })
    );
  });

  // 3. 필요한 비동기 작업을 실행한다.
  it("creates an error report without screenshot", async () => {
    // 1. 이후 단계에서 사용할 fixture 값을 준비한다.
    const fixture = createFixture();

    // 2. 비동기 결과를 받아 response에 저장한다.
    const response = await fixture.service.createErrorReport({
      currentUser: CURRENT_USER,
      description: "계정 화면에서 저장 버튼을 누르면 멈춰요.",
      pageUrl: "http://localhost:5173/app",
      requestId: "request-1",
      screenshotFile: null,
      userAgent: "playwright",
    });

    // 3. 테스트 기대 조건을 검증한다.
    expect(fixture.userQuery.findUserSnapshotById).toHaveBeenCalledWith(
      CURRENT_USER.id
    );
    // 4. 테스트 기대 조건을 검증한다.
    expect(fixture.screenshotStorage.store).not.toHaveBeenCalled();
    // 5. 테스트 기대 조건을 검증한다.
    expect(fixture.repository.createErrorReport).toHaveBeenCalledWith({
      user: USER_SNAPSHOT,
        description: "계정 화면에서 저장 버튼을 누르면 멈춰요.",
      pageUrl: "http://localhost:5173/app",
      requestId: "request-1",
      screenshot: null,
      userAgent: "playwright",
    });
    // 6. 테스트 기대 조건을 검증한다.
    expect(response).toEqual({
      id: "00000000-0000-4000-8000-000000000301",
      message: "문제를 빠르게 해결할게요.",
    });
  });

  // 4. 필요한 비동기 작업을 실행한다.
  it("stores png screenshot metadata when user includes screenshot", async () => {
    // 1. 이후 단계에서 사용할 fixture 값을 준비한다.
    const fixture = createFixture();
    // 2. 이후 단계에서 사용할 screenshotBuffer 값을 준비한다.
    const screenshotBuffer = Buffer.from("png");

    // 3. 필요한 비동기 작업을 실행한다.
    await fixture.service.createErrorReport({
      currentUser: CURRENT_USER,
      description: "홈 화면에서 카드가 겹쳐 보이고 버튼이 눌리지 않아요.",
      pageUrl: "http://localhost:5173/app",
      requestId: "request-2",
      screenshotFile: {
        buffer: screenshotBuffer,
        mimetype: "image/png",
        originalname: "screen.png",
        size: screenshotBuffer.byteLength,
      },
      userAgent: "playwright",
    });

    // 4. 테스트 기대 조건을 검증한다.
    expect(fixture.screenshotStorage.store).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      buffer: screenshotBuffer,
      capturedAt: expect.any(Date),
      mimeType: "image/png",
    });
    // 5. 테스트 기대 조건을 검증한다.
    expect(fixture.repository.createErrorReport).toHaveBeenCalledWith(
      expect.objectContaining({
        screenshot: {
          checksum: "sha256-checksum",
          fileName: "20260823_120000_00000000-0000-4000-8000-000000000401.png",
          mimeType: "image/png",
          sizeBytes: screenshotBuffer.byteLength,
          storageBucket: "error-reports",
          storageKey:
            "error-reports/00000000-0000-4000-8000-000000000101/2026/08/23/file.png",
          storageProvider: "SUPABASE",
        },
      })
    );
  });

  // 5. 테스트 시나리오를 실행한다.
  it("maps screenshot storage failures to a safe retryable error", async () => {
    // 1. 이후 단계에서 사용할 fixture 값을 준비한다.
    const fixture = createFixture();
    // 2. 현재 단계에서 필요한 동작을 실행한다.
    fixture.screenshotStorage.store.mockRejectedValue(new Error("network"));

    // 3. 필요한 비동기 작업을 실행한다.
    await expect(
      fixture.service.createErrorReport({
        currentUser: CURRENT_USER,
        description: "홈 화면에서 카드가 겹쳐 보이고 버튼이 눌리지 않아요.",
        pageUrl: "http://localhost:5173/app",
        requestId: "request-3",
        screenshotFile: {
          buffer: Buffer.from("png"),
          mimetype: "image/png",
          originalname: "screen.png",
          size: 3,
        },
        userAgent: "playwright",
      })
    ).rejects.toBeInstanceOf(ErrorReportScreenshotStorageFailedError);

    // 4. 테스트 기대 조건을 검증한다.
    expect(fixture.repository.createErrorReport).not.toHaveBeenCalled();
  });
});
