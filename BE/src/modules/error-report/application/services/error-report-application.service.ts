import type { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import {
  ERROR_REPORT_REPOSITORY,
  type CreateErrorReportInput,
  type ErrorReportRepository,
  type ErrorReportScreenshotMetadata,
} from "@/modules/error-report/application/ports/error-report.repository";
import {
  ERROR_REPORT_SCREENSHOT_STORAGE,
  type ErrorReportScreenshotStorage,
} from "@/modules/error-report/application/ports/error-report-screenshot-storage.port";
import {
  ErrorReportScreenshotStorageFailedError,
  ErrorReportUserNotFoundError,
  ErrorReportValidationError,
} from "@/modules/error-report/domain/error-report.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const MAX_ERROR_REPORT_PAGE_URL_LENGTH = 2000;
const MAX_ERROR_REPORT_SCREENSHOT_SIZE_BYTES = 10 * 1024 * 1024;
const ERROR_REPORT_SCREENSHOT_MIME_TYPE = "image/png";
const ERROR_REPORT_RECEIVED_MESSAGE = "문제를 빠르게 해결할게요.";

// 역할 : UploadedErrorReportScreenshotFile HTTP 업로드 screenshot 파일 정보를 정의합니다.
export interface UploadedErrorReportScreenshotFile {
  readonly buffer: Buffer;
  readonly mimetype: string;
  readonly originalname: string;
  readonly size: number;
}

// 역할 : CreateErrorReportCommand 에러 신고 접수 요청을 application 계층에 전달합니다.
export interface CreateErrorReportCommand {
  readonly currentUser: CurrentUserContext;
  readonly description: string | undefined;
  readonly pageUrl: string | undefined;
  readonly requestId: string | null;
  readonly screenshotFile?: UploadedErrorReportScreenshotFile | null;
  readonly userAgent: string | null;
}

// 역할 : CreateErrorReportResponse 에러 신고 접수 성공 응답을 정의합니다.
export interface CreateErrorReportResponse {
  readonly id: string;
  readonly message: string;
}

// 역할 : ErrorReportApplicationService 에러 신고 접수 use case를 제공합니다.
@Injectable()
export class ErrorReportApplicationService {
  // 기능 : 에러 신고 저장소, screenshot 저장소, logger를 주입받습니다.
  constructor(
    @Inject(ERROR_REPORT_REPOSITORY)
    private readonly errorReportRepository: ErrorReportRepository,
    @Inject(ERROR_REPORT_SCREENSHOT_STORAGE)
    private readonly screenshotStorage: ErrorReportScreenshotStorage,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 에러 신고 입력을 검증하고 사용자 snapshot, optional screenshot과 함께 저장합니다.
  async createErrorReport(
    command: CreateErrorReportCommand
  ): Promise<CreateErrorReportResponse> {
    // 1. 사용자 입력 field를 도메인 계약에 맞게 정규화하고 검증한다.
    const description = this.normalizeDescription(command.description);
    const pageUrl = this.normalizePageUrl(command.pageUrl);

    // 2. 인증 context의 사용자 ID로 DB 사용자 snapshot을 다시 조회한다.
    const userSnapshot =
      await this.errorReportRepository.findUserSnapshotById(
        command.currentUser.id
      );

    if (!userSnapshot) {
      throw new ErrorReportUserNotFoundError();
    }

    // 3. screenshot이 있으면 타입과 크기를 검증한 뒤 외부 storage에 저장한다.
    const screenshot = await this.storeScreenshotIfPresent(
      userSnapshot.id,
      command.screenshotFile
    );

    // 4. 사용자 snapshot과 screenshot metadata를 에러 신고 row로 저장한다.
    const created = await this.errorReportRepository.createErrorReport({
      user: userSnapshot,
      description,
      pageUrl,
      userAgent: this.normalizeOptionalText(command.userAgent),
      requestId: this.normalizeOptionalText(command.requestId),
      screenshot,
    } satisfies CreateErrorReportInput);

    // 5. 원문 description 없이 안전한 접수 이벤트만 구조화 로그로 남긴다.
    this.logEvent("errorReport.created", {
      userId: userSnapshot.id,
      reportId: created.id,
      requestId: command.requestId,
      screenshotIncluded: screenshot !== null,
    });

    return {
      id: created.id,
      message: ERROR_REPORT_RECEIVED_MESSAGE,
    };
  }

  // 기능 : 에러 신고 내용을 trim하고 필수/길이 조건을 검증합니다.
  private normalizeDescription(value: string | undefined): string {
    const normalized = value?.trim() ?? "";
    if (normalized.length === 0) {
      throw new ErrorReportValidationError(
        "ERROR_REPORT_DESCRIPTION_REQUIRED",
        "description",
        "에러 내용을 입력해 주세요."
      );
    }

    return normalized;
  }

  // 기능 : 현재 화면 주소를 trim하고 필수/길이 조건을 검증합니다.
  private normalizePageUrl(value: string | undefined): string {
    const normalized = value?.trim() ?? "";

    if (normalized.length === 0) {
      throw new ErrorReportValidationError(
        "ERROR_REPORT_PAGE_URL_REQUIRED",
        "pageUrl",
        "현재 화면 주소를 확인하지 못했어요."
      );
    }

    if (Array.from(normalized).length > MAX_ERROR_REPORT_PAGE_URL_LENGTH) {
      throw new ErrorReportValidationError(
        "ERROR_REPORT_PAGE_URL_TOO_LONG",
        "pageUrl",
        "현재 화면 주소가 너무 길어요."
      );
    }

    return normalized;
  }

  // 기능 : 선택 screenshot 파일을 검증하고 storage metadata로 변환합니다.
  private async storeScreenshotIfPresent(
    userId: string,
    file: UploadedErrorReportScreenshotFile | null | undefined
  ): Promise<ErrorReportScreenshotMetadata | null> {
    if (!file) {
      return null;
    }

    this.assertScreenshotFile(file);

    try {
      const stored = await this.screenshotStorage.store({
        userId,
        buffer: file.buffer,
        mimeType: ERROR_REPORT_SCREENSHOT_MIME_TYPE,
        capturedAt: new Date(),
      });

      return {
        checksum: stored.checksum,
        fileName: stored.fileName,
        mimeType: ERROR_REPORT_SCREENSHOT_MIME_TYPE,
        sizeBytes: file.size,
        storageProvider: stored.storageProvider,
        storageBucket: stored.storageBucket,
        storageKey: stored.storageKey,
      };
    } catch (error) {
      this.logStorageFailure(userId, error);
      throw new ErrorReportScreenshotStorageFailedError();
    }
  }

  // 기능 : screenshot 파일 MIME type과 크기를 검증합니다.
  private assertScreenshotFile(file: UploadedErrorReportScreenshotFile): void {
    if (file.mimetype !== ERROR_REPORT_SCREENSHOT_MIME_TYPE) {
      throw new ErrorReportValidationError(
        "ERROR_REPORT_SCREENSHOT_TYPE_UNSUPPORTED",
        "screenshot",
        "PNG 스크린샷만 첨부할 수 있어요."
      );
    }

    if (file.size > MAX_ERROR_REPORT_SCREENSHOT_SIZE_BYTES) {
      throw new ErrorReportValidationError(
        "ERROR_REPORT_SCREENSHOT_TOO_LARGE",
        "screenshot",
        "10MB 이하 스크린샷만 첨부할 수 있어요."
      );
    }
  }

  // 기능 : 선택 텍스트 값을 저장 가능한 문자열 또는 null로 정규화합니다.
  private normalizeOptionalText(value: string | null | undefined): string | null {
    const normalized = value?.trim();

    return normalized && normalized.length > 0 ? normalized : null;
  }

  // 기능 : storage 실패를 원문 파일/secret 없이 안전한 구조화 로그로 남깁니다.
  private logStorageFailure(userId: string, error: unknown): void {
    this.logger.error(
      JSON.stringify({
        event: "errorReport.screenshotStorageFailed",
        userId,
        errorName: error instanceof Error ? error.name : "UnknownError",
      }),
      "ErrorReportScreenshotStorageFailed",
      "ErrorReportApplicationService"
    );
  }

  // 기능 : 에러 신고 처리 이벤트를 원문 없이 구조화 로그로 남깁니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "ErrorReportApplicationService"
    );
  }
}
