import { Inject, Injectable } from "@nestjs/common";
import {
  SUPPORT_REQUEST_REPOSITORY,
  type CreateSupportRequestInput,
  type SupportRequestRepository,
  type SupportRequestType,
} from "@/modules/support-request/application/ports/support-request.repository";
import {
  SupportRequestUserNotFoundError,
  SupportRequestValidationError,
} from "@/modules/support-request/domain/support-request.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const MAX_SUPPORT_REQUEST_DESCRIPTION_LENGTH = 1000;
const MAX_SUPPORT_REQUEST_PAGE_URL_LENGTH = 2000;
const SUPPORT_REQUEST_RECEIVED_MESSAGE = "지원 요청을 보냈어요.";

// 역할 : CreateSupportRequestCommand 지원 요청 접수 요청을 application 계층에 전달합니다.
export interface CreateSupportRequestCommand {
  readonly currentUser: CurrentUserContext;
  readonly type: string | undefined;
  readonly description: string | undefined;
  readonly pageUrl: string | undefined;
  readonly requestId: string | null;
  readonly userAgent: string | null;
}

// 역할 : CreateSupportRequestResponse 지원 요청 접수 성공 응답을 정의합니다.
export interface CreateSupportRequestResponse {
  readonly id: string;
  readonly message: string;
}

// 역할 : SupportRequestApplicationService 지원 요청 접수 use case를 제공합니다.
@Injectable()
export class SupportRequestApplicationService {
  // 기능 : 지원 요청 저장소와 logger를 주입받습니다.
  constructor(
    @Inject(SUPPORT_REQUEST_REPOSITORY)
    private readonly supportRequestRepository: SupportRequestRepository,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 지원 요청 입력을 검증하고 사용자 snapshot과 함께 저장합니다.
  async createSupportRequest(
    command: CreateSupportRequestCommand
  ): Promise<CreateSupportRequestResponse> {
    // 1. 사용자 입력 field를 지원 요청 계약에 맞게 정규화하고 검증한다.
    const type = this.normalizeType(command.type);
    const description = this.normalizeDescription(command.description);
    const pageUrl = this.normalizePageUrl(command.pageUrl);
    const requestId = this.normalizeOptionalText(command.requestId);
    const userAgent = this.normalizeOptionalText(command.userAgent);

    // 2. 인증 context의 사용자 ID로 DB 사용자 snapshot을 다시 조회한다.
    const userSnapshot =
      await this.supportRequestRepository.findUserSnapshotById(
        command.currentUser.id
      );

    if (!userSnapshot) {
      throw new SupportRequestUserNotFoundError();
    }

    // 3. 사용자 snapshot과 문의 유형, 본문을 지원 요청 row로 저장한다.
    const created = await this.supportRequestRepository.createSupportRequest({
      user: userSnapshot,
      type,
      description,
      pageUrl,
      userAgent,
      requestId,
    } satisfies CreateSupportRequestInput);

    // 4. 원문 description 없이 안전한 접수 이벤트만 구조화 로그로 남긴다.
    this.logEvent("supportRequest.created", {
      userId: userSnapshot.id,
      supportRequestId: created.id,
      type,
      requestId,
    });

    return {
      id: created.id,
      message: SUPPORT_REQUEST_RECEIVED_MESSAGE,
    };
  }

  // 기능 : 문의 유형을 trim하고 허용된 지원 요청 유형인지 검증합니다.
  private normalizeType(value: string | undefined): SupportRequestType {
    const normalized = value?.trim() ?? "";

    if (normalized.length === 0) {
      throw new SupportRequestValidationError(
        "SUPPORT_REQUEST_TYPE_REQUIRED",
        "type",
        "문의 유형을 선택해 주세요."
      );
    }

    switch (normalized) {
      case "FEATURE_QUESTION":
      case "PRICING_QUESTION":
      case "PHONE_CONSULTATION":
      case "FEATURE_SUGGESTION":
      case "OTHER":
        return normalized;
      default:
        throw new SupportRequestValidationError(
          "SUPPORT_REQUEST_TYPE_INVALID",
          "type",
          "지원하지 않는 문의 유형이에요."
        );
    }
  }

  // 기능 : 지원 요청 내용을 trim하고 필수/길이 조건을 검증합니다.
  private normalizeDescription(value: string | undefined): string {
    const normalized = value?.trim() ?? "";

    if (normalized.length === 0) {
      throw new SupportRequestValidationError(
        "SUPPORT_REQUEST_DESCRIPTION_REQUIRED",
        "description",
        "문의 내용을 입력해 주세요."
      );
    }

    if (Array.from(normalized).length > MAX_SUPPORT_REQUEST_DESCRIPTION_LENGTH) {
      throw new SupportRequestValidationError(
        "SUPPORT_REQUEST_DESCRIPTION_TOO_LONG",
        "description",
        "문의 내용은 1000자 이하로 입력해 주세요."
      );
    }

    return normalized;
  }

  // 기능 : 현재 화면 주소를 trim하고 필수/길이 조건을 검증합니다.
  private normalizePageUrl(value: string | undefined): string {
    const normalized = value?.trim() ?? "";

    if (normalized.length === 0) {
      throw new SupportRequestValidationError(
        "SUPPORT_REQUEST_PAGE_URL_REQUIRED",
        "pageUrl",
        "현재 화면 주소를 확인하지 못했어요."
      );
    }

    if (Array.from(normalized).length > MAX_SUPPORT_REQUEST_PAGE_URL_LENGTH) {
      throw new SupportRequestValidationError(
        "SUPPORT_REQUEST_PAGE_URL_TOO_LONG",
        "pageUrl",
        "현재 화면 주소가 너무 길어요."
      );
    }

    return normalized;
  }

  // 기능 : 선택 텍스트 값을 저장 가능한 문자열 또는 null로 정규화합니다.
  private normalizeOptionalText(value: string | null | undefined): string | null {
    const normalized = value?.trim();

    return normalized && normalized.length > 0 ? normalized : null;
  }

  // 기능 : 지원 요청 처리 이벤트를 원문 없이 구조화 로그로 남깁니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "SupportRequestApplicationService"
    );
  }
}
