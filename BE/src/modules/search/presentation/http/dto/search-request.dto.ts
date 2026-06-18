import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

// 역할 : SearchAllQueryDto HTTP 통합검색 query 요청 값을 검증하기 위한 DTO입니다.
export class SearchAllQueryDto {
  @IsString()
  q!: string;

  @IsOptional()
  @IsString()
  types?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}
