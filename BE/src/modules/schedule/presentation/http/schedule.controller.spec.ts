import { PATH_METADATA } from "@nestjs/common/constants";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { ScheduleApplicationService } from "@/modules/schedule/application/services/schedule-application.service";
import { ScheduleController } from "./schedule.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

describe("ScheduleController", () => {
  it("exposes and delegates weekly schedule report endpoint", () => {
    const query = {
      weekStart: "2026-06-15",
      timeZone: "Asia/Seoul",
    };
    const response = {
      weekStart: "2026-06-15",
      weekEnd: "2026-06-21",
      timeZone: "Asia/Seoul",
      rangeStartAt: "2026-06-14T15:00:00.000Z",
      rangeEndAt: "2026-06-21T15:00:00.000Z",
      generatedAt: "2026-06-15T00:00:00.000Z",
      summary: {
        totalScheduleCount: 0,
        totalScheduleEntryCount: 0,
        scheduledDayCount: 0,
        unlinkedScheduleCount: 0,
        scheduleDealLinkCount: 0,
        distinctLinkedDealCount: 0,
        totalDealCost: 0,
        dealStatusCounts: [],
      },
      days: [],
    };
    const scheduleApplicationService = {
      getWeeklyScheduleReport: jest.fn().mockReturnValue(response),
    } as unknown as ScheduleApplicationService;
    const controller = new ScheduleController(scheduleApplicationService);

    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ScheduleController.prototype.getWeeklyScheduleReport
      )
    ).toBe("week");
    expect(controller.getWeeklyScheduleReport(CURRENT_USER, query)).toBe(
      response
    );
    expect(
      scheduleApplicationService.getWeeklyScheduleReport
    ).toHaveBeenCalledWith(CURRENT_USER, query);
  });
});
