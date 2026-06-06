import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

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
}

