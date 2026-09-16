import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type {
  WorkspaceOnboardingPort,
  WorkspaceOnboardingResult,
} from "@/modules/workspace/application/ports/workspace-onboarding.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type {
  TransactionContext,
  TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";
import type {
  UserDeviceRecord,
  UserJobSelectionOnboardingUserRecord,
  UserProfileRecord,
  UserRepository,
} from "../ports/user.repository";
import { CompleteJobSelectionOnboardingUseCase } from "./complete-job-selection-onboarding.use-case";

describe("CompleteJobSelectionOnboardingUseCase", () => {
  // 기능 : 직업 선택 완료와 OWNER Workspace 보장을 같은 transaction 안에서 반환합니다.
  it("stores the completion timestamp and returns the owner workspace", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(makeCurrentUser());

    expect(fixture.transactionManager.transactionCount).toBe(1);
    expect(fixture.repository.lastCompletedUserId).toBe("user-1");
    expect(fixture.repository.lastCompletedAt).toBeInstanceOf(Date);
    expect(fixture.repository.lastContext).toBe(
      fixture.transactionManager.context
    );
    expect(fixture.workspaceOnboarding.lastContext).toBe(
      fixture.transactionManager.context
    );
    expect(result.jobSelectOnboardingCompletedAt).toBe(
      fixture.repository.lastCompletedAt
    );
    expect(result.workspace.id).toBe("workspace-1");
    expect(result.workspace.kind).toBe("PERSONAL");
    expect(result.workspaceMember.role).toBe("OWNER");
  });

  // 기능 : 비활성 사용자 또는 없는 사용자는 기존 사용자 오류로 차단합니다.
  it("rejects when the repository cannot find an active user", async () => {
    const fixture = createFixture();
    fixture.repository.user = null;

    await expect(fixture.useCase.execute(makeCurrentUser())).rejects.toBeInstanceOf(
      InactiveUserError
    );
  });
});

// 기능 : CompleteJobSelectionOnboardingUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const repository = new FakeUserRepository();
  const workspaceOnboarding = new FakeWorkspaceOnboarding();
  const transactionManager = new FakeTransactionManager();

  return {
    repository,
    transactionManager,
    workspaceOnboarding,
    useCase: new CompleteJobSelectionOnboardingUseCase(
      repository,
      workspaceOnboarding,
      transactionManager
    ),
  };
}

// 역할 : 테스트용 UserRepository 구현체입니다.
class FakeUserRepository implements UserRepository {
  lastCompletedAt: Date | null = null;
  lastCompletedUserId: string | null = null;
  lastContext: TransactionContext | null = null;
  user: UserJobSelectionOnboardingUserRecord | null = {
    id: "user-1",
    displayName: "User",
    status: "ACTIVE",
    jobSelectOnboardingCompletedAt: null,
  };

  // 기능 : 현재 테스트에서 사용하지 않는 기존 transaction helper 호출을 차단합니다.
  async runInTransaction<T>(): Promise<T> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 프로필 조회를 차단합니다.
  async getProfile(): Promise<UserProfileRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 프로필 수정을 차단합니다.
  async updateProfile(): Promise<UserProfileRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 직업 선택 온보딩 완료에 필요한 사용자 상태를 반환합니다.
  async findJobSelectionOnboardingUser(
    _userId: string,
    transactionContext?: TransactionContext | null
  ): Promise<UserJobSelectionOnboardingUserRecord | null> {
    this.lastContext = transactionContext ?? null;
    return this.user;
  }

  // 기능 : 직업 선택 온보딩 완료 시각을 메모리에 기록합니다.
  async completeJobSelectionForUser(
    userId: string,
    now: Date,
    transactionContext?: TransactionContext | null
  ): Promise<Date> {
    this.lastContext = transactionContext ?? null;
    this.lastCompletedUserId = userId;
    this.lastCompletedAt = now;
    return now;
  }

  // 기능 : 현재 테스트에서 사용하지 않는 기기 목록 조회를 차단합니다.
  async listActiveDevices(): Promise<UserDeviceRecord[]> {
    throw new Error("Not implemented in fake repository");
  }
}

// 역할 : 테스트용 WorkspaceOnboardingPort 구현체입니다.
class FakeWorkspaceOnboarding implements WorkspaceOnboardingPort {
  lastContext: TransactionContext | null = null;

  // 기능 : 테스트용 OWNER Workspace 보장 결과를 반환합니다.
  async ensureOwnerWorkspaceForOnboarding(input: {
    readonly userId: string;
    readonly displayName: string | null;
    readonly now: Date;
    readonly transactionContext?: TransactionContext | null;
  }): Promise<WorkspaceOnboardingResult> {
    this.lastContext = input.transactionContext ?? null;
    return makeWorkspaceOnboardingResult(input.now);
  }
}

// 역할 : 테스트용 TransactionManager 구현체입니다.
class FakeTransactionManager implements TransactionManager {
  readonly context: TransactionContext = {
    transactionId: Symbol("fakeTransaction"),
  };
  transactionCount = 0;

  // 기능 : 같은 fake transaction context로 작업 callback을 실행합니다.
  async runInTransaction<T>(
    work: (context: TransactionContext) => Promise<T>
  ): Promise<T> {
    this.transactionCount += 1;
    return work(this.context);
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

// 기능 : 테스트용 Workspace onboarding 결과 레코드를 생성합니다.
function makeWorkspaceOnboardingResult(now: Date): WorkspaceOnboardingResult {
  return {
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
