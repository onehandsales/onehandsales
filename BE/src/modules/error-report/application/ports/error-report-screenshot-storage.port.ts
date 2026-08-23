import type { Buffer } from "node:buffer";

export const ERROR_REPORT_SCREENSHOT_STORAGE = Symbol(
  "ERROR_REPORT_SCREENSHOT_STORAGE"
);

// 역할 : StoreErrorReportScreenshotInput 에러 신고 screenshot 저장 요청 값을 정의합니다.
export interface StoreErrorReportScreenshotInput {
  readonly userId: string;
  readonly buffer: Buffer;
  readonly mimeType: "image/png";
  readonly capturedAt: Date;
}

// 역할 : StoredErrorReportScreenshotReference DB metadata에 저장할 screenshot 참조 값을 정의합니다.
export interface StoredErrorReportScreenshotReference {
  readonly checksum: string;
  readonly fileName: string;
  readonly storageProvider: string;
  readonly storageBucket: string;
  readonly storageKey: string;
}

// 역할 : ErrorReportScreenshotStorage 에러 신고 screenshot binary 저장소 계약을 정의합니다.
export interface ErrorReportScreenshotStorage {
  // 기능 : screenshot 파일을 저장하고 DB metadata용 참조 정보를 반환합니다.
  store(
    input: StoreErrorReportScreenshotInput
  ): Promise<StoredErrorReportScreenshotReference>;
}
