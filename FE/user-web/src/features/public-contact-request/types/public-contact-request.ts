export type PublicContactRequestCompanySize =
  | "1-9"
  | "10-49"
  | "50-199"
  | "200+";

export type PublicContactRequestRegion = "KR" | "US" | "CA";

export type PublicContactRequestSource =
  | "linkedin"
  | "peer"
  | "search"
  | "newsletter"
  | "event"
  | "webinar"
  | "podcast"
  | "friend"
  | "naver"
  | "other";

export type PublicContactRequestLocale =
  | "ko"
  | "en-US"
  | "en-CA";

// 역할 : CreatePublicContactRequestInput 공개 문의 접수 API 요청 값을 정의합니다.
export interface CreatePublicContactRequestInput {
  readonly email: string;
  readonly companySize: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly company: string;
  readonly title: string;
  readonly region: string;
  readonly phone: string;
  readonly plan: string;
  readonly source: string;
  readonly marketingAgreement: boolean;
  readonly pageUrl?: string;
  readonly locale?: PublicContactRequestLocale;
}

// 역할 : CreatePublicContactRequestResponse 공개 문의 접수 API 응답 값을 정의합니다.
export interface CreatePublicContactRequestResponse {
  readonly id: string;
  readonly message: string;
}
