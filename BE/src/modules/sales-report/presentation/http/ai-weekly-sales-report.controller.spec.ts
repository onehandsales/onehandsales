import { GUARDS_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import type { AiWeeklySalesReportApplicationService } from "@/modules/sales-report/application/services/ai-weekly-sales-report-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { AiWeeklySalesReportController } from "./ai-weekly-sales-report.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "7d0b03d4-93fb-47d1-85ad-7f39c15eb4da",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

describe("AiWeeklySalesReportController", () => {
  it("uses AuthGuard for weekly sales report endpoints", () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, AiWeeklySalesReportController)
    ).toContain(AuthGuard);
  });

  it("exposes base weekly sales report route", () => {
    expect(Reflect.getMetadata(PATH_METADATA, AiWeeklySalesReportController)).toBe(
      "api/sales-reports/weekly"
    );
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        AiWeeklySalesReportController.prototype.getDetail
      )
    ).toBe(":reportId");
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        AiWeeklySalesReportController.prototype.getSnapshotSummary
      )
    ).toBe(":reportId/snapshot-summary");
  });

  it("delegates generation request with Idempotency-Key", async () => {
    const response = {
      report: { id: "report-1", status: "GENERATING" },
      job: { id: "job-1", status: "PENDING" },
    };
    const applicationService = {
      requestGeneration: jest.fn().mockResolvedValue(response),
    } as unknown as AiWeeklySalesReportApplicationService;
    const controller = new AiWeeklySalesReportController(applicationService);
    const body = {
      weekStart: "2026-07-20",
      timeZone: "Asia/Seoul",
    };

    await expect(
      controller.requestGeneration(CURRENT_USER, body, "idem-1")
    ).resolves.toBe(response);
    expect(applicationService.requestGeneration).toHaveBeenCalledWith(
      CURRENT_USER,
      body,
      "idem-1"
    );
  });

  it("delegates week, detail, and snapshot-summary queries", async () => {
    const applicationService = {
      getWeek: jest.fn().mockReturnValue({ versions: [] }),
      getDetail: jest.fn().mockReturnValue({ id: "report-1" }),
      getSnapshotSummary: jest.fn().mockReturnValue({ reportId: "report-1" }),
    } as unknown as AiWeeklySalesReportApplicationService;
    const controller = new AiWeeklySalesReportController(applicationService);
    const query = {
      weekStart: "2026-07-20",
      includeFailed: "false",
    };

    controller.getWeek(CURRENT_USER, query);
    controller.getDetail(CURRENT_USER, "report-1");
    controller.getSnapshotSummary(CURRENT_USER, "report-1");

    expect(applicationService.getWeek).toHaveBeenCalledWith(CURRENT_USER, query);
    expect(applicationService.getDetail).toHaveBeenCalledWith(
      CURRENT_USER,
      "report-1"
    );
    expect(applicationService.getSnapshotSummary).toHaveBeenCalledWith(
      CURRENT_USER,
      "report-1"
    );
  });
});
