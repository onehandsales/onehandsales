import { Inject, Injectable } from "@nestjs/common";
import {
  PUBLIC_CONTACT_REQUEST_COMPANY_SIZES,
  PUBLIC_CONTACT_REQUEST_LOCALES,
  PUBLIC_CONTACT_REQUEST_REGIONS,
  PUBLIC_CONTACT_REQUEST_REPOSITORY,
  PUBLIC_CONTACT_REQUEST_SOURCES,
  type CreatePublicContactRequestInput,
  type PublicContactRequestCompanySize,
  type PublicContactRequestLocale,
  type PublicContactRequestRegion,
  type PublicContactRequestRepository,
  type PublicContactRequestSource,
} from "@/modules/public-contact-request/application/ports/public-contact-request.repository";
import {
  PublicContactRequestValidationError,
  type PublicContactRequestValidationField,
} from "@/modules/public-contact-request/domain/public-contact-request.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const MAX_PUBLIC_CONTACT_EMAIL_LENGTH = 254;
const MAX_PUBLIC_CONTACT_NAME_LENGTH = 100;
const MAX_PUBLIC_CONTACT_COMPANY_LENGTH = 160;
const MAX_PUBLIC_CONTACT_TITLE_LENGTH = 120;
const MAX_PUBLIC_CONTACT_PHONE_LENGTH = 40;
const MAX_PUBLIC_CONTACT_PLAN_LENGTH = 2000;
const MAX_PUBLIC_CONTACT_PAGE_URL_LENGTH = 2000;
const PUBLIC_CONTACT_REQUEST_RECEIVED_MESSAGE = "문의가 접수되었습니다.";
const PUBLIC_CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 역할 : CreatePublicContactRequestCommand 공개 문의 접수 요청을 application 계층에 전달합니다.
export interface CreatePublicContactRequestCommand {
  readonly email: string | undefined;
  readonly companySize: string | undefined;
  readonly firstName: string | undefined;
  readonly lastName: string | undefined;
  readonly company: string | undefined;
  readonly title: string | undefined;
  readonly region: string | undefined;
  readonly phone: string | undefined;
  readonly plan: string | undefined;
  readonly source: string | undefined;
  readonly marketingAgreement: unknown;
  readonly pageUrl: string | undefined;
  readonly locale: string | undefined;
  readonly requestId: string | null;
  readonly userAgent: string | null;
}

// 역할 : CreatePublicContactRequestResponse 공개 문의 접수 성공 응답을 정의합니다.
export interface CreatePublicContactRequestResponse {
  readonly id: string;
  readonly message: string;
}

