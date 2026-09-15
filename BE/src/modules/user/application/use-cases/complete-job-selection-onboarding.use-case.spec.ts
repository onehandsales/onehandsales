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
  // 기능 : 직업 선택 완료와 OWNER 워크스페이스 정보를 트랜잭션 안에서 반환합니다.
  it("stores the completion timestamp and returns the owner workspace", async () => {
    const repository = new FakeUserRepository();
    const useCase = new CompleteJobSelectionOnboardingUseCase(repository);

    const result = await useCase.execute(makeCurrentUser());

    expect(repository.transactionCount).toBe(1);
    expect(repository.lastCompletedUserId).toBe("user-1");
    expect(repository.lastCompletedAt).toBeInstanceOf(Date);
    expect(result.jobSelectOnboardingCompletedAt).toBe(repository.lastCompletedAt);
    expect(result.workspace.id).toBe("workspace-1");
    expect(result.workspace.kind).toBe("PERSONAL");
    expect(result.workspaceMember.role).toBe("OWNER");
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
  transactionCount = 0;

  // 기능 : 테스트용 트랜잭션 경계를 기록하고 같은 fake 저장소로 작업을 실행합니다.
  async runInTransaction<T>(
    work: (repository: UserRepository) => Promise<T>
  ): Promise<T> {
    this.transactionCount += 1;
    return work(this);
  }

  // 기능 : 현재 테스트에서 사용하지 않는 프로필 조회를 차단합니다.
  async getProfile(): Promise<UserProfileRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 프로필 수정을 차단합니다.
  async updateProfile(): Promise<UserProfileRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 직업 선택 완료 시각을 메모리에 기록하고 기본 OWNER 워크스페이스를 반환합니다.
  async completeJobSelectionOnboarding(
    userId: string,
    now: Date
  ): Promise<UserJobSelectionOnboardingRecord | null> {
    if (this.shouldReturnNull) {
      return null;
    }

    this.lastCompletedUserId = userId;
    this.lastCompletedAt = now;

    return makeJobSelectionOnboardingRecord(now);
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
    platformRole: "USER",
    status: "ACTIVE",
    timeZone: "Asia/Seoul",
  };
}

// 기능 : 테스트용 직업 선택 온보딩 응답 레코드를 생성합니다.
function makeJobSelectionOnboardingRecord(
  now: Date
): UserJobSelectionOnboardingRecord {
  return {
    jobSelectOnboardingCompletedAt: now,
    workspace: {
      id: "workspace-1",
      name: "User Workspace",
      kind: "PERSONAL",
      organizationName: null,
      organizationDomain: null,
      createdAt: now,
      updatedAt: now,
    },
    workspaceMember: {
      id: "workspace-member-1",
      workspaceId: "workspace-1",
      userId: "user-1",
      role: "OWNER",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  };
}
