import { IsIn, IsISO8601, IsOptional, IsString, MaxLength } from "class-validator";

const nextActionStatuses = ["NONE", "SCHEDULED", "DUE_SOON", "OVERDUE", "DONE"];

export class UpdateDealNextActionDto {
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
}

export class CompleteDealNextActionDto {
  @IsOptional()
  @IsISO8601()
  completedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  activityContent?: string;
}

export class SnoozeDealNextActionDto {
  @IsISO8601()
  nextActionDueAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  reason?: string;
}
