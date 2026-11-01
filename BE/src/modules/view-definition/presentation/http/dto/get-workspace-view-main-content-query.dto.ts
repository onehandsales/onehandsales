import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import type { ViewDataPart, ViewDataRequest } from "../../../application/view-data/view-data.types";

// 역할 : 세 타입의 본문 조회에 허용하는 scalar query를 검증합니다.
export class GetWorkspaceViewMainContentQueryDto {
  @IsOptional() @IsIn(["OBJECT", "LIST"]) sourceType?: "OBJECT" | "LIST";
  @IsOptional() @IsIn(["MAIN", "GROUP_ITEMS"]) part?: ViewDataPart;
  @IsOptional() @IsString() @MaxLength(200) q?: string;
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value)
  @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(2048) cursor?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(2048) groupToken?: string;
}
// 기능 : HTTP DTO의 검증된 query만 application 입력으로 전달합니다.
export function toViewDataRequest(dto: GetWorkspaceViewMainContentQueryDto): ViewDataRequest {
  return { ...dto };
}
