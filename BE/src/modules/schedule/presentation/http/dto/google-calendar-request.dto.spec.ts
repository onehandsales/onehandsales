import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { HandleGoogleCalendarCallbackQueryDto } from "./google-calendar-request.dto";

const VALIDATION_OPTIONS = {
  whitelist: true,
  forbidNonWhitelisted: true,
};

describe("Google Calendar request DTOs", () => {
  it("accepts Google OAuth callback metadata query parameters", async () => {
    const dto = plainToInstance(HandleGoogleCalendarCallbackQueryDto, {
      state: "state",
      code: "code",
      iss: "https://accounts.google.com",
      scope:
        "email profile https://www.googleapis.com/auth/calendar.readonly openid",
      authuser: "1",
      prompt: "consent",
    });

    await expect(validate(dto, VALIDATION_OPTIONS)).resolves.toHaveLength(0);
  });

  it("accepts Google OAuth denial metadata query parameters", async () => {
    const dto = plainToInstance(HandleGoogleCalendarCallbackQueryDto, {
      state: "state",
      error: "access_denied",
      error_description: "User denied access",
      error_uri: "https://developers.google.com/identity/protocols/oauth2",
    });

    await expect(validate(dto, VALIDATION_OPTIONS)).resolves.toHaveLength(0);
  });
});
