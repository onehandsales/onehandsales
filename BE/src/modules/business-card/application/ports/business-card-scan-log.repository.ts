export const BUSINESS_CARD_SCAN_LOG_REPOSITORY = Symbol(
  "BUSINESS_CARD_SCAN_LOG_REPOSITORY"
);

export const BusinessCardScanStatusValue = {
  OCR_SUCCESS: "OCR_SUCCESS",
  OCR_FAILED: "OCR_FAILED",
  CONFIRMED: "CONFIRMED",
} as const;

export type BusinessCardScanStatusValue =
  (typeof BusinessCardScanStatusValue)[keyof typeof BusinessCardScanStatusValue];

export const BusinessCardResolutionValue = {
  EXISTING: "EXISTING",
  CREATED: "CREATED",
} as const;

export type BusinessCardResolutionValue =
  (typeof BusinessCardResolutionValue)[keyof typeof BusinessCardResolutionValue];

// 역할 : BusinessCardExtractedRecord 명함 OCR 결과와 사용자 보정 값을 저장하는 필드 집합입니다.
export interface BusinessCardExtractedRecord {
  readonly companyName: string | null;
  readonly companyFieldName: string | null;
  readonly companyRegionName: string | null;
  readonly contactName: string | null;
  readonly contactMobile: string | null;
  readonly contactEmail: string | null;
  readonly contactDepartmentName: string | null;
  readonly contactJobGradeName: string | null;
}

// 역할 : BusinessCardUsageRecord AI 사용량 분석용 필드 집합입니다.
export interface BusinessCardUsageRecord {
  readonly requestToken: number | null;
  readonly responseToken: number | null;
  readonly totalToken: number | null;
  readonly requestCost: number | null;
  readonly responseCost: number | null;
  readonly totalCost: number | null;
  readonly costCurrency: string;
  readonly pendingTimeMs: number | null;
}

// 역할 : BusinessCardScanLogRecord 명함 스캔 로그 단건 레코드를 정의합니다.
export interface BusinessCardScanLogRecord
  extends BusinessCardExtractedRecord,
    BusinessCardUsageRecord {
  readonly id: string;
  readonly userId: string;
  readonly status: BusinessCardScanStatusValue;
  readonly companyId: string | null;
  readonly contactId: string | null;
  readonly companyResolution: BusinessCardResolutionValue | null;
  readonly contactResolution: BusinessCardResolutionValue | null;
  readonly aiProvider: string;
  readonly aiModel: string;
  readonly promptSnapshot: string;
  readonly confirmedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : BusinessCardScanLogPageRecord 목록 조회 결과와 전체 개수를 정의합니다.
export interface BusinessCardScanLogPageRecord {
  readonly items: BusinessCardScanLogRecord[];
  readonly totalCount: number;
}

// 역할 : CreateBusinessCardScanLogInput OCR 요청 직후 남기는 로그 입력을 정의합니다.
export interface CreateBusinessCardScanLogInput
  extends BusinessCardExtractedRecord,
    BusinessCardUsageRecord {
  readonly userId: string;
  readonly status:
    | typeof BusinessCardScanStatusValue.OCR_SUCCESS
    | typeof BusinessCardScanStatusValue.OCR_FAILED;
  readonly aiProvider: string;
  readonly aiModel: string;
  readonly promptSnapshot: string;
}

// 역할 : ListBusinessCardScanLogsInput 목록 조회 조건을 정의합니다.
export interface ListBusinessCardScanLogsInput {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly status?: BusinessCardScanStatusValue;
}

// 역할 : ConfirmBusinessCardScanInput 사용자 보정 후 회사/담당자를 확정 저장하는 입력을 정의합니다.
export interface ConfirmBusinessCardScanInput extends BusinessCardExtractedRecord {
  readonly userId: string;
  readonly scanLogId: string;
  readonly confirmedAt: Date;
}

// 역할 : BusinessCardConfirmResult 회사/담당자 생성 또는 재사용 결과를 정의합니다.
export interface BusinessCardConfirmResult {
  readonly scanLog: BusinessCardScanLogRecord;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
    readonly resolution: BusinessCardResolutionValue;
  };
  readonly contact: {
    readonly id: string;
    readonly username: string;
    readonly resolution: BusinessCardResolutionValue;
  };
}

export type BusinessCardConfirmRepositoryResult =
  | { readonly type: "notFound" }
  | {
      readonly type: "notConfirmable";
      readonly scanLog: BusinessCardScanLogRecord;
    }
  | {
      readonly type: "confirmed";
      readonly result: BusinessCardConfirmResult;
    };

// 역할 : BusinessCardScanLogRepository 명함 OCR 로그와 확정 저장의 영속성 계약을 정의합니다.
export interface BusinessCardScanLogRepository {
  createScanLog(
    input: CreateBusinessCardScanLogInput
  ): Promise<BusinessCardScanLogRecord>;
  listScanLogs(
    input: ListBusinessCardScanLogsInput
  ): Promise<BusinessCardScanLogPageRecord>;
  findScanLog(
    userId: string,
    scanLogId: string
  ): Promise<BusinessCardScanLogRecord | null>;
  confirmScanLog(
    input: ConfirmBusinessCardScanInput
  ): Promise<BusinessCardConfirmRepositoryResult>;
}
