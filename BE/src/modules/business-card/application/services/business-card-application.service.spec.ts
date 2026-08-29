import { Buffer } from "node:buffer";
import type {
  ProductAnalyticsServerEventRecorder,
  RecordProductAnalyticsServerEventCommand,
} from "@/modules/analytics/application/services/product-analytics-event-recorder";
import type {
  BusinessCardOcrProvider,
  BusinessCardOcrProviderMetadata,
  BusinessCardOcrProviderResult,
} from "@/modules/business-card/application/ports/business-card-ocr.provider";
import {
  BusinessCardSafeFailureCodeValue,
  BusinessCardScanStatusValue,
} from "@/modules/business-card/application/ports/business-card-scan-log.types";
import {
  type BusinessCardScanLogRecord,
  type BusinessCardScanLogRepository,
  type CreateBusinessCardScanLogInput,
} from "@/modules/business-card/application/ports/business-card-scan-log.repository";
import { BusinessCardImageValidationError } from "@/modules/business-card/domain/business-card.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import {
  BusinessCardApplicationService,
  type UploadedBusinessCardImageFile,
} from "./business-card-application.service";

const NOW = new Date("2026-07-31T01:00:00.000Z");
const USER_ID = "00000000-0000-4000-8000-000000000101";
const SESSION_ID = "00000000-0000-4000-8000-000000000201";
const SCAN_LOG_ID = "00000000-0000-4000-8000-000000000301";
const FALLBACK_FAILURE_MESSAGE =
  "명함을 읽지 못했어요. 다시 찍거나 파일을 바꿔 주세요.";

