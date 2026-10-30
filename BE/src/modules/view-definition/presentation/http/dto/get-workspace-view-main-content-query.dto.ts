import { Transform } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import type {
  ViewDataPart,
  ViewDataRequest,
} from "../../../application/view-data/view-data.types";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

// 역할 : 주 화면 조회의 scalar 입력만 HTTP 경계에서 허용합니다.
export class GetWorkspaceViewMainContentQueryDto {
  @IsOptional() @IsIn(["OBJECT", "LIST"]) sourceType?: "OBJECT" | "LIST";
  @IsOptional()
  @IsIn([
    "MAIN",
    "GROUP_ITEMS",
    "UNSCHEDULED_ITEMS",
    "INVALID_DATE_ITEMS",
    "MAP_ITEMS",
    "MAP_MARKERS",
    "UNLOCATED_ITEMS",
  ])
  part?: ViewDataPart;
  @IsOptional() @IsString() @MaxLength(200) q?: string;
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(2048) cursor?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(2048) groupToken?: string;
  @IsOptional() @IsString() @MaxLength(10) rangeStart?: string;
  @IsOptional() @IsString() @MaxLength(10) rangeEnd?: string;
  @IsOptional() @IsString() @MaxLength(100) timeZone?: string;
  @IsOptional() @IsString() @MaxLength(160) bounds?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(60) focusItemKey?: string;
}

// 기능 : 지도 bounds JSON을 검증하여 HTTP 문자열을 application 입력으로 변환합니다.
export function toViewDataRequest(
  dto: GetWorkspaceViewMainContentQueryDto,
): ViewDataRequest {
  const { bounds, ...rest } = dto;
  if (bounds === undefined) return rest;
  try {
    const value: unknown = JSON.parse(bounds);
    if (
      !Array.isArray(value) ||
      value.length !== 4 ||
      value.some((x) => typeof x !== "number" || !Number.isFinite(x))
    )
      throw new Error("bounds");
    return { ...rest, bounds: value as [number, number, number, number] };
  } catch {
    throw new ValidationDomainError("Invalid map bounds");
  }
}
