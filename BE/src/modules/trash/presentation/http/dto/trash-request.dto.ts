import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import type {
  TrashDomainFilter,
  TrashItemKindFilter,
  TrashLogTypeFilter,
  TrashSort,
  TrashTargetType,
} from "@/modules/trash/application/ports/trash.repository";

export const TRASH_TARGET_TYPES = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "MEETING_NOTE",
  "COMPANY_MEMO_LOG",
  "COMPANY_PRIVATE_MEMO_LOG",
  "CONTACT_MEMO_LOG",
  "CONTACT_PRIVATE_MEMO_LOG",
  "PRODUCT_MEMO_LOG",
  "PRODUCT_PRIVATE_MEMO_LOG",
  "DEAL_MEMO_LOG",
  "DEAL_FOLLOWING_ACTION_LOG",
] as const satisfies readonly TrashTargetType[];

const TRASH_TARGET_FILTERS = [
  "ALL",
  ...TRASH_TARGET_TYPES,
] as const satisfies readonly (TrashTargetType | "ALL")[];

const TRASH_ITEM_KIND_FILTERS = [
  "ALL",
  "ENTITY",
  "LOG",
] as const satisfies readonly TrashItemKindFilter[];

const TRASH_DOMAIN_FILTERS = [
  "ALL",
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "MEETING_NOTE",
] as const satisfies readonly TrashDomainFilter[];

const TRASH_LOG_TYPE_FILTERS = [
  "ALL",
  "MEMO",
  "PRIVATE_MEMO",
  "FOLLOWING_ACTION",
] as const satisfies readonly TrashLogTypeFilter[];

const TRASH_SORTS = [
  "RECENT",
  "EXPIRES_SOON",
] as const satisfies readonly TrashSort[];

// 기능 : 문자열 path param이 휴지통 대상 유형인지 검증합니다.
export function isTrashTargetType(value: string): value is TrashTargetType {
  return (TRASH_TARGET_TYPES as readonly string[]).includes(value);
}

// 역할 : ListTrashQueryDto 휴지통 목록 query 값을 검증하기 위한 DTO입니다.
export class ListTrashQueryDto {
  @IsOptional()
  @IsIn(TRASH_TARGET_FILTERS)
  targetType?: TrashTargetType | "ALL";

  @IsOptional()
  @IsIn(TRASH_ITEM_KIND_FILTERS)
  itemKind?: TrashItemKindFilter;

  @IsOptional()
  @IsIn(TRASH_DOMAIN_FILTERS)
  domain?: TrashDomainFilter;

  @IsOptional()
  @IsIn(TRASH_LOG_TYPE_FILTERS)
  logType?: TrashLogTypeFilter;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsIn(TRASH_SORTS)
  sort?: TrashSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
