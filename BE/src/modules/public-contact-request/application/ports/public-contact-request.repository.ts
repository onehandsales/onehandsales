export const PUBLIC_CONTACT_REQUEST_REPOSITORY = Symbol(
  "PUBLIC_CONTACT_REQUEST_REPOSITORY"
);

export const PUBLIC_CONTACT_REQUEST_COMPANY_SIZES = [
  "1-9",
  "10-49",
  "50-199",
  "200+",
] as const;

export const PUBLIC_CONTACT_REQUEST_REGIONS = ["KR", "US", "CA"] as const;

export const PUBLIC_CONTACT_REQUEST_SOURCES = [
  "linkedin",
  "peer",
  "search",
  "newsletter",
  "event",
  "webinar",
  "podcast",
  "friend",
  "naver",
  "other",
] as const;

export const PUBLIC_CONTACT_REQUEST_LOCALES = [
  "ko",
  "en-US",
  "en-CA",
] as const;

export type PublicContactRequestCompanySize =
  (typeof PUBLIC_CONTACT_REQUEST_COMPANY_SIZES)[number];

export type PublicContactRequestRegion =
  (typeof PUBLIC_CONTACT_REQUEST_REGIONS)[number];

export type PublicContactRequestSource =
  (typeof PUBLIC_CONTACT_REQUEST_SOURCES)[number];

export type PublicContactRequestLocale =
  (typeof PUBLIC_CONTACT_REQUEST_LOCALES)[number];

// 역할 : CreatePublicContactRequestInput 공개 문의 row 생성에 필요한 값을 정의합니다.
export interface CreatePublicContactRequestInput {
  readonly email: string;
  readonly normalizedEmail: string;
  readonly companySize: PublicContactRequestCompanySize;
  readonly firstName: string;
  readonly lastName: string;
  readonly companyName: string;
  readonly jobTitle: string;
  readonly region: PublicContactRequestRegion;
  readonly phone: string;
  readonly plan: string;
  readonly source: PublicContactRequestSource;
  readonly marketingAgreement: boolean;
  readonly wasExistingUserAtSubmission: boolean;
  readonly pageUrl: string | null;
  readonly locale: PublicContactRequestLocale | null;
  readonly userAgent: string | null;
  readonly requestId: string | null;
}

// 역할 : PublicContactRequestRecord 공개 문의 저장 결과 record를 정의합니다.
export interface PublicContactRequestRecord {
  readonly id: string;
}

// 역할 : PublicContactRequestRepository 공개 문의 저장소가 구현해야 하는 영속성 계약을 정의합니다.
export interface PublicContactRequestRepository {
  // 기능 : 정규화 이메일과 일치하는 삭제되지 않은 회원이 있는지 조회합니다.
  existsActiveUserByEmail(normalizedEmail: string): Promise<boolean>;
  // 기능 : 공개 문의 row를 저장합니다.
  createPublicContactRequest(
    input: CreatePublicContactRequestInput
  ): Promise<PublicContactRequestRecord>;
}
