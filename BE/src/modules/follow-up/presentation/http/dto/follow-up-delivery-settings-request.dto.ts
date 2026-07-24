import { IsDefined, IsOptional, IsString } from "class-validator";

export class StartEmailConnectionDto {
  @IsDefined()
  @IsString()
  redirectUri!: string;
}

export class EmailConnectionCallbackQueryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  error?: string;
}

export class RequestSmsSenderNumberVerificationDto {
  @IsDefined()
  @IsString()
  phoneE164!: string;
}

export class VerifySmsSenderNumberDto {
  @IsDefined()
  @IsString()
  code!: string;
}
