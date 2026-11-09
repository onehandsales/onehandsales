import { IsIn, IsString, IsUUID } from "class-validator";
import { ATTRIBUTE_DEFINITION_TYPES } from "@/modules/attribute-definition/application/attribute-definition-type";

// 역할 : 인라인 속성 생성에 필요한 세 필드만 외부에서 받습니다.
export class CreateWorkspaceTableColumnDto {
  @IsUUID("4")
  creationId!: string;

  @IsString()
  attributeDefinitionName!: string;

  @IsIn(ATTRIBUTE_DEFINITION_TYPES)
  attributeType!: string;
}
