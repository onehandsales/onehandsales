import { Transform, Type, type TransformFnParams } from "class-transformer";
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  Max,
  Min,
} from "class-validator";

export enum NotificationReadFilterDto {
  ALL = "ALL",
  READ = "READ",
  UNREAD = "UNREAD",
}

function toOptionalBoolean({ value }: TransformFnParams): boolean | unknown {
  if (value === undefined) {
    return undefined;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return value;
}

// Role: validate notification list query parameters.
export class ListNotificationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;

  @IsOptional()
  @IsEnum(NotificationReadFilterDto)
  read?: NotificationReadFilterDto;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  includeUpcoming?: boolean;
}

// Role: validate notification settings updates.
export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  scheduleReminderEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  dealDueReminderEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotificationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  browserPushEnabled?: boolean;
}

// Role: validate browser PushSubscription keys.
export class BrowserPushSubscriptionKeysDto {
  @IsDefined()
  @IsString()
  p256dh!: string;

  @IsDefined()
  @IsString()
  auth!: string;
}

// Role: validate browser push subscription registration request body.
export class CreateBrowserPushSubscriptionDto {
  @IsDefined()
  @IsString()
  endpoint!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => BrowserPushSubscriptionKeysDto)
  keys!: BrowserPushSubscriptionKeysDto;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  deviceLabel?: string;
}
