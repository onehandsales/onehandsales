import { IsISO8601, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCompanyLogDto {
  @IsISO8601()
  loggedAt!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;
}

export class UpdateCompanyLogDto {
  @IsOptional()
  @IsISO8601()
  loggedAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;
}

