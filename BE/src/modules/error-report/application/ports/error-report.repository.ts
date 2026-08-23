import type { CurrentUserRole } from "@/shared/application/context/current-user.context";

export const ERROR_REPORT_REPOSITORY = Symbol("ERROR_REPORT_REPOSITORY");

// 역할 : ErrorReportUserSnapshot 에러 신고 저장 시점의 사용자 snapshot을 정의합니다.
export interface ErrorReportUserSnapshot {
  readonly id: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly role: CurrentUserRole;
}

// 역할 : ErrorReportScreenshotMetadata 저장된 screenshot metadata를 정의합니다.
export interface ErrorReportScreenshotMetadata {
  readonly checksum: string;
  readonly fileName: string;
  readonly mimeType: "image/png";
  readonly sizeBytes: number;
  readonly storageProvider: string;
  readonly storageBucket: string;
  readonly storageKey: string;
}

// 역할 : CreateErrorReportInput 에러 신고 row 생성에 필요한 값을 정의합니다.
export interface CreateErrorReportInput {
  readonly user: ErrorReportUserSnapshot;
  readonly description: string;
  readonly pageUrl: string;
  readonly userAgent: string | null;
  readonly requestId: string | null;
  readonly screenshot: ErrorReportScreenshotMetadata | null;
}

// 역할 : ErrorReportRecord 에러 신고 저장 결과 record를 정의합니다.
export interface ErrorReportRecord {
  readonly id: string;
}

// 역할 : ErrorReportRepository 에러 신고 영속성 계약을 정의합니다.
export interface ErrorReportRepository {
  // 기능 : 인증 사용자 ID로 에러 신고 저장용 사용자 snapshot을 조회합니다.
  findUserSnapshotById(userId: string): Promise<ErrorReportUserSnapshot | null>;
  // 기능 : 에러 신고 row와 선택 screenshot metadata를 저장합니다.
  createErrorReport(input: CreateErrorReportInput): Promise<ErrorReportRecord>;
}
