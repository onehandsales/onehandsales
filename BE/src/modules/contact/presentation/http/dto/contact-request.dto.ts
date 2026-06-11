import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";

// 역할 : ListContactsQueryDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class ListContactsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  contactDepartmentId?: string;

  @IsOptional()
  @IsUUID()
  contactJobGradeId?: string;
}

// 역할 : CursorQueryDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CursorQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}

// 역할 : CreateContactDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateContactDto {
  @IsString()
  username!: string;

  @IsString()
  mobile!: string;

  @IsString()
  email!: string;

  @IsUUID()
  companyId!: string;

  @IsUUID()
  contactDepartmentId!: string;

  @IsUUID()
  contactJobGradeId!: string;

  @IsOptional()
  @IsString()
  contactMemo?: string | null;
}

// 역할 : UpdateContactDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateContactDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  contactDepartmentId?: string;

  @IsOptional()
  @IsUUID()
  contactJobGradeId?: string;
}

// 역할 : CreateContactJobGradeDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateContactJobGradeDto {
  @IsString()
  jobGradeName!: string;
}

// 역할 : CreateContactDepartmentDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateContactDepartmentDto {
  @IsString()
  departmentName!: string;
}

// 역할 : CreateContactMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateContactMemoLogDto {
  @IsString()
  memoType!: string;

  @IsString()
  memo!: string;
}

// 역할 : UpdateContactMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateContactMemoLogDto {
  @IsOptional()
  @IsString()
  memoType?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

// 역할 : CreateContactPrivateMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateContactPrivateMemoLogDto {
  @IsString()
  memo!: string;
}

// 역할 : UpdateContactPrivateMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateContactPrivateMemoLogDto {
  @IsString()
  memo!: string;
}
