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
    ["zh", "zh-TW"],
    ["zh_Hant_TW", "zh-TW"],
    ["zh-Hans", "ko-KR"],
    ["zh_Hans", "ko-KR"],
    ["en-SG", "en-SG"],
    ["en-AU", "en-AU"],
    ["en-CA", "en-CA"],
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
