import {
  IsBooleanString,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class RequestAiWeeklySalesReportGenerationDto {
  @IsString()
  @Matches(DATE_ONLY_PATTERN)
  weekStart!: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  @IsOptional()
  @IsString()
  locale?: string;
}

export class GetAiWeeklySalesReportWeekQueryDto {
  @IsString()
  @Matches(DATE_ONLY_PATTERN)
  weekStart!: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  @IsOptional()
  @IsBooleanString()
  includeFailed?: string;
}
