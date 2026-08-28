import { IsDefined, IsOptional, IsString } from "class-validator";

// 역할 : 이메일 provider 연결 시작 요청 본문을 검증합니다.
export class StartEmailConnectionDto {
  @IsDefined()
  @IsString()
  redirectUri!: string;
}

// 역할 : 이메일 provider OAuth callback query 값을 검증합니다.
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

// 역할 : SMS 발신번호 인증 요청 본문을 검증합니다.
export class RequestSmsSenderNumberVerificationDto {
  @IsDefined()
  @IsString()
  phoneE164!: string;
}

// 역할 : SMS 발신번호 인증 코드 확인 요청 본문을 검증합니다.
export class VerifySmsSenderNumberDto {
  @IsDefined()
  @IsString()
  code!: string;
}
