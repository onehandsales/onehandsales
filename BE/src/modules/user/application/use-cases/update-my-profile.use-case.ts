import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UpdateUserProfileInput,
  type UserProfileRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import { UserGlobalSettingValidationError } from "@/modules/user/domain/user.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { isValidIanaTimeZone } from "@/shared/application/time-zone/time-zone";

const SUPPORTED_LOCALES = ["ko-KR", "en"] as const;
const SUPPORTED_COUNTRY_CODES = ["KR", "US"] as const;
const SUPPORTED_CURRENCY_CODES = ["KRW", "USD"] as const;

// 역할 : UpdateMyProfileUseCase 유스케이스의 application orchestration을 담당합니다.
@Injectable()
export class UpdateMyProfileUseCase {
  // 기능 : 사용자 저장소를 주입받습니다.
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  // 기능 : 현재 사용자의 프로필 수정 값을 저장하고 갱신된 프로필을 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    input: UpdateUserProfileInput
  ): Promise<UserProfileRecord> {
    // 1. 수정 가능한 입력값을 저장 가능한 값으로 정규화한다.
    const normalizedName = this.normalizeName(input.name);
    const normalizedTimeZone = this.normalizeTimeZone(input.timeZone);
    const normalizedPreferredLocale = this.normalizePreferredLocale(
      input.preferredLocale
    );
    const normalizedCountryCode = this.normalizeCountryCode(input.countryCode);
    const normalizedDefaultCurrencyCode = this.normalizeDefaultCurrencyCode(
      input.defaultCurrencyCode
    );

    // 2. undefined 값이 optional property로 전달되지 않도록 저장소 입력을 구성한다.
    const updateInput: UpdateUserProfileInput = {
      ...(normalizedName !== undefined ? { name: normalizedName } : {}),
      ...(normalizedTimeZone !== undefined ? { timeZone: normalizedTimeZone } : {}),
      ...(normalizedPreferredLocale !== undefined
        ? { preferredLocale: normalizedPreferredLocale }
        : {}),
      ...(normalizedCountryCode !== undefined
        ? { countryCode: normalizedCountryCode }
        : {}),
      ...(normalizedDefaultCurrencyCode !== undefined
        ? { defaultCurrencyCode: normalizedDefaultCurrencyCode }
        : {}),
    };

    // 3. 정규화된 수정 값을 저장소에 반영한다.
    const profile = await this.userRepository.updateProfile(
      currentUser.id,
      updateInput
    );

    // 4. 수정 후 사용자 존재 여부와 활성 상태를 검증한다.
    if (!profile || profile.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    // 5. 갱신된 프로필 응답 레코드를 반환한다.
    return profile;
  }

  // 기능 : 이름 입력값을 저장 가능한 공백 제거 값 또는 null로 정규화합니다.
  private normalizeName(name: string | null | undefined): string | null | undefined {
    if (name === undefined) {
      return undefined;
    }

    if (name === null) {
      return null;
    }

    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  // 기능 : 사용자가 선택한 표시 언어를 지원 locale 값으로 정규화합니다.
  private normalizePreferredLocale(locale: string | undefined): string | undefined {
    const normalized = locale?.trim().replace("_", "-");

    if (normalized === undefined) {
      return undefined;
    }

    if (this.isSupportedValue(normalized, SUPPORTED_LOCALES)) {
      return normalized;
    }

    const normalizedLower = normalized.toLowerCase();

    if (normalizedLower === "ko" || normalizedLower === "ko-kr") {
      return "ko-KR";
    }

    if (normalizedLower === "en" || normalizedLower.startsWith("en-")) {
      return "en";
    }

    throw new UserGlobalSettingValidationError(
      "USER_LOCALE_UNSUPPORTED",
      "preferredLocale",
      "preferredLocale must be ko-KR or en"
    );
  }

  // 기능 : 사용자 설정 timezone을 IANA timezone ID로 검증합니다.
  private normalizeTimeZone(timeZone: string | undefined): string | undefined {
    if (timeZone === undefined) {
      return undefined;
    }

    const trimmed = timeZone.trim();

    if (!trimmed || !isValidIanaTimeZone(trimmed)) {
      throw new UserGlobalSettingValidationError(
        "USER_TIMEZONE_INVALID",
        "timeZone",
        "timeZone must be a valid IANA timezone ID"
      );
    }

    return trimmed;
  }

  // 기능 : 사용자 기본 국가 코드를 08 1차 지원 국가로 검증합니다.
  private normalizeCountryCode(countryCode: string | undefined): string | undefined {
    const normalized = countryCode?.trim().toUpperCase();

    if (normalized === undefined) {
      return undefined;
    }

    if (this.isSupportedValue(normalized, SUPPORTED_COUNTRY_CODES)) {
      return normalized;
    }

    throw new UserGlobalSettingValidationError(
      "USER_COUNTRY_UNSUPPORTED",
      "countryCode",
      "countryCode must be KR or US"
    );
  }

  // 기능 : 사용자 기본 통화 코드를 08 1차 지원 통화로 검증합니다.
  private normalizeDefaultCurrencyCode(
    defaultCurrencyCode: string | undefined
  ): string | undefined {
    const normalized = defaultCurrencyCode?.trim().toUpperCase();

    if (normalized === undefined) {
      return undefined;
    }

    if (this.isSupportedValue(normalized, SUPPORTED_CURRENCY_CODES)) {
      return normalized;
    }

    throw new UserGlobalSettingValidationError(
      "USER_DEFAULT_CURRENCY_UNSUPPORTED",
      "defaultCurrencyCode",
      "defaultCurrencyCode must be KRW or USD"
    );
  }

  // 기능 : 좁은 지원값 목록 안에 입력값이 포함되는지 확인합니다.
  private isSupportedValue<TValue extends string>(
    value: string,
    supportedValues: readonly TValue[]
  ): value is TValue {
    return supportedValues.includes(value as TValue);
  }
}
