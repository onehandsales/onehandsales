import { IsBoolean, IsInt, IsOptional, Max, Min } from "class-validator";

export class UpdateMySettingsDto {
  @IsOptional()
  @IsBoolean()
  sensitiveWarningEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10080)
  defaultReminderMinutes?: number;

  @IsOptional()
  @IsBoolean()
  emailNotificationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  browserPushEnabled?: boolean;
}

