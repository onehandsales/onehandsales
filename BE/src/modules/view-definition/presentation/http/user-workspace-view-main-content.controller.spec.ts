import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { WORKSPACE_ACCESS_QUERY } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { WORKSPACE_SNAPSHOT_QUERY } from "@/modules/workspace/application/ports/workspace-snapshot-query.port";
import { READ_SNAPSHOT_RUNNER } from "@/shared/application/ports/read-snapshot-runner.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { VIEW_DATA_CONFIGURATION_QUERY } from "../../application/ports/view-data-configuration-query.port";
import { VIEW_DATA_TOKEN_CODEC } from "../../application/ports/view-data-token-codec.port";
import { VIEW_HEADER_CLOCK } from "../../application/ports/view-header-configuration-query.port";
import { GetWorkspaceViewMainContentUseCase } from "../../application/use-cases/get-workspace-view-main-content.use-case";
import { ViewDataLoader } from "../../application/view-data/view-data-loader";
import {
  viewDataFixture,
  fixtureId,
  fixtureUser,
} from "../../application/view-data/view-data.fixture";
import { EncryptedViewDataTokenCodec } from "../../infrastructure/view-data-token-codec";
import { UserWorkspaceViewMainContentController } from "./user-workspace-view-main-content.controller";

// 기능 : 실제 Guard·Controller·UseCase·실행기의 HTTP 읽기 계약을 검증합니다.
describe("View main data HTTP", () => {
  let app: INestApplication;
  let snapshot = viewDataFixture("TABLE");
  const access = { hasWorkspaceMembership: jest.fn() },
    membership = { hasMembership: jest.fn() },
    views = { read: jest.fn() },
    loader = { load: jest.fn() };
  const logger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const context: TransactionContext = { transactionId: Symbol("test-read") };
  const snapshots = {
    run: jest.fn(
      (work: (transaction: TransactionContext) => Promise<unknown>) =>
        work(context),
    ),
  };
  const path = `/api/users/me/workspaces/${fixtureId(3)}/view-definitions/${fixtureId(4)}/data`;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserWorkspaceViewMainContentController],
      providers: [
        AuthGuard,
        GetWorkspaceViewMainContentUseCase,
        {
          provide: CURRENT_USER_RESOLVER,
          useValue: { resolveFromAccessToken: async () => fixtureUser },
        },
        { provide: WORKSPACE_ACCESS_QUERY, useValue: access },
        { provide: WORKSPACE_SNAPSHOT_QUERY, useValue: membership },
        { provide: READ_SNAPSHOT_RUNNER, useValue: snapshots },
        { provide: VIEW_DATA_CONFIGURATION_QUERY, useValue: views },
        { provide: ViewDataLoader, useValue: loader },
        {
          provide: VIEW_DATA_TOKEN_CODEC,
          useValue: new EncryptedViewDataTokenCodec("http-test"),
        },
        {
          provide: VIEW_HEADER_CLOCK,
          useValue: () => Date.parse("2026-11-01T00:00:00Z"),
        },
        { provide: APPLICATION_LOGGER, useValue: logger },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    snapshot = viewDataFixture("TABLE");
    access.hasWorkspaceMembership.mockResolvedValue(true);
    membership.hasMembership.mockResolvedValue(true);
    views.read.mockImplementation(async () => snapshot.configuration);
    loader.load.mockImplementation(async () => snapshot);
  });
  afterAll(async () => {
    await app.close();
  });
  it("returns the selected View and passes one read context to each owner", async () => {
    const response = await request(app.getHttpServer())
      .get(path + "?sourceType=LIST&limit=1")
      .set("Authorization", "Bearer test")
      .expect(200);
    expect(response.body).toMatchObject({
      viewType: "TABLE",
      state: "READY",
      source: { itemKind: "LIST_ENTRY" },
      summary: { sourceItemCount: 3 },
    });
    expect(response.body.data.items).toHaveLength(1);
    expect(membership.hasMembership).toHaveBeenCalledWith(
      fixtureUser.id,
      fixtureId(3),
      context,
    );
    expect(loader.load).toHaveBeenCalledWith(
      snapshot.configuration,
      snapshot.source,
      context,
    );
    expect(snapshots.run).toHaveBeenCalledTimes(1);
  });
  it("rejects unauthenticated requests before application access", async () => {
    await request(app.getHttpServer()).get(path).expect(401);
    expect(access.hasWorkspaceMembership).not.toHaveBeenCalled();
  });
  it("does not query View existence for a nonmember", async () => {
    access.hasWorkspaceMembership.mockResolvedValue(false);
    await request(app.getHttpServer())
      .get(path)
      .set("Authorization", "Bearer test")
      .expect(404);
    expect(views.read).not.toHaveBeenCalled();
    expect(snapshots.run).not.toHaveBeenCalled();
  });
  it("rechecks membership inside the snapshot before reading values", async () => {
    membership.hasMembership.mockResolvedValue(false);
    await request(app.getHttpServer())
      .get(path)
      .set("Authorization", "Bearer test")
      .expect(404);
    expect(views.read).not.toHaveBeenCalled();
    expect(loader.load).not.toHaveBeenCalled();
  });
  it.each([
    "unknown=x",
    "limit=101",
    "limit=1.5",
    "q=a&q=b",
    "sourceType=LIST&sourceType=OBJECT",
    "bounds=oops",
    "part=GROUP_ITEMS",
    "rangeStart=2026-11-01",
  ])("rejects invalid input %s", async (query) => {
    await request(app.getHttpServer())
      .get(path + "?" + query)
      .set("Authorization", "Bearer test")
      .expect(400);
  });
  it("rejects a GET body and exposes no write endpoint", async () => {
    await request(app.getHttpServer())
      .get(path)
      .send({ filters: [] })
      .set("Authorization", "Bearer test")
      .expect(400);
    await request(app.getHttpServer())
      .patch(path)
      .send({ filters: [] })
      .set("Authorization", "Bearer test")
      .expect(404);
  });
  it("does not expose foreign configuration rows or sensitive search text in logs", async () => {
    snapshot.configuration.viewAttributeSettingDefinitions[0] = {
      ...snapshot.configuration.viewAttributeSettingDefinitions[0]!,
      workspaceId: fixtureId(999),
    };
    const result = await request(app.getHttpServer())
      .get(path + "?q=private-search")
      .set("Authorization", "Bearer test")
      .expect(500);
    expect(result.body.error).toBe("ViewDataConfigurationInvalid");
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(
      "private-search",
    );
  });
});
