import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { DataImportApplicationService } from "@/modules/data-import/application/services/data-import-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { ImportJobController } from "./import-job.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const IMPORT_JOB_ID = "00000000-0000-4000-8000-000000000301";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

type DataImportServiceFake = Pick<
  DataImportApplicationService,
  | "cancelImportJob"
  | "confirmImportJob"
  | "createImportJob"
  | "generateImportMapping"
  | "getImportJob"
  | "listActiveImportJobs"
  | "listImportJobErrors"
  | "updateImportJobRows"
  | "updateImportMapping"
  | "validateImportJob"
>;

const IMPORT_JOB_DETAIL_RESPONSE = {
  job: {
    id: IMPORT_JOB_ID,
    targetType: "DEAL",
    status: "READY_TO_CONFIRM",
    mappingSource: "USER",
    originalFileName: "source.xlsx",
    totalRowCount: 1,
    validRowCount: 1,
    invalidRowCount: 0,
    importedRowCount: 0,
    failedRowCount: 0,
    importUserLogId: null,
    expiresAt: "2026-07-16T00:00:00.000Z",
    createdAt: "2026-07-09T00:00:00.000Z",
    updatedAt: "2026-07-09T00:00:00.000Z",
  },
  templateColumns: [],
  sourceColumns: [],
  mapping: {},
  rows: [],
  errors: [],
} as const;

class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

function createDataImportServiceFake(): jest.Mocked<DataImportServiceFake> {
  return {
    cancelImportJob: jest.fn().mockResolvedValue(undefined),
    confirmImportJob: jest.fn().mockResolvedValue({
      importJobId: IMPORT_JOB_ID,
      importUserLogId: "00000000-0000-4000-8000-000000000401",
      status: "CONFIRMED",
      importedRowCount: 1,
    }),
    createImportJob: jest.fn().mockResolvedValue(IMPORT_JOB_DETAIL_RESPONSE),
    generateImportMapping: jest.fn().mockResolvedValue(IMPORT_JOB_DETAIL_RESPONSE),
    getImportJob: jest.fn().mockResolvedValue(IMPORT_JOB_DETAIL_RESPONSE),
    listActiveImportJobs: jest.fn().mockResolvedValue({
      items: [],
    }),
    listImportJobErrors: jest.fn().mockResolvedValue({
      items: [],
    }),
    updateImportJobRows: jest.fn().mockResolvedValue(IMPORT_JOB_DETAIL_RESPONSE),
    validateImportJob: jest.fn().mockResolvedValue(IMPORT_JOB_DETAIL_RESPONSE),
    updateImportMapping: jest.fn().mockResolvedValue(IMPORT_JOB_DETAIL_RESPONSE),
  };
}

describe("ImportJobController", () => {
  let app: INestApplication;
  let service: jest.Mocked<DataImportServiceFake>;

  beforeEach(async () => {
    service = createDataImportServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [ImportJobController],
      providers: [{ provide: DataImportApplicationService, useValue: service }],
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

  it("routes import file uploads to the application service", async () => {
    await request(app.getHttpServer())
      .post("/api/imports")
      .field("targetType", "COMPANY")
      .attach("file", Buffer.from("companyName\nAcme"), "source.csv")
      .expect(201);

    expect(service.createImportJob).toHaveBeenCalledWith(CURRENT_USER, {
      targetType: "COMPANY",
      file: expect.objectContaining({
        originalname: "source.csv",
        buffer: expect.any(Buffer),
      }),
    });
  });

  it("routes mapping updates to the application service", async () => {
    await request(app.getHttpServer())
      .patch(`/api/imports/${IMPORT_JOB_ID}/mapping`)
      .send({
        mapping: {
          dealName: "Deal name",
          dealCost: "Amount",
          productName: null,
        },
      })
      .expect(200);

    expect(service.updateImportMapping).toHaveBeenCalledWith(
      CURRENT_USER,
      IMPORT_JOB_ID,
      {
        mapping: {
          dealName: "Deal name",
          dealCost: "Amount",
          productName: null,
        },
      }
    );
  });

  it("routes active job listing before the importJobId route", async () => {
    await request(app.getHttpServer())
      .get("/api/imports/active")
      .query({ targetType: "DEAL", limit: 3 })
      .expect(200);

    expect(service.listActiveImportJobs).toHaveBeenCalledWith(CURRENT_USER, {
      targetType: "DEAL",
      limit: 3,
    });
  });

  it("routes detail resume requests with boolean query parsing", async () => {
    await request(app.getHttpServer())
      .get(`/api/imports/${IMPORT_JOB_ID}`)
      .query({ includeErrors: "false" })
      .expect(200);

    expect(service.getImportJob).toHaveBeenCalledWith(CURRENT_USER, IMPORT_JOB_ID, {
      includeErrors: false,
    });
  });

  it("routes mapping generation to the application service", async () => {
    await request(app.getHttpServer())
      .post(`/api/imports/${IMPORT_JOB_ID}/map`)
      .send({ preferredSource: "RULE_BASED" })
      .expect(200);

    expect(service.generateImportMapping).toHaveBeenCalledWith(
      CURRENT_USER,
      IMPORT_JOB_ID,
      { preferredSource: "RULE_BASED" }
    );
  });

  it("routes row updates to the application service", async () => {
    const body = {
      rows: [
        {
          rowId: "00000000-0000-4000-8000-000000000501",
          data: { dealName: "Enterprise renewal" },
          excluded: false,
        },
      ],
    };

    await request(app.getHttpServer())
      .patch(`/api/imports/${IMPORT_JOB_ID}/rows`)
      .send(body)
      .expect(200);

    expect(service.updateImportJobRows).toHaveBeenCalledWith(
      CURRENT_USER,
      IMPORT_JOB_ID,
      body
    );
  });

  it("returns 204 when canceling an import job", async () => {
    await request(app.getHttpServer())
      .post(`/api/imports/${IMPORT_JOB_ID}/cancel`)
      .send({})
      .expect(204);

    expect(service.cancelImportJob).toHaveBeenCalledWith(
      CURRENT_USER,
      IMPORT_JOB_ID,
      {}
    );
  });

  it("routes validation requests to the application service", async () => {
    await request(app.getHttpServer())
      .post(`/api/imports/${IMPORT_JOB_ID}/validate`)
      .send({})
      .expect(200);

    expect(service.validateImportJob).toHaveBeenCalledWith(
      CURRENT_USER,
      IMPORT_JOB_ID,
      {}
    );
  });

  it("routes error history requests with a capped limit query", async () => {
    await request(app.getHttpServer())
      .get(`/api/imports/${IMPORT_JOB_ID}/errors`)
      .query({ limit: 100 })
      .expect(200);

    expect(service.listImportJobErrors).toHaveBeenCalledWith(
      CURRENT_USER,
      IMPORT_JOB_ID,
      { limit: 100 }
    );
  });

  it("routes confirm with the idempotency key request contract", async () => {
    const body = {
      idempotencyKey: "confirm-1",
    };

    await request(app.getHttpServer())
      .post(`/api/imports/${IMPORT_JOB_ID}/confirm`)
      .send(body)
      .expect(200);

    expect(service.confirmImportJob).toHaveBeenCalledWith(
      CURRENT_USER,
      IMPORT_JOB_ID,
      body
    );
  });
});
