import { Buffer } from "node:buffer";
import type {
  RecordDefinitionListQuery,
  WorkspaceObjectRecordDefinitionListInput,
  WorkspaceObjectRecordDefinitionListItem,
  WorkspaceObjectRecordDefinitionListPage,
} from "@/modules/record-definition/application/ports/record-definition-list-query.port";
import {
  RecordDefinitionObjectDefinitionNotFoundError,
  RecordDefinitionWorkspaceNotFoundError,
} from "@/modules/record-definition/domain/record-definition.errors";
import type {
  ObjectDefinitionAccessQuery,
  ObjectDefinitionWorkspaceLookupInput,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import type {
  WorkspaceAccessQuery,
  WorkspaceMemberAccess,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { ListWorkspaceObjectRecordDefinitionsUseCase } from "./list-workspace-object-record-definitions.use-case";

// 기능 : ListWorkspaceObjectRecordDefinitionsUseCase 동작을 검증합니다.
describe("ListWorkspaceObjectRecordDefinitionsUseCase", () => {
  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition의 RecordDefinition page를 반환합니다.
  it("returns record definitions for an accessible workspace object", async () => {
    const fixture = createFixture();

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501"
    );

    expect(fixture.workspaceAccessQuery.lastInput).toEqual({
      userId: "00000000-0000-4000-8000-000000000101",
      workspaceId: "00000000-0000-4000-8000-000000000301",
    });
    expect(fixture.objectDefinitionAccessQuery.lastInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
    });
    expect(fixture.recordDefinitionListQuery.lastInput).toEqual({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      cursor: null,
      pageSize: 25,
    });
    expect(result).toEqual({
      items: fixture.recordDefinitionListQuery.page.items,
      pageInfo: {
        hasNextPage: false,
        nextCursor: null,
      },
    });
  });

  // 기능 : 다음 page가 있으면 마지막 row 기준 nextCursor를 반환합니다.
  it("returns next cursor when the page has more records", async () => {
    const fixture = createFixture();
    fixture.recordDefinitionListQuery.page = {
      items: [
        makeRecordDefinitionListItem(
          "00000000-0000-4000-8000-000000000701",
          "2026-09-28T00:00:00.000Z"
        ),
      ],
      hasNextPage: true,
    };

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501"
    );

    expect(result.pageInfo.hasNextPage).toBe(true);
    expect(result.pageInfo.nextCursor).toBe(
      encodeCursor({
        createdAt: "2026-09-28T00:00:00.000Z",
        id: "00000000-0000-4000-8000-000000000701",
      })
    );
  });

  // 기능 : 전달받은 cursor를 RecordDefinition 페이지 기준으로 복원합니다.
  it("decodes cursor before querying the next page", async () => {
    const fixture = createFixture();
    const cursor = encodeCursor({
      createdAt: "2026-09-28T00:00:00.000Z",
      id: "00000000-0000-4000-8000-000000000701",
    });

    await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      cursor
    );

    expect(fixture.recordDefinitionListQuery.lastInput?.cursor).toEqual({
      createdAt: new Date("2026-09-28T00:00:00.000Z"),
      id: "00000000-0000-4000-8000-000000000701",
    });
  });

  // 기능 : 현재 사용자가 Workspace 멤버가 아니면 RecordDefinition 조회를 차단합니다.
  it("throws not found when the current user is not a workspace member", async () => {
    const fixture = createFixture();
    fixture.workspaceAccessQuery.hasMembership = false;

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000302",
        "00000000-0000-4000-8000-000000000501"
      )
    ).rejects.toBeInstanceOf(RecordDefinitionWorkspaceNotFoundError);

    expect(fixture.objectDefinitionAccessQuery.lastInput).toBeNull();
    expect(fixture.recordDefinitionListQuery.lastInput).toBeNull();
  });

  // 기능 : 요청 ObjectDefinition이 Workspace에 속하지 않으면 RecordDefinition 조회를 차단합니다.
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

    expect(fixture.recordDefinitionListQuery.lastInput).toBeNull();
  });

  // 기능 : cursor 형식이 올바르지 않으면 검증 오류를 반환합니다.
  it("throws validation error when cursor is invalid", async () => {
    const fixture = createFixture();

    await expect(
      fixture.useCase.execute(
        makeCurrentUser(),
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        "invalid-cursor"
      )
    ).rejects.toBeInstanceOf(ValidationDomainError);

    expect(fixture.recordDefinitionListQuery.lastInput).toBeNull();
  });

  // 기능 : RecordDefinition이 없으면 빈 page를 반환합니다.
  it("returns an empty page when the object has no records", async () => {
    const fixture = createFixture();
    fixture.recordDefinitionListQuery.page = {
      items: [],
      hasNextPage: false,
    };

    const result = await fixture.useCase.execute(
      makeCurrentUser(),
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501"
    );

    expect(result).toEqual({
      items: [],
      pageInfo: {
        hasNextPage: false,
        nextCursor: null,
      },
    });
  });
});

