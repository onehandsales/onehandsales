import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type {
  UserDeviceRecord,
  UserJobSelectionOnboardingRecord,
  UserProfileRecord,
  UserRepository,
} from "../ports/user.repository";
import { CompleteJobSelectionOnboardingUseCase } from "./complete-job-selection-onboarding.use-case";

describe("CompleteJobSelectionOnboardingUseCase", () => {
  // 기능 : 직업 선택 온보딩을 처음 완료하면 완료 시각을 저장합니다.
  it("stores the completion timestamp for the current user", async () => {
    const repository = new FakeUserRepository();
    const useCase = new CompleteJobSelectionOnboardingUseCase(repository);

    const result = await useCase.execute(makeCurrentUser());

    expect(repository.lastCompletedUserId).toBe("user-1");
    expect(repository.lastCompletedAt).toBeInstanceOf(Date);
    expect(result.jobSelectOnboardingCompletedAt).toBe(repository.lastCompletedAt);
  });

  // 기능 : 비활성 사용자 또는 없는 사용자는 기존 사용자 오류로 차단합니다.
  it("rejects when the repository cannot complete the active user", async () => {
    const repository = new FakeUserRepository();
    repository.shouldReturnNull = true;
    const useCase = new CompleteJobSelectionOnboardingUseCase(repository);

    await expect(useCase.execute(makeCurrentUser())).rejects.toBeInstanceOf(
      InactiveUserError
    );
  });
});

// 역할 : 테스트용 UserRepository 구현체입니다.
class FakeUserRepository implements UserRepository {
  lastCompletedAt: Date | null = null;
  lastCompletedUserId: string | null = null;
  shouldReturnNull = false;

  // 기능 : 현재 테스트에서 사용하지 않는 프로필 조회를 차단합니다.
  async getProfile(): Promise<UserProfileRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 프로필 수정을 차단합니다.
  async updateProfile(): Promise<UserProfileRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 직업 선택 온보딩 완료 시각을 메모리에 기록합니다.
  async completeJobSelectionOnboarding(
    userId: string,
    now: Date
  ): Promise<UserJobSelectionOnboardingRecord | null> {
    if (this.shouldReturnNull) {
      return null;
    }

    this.lastCompletedUserId = userId;
    this.lastCompletedAt = now;

    return {
      jobSelectOnboardingCompletedAt: now,
    };
  }

  // 기능 : 현재 테스트에서 사용하지 않는 기기 목록 조회를 차단합니다.
  async listActiveDevices(): Promise<UserDeviceRecord[]> {
    throw new Error("Not implemented in fake repository");
  }
}

// 기능 : 테스트용 현재 사용자 컨텍스트를 생성합니다.
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
