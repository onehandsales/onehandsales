import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const dealStages = ["INITIAL_CONTACT", "IN_DISCUSSION", "WON", "LOST"];
const likelihoodStatuses = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
const nextActionStatuses = ["NONE", "SCHEDULED", "DUE_SOON", "OVERDUE", "DONE"];

export class CreateDealDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsInt()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsIn(dealStages)
  stage?: string;

  @IsOptional()
  @IsIn(likelihoodStatuses)
  likelihoodStatus?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  likelihoodPercent?: number;

  @IsOptional()
  @IsISO8601()
  expectedCloseDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  nextActionText?: string;

  @IsOptional()
  @IsISO8601()
  nextActionDueAt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  productIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  initialMemo?: string;
}

export class UpdateDealDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  companyId?: string | null;

  @IsOptional()
  @IsString()
  contactId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsIn(dealStages)
  stage?: string;

  @IsOptional()
  @IsIn(likelihoodStatuses)
  likelihoodStatus?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  likelihoodPercent?: number | null;

  @IsOptional()
  @IsISO8601()
  expectedCloseDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  nextActionText?: string | null;

  @IsOptional()
  @IsISO8601()
  nextActionDueAt?: string | null;

  @IsOptional()
  @IsIn(nextActionStatuses)
  nextActionStatus?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  productIds?: string[];
}

export class ChangeDealStageDto {
  @IsIn(dealStages)
  stage!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  activityTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  activityContent?: string;
}
