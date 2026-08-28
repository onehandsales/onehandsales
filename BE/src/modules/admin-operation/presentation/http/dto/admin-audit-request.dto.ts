import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import {
  AdminAuditAction,
  AdminAuditResult,
  AdminSensitiveFieldSet,
  AdminTargetType,
} from "@/modules/admin-operation/application/ports/admin-operation.types";

// 역할 : ListAdminAuditLogsQueryDto Admin 감사 로그 목록 query 요청 값을 검증합니다.
export class ListAdminAuditLogsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsUUID()
  adminUserId?: string;

  @IsOptional()
  @IsUUID()
  targetUserId?: string;

  @IsOptional()
  @IsEnum(AdminAuditAction)
  action?: AdminAuditAction;

  @IsOptional()
  @IsEnum(AdminAuditResult)
  result?: AdminAuditResult;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

// 역할 : AdminSensitiveRawAccessRequestDto Admin 민감 원문 조회 body 요청 값을 검증합니다.
export class AdminSensitiveRawAccessRequestDto {
  @IsUUID()
  targetUserId!: string;

  @IsEnum(AdminTargetType)
  targetType!: AdminTargetType;

  @IsUUID()
  targetId!: string;

  @IsEnum(AdminSensitiveFieldSet)
  fieldSet!: AdminSensitiveFieldSet;

  @IsOptional()
  @IsString()
  reason?: string;
}
