// 역할 : SupportRequestType 지원 요청 템플릿 유형을 정의합니다.
export type SupportRequestType =
  | "FEATURE_QUESTION"
  | "PRICING_QUESTION"
  | "PHONE_CONSULTATION"
  | "FEATURE_SUGGESTION"
  | "OTHER";

// 역할 : CreateSupportRequestInput 지원 요청 생성 API 요청 값을 정의합니다.
export interface CreateSupportRequestInput {
  readonly type: SupportRequestType;
  readonly description: string;
  readonly pageUrl: string;
}

// 역할 : CreateSupportRequestResponse 지원 요청 생성 API 응답 값을 정의합니다.
export interface CreateSupportRequestResponse {
  readonly id: string;
  readonly message: string;
}
