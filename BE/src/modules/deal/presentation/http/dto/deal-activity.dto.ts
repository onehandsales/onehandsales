import { IsISO8601, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateDealActivityDto {
  @IsString()
  typeId!: string;

  @IsISO8601()
  occurredAt!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;
}

export class UpdateDealActivityDto {
  @IsOptional()
  @IsString()
  typeId?: string;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string | null;
}
