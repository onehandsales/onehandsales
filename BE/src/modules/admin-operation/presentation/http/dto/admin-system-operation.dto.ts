import { Type } from "class-transformer";
import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";

// 역할 : AdminOperationCheckItemsDto 운영 gate 점검 항목별 상태 body를 검증합니다.
export class AdminOperationCheckItemsDto {
  @IsString()
  @MaxLength(8)
  prismaValidate?: string;

  @IsString()
  @MaxLength(8)
  prismaGenerate?: string;

  @IsString()
  @MaxLength(8)
  migrationStatus?: string;

  @IsString()
  @MaxLength(8)
  seedNotRunOnSharedDb?: string;

  @IsString()
  @MaxLength(8)
  backupVerified?: string;

  @IsString()
  @MaxLength(8)
  restoreDryRun?: string;

  @IsString()
  @MaxLength(8)
  providerSmoke?: string;
}

// 역할 : CreateAdminOperationCheckRunDto 운영 gate 점검 기록 생성 body를 검증합니다.
export class CreateAdminOperationCheckRunDto {
  @IsString()
  @MaxLength(32)
  environment?: string;

  @IsString()
  @MaxLength(8)
  status?: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => AdminOperationCheckItemsDto)
  items?: AdminOperationCheckItemsDto;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
