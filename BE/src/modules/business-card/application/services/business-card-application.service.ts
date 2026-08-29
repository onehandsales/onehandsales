import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import {
  BUSINESS_CARD_OCR_PROVIDER,
  type BusinessCardExtractedFields,
  type BusinessCardOcrImageFile,
  type BusinessCardOcrProvider,
  type BusinessCardOcrProviderMetadata,
  type BusinessCardOcrUsage,
} from "@/modules/business-card/application/ports/business-card-ocr.provider";
import {
  BusinessCardResolutionValue,
  BusinessCardSafeFailureCodeValue,
  type BusinessCardSafeFailureCodeValue as BusinessCardSafeFailureCode,
  BusinessCardScanStatusValue,
  type BusinessCardScanStatusValue as BusinessCardScanStatus,
} from "@/modules/business-card/application/ports/business-card-scan-log.types";
import {
  BUSINESS_CARD_SCAN_LOG_REPOSITORY,
  type BusinessCardConfirmResult,
  type BusinessCardExtractedRecord,
  type BusinessCardScanLogRecord,
  type BusinessCardScanLogRepository,
  type BusinessCardUsageRecord,
} from "@/modules/business-card/application/ports/business-card-scan-log.repository";
import {
  NOOP_PRODUCT_ANALYTICS_EVENT_RECORDER,
  PRODUCT_ANALYTICS_EVENT_RECORDER,
  type ProductAnalyticsServerEventRecorder,
  type RecordProductAnalyticsServerEventCommand,
  recordProductAnalyticsServerEventBestEffort,
} from "@/modules/analytics/application/services/product-analytics-event-recorder";
import {
  BusinessCardImageValidationError,
  BusinessCardScanLogNotFoundError,
  BusinessCardScanNotConfirmableError,
} from "@/modules/business-card/domain/business-card.errors";
import { normalizeLegacyContactPhone } from "@/modules/contact/application/services/contact-phone-normalizer";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const BUSINESS_CARD_SCAN_PAGE_SIZE = 15;
const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const BUSINESS_CARD_UNKNOWN_FAILURE_MESSAGE =
  "명함을 읽지 못했어요. 다시 찍거나 파일을 바꿔 주세요.";
const BUSINESS_CARD_SAFE_FAILURE_MESSAGES: Record<
  BusinessCardSafeFailureCode,
  string
