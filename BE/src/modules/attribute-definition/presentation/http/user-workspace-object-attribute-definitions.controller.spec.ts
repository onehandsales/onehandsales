import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { CreateWorkspaceObjectAttributeDefinitionUseCase } from "@/modules/attribute-definition/application/use-cases/create-workspace-object-attribute-definition.use-case";
import { AttributeDefinitionValidationError } from "@/modules/attribute-definition/domain/attribute-definition.errors";
import { GetWorkspaceObjectAttributeDefinitionUseCase } from "@/modules/attribute-definition/application/use-cases/get-workspace-object-attribute-definition.use-case";
import { ListWorkspaceObjectAttributeDefinitionsUseCase } from "@/modules/attribute-definition/application/use-cases/list-workspace-object-attribute-definitions.use-case";
import { MoveWorkspaceObjectAttributeDefinitionUseCase } from "@/modules/attribute-definition/application/use-cases/move-workspace-object-attribute-definition.use-case";
import { UpdateWorkspaceObjectAttributeDefinitionUseCase } from "@/modules/attribute-definition/application/use-cases/update-workspace-object-attribute-definition.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UserWorkspaceObjectAttributeDefinitionsController } from "./user-workspace-object-attribute-definitions.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  platformRole: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

// 역할 : CreateWorkspaceObjectAttributeDefinitionUseCaseFake controller 테스트용 AttributeDefinition 생성 유스케이스 계약을 정의합니다.
type CreateWorkspaceObjectAttributeDefinitionUseCaseFake = Pick<
  CreateWorkspaceObjectAttributeDefinitionUseCase,
  "execute"
>;

// 역할 : ListWorkspaceObjectAttributeDefinitionsUseCaseFake controller 테스트용 AttributeDefinition 목록 유스케이스 계약을 정의합니다.
type ListWorkspaceObjectAttributeDefinitionsUseCaseFake = Pick<
  ListWorkspaceObjectAttributeDefinitionsUseCase,
  "execute"
>;

// 역할 : GetWorkspaceObjectAttributeDefinitionUseCaseFake controller 테스트용 AttributeDefinition 단건 조회 유스케이스 계약을 정의합니다.
type GetWorkspaceObjectAttributeDefinitionUseCaseFake = Pick<
  GetWorkspaceObjectAttributeDefinitionUseCase,
  "execute"
>;

// 역할 : MoveWorkspaceObjectAttributeDefinitionUseCaseFake controller 테스트용 AttributeDefinition 위치 변경 유스케이스 계약을 정의합니다.
type MoveWorkspaceObjectAttributeDefinitionUseCaseFake = Pick<
  MoveWorkspaceObjectAttributeDefinitionUseCase,
  "execute"
>;

// 역할 : UpdateWorkspaceObjectAttributeDefinitionUseCaseFake controller 테스트용 AttributeDefinition 수정 유스케이스 계약을 정의합니다.
type UpdateWorkspaceObjectAttributeDefinitionUseCaseFake = Pick<
  UpdateWorkspaceObjectAttributeDefinitionUseCase,
  "execute"
>;

// 역할 : FakeAuthGuard AttributeDefinition controller 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
class FakeAuthGuard implements CanActivate {
  // 기능 : 테스트 요청을 인증된 사용자 요청으로 처리합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

// 기능 : AttributeDefinition 생성 유스케이스 fake를 생성합니다.
function createCreateUseCaseFake(): jest.Mocked<CreateWorkspaceObjectAttributeDefinitionUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue({
      attributeDefinitionId: "00000000-0000-4000-8000-000000000603",
    }),
  };
}

// 기능 : AttributeDefinition 목록 유스케이스 fake를 생성합니다.
function createListUseCaseFake(): jest.Mocked<ListWorkspaceObjectAttributeDefinitionsUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000601",
        icon: "type",
        title: "company",
        sortOrder: 0,
        type: "Text",
        isMultiselect: false,
        config: null,
      },
      {
        id: "00000000-0000-4000-8000-000000000602",
        icon: "kanban",
        title: "상태",
        sortOrder: 1,
        type: "Status",
        isMultiselect: false,
        config: null,
      },
    ]),
  };
}

// 기능 : AttributeDefinition 단건 조회 유스케이스 fake를 생성합니다.
function createGetUseCaseFake(): jest.Mocked<GetWorkspaceObjectAttributeDefinitionUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000603",
      title: "금액",
      type: "Currency",
      isMultiselect: false,
      description: "계약 금액을 저장해요.",
      icon: "circle-dollar-sign",
      config: {
        currency: {
          defaultCurrencyCode: "KRW",
          displayType: "symbol",
        },
      },
      sortOrder: 2,
    }),
  };
}

