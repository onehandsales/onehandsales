import { Allow } from "class-validator";

// 역할 : UpdateWorkspaceObjectRecordAttributeValueDefinitionDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateWorkspaceObjectRecordAttributeValueDefinitionDto {
  @Allow()
  value?: unknown | null;
}
