import { DomainError } from "@/shared/domain/errors/domain-error";

export type UserGlobalSettingField =
  | "preferredLocale"
  | "timeZone"
  | "countryCode"
  | "defaultCurrencyCode";

// 역할 : UserGlobalSettingValidationError 사용자 글로벌 설정 검증 실패를 표현합니다.
export class UserGlobalSettingValidationError extends DomainError {
  // 기능 : FE가 필드 단위 오류를 표시할 수 있도록 안전한 field detail을 포함합니다.
  constructor(
    code: string,
    readonly field: UserGlobalSettingField,
    message = "User global setting is invalid"
  ) {
    super(code, message, { field });
  }
}
