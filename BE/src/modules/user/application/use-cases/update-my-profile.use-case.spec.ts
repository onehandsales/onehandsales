import { UpdateMyProfileUseCase } from "./update-my-profile.use-case";
import type {
  UpdateUserProfileInput,
  UserDeviceRecord,
  UserJobSelectionOnboardingUserRecord,
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

  // 기능 : 기본 국가와 기본 통화 입력값을 대문자 지정값으로 정규화합니다.
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

// 역할 : FakeUserRepository 영속성 계약을 구현합니다.
class FakeUserRepository implements UserRepository {
  lastUpdateInput: UpdateUserProfileInput | null = null;

  // 기능 : 테스트용 트랜잭션 경계를 같은 fake 저장소로 실행합니다.
  async runInTransaction<T>(
    work: (repository: UserRepository) => Promise<T>
  ): Promise<T> {
    return work(this);
  }

  // 기능 : 프로필 정보를 조회합니다.
  async getProfile(): Promise<UserProfileRecord | null> {
    return makeProfile();
  }

  // 기능 : update profile 정보를 수정합니다.
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

  // 기능 : 현재 테스트에서 사용하지 않는 직업 선택 온보딩 응답을 반환합니다.
  async findJobSelectionOnboardingUser(): Promise<UserJobSelectionOnboardingUserRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 온보딩 완료 시각 저장을 차단합니다.
  async completeJobSelectionForUser(): Promise<Date> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : list active devices 목록을 조회합니다.
  async listActiveDevices(): Promise<UserDeviceRecord[]> {
    return [];
  }
}

// 기능 : make current user 테스트 fixture 값을 생성합니다.
function makeCurrentUser(): CurrentUserContext {
  return {
    id: "user-1",
    sessionId: "session-1",
    email: "user@example.com",
    displayName: "User",
    platformRole: "USER",
    status: "ACTIVE",
    timeZone: "Asia/Seoul",
  };
}

// 기능 : make profile 테스트 fixture 값을 생성합니다.
function makeProfile(
  overrides: Partial<UserProfileRecord> = {}
): UserProfileRecord {
  const now = new Date("2026-07-10T00:00:00.000Z");

  return {
    id: "user-1",
    email: "user@example.com",
    name: "User",
    platformRole: "USER",
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
    jobSelectOnboardingCompletedAt: null,
    createdAt: now,
    updatedAt: now,
    oauthAccounts: [],
    ...overrides,
  };
}
