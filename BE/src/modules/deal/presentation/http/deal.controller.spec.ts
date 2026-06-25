import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { DealListSort } from "@/modules/deal/application/ports/deal.repository";
import { DealApplicationService } from "@/modules/deal/application/services/deal-application.service";
import { DealStatusCode } from "@/modules/deal/domain/deal-status";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { DealController } from "./deal.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const DEAL_ID = "00000000-0000-4000-8000-000000000001";
const COMPANY_ID = "00000000-0000-4000-8000-000000000002";
const CONTACT_ID = "00000000-0000-4000-8000-000000000003";
const PRODUCT_ID = "00000000-0000-4000-8000-000000000004";
const FOLLOWING_ACTION_LOG_ID = "00000000-0000-4000-8000-000000000005";
const MEMO_LOG_ID = "00000000-0000-4000-8000-000000000006";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

type DealServiceFake = Pick<
  DealApplicationService,
  | "countDealsByStatus"
  | "listDeals"
  | "exportDealsXlsx"
  | "listCompanyOptions"
  | "listContactOptions"
  | "listProductOptions"
  | "getDeal"
  | "createDeal"
  | "updateDeal"
  | "deleteDeal"
  | "listFollowingActionLogs"
  | "createFollowingActionLog"
  | "updateFollowingActionLog"
  | "deleteFollowingActionLog"
  | "listMemoLogs"
  | "createMemoLog"
  | "updateMemoLog"
  | "deleteMemoLog"
>;

// 역할 : FakeAuthGuard 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
class FakeAuthGuard implements CanActivate {
  // 기능 : 테스트 요청을 인증된 요청으로 처리합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

// 기능 : Deal controller 테스트용 service fake를 생성합니다.
function createDealServiceFake(): jest.Mocked<DealServiceFake> {
  return {
    countDealsByStatus: jest.fn().mockResolvedValue({ items: [] }),
    listDeals: jest.fn().mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    }),
    exportDealsXlsx: jest.fn().mockResolvedValue({
      fileName: "deals_20260612_120000.xlsx",
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      content: Buffer.from("xlsx"),
    }),
    listCompanyOptions: jest.fn().mockResolvedValue({ items: [] }),
    listContactOptions: jest.fn().mockResolvedValue({ items: [] }),
    listProductOptions: jest.fn().mockResolvedValue({ items: [] }),
    getDeal: jest.fn().mockResolvedValue({ id: DEAL_ID }),
    createDeal: jest.fn().mockResolvedValue({ id: DEAL_ID }),
    updateDeal: jest.fn().mockResolvedValue({ id: DEAL_ID }),
    deleteDeal: jest.fn().mockResolvedValue(undefined),
    listFollowingActionLogs: jest.fn().mockResolvedValue({
      items: [],
      nextCursor: null,
      hasNext: false,
    }),
    createFollowingActionLog: jest.fn().mockResolvedValue({
      id: FOLLOWING_ACTION_LOG_ID,
    }),
    updateFollowingActionLog: jest.fn().mockResolvedValue({
      id: FOLLOWING_ACTION_LOG_ID,
    }),
    deleteFollowingActionLog: jest.fn().mockResolvedValue(undefined),
    listMemoLogs: jest.fn().mockResolvedValue({
      items: [],
      nextCursor: null,
      hasNext: false,
    }),
    createMemoLog: jest.fn().mockResolvedValue({ id: MEMO_LOG_ID }),
    updateMemoLog: jest.fn().mockResolvedValue({ id: MEMO_LOG_ID }),
    deleteMemoLog: jest.fn().mockResolvedValue(undefined),
  };
}

