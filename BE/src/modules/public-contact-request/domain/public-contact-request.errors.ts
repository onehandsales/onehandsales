import { DomainError } from "@/shared/domain/errors/domain-error";

export type PublicContactRequestValidationField =
  | "email"
  | "companySize"
  | "firstName"
  | "lastName"
  | "company"
  | "title"
  | "region"
  | "phone"
  | "plan"
  | "source"
  | "marketingAgreement"
  | "pageUrl"
  | "locale";

// 역할 : PublicContactRequestValidationError 공개 문의 입력 검증 실패를 안전한 API 오류로 표현합니다.
export class PublicContactRequestValidationError extends DomainError {
  // 기능 : 클라이언트가 처리할 수 있는 field 단위 공개 문의 검증 오류를 생성합니다.
  constructor(field: PublicContactRequestValidationField, message: string) {
    super("PUBLIC_CONTACT_REQUEST_VALIDATION_FAILED", message, { field });
  }
}
