import { UpdateMyProfileUseCase } from "./update-my-profile.use-case";
import type {
  UpdateUserProfileInput,
  UserDeviceRecord,
  UserProfileRecord,
  UserRepository,
} from "@/modules/user/application/ports/user.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

describe("UpdateMyProfileUseCase", () => {
  it.each([
    ["ko", "ko-KR"],
    ["ko_KR", "ko-KR"],
    ["en-US", "en"],
    ["en-x-test", "en"],
  ])("normalizes preferredLocale %s to %s", async (inputLocale, expectedLocale) => {
    const repository = new FakeUserRepository();
    const useCase = new UpdateMyProfileUseCase(repository);

    const profile = await useCase.execute(makeCurrentUser(), {
      preferredLocale: inputLocale,
    });

    expect(repository.lastUpdateInput).toEqual({
      preferredLocale: expectedLocale,
    });
    expect(profile.preferredLocale).toBe(expectedLocale);
  });

  // 기능 : 기본 국가와 기본 통화 입력값을 대문자 지원값으로 정규화합니다.
  it("normalizes user country and currency settings", async () => {
    const repository = new FakeUserRepository();
    const useCase = new UpdateMyProfileUseCase(repository);

    const profile = await useCase.execute(makeCurrentUser(), {
      countryCode: "us",
      defaultCurrencyCode: "usd",
      timeZone: "America/New_York",
    });

    expect(repository.lastUpdateInput).toEqual({
      timeZone: "America/New_York",
      countryCode: "US",
      defaultCurrencyCode: "USD",
    });
    expect(profile.countryCode).toBe("US");
    expect(profile.defaultCurrencyCode).toBe("USD");
  });

  // 기능 : 지원하지 않는 사용자 locale은 명시적인 필드 오류로 거부합니다.
  it("rejects unsupported user locale settings", async () => {
    const repository = new FakeUserRepository();
    const useCase = new UpdateMyProfileUseCase(repository);

    await expect(
      useCase.execute(makeCurrentUser(), {
        preferredLocale: "unsupported-locale",
      })
    ).rejects.toMatchObject({
      code: "USER_LOCALE_UNSUPPORTED",
      field: "preferredLocale",
    });
  });
});

class FakeUserRepository implements UserRepository {
  lastUpdateInput: UpdateUserProfileInput | null = null;

  async getProfile(): Promise<UserProfileRecord | null> {
    return makeProfile();
  }

  async updateProfile(
    _userId: string,
    input: UpdateUserProfileInput
  ): Promise<UserProfileRecord | null> {
    this.lastUpdateInput = input;
    return makeProfile({
      preferredLocale: input.preferredLocale ?? "ko-KR",
      timeZone: input.timeZone ?? "Asia/Seoul",
      countryCode: input.countryCode ?? "KR",
      defaultCurrencyCode: input.defaultCurrencyCode ?? "KRW",
      name: input.name === undefined ? "User" : input.name,
    });
  }

  async listActiveDevices(): Promise<UserDeviceRecord[]> {
    return [];
  }
}

function makeCurrentUser(): CurrentUserContext {
  return {
    id: "user-1",
    sessionId: "session-1",
    email: "user@example.com",
    displayName: "User",
    role: "USER",
    status: "ACTIVE",
    timeZone: "Asia/Seoul",
  };
}

function makeProfile(
  overrides: Partial<UserProfileRecord> = {}
): UserProfileRecord {
  const now = new Date("2026-07-10T00:00:00.000Z");

  return {
    id: "user-1",
    email: "user@example.com",
    name: "User",
    role: "USER",
    status: "ACTIVE",
    timeZone: "Asia/Seoul",
    preferredLocale: "ko-KR",
    countryCode: "KR",
    defaultCurrencyCode: "KRW",
    signupLocale: "ko-KR",
    signupCountryCode: "KR",
    signupTimeZone: "Asia/Seoul",
    lastLoginLocale: "ko-KR",
    lastLoginCountryCode: "KR",
    lastLoginTimeZone: "Asia/Seoul",
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
    oauthAccounts: [],
    ...overrides,
  };
}
