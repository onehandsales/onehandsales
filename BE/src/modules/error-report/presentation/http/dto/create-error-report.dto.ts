import { IsOptional, IsString } from "class-validator";

// 역할 : CreateErrorReportDto 에러 신고 생성 HTTP body 구조를 정의합니다.
export class CreateErrorReportDto {
  // 기능 : 사용자가 작성한 에러 설명을 전달합니다.
  @IsOptional()
  @IsString()
  readonly description?: string;

  // 기능 : 에러가 발생한 User Web 현재 주소를 전달합니다.
  @IsOptional()
  @IsString()
  readonly pageUrl?: string;
}
