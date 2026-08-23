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
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const USER_SNAPSHOT: ErrorReportUserSnapshot = {
  id: CURRENT_USER.id,
  email: "snapshot@example.com",
  displayName: "Snapshot User",
  role: "USER",
};

// 기능 : ErrorReportApplicationService 테스트용 fixture를 생성합니다.
function createFixture() {
  const repository: jest.Mocked<ErrorReportRepository> = {
    createErrorReport: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000301",
    }),
    findUserSnapshotById: jest.fn().mockResolvedValue(USER_SNAPSHOT),
  };
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
  const logger: Pick<AppLogger, "error" | "log"> = {
    error: jest.fn(),
    log: jest.fn(),
  };

  return {
    repository,
    screenshotStorage,
    service: new ErrorReportApplicationService(
      repository,
      screenshotStorage,
      logger as AppLogger
    ),
  };
}

// 기능 : 에러 신고 접수 use case 검증을 수행합니다.
describe("ErrorReportApplicationService", () => {
  it("rejects descriptions shorter than 10 characters", async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.createErrorReport({
        currentUser: CURRENT_USER,
        description: "짧아요",
        pageUrl: "http://localhost:5173/app",
        requestId: "request-1",
        screenshotFile: null,
        userAgent: "playwright",
      })
    ).rejects.toMatchObject({
      code: "ERROR_REPORT_DESCRIPTION_TOO_SHORT",
    } satisfies Partial<ErrorReportValidationError>);

    expect(fixture.repository.createErrorReport).not.toHaveBeenCalled();
  });

  it("creates an error report without screenshot", async () => {
    const fixture = createFixture();

    const response = await fixture.service.createErrorReport({
      currentUser: CURRENT_USER,
      description: "회사 상세 화면에서 저장 버튼을 누르면 멈춰요.",
      pageUrl: "http://localhost:5173/app/companies/company-1?tab=memo",
      requestId: "request-1",
      screenshotFile: null,
      userAgent: "playwright",
    });

    expect(fixture.repository.findUserSnapshotById).toHaveBeenCalledWith(
      CURRENT_USER.id
    );
    expect(fixture.screenshotStorage.store).not.toHaveBeenCalled();
    expect(fixture.repository.createErrorReport).toHaveBeenCalledWith({
      user: USER_SNAPSHOT,
      description: "회사 상세 화면에서 저장 버튼을 누르면 멈춰요.",
      pageUrl: "http://localhost:5173/app/companies/company-1?tab=memo",
      requestId: "request-1",
      screenshot: null,
      userAgent: "playwright",
    });
    expect(response).toEqual({
      id: "00000000-0000-4000-8000-000000000301",
      message: "신고가 접수되었어요. 문제를 빠르게 해결할게요.",
    });
  });

  it("stores png screenshot metadata when user includes screenshot", async () => {
    const fixture = createFixture();
    const screenshotBuffer = Buffer.from("png");

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

    expect(fixture.screenshotStorage.store).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      buffer: screenshotBuffer,
      capturedAt: expect.any(Date),
      mimeType: "image/png",
    });
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

  it("maps screenshot storage failures to a safe retryable error", async () => {
    const fixture = createFixture();
    fixture.screenshotStorage.store.mockRejectedValue(new Error("network"));

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

    expect(fixture.repository.createErrorReport).not.toHaveBeenCalled();
  });
});
