import type {
  CreateWorkspaceWithOwnerInput,
  CreateWorkspaceWithOwnerResult,
  WorkspaceCommandRepository,
} from "@/modules/workspace/application/ports/workspace-command.repository";
import { WorkspaceValidationError } from "@/modules/workspace/domain/workspace.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type {
  TransactionContext,
  TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";
import { CreateMyWorkspaceUseCase } from "./create-my-workspace.use-case";

// 기능 : CreateMyWorkspaceUseCase 동작을 검증합니다.
describe("CreateMyWorkspaceUseCase", () => {
  // 기능 : 입력 이름을 표시 이름으로 변환하고 OWNER Workspace를 생성합니다.
  it("creates a personal workspace with the current user as owner", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(makeCurrentUser(), {
      workspaceName: "  부동산  ",
    });

    expect(fixture.repository.lastInput).toEqual({
      name: "부동산's Workspace",
      ownerUserId: "00000000-0000-4000-8000-000000000101",
      ownerDisplayName: "User",
      ownerEmail: "user@example.com",
      now: expect.any(Date),
      transactionContext: fixture.transactionManager.context,
    });
    expect(fixture.transactionManager.transactionCount).toBe(1);
    expect(result).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
    });
  });

  // 기능 : 공백 이름은 Workspace 생성을 차단합니다.
  it("rejects blank workspace names", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(makeCurrentUser(), { workspaceName: "   " })
    ).rejects.toMatchObject({
      code: "WORKSPACE_NAME_REQUIRED",
    } satisfies Partial<WorkspaceValidationError>);

    expect(fixture.repository.lastInput).toBeNull();
  });

  // 기능 : 너무 긴 Workspace 이름은 저장하지 않습니다.
  it("rejects workspace names longer than 80 characters", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(makeCurrentUser(), { workspaceName: "가".repeat(81) })
    ).rejects.toMatchObject({
      code: "WORKSPACE_NAME_TOO_LONG",
    } satisfies Partial<WorkspaceValidationError>);

    expect(fixture.repository.lastInput).toBeNull();
  });
});

// 기능 : CreateMyWorkspaceUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const repository = new FakeWorkspaceCommandRepository();
  const transactionManager = new FakeTransactionManager();

  return {
    repository,
    transactionManager,
    useCase: new CreateMyWorkspaceUseCase(repository, transactionManager),
  };
}

// 역할 : FakeWorkspaceCommandRepository 생성 유스케이스 테스트용 WorkspaceCommandRepository 구현체입니다.
class FakeWorkspaceCommandRepository implements WorkspaceCommandRepository {
  lastInput: CreateWorkspaceWithOwnerInput | null = null;

  // 기능 : 테스트용 Workspace 생성 결과를 반환합니다.
  async createWorkspaceWithOwner(
    input: CreateWorkspaceWithOwnerInput
  ): Promise<CreateWorkspaceWithOwnerResult> {
    this.lastInput = input;

    return {
      workspaceId: "00000000-0000-4000-8000-000000000301",
    };
  }
}

// 역할 : FakeTransactionManager 생성 유스케이스 테스트용 transaction manager입니다.
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
    id: "00000000-0000-4000-8000-000000000101",
    sessionId: "00000000-0000-4000-8000-000000000201",
    email: "user@example.com",
    displayName: "User",
    platformRole: "USER",
    status: "ACTIVE",
    timeZone: "Asia/Seoul",
  };
}