// 기능 : DealController의 HTTP route와 DTO 연결을 검증합니다.
describe("DealController", () => {
  let app: INestApplication;
  let service: jest.Mocked<DealServiceFake>;

  beforeEach(async () => {
    service = createDealServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [DealController],
      providers: [{ provide: DealApplicationService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

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

  afterEach(async () => {
    await app.close();
  });

  // 기능 : 딜 목록과 정적 옵션/export route가 param route보다 먼저 처리되는지 검증합니다.
  it("routes deal list, counts, options, and export requests", async () => {
    await request(app.getHttpServer()).get("/api/deals/stage-counts").expect(200);
    await request(app.getHttpServer())
      .get(
        `/api/deals?page=2&search=A&companyIds=${COMPANY_ID}&contactIds=${CONTACT_ID}&dealStatus=INITIAL_CONTACT&sort=dealCostDesc`
      )
      .expect(200);
    await request(app.getHttpServer()).get("/api/deals/company-options").expect(200);
    await request(app.getHttpServer()).get("/api/deals/contact-options").expect(200);
    await request(app.getHttpServer()).get("/api/deals/product-options").expect(200);
    await request(app.getHttpServer()).get("/api/deals/export/xlsx").expect(200);

    expect(service.countDealsByStatus).toHaveBeenCalledWith(CURRENT_USER, {});
    expect(service.listDeals).toHaveBeenCalledWith(
      CURRENT_USER,
      expect.objectContaining({
        page: 2,
        search: "A",
        companyIds: [COMPANY_ID],
        contactIds: [CONTACT_ID],
        dealStatus: DealStatusCode.INITIAL_CONTACT,
        sort: DealListSort.DEAL_COST_DESC,
      })
    );
    expect(service.listCompanyOptions).toHaveBeenCalledWith(CURRENT_USER);
    expect(service.listContactOptions).toHaveBeenCalledWith(CURRENT_USER);
    expect(service.listProductOptions).toHaveBeenCalledWith(CURRENT_USER);
    expect(service.exportDealsXlsx).toHaveBeenCalledWith(CURRENT_USER, {});
  });

  // 기능 : 딜 상세, 생성, 수정 route가 계약 body를 application 계층으로 전달하는지 검증합니다.
  it("routes deal detail, create, and update requests", async () => {
    const createBody = {
      dealName: "A회사 신규 도입",
      dealCost: 3000000,
      companyIds: [COMPANY_ID],
      contactIds: [CONTACT_ID],
      productIds: [PRODUCT_ID],
      dealStatus: DealStatusCode.INITIAL_CONTACT,
      followingAction: "제안서 발송",
      expectedEndDate: "2026-01-05",
    };
    const updateBody = {
      dealName: "A회사 재협상",
      dealCost: 5000000,
      companyIds: [COMPANY_ID],
      contactIds: [CONTACT_ID],
      productIds: [PRODUCT_ID],
      dealStatus: DealStatusCode.NEGOTIATION,
      expectedEndDate: "2026-02-01",
    };

    await request(app.getHttpServer()).get(`/api/deals/${DEAL_ID}`).expect(200);
    await request(app.getHttpServer())
      .post("/api/deals")
      .send(createBody)
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/api/deals/${DEAL_ID}`)
      .send(updateBody)
      .expect(200);
    await request(app.getHttpServer()).delete(`/api/deals/${DEAL_ID}`).expect(204);

    expect(service.getDeal).toHaveBeenCalledWith(CURRENT_USER, DEAL_ID);
    expect(service.createDeal).toHaveBeenCalledWith(CURRENT_USER, createBody);
    expect(service.updateDeal).toHaveBeenCalledWith(
      CURRENT_USER,
      DEAL_ID,
      updateBody
    );
    expect(service.deleteDeal).toHaveBeenCalledWith(CURRENT_USER, DEAL_ID);
  });

  // 기능 : 다음 행동 로그와 메모 로그 route가 계약 body를 application 계층으로 전달하는지 검증합니다.
  it("routes following action and memo log requests", async () => {
    await request(app.getHttpServer())
      .get(`/api/deals/${DEAL_ID}/following-action-logs?cursor=next-following`)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/deals/${DEAL_ID}/following-action-logs`)
      .send({ followingAction: "전화 follow-up" })
      .expect(201);
    await request(app.getHttpServer())
      .patch(
        `/api/deals/${DEAL_ID}/following-action-logs/${FOLLOWING_ACTION_LOG_ID}`
      )
      .send({ followingAction: "제안서 재발송", checkComplete: true })
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/deals/${DEAL_ID}/memo-logs?cursor=next-memo`)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/deals/${DEAL_ID}/memo-logs`)
      .send({ memoType: "일반", memo: "예산 확인 필요" })
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/api/deals/${DEAL_ID}/memo-logs/${MEMO_LOG_ID}`)
      .send({ memoType: "중요", memo: "최종 견적 전달" })
      .expect(200);

    expect(service.listFollowingActionLogs).toHaveBeenCalledWith(
      CURRENT_USER,
      DEAL_ID,
      { cursor: "next-following" }
    );
    expect(service.createFollowingActionLog).toHaveBeenCalledWith(
      CURRENT_USER,
      DEAL_ID,
      { followingAction: "전화 follow-up" }
    );
    expect(service.updateFollowingActionLog).toHaveBeenCalledWith(
      CURRENT_USER,
      DEAL_ID,
      FOLLOWING_ACTION_LOG_ID,
      { followingAction: "제안서 재발송", checkComplete: true }
    );
    expect(service.listMemoLogs).toHaveBeenCalledWith(CURRENT_USER, DEAL_ID, {
      cursor: "next-memo",
    });
    expect(service.createMemoLog).toHaveBeenCalledWith(CURRENT_USER, DEAL_ID, {
      memoType: "일반",
      memo: "예산 확인 필요",
    });
    expect(service.updateMemoLog).toHaveBeenCalledWith(
      CURRENT_USER,
      DEAL_ID,
      MEMO_LOG_ID,
      { memoType: "중요", memo: "최종 견적 전달" }
    );
  });

  // 기능 : DealStatus enum과 date-only validation이 HTTP boundary에서 동작하는지 검증합니다.
  it("rejects invalid enum and date request bodies", async () => {
    await request(app.getHttpServer())
      .post("/api/deals")
      .send({
        dealName: "A회사 신규 도입",
        dealCost: 3000000,
        companyIds: [COMPANY_ID],
        contactIds: [CONTACT_ID],
        productIds: [PRODUCT_ID],
        dealStatus: "초기 접촉",
        followingAction: "제안서 발송",
        expectedEndDate: "2026-01-05",
      })
      .expect(400);

    await request(app.getHttpServer())
      .post("/api/deals")
      .send({
        dealName: "A회사 신규 도입",
        dealCost: 3000000,
        companyIds: [COMPANY_ID],
        contactIds: [CONTACT_ID],
        productIds: [PRODUCT_ID],
        dealStatus: DealStatusCode.INITIAL_CONTACT,
        followingAction: "제안서 발송",
        expectedEndDate: "2026-01-05T00:00:00.000Z",
      })
      .expect(400);
  });
});
