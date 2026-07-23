import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from "class-validator";
import { ScheduleViewMode } from "@/modules/schedule/application/ports/schedule.repository";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 역할 : ListSchedulesQueryDto HTTP 일정 목록 query 요청 값을 검증하기 위한 DTO입니다.
export class ListSchedulesQueryDto {
  @IsOptional()
  @IsEnum(ScheduleViewMode)
  view?: ScheduleViewMode;

  @IsString()
  @Matches(DATE_ONLY_PATTERN)
  baseDate!: string;

  @IsOptional()
  @IsString()
  timeZone?: string;
}

// 역할 : 주간 일정 리포트 조회 query 값을 검증하기 위한 DTO입니다.
export class GetWeeklyScheduleReportQueryDto {
  @IsString()
  @Matches(DATE_ONLY_PATTERN)
  weekStart!: string;

  @IsOptional()
  @IsString()
  timeZone?: string;
}

// 역할 : 주간 일정 리포트 xlsx export query 값을 검증하기 위한 DTO입니다.
export class ExportWeeklyScheduleReportXlsxQueryDto {
  @IsString()
  @Matches(DATE_ONLY_PATTERN)
  weekStart!: string;

  @IsOptional()
  @IsString()
  timeZone?: string;
}

// 역할 : CreateScheduleDto HTTP 일정 생성 요청 값을 검증하기 위한 DTO입니다.
export class CreateScheduleDto {
  @IsString()
  scheduleTitle!: string;

  @IsString()
  startAt!: string;

  @IsString()
  endAt!: string;

  @IsString()
  timeZone!: string;

  @IsOptional()
  @IsString()
  location?: string | null;

  @IsOptional()
  @IsString()
  meetingUrl?: string | null;

  @IsOptional()
  @IsString()
  memo?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  dealIds?: string[];
}

// 역할 : UpdateScheduleDto HTTP 일정 수정 요청 값을 검증하기 위한 DTO입니다.
export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  scheduleTitle?: string;

  @IsOptional()
  @IsString()
  startAt?: string;

  @IsOptional()
  @IsString()
  endAt?: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  @IsOptional()
  @IsString()
  location?: string | null;

  @IsOptional()
  @IsString()
  meetingUrl?: string | null;

  @IsOptional()
  @IsString()
  memo?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  dealIds?: string[];
}