// 역할 : PublicContactRequestApplicationService 공개 문의 접수 use case를 제공합니다.
@Injectable()
export class PublicContactRequestApplicationService {
  // 기능 : 공개 문의 저장소와 logger를 주입받습니다.
  constructor(
    @Inject(PUBLIC_CONTACT_REQUEST_REPOSITORY)
    private readonly publicContactRequestRepository: PublicContactRequestRepository,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 공개 문의 입력을 검증하고 제출 시점 회원 여부 snapshot과 함께 저장합니다.
  async createPublicContactRequest(
    command: CreatePublicContactRequestCommand
  ): Promise<CreatePublicContactRequestResponse> {
    // 1. 공개 문의 form 입력을 API 계약에 맞게 정규화하고 검증한다.
    const email = this.normalizeEmail(command.email);
    const normalizedEmail = email.toLowerCase();
    const companySize = this.normalizeCompanySize(command.companySize);
    const firstName = this.normalizeRequiredText(
      command.firstName,
      "firstName",
      "이름을 입력해 주세요.",
      MAX_PUBLIC_CONTACT_NAME_LENGTH,
      "이름은 100자 이하로 입력해 주세요."
    );
    const lastName = this.normalizeRequiredText(
      command.lastName,
      "lastName",
      "성을 입력해 주세요.",
      MAX_PUBLIC_CONTACT_NAME_LENGTH,
      "성은 100자 이하로 입력해 주세요."
    );
    const companyName = this.normalizeRequiredText(
      command.company,
      "company",
      "회사명을 입력해 주세요.",
      MAX_PUBLIC_CONTACT_COMPANY_LENGTH,
      "회사명은 160자 이하로 입력해 주세요."
    );
    const jobTitle = this.normalizeRequiredText(
      command.title,
      "title",
      "직함을 입력해 주세요.",
      MAX_PUBLIC_CONTACT_TITLE_LENGTH,
      "직함은 120자 이하로 입력해 주세요."
    );
    const region = this.normalizeRegion(command.region);
    const phone = this.normalizeRequiredText(
      command.phone,
      "phone",
      "전화번호를 입력해 주세요.",
      MAX_PUBLIC_CONTACT_PHONE_LENGTH,
      "전화번호는 40자 이하로 입력해 주세요."
    );
    const plan = this.normalizeRequiredText(
      command.plan,
      "plan",
      "OneHand 사용 계획을 입력해 주세요.",
      MAX_PUBLIC_CONTACT_PLAN_LENGTH,
      "OneHand 사용 계획은 2000자 이하로 입력해 주세요."
    );
    const source = this.normalizeSource(command.source);
    const marketingAgreement = this.normalizeMarketingAgreement(
      command.marketingAgreement
    );
    const pageUrl = this.normalizeOptionalText(
      command.pageUrl,
      "pageUrl",
      MAX_PUBLIC_CONTACT_PAGE_URL_LENGTH,
      "페이지 주소는 2000자 이하로 입력해 주세요."
    );
    const locale = this.normalizeLocale(command.locale);
    const requestId = this.normalizeOptionalMetadata(command.requestId);
    const userAgent = this.normalizeOptionalMetadata(command.userAgent);

    // 2. User row와 FK를 만들지 않고 이메일 기준 회원 여부만 snapshot으로 조회한다.
    const wasExistingUserAtSubmission =
      await this.publicContactRequestRepository.existsActiveUserByEmail(
        normalizedEmail
      );

    // 3. 공개 문의 row를 독립 테이블에 저장한다.
    const created =
      await this.publicContactRequestRepository.createPublicContactRequest({
        email,
        normalizedEmail,
        companySize,
        firstName,
        lastName,
        companyName,
        jobTitle,
        region,
        phone,
        plan,
        source,
        marketingAgreement,
        wasExistingUserAtSubmission,
        pageUrl,
        locale,
        requestId,
        userAgent,
      } satisfies CreatePublicContactRequestInput);

    // 4. 개인정보 원문 없이 접수 성공 이벤트만 구조화 로그로 남긴다.
    this.logEvent("publicContactRequest.created", {
      publicContactRequestId: created.id,
      companySize,
      region,
      source,
      locale,
      marketingAgreement,
      wasExistingUserAtSubmission,
      requestId,
    });

    return {
      id: created.id,
      message: PUBLIC_CONTACT_REQUEST_RECEIVED_MESSAGE,
    };
  }

  // 기능 : 이메일을 trim하고 길이와 형식을 검증합니다.
  private normalizeEmail(value: string | undefined): string {
    const email = this.normalizeRequiredText(
      value,
      "email",
      "업무 이메일을 입력해 주세요.",
      MAX_PUBLIC_CONTACT_EMAIL_LENGTH,
      "업무 이메일은 254자 이하로 입력해 주세요."
    );

    if (!PUBLIC_CONTACT_EMAIL_PATTERN.test(email)) {
      throw new PublicContactRequestValidationError(
        "email",
        "업무 이메일 형식을 확인해 주세요."
      );
    }

    return email;
  }

  // 기능 : 필수 문자열을 trim하고 빈 값과 최대 길이를 검증합니다.
  private normalizeRequiredText(
    value: string | undefined,
    field: PublicContactRequestValidationField,
    requiredMessage: string,
    maxLength: number,
    tooLongMessage: string
  ): string {
    const normalized = value?.trim() ?? "";

    if (normalized.length === 0) {
      throw new PublicContactRequestValidationError(field, requiredMessage);
    }

    if (Array.from(normalized).length > maxLength) {
      throw new PublicContactRequestValidationError(field, tooLongMessage);
    }

    return normalized;
  }

  // 기능 : 선택 문자열을 trim하고 비어 있으면 null로 변환합니다.
  private normalizeOptionalText(
    value: string | undefined,
    field: PublicContactRequestValidationField,
    maxLength: number,
    tooLongMessage: string
  ): string | null {
    const normalized = value?.trim() ?? "";

    if (normalized.length === 0) {
      return null;
    }

    if (Array.from(normalized).length > maxLength) {
      throw new PublicContactRequestValidationError(field, tooLongMessage);
    }

    return normalized;
  }

  // 기능 : 선택 metadata 문자열을 trim하고 비어 있으면 null로 변환합니다.
  private normalizeOptionalMetadata(value: string | null | undefined): string | null {
    const normalized = value?.trim();

    return normalized && normalized.length > 0 ? normalized : null;
  }

  // 기능 : 사용 인원 규모 값이 공개 문의 계약의 허용값인지 검증합니다.
  private normalizeCompanySize(
    value: string | undefined
  ): PublicContactRequestCompanySize {
    const normalized = value?.trim() ?? "";

    if (this.isCompanySize(normalized)) {
      return normalized;
    }

    throw new PublicContactRequestValidationError(
      "companySize",
      "사용 인원 규모를 선택해 주세요."
    );
  }

  // 기능 : 국가 또는 지역 값이 공개 문의 계약의 허용값인지 검증합니다.
  private normalizeRegion(value: string | undefined): PublicContactRequestRegion {
    const normalized = value?.trim() ?? "";

    if (this.isRegion(normalized)) {
      return normalized;
    }

    throw new PublicContactRequestValidationError(
      "region",
      "국가 또는 지역을 선택해 주세요."
    );
  }

  // 기능 : 유입 경로 값이 공개 문의 계약의 허용값인지 검증합니다.
  private normalizeSource(value: string | undefined): PublicContactRequestSource {
    const normalized = value?.trim() ?? "";

    if (this.isSource(normalized)) {
      return normalized;
    }

    throw new PublicContactRequestValidationError(
      "source",
      "OneHand를 알게 된 경로를 선택해 주세요."
    );
  }

  // 기능 : 수신 동의 값이 boolean인지 검증합니다.
  private normalizeMarketingAgreement(value: unknown): boolean {
    if (typeof value === "boolean") {
      return value;
    }

    throw new PublicContactRequestValidationError(
      "marketingAgreement",
      "수신 동의 여부를 확인해 주세요."
    );
  }

  // 기능 : 공개 사이트 locale 값을 선택 값으로 정규화합니다.
  private normalizeLocale(
    value: string | undefined
  ): PublicContactRequestLocale | null {
    const normalized = value?.trim() ?? "";

    if (normalized.length === 0) {
      return null;
    }

    if (this.isLocale(normalized)) {
      return normalized;
    }

    throw new PublicContactRequestValidationError(
      "locale",
      "지원하지 않는 공개 사이트 언어입니다."
    );
  }

  // 기능 : 사용 인원 규모 타입 가드를 제공합니다.
  private isCompanySize(value: string): value is PublicContactRequestCompanySize {
    return PUBLIC_CONTACT_REQUEST_COMPANY_SIZES.some((item) => item === value);
  }

  // 기능 : 국가 또는 지역 타입 가드를 제공합니다.
  private isRegion(value: string): value is PublicContactRequestRegion {
    return PUBLIC_CONTACT_REQUEST_REGIONS.some((item) => item === value);
  }

  // 기능 : 유입 경로 타입 가드를 제공합니다.
  private isSource(value: string): value is PublicContactRequestSource {
    return PUBLIC_CONTACT_REQUEST_SOURCES.some((item) => item === value);
  }

  // 기능 : 공개 사이트 locale 타입 가드를 제공합니다.
  private isLocale(value: string): value is PublicContactRequestLocale {
    return PUBLIC_CONTACT_REQUEST_LOCALES.some((item) => item === value);
  }

  // 기능 : 공개 문의 접수 이벤트를 개인정보 원문 없이 구조화 로그로 남깁니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "PublicContactRequestApplicationService"
    );
  }
}
