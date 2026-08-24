import { IsOptional, IsString } from "class-validator";

// 역할 : CreateSupportRequestDto 지원 요청 생성 HTTP body 구조를 정의합니다.
export class CreateSupportRequestDto {
  // 기능 : 사용자가 선택한 문의 유형을 전달합니다.
  @IsOptional()
  @IsString()
  readonly type?: string;

  // 기능 : 사용자가 작성한 지원 요청 내용을 전달합니다.
  @IsOptional()
  @IsString()
  readonly description?: string;

  // 기능 : 지원 요청을 남긴 User Web 현재 주소를 전달합니다.
  @IsOptional()
  @IsString()
  readonly pageUrl?: string;
}