// 기능 : AttributeDefinition 위치 변경 유스케이스 fake를 생성합니다.
function createMoveUseCaseFake(): jest.Mocked<MoveWorkspaceObjectAttributeDefinitionUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue({
      attributeDefinitionId: "00000000-0000-4000-8000-000000000603",
    }),
  };
}

// 기능 : AttributeDefinition 수정 유스케이스 fake를 생성합니다.
function createUpdateUseCaseFake(): jest.Mocked<UpdateWorkspaceObjectAttributeDefinitionUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue({
      attributeDefinitionId: "00000000-0000-4000-8000-000000000603",
    }),
  };
}

// 기능 : UserWorkspaceObjectAttributeDefinitionsController의 HTTP 계약을 검증합니다.
describe("UserWorkspaceObjectAttributeDefinitionsController", () => {
  // 1. 이후 단계에서 사용할 app 값을 준비한다.
  let app: INestApplication;
  // 2. 이후 단계에서 사용할 createUseCase 값을 준비한다.
  let createUseCase: jest.Mocked<CreateWorkspaceObjectAttributeDefinitionUseCaseFake>;
  // 3. 이후 단계에서 사용할 listUseCase 값을 준비한다.
  let listUseCase: jest.Mocked<ListWorkspaceObjectAttributeDefinitionsUseCaseFake>;
  // 4. 이후 단계에서 사용할 getUseCase 값을 준비한다.
  let getUseCase: jest.Mocked<GetWorkspaceObjectAttributeDefinitionUseCaseFake>;
  // 4. 이후 단계에서 사용할 moveUseCase 값을 준비한다.
  let moveUseCase: jest.Mocked<MoveWorkspaceObjectAttributeDefinitionUseCaseFake>;
  // 5. 이후 단계에서 사용할 updateUseCase 값을 준비한다.
  let updateUseCase: jest.Mocked<UpdateWorkspaceObjectAttributeDefinitionUseCaseFake>;

  // 6. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    // 1. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    createUseCase = createCreateUseCaseFake();
    // 2. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    listUseCase = createListUseCaseFake();
    // 3. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    getUseCase = createGetUseCaseFake();
    // 4. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    moveUseCase = createMoveUseCaseFake();
    // 5. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    updateUseCase = createUpdateUseCaseFake();

    // 6. 비동기 결과를 받아 moduleRef에 저장한다.
    const moduleRef = await Test.createTestingModule({
      controllers: [UserWorkspaceObjectAttributeDefinitionsController],
      providers: [
        {
          provide: CreateWorkspaceObjectAttributeDefinitionUseCase,
          useValue: createUseCase,
        },
        {
          provide: ListWorkspaceObjectAttributeDefinitionsUseCase,
          useValue: listUseCase,
        },
        {
          provide: GetWorkspaceObjectAttributeDefinitionUseCase,
          useValue: getUseCase,
        },
        {
          provide: MoveWorkspaceObjectAttributeDefinitionUseCase,
          useValue: moveUseCase,
        },
        {
          provide: UpdateWorkspaceObjectAttributeDefinitionUseCase,
          useValue: updateUseCase,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

    // 7. 테스트 Nest application을 초기화한다.
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  // 6. 필요한 비동기 작업을 실행한다.
  afterEach(async () => {
    await app.close();
  });

  // 7. 테스트 기대 조건을 검증한다.
  it("uses AuthGuard for workspace object attribute definition endpoints", () => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        UserWorkspaceObjectAttributeDefinitionsController
      )
    ).toContain(AuthGuard);
  });

  // 8. 필요한 비동기 작업을 실행한다.
  it("creates a workspace object attribute definition", async () => {
    await request(app.getHttpServer())
      .post(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions"
      )
      .send({
        attributeDefinitionName: "금액",
        attributeType: "Currency",
        icon: "circle-dollar-sign",
        description: "계약 금액을 저장해요.",
        config: {
          currency: {
            defaultCurrencyCode: "KRW",
            displayType: "symbol",
          },
        },
      })
      .expect(201)
      .expect({
        attributeDefinitionId: "00000000-0000-4000-8000-000000000603",
      });

    expect(createUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      {
        attributeDefinitionName: "금액",
        attributeType: "Currency",
        icon: "circle-dollar-sign",
        description: "계약 금액을 저장해요.",
        config: {
          currency: {
            defaultCurrencyCode: "KRW",
            displayType: "symbol",
          },
        },
      }
    );
  });

  // 9. 필요한 비동기 작업을 실행한다.
  it("omits missing optional create fields from the command", async () => {
    await request(app.getHttpServer())
      .post(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions"
      )
      .send({
        attributeDefinitionName: "회사번호",
        attributeType: "PhoneNumber",
      })
      .expect(201);

    expect(createUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      {
        attributeDefinitionName: "회사번호",
        attributeType: "PhoneNumber",
      }
    );
  });

  // 10. 필요한 비동기 작업을 실행한다.
  it("passes create insert position to the use case", async () => {
    await request(app.getHttpServer())
      .post(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions"
      )
      .send({
        attributeDefinitionName: "예산",
        attributeType: "Number",
        insertPosition: {
          referenceAttributeDefinitionId:
            "00000000-0000-4000-8000-000000000602",
          side: "before",
        },
      })
      .expect(201);

    expect(createUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      {
        attributeDefinitionName: "예산",
        attributeType: "Number",
        insertPosition: {
          referenceAttributeDefinitionId:
            "00000000-0000-4000-8000-000000000602",
          side: "before",
        },
      }
    );
  });

  // 10. 필요한 비동기 작업을 실행한다.
  it("rejects non-string create fields before calling the use case", async () => {
    await request(app.getHttpServer())
      .post(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions"
      )
      .send({
        attributeDefinitionName: 123,
        attributeType: "PhoneNumber",
      })
      .expect(400);

    expect(createUseCase.execute).not.toHaveBeenCalled();
  });

  // 11. 필요한 비동기 작업을 실행한다.
  it("rejects unknown create fields before calling the use case", async () => {
    await request(app.getHttpServer())
      .post(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions"
      )
      .send({
        attributeDefinitionName: "회사번호",
        attributeType: "PhoneNumber",
        unknownField: "not allowed",
      })
      .expect(400);

    expect(createUseCase.execute).not.toHaveBeenCalled();
  });

  // 12. 필요한 비동기 작업을 실행한다.
  it("returns domain validation error for invalid create insert position", async () => {
    createUseCase.execute.mockRejectedValueOnce(
      new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_INSERT_POSITION_INVALID",
        "insertPosition",
        "Attribute definition insert position is invalid"
      )
    );

    const response = await request(app.getHttpServer())
      .post(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions"
      )
      .send({
        attributeDefinitionName: "회사번호",
        attributeType: "PhoneNumber",
        insertPosition: {
          referenceAttributeDefinitionId: "not-a-uuid",
          side: "left",
          unknownNestedField: "not allowed",
        },
      })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: "ATTRIBUTE_DEFINITION_INSERT_POSITION_INVALID",
      code: "ATTRIBUTE_DEFINITION_INSERT_POSITION_INVALID",
      field: "insertPosition",
    });
    expect(createUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      {
        attributeDefinitionName: "회사번호",
        attributeType: "PhoneNumber",
        insertPosition: {
          referenceAttributeDefinitionId: "not-a-uuid",
          side: "left",
          unknownNestedField: "not allowed",
        },
      }
    );
  });

  // 12. 필요한 비동기 작업을 실행한다.
  it("returns workspace object attribute definition list", async () => {
    await request(app.getHttpServer())
      .get(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions"
      )
      .expect(200)
      .expect([
        {
          id: "00000000-0000-4000-8000-000000000601",
          icon: "type",
          title: "company",
          sortOrder: 0,
          type: "Text",
          isMultiselect: false,
          config: null,
        },
        {
          id: "00000000-0000-4000-8000-000000000602",
          icon: "kanban",
          title: "상태",
          sortOrder: 1,
          type: "Status",
          isMultiselect: false,
          config: null,
        },
      ]);

    expect(listUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501"
    );
  });

  // 13. 필요한 비동기 작업을 실행한다.
  it("returns a workspace object attribute definition detail", async () => {
    await request(app.getHttpServer())
      .get(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions/00000000-0000-4000-8000-000000000603"
      )
      .expect(200)
      .expect({
        id: "00000000-0000-4000-8000-000000000603",
        title: "금액",
        type: "Currency",
        isMultiselect: false,
        description: "계약 금액을 저장해요.",
        icon: "circle-dollar-sign",
        config: {
          currency: {
            defaultCurrencyCode: "KRW",
            displayType: "symbol",
          },
        },
        sortOrder: 2,
      });

    expect(getUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000603"
    );
  });

  // 14. 필요한 비동기 작업을 실행한다.
  it("moves a workspace object attribute definition position", async () => {
    await request(app.getHttpServer())
      .patch(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions/00000000-0000-4000-8000-000000000603/position"
      )
      .send({
        targetPlacementPosition: {
          referenceAttributeDefinitionId:
            "00000000-0000-4000-8000-000000000602",
          side: "after",
        },
      })
      .expect(200)
      .expect({
        attributeDefinitionId: "00000000-0000-4000-8000-000000000603",
      });

    expect(moveUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000603",
      {
        targetPlacementPosition: {
          referenceAttributeDefinitionId:
            "00000000-0000-4000-8000-000000000602",
          side: "after",
        },
      }
    );
  });

  // 15. 필요한 비동기 작업을 실행한다.
  it("rejects unknown move position fields before calling the use case", async () => {
    await request(app.getHttpServer())
      .patch(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions/00000000-0000-4000-8000-000000000603/position"
      )
      .send({
        targetPlacementPosition: {
          referenceAttributeDefinitionId:
            "00000000-0000-4000-8000-000000000602",
          side: "after",
        },
        unknownField: "not allowed",
      })
      .expect(400);

    expect(moveUseCase.execute).not.toHaveBeenCalled();
  });

  // 16. 필요한 비동기 작업을 실행한다.
  it("returns domain validation error for invalid move target placement position", async () => {
    moveUseCase.execute.mockRejectedValueOnce(
      new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_POSITION_INVALID",
        "targetPlacementPosition",
        "Attribute definition target placement position is invalid"
      )
    );

    const response = await request(app.getHttpServer())
      .patch(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions/00000000-0000-4000-8000-000000000603/position"
      )
      .send({
        targetPlacementPosition: {
          referenceAttributeDefinitionId: "not-a-uuid",
          side: "left",
          unknownNestedField: "not allowed",
        },
      })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: "ATTRIBUTE_DEFINITION_POSITION_INVALID",
      code: "ATTRIBUTE_DEFINITION_POSITION_INVALID",
      field: "targetPlacementPosition",
    });
    expect(moveUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000603",
      {
        targetPlacementPosition: {
          referenceAttributeDefinitionId: "not-a-uuid",
          side: "left",
          unknownNestedField: "not allowed",
        },
      }
    );
  });

  // 14. 필요한 비동기 작업을 실행한다.
  it("updates a workspace object attribute definition with sparse patch fields", async () => {
    await request(app.getHttpServer())
      .patch(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions/00000000-0000-4000-8000-000000000603"
      )
      .send({
        title: "계약 금액",
        icon: null,
        isMultiselect: true,
      })
      .expect(200)
      .expect({
        attributeDefinitionId: "00000000-0000-4000-8000-000000000603",
      });

    expect(updateUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000603",
      {
        hasTitle: true,
        title: "계약 금액",
        hasDescription: false,
        hasIcon: true,
        icon: null,
        hasIsMultiselect: true,
        isMultiselect: true,
      }
    );
  });

  // 15. 필요한 비동기 작업을 실행한다.
  it("passes false presence flags for missing update fields", async () => {
    await request(app.getHttpServer())
      .patch(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions/00000000-0000-4000-8000-000000000603"
      )
      .send({
        description: null,
      })
      .expect(200);

    expect(updateUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501",
      "00000000-0000-4000-8000-000000000603",
      {
        hasTitle: false,
        hasDescription: true,
        description: null,
        hasIcon: false,
        hasIsMultiselect: false,
      }
    );
  });

  // 16. 필요한 비동기 작업을 실행한다.
  it("rejects unknown update fields before calling the use case", async () => {
    await request(app.getHttpServer())
      .patch(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions/00000000-0000-4000-8000-000000000603"
      )
      .send({
        title: "계약 금액",
        unknownField: "not allowed",
      })
      .expect(400);

    expect(updateUseCase.execute).not.toHaveBeenCalled();
  });

  // 17. 필요한 비동기 작업을 실행한다.
  it("rejects invalid update field types before calling the use case", async () => {
    await request(app.getHttpServer())
      .patch(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions/00000000-0000-4000-8000-000000000603"
      )
      .send({
        title: null,
        isMultiselect: "true",
      })
      .expect(400);

    expect(updateUseCase.execute).not.toHaveBeenCalled();
  });
});
