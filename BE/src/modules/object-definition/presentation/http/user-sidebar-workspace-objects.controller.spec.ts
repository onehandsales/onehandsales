import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
} from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { ListSidebarObjectDefinitionsUseCase } from "@/modules/object-definition/application/use-cases/list-sidebar-object-definitions.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UserSidebarWorkspaceObjectsController } from "./user-sidebar-workspace-objects.controller";

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

// 역할 : ListSidebarObjectDefinitionsUseCaseFake controller 테스트용 ObjectDefinition 목록 유스케이스 계약을 정의합니다.
type ListSidebarObjectDefinitionsUseCaseFake = Pick<
  ListSidebarObjectDefinitionsUseCase,
  "execute"
>;

// 역할 : FakeAuthGuard 사이드바 ObjectDefinition controller 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
class FakeAuthGuard implements CanActivate {
  // 기능 : 테스트 요청을 인증된 사용자 요청으로 처리합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

// 기능 : ObjectDefinition 목록 유스케이스 fake를 생성합니다.
function createListUseCaseFake(): jest.Mocked<ListSidebarObjectDefinitionsUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000501",
        icon: "users",
        singularName: "고객",
        pluralName: "고객",
      },
    ]),
  };
}

// 기능 : UserSidebarWorkspaceObjectsController의 HTTP 계약을 검증합니다.
describe("UserSidebarWorkspaceObjectsController", () => {
  // 1. 이후 단계에서 사용할 app 값을 준비한다.
  let app: INestApplication;
  // 2. 이후 단계에서 사용할 listUseCase 값을 준비한다.
  let listUseCase: jest.Mocked<ListSidebarObjectDefinitionsUseCaseFake>;

  // 3. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    // 1. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    listUseCase = createListUseCaseFake();

    // 2. 비동기 결과를 받아 moduleRef에 저장한다.
    const moduleRef = await Test.createTestingModule({
      controllers: [UserSidebarWorkspaceObjectsController],
      providers: [
        {
          provide: ListSidebarObjectDefinitionsUseCase,
          useValue: listUseCase,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

    // 3. 테스트 Nest application을 초기화한다.
    app = moduleRef.createNestApplication();
    await app.init();
  });

  // 4. 필요한 비동기 작업을 실행한다.
  afterEach(async () => {
    await app.close();
  });

  // 5. 테스트 기대 조건을 검증한다.
  it("uses AuthGuard for sidebar object definition endpoints", () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, UserSidebarWorkspaceObjectsController)
    ).toContain(AuthGuard);
  });

  // 6. 필요한 비동기 작업을 실행한다.
  it("returns sidebar object definition list", async () => {
    await request(app.getHttpServer())
      .get(
        "/api/users/me/sidebar/workspaces/00000000-0000-4000-8000-000000000301/objects"
      )
      .expect(200)
      .expect([
        {
          id: "00000000-0000-4000-8000-000000000501",
          icon: "users",
          singularName: "고객",
          pluralName: "고객",
        },
      ]);

    expect(listUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301"
    );
  });
});
