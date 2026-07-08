import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UpdateUserProfileInput,
  type UserProfileRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { normalizeOptionalIanaTimeZone } from "@/shared/application/time-zone/time-zone";

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
    const normalizedTimeZone = normalizeOptionalIanaTimeZone(input.timeZone);
    const normalizedPreferredLocale = this.normalizePreferredLocale(
      input.preferredLocale
    );

    // 2. undefined 값이 optional property로 전달되지 않도록 저장소 입력을 구성한다.
    const updateInput: UpdateUserProfileInput = {
      ...(normalizedName !== undefined ? { name: normalizedName } : {}),
      ...(normalizedTimeZone !== undefined ? { timeZone: normalizedTimeZone } : {}),
      ...(normalizedPreferredLocale !== undefined
        ? { preferredLocale: normalizedPreferredLocale }
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

    if (normalized === "ko" || normalized.toLowerCase() === "ko-kr") {
      return "ko-KR";
    }

    if (normalized === "ja" || normalized.toLowerCase() === "ja-jp") {
      return "ja-JP";
    }

    if (
      normalized === "zh" ||
      normalized.toLowerCase() === "zh-cn" ||
      normalized.toLowerCase().startsWith("zh-hans")
    ) {
      return "zh-CN";
    }

    if (normalized.toLowerCase() === "en-gb") {
      return "en-GB";
    }

    if (normalized === "en" || normalized.toLowerCase().startsWith("en-")) {
      return "en-US";
    }

    return "ko-KR";
  }
}
