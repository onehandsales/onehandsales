import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

// 역할 : ListAdminAccountDeletionRequestsQueryDto Admin 계정 삭제 요청 queue query를 검증합니다.
export class ListAdminAccountDeletionRequestsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(24)
  status?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// 역할 : ListAdminDataExportRequestsQueryDto Admin 데이터 export 요청 queue query를 검증합니다.
export class ListAdminDataExportRequestsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(24)
  status?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