const CURRENT_USER: CurrentUserContext = {
  id: USER_ID,
  sessionId: SESSION_ID,
  email: "owner@example.com",
  displayName: "Owner",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const METADATA: BusinessCardOcrProviderMetadata = {
  aiProvider: "OPENAI",
  aiModel: "gpt-4o-mini",
  promptSnapshot: "business card prompt",
  costCurrency: "USD",
};

const IMAGE_FILE: UploadedBusinessCardImageFile = {
  buffer: Buffer.from("business-card-image"),
  originalname: "card.jpg",
  mimetype: "image/jpeg",
  size: 512 * 1024,
};

// 역할 : FakeAppLogger 명함 서비스 테스트에서 실제 로그 출력을 막고 호출만 검증합니다.
class FakeAppLogger extends AppLogger {
  readonly errorMock = jest.fn();
  readonly logMock = jest.fn();
  readonly warnMock = jest.fn();

  // 기능 : error 로그를 실제 출력하지 않고 mock에 저장합니다.
  override error(message: string, trace?: string, context?: string): void {
    this.errorMock(message, trace, context);
  }

  // 기능 : info 로그를 실제 출력하지 않고 mock에 저장합니다.
  override log(message: string, context?: string): void {
    this.logMock(message, context);
  }

  // 기능 : warning 로그를 실제 출력하지 않고 mock에 저장합니다.
  override warn(message: string, context?: string): void {
    this.warnMock(message, context);
  }
}

// 기능 : 명함 서비스와 테스트 대역을 함께 생성합니다.
function createFixture() {
  const repository = createRepositoryFake();
  const provider = createProviderFake();
  const logger = new FakeAppLogger();
  const analyticsRecorder = createAnalyticsRecorderFake();
  const service = new BusinessCardApplicationService(
    repository,
    provider,
    logger,
    analyticsRecorder
  );

  return { analyticsRecorder, logger, provider, repository, service };
}

// 기능 : BusinessCardScanLogRepository 테스트 대역을 생성합니다.
function createRepositoryFake(): jest.Mocked<BusinessCardScanLogRepository> {
  return {
    createScanLog: jest.fn(async (input) =>
      createScanLogRecord(input, SCAN_LOG_ID)
    ),
    listScanLogs: jest.fn().mockResolvedValue({ items: [], totalCount: 0 }),
    findScanLog: jest.fn(),
    confirmScanLog: jest.fn(),
  };
}

// 기능 : OCR provider 테스트 대역을 생성합니다.
function createProviderFake(): jest.Mocked<BusinessCardOcrProvider> {
  return {
    getMetadata: jest.fn(() => METADATA),
    extract: jest.fn(),
  };
}

// 기능 : 제품 분석 recorder 테스트 대역을 생성합니다.
function createAnalyticsRecorderFake(): jest.Mocked<ProductAnalyticsServerEventRecorder> {
  return {
    recordServerEvent: jest.fn().mockResolvedValue(undefined),
  };
}

// 기능 : 저장소 입력을 실제 서비스 응답 mapper가 사용할 scan log record로 변환합니다.
function createScanLogRecord(
  input: CreateBusinessCardScanLogInput,
  id: string
): BusinessCardScanLogRecord {
  return {
    id,
    userId: input.userId,
    status: input.status,
    companyName: input.companyName,
    companyFieldName: input.companyFieldName,
    companyRegionName: input.companyRegionName,
    contactName: input.contactName,
    contactMobile: input.contactMobile,
    contactEmail: input.contactEmail,
    contactDepartmentName: input.contactDepartmentName,
    contactJobGradeName: input.contactJobGradeName,
    companyId: null,
    contactId: null,
    companyResolution: null,
    contactResolution: null,
    aiProvider: input.aiProvider,
    aiModel: input.aiModel,
    promptSnapshot: input.promptSnapshot,
    requestToken: input.requestToken,
    responseToken: input.responseToken,
    totalToken: input.totalToken,
    requestCost: input.requestCost,
    responseCost: input.responseCost,
    totalCost: input.totalCost,
    costCurrency: input.costCurrency,
    pendingTimeMs: input.pendingTimeMs,
    safeErrorCode: input.safeErrorCode,
    safeErrorMessage: input.safeErrorMessage,
    retryable: input.retryable,
    confirmedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

// 기능 : OCR provider 성공 결과를 테스트 기본값으로 생성합니다.
function createOcrResult(
  extracted: BusinessCardOcrProviderResult["extracted"]
): BusinessCardOcrProviderResult {
  return {
    extracted,
    usage: {
      requestToken: 10,
      responseToken: 20,
      totalToken: 30,
      requestCost: null,
      responseCost: null,
      totalCost: null,
    },
  };
}

function createExtractedFields(
  overrides: Partial<BusinessCardOcrProviderResult["extracted"]> = {}
): BusinessCardOcrProviderResult["extracted"] {
  return {
    companyName: "원핸드세일즈",
    companyFieldName: "CRM",
    companyRegionName: "서울",
    contactName: "홍길동",
    contactMobile: "010-1234-5678",
    contactEmail: "sales@example.com",
    contactDepartmentName: "영업",
    contactJobGradeName: "매니저",
    ...overrides,
  };
}

describe("BusinessCardApplicationService", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns failure null for OCR success scan logs", async () => {
    const { provider, repository, service } = createFixture();
    provider.extract.mockResolvedValue(createOcrResult(createExtractedFields()));

    const response = await service.scanBusinessCard(
      CURRENT_USER,
      IMAGE_FILE,
      "request-business-card-1"
    );

    expect(response.status).toBe(BusinessCardScanStatusValue.OCR_SUCCESS);
    expect(response.failure).toBeNull();
    expect(repository.createScanLog).toHaveBeenCalledWith(
      expect.objectContaining({
        status: BusinessCardScanStatusValue.OCR_SUCCESS,
        safeErrorCode: null,
        safeErrorMessage: null,
        retryable: false,
      })
    );
  });

  it("maps provider parse failure into safe OCR failure response and analytics", async () => {
    const { analyticsRecorder, logger, provider, repository, service } =
      createFixture();
    provider.extract.mockRejectedValue(
      new Error("OpenAI business card OCR response did not match schema")
    );

    const response = await service.scanBusinessCard(
      CURRENT_USER,
      IMAGE_FILE,
      "request-business-card-2"
    );

    expect(response.status).toBe(BusinessCardScanStatusValue.OCR_FAILED);
    expect(response.failure).toEqual({
      errorCode: BusinessCardSafeFailureCodeValue.OCR_PARSE_FAILED,
      userMessage: FALLBACK_FAILURE_MESSAGE,
      retryable: true,
    });
    expect(repository.createScanLog).toHaveBeenCalledWith(
      expect.objectContaining({
        status: BusinessCardScanStatusValue.OCR_FAILED,
        safeErrorCode: BusinessCardSafeFailureCodeValue.OCR_PARSE_FAILED,
        safeErrorMessage: FALLBACK_FAILURE_MESSAGE,
        retryable: true,
      })
    );
    expect(analyticsRecorder.recordServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "business_card_ocr_failed",
        requestId: "request-business-card-2",
        targetId: SCAN_LOG_ID,
        targetType: "BUSINESS_CARD_SCAN",
        payload: {
          safeErrorCode: BusinessCardSafeFailureCodeValue.OCR_PARSE_FAILED,
          retryable: true,
          provider: "OPENAI",
          model: "gpt-4o-mini",
          fileSizeBucket: "0_1mb",
        },
      } satisfies Partial<RecordProductAnalyticsServerEventCommand>)
    );
    expect(JSON.stringify(logger.errorMock.mock.calls)).not.toContain(
      "did not match schema"
    );
  });

  it("treats an empty OCR extraction as image quality failure", async () => {
    const { provider, service } = createFixture();
    provider.extract.mockResolvedValue(
      createOcrResult(
        createExtractedFields({
          companyName: null,
          companyFieldName: null,
          companyRegionName: null,
          contactName: null,
          contactMobile: null,
          contactEmail: null,
          contactDepartmentName: null,
          contactJobGradeName: null,
        })
      )
    );

    const response = await service.scanBusinessCard(CURRENT_USER, IMAGE_FILE);

    expect(response.status).toBe(BusinessCardScanStatusValue.OCR_FAILED);
    expect(response.failure).toEqual({
      errorCode: BusinessCardSafeFailureCodeValue.IMAGE_QUALITY_LOW,
      userMessage:
        "사진이 흐려서 내용을 읽기 어려워요. 밝은 곳에서 다시 찍어 주세요.",
      retryable: true,
    });
  });

  it("returns fallback safe failure for old OCR_FAILED rows", async () => {
    const { repository, service } = createFixture();
    repository.findScanLog.mockResolvedValue(
      createScanLogRecord(
        {
          userId: USER_ID,
          status: BusinessCardScanStatusValue.OCR_FAILED,
          companyName: null,
          companyFieldName: null,
          companyRegionName: null,
          contactName: null,
          contactMobile: null,
          contactEmail: null,
          contactDepartmentName: null,
          contactJobGradeName: null,
          requestToken: null,
          responseToken: null,
          totalToken: null,
          requestCost: null,
          responseCost: null,
          totalCost: null,
          costCurrency: "USD",
          pendingTimeMs: null,
          aiProvider: "OPENAI",
          aiModel: "gpt-4o-mini",
          promptSnapshot: "business card prompt",
          safeErrorCode: null,
          safeErrorMessage: null,
          retryable: false,
        },
        SCAN_LOG_ID
      )
    );

    const response = await service.getScanLog(CURRENT_USER, SCAN_LOG_ID);

    expect(response.failure).toEqual({
      errorCode: BusinessCardSafeFailureCodeValue.OCR_UNKNOWN_FAILED,
      userMessage: FALLBACK_FAILURE_MESSAGE,
      retryable: true,
    });
  });

  it("rejects unsupported image MIME type before creating a scan log", async () => {
    const { repository, service } = createFixture();

    await expect(
      service.scanBusinessCard(CURRENT_USER, {
        ...IMAGE_FILE,
        mimetype: "image/gif",
      })
    ).rejects.toMatchObject({
      code: "IMAGE_TYPE_UNSUPPORTED",
      message: "JPG, PNG, WebP 이미지만 올릴 수 있어요.",
    } satisfies Partial<BusinessCardImageValidationError>);
    expect(repository.createScanLog).not.toHaveBeenCalled();
  });
});
