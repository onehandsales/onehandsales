import { HttpStatus, RequestMethod } from "@nestjs/common";
import {
  GUARDS_METADATA,
  HTTP_CODE_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from "@nestjs/common/constants";
import { CreateWorkspaceObjectRecordDefinitionUseCase } from "@/modules/record-definition/application/use-cases/create-workspace-object-record-definition.use-case";
import { ListWorkspaceObjectRecordDefinitionsUseCase } from "@/modules/record-definition/application/use-cases/list-workspace-object-record-definitions.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UserWorkspaceObjectRecordDefinitionsController } from "./user-workspace-object-record-definitions.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  platformRole: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

// 역할 : CreateWorkspaceObjectRecordDefinitionUseCaseFake controller 테스트용 RecordDefinition 생성 유스케이스 계약을 정의합니다.
type CreateWorkspaceObjectRecordDefinitionUseCaseFake = Pick<
  CreateWorkspaceObjectRecordDefinitionUseCase,
  "execute"
>;

// 역할 : ListWorkspaceObjectRecordDefinitionsUseCaseFake controller 테스트용 RecordDefinition 목록 유스케이스 계약을 정의합니다.
type ListWorkspaceObjectRecordDefinitionsUseCaseFake = Pick<
  ListWorkspaceObjectRecordDefinitionsUseCase,
  "execute"
>;

// 기능 : RecordDefinition 생성 유스케이스 fake를 생성합니다.
function createCreateUseCaseFake(): jest.Mocked<CreateWorkspaceObjectRecordDefinitionUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue({
      recordDefinitionId: "00000000-0000-4000-8000-000000000701",
    }),
  };
}

// 기능 : RecordDefinition 목록 유스케이스 fake를 생성합니다.
function createListUseCaseFake(): jest.Mocked<ListWorkspaceObjectRecordDefinitionsUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue({
      items: [
        {
          id: "00000000-0000-4000-8000-000000000701",
          createdAt: "2026-09-28T00:00:00.000Z",
          updatedAt: "2026-09-28T00:00:00.000Z",
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
        },
      ],
      pageInfo: {
        hasNextPage: false,
        nextCursor: null,
      },
    }),
  };
}

// 기능 : UserWorkspaceObjectRecordDefinitionsController의 HTTP 계약을 검증합니다.
describe("UserWorkspaceObjectRecordDefinitionsController", () => {
  // 1. 이후 단계에서 사용할 controller 값을 준비한다.
  let controller: UserWorkspaceObjectRecordDefinitionsController;
  // 2. 이후 단계에서 사용할 createUseCase 값을 준비한다.
  let createUseCase: jest.Mocked<CreateWorkspaceObjectRecordDefinitionUseCaseFake>;
  // 3. 이후 단계에서 사용할 listUseCase 값을 준비한다.
  let listUseCase: jest.Mocked<ListWorkspaceObjectRecordDefinitionsUseCaseFake>;

  // 4. 테스트마다 필요한 객체를 초기화한다.
  beforeEach(() => {
    // 1. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    createUseCase = createCreateUseCaseFake();
    // 2. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    listUseCase = createListUseCaseFake();

    // 3. controller에 fake 유스케이스를 직접 주입한다.
    controller = new UserWorkspaceObjectRecordDefinitionsController(
      createUseCase as unknown as CreateWorkspaceObjectRecordDefinitionUseCase,
      listUseCase as unknown as ListWorkspaceObjectRecordDefinitionsUseCase
    );
  });

  // 5. 테스트 기대 조건을 검증한다.
  it("uses AuthGuard for workspace object record definition endpoints", () => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        UserWorkspaceObjectRecordDefinitionsController
      )
    ).toContain(AuthGuard);
  });

  // 6. 테스트 기대 조건을 검증한다.
  it("exposes the workspace object record definition create route metadata", () => {
    const handler =
      UserWorkspaceObjectRecordDefinitionsController.prototype
        .createWorkspaceObjectRecordDefinition;

    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        UserWorkspaceObjectRecordDefinitionsController
      )
    ).toBe(
      "api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions"
    );
    expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe("/");
    expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(
      RequestMethod.POST
    );
    expect(Reflect.getMetadata(HTTP_CODE_METADATA, handler)).toBe(
      HttpStatus.CREATED
    );
  });

  // 7. 테스트 기대 조건을 검증한다.
  it("exposes the workspace object record definition list route metadata", () => {
    const handler =
      UserWorkspaceObjectRecordDefinitionsController.prototype
        .listWorkspaceObjectRecordDefinitions;

    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        UserWorkspaceObjectRecordDefinitionsController
      )
    ).toBe(
      "api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions"
    );
    expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe("/");
    expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(
      RequestMethod.GET
    );
  });

  // 8. 필요한 비동기 작업을 실행한다.
  it("creates a workspace object record definition", async () => {
    await expect(
      controller.createWorkspaceObjectRecordDefinition(
        CURRENT_USER,
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501"
      )
    ).resolves.toEqual({
      recordDefinitionId: "00000000-0000-4000-8000-000000000701",
    });

    expect(createUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501"
    );
  });

  // 9. 필요한 비동기 작업을 실행한다.
  it("returns workspace object record definition list", async () => {
    await expect(
      controller.listWorkspaceObjectRecordDefinitions(
        CURRENT_USER,
        "00000000-0000-4000-8000-000000000301",
        "00000000-0000-4000-8000-000000000501",
        {}
      )
    ).resolves.toEqual({
      items: [
        {
          id: "00000000-0000-4000-8000-000000000701",
          createdAt: "2026-09-28T00:00:00.000Z",
          updatedAt: "2026-09-28T00:00:00.000Z",
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
        },
      ],
      pageInfo: {
        hasNextPage: false,
        nextCursor: null,
      },
    });

    expect(listUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      undefined
    );
  });

  // 10. 필요한 비동기 작업을 실행한다.
  it("passes cursor query to the use case", async () => {
    await controller.listWorkspaceObjectRecordDefinitions(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      { cursor: "cursor-value" }
    );

    expect(listUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "cursor-value"
    );
  });
});