> = {
  IMAGE_QUALITY_LOW:
    "사진이 흐려서 내용을 읽기 어려워요. 밝은 곳에서 다시 찍어 주세요.",
  OCR_PARSE_FAILED: BUSINESS_CARD_UNKNOWN_FAILURE_MESSAGE,
  OCR_PROVIDER_UNAVAILABLE:
    "지금은 명함을 읽기 어려워요. 잠시 후 다시 시도해 주세요.",
  OCR_RATE_LIMITED: "요청이 많아요. 잠시 후 다시 시도해 주세요.",
  OCR_UNKNOWN_FAILED: BUSINESS_CARD_UNKNOWN_FAILURE_MESSAGE,
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_COMPANY_FIELD_NAME = "미분류";
const DEFAULT_COMPANY_REGION_NAME = "미지정";
const DEFAULT_CONTACT_DEPARTMENT_NAME = "미지정";
const DEFAULT_CONTACT_JOB_GRADE_NAME = "미지정";

interface BusinessCardSafeFailure {
  readonly errorCode: BusinessCardSafeFailureCode;
  readonly userMessage: string;
  readonly retryable: boolean;
}

// 역할 : BusinessCardScanQueryInput 명함 스캔 목록 조회 조건을 정의합니다.
export interface BusinessCardScanQueryInput {
  readonly page?: number;
  readonly status?: string | string[];
}

// 역할 : UploadedBusinessCardImageFile HTTP 업로드 파일에서 필요한 필드를 정의합니다.
export interface UploadedBusinessCardImageFile {
  readonly buffer: Buffer;
  readonly originalname: string;
  readonly mimetype: string;
  readonly size: number;
}

// 역할 : ConfirmBusinessCardScanCommand 사용자가 보정한 명함 저장 입력을 정의합니다.
export interface ConfirmBusinessCardScanCommand {
  readonly companyName: string;
  readonly companyFieldName?: string | null;
  readonly companyRegionName?: string | null;
  readonly contactName: string;
  readonly contactMobile: string;
  readonly contactEmail: string;
  readonly contactDepartmentName?: string | null;
  readonly contactJobGradeName?: string | null;
}

// 역할 : BusinessCardExtractedResponse 화면에 보여줄 OCR/보정 필드 응답을 정의합니다.
export interface BusinessCardExtractedResponse {
  readonly companyName: string | null;
  readonly companyFieldName: string | null;
  readonly companyRegionName: string | null;
  readonly contactName: string | null;
  readonly contactMobile: string | null;
  readonly contactEmail: string | null;
  readonly contactDepartmentName: string | null;
  readonly contactJobGradeName: string | null;
}

// 역할 : BusinessCardUsageResponse 내부 분석용 AI 사용량 응답을 정의합니다.
export interface BusinessCardUsageResponse {
  readonly requestToken: number | null;
  readonly responseToken: number | null;
  readonly totalToken: number | null;
  readonly requestCost: number | null;
  readonly responseCost: number | null;
  readonly totalCost: number | null;
  readonly costCurrency: string;
  readonly pendingTimeMs: number | null;
}

// 역할 : BusinessCardFailureResponse 명함 OCR 실패 시 사용자에게 노출 가능한 안전 응답을 정의합니다.
export interface BusinessCardFailureResponse {
  readonly errorCode: BusinessCardSafeFailureCode;
  readonly userMessage: string;
  readonly retryable: boolean;
}

// 역할 : BusinessCardScanLogResponse 명함 스캔 로그 API 응답을 정의합니다.
export interface BusinessCardScanLogResponse {
  readonly id: string;
  readonly status: BusinessCardScanStatus;
  readonly extracted: BusinessCardExtractedResponse;
  readonly linked: {
    readonly companyId: string | null;
    readonly contactId: string | null;
    readonly companyResolution: string | null;
    readonly contactResolution: string | null;
    readonly confirmedAt: string | null;
  };
  readonly ai: {
    readonly provider: string;
    readonly model: string;
  };
  readonly usage: BusinessCardUsageResponse;
  readonly failure: BusinessCardFailureResponse | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : BusinessCardScanLogPageResponse 명함 스캔 로그 목록 응답을 정의합니다.
export interface BusinessCardScanLogPageResponse {
  readonly items: BusinessCardScanLogResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

// 역할 : ConfirmBusinessCardScanResponse 명함 확정 저장 결과를 정의합니다.
export interface ConfirmBusinessCardScanResponse {
  readonly scanLog: BusinessCardScanLogResponse;
  readonly company: BusinessCardConfirmResult["company"];
  readonly contact: BusinessCardConfirmResult["contact"];
}

// 역할 : BusinessCardApplicationService 명함 OCR 및 확정 저장 use case를 제공합니다.
@Injectable()
export class BusinessCardApplicationService {
  constructor(
    @Inject(BUSINESS_CARD_SCAN_LOG_REPOSITORY)
    private readonly scanLogRepository: BusinessCardScanLogRepository,
    @Inject(BUSINESS_CARD_OCR_PROVIDER)
    private readonly ocrProvider: BusinessCardOcrProvider,
    private readonly logger: AppLogger,
    @Inject(PRODUCT_ANALYTICS_EVENT_RECORDER)
    private readonly productAnalyticsEventRecorder: ProductAnalyticsServerEventRecorder = NOOP_PRODUCT_ANALYTICS_EVENT_RECORDER
  ) {}

  async scanBusinessCard(
    currentUser: CurrentUserContext,
    imageFile: UploadedBusinessCardImageFile | undefined,
    requestId: string | null = null
  ): Promise<BusinessCardScanLogResponse> {
    const normalizedImageFile = this.normalizeImageFile(imageFile);
    const metadata = this.ocrProvider.getMetadata();
    const startedAt = Date.now();

    try {
      const ocrResult = await this.ocrProvider.extract({
        imageFile: normalizedImageFile,
      });
      const extracted = this.normalizeExtractedFields(ocrResult.extracted);

      if (this.isEmptyExtractedFields(extracted)) {
        return this.createFailedScanLogResponse({
          currentUser,
          imageFile: normalizedImageFile,
          metadata,
          requestId,
          safeFailure: this.createSafeFailure(
            BusinessCardSafeFailureCodeValue.IMAGE_QUALITY_LOW
          ),
          startedAt,
          usage: ocrResult.usage,
        });
      }

      const scanLog = await this.scanLogRepository.createScanLog({
        userId: currentUser.id,
        status: BusinessCardScanStatusValue.OCR_SUCCESS,
        ...extracted,
        ...this.toUsageRecord(ocrResult.usage, metadata, startedAt),
        aiProvider: metadata.aiProvider,
        aiModel: metadata.aiModel,
        promptSnapshot: metadata.promptSnapshot,
        safeErrorCode: null,
        safeErrorMessage: null,
        retryable: false,
      });

      this.logEvent("businessCard.ocrSucceeded", {
        userId: currentUser.id,
        scanLogId: scanLog.id,
        aiModel: metadata.aiModel,
      });

      return this.toScanLogResponse(scanLog);
    } catch (error) {
      return this.createFailedScanLogResponse({
        currentUser,
        imageFile: normalizedImageFile,
        metadata,
        requestId,
        safeFailure: this.toSafeFailure(error),
        startedAt,
        usage: this.emptyUsage(),
      });
    }
  }

  async listScanLogs(
    currentUser: CurrentUserContext,
    query: BusinessCardScanQueryInput
  ): Promise<BusinessCardScanLogPageResponse> {
    const page = query.page ?? 1;
    const statuses = this.normalizeOptionalStatuses(query.status);
    const result = await this.scanLogRepository.listScanLogs({
      userId: currentUser.id,
      page,
      pageSize: BUSINESS_CARD_SCAN_PAGE_SIZE,
      ...(statuses.length > 0 ? { statuses } : {}),
    });

    return {
      items: result.items.map((item) => this.toScanLogResponse(item)),
      page,
      pageSize: BUSINESS_CARD_SCAN_PAGE_SIZE,
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / BUSINESS_CARD_SCAN_PAGE_SIZE),
    };
  }

  async getScanLog(
    currentUser: CurrentUserContext,
    scanLogId: string
  ): Promise<BusinessCardScanLogResponse> {
    const scanLog = await this.scanLogRepository.findScanLog(
      currentUser.id,
      scanLogId
    );

    if (!scanLog) {
      throw new BusinessCardScanLogNotFoundError();
    }

    return this.toScanLogResponse(scanLog);
  }

  async confirmScanLog(
    currentUser: CurrentUserContext,
    scanLogId: string,
    input: ConfirmBusinessCardScanCommand,
    requestId: string | null = null
  ): Promise<ConfirmBusinessCardScanResponse> {
    const normalizedInput = this.normalizeConfirmInput(input);
    const result = await this.scanLogRepository.confirmScanLog({
      userId: currentUser.id,
      scanLogId,
      confirmedAt: new Date(),
      ...normalizedInput,
    });

    if (result.type === "notFound") {
      throw new BusinessCardScanLogNotFoundError();
    }

    if (result.type === "notConfirmable") {
      throw new BusinessCardScanNotConfirmableError();
    }

    this.logEvent("businessCard.confirmed", {
      userId: currentUser.id,
      scanLogId,
      companyId: result.result.company.id,
      contactId: result.result.contact.id,
      companyResolution: result.result.company.resolution,
      contactResolution: result.result.contact.resolution,
    });

    // 기능 : 확정된 명함 스캔의 제품 분석 이벤트는 PII 없이 성공 사실만 기록합니다.
    await this.recordServerAnalyticsEvent({
      userId: currentUser.id,
      authSessionId: currentUser.sessionId,
      requestId,
      eventName: "business_card_scan_confirmed",
      timeZone: currentUser.timeZone,
      idempotencyKey: `business_card_scan_confirmed:${scanLogId}`,
      targetType: "BUSINESS_CARD_SCAN",
      targetId: scanLogId,
      payload: {
        companyResolution: result.result.company.resolution,
        contactResolution: result.result.contact.resolution,
        createdCompany:
          result.result.company.resolution === BusinessCardResolutionValue.CREATED,
        createdContact:
          result.result.contact.resolution === BusinessCardResolutionValue.CREATED,
      },
    });

    return {
      scanLog: this.toScanLogResponse(result.result.scanLog),
      company: result.result.company,
      contact: result.result.contact,
    };
  }

  // 기능 : OCR 실패를 safe failure 로그와 best-effort 분석 이벤트로 기록합니다.
  private async createFailedScanLogResponse(input: {
    readonly currentUser: CurrentUserContext;
    readonly imageFile: BusinessCardOcrImageFile;
    readonly metadata: BusinessCardOcrProviderMetadata;
    readonly requestId: string | null;
    readonly safeFailure: BusinessCardSafeFailure;
    readonly startedAt: number;
    readonly usage: BusinessCardOcrUsage;
  }): Promise<BusinessCardScanLogResponse> {
    const scanLog = await this.scanLogRepository.createScanLog({
      userId: input.currentUser.id,
      status: BusinessCardScanStatusValue.OCR_FAILED,
      ...this.emptyExtractedFields(),
      ...this.toUsageRecord(input.usage, input.metadata, input.startedAt),
      aiProvider: input.metadata.aiProvider,
      aiModel: input.metadata.aiModel,
      promptSnapshot: input.metadata.promptSnapshot,
      safeErrorCode: input.safeFailure.errorCode,
      safeErrorMessage: input.safeFailure.userMessage,
      retryable: input.safeFailure.retryable,
    });

    this.logProviderFailure(
      input.currentUser.id,
      scanLog.id,
      input.metadata,
      input.safeFailure
    );

    await this.recordServerAnalyticsEvent({
      userId: input.currentUser.id,
      authSessionId: input.currentUser.sessionId,
      requestId: input.requestId,
      eventName: "business_card_ocr_failed",
      timeZone: input.currentUser.timeZone,
      idempotencyKey: `business_card_ocr_failed:${scanLog.id}`,
      targetType: "BUSINESS_CARD_SCAN",
      targetId: scanLog.id,
      payload: {
        safeErrorCode: input.safeFailure.errorCode,
        retryable: input.safeFailure.retryable,
        provider: input.metadata.aiProvider,
        model: input.metadata.aiModel,
        fileSizeBucket: this.toFileSizeBucket(input.imageFile.size),
      },
    });

    return this.toScanLogResponse(scanLog);
  }

  private normalizeImageFile(
    imageFile: UploadedBusinessCardImageFile | undefined
  ): BusinessCardOcrImageFile {
    if (!imageFile) {
      throw new BusinessCardImageValidationError(
        "IMAGE_REQUIRED",
        "이미지를 선택해 주세요."
      );
    }

    if (!Buffer.isBuffer(imageFile.buffer)) {
      throw new BusinessCardImageValidationError(
        "IMAGE_REQUIRED",
        "이미지를 선택해 주세요."
      );
    }

    if (imageFile.size <= 0 || imageFile.buffer.length === 0) {
      throw new BusinessCardImageValidationError(
        "IMAGE_REQUIRED",
        "이미지를 선택해 주세요."
      );
    }

    if (imageFile.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      throw new BusinessCardImageValidationError(
        "IMAGE_TOO_LARGE",
        "10MB 이하 이미지만 올릴 수 있어요."
      );
    }

    const mimeType = imageFile.mimetype.trim().toLowerCase();

    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
      throw new BusinessCardImageValidationError(
        "IMAGE_TYPE_UNSUPPORTED",
        "JPG, PNG, WebP 이미지만 올릴 수 있어요."
      );
    }

    return {
      buffer: imageFile.buffer,
      fileName:
        imageFile.originalname.trim().length > 0
          ? imageFile.originalname.trim()
          : "business-card",
      mimeType,
      size: imageFile.size,
    };
  }

  private normalizeExtractedFields(
    extracted: BusinessCardExtractedFields
  ): BusinessCardExtractedRecord {
    return {
      companyName: this.normalizeOptionalText(extracted.companyName),
      companyFieldName: this.normalizeOptionalText(extracted.companyFieldName),
      companyRegionName: this.normalizeOptionalText(extracted.companyRegionName),
      contactName: this.normalizeOptionalText(extracted.contactName),
      contactMobile: this.normalizeMobileCandidate(extracted.contactMobile),
      contactEmail: this.normalizeEmailCandidate(extracted.contactEmail),
      contactDepartmentName: this.normalizeOptionalText(
        extracted.contactDepartmentName
      ),
      contactJobGradeName: this.normalizeOptionalText(
        extracted.contactJobGradeName
      ),
    };
  }

  // 기능 : OCR 결과가 모두 비어 있으면 사용자가 바로 보정하기 어려운 저품질 이미지로 판단합니다.
  private isEmptyExtractedFields(extracted: BusinessCardExtractedRecord): boolean {
    return Object.values(extracted).every((value) => value === null);
  }

  // 기능 : safe failure code를 사용자 안내 문구와 재시도 여부로 변환합니다.
  private createSafeFailure(
    errorCode: BusinessCardSafeFailureCode,
    retryable = true
  ): BusinessCardSafeFailure {
    return {
      errorCode,
      userMessage: BUSINESS_CARD_SAFE_FAILURE_MESSAGES[errorCode],
      retryable,
    };
  }

  // 기능 : provider 오류를 raw detail 없이 안전한 실패 코드로 축소합니다.
  private toSafeFailure(error: unknown): BusinessCardSafeFailure {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (message.includes("rate limited")) {
      return this.createSafeFailure(BusinessCardSafeFailureCodeValue.OCR_RATE_LIMITED);
    }

    if (
      message.includes("provider unavailable") ||
      message.includes("request failed") ||
      message.includes("api_key") ||
      message.includes("api key")
    ) {
      return this.createSafeFailure(
        BusinessCardSafeFailureCodeValue.OCR_PROVIDER_UNAVAILABLE
      );
    }

    if (
      message.includes("not json") ||
      message.includes("valid json") ||
      message.includes("empty") ||
      message.includes("schema")
    ) {
      return this.createSafeFailure(BusinessCardSafeFailureCodeValue.OCR_PARSE_FAILED);
    }

    return this.createSafeFailure(BusinessCardSafeFailureCodeValue.OCR_UNKNOWN_FAILED);
  }

  // 기능 : analytics payload에 원본 파일 크기 대신 안전한 bucket만 남깁니다.
  private toFileSizeBucket(size: number): string {
    const oneMb = 1024 * 1024;

    if (size <= oneMb) {
      return "0_1mb";
    }

    if (size <= oneMb * 5) {
      return "1_5mb";
    }

    if (size <= MAX_IMAGE_FILE_SIZE_BYTES) {
      return "5_10mb";
    }

    return "over_10mb";
  }

  private normalizeConfirmInput(
    input: ConfirmBusinessCardScanCommand
  ): BusinessCardExtractedRecord {
    return {
      companyName: this.normalizeRequiredText(input.companyName, "companyName"),
      companyFieldName:
        this.normalizeOptionalText(input.companyFieldName) ??
        DEFAULT_COMPANY_FIELD_NAME,
      companyRegionName:
        this.normalizeOptionalText(input.companyRegionName) ??
        DEFAULT_COMPANY_REGION_NAME,
      contactName: this.normalizeRequiredText(input.contactName, "contactName"),
      contactMobile: this.normalizeRequiredMobile(input.contactMobile),
      contactEmail: this.normalizeRequiredEmail(input.contactEmail),
      contactDepartmentName:
        this.normalizeOptionalText(input.contactDepartmentName) ??
        DEFAULT_CONTACT_DEPARTMENT_NAME,
      contactJobGradeName:
        this.normalizeOptionalText(input.contactJobGradeName) ??
        DEFAULT_CONTACT_JOB_GRADE_NAME,
    };
  }

  private normalizeRequiredText(value: unknown, fieldName: string): string {
    if (typeof value !== "string") {
      throw new ValidationDomainError(`${fieldName} must be a string`);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(`${fieldName} is required`);
    }

    return normalized;
  }

  private normalizeOptionalText(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private normalizeMobileCandidate(value: string | null): string | null {
    const normalized = this.normalizeOptionalText(value);

    if (!normalized) {
      return null;
    }

    return normalizeLegacyContactPhone(normalized)?.mobile ?? null;
  }

  private normalizeRequiredMobile(value: string): string {
    const mobile = this.normalizeMobileCandidate(value);

    if (!mobile) {
      throw new ValidationDomainError("contactMobile must be a KR or US phone");
    }

    return mobile;
  }

  private normalizeEmailCandidate(value: string | null): string | null {
    const normalized = this.normalizeOptionalText(value);

    if (!normalized) {
      return null;
    }

    const email = normalized.toLowerCase();
    return EMAIL_PATTERN.test(email) ? email : null;
  }

  private normalizeRequiredEmail(value: string): string {
    const email = this.normalizeEmailCandidate(value);

    if (!email) {
      throw new ValidationDomainError("contactEmail is invalid");
    }

    return email;
  }

  private normalizeOptionalStatuses(
    value: string | readonly string[] | undefined
  ): BusinessCardScanStatus[] {
    if (!value) {
      return [];
    }

    const values: readonly string[] = Array.isArray(value) ? value : [value];
    const statuses = values.flatMap((item) =>
      item
        .split(",")
        .map((status: string) => status.trim())
        .filter((status: string) => status.length > 0)
    );

    return [...new Set(statuses.map((status) => this.normalizeStatus(status)))];
  }

  private normalizeStatus(value: string): BusinessCardScanStatus {
    if (
      value === BusinessCardScanStatusValue.OCR_SUCCESS ||
      value === BusinessCardScanStatusValue.OCR_FAILED ||
      value === BusinessCardScanStatusValue.CONFIRMED
    ) {
      return value;
    }

    throw new ValidationDomainError("status is invalid");
  }

  private toUsageRecord(
    usage: BusinessCardOcrUsage,
    metadata: BusinessCardOcrProviderMetadata,
    startedAt: number
  ): BusinessCardUsageRecord {
    return {
      requestToken: usage.requestToken,
      responseToken: usage.responseToken,
      totalToken: usage.totalToken,
      requestCost: usage.requestCost,
      responseCost: usage.responseCost,
      totalCost: usage.totalCost,
      costCurrency: metadata.costCurrency,
      pendingTimeMs: Date.now() - startedAt,
    };
  }

  private emptyExtractedFields(): BusinessCardExtractedRecord {
    return {
      companyName: null,
      companyFieldName: null,
      companyRegionName: null,
      contactName: null,
      contactMobile: null,
      contactEmail: null,
      contactDepartmentName: null,
      contactJobGradeName: null,
    };
  }

  private emptyUsage(): BusinessCardOcrUsage {
    return {
      requestToken: null,
      responseToken: null,
      totalToken: null,
      requestCost: null,
      responseCost: null,
      totalCost: null,
    };
  }

  private toScanLogResponse(
    scanLog: BusinessCardScanLogRecord
  ): BusinessCardScanLogResponse {
    return {
      id: scanLog.id,
      status: scanLog.status,
      extracted: {
        companyName: scanLog.companyName,
        companyFieldName: scanLog.companyFieldName,
        companyRegionName: scanLog.companyRegionName,
        contactName: scanLog.contactName,
        contactMobile: scanLog.contactMobile,
        contactEmail: scanLog.contactEmail,
        contactDepartmentName: scanLog.contactDepartmentName,
        contactJobGradeName: scanLog.contactJobGradeName,
      },
      linked: {
        companyId: scanLog.companyId,
        contactId: scanLog.contactId,
        companyResolution: scanLog.companyResolution,
        contactResolution: scanLog.contactResolution,
        confirmedAt: scanLog.confirmedAt?.toISOString() ?? null,
      },
      ai: {
        provider: scanLog.aiProvider,
        model: scanLog.aiModel,
      },
      usage: {
        requestToken: scanLog.requestToken,
        responseToken: scanLog.responseToken,
        totalToken: scanLog.totalToken,
        requestCost: scanLog.requestCost,
        responseCost: scanLog.responseCost,
        totalCost: scanLog.totalCost,
        costCurrency: scanLog.costCurrency,
        pendingTimeMs: scanLog.pendingTimeMs,
      },
      failure: this.toFailureResponse(scanLog),
      createdAt: scanLog.createdAt.toISOString(),
      updatedAt: scanLog.updatedAt.toISOString(),
    };
  }

  // 기능 : OCR 실패 로그를 사용자에게 보여줄 수 있는 안전 응답으로 변환합니다.
  private toFailureResponse(
    scanLog: BusinessCardScanLogRecord
  ): BusinessCardFailureResponse | null {
    if (scanLog.status !== BusinessCardScanStatusValue.OCR_FAILED) {
      return null;
    }

    if (!scanLog.safeErrorCode) {
      return this.createSafeFailure(
        BusinessCardSafeFailureCodeValue.OCR_UNKNOWN_FAILED
      );
    }

    return {
      errorCode: scanLog.safeErrorCode,
      userMessage:
        this.normalizeOptionalText(scanLog.safeErrorMessage) ??
        BUSINESS_CARD_SAFE_FAILURE_MESSAGES[scanLog.safeErrorCode],
      retryable: scanLog.retryable,
    };
  }

  private logProviderFailure(
    userId: string,
    scanLogId: string,
    metadata: BusinessCardOcrProviderMetadata,
    safeFailure: BusinessCardSafeFailure
  ): void {
    this.logger.error(
      JSON.stringify({
        event: "businessCard.ocrFailed",
        userId,
        scanLogId,
        aiProvider: metadata.aiProvider,
        aiModel: metadata.aiModel,
        safeErrorCode: safeFailure.errorCode,
        retryable: safeFailure.retryable,
      }),
      safeFailure.userMessage,
      "BusinessCardApplicationService"
    );
  }

  // 기능 : 명함 서버 이벤트를 best-effort로 기록해 OCR/확정 API를 막지 않습니다.
  private async recordServerAnalyticsEvent(
    command: RecordProductAnalyticsServerEventCommand
  ): Promise<void> {
    await recordProductAnalyticsServerEventBestEffort({
      recorder: this.productAnalyticsEventRecorder,
      logger: this.logger,
      command,
      logContext: "BusinessCardApplicationService",
    });
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "BusinessCardApplicationService"
    );
  }
}
