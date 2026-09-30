import type {
  ObjectDefinitionAccessQuery,
  ObjectDefinitionWorkspaceLookupInput,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import type {
  CreateRecordDefinitionInput,
  CreateRecordDefinitionResult,
  RecordDefinitionCommandRepository,
} from "@/modules/record-definition/application/ports/record-definition-command.repository";
import {
  RecordDefinitionObjectDefinitionNotFoundError,
  RecordDefinitionWorkspaceNotFoundError,
} from "@/modules/record-definition/domain/record-definition.errors";
import type {
  WorkspaceAccessQuery,
  WorkspaceMemberAccess,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import { CreateWorkspaceObjectRecordDefinitionUseCase } from "./create-workspace-object-record-definition.use-case";

// 기능 : CreateWorkspaceObjectRecordDefinitionUseCase 동작을 검증합니다.
describe("CreateWorkspaceObjectRecordDefinitionUseCase", () => {
  // 기능 : 접근 가능한 Workspace ObjectDefinition에 빈 RecordDefinition을 생성합니다.
  it("creates a record definition for an accessible workspace object", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501"
    );

    expect(fixture.workspaceAccessQuery.lastAccessInput).toEqual({
      userId: "00000000-0000-4000-8000-000000000101",
      workspaceId: "00000000-0000-4000-8000-000000000301",
    });
    expect(fixture.objectDefinitionAccessQuery.lastInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
    });
    expect(fixture.repository.lastCreateInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      createdByActorId: "00000000-0000-4000-8000-000000000401",
    });
    expect(fixture.logger.log).toHaveBeenCalledWith(
      expect.stringContaining("crm.recordDefinition.created"),
      "CreateWorkspaceObjectRecordDefinitionUseCase"
    );
    expect(result).toEqual({
      recordDefinitionId: "00000000-0000-4000-8000-000000000701",
    });
  });

  // 기능 : 현재 사용자가 Workspace 멤버가 아니면 생성을 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.workspaceMemberAccess = null;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000302",
        "00000000-0000-4000-8000-000000000501"
      )
    ).rejects.toBeInstanceOf(RecordDefinitionWorkspaceNotFoundError);

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
  });

  // 기능 : WorkspaceMember에 연결된 Actor가 없으면 내부 정합성 오류로 중단합니다.
  it("throws when the workspace member actor is missing", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.workspaceMemberAccess = {
      workspaceMemberId: "00000000-0000-4000-8000-000000000321",
      actorId: null,
    };

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501"
      )
    ).rejects.toThrow("Workspace member actor is missing");

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.repository.lastCreateInput).toBeNull();
  });

  // 기능 : 요청 ObjectDefinition이 Workspace에 속하지 않으면 생성을 차단합니다.
  it("throws not found when the object definition is outside the workspace", async () => {
    const fixture = createFixture();
    fixture.objectDefinitionAccessQuery.hasObjectDefinition = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000599"
      )
    ).rejects.toBeInstanceOf(RecordDefinitionObjectDefinitionNotFoundError);

    expect(fixture.repository.lastCreateInput).toBeNull();
  });
});

// 기능 : CreateWorkspaceObjectRecordDefinitionUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const workspaceAccessQuery = new FakeWorkspaceAccessQuery();
  const objectDefinitionAccessQuery = new FakeObjectDefinitionAccessQuery();
  const repository = new FakeRecordDefinitionCommandRepository();
  const logger = createLoggerFake();

  return {
    workspaceAccessQuery,
    objectDefinitionAccessQuery,
    repository,
    logger,
    useCase: new CreateWorkspaceObjectRecordDefinitionUseCase(
      workspaceAccessQuery,
      objectDefinitionAccessQuery,
      repository,
      logger
    ),
  };
}

// 역할 : FakeWorkspaceAccessQuery RecordDefinition 생성 테스트용 Workspace 접근 확인 구현체입니다.
class FakeWorkspaceAccessQuery implements WorkspaceAccessQuery {
  workspaceMemberAccess: WorkspaceMemberAccess | null = {
    workspaceMemberId: "00000000-0000-4000-8000-000000000321",
    actorId: "00000000-0000-4000-8000-000000000401",
  };
  lastAccessInput: {
    readonly userId: string;
    readonly workspaceId: string;
  } | null = null;

  // 기능 : 현재 테스트에서 사용하지 않는 membership 존재 여부 호출을 차단합니다.
  async hasWorkspaceMembership(): Promise<boolean> {
    throw new Error("Not implemented in fake query");
  }

  // 기능 : 테스트용 Workspace membership과 Actor 조회 결과를 반환합니다.
  async getWorkspaceMemberAccess(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceMemberAccess | null> {
    this.lastAccessInput = { userId, workspaceId };
    return this.workspaceMemberAccess;
  }
}

// 역할 : FakeObjectDefinitionAccessQuery RecordDefinition 생성 테스트용 ObjectDefinition 접근 확인 구현체입니다.
class FakeObjectDefinitionAccessQuery implements ObjectDefinitionAccessQuery {
  hasObjectDefinition = true;
  lastInput: ObjectDefinitionWorkspaceLookupInput | null = null;

  // 기능 : 테스트용 ObjectDefinition Workspace 소속 여부를 반환합니다.
  async hasObjectDefinitionInWorkspace(
    input: ObjectDefinitionWorkspaceLookupInput
  ): Promise<boolean> {
    this.lastInput = input;
    return this.hasObjectDefinition;
  }
}

// 역할 : FakeRecordDefinitionCommandRepository 생성 유스케이스 테스트용 RecordDefinition 저장소입니다.
class FakeRecordDefinitionCommandRepository
  implements RecordDefinitionCommandRepository
{
  lastCreateInput: CreateRecordDefinitionInput | null = null;

  // 기능 : 테스트용 RecordDefinition 생성 결과를 반환합니다.
  async createRecordDefinition(
    input: CreateRecordDefinitionInput
  ): Promise<CreateRecordDefinitionResult> {
    this.lastCreateInput = input;

    return {
      id: "00000000-0000-4000-8000-000000000701",
    };
  }
}

// 기능 : 테스트용 application logger fake를 생성합니다.
function createLoggerFake(): jest.Mocked<ApplicationLogger> {
  return {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };
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
