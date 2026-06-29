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
  BUSINESS_CARD_SCAN_LOG_REPOSITORY,
  type BusinessCardConfirmResult,
  type BusinessCardExtractedRecord,
  type BusinessCardScanLogRecord,
  type BusinessCardScanLogRepository,
  BusinessCardScanStatusValue,
  type BusinessCardScanStatusValue as BusinessCardScanStatus,
  type BusinessCardUsageRecord,
} from "@/modules/business-card/application/ports/business-card-scan-log.repository";
import {
  BusinessCardScanLogNotFoundError,
  BusinessCardScanNotConfirmableError,
} from "@/modules/business-card/domain/business-card.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const BUSINESS_CARD_SCAN_PAGE_SIZE = 10;
const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const MOBILE_PATTERN = /^010-\d{4}-\d{4}$/;
const MOBILE_DIGIT_PATTERN = /^010\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_COMPANY_FIELD_NAME = "미분류";
const DEFAULT_COMPANY_REGION_NAME = "미지정";
const DEFAULT_CONTACT_DEPARTMENT_NAME = "미지정";
const DEFAULT_CONTACT_JOB_GRADE_NAME = "미지정";

// 역할 : BusinessCardScanQueryInput 명함 스캔 목록 조회 조건을 정의합니다.
export interface BusinessCardScanQueryInput {
  readonly page?: number;
  readonly status?: string;
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
    private readonly logger: AppLogger
  ) {}

  async scanBusinessCard(
    currentUser: CurrentUserContext,
    imageFile: UploadedBusinessCardImageFile | undefined
  ): Promise<BusinessCardScanLogResponse> {
    const normalizedImageFile = this.normalizeImageFile(imageFile);
    const metadata = this.ocrProvider.getMetadata();
    const startedAt = Date.now();

    try {
      const ocrResult = await this.ocrProvider.extract({
        imageFile: normalizedImageFile,
      });
      const extracted = this.normalizeExtractedFields(ocrResult.extracted);
      const scanLog = await this.scanLogRepository.createScanLog({
        userId: currentUser.id,
        status: BusinessCardScanStatusValue.OCR_SUCCESS,
        ...extracted,
        ...this.toUsageRecord(ocrResult.usage, metadata, startedAt),
        aiProvider: metadata.aiProvider,
        aiModel: metadata.aiModel,
        promptSnapshot: metadata.promptSnapshot,
      });

      this.logEvent("businessCard.ocrSucceeded", {
        userId: currentUser.id,
        scanLogId: scanLog.id,
        aiModel: metadata.aiModel,
      });

      return this.toScanLogResponse(scanLog);
    } catch (error) {
      const scanLog = await this.scanLogRepository.createScanLog({
        userId: currentUser.id,
        status: BusinessCardScanStatusValue.OCR_FAILED,
        ...this.emptyExtractedFields(),
        ...this.toUsageRecord(this.emptyUsage(), metadata, startedAt),
        aiProvider: metadata.aiProvider,
        aiModel: metadata.aiModel,
        promptSnapshot: metadata.promptSnapshot,
      });

      this.logProviderFailure(currentUser.id, scanLog.id, metadata, error);

      return this.toScanLogResponse(scanLog);
    }
  }

  async listScanLogs(
    currentUser: CurrentUserContext,
    query: BusinessCardScanQueryInput
  ): Promise<BusinessCardScanLogPageResponse> {
    const page = query.page ?? 1;
    const status = this.normalizeOptionalStatus(query.status);
    const result = await this.scanLogRepository.listScanLogs({
      userId: currentUser.id,
      page,
      pageSize: BUSINESS_CARD_SCAN_PAGE_SIZE,
      ...(status ? { status } : {}),
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
    input: ConfirmBusinessCardScanCommand
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

    return {
      scanLog: this.toScanLogResponse(result.result.scanLog),
      company: result.result.company,
      contact: result.result.contact,
    };
  }

  private normalizeImageFile(
    imageFile: UploadedBusinessCardImageFile | undefined
  ): BusinessCardOcrImageFile {
    if (!imageFile) {
      throw new ValidationDomainError("business card image is required");
    }

    if (!Buffer.isBuffer(imageFile.buffer)) {
      throw new ValidationDomainError("business card image buffer is required");
    }

    if (imageFile.size <= 0 || imageFile.buffer.length === 0) {
      throw new ValidationDomainError("business card image must not be empty");
    }

    if (imageFile.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      throw new ValidationDomainError("business card image is too large");
    }

    const mimeType = imageFile.mimetype.trim().toLowerCase();

    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
      throw new ValidationDomainError("business card image type is not supported");
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

    if (MOBILE_PATTERN.test(normalized)) {
      return normalized;
    }

    const digits = normalized.replace(/\D/g, "");

    if (!MOBILE_DIGIT_PATTERN.test(digits)) {
      return null;
    }

    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  private normalizeRequiredMobile(value: string): string {
    const mobile = this.normalizeMobileCandidate(value);

    if (!mobile || !MOBILE_PATTERN.test(mobile)) {
      throw new ValidationDomainError("contactMobile must match 010-1111-2222");
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

  private normalizeOptionalStatus(
    value: string | undefined
  ): BusinessCardScanStatus | undefined {
    if (!value) {
      return undefined;
    }

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
      createdAt: scanLog.createdAt.toISOString(),
      updatedAt: scanLog.updatedAt.toISOString(),
    };
  }

  private logProviderFailure(
    userId: string,
    scanLogId: string,
    metadata: BusinessCardOcrProviderMetadata,
    error: unknown
  ): void {
    this.logger.error(
      JSON.stringify({
        event: "businessCard.ocrFailed",
        userId,
        scanLogId,
        aiProvider: metadata.aiProvider,
        aiModel: metadata.aiModel,
        reason: error instanceof Error ? error.name : "UnknownError",
      }),
      error instanceof Error ? error.message : "Unknown business card OCR failure",
      "BusinessCardApplicationService"
    );
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
