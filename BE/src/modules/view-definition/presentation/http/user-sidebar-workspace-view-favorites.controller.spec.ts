import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { ListSidebarViewFavoritesUseCase } from "@/modules/view-definition/application/use-cases/list-sidebar-view-favorites.use-case";
import { ViewFavoriteSidebarWorkspaceNotFoundError } from "@/modules/view-definition/domain/view-definition.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  CURRENT_USER_RESOLVER,
  type CurrentUserResolver,
} from "@/shared/application/ports/current-user-resolver.port";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UserSidebarWorkspaceViewFavoritesController } from "./user-sidebar-workspace-view-favorites.controller";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000301";
const ENDPOINT = `/api/users/me/sidebar/workspaces/${WORKSPACE_ID}/view-favorites`;
const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  platformRole: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

// 기능 : 실제 AuthGuard와 전역 오류 변환을 포함한 View 즐겨찾기 HTTP 계약을 검증합니다.
describe("UserSidebarWorkspaceViewFavoritesController", () => {
  let app: INestApplication;
  let listUseCase: jest.Mocked<Pick<ListSidebarViewFavoritesUseCase, "execute">>;
  let currentUserResolver: jest.Mocked<CurrentUserResolver>;

  // 기능 : 인증 해석과 목록 조회만 대체한 HTTP 테스트 앱을 생성합니다.
  beforeEach(async () => {
    // 1. 토큰 해석과 application 결과를 준비한다.
    currentUserResolver = {
      resolveFromAccessToken: jest.fn().mockResolvedValue(CURRENT_USER),
    };
    listUseCase = {
      execute: jest.fn().mockResolvedValue([
        {
          id: "00000000-0000-4000-8000-000000000501",
          viewDefinitionId: "00000000-0000-4000-8000-000000000801",
          icon: "kanban",
          name: "영업 파이프라인",
        },
        {
          id: "00000000-0000-4000-8000-000000000502",
          viewDefinitionId: "00000000-0000-4000-8000-000000000802",
          icon: null,
          name: "고객 도입",
        },
      ]),
    };

    // 2. Controller와 실제 AuthGuard를 Nest DI로 조립한다.
    const moduleRef = await Test.createTestingModule({
      controllers: [UserSidebarWorkspaceViewFavoritesController],
      providers: [
        AuthGuard,
        { provide: CURRENT_USER_RESOLVER, useValue: currentUserResolver },
        { provide: ListSidebarViewFavoritesUseCase, useValue: listUseCase },
      ],
    }).compile();

    // 3. 런타임과 같은 오류 변환을 적용한다.
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  // 기능 : 테스트 HTTP 앱의 자원을 해제합니다.
  afterEach(async () => {
    await app.close();
  });

  // 기능 : 인증 사용자와 Workspace가 전달되고 요약 필드와 nullable 아이콘이 반환됩니다.
  it("returns sidebar view favorites with names and nullable icons", async () => {
    await request(app.getHttpServer())
      .get(ENDPOINT)
      .set("Authorization", "Bearer valid-token")
      .expect(200)
      .expect([
        {
          id: "00000000-0000-4000-8000-000000000501",
          viewDefinitionId: "00000000-0000-4000-8000-000000000801",
          icon: "kanban",
          name: "영업 파이프라인",
        },
        {
          id: "00000000-0000-4000-8000-000000000502",
          viewDefinitionId: "00000000-0000-4000-8000-000000000802",
          icon: null,
          name: "고객 도입",
        },
      ]);

    expect(currentUserResolver.resolveFromAccessToken).toHaveBeenCalledWith(
      "valid-token"
    );
    expect(listUseCase.execute).toHaveBeenCalledWith(CURRENT_USER, WORKSPACE_ID);
  });

  // 기능 : 즐겨찾기가 없어도 성공 상태와 빈 배열을 반환합니다.
  it("returns 200 with an empty array when there are no favorites", async () => {
    listUseCase.execute.mockResolvedValue([]);

    await request(app.getHttpServer())
      .get(ENDPOINT)
      .set("Authorization", "Bearer valid-token")
      .expect(200)
      .expect([]);
  });

  // 기능 : 인증 헤더가 없으면 사용자 해석과 목록 조회 전에 차단합니다.
  it("returns 401 without an authorization header", async () => {
    await request(app.getHttpServer()).get(ENDPOINT).expect(401);

    expect(currentUserResolver.resolveFromAccessToken).not.toHaveBeenCalled();
    expect(listUseCase.execute).not.toHaveBeenCalled();
  });

  // 기능 : 만료 등 기존 인증 실패를 401로 전달하고 목록 조회를 차단합니다.
  it("returns 401 when the access token cannot resolve a current user", async () => {
    currentUserResolver.resolveFromAccessToken.mockRejectedValue(
      new DomainError("Unauthorized", "Invalid access token")
    );

    await request(app.getHttpServer())
      .get(ENDPOINT)
      .set("Authorization", "Bearer expired-token")
      .expect(401);

    expect(listUseCase.execute).not.toHaveBeenCalled();
  });

  // 기능 : UUID가 아닌 Workspace ID는 application 호출 전에 거부합니다.
  it("returns 400 for an invalid workspace UUID", async () => {
    await request(app.getHttpServer())
      .get("/api/users/me/sidebar/workspaces/not-a-uuid/view-favorites")
      .set("Authorization", "Bearer valid-token")
      .expect(400);

    expect(listUseCase.execute).not.toHaveBeenCalled();
  });

  // 기능 : Workspace 부재와 멤버십 부재를 같은 404 응답으로 변환합니다.
  it("returns the not-found contract for an inaccessible workspace", async () => {
    listUseCase.execute.mockRejectedValue(
      new ViewFavoriteSidebarWorkspaceNotFoundError()
    );

    await request(app.getHttpServer())
      .get(ENDPOINT)
      .set("Authorization", "Bearer valid-token")
      .expect(404)
      .expect({
        statusCode: 404,
        error: "ViewFavoriteSidebarWorkspaceNotFound",
        message: "Workspace not found",
      });
  });

  // 기능 : 클라이언트가 멤버 ID를 보내도 인증 사용자와 Workspace만 application에 전달합니다.
  it("does not accept a client-supplied workspace member as the owner", async () => {
    await request(app.getHttpServer())
      .get(ENDPOINT)
      .query({ workspaceMemberId: "00000000-0000-4000-8000-000000000999" })
      .set("Authorization", "Bearer valid-token")
      .expect(200);

    expect(listUseCase.execute).toHaveBeenCalledWith(CURRENT_USER, WORKSPACE_ID);
  });
});
