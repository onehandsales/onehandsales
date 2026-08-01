import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

// 역할 : CreateMyDataExportRequestDto 내 데이터 export 요청 body를 검증합니다.
export class CreateMyDataExportRequestDto {
  @IsOptional()
  @IsBoolean()
  includeSensitive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  format?: string;
}

// 역할 : CreateMyAccountDeletionRequestDto 계정 삭제 요청 body를 검증합니다.
export class CreateMyAccountDeletionRequestDto {
  @IsString()
  @MaxLength(32)
  confirmText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  reasonCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reasonMessage?: string;
}