// 기능 : ListWorkspaceObjectRecordDefinitionsUseCase 테스트 fixture를 생성합니다.
function createFixture() {
  const workspaceAccessQuery = new FakeWorkspaceAccessQuery();
  const objectDefinitionAccessQuery = new FakeObjectDefinitionAccessQuery();
  const recordDefinitionListQuery = new FakeRecordDefinitionListQuery();

  return {
    workspaceAccessQuery,
    objectDefinitionAccessQuery,
    recordDefinitionListQuery,
    useCase: new ListWorkspaceObjectRecordDefinitionsUseCase(
      workspaceAccessQuery,
      objectDefinitionAccessQuery,
      recordDefinitionListQuery
    ),
  };
}

// 역할 : FakeWorkspaceAccessQuery RecordDefinition 조회 테스트용 Workspace 접근 확인 구현체입니다.
class FakeWorkspaceAccessQuery implements WorkspaceAccessQuery {
  hasMembership = true;
  lastInput: { readonly userId: string; readonly workspaceId: string } | null =
    null;

  // 기능 : 테스트용 Workspace membership 존재 여부를 반환합니다.
  async hasWorkspaceMembership(
    userId: string,
    workspaceId: string
  ): Promise<boolean> {
    this.lastInput = { userId, workspaceId };
    return this.hasMembership;
  }

  // 기능 : 현재 테스트에서 사용하지 않는 생성 감사 Actor 조회 호출을 차단합니다.
  async getWorkspaceMemberAccess(): Promise<WorkspaceMemberAccess | null> {
    throw new Error("Not implemented in fake query");
  }
}

// 역할 : FakeObjectDefinitionAccessQuery RecordDefinition 조회 테스트용 ObjectDefinition 접근 확인 구현체입니다.
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

// 역할 : FakeRecordDefinitionListQuery RecordDefinition 목록 조회 테스트용 구현체입니다.
class FakeRecordDefinitionListQuery implements RecordDefinitionListQuery {
  lastInput: WorkspaceObjectRecordDefinitionListInput | null = null;
  page: WorkspaceObjectRecordDefinitionListPage = {
    items: [
      makeRecordDefinitionListItem(
        "00000000-0000-4000-8000-000000000701",
        "2026-09-28T00:00:00.000Z"
      ),
    ],
    hasNextPage: false,
  };

  // 기능 : 테스트용 RecordDefinition page를 반환합니다.
  async listWorkspaceObjectRecordDefinitions(
    input: WorkspaceObjectRecordDefinitionListInput
  ): Promise<WorkspaceObjectRecordDefinitionListPage> {
    this.lastInput = input;
    return this.page;
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

// 기능 : 테스트용 RecordDefinition 목록 item을 생성합니다.
function makeRecordDefinitionListItem(
  id: string,
  createdAt: string
): WorkspaceObjectRecordDefinitionListItem {
  return {
    id,
    createdAt,
    updatedAt: createdAt,
    recordAttributeValues: [
      {
        id: "00000000-0000-4000-8000-000000000801",
        attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
        attributeType: "Text",
        textValue: "회사명",
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        timestampValue: null,
        jsonValue: null,
        selectOptionId: null,
        statusOptionId: null,
        targetRecordDefinitionId: null,
        targetObjectDefinitionId: null,
        targetActorId: null,
      },
    ],
  };
}

// 기능 : 테스트용 cursor 문자열을 생성합니다.
function encodeCursor(input: {
  readonly createdAt: string;
  readonly id: string;
}): string {
  return Buffer.from(JSON.stringify(input), "utf8").toString("base64url");
}
