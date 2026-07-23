import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  GetWeeklyScheduleReportQueryDto,
  ListSchedulesQueryDto,
} from "./schedule-request.dto";

const VALIDATION_OPTIONS = {
  whitelist: true,
  forbidNonWhitelisted: true,
};

describe("schedule request DTOs", () => {
  it("accepts Google visibility and source filters on schedule list query", async () => {
    const dto = plainToInstance(ListSchedulesQueryDto, {
      view: "month",
      baseDate: "2026-07-23",
      timeZone: "Asia/Seoul",
      visibility: "HIDDEN_GOOGLE",
      sourceType: "GOOGLE",
    });

    await expect(validate(dto, VALIDATION_OPTIONS)).resolves.toHaveLength(0);
  });

  it("keeps weekly report query scoped to weekly report parameters", async () => {
    const dto = plainToInstance(GetWeeklyScheduleReportQueryDto, {
      weekStart: "2026-07-20",
      timeZone: "Asia/Seoul",
      visibility: "HIDDEN_GOOGLE",
      sourceType: "GOOGLE",
    });
    const errors = await validate(dto, VALIDATION_OPTIONS);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(["visibility", "sourceType"])
    );
  });
});
