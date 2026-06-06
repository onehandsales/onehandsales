import { Transform, Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

const dealStages = ["INITIAL_CONTACT", "IN_DISCUSSION", "WON", "LOST"];
const likelihoodStatuses = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
const nextActionStatuses = ["NONE", "SCHEDULED", "DUE_SOON", "OVERDUE", "DONE"];

export class ListDealsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsIn(dealStages)
  stage?: string;

  @IsOptional()
  @IsIn(likelihoodStatuses)
  likelihood?: string;

  @IsOptional()
  @IsIn(likelihoodStatuses)
  likelihoodStatus?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(nextActionStatuses)
  nextActionStatus?: string;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  includeDeleted?: boolean;
}

export class ListDealActivitiesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
