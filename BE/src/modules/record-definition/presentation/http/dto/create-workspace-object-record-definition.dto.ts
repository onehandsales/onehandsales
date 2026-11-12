import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsUUID, ValidateIf, ValidateNested } from "class-validator";
// 역할 : 속성 하나의 초기 단일/다중값을 전달합니다.
export class InitialRecordAttributeValueDto {
  @IsUUID() attributeDefinitionId!: string;
  @IsArray() @ArrayMaxSize(100) values!: unknown[];
}
// 역할 : 기존 빈 body와 초기값 포함 생성 요청을 검증합니다.
export class CreateWorkspaceObjectRecordDefinitionDto {
  @ValidateIf((_object, value: unknown) => value !== undefined) @IsUUID("4") creationId?: string;
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray() @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => InitialRecordAttributeValueDto)
  values?: InitialRecordAttributeValueDto[];
}
