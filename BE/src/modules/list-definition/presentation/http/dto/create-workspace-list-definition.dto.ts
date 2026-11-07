import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsObject, IsOptional, IsString, IsUUID, MaxLength, ValidateIf, ValidateNested } from "class-validator";
import type { ListInitialViewType } from "@/modules/view-definition/application/ports/list-initial-view-creator.port";

// 역할 : 목록에 새로 만들 상태 속성과 단계 입력의 HTTP 형식을 검증합니다.
export class CreateListStatusDto {
  @IsString()
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  options!: string[];
}

// 역할 : 보드의 기존 상태 참조 또는 새 상태 입력의 HTTP 형식을 검증합니다.
export class CreateListKanbanDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsUUID()
  attributeDefinitionId?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsObject()
  @ValidateNested()
  @Type(() => CreateListStatusDto)
  newStatus?: CreateListStatusDto;
}

// 역할 : 업무 목록과 첫 보기 생성 요청의 외부 입력을 검증합니다.
export class CreateWorkspaceListDefinitionDto {
  @IsString()
  listDefinitionName!: string;

  @IsUUID()
  objectDefinitionId!: string;

  @IsUUID()
  titleAttributeDefinitionId!: string;

  @IsIn(["TABLE", "LIST", "KANBAN"])
  viewType!: ListInitialViewType;

  @IsOptional()
  @IsString()
  icon?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsObject()
  @ValidateNested()
  @Type(() => CreateListKanbanDto)
  kanban?: CreateListKanbanDto;
}
