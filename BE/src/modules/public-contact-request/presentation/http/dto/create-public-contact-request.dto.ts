import { Allow, IsOptional, IsString } from "class-validator";

// 역할 : CreatePublicContactRequestDto 공개 문의 생성 HTTP body 구조를 정의합니다.
export class CreatePublicContactRequestDto {
  // 기능 : 사용자가 입력한 업무 이메일을 전달합니다.
  @IsOptional()
  @IsString()
  readonly email?: string;

  // 기능 : 사용자가 선택한 사용 인원 규모를 전달합니다.
  @IsOptional()
  @IsString()
  readonly companySize?: string;

  // 기능 : 사용자가 입력한 이름을 전달합니다.
  @IsOptional()
  @IsString()
  readonly firstName?: string;

  // 기능 : 사용자가 입력한 성을 전달합니다.
  @IsOptional()
  @IsString()
  readonly lastName?: string;

  // 기능 : 사용자가 입력한 회사명을 전달합니다.
  @IsOptional()
  @IsString()
  readonly company?: string;

  // 기능 : 사용자가 입력한 직함을 전달합니다.
  @IsOptional()
  @IsString()
  readonly title?: string;

  // 기능 : 사용자가 선택한 국가 또는 지역 코드를 전달합니다.
  @IsOptional()
  @IsString()
  readonly region?: string;

  // 기능 : 사용자가 입력한 연락처 전화번호를 전달합니다.
  @IsOptional()
  @IsString()
  readonly phone?: string;

  // 기능 : 사용자가 입력한 OneHand 사용 계획을 전달합니다.
  @IsOptional()
  @IsString()
  readonly plan?: string;

  // 기능 : 사용자가 선택한 OneHand 인지 경로를 전달합니다.
  @IsOptional()
  @IsString()
  readonly source?: string;

  // 기능 : 제품 소식과 온보딩 안내 수신 동의 여부를 전달합니다.
  @Allow()
  readonly marketingAgreement?: unknown;

  // 기능 : 문의가 제출된 공개 페이지 URL을 전달합니다.
  @IsOptional()
  @IsString()
  readonly pageUrl?: string;

  // 기능 : 문의가 제출된 공개 사이트 언어를 전달합니다.
  @IsOptional()
  @IsString()
  readonly locale?: string;
}
