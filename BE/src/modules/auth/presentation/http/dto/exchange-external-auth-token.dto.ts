import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

// 역할 : ExchangeExternalAuthTokenDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class ExchangeExternalAuthTokenDto {
  @IsIn(["mobile", "personal_laptop", "work_laptop"])
  deviceSlot!: string;

  @IsString()
  @Length(8, 200)
  deviceId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  deviceLabel?: string;

  @IsOptional()
  @IsBoolean()
  replaceExistingDevice?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timeZone?: string;
}

