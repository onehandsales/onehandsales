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
import { ListWorkspaceObjectAttributeDefinitionsUseCase } from "@/modules/attribute-definition/application/use-cases/list-workspace-object-attribute-definitions.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
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
        type: "Text",
        isMultiselect: false,
      },
      {
        id: "00000000-0000-4000-8000-000000000602",
        icon: "kanban",
        title: "상태",
        type: "Status",
        isMultiselect: false,
      },
    ]),
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

  // 4. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    // 1. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    createUseCase = createCreateUseCaseFake();
    // 2. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    listUseCase = createListUseCaseFake();

    // 3. 비동기 결과를 받아 moduleRef에 저장한다.
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
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

    // 4. 테스트 Nest application을 초기화한다.
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
  });

  // 5. 필요한 비동기 작업을 실행한다.
  afterEach(async () => {
    await app.close();
  });

  // 6. 테스트 기대 조건을 검증한다.
  it("uses AuthGuard for workspace object attribute definition endpoints", () => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        UserWorkspaceObjectAttributeDefinitionsController
      )
    ).toContain(AuthGuard);
  });

  // 7. 필요한 비동기 작업을 실행한다.
  it("creates a workspace object attribute definition", async () => {
    await request(app.getHttpServer())
      .post(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions/00000000-0000-4000-8000-000000000501/attribute-definitions"
      )
      .send({
        attributeDefinitionName: "회사번호",
        attributeType: "PhoneNumber",
        icon: "phone",
        description: "대표 전화번호를 저장해요.",
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
        attributeDefinitionName: "회사번호",
        attributeType: "PhoneNumber",
        icon: "phone",
        description: "대표 전화번호를 저장해요.",
      }
    );
  });

  // 8. 필요한 비동기 작업을 실행한다.
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

  // 9. 필요한 비동기 작업을 실행한다.
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

  // 10. 필요한 비동기 작업을 실행한다.
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

  // 11. 필요한 비동기 작업을 실행한다.
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
          type: "Text",
          isMultiselect: false,
        },
        {
          id: "00000000-0000-4000-8000-000000000602",
          icon: "kanban",
          title: "상태",
          type: "Status",
          isMultiselect: false,
        },
      ]);

    expect(listUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301",
      "00000000-0000-4000-8000-000000000501"
    );
  });
});
